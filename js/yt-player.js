/* ============================================================
   YtPlayer — the chapter playlist, with working episode skipping.

   WHY THIS EXISTS RATHER THAN A PLAIN <iframe>:
   A playlist embed (…/embed/videoseries?list=PL…) always starts at the
   first video. The `index` URL parameter that everyone reaches for is not
   in Google's documented player parameters, and testing it here confirmed
   it does nothing — the src said index=5 and the player still loaded
   video 1. Sending playVideoAt over postMessage to a bare iframe does not
   work either, because the player only accepts commands after the API
   handshake.

   So this loads the official IFrame Player API and drives a real player
   object, where playVideoAt() IS documented and does work. Note the API
   is 0-based while the app numbers episodes from 1.

   The host element is treated as an opaque leaf by the DOM morph (see
   isOpaque in ui.js), so re-rendering the chapter never tears the player
   down mid-video.
   ============================================================ */

const YtPlayer = (function () {

  const players = new WeakMap();   // host element -> { player, list, ready, pending }
  let apiPromise = null;
  let metaHandler = null;          // told the real episode count and durations

  /* Pass the facts the player knows back to the app: how many videos the
     playlist really has, which one is showing, and how long it is. These
     replace estimates with measured values. */
  function onMeta(fn) { metaHandler = fn; }

  function report(host, player) {
    if (!metaHandler || !player) return;
    let count = null, index = null, seconds = null;
    try { const pl = player.getPlaylist(); if (pl) count = pl.length; } catch (e) {}
    try { const i = player.getPlaylistIndex(); if (i >= 0) index = i + 1; } catch (e) {}
    try { const d = player.getDuration(); if (d > 0) seconds = d; } catch (e) {}
    /* remember where the player actually is, so a later render does not
       "correct" it and restart playback */
    const st = players.get(host);
    if (st && index != null) st.episode = index;
    if (count == null && seconds == null) return;
    try { metaHandler({ host: host, count: count, episode: index, seconds: seconds }); }
    catch (e) {}
  }

  /* Load https://www.youtube.com/iframe_api once, resolving when YT is up. */
  function ensureApi() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (apiPromise) return apiPromise;
    apiPromise = new Promise(function (resolve, reject) {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (typeof prev === "function") { try { prev(); } catch (e) {} }
        resolve();
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = function () { reject(new Error("Could not load the YouTube player")); };
      document.head.appendChild(s);
      /* If the network blocks it, fail rather than hang forever — the
         caller falls back to a plain embed and the YouTube link. */
      setTimeout(function () { reject(new Error("YouTube player timed out")); }, 12000);
    });
    return apiPromise;
  }

  function mount(host) {
    if (!host) return;
    const list = host.dataset.list || "";
    const video = host.dataset.video || "";
    const ep = Math.max(1, parseInt(host.dataset.ep || "1", 10));
    const existing = players.get(host);

    /* Already showing this playlist. Only move if the episode actually
       changed — mountAll() runs after EVERY app render, and playVideoAt()
       starts playback, so calling it unconditionally made the video burst
       into life whenever you ticked a question or opened a mark scheme. */
    if (existing && existing.list === (list || video)) { playAt(host, ep); return; }

    host.classList.add("ytp-host");
    const slot = document.createElement("div");
    host.innerHTML = "";
    host.appendChild(slot);

    ensureApi().then(function () {
      const vars = { rel: 0, playsinline: 1 };
      const opts = {
        width: "100%", height: "100%", playerVars: vars,
        events: {
          onReady: function (e) {
            const st = players.get(host);
            if (!st) return;
            st.ready = true;
            if (st.pending && st.pending > 1) {
              try { e.target.playVideoAt(st.pending - 1); st.episode = st.pending; } catch (err) {}
              st.pending = null;
            } else if (st.episode == null) {
              st.episode = 1;
            }
            report(host, e.target);
          },
          /* Every time a video loads the player knows its real length and
             the playlist's real size — both things we would otherwise be
             guessing at. Hand them to whoever is listening. */
          onStateChange: function (e) { report(host, e.target); }
        }
      };
      if (list) { opts.playerVars.listType = "playlist"; opts.playerVars.list = list; }
      else if (video) { opts.videoId = video; }

      let player;
      try { player = new YT.Player(slot, opts); }
      catch (e) { fallback(host, list, video); return; }

      players.set(host, { player: player, list: list || video, ready: false, pending: ep });
    }).catch(function () {
      fallback(host, list, video);
    });
  }

  /* No API available (offline, blocked): a plain embed still plays the
     playlist from the start, and the view offers a direct YouTube link. */
  function fallback(host, list, video) {
    const src = list
      ? "https://www.youtube.com/embed/videoseries?list=" + encodeURIComponent(list) + "&rel=0"
      : "https://www.youtube.com/embed/" + encodeURIComponent(video) + "?rel=0";
    host.innerHTML = '<iframe src="' + src + '" title="Chapter playlist" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
      'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    players.set(host, { player: null, list: list || video, ready: false, pending: null, failed: true });
  }

  /* episode is 1-based here; the API is 0-based.
     Never re-issue a jump for the episode already loaded: playVideoAt()
     also starts playback, so a redundant call is heard as the video
     randomly starting on its own. */
  function playAt(host, episode) {
    const st = players.get(host);
    if (!st) return false;
    host.dataset.ep = String(episode);
    if (st.failed) return false;
    if (st.episode === episode) return true;          // already there; leave it alone
    if (!st.ready || !st.player || !st.player.playVideoAt) { st.pending = episode; return false; }
    try { st.player.playVideoAt(episode - 1); st.episode = episode; return true; }
    catch (e) { st.pending = episode; return false; }
  }

  function playAtSelector(sel, episode) {
    const host = document.querySelector(sel || ".ytp");
    return host ? playAt(host, episode) : false;
  }

  /* how many videos the playlist actually contains, once known */
  function playlistLength(host) {
    const st = players.get(host);
    if (!st || !st.player || !st.ready || !st.player.getPlaylist) return null;
    try { const p = st.player.getPlaylist(); return p ? p.length : null; }
    catch (e) { return null; }
  }

  function mountAll(root) {
    (root || document).querySelectorAll(".ytp").forEach(function (el) { mount(el); });
  }

  return { mount: mount, mountAll: mountAll, playAt: playAt, onMeta: onMeta,
           playAtSelector: playAtSelector, playlistLength: playlistLength };
})();
