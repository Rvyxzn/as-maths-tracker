/* ============================================================
PdfViewer, renders PDFs to <canvas> using PDF.js instead of
   relying on the browser's native PDF plugin, and wraps every one
   in the same toolbar: zoom slider, ctrl+scroll-to-cursor zoom,
   reset, a pen tool for annotating on top of the page, and a real
   in-app full screen (no file-save dialog, no new tab).

   Why canvas instead of <iframe src="file.pdf">: this app runs
   inside embedded/Electron-based browser panes that do not ship
   Chromium's built-in PDF viewer extension. An iframe renders
   completely blank there, no error, just an empty frame.

   Usage: give a container class "pdfv" and a data-src pointing at
   the PDF (relative URL or blob: URL), then call PdfViewer.mount()
   or let mountAll() pick it up after a render. Everything below - toolbar, viewport, drawing layer, is built entirely by this file
   and is never touched by the app's DOM morphing (see the isOpaque
   check in ui.js), so it survives unrelated re-renders untouched.
   ============================================================ */

const PdfViewer = (function () {

  let pdfjsReady = null;
  function ensureLib() {
    if (window.pdfjsLib) return Promise.resolve();
    if (pdfjsReady) return pdfjsReady;
    pdfjsReady = new Promise(function (resolve, reject) {
      const s = document.createElement("script");
      s.src = "js/vendor/pdfjs/pdf.min.js";
      s.onload = function () {
        try {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = "js/vendor/pdfjs/pdf.worker.min.js";
          resolve();
        } catch (e) { reject(e); }
      };
      s.onerror = function () { reject(new Error("Could not load the PDF renderer")); };
      document.head.appendChild(s);
    });
    return pdfjsReady;
  }

  /* one session per container: identifies which mount is "current" so a
     fast re-mount (switching chapters) cancels the previous job instead
     of racing it, and carries the zoom/pen state for that viewer */
  const sessions = new WeakMap();
  const MIN_SCALE = 0.5, MAX_SCALE = 3;
  /* where a fullscreened .pdfv came from, so it can go home again */
  const homePosition = new WeakMap();

  /* Pen preference carries across every PDF you open in this session --
     pick a colour once and it stays picked for the next chapter too. */
  const penDefault = { color: "rgb(224,54,79)", size: 3, tool: "pen" };

  function hsvToRgb(h, s, v) {
    const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    let rr, gg, bb;
    if (h < 60) { rr = c; gg = x; bb = 0; }
    else if (h < 120) { rr = x; gg = c; bb = 0; }
    else if (h < 180) { rr = 0; gg = c; bb = x; }
    else if (h < 240) { rr = 0; gg = x; bb = c; }
    else if (h < 300) { rr = x; gg = 0; bb = c; }
    else { rr = c; gg = 0; bb = x; }
    return [Math.round((rr + m) * 255), Math.round((gg + m) * 255), Math.round((bb + m) * 255)];
  }

  /* A real HSV wheel (hue = angle, saturation = radius, value fixed at 1),
     rendered once to a small canvas and cached as a data URL -- every pen
     popover on the page just reuses the same image. */
  let wheelUrl = null;
  function getWheelUrl() {
    if (wheelUrl) return wheelUrl;
    const size = 108;
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(size, size);
    const cx = size / 2, cy = size / 2, maxR = size / 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * size + x) * 4;
        if (dist > maxR) { img.data[idx + 3] = 0; continue; }
        let angle = Math.atan2(dy, dx) * 180 / Math.PI; if (angle < 0) angle += 360;
        const sat = Math.min(1, dist / maxR);
        const rgb = hsvToRgb(angle, sat, 1);
        img.data[idx] = rgb[0]; img.data[idx + 1] = rgb[1]; img.data[idx + 2] = rgb[2]; img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    wheelUrl = c.toDataURL();
    return wheelUrl;
  }

  function mount(container) {
    if (!container) return;
    const src = container.dataset.src;
    const sess = { src: src, scale: 1, pen: false, annot: null,
      color: penDefault.color, lineWidth: penDefault.size, tool: penDefault.tool };
    sessions.set(container, sess);
    container.classList.add("pdfv-shell");
    if (!src) { showMessage(container, "No file to display."); return; }

    /* Opened straight off the disk, browsers block both the PDF.js worker
       and the fetch for the PDF itself, so every panel would just sit blank
       with only a console error to explain it. Say so plainly instead. */
    if (location.protocol === "file:") {
      showMessage(container,
        "PDFs cannot load when this page is opened directly from a folder. " +
        "Close this tab, run “Start Revision Tracker” in the Revision Tracker " +
        "folder, and use the http://localhost:8777 page it opens.");
      return;
    }

    buildShell(container, sess);
    setLoading(container, sess);

    ensureLib().then(function () {
      if (sessions.get(container) !== sess) return; // superseded
      return window.pdfjsLib.getDocument(src).promise;
    }).then(function (pdf) {
      if (!pdf || sessions.get(container) !== sess) return;
      sess.pdf = pdf;
      renderDoc(container, pdf, sess);
      watchWidth(container, sess);
    }).catch(function (err) {
      if (sessions.get(container) !== sess) return;
      console.error("PDF render failed", err);
      showMessage(container,
        "Could not display this PDF (" + (err && err.message ? err.message : "unknown error") + ").",
        container.dataset.fallback || null);
    });
  }

  /* ---------- shell: toolbar + scrollable viewport ---------- */
  function buildShell(container, sess) {
    container.innerHTML =
      '<div class="pdfv-toolbar">' +
        '<button class="pdfv-btn" data-act="zoomout" title="Zoom out">−</button>' +
        '<input type="range" class="pdfv-range" min="' + (MIN_SCALE * 100) + '" max="' + (MAX_SCALE * 100) + '" step="5" value="100">' +
        '<button class="pdfv-btn" data-act="zoomin" title="Zoom in">+</button>' +
        '<span class="pdfv-zoom-label">100%</span>' +
        '<button class="pdfv-btn" data-act="reset" title="Reset zoom">' + UI.icon("refresh") + '</button>' +
        '<span class="pdfv-sep"></span>' +
        '<div class="pdfv-pen-wrap">' +
          '<button class="pdfv-btn pdfv-pen-btn" data-act="pen" title="Draw on the page">' + UI.icon("pencil") + '</button>' +
          '<div class="pdfv-pen-pop">' +
            '<div class="pdfv-pen-tools">' +
              '<button class="pdfv-tool-btn" data-act="tool" data-tool="pen" title="Pen">' + UI.icon("pencil") + '<span>Draw</span></button>' +
              '<button class="pdfv-tool-btn" data-act="tool" data-tool="eraser" title="Eraser">' + UI.icon("eraser") + '<span>Erase</span></button>' +
            '</div>' +
            '<div class="pdfv-wheel-row">' +
              '<div class="pdfv-wheel" style="background-image:url(' + getWheelUrl() + ')">' +
                '<div class="pdfv-wheel-dot"></div>' +
              '</div>' +
              '<div class="pdfv-size-col">' +
                '<span class="tiny faint">Thickness</span>' +
                '<input type="range" class="pdfv-size-range" min="1" max="14" step="0.5" value="3">' +
                '<div class="pdfv-size-preview-wrap"><span class="pdfv-size-preview"></span></div>' +
              '</div>' +
            '</div>' +
            '<button class="pdfv-btn pdfv-clear-btn" data-act="clear" title="Clear your drawing" hidden>Clear the whole drawing</button>' +
          '</div>' +
        '</div>' +
        '<span class="pdfv-sep"></span>' +
        '<button class="pdfv-btn" data-act="fullscreen" title="Full screen">' + UI.icon("expand") + '</button>' +
        '<span class="pdfv-spacer"></span>' +
        '<span class="pdfv-hint">' + UI.icon("info") + 'Ctrl + scroll to zoom · right-click drag to pan</span>' +
      '</div>' +
      '<div class="pdfv-viewport">' +
        '<div class="pdfv-pages"></div>' +
      '</div>';
    wireToolbar(container, sess);
  }

  function setLoading(container) {
    const vp = container.querySelector(".pdfv-pages");
    vp.innerHTML = '<div class="pdfv-loading"><div class="pdfv-spinner"></div><div class="tiny muted">Loading PDF…</div></div>';
  }

  /* ---------- toolbar wiring ---------- */
  function wireToolbar(container, sess) {
    const range = container.querySelector(".pdfv-range");
    const viewport = container.querySelector(".pdfv-viewport");

    container.querySelector('[data-act="zoomout"]').onclick = function () { stepZoom(container, sess, -0.15); };
    container.querySelector('[data-act="zoomin"]').onclick = function () { stepZoom(container, sess, 0.15); };
    container.querySelector('[data-act="reset"]').onclick = function () { resetZoom(container, sess); };
    range.oninput = function () { applyZoomCentered(container, sess, (+range.value) / 100); };

    container.querySelector('[data-act="pen"]').onclick = function () { togglePen(container, sess); };
    container.querySelector('[data-act="clear"]').onclick = function () { clearAnnotations(sess); };
    container.querySelector('[data-act="fullscreen"]').onclick = function () { toggleFullscreen(container); };
    wirePenPopover(container, sess);

    /* Ctrl/Cmd + wheel zooms toward the cursor, and only inside this
    viewer, preventDefault + stopPropagation keep it from also
       zooming the page itself. Anything without Ctrl held scrolls
       normally, exactly as the user asked. */
    viewport.addEventListener("wheel", function (e) {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = viewport.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const factor = Math.exp(-e.deltaY * 0.0018);
      applyZoom(container, sess, sess.scale * factor, mx, my);
    }, { passive: false });

    attachPanning(viewport);
    attachTouchZoom(container, sess, viewport);
  }

  /* Pinch zooms the PDF rather than the whole site. Left to itself a phone
     takes any two-finger gesture and scales the entire page, so the toolbar
     and the rest of the app blow up along with the paper. The CSS hands the
     gesture over (touch-action on the viewport); one finger still scrolls
     normally. A double tap toggles between fit and 2x at the spot you
     tapped, the way every PDF app on a phone behaves. */
  function attachTouchZoom(container, sess, viewport) {
    const pts = new Map();
    let pinch = null, lastTap = 0, lastX = 0, lastY = 0;

    viewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "touch") return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size !== 2) return;
      /* A second finger means this was never a stroke, drop whatever the
         pen had started so a pinch does not leave a stray line behind. */
      const annot = container.querySelector(".pdfv-annot");
      if (annot) {
        try { annot.dispatchEvent(new PointerEvent("pointercancel", { pointerId: e.pointerId, bubbles: false })); }
        catch (err) { /* the stroke simply ends where it was */ }
      }
      const a = Array.from(pts.values());
      const rect = viewport.getBoundingClientRect();
      pinch = {
        dist: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1,
        scale: sess.scale,
        mx: (a[0].x + a[1].x) / 2 - rect.left,
        my: (a[0].y + a[1].y) / 2 - rect.top
      };
    }, { passive: true });

    viewport.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "touch" || !pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!pinch || pts.size !== 2) return;
      e.preventDefault();
      const a = Array.from(pts.values());
      const dist = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) || 1;
      applyZoom(container, sess, pinch.scale * (dist / pinch.dist), pinch.mx, pinch.my);
    }, { passive: false });

    function release(e) {
      if (e.pointerType !== "touch") return;
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = null;
    }

    viewport.addEventListener("pointerup", function (e) {
      if (e.pointerType === "touch" && !pinch && pts.size === 1) {
        const now = Date.now();
        const quick = now - lastTap < 300;
        const samePlace = Math.abs(e.clientX - lastX) < 30 && Math.abs(e.clientY - lastY) < 30;
        if (quick && samePlace) {
          const rect = viewport.getBoundingClientRect();
          applyZoom(container, sess, sess.scale > 1.2 ? 1 : 2, e.clientX - rect.left, e.clientY - rect.top);
          lastTap = 0;
        } else {
          lastTap = now; lastX = e.clientX; lastY = e.clientY;
        }
      }
      release(e);
    }, { passive: true });

    viewport.addEventListener("pointercancel", release, { passive: true });
  }

