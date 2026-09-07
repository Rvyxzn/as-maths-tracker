/* ============================================================
   Reading a timetable off a picture

   A photo of a whiteboard, a screenshot of somebody's grid, a
   PDF that turns out to be a scan. There is no text in any of
   them, so the import used to say so and stop. This does the
   recognition instead, in the browser.

   HOW. Tesseract, fetched the first time it is needed rather
   than shipped, because it is several megabytes plus a trained
   English model and almost nobody imports a photo. That means
   OCR needs a connection the first time even though the rest of
   the app does not, and the caller is told so rather than left
   watching a spinner.

   WHAT IT IS GOOD AT. A screenshot of a digital timetable is
   nearly perfect. A straight-on photo of clean handwriting is
   usually fine. A photo at an angle, in bad light, or of joined-
   up handwriting is not, and no amount of code here changes
   that, so the import shows what was read and lets it be
   corrected before anything is saved.

   WHAT IT DOES TO THE PICTURE FIRST. Recognition is much better
   on a large, high-contrast, greyscale image than on a phone
   photo, so the image is scaled up to a working width, converted
   to grey and stretched so the darkest ink goes to black and the
   paper goes to white. That step is worth more than any option
   Tesseract takes.
   ============================================================ */

const Ocr = (function () {

  const LIB = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
  const CORE = "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1";
  const LANG = "https://tessdata.projectnaptha.com/4.0.0";

  let libReady = null;

  function available() { return typeof navigator === "undefined" || navigator.onLine !== false; }

  function ensureLib() {
    if (window.Tesseract) return Promise.resolve();
    if (libReady) return libReady;
    libReady = new Promise(function (resolve, reject) {
      const s = document.createElement("script");
      s.src = LIB;
      s.onload = function () { window.Tesseract ? resolve() : reject(new Error("The reader loaded but did not start")); };
      s.onerror = function () {
        libReady = null;
        reject(new Error("Could not fetch the text reader. It is downloaded the first time you " +
                         "read a picture, so this needs a connection."));
      };
      document.head.appendChild(s);
    });
    return libReady;
  }

  /* ------------------------------------------------------------
     preparing the picture
     ------------------------------------------------------------ */

  const WORK_WIDTH = 2000;      // what recognition likes; bigger stops helping

  function toCanvas(source, width, height) {
    const scale = Math.min(3, Math.max(1, WORK_WIDTH / width));
    const c = document.createElement("canvas");
    c.width = Math.round(width * scale);
    c.height = Math.round(height * scale);
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, 0, 0, c.width, c.height);
    return c;
  }

  /* Grey, then stretched so the ink is black and the paper is white. A phone
     photo of a page is rarely darker than mid-grey anywhere, and recognition
     on that is markedly worse than on the same picture with its range pulled
     out. The 2nd and 98th percentiles are the ends, not the very darkest and
     lightest pixels, so one dark speck cannot flatten the whole image. */
  function contrast(canvas) {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    const hist = new Uint32Array(256);

    for (let i = 0; i < d.length; i += 4) {
      const g = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000 | 0;
      d[i] = d[i + 1] = d[i + 2] = g;
      hist[g]++;
    }
    const total = d.length / 4;
    const lowAt = total * 0.02, highAt = total * 0.98;
    let seen = 0, lo = 0, hi = 255;
    for (let v = 0; v < 256; v++) { seen += hist[v]; if (seen >= lowAt) { lo = v; break; } }
    seen = 0;
    for (let v = 255; v >= 0; v--) { seen += hist[v]; if (seen >= total - highAt) { hi = v; break; } }
    if (hi - lo < 24) { hi = 255; lo = 0; }             // already flat; leave it alone

    const span = hi - lo;
    for (let i = 0; i < d.length; i += 4) {
      let v = (d[i] - lo) * 255 / span;
      v = v < 0 ? 0 : v > 255 ? 255 : v;
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("That file is not an image this browser can open")); };
      img.src = url;
    });
  }

  /* ------------------------------------------------------------
     recognition
     ------------------------------------------------------------ */

  /* One worker, reused, because starting one downloads the language model. */
  let workerReady = null;
  function ensureWorker(onProgress) {
    if (workerReady) return workerReady;
    workerReady = ensureLib().then(function () {
      return window.Tesseract.createWorker("eng", 1, {
        corePath: CORE,
        langPath: LANG,
        logger: function (m) {
          if (!onProgress) return;
          /* the first run spends most of its time fetching the model */
          if (m.status === "loading tesseract core" || m.status === "loading language traineddata" ||
              m.status === "initializing tesseract" || m.status === "initializing api") {
            onProgress({ stage: "loading", pct: Math.round((m.progress || 0) * 100) });
          } else if (m.status === "recognizing text") {
            onProgress({ stage: "reading", pct: Math.round((m.progress || 0) * 100) });
          }
        }
      });
    });
    return workerReady;
  }

  /* Text from one prepared canvas. Lines are kept as lines: a timetable read
     as one run of words is unusable, and the recogniser already knows where
     the lines are. */
  function readCanvas(canvas, onProgress) {
    return ensureWorker(onProgress).then(function (worker) {
      return worker.recognize(canvas, {}, { blocks: true, text: true });
    }).then(function (res) {
      const d = res && res.data ? res.data : {};
      if (d.text && d.text.trim()) return d.text.replace(/\r/g, "");
      return "";
    });
  }

  /* A picture file -> its text. */
  function readImage(file, onProgress) {
    if (!available()) {
      return Promise.reject(new Error("Reading a picture needs a connection the first time, " +
                                      "and this device is offline."));
    }
    return loadImage(file).then(function (img) {
      return readCanvas(contrast(toCanvas(img, img.naturalWidth, img.naturalHeight)), onProgress);
    });
  }

  /* A PDF with no text layer: render each page and read that instead. Capped,
     because a timetable is one or two pages and a fifty-page scan would take
     minutes for nothing.

     The rasterising is given a deadline. A page render that never finishes is
     a real possibility - it is what a backgrounded tab does to PDF.js - and a
     promise that never settles leaves a dialog saying "reading…" for ever.
     Failing after thirty seconds at least says so. */
  function readPdf(url, onProgress, maxPages) {
    const cap = maxPages || 3;
    if (typeof PdfViewer === "undefined" || !PdfViewer.renderTo) {
      return Promise.reject(new Error("The PDF renderer is not available"));
    }
    return Promise.race([
      PdfViewer.renderTo(url, cap),
      new Promise(function (_, reject) {
        setTimeout(function () {
          reject(new Error("That PDF is taking too long to turn into a picture. If this tab was in " +
                           "the background, bring it to the front and try again; otherwise take a " +
                           "screenshot of it and read that instead."));
        }, 30000);
      })
    ]).then(function (canvases) {
      if (!canvases.length) return "";
      let chain = Promise.resolve(), out = [];
      canvases.forEach(function (c, i) {
        chain = chain.then(function () {
          if (onProgress) onProgress({ stage: "page", page: i + 1, of: canvases.length });
          return readCanvas(contrast(c), onProgress).then(function (t) { if (t) out.push(t); });
        });
      });
      return chain.then(function () { return out.join("\n"); });
    });
  }

  function isImage(file) {
    return /^image\//.test(file.type || "") || /\.(png|jpe?g|gif|webp|bmp|heic|heif)$/i.test(file.name || "");
  }

  return { readImage: readImage, readPdf: readPdf, isImage: isImage, available: available };
})();
