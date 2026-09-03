/* ============================================================
   Login, pick a profile, create one, or sign in with Google
   ============================================================ */

const LoginView = (function () {

  let mode = "pick";       // "pick" | "create" | "unlock"
  let unlockId = null;
  let error = "";
  let busy = false;

  function render(root) {
    const list = Auth.profiles();
    if (mode === "pick" && !list.length) mode = "create";

    root.innerHTML =
      '<div class="login-wrap">' +
        '<div class="login-card">' +
          '<div class="login-brand">' +
            '<div class="brand-mark login-mark">∑</div>' +
            '<div><div class="login-title">A-Level Maths</div>' +
              '<div class="login-sub">Revision Tracker</div></div>' +
          '</div>' +

          (error ? '<div class="warnbox bad login-error">' + UI.esc(error) + '</div>' : "") +

          (mode === "create" ? createForm(list)
            : mode === "unlock" ? unlockForm()
            : pickForm(list)) +

          googleBlock() +
          footerNote() +
        '</div>' +
      '</div>';

    mount(root);
  }

  /* ---------- pick an existing profile ---------- */
  function pickForm(list) {
    return '<h1 class="login-h">Who is revising?</h1>' +
      '<p class="login-p">Each profile keeps its own ratings, plan and past papers.</p>' +
      '<div class="profile-list">' +
        list.map(function (p) {
          const kb = Math.round(Auth.profileSize(p.id) / 1024);
          return '<button class="profile-row" data-action="login-pick" data-id="' + p.id + '">' +
            avatar(p) +
            '<span class="profile-meta">' +
              '<b>' + UI.esc(p.name) + '</b>' +
              '<small>' + (p.provider === "google" ? UI.esc(p.email || "Google account") : "On this device") +
                (kb ? " · " + kb + " KB saved" : " · no progress yet") +
                (p.passcodeHash ? " · 🔒 passcode" : "") + '</small>' +
            '</span>' +
            '<span class="profile-go">→</span>' +
          '</button>';
        }).join("") +
      '</div>' +
      '<button class="btn btn-block" data-action="login-mode" data-mode="create" style="margin-top:12px">' +
        '+ New profile</button>';
  }

  /* ---------- create ---------- */
  function createForm(list) {
    const first = !list.length;
    const legacy = Auth.hasLegacySave();
    return '<h1 class="login-h">' + (first ? "Set up your profile" : "New profile") + '</h1>' +
      '<p class="login-p">' + (first
        ? "This names the save file on this device. Nothing is sent anywhere."
        : "A separate save on this device, with its own progress.") + '</p>' +

      (first && legacy ? '<div class="warnbox info tiny"><b>Your existing progress will be kept</b>' +
        'There is already a save on this device from before profiles existed. It becomes this ' +
        'profile’s progress, and a backup copy is kept under a separate key.</div>' : "") +

      '<div class="field"><label class="label">Your name</label>' +
        '<input class="input" id="loginName" placeholder="e.g. Rayan" autocomplete="off"></div>' +

      '<div class="field"><label class="label">Passcode <span class="faint">(optional)</span></label>' +
        '<input class="input" id="loginPass" type="password" placeholder="Leave blank for none" autocomplete="new-password">' +
        '<div class="tiny faint" style="margin-top:6px">Keeps someone else on this laptop out of your profile by ' +
          'accident. It is <b>not</b> encryption and it does not hide your data from anyone who really looks.</div></div>' +

      '<button class="btn btn-primary btn-block" data-action="login-create"' + (busy ? " disabled" : "") + '>' +
        (busy ? "Creating…" : "Create profile") + '</button>' +
      (list.length ? '<button class="btn btn-ghost btn-block" data-action="login-mode" data-mode="pick" ' +
        'style="margin-top:8px">Back</button>' : "");
  }

  /* ---------- unlock a passcoded profile ---------- */
  function unlockForm() {
    const p = Auth.findProfile(unlockId);
    if (!p) { mode = "pick"; return pickForm(Auth.profiles()); }
    return '<h1 class="login-h">' + UI.esc(p.name) + '</h1>' +
      '<p class="login-p">This profile has a passcode.</p>' +
      '<div class="field"><label class="label">Passcode</label>' +
        '<input class="input" id="loginPass" type="password" autocomplete="current-password" autofocus></div>' +
      '<button class="btn btn-primary btn-block" data-action="login-unlock"' + (busy ? " disabled" : "") + '>' +
        (busy ? "Checking…" : "Unlock") + '</button>' +
      '<button class="btn btn-ghost btn-block" data-action="login-mode" data-mode="pick" ' +
        'style="margin-top:8px">Back</button>';
  }

  /* ---------- Google ---------- */
  function googleBlock() {
    if (googleConfigured()) {
      return '<div class="login-or"><span>or</span></div>' +
        '<div id="googleBtn" class="google-host"></div>';
    }
    return '<div class="login-or"><span>or</span></div>' +
      '<button class="btn btn-block" disabled title="Not configured yet">' +
        googleGlyph() + 'Sign in with Google</button>' +
      '<div class="tiny faint" style="margin-top:8px;text-align:center">' +
        'Google sign-in is not configured. Add a Client ID to ' +
        '<code>js/auth-config.js</code> to switch it on, the steps are in that file.</div>';
  }

  function googleGlyph() {
    return '<svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true" style="vertical-align:-3px;margin-right:8px">' +
      '<path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>' +
      '<path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z"/>' +
      '<path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 010-3.44V4.95H.96a9 9 0 000 8.1l3.01-2.33z"/>' +
      '<path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>' +
      '</svg>';
  }

  function footerNote() {
    return '<div class="login-foot">' +
      '<b>Where your progress lives</b>' +
      'In this browser, on this device. It is not synced between your laptop and your phone, and ' +
      'signing in with Google does not change that yet, it only says who you are. ' +
      'Use <b>Settings › Export</b> to move your progress to another device, and to keep a backup.' +
      '</div>';
  }

  function avatar(p) {
    if (p.picture) return '<img class="profile-av" src="' + UI.esc(p.picture) + '" alt="" referrerpolicy="no-referrer">';
    const initial = (p.name || "?").trim().charAt(0).toUpperCase();
    return '<span class="profile-av profile-av-i">' + UI.esc(initial) + '</span>';
  }

  /* ---------- wiring ---------- */
  function mount(root) {
    const host = root.querySelector("#googleBtn");
    if (host && googleConfigured()) {
      Auth.renderGoogleButton(host, function () {
        error = "";
        afterSignIn();
      }, function (e) {
        error = e.message || "Google sign-in failed";
        App.render();
      });
    }
    const name = root.querySelector("#loginName");
    if (name) name.focus();
    const pass = root.querySelector("#loginPass");
    if (pass && mode === "unlock") pass.focus();

    root.querySelectorAll("input").forEach(function (el) {
      el.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        if (mode === "create") handle("login-create", el);
        else if (mode === "unlock") handle("login-unlock", el);
      });
    });
  }

  /* Signing in swaps the save file underneath the app, so the store has to
     be reloaded before anything renders against the previous user's data. */
  function afterSignIn() {
    Store.reloadForUser();
    mode = "pick"; error = ""; busy = false;
    App.go("dashboard");
    const u = Auth.current();
    UI.toast("Signed in as " + (u ? u.name : "user"), "ok");
  }

  function handle(action, el) {
    if (action === "login-mode") {
      mode = el.dataset.mode; error = ""; App.render(); return true;
    }

    if (action === "login-pick") {
      const p = Auth.findProfile(el.dataset.id);
      if (!p) return true;
      if (p.passcodeHash) { unlockId = p.id; mode = "unlock"; error = ""; App.render(); return true; }
      Auth.signInLocal(p.id).then(afterSignIn).catch(function (e) {
        error = e.message; App.render();
      });
      return true;
    }

    if (action === "login-create") {
      const nameEl = document.getElementById("loginName");
      const passEl = document.getElementById("loginPass");
      const first = !Auth.profiles().length;
      busy = true; error = ""; App.render();
      Auth.createLocal(nameEl ? nameEl.value : "", passEl ? passEl.value : "")
        .then(function (p) {
          /* The pre-profiles save becomes the very first profile's data. */
          if (first) Auth.adoptLegacySave(p.id);
          return Auth.signInLocal(p.id, passEl ? passEl.value : "");
        })
        .then(afterSignIn)
        .catch(function (e) { busy = false; error = e.message; App.render(); });
      return true;
    }

    if (action === "login-unlock") {
      const passEl = document.getElementById("loginPass");
      busy = true; error = ""; App.render();
      Auth.signInLocal(unlockId, passEl ? passEl.value : "")
        .then(afterSignIn)
        .catch(function (e) { busy = false; error = e.message; App.render(); });
      return true;
    }

    if (action === "sign-out") {
      UI.confirm("Sign out?", "Your progress stays on this device and will be here when you sign back in.", "Sign out")
        .then(function (ok) {
          if (!ok) return;
          Auth.signOut();
          mode = "pick"; error = "";
          App.render();
          UI.toast("Signed out", "ok");
        });
      return true;
    }

    return false;
  }

  function reset() { mode = "pick"; error = ""; busy = false; }

  return { render: render, handle: handle, reset: reset };
})();
