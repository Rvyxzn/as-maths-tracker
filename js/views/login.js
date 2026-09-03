/* ============================================================
   Login, create an account or sign in
   ------------------------------------------------------------
   Two modes, decided by whether Supabase is configured:

     cloud   email and password, or Google. Your progress follows
             you between your PC, laptop and phone.
     local   profiles on this device only, no account. The
             fallback when there is no backend to talk to, and
             honest about what it cannot do.
   ============================================================ */

const LoginView = (function () {

  let mode = null;         // signin | signup | reset | pick | create | unlock
  let unlockId = null;
  let error = "";
  let notice = "";
  let busy = false;

  /* Maths is not optional: it is the only subject this tracker has content
     for. The rest are recorded so the account knows what you take, ready for
     when other subjects are tracked too. */
  const SUBJECTS = [
    { id: "maths", label: "Maths", required: true },   // the tracker opens on Maths
    { id: "further-maths", label: "Further Maths" },
    { id: "physics", label: "Physics" },
    { id: "chemistry", label: "Chemistry" },
    { id: "biology", label: "Biology" },
    { id: "economics", label: "Economics" },
    { id: "geography", label: "Geography" },
    { id: "computer-science", label: "Computer Science" },
    { id: "psychology", label: "Psychology" },
    { id: "history", label: "History" }
  ];

  function cloud() { return Cloud.configured(); }

  function defaultMode() {
    if (cloud()) return "signin";
    return Auth.profiles().length ? "pick" : "create";
  }

  function render(root) {
    if (!mode) mode = defaultMode();
    const list = Auth.profiles();

    root.innerHTML =
      '<div class="login-wrap">' +
        '<div class="login-card">' +
          '<div class="login-brand">' +
            '<div class="brand-mark login-mark" data-subject="' + Subjects.currentId() + '">' +
              Subjects.markHtml() + '</div>' +
            '<div><div class="login-title">Revision Tracker</div>' +
              '<div class="login-sub">' + UI.esc(Subjects.list().map(function (x) { return x.short; }).join(" · ")) + '</div></div>' +
          '</div>' +

          (error  ? '<div class="warnbox bad login-error">' + UI.esc(error) + '</div>' : "") +
          (notice ? '<div class="warnbox info login-error">' + notice + '</div>' : "") +

          body(list) +
          footerNote() +
        '</div>' +
      '</div>';

    mount(root);
  }

  function body(list) {
    /* The device-profile screens are reachable in both modes: with accounts
       on they are the way back to progress saved before you had one. */
    if (mode === "pick")   return pickForm(list) + backToAccounts();
    if (mode === "create") return createForm(list) + backToAccounts();
    if (mode === "unlock") return unlockForm();
    if (cloud()) {
      if (mode === "signup") return signUpForm();
      if (mode === "reset")  return resetForm();
      return signInForm();
    }
    return pickForm(list);
  }

  function backToAccounts() {
    if (!cloud()) return "";
    return '<button class="btn btn-ghost btn-sm btn-block" data-action="login-mode" data-mode="signin" ' +
      'style="margin-top:14px">Back to signing in with an account</button>';
  }

  /* ---------- cloud: sign in ---------- */
  function signInForm() {
    return '<h1 class="login-h">Sign in</h1>' +
      '<p class="login-p">Your ratings, plan and past papers follow you between devices.</p>' +

      '<div class="field"><label class="label">Email</label>' +
        '<input class="input" id="liEmail" type="email" autocomplete="email" placeholder="you@example.com"></div>' +
      '<div class="field"><label class="label">Password</label>' +
        '<input class="input" id="liPass" type="password" autocomplete="current-password"></div>' +

      '<button class="btn btn-primary btn-block" data-action="cloud-signin"' + (busy ? " disabled" : "") + '>' +
        (busy ? "Signing in…" : "Sign in") + '</button>' +

      '<div class="row" style="margin-top:10px;justify-content:space-between">' +
        '<button class="btn btn-ghost btn-sm" data-action="login-mode" data-mode="signup">Create an account</button>' +
        '<button class="btn btn-ghost btn-sm" data-action="login-mode" data-mode="reset">Forgot password</button>' +
      '</div>' +

      googleBlock() +

      /* Device profiles must stay reachable with accounts switched on, or
         progress saved before you had an account becomes unopenable, and the
         app stops working at all when the server is unreachable. */
      (Auth.profiles().filter(function (p) { return p.provider !== "cloud"; }).length
        ? '<button class="btn btn-ghost btn-sm btn-block" data-action="login-mode" data-mode="pick" ' +
            'style="margin-top:14px">Use a profile on this device instead</button>'
        : "");
  }

  /* ---------- cloud: sign up ---------- */
  function signUpForm() {
    return '<h1 class="login-h">Create your account</h1>' +
      '<p class="login-p">One account, all your devices. No more exporting and importing.</p>' +

      '<div class="field"><label class="label">Your name</label>' +
        '<input class="input" id="suName" placeholder="e.g. Rayan" autocomplete="name"></div>' +
      '<div class="field"><label class="label">Email</label>' +
        '<input class="input" id="suEmail" type="email" autocomplete="email" placeholder="you@example.com"></div>' +
      '<div class="field"><label class="label">Password</label>' +
        '<input class="input" id="suPass" type="password" autocomplete="new-password" placeholder="At least 6 characters"></div>' +
      '<div class="field"><label class="label">Confirm password</label>' +
        '<input class="input" id="suPass2" type="password" autocomplete="new-password"></div>' +

      '<div class="field"><label class="label">Your A-level subjects</label>' +
        '<div class="subject-grid">' +
          SUBJECTS.map(function (s) {
            return '<label class="subject-chip' + (s.required ? " req" : "") + '">' +
              '<input type="checkbox" data-subject="' + s.id + '"' +
                (s.required ? " checked disabled" : "") + '>' +
              '<span>' + UI.esc(s.label) + '</span></label>';
          }).join("") +
        '</div>' +
        '<div class="tiny faint" style="margin-top:7px">' +
          UI.esc(Subjects.list().map(function (x) { return x.name.replace(/^A-Level /, ""); }).join(", ")) +
          ' are tracked in full, with their specifications built in. The rest are saved to your account so it ' +
          'knows your workload, and are not tracked yet.</div></div>' +

      '<div class="field"><label class="label">Exam date</label>' +
        '<input class="input" id="suExam" type="date" value="' + UI.esc(Store.settings().examDate) + '"></div>' +

      '<button class="btn btn-primary btn-block" data-action="cloud-signup"' + (busy ? " disabled" : "") + '>' +
        (busy ? "Creating…" : "Create account") + '</button>' +
      '<button class="btn btn-ghost btn-block" data-action="login-mode" data-mode="signin" ' +
        'style="margin-top:8px">I already have an account</button>' +

      googleBlock();
  }

  /* ---------- cloud: password reset ---------- */
  function resetForm() {
    return '<h1 class="login-h">Reset your password</h1>' +
      '<p class="login-p">We will email you a link to set a new one.</p>' +
      '<div class="field"><label class="label">Email</label>' +
        '<input class="input" id="rsEmail" type="email" autocomplete="email"></div>' +
      '<button class="btn btn-primary btn-block" data-action="cloud-reset"' + (busy ? " disabled" : "") + '>' +
        (busy ? "Sending…" : "Send reset link") + '</button>' +
      '<button class="btn btn-ghost btn-block" data-action="login-mode" data-mode="signin" ' +
        'style="margin-top:8px">Back to sign in</button>';
  }

  /* ---------- local profiles (no backend configured) ---------- */
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
              '<small>' + (p.provider === "cloud" ? UI.esc(p.email || "Account") : "On this device") +
                (kb ? " · " + kb + " KB saved" : " · no progress yet") +
                (p.passcodeHash ? " · 🔒 passcode" : "") + '</small>' +
            '</span><span class="profile-go">→</span></button>';
        }).join("") +
      '</div>' +
      '<button class="btn btn-block" data-action="login-mode" data-mode="create" style="margin-top:12px">' +
        '+ New profile</button>';
  }

  function createForm(list) {
    const first = !list.length;
    const legacy = Auth.hasLegacySave();
    return '<h1 class="login-h">' + (first ? "Set up your profile" : "New profile") + '</h1>' +
      '<p class="login-p">' + (first
        ? "This names the save file on this device."
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

  function unlockForm() {
    const p = Auth.findProfile(unlockId);
    if (!p) { mode = "pick"; return pickForm(Auth.profiles()); }
    return '<h1 class="login-h">' + UI.esc(p.name) + '</h1>' +
      '<p class="login-p">This profile has a passcode.</p>' +
      '<div class="field"><label class="label">Passcode</label>' +
        '<input class="input" id="loginPass" type="password" autocomplete="current-password"></div>' +
      '<button class="btn btn-primary btn-block" data-action="login-unlock"' + (busy ? " disabled" : "") + '>' +
        (busy ? "Checking…" : "Unlock") + '</button>' +
      '<button class="btn btn-ghost btn-block" data-action="login-mode" data-mode="pick" ' +
        'style="margin-top:8px">Back</button>';
  }

  /* ---------- Google ---------- */
  function googleBlock() {
    if (cloud()) {
      return '<div class="login-or"><span>or</span></div>' +
        '<button class="btn btn-block" data-action="cloud-google">' +
          googleGlyph() + 'Continue with Google</button>';
    }
    if (googleConfigured()) {
      return '<div class="login-or"><span>or</span></div>' +
        '<div id="googleBtn" class="google-host"></div>';
    }
    return "";
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
    if (cloud()) {
      return '<div class="login-foot">' +
        '<b>Your progress syncs to your account</b>' +
        'Saved on this device first so it keeps working offline, then synced when you are back online. ' +
        'Sign in on any device to pick up where you left off.' +
        '</div>';
    }
    return '<div class="login-foot">' +
      '<b>This device only</b>' +
      'Cloud accounts are not set up yet, so progress stays in this browser and does not sync between ' +
      'devices. Add a Supabase URL and anon key to <code>js/auth-config.js</code> to turn syncing on; ' +
      'the steps are in <code>SUPABASE.md</code>. Until then, use Settings › Export to move your progress.' +
      '</div>';
  }

  function avatar(p) {
    if (p.picture) return '<img class="profile-av" src="' + UI.esc(p.picture) + '" alt="" referrerpolicy="no-referrer">';
    return '<span class="profile-av profile-av-i">' + UI.esc((p.name || "?").trim().charAt(0).toUpperCase()) + '</span>';
  }

  /* ---------- wiring ---------- */
  function mount(root) {
    const host = root.querySelector("#googleBtn");
    if (host && googleConfigured() && !cloud()) {
      Auth.renderGoogleButton(host, function () { error = ""; afterSignIn(); },
        function (e) { error = e.message || "Google sign-in failed"; App.render(); });
    }
    const firstInput = root.querySelector("input:not([disabled])");
    if (firstInput) firstInput.focus();

    root.querySelectorAll("input").forEach(function (el) {
      el.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const submit = { signin: "cloud-signin", signup: "cloud-signup", reset: "cloud-reset",
                         create: "login-create", unlock: "login-unlock" }[mode];
        if (submit) handle(submit, el);
      });
    });
  }

  function afterSignIn() {
    Store.reloadForUser();
    mode = null; error = ""; notice = ""; busy = false;
    App.go("dashboard");
    const u = Auth.current();
    UI.toast("Signed in as " + (u ? u.name : "user"), "ok");
  }

  /* Signing into a cloud account has a second step: reconciling this
     device's copy with whatever is already on the server. */
  function afterCloudSignIn(user) {
    Auth.adoptCloudUser(user);
    Store.reloadForUser();
    mode = null; error = ""; notice = ""; busy = false;
    App.go("dashboard");

    /* Signing into a fresh account on a device that already has work saved
       under a device profile. That work is not visible from a cloud account,
       so offer to bring it in rather than leaving it stranded. */
    const incoming = Sync.bundleWork(Sync.collectBundle());
    const local = Auth.localProfilesWithData();
    if (incoming === 0 && local.length) {
      offerLocalImport(local, user);
      return;
    }

    Sync.pullOnSignIn(user.id).then(function (r) {
      if (r.action === "conflict") return askConflict(r);
      if (r.action === "pulled") {
        App.render();
        UI.toast("Signed in. Your progress was restored from your account.", "ok", 5000);
      } else if (r.action === "seeded") {
        UI.toast("Signed in. This device's progress is now saved to your account.", "ok", 5000);
      } else if (r.action === "error") {
        UI.toast("Signed in, but syncing failed: " + r.error, "bad", 7000);
      } else {
        UI.toast("Signed in as " + (Auth.current() || {}).name, "ok");
      }
    });
  }

  /* Existing device progress, and a brand new account. Ask before moving it:
     it is the user's work, and silently hoovering it into an account is as
     wrong as silently leaving it behind. */
  function offerLocalImport(local, user) {
    const p = local[0];
    const stateDoc = (function () {
      try { return JSON.parse(localStorage.getItem("as-maths-tracker-v1::" + p.id) || "null"); }
      catch (e) { return null; }
    })();
    const summary = stateDoc ? Sync.describe(stateDoc) : Math.round(p.size / 1024) + " KB";

    UI.modal({
      title: "Bring your existing progress into this account?",
      body:
        '<p class="muted" style="margin-top:0">This device already has progress saved under the profile ' +
        '<b>' + UI.esc(p.name) + '</b>, from before you had an account.</p>' +
        '<div class="card" style="margin:0 0 14px"><b>' + UI.esc(p.name) + '</b>' +
          '<div class="tiny muted" style="margin-top:6px">' + UI.esc(summary) + '</div></div>' +
        '<div class="tiny faint">Copied, not moved: the ' + UI.esc(p.name) + ' profile keeps its own copy either way. ' +
        'Once copied it syncs to your account and follows you to your other devices.</div>',
      footer:
        '<button class="btn" data-skip>Start fresh</button>' +
        '<button class="btn btn-primary" data-bring>Bring it in</button>',
      onMount: function (box) {
        const finish = function (r) {
          UI.closeModal();
          App.render();
          if (r === "brought") UI.toast("Your progress is now in your account and syncing", "ok", 5000);
        };
        box.querySelector("[data-skip]").onclick = function () {
          Sync.pullOnSignIn(user.id).then(function () { finish("fresh"); });
        };
        box.querySelector("[data-bring]").onclick = function () {
          const cur = Auth.current();
          if (cur && Auth.copyProfileData(p.id, cur.id)) {
            Store.reloadForUser();
            Sync.pushNow().then(function () { finish("brought"); });
          } else {
            UI.toast("Could not copy that profile", "bad");
            finish("fresh");
          }
        };
      }
    });
  }

  /* Both sides have work and they are not the same write. Never pick for
     them: show what each copy holds and let them choose. */
  function askConflict(r) {
    UI.modal({
      title: "Two copies of your progress",
      wide: true,
      body:
        '<p class="muted" style="margin-top:0">This device and your account both have work saved, and they are ' +
        'not the same. Choose which to keep. The other is not deleted: it is exported to a file first.</p>' +
        '<div class="grid g2" style="gap:12px">' +
          '<div class="card"><b>On this device</b>' +
            '<div class="tiny muted" style="margin-top:6px">' + UI.esc(Sync.describeBundle(Sync.collectBundle())) + '</div>' +
            '<button class="btn btn-primary btn-block" style="margin-top:12px" data-keep="local">Keep this device\'s</button>' +
          '</div>' +
          '<div class="card"><b>In your account</b>' +
            '<div class="tiny muted" style="margin-top:6px">' + UI.esc(Sync.describeBundle(r.remoteState)) + '<br>' +
              'last saved on ' + UI.esc(r.remoteDevice) + ', ' + Metrics.fmtDate(r.remoteUpdatedAt) + '</div>' +
            '<button class="btn btn-primary btn-block" style="margin-top:12px" data-keep="remote">Keep the account\'s</button>' +
          '</div>' +
        '</div>',
      footer: '',
      onMount: function (box) {
        box.querySelectorAll("[data-keep]").forEach(function (b) {
          b.onclick = function () {
            const keep = b.dataset.keep;
            /* Export the copy that is about to be replaced, so a wrong click
               here is recoverable rather than final. */
            SettingsView.exportSnapshot(keep === "local" ? r.remoteState : Sync.collectBundle(),
              keep === "local" ? "account-copy" : "this-device-copy");
            if (keep === "remote") Sync.adopt(r.remoteState, r.remoteUpdatedAt);
            else Sync.pushNow();
            UI.closeModal();
            App.render();
            UI.toast(keep === "remote"
              ? "Using your account's copy. The device copy was downloaded as a backup."
              : "Using this device's copy. The account copy was downloaded as a backup.", "ok", 6000);
          };
        });
      }
    });
  }

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function handle(action, el) {
    if (action === "login-mode") {
      mode = el.dataset.mode; error = ""; notice = ""; busy = false; App.render(); return true;
    }

    /* ---- cloud ---- */
    if (action === "cloud-signin") {
      const email = val("liEmail"), pass = val("liPass");
      if (!email || !pass) { error = "Enter your email and password"; App.render(); return true; }
      busy = true; error = ""; App.render();
      Cloud.signIn(email, pass)
        .then(afterCloudSignIn)
        .catch(function (e) { busy = false; error = e.message; App.render(); });
      return true;
    }

    if (action === "cloud-signup") {
      const name = val("suName"), email = val("suEmail");
      const pass = val("suPass"), pass2 = val("suPass2");
      if (!name)  { error = "Enter your name"; App.render(); return true; }
      if (!email) { error = "Enter your email"; App.render(); return true; }
      if (pass.length < 6) { error = "Your password needs to be at least 6 characters"; App.render(); return true; }
      if (pass !== pass2)  { error = "The two passwords do not match"; App.render(); return true; }

      const subjects = [...document.querySelectorAll("[data-subject]")]
        .filter(function (c) { return c.checked; })
        .map(function (c) { return c.dataset.subject; });
      const exam = val("suExam");

      busy = true; error = ""; App.render();
      Cloud.signUp(email, pass, { name: name, subjects: subjects })
        .then(function (res) {
          /* Carry the answers from this form into the tracker itself. */
          Store.mutate(function (s) {
            s.settings.studentName = name;
            if (exam) s.settings.examDate = exam;
          }, { immediate: true });

          if (res.needsConfirmation) {
            busy = false; mode = "signin";
            notice = "<b>Check your email</b>Confirm your address using the link we sent to " +
                     UI.esc(email) + ", then sign in.";
            App.render();
            return;
          }
          return Cloud.currentUser().then(function (u) { if (u) afterCloudSignIn(u); });
        })
        .catch(function (e) { busy = false; error = e.message; App.render(); });
      return true;
    }

    if (action === "cloud-google") {
      busy = true; error = ""; App.render();
      /* Redirects away to Google; the session is picked up on the way back
         by App.boot, so there is nothing to resolve here. */
      Cloud.signInWithGoogle()
        .catch(function (e) { busy = false; error = e.message; App.render(); });
      return true;
    }

    if (action === "cloud-reset") {
      const email = val("rsEmail");
      if (!email) { error = "Enter your email"; App.render(); return true; }
      busy = true; error = ""; App.render();
      Cloud.resetPassword(email).then(function () {
        busy = false; mode = "signin";
        notice = "<b>Reset link sent</b>Check " + UI.esc(email) + " for a link to set a new password.";
        App.render();
      }).catch(function (e) { busy = false; error = e.message; App.render(); });
      return true;
    }

    /* ---- local profiles ---- */
    if (action === "login-pick") {
      const p = Auth.findProfile(el.dataset.id);
      if (!p) return true;
      if (p.passcodeHash) { unlockId = p.id; mode = "unlock"; error = ""; App.render(); return true; }
      Auth.signInLocal(p.id).then(afterSignIn)
        .catch(function (e) { error = e.message; App.render(); });
      return true;
    }

    if (action === "login-create") {
      const first = !Auth.profiles().length;
      const nameEl = document.getElementById("loginName");
      const passEl = document.getElementById("loginPass");
      busy = true; error = ""; App.render();
      Auth.createLocal(nameEl ? nameEl.value : "", passEl ? passEl.value : "")
        .then(function (p) {
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
      UI.confirm("Sign out?",
        Auth.isCloud()
          ? "Your progress is saved to your account and will be here when you sign back in."
          : "Your progress stays on this device and will be here when you sign back in.",
        "Sign out").then(function (ok) {
        if (!ok) return;
        /* Push anything outstanding before letting go of the session. */
        const done = Auth.isCloud() ? Sync.pushNow() : Promise.resolve();
        done.then(function () {
          if (Auth.isCloud()) Cloud.signOut();
          Sync.clearMeta();
          Auth.signOut();
          mode = null; error = ""; notice = "";
          App.render();
          UI.toast("Signed out", "ok");
        });
      });
      return true;
    }

    return false;
  }

  function reset() { mode = null; error = ""; notice = ""; busy = false; }

  return { render: render, handle: handle, reset: reset, SUBJECTS: SUBJECTS };
})();