/* Right mouse button drag pans the viewport, handy once you are
     zoomed in past the width of the panel. The browser's own
     right-click context menu is suppressed only over the PDF itself. */
  function attachPanning(viewport) {
    let panning = false, startX, startY, startLeft, startTop;
    viewport.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    viewport.addEventListener("mousedown", function (e) {
      if (e.button !== 2) return;
      panning = true;
      startX = e.clientX; startY = e.clientY;
      startLeft = viewport.scrollLeft; startTop = viewport.scrollTop;
      viewport.classList.add("pdfv-panning");
      e.preventDefault();
    });
    document.addEventListener("mousemove", function (e) {
      if (!panning) return;
      viewport.scrollLeft = startLeft - (e.clientX - startX);
      viewport.scrollTop = startTop - (e.clientY - startY);
    });
    document.addEventListener("mouseup", function (e) {
      if (e.button === 2 && panning) { panning = false; viewport.classList.remove("pdfv-panning"); }
    });
  }

  function clampScale(s) { return Math.max(MIN_SCALE, Math.min(MAX_SCALE, s)); }

  function stepZoom(container, sess, delta) { applyZoomCentered(container, sess, sess.scale + delta); }

  /* zoom anchored at the centre of the visible viewport (buttons, slider) */
  function applyZoomCentered(container, sess, newScale) {
    const viewport = container.querySelector(".pdfv-viewport");
    applyZoom(container, sess, newScale, viewport.clientWidth / 2, viewport.clientHeight / 2);
  }

  /* zoom anchored at a specific point in the viewport (cursor position) */
  function applyZoom(container, sess, newScale, anchorX, anchorY) {
    newScale = Math.round(clampScale(newScale) * 100) / 100;
    if (newScale === sess.scale) return;
    const viewport = container.querySelector(".pdfv-viewport");
    const oldScale = sess.scale;
    const contentX = (viewport.scrollLeft + anchorX) / oldScale;
    const contentY = (viewport.scrollTop + anchorY) / oldScale;
    sess.scale = newScale;
    setPagesTransform(container, sess);
    viewport.scrollLeft = contentX * newScale - anchorX;
    viewport.scrollTop = contentY * newScale - anchorY;
    updateZoomUI(container, sess);
  }

  function resetZoom(container, sess) {
    const viewport = container.querySelector(".pdfv-viewport");
    sess.scale = 1;
    setPagesTransform(container, sess);
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
    updateZoomUI(container, sess);
  }

  /* Sets the page stack's transform to the current zoom, plus -- when the
     zoomed-out content is now narrower than the viewport -- a flat pixel
     offset that keeps it centred instead of stuck against the left edge.
     transform-origin stays fixed at the box's own top-left throughout, so
     the cursor-anchored ctrl+scroll zoom math above is unaffected; the
     translateX is applied AFTER the scale (it is listed first, and CSS
     composes transforms right-to-left), so it is a flat screen-pixel shift
     that does not itself get multiplied by the scale. */
  function setPagesTransform(container, sess) {
    const viewport = container.querySelector(".pdfv-viewport");
    const pages = container.querySelector(".pdfv-pages");
    if (!viewport || !pages) return;
    const naturalWidth = pages.offsetWidth; // layout width; transform does not affect this
    const scaledWidth = naturalWidth * sess.scale;
    const vpWidth = viewport.clientWidth;
    const offset = scaledWidth < vpWidth ? Math.round((vpWidth - scaledWidth) / 2) : 0;
    pages.style.transform = "translateX(" + offset + "px) scale(" + sess.scale + ")";
  }

  function updateZoomUI(container, sess) {
    const pct = Math.round(sess.scale * 100);
    const range = container.querySelector(".pdfv-range");
    const label = container.querySelector(".pdfv-zoom-label");
    if (range) range.value = pct;
    if (label) label.textContent = pct + "%";
  }

  /* ---------- pen tool ---------- */
  function togglePen(container, sess) {
    sess.pen = !sess.pen;
    container.querySelector('[data-act="pen"]').classList.toggle("on", sess.pen);
    container.querySelector('[data-act="clear"]').hidden = !sess.pen;
    container.classList.toggle("pdfv-pen-mode", sess.pen);
    container.classList.toggle("pdfv-tool-eraser", sess.pen && sess.tool === "eraser");
    if (sess.annot) sess.annot.style.pointerEvents = sess.pen ? "auto" : "none";
  }

  /* Colour wheel, tool switch and thickness slider inside the pen flyout.
     The flyout itself opens on hover (see CSS); picking a tool or a colour
     also turns drawing mode on, since choosing one clearly means you want
     to use it straight away. */
  function wirePenPopover(container, sess) {
    /* Click to open, not hover. A hover popover is fiddly: it closes the
       moment the pointer strays off the path between the button and the
       panel, which is exactly what happens when you reach for the colour
       wheel. Press the pen, then press a colour. */
    const wrap = container.querySelector(".pdfv-pen-wrap");
    const wheel = container.querySelector(".pdfv-wheel");
    const dot = container.querySelector(".pdfv-wheel-dot");
    const sizeRange = container.querySelector(".pdfv-size-range");
    const sizePreview = container.querySelector(".pdfv-size-preview");
    const penBtn = container.querySelector('[data-act="pen"]');

    function setColor(hex, dotX, dotY) {
      sess.color = hex; penDefault.color = hex;
      penBtn.style.setProperty("--pen-color", hex);
      if (dot && dotX != null) { dot.style.left = dotX + "px"; dot.style.top = dotY + "px"; }
    }
    function pickFromEvent(e) {
      const rect = wheel.getBoundingClientRect();
      const cx = rect.width / 2, cy = rect.height / 2;
      let x = e.clientX - rect.left - cx, y = e.clientY - rect.top - cy;
      const maxR = rect.width / 2;
      let dist = Math.sqrt(x * x + y * y);
      if (dist > maxR) { const k = maxR / dist; x *= k; y *= k; dist = maxR; }
      let angle = Math.atan2(y, x) * 180 / Math.PI; if (angle < 0) angle += 360;
      const sat = dist / maxR;
      const rgb = hsvToRgb(angle, sat, 1);
      setColor("rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")", cx + x, cy + y);
      if (!sess.pen) togglePen(container, sess);
    }
    let dragging = false;
    wheel.addEventListener("pointerdown", function (e) { dragging = true; pickFromEvent(e); try { wheel.setPointerCapture(e.pointerId); } catch (err) {} });
    wheel.addEventListener("pointermove", function (e) { if (dragging) pickFromEvent(e); });
    wheel.addEventListener("pointerup", function () { dragging = false; });
    wheel.addEventListener("pointercancel", function () { dragging = false; });

    function setSize(v) {
      sess.lineWidth = v; penDefault.size = v;
      if (sizePreview) sizePreview.style.width = sizePreview.style.height = Math.max(3, Math.min(20, v * 1.4)) + "px";
    }
    sizeRange.value = sess.lineWidth;
    setSize(sess.lineWidth);
    sizeRange.addEventListener("input", function () { setSize(+sizeRange.value); });

    if (wrap) {
      const penButton = wrap.querySelector('[data-act="pen"]');
      penButton.addEventListener("click", function (e) {
        e.stopPropagation();
        wrap.classList.toggle("open");
      });
      /* keep clicks inside the panel from closing it */
      wrap.querySelector(".pdfv-pen-pop").addEventListener("click", function (e) { e.stopPropagation(); });
      /* anywhere else closes it */
      document.addEventListener("click", function () { wrap.classList.remove("open"); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") wrap.classList.remove("open");
      });
    }

    container.querySelectorAll('[data-act="tool"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        sess.tool = btn.dataset.tool; penDefault.tool = btn.dataset.tool;
        container.querySelectorAll('[data-act="tool"]').forEach(function (b) { b.classList.toggle("on", b === btn); });
        container.classList.toggle("pdfv-tool-eraser", sess.tool === "eraser");
        if (!sess.pen) togglePen(container, sess);
      });
    });
    container.querySelector('[data-tool="' + sess.tool + '"]').classList.add("on");
    setColor(sess.color, null, null);
  }

  function clearAnnotations(sess) {
    if (!sess.annot) return;
    const ctx = sess.annot.getContext("2d");
    ctx.clearRect(0, 0, sess.annot.width, sess.annot.height);
  }

  /* Freehand drawing, smoothed. Point-to-point straight segments look
     rigid/jagged the moment the pointer moves quickly (a chunky polyline
     with visible corners); instead we run a quadratic curve through the
     midpoints of each consecutive triple of points, which is the standard
     technique for smooth canvas ink and is what "doesn't turn rigid" here. */
  function attachDrawing(annot, sess) {
    const ctx = annot.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    let drawing = false, points = [];

    function widthFor() { return sess.tool === "eraser" ? (sess.lineWidth || 3) * 3 : (sess.lineWidth || 3); }
    function readyContext() {
      ctx.globalCompositeOperation = sess.tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = sess.color || "rgb(224,54,79)";
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = widthFor();
    }

    /* Draw through the points with a quadratic curve whose control point is
       the sampled point and whose ends are the midpoints of neighbouring
       pairs. That is what turns a chain of straight segments into a smooth
       line. */
    function drawSegment() {
      const n = points.length;
      if (n < 3) return;
      const p0 = points[n - 3], p1 = points[n - 2], p2 = points[n - 1];
      const m1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
      const m2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      readyContext();
      ctx.beginPath();
      ctx.moveTo(m1.x, m1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, m2.x, m2.y);
      ctx.stroke();
    }

    function addPoint(x, y) { points.push({ x: x, y: y }); drawSegment(); }

    annot.addEventListener("pointerdown", function (e) {
      if (!sess.pen) return;
      /* The second finger of a pinch must not start a line of its own. */
      if (e.pointerType === "touch" && e.isPrimary === false) return;
      drawing = true;
      points = [{ x: e.offsetX, y: e.offsetY }];
      readyContext();
      /* a plain tap still leaves a mark, before any move happens */
      ctx.beginPath();
      ctx.arc(e.offsetX, e.offsetY, widthFor() / 2, 0, Math.PI * 2);
      ctx.fill();
      try { annot.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    annot.addEventListener("pointermove", function (e) {
      if (!drawing) return;
      e.preventDefault();
      /* A browser batches several physical samples into one pointermove when
         the pen moves quickly. Without asking for the coalesced ones, those
         samples are lost and a fast stroke comes out visibly faceted. */
      let evts = [e];
      if (typeof e.getCoalescedEvents === "function") {
        const c = e.getCoalescedEvents();
        if (c && c.length) evts = c;
      }
      const box = annot.getBoundingClientRect();
      for (let i = 0; i < evts.length; i++) {
        const ev = evts[i];
        /* A coalesced event has no offsetX/offsetY, so derive it from the
        element box, the canvas is sized 1:1 with its CSS box, so this
           matches what offsetX would have given. */
        addPoint(ev.clientX - box.left, ev.clientY - box.top);
      }
    });

    /* Finish the stroke at the point where the pen actually lifted. The
       curve above stops at the midpoint of the last two samples, so without
       this the tail of every stroke is quietly cut short. */
    function finish(e) {
      if (!drawing) return;
      /* The lift itself carries a position, and it is usually a little past
         the last pointermove. Record it so the tail ends where the pen
         actually came up. */
      if (e && typeof e.clientX === "number") {
        const box = annot.getBoundingClientRect();
        const lx = e.clientX - box.left, ly = e.clientY - box.top;
        const last = points[points.length - 1];
        if (!last || Math.abs(last.x - lx) > 0.5 || Math.abs(last.y - ly) > 0.5) {
          addPoint(lx, ly);
        }
      }
      const n = points.length;
      if (n >= 2) {
        const p1 = points[n - 2], p2 = points[n - 1];
        const m1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        readyContext();
        ctx.beginPath();
        ctx.moveTo(m1.x, m1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      drawing = false;
      points = [];
      ctx.globalCompositeOperation = "source-over";
    }
    annot.addEventListener("pointerup", finish);
    annot.addEventListener("pointerleave", finish);
    annot.addEventListener("pointercancel", finish);
  }


  /* ---------- full screen (in-app, not the OS/browser one) ---------- */
  let fsBackdrop = null;
  /* The panel currently full screen, if any. Going full screen moves the real
  node to <body>, which leaves a hole in the view, so the next DOM morph
     rebuilds an empty .pdfv in its place. That "ghost" would otherwise be
     mounted and render the whole document a second time in the background,
     then sit there as a duplicate once you exit. We skip mounting it, and
     swap the real panel back into its exact spot on the way out. */
  let fsContainer = null;

  function ghostFor(el) {
    if (!fsContainer || el === fsContainer) return false;
    const home = homePosition.get(fsContainer);
    if (!home || !home.parent || el.parentNode !== home.parent) return false;
    if (el.dataset.src !== fsContainer.dataset.src) return false;
    return !sessions.get(el);
  }
  function escExit(e) {
    if (e.key !== "Escape") return;
    const el = document.querySelector(".pdfv-fullscreen");
    if (el) exitFullscreen(el);
  }
  function toggleFullscreen(container) {
    if (container.classList.contains("pdfv-fullscreen")) exitFullscreen(container);
    else enterFullscreen(container);
  }
  /* Going in and out of full screen moves the panel between <body> and its
     original slot, and moving a node throws away its scroll position. The
     width also changes, which can re-render the pages at a different size,
     so an absolute pixel offset would not map back anyway. Remember where
     you were as a FRACTION of the document and restore that instead, it
     survives both the move and a re-render. */
  function captureScroll(container, sess) {
    const vp = container.querySelector(".pdfv-viewport");
    if (!vp || !sess) return;
    const max = vp.scrollHeight - vp.clientHeight;
    sess.pendingScroll = max > 0 ? vp.scrollTop / max : 0;
  }

  /* Layout after a re-render does not settle synchronously, and how long it
     takes varies with the document. Poll briefly for a scrollable viewport
     rather than guessing a single delay. */
  function restoreScrollWhenReady(container, sess) {
    if (!sess || sess.pendingScroll == null) return;
    let tries = 0;
    const attempt = function () {
      if (sessions.get(container) !== sess || sess.pendingScroll == null) return;
      const vp = container.querySelector(".pdfv-viewport");
      if (!vp) return;
      const max = vp.scrollHeight - vp.clientHeight;
      if (max > 0) { applyPendingScroll(container, sess); return; }
      if (++tries < 20) setTimeout(attempt, 60); // give up after ~1.2s
      else sess.pendingScroll = null;
    };
    setTimeout(attempt, 0);
  }

  function applyPendingScroll(container, sess) {
    if (!sess || sess.pendingScroll == null) return;
    const vp = container.querySelector(".pdfv-viewport");
    if (!vp) return;
    const max = vp.scrollHeight - vp.clientHeight;
    vp.scrollTop = max > 0 ? Math.round(sess.pendingScroll * max) : 0;
    /* Always consume it. If a re-render follows (the width changed), that
       render captures the position itself, so nothing stale is carried
       forward into an unrelated re-render later on. */
    sess.pendingScroll = null;
  }

  function enterFullscreen(container) {
    if (!fsBackdrop) {
      fsBackdrop = document.createElement("div");
      fsBackdrop.className = "pdfv-backdrop";
      document.body.appendChild(fsBackdrop);
    }
    fsBackdrop.style.display = "block";
    fsBackdrop.onclick = function () { exitFullscreen(container); };
    captureScroll(container, sessions.get(container));

    /* Move the panel to be a direct child of <body>, immediately after the
       backdrop. A position:fixed element is still stacked according to
       whichever ancestor establishes the nearest stacking context, so left
       in its original deeply-nested spot its z-index never actually gets
       compared against the backdrop's -- the blur ends up over the panel
       instead of behind it. Being real DOM siblings fixes that outright. */
    if (!homePosition.has(container)) {
      homePosition.set(container, { parent: container.parentNode, next: container.nextSibling });
    }
    document.body.appendChild(fsBackdrop);
    document.body.appendChild(container);
    fsContainer = container;
    container.classList.add("pdfv-fullscreen");
    /* hug the actual page width instead of always spanning ~90% of the
    screen, the toolbar chrome adds ~24px either side of the pages */
    const sess = sessions.get(container);
    if (sess && sess.contentWidth) {
      container.style.width = Math.min(sess.contentWidth + 44, window.innerWidth * 0.94) + "px";
    }
    const btn = container.querySelector('[data-act="fullscreen"]');
    if (btn) { btn.innerHTML = UI.icon("contract"); btn.title = "Exit full screen"; }
    document.addEventListener("keydown", escExit);
    if (sess) {
      setPagesTransform(container, sess); // viewport size just changed
      applyPendingScroll(container, sess); // back to where you were reading
    }
  }
  function exitFullscreen(container) {
    captureScroll(container, sessions.get(container));
    container.classList.remove("pdfv-fullscreen");
    container.style.width = "";
    if (fsBackdrop) fsBackdrop.style.display = "none";
    const btn = container.querySelector('[data-act="fullscreen"]');
    if (btn) { btn.innerHTML = UI.icon("expand"); btn.title = "Full screen"; }
    document.removeEventListener("keydown", escExit);

    /* put it back exactly where it came from. If a re-render rebuilt an empty
       placeholder in that slot while we were away, swap into it so the panel
       lands in precisely the right place rather than at the end. */
    const home = homePosition.get(container);
    fsContainer = null;
    if (home && home.parent) {
      let ghost = null;
      home.parent.querySelectorAll(".pdfv").forEach(function (el) {
        if (!ghost && el !== container && el.dataset.src === container.dataset.src && !sessions.get(el)) ghost = el;
      });
      if (ghost) home.parent.replaceChild(container, ghost);
      else if (home.next && home.next.parentNode === home.parent) home.parent.insertBefore(container, home.next);
      else home.parent.appendChild(container);
    }
    const sess = sessions.get(container);
    if (sess) {
      setPagesTransform(container, sess); // viewport size just changed back
      applyPendingScroll(container, sess);
    }
  }

  /* ---------- rendering ---------- */
  /* Pages are rasterised to fit the panel's width at the moment they are
  drawn. If the panel is later wider, the window is resized, the sidebar
  closes, or the panel simply had not been laid out yet when we measured - the PDF would stay small and sit in a sea of empty space. Watch the
     width and redraw at the new size when it changes materially. */
  /* The ResizeObserver below is the live path, but browsers pause it while
  the tab is hidden, so a panel that was first drawn narrow could stay
     narrow. mountAll() runs after every app render, so check the width there
     too: that path does not depend on the rendering pipeline at all. */
  function refitIfNeeded(container, sess) {
    if (!sess || !sess.pdf || !sess.renderedWidth) return;
    const viewport = container.querySelector(".pdfv-viewport");
    if (!viewport) return;
    const w = viewport.clientWidth;
    if (!w || Math.abs(w - sess.renderedWidth) < 40) return;
    renderDoc(container, sess.pdf, sess);
  }

  function watchWidth(container, sess) {
    if (sess.ro || typeof ResizeObserver === "undefined") return;
    const viewport = container.querySelector(".pdfv-viewport");
    if (!viewport) return;
    let timer = null;
    sess.ro = new ResizeObserver(function () {
      if (sessions.get(container) !== sess || !sess.pdf) return;
      const w = viewport.clientWidth;
      if (!w || !sess.renderedWidth) return;
      if (Math.abs(w - sess.renderedWidth) < 40) return; // ignore scrollbar-sized jitter
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (sessions.get(container) !== sess || !sess.pdf) return;
        renderDoc(container, sess.pdf, sess);
      }, 180);
    });
    sess.ro.observe(viewport);
  }

  function renderDoc(container, pdf, sess) {
    const pagesEl = container.querySelector(".pdfv-pages");
    /* If this is a re-render (a resize, or the width refit), remember where
       the reader was before the pages are thrown away. A full-screen toggle
       has already captured it deliberately, so do not overwrite that. */
    if (sess.pendingScroll == null && pagesEl.querySelector(".pdfv-page")) {
      captureScroll(container, sess);
    }
    /* keep any pen drawing so a resize does not wipe your annotations */
    const oldAnnot = pagesEl.querySelector(".pdfv-annot");
    const carried = oldAnnot && oldAnnot.width ? { canvas: oldAnnot, w: oldAnnot.width, h: oldAnnot.height } : null;
    pagesEl.innerHTML = "";
    /* Rotating a phone can start a second render while the first is still
       walking the pages. Clearing the list does not stop that earlier loop,
       which then carries on appending its own pages at the old width, so the
       reader ends up with two documents interleaved. Each run takes a token
       and stops as soon as a newer one starts. */
    sess.renderToken = (sess.renderToken || 0) + 1;
    const token = sess.renderToken;
    function stale() { return sessions.get(container) !== sess || sess.renderToken !== token; }
    const viewport = container.querySelector(".pdfv-viewport");
    const width = viewport.clientWidth || 700;
    sess.renderedWidth = width;
    sess.carriedAnnot = carried;
    const n = pdf.numPages;

    let p = 1;
    function next() {
      if (stale()) return;
      if (p > n) { finish(); return; }
      pdf.getPage(p).then(function (page) {
        if (stale()) return;
        const base = page.getViewport({ scale: 1 });
        const fit = Math.max(0.6, (width - 4) / base.width);
        const dpr = window.devicePixelRatio || 1;
        const vp = page.getViewport({ scale: fit * dpr });

        const canvas = document.createElement("canvas");
        canvas.className = "pdfv-page";
        canvas.width = vp.width; canvas.height = vp.height;
        canvas.style.width = (vp.width / dpr) + "px";
        canvas.style.height = (vp.height / dpr) + "px";
        pagesEl.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
          p++; next();
        }).catch(function () { p++; next(); });
      }).catch(function () { p++; next(); });
    }
    function finish() {
      if (stale()) return;
      setPagesTransform(container, sess); // centre the freshly-rendered pages if narrower than the panel
      let maxW = 0;
      pagesEl.querySelectorAll(".pdfv-page").forEach(function (c) {
        maxW = Math.max(maxW, parseFloat(c.style.width) || 0);
      });
      sess.contentWidth = maxW;
      const annot = document.createElement("canvas");
      annot.className = "pdfv-annot";
      annot.width = pagesEl.scrollWidth || 1;
      annot.height = pagesEl.scrollHeight || 1;
      annot.style.width = annot.width + "px";
      annot.style.height = annot.height + "px";
      annot.style.pointerEvents = sess.pen ? "auto" : "none";
      /* a resize redraws the pages, so bring any pen marks across, scaled to
         the new size rather than thrown away */
      if (sess.carriedAnnot && sess.carriedAnnot.w && annot.width) {
        try {
          annot.getContext("2d").drawImage(sess.carriedAnnot.canvas, 0, 0, annot.width, annot.height);
        } catch (e) { /* nothing to carry over */ }
        sess.carriedAnnot = null;
      }
      pagesEl.appendChild(annot);
      attachDrawing(annot, sess);
      /* A full-screen toggle or a resize re-renders the pages at a new width;
         put the reader back where they were. The canvases exist by now but
         the viewport's scrollHeight has not necessarily caught up, so a
         single deferred attempt can still land at the top. Retry briefly
         until the viewport is actually scrollable. Timeouts rather than
         requestAnimationFrame, because rAF is paused in a hidden tab. */
      restoreScrollWhenReady(container, sess);
      sess.annot = annot;
    }
    next();
  }

  function showMessage(container, text, fallbackUrl) {
    container.innerHTML =
      '<div class="pdfv-error">' +
        '<div>' + UI.esc(text) + '</div>' +
        (fallbackUrl ? '<a class="btn btn-sm" href="' + UI.esc(fallbackUrl) + '" target="_blank" rel="noopener">Open in a new tab instead ↗</a>' : "") +
      '</div>';
  }

  /* mount every .pdfv on the page that isn't already showing its src */
  function mountAll(root) {
    (root || document).querySelectorAll(".pdfv").forEach(function (el) {
      const existing = sessions.get(el);
      if (existing && existing.src === el.dataset.src) { refitIfNeeded(el, existing); return; }
      if (ghostFor(el)) return; // placeholder for a panel that is full screen
      mount(el);
    });
  }

  /* Render a page range of a PDF straight into a container, at the
     container's own width. Used to show the actual exam page for a question
     rather than the extracted text: a diagram or a table does not survive
     text extraction -- a production possibility frontier comes out as
     "X Y Z W V U 80 100 120 140 1700 50 100" -- and no amount of tidying
     will bring it back. The page itself always will. */
  const docCache = {};
  function renderPages(host, src, from, to) {
    if (!host || host.dataset.done === "1") return Promise.resolve();
    host.dataset.done = "1";
    host.innerHTML = '<div class="qpdf-wait tiny faint">Loading the exam page…</div>';
    return ensureLib().then(function () {
      if (!docCache[src]) docCache[src] = window.pdfjsLib.getDocument(src).promise;
      return docCache[src];
    }).then(function (pdf) {
      host.innerHTML = "";
      const last = Math.min(to || from, pdf.numPages);
      let chain = Promise.resolve();
      for (let p = from; p <= last; p++) {
        (function (n) {
          chain = chain.then(function () {
            return pdf.getPage(n).then(function (page) {
              const width = host.clientWidth || 640;
              const base = page.getViewport({ scale: 1 });
              const dpr = window.devicePixelRatio || 1;
              const vp = page.getViewport({ scale: (width / base.width) * dpr });
              const canvas = document.createElement("canvas");
              canvas.className = "qpdf-page";
              canvas.width = vp.width; canvas.height = vp.height;
              canvas.style.width = "100%"; canvas.style.height = "auto";
              host.appendChild(canvas);
              return page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
            });
          });
        })(p);
      }
      return chain;
    }).catch(function (e) {
      host.innerHTML = '<div class="tiny faint">Could not load the exam page (' +
                       (e && e.message ? e.message : "unknown error") + ').</div>';
    });
  }

  return { mount: mount, mountAll: mountAll, renderPages: renderPages };
})();
