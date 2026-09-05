/* ============================================================
   The countdown

   Timing an exam question is not the same as timing a revision
   session. A session wants to know how long you have worked; a
   question wants to know how long you have left, because the
   clock is the binding constraint in the exam and running a 25
   marker forty minutes long teaches you the wrong thing.

   So when a timer carries an allowance, this shows it counting
   down rather than up: a ring that empties, the way a phone
   timer does, parked against the right edge of the screen. It
   peeks until you click it, like the case study panel, so it is
   glanceable without covering the question you are answering.

   Past zero it does not stop or hide. It turns over into
   overtime and counts up in red, because how far over you ran is
   the number worth seeing.
   ============================================================ */

const Countdown = (function () {

  const KEY = "tracker-countdown-open";
  const R = 52;                       // ring radius, in its own viewBox units
  const CIRC = 2 * Math.PI * R;

  let open = false;
  let mounted = null;

  try { open = localStorage.getItem(KEY) === "1"; } catch (e) {}

  function remember() { try { localStorage.setItem(KEY, open ? "1" : "0"); } catch (e) {} }

  /* The timer this panel is for: one with an allowance to count down. */
  function active() {
    const t = Store.get().timer;
    return t && t.targetMins ? t : null;
  }

  function dock() {
    let el = document.getElementById("countdownDock");
    if (!el) {
      el = document.createElement("div");
      el.id = "countdownDock";
      document.body.appendChild(el);
    }
    return el;
  }

  function clock(secs) {
    const s = Math.abs(Math.round(secs));
    const m = Math.floor(s / 60);
    return m + ":" + String(s % 60).padStart(2, "0");
  }

  function build(t) {
    const total = t.targetMins * 60;
    return '<button class="cd-peek" data-action="cd-open" title="Show the countdown">' +
        '<span class="cd-peek-time">' + clock(total) + '</span>' +
        '<span class="cd-peek-bar"><i></i></span>' +
      '</button>' +
      '<div class="cd-card">' +
        '<div class="cd-card-head">' +
          '<span class="cd-card-title">Time left</span>' +
          '<button class="cd-x" data-action="cd-close" title="Tuck it away">✕</button>' +
        '</div>' +
        '<div class="cd-ring">' +
          '<svg viewBox="0 0 120 120" aria-hidden="true">' +
            '<circle class="cd-track" cx="60" cy="60" r="' + R + '"/>' +
            '<circle class="cd-prog" cx="60" cy="60" r="' + R + '" ' +
              'stroke-dasharray="' + CIRC.toFixed(1) + '" stroke-dashoffset="0"/>' +
          '</svg>' +
          '<div class="cd-time"><b>' + clock(total) + '</b><small>of ' + t.targetMins + ' min</small></div>' +
        '</div>' +
        '<div class="cd-label"></div>' +
        '<div class="cd-actions">' +
          '<button class="btn btn-sm" data-action="timer-toggle"></button>' +
          '<button class="btn btn-sm" data-action="timer-stop">Finish</button>' +
        '</div>' +
      '</div>';
  }

  /* Called every second by the app's tick, and on every render. */
  function sync() {
    const t = active();
    const el = dock();

    if (!t) { if (mounted) { el.innerHTML = ""; el.className = ""; mounted = null; } return; }
    if (mounted !== t.refId + "|" + t.targetMins) {
      el.innerHTML = build(t);
      mounted = t.refId + "|" + t.targetMins;
    }

    const total = t.targetMins * 60;
    const elapsed = Store.timerElapsedMs() / 1000;
    const left = total - elapsed;
    const over = left < 0;
    /* the ring empties as the time goes, and stays empty once it is gone */
    const gone = Math.min(1, Math.max(0, elapsed / total));

    el.className = "cd" + (open ? " open" : "") + (over ? " over" : "") +
                   (!over && left <= 60 ? " soon" : "") + (t.running ? " running" : " paused");

    const prog = el.querySelector(".cd-prog");
    if (prog) prog.setAttribute("stroke-dashoffset", (CIRC * gone).toFixed(1));

    const face = clock(left);
    const big = el.querySelector(".cd-time b");
    if (big) big.textContent = (over ? "+" : "") + face;
    const sub = el.querySelector(".cd-time small");
    if (sub) sub.textContent = over ? "over the allowance" : "of " + t.targetMins + " min";

    const peek = el.querySelector(".cd-peek-time");
    if (peek) peek.textContent = (over ? "+" : "") + face;
    const bar = el.querySelector(".cd-peek-bar i");
    if (bar) bar.style.height = Math.round((1 - gone) * 100) + "%";

    const lbl = el.querySelector(".cd-label");
    if (lbl && lbl.textContent !== t.label) lbl.textContent = t.label;
    const toggle = el.querySelector('[data-action="timer-toggle"]');
    if (toggle) toggle.textContent = t.running ? "Pause" : "Resume";
  }

  function handle(action) {
    if (action === "cd-open") { open = true; remember(); sync(); return true; }
    if (action === "cd-close") { open = false; remember(); sync(); return true; }
    return false;
  }

  return { sync: sync, handle: handle };
})();
