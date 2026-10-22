(() => {
  "use strict";

  /* ═══════════════════════════════════════════════════════════════
     DEMOS — edit this list.

     To add a video: drop the file in /demos and set `src`.
     While `src` is empty, the player shows a "coming soon" screen.

       id        used in the URL: demos.html#zyro
       title     shown in the playlist and info pane
       file      name shown in the title bar (cosmetic)
       src       path to the video, e.g. "demos/zyro.mp4"  ← add later
       poster    optional still image (thumbnail + frame before play)
       duration  optional "2:14" — otherwise read from the file
       glyph     2 letters shown when there's no poster
       accent    glyph colour
       kind      short label under the title
       summary   one or two sentences
       stack     tech chips
       chapters  optional: [{ t: "0:00", label: "..." }, { t: 42, label: "..." }]
       links     [{ label, href }]  — http links open in a new tab
     ═══════════════════════════════════════════════════════════════ */
  const DEMOS = [
    {
      id: "lumen",
      title: "Lumen Dental",
      file: "lumen.mp4",
      src: "demos/lumen.mp4",
      poster: "demos/lumen.jpg",
      glyph: "lu",
      accent: "#c5f04a",
      kind: "web · clinic system",
      summary: "A dental clinic platform in two halves: a patient website with online booking and digital tickets, and a front-desk system with a live dashboard, check-in queue, calendar, patient records, payments and a lobby display. Templates re-skin the whole product for other clinics.",
      stack: [],
      chapters: [
        { t: "0:02", label: "patient website" },
        { t: "0:09", label: "online booking" },
        { t: "0:23", label: "staff login" },
        { t: "0:25", label: "live dashboard" },
        { t: "0:29", label: "check-in & queue" },
        { t: "0:35", label: "calendar & tickets" },
        { t: "0:41", label: "patients & desk booking" },
        { t: "0:48", label: "payments" },
        { t: "0:51", label: "treatments & working hours" },
        { t: "0:56", label: "white-label templates" },
        { t: "1:01", label: "lobby display" },
      ],
      links: [],
    },
    {
      id: "regsystem",
      title: "University Registration System",
      file: "regsystem.mp4",
      src: "demos/regsystem.mp4",
      poster: "demos/regsystem.jpg",
      glyph: "rg",
      accent: "#c49bff",
      kind: "web · contract",
      summary: "Course registration for Ajloun National University, built under contract: a bilingual Arabic / English student portal with AI course recommendations, waitlists, an interactive study plan and exception requests. Supabase backend.",
      stack: ["Supabase", "PostgreSQL", "AI-assisted"],
      chapters: [
        { t: "0:02", label: "university website" },
        { t: "0:06", label: "student portal" },
        { t: "0:07", label: "dashboard" },
        { t: "0:10", label: "Arabic / English" },
        { t: "0:13", label: "AI recommendations" },
        { t: "0:16", label: "waitlists" },
        { t: "0:19", label: "filters" },
        { t: "0:22", label: "courses sheet" },
        { t: "0:25", label: "schedule & history" },
        { t: "0:28", label: "study plan" },
        { t: "0:34", label: "exception requests" },
      ],
      links: [
        { label: "work history →", href: "index.html#ws-log" },
        { label: "repo ↗", href: "https://github.com/sardeq/AJU-RegSystem" },
      ],
    },
    {
      id: "zyro",
      title: "Zyro Browser",
      file: "zyro.mp4",
      src: "",
      poster: "zyro_logo.png",
      glyph: "zy",
      accent: "#c5f04a",
      kind: "desktop · C++ / CEF",
      summary: "A desktop web browser written from scratch in C++ — multi-process on the Chromium Embedded Framework, with a V8 IPC bridge between the browser UI and native code.",
      stack: ["C++", "CEF", "GTK3", "V8", "CMake"],
      chapters: [],
      links: [
        { label: "project notes →", href: "index.html#p-zyro" },
        { label: "source (v1) ↗", href: "https://github.com/sardeq/Zyro-Browser-old" },
      ],
    },
    {
      id: "boombx",
      title: "BoomBx",
      file: "boombx.mp4",
      src: "",
      poster: "boom_logo.png",
      glyph: "bx",
      accent: "#ff7a59",
      kind: "desktop · audio",
      summary: "A soundboard and audio router. Clips play through a virtual microphone, so they land in any voice chat or call.",
      stack: ["C#", ".NET 8", "AvaloniaUI", "WASAPI"],
      chapters: [],
      links: [
        { label: "project notes →", href: "index.html#p-boombx" },
        { label: "source ↗", href: "https://github.com/sardeq/BoomBx" },
      ],
    },
    {
      id: "workmint",
      title: "Workmint",
      file: "workmint.mp4",
      src: "",
      poster: "",
      glyph: "wm",
      accent: "#7cc4ff",
      kind: "web · marketplace",
      summary: "A freelance marketplace that covers the whole job: freelancers list services, clients order, admins approve — with revisions and escrow payments built in.",
      stack: ["React", "React Router", "Express", "PostgreSQL"],
      chapters: [],
      links: [
        { label: "project notes →", href: "index.html#p-workmint" },
        { label: "frontend ↗", href: "https://github.com/sardeq/workmint-frontend" },
        { label: "backend ↗", href: "https://github.com/sardeq/workmint-backend" },
      ],
    },
  ];

  const NEXT_DELAY = 6;                       // seconds before the next demo auto-plays
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  /* ─────────────────────────────────────────────────────────────── */

  const $ = id => document.getElementById(id);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const player = $("player"), stage = $("stage"), video = $("video");
  const el = {
    path: $("playerPath"), barTitle: $("barTitle"),
    emptyPoster: $("emptyPoster"), emptyText: $("emptyText"), emptyLinks: $("emptyLinks"),
    errBox: $("stageError"), errText: $("errText"),
    big: $("bigPlay"), spin: $("spin"), osd: $("osd"),
    end: $("stageEnd"), replay: $("replayBtn"), next: $("nextBtn"), nextTitle: $("nextTitle"), cancel: $("cancelNext"),
    seek: $("seek"), buf: $("seekBuf"), fill: $("seekFill"), marks: $("seekMarks"), thumb: $("seekThumb"),
    tip: $("seekTip"), tipTime: $("tipTime"), tipLabel: $("tipLabel"),
    play: $("playBtn"), prev: $("prevBtn"), nextCtrl: $("nextCtrl"),
    mute: $("muteBtn"), vol: $("volRange"), cur: $("tCur"), dur: $("tDur"), chap: $("ctrlChap"),
    speed: $("speedBtn"), pip: $("pipBtn"), fs: $("fsBtn"),
    info: $("info"), infoPath: $("infoPath"), infoTags: $("infoTags"), infoTitle: $("infoTitle"),
    infoSummary: $("infoSummary"), infoStack: $("infoStack"), infoLinks: $("infoLinks"),
    infoChapters: $("infoChapters"), chapList: $("chapList"),
    list: $("plList"), count: $("plCount"),
  };
  if (!stage || !video || !DEMOS.length) return;

  /* ── helpers ── */
  const pad = n => String(n).padStart(2, "0");
  const fmt = s => {
    if (!isFinite(s) || s < 0) s = 0;
    s = Math.floor(s);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
  };
  const spoken = s => {
    s = Math.floor(s || 0);
    const m = Math.floor(s / 60), sec = s % 60;
    return (m ? `${m} minute${m > 1 ? "s" : ""} ` : "") + `${sec} second${sec !== 1 ? "s" : ""}`;
  };
  const toSec = t => {
    if (typeof t === "number") return t;
    return String(t).split(":").reduce((a, p) => a * 60 + (parseFloat(p) || 0), 0);
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const h = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "style") n.style.cssText = v;
      else n.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach(k => k != null && n.append(k));
    return n;
  };
  const isExternal = href => /^https?:/i.test(href);
  const linkAttrs = href => (isExternal(href) ? { href, target: "_blank", rel: "noopener" } : { href });
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  DEMOS.forEach(d => {
    d.chapters = (d.chapters || []).map(c => ({ t: toSec(c.t), label: c.label })).sort((a, b) => a.t - b.t);
  });

  let cur = -1;
  let wantPlay = false;

  /* ── state ── */
  const setState = s => {
    stage.dataset.state = s;
    document.body.classList.toggle("is-playing", s === "playing");
    el.play.setAttribute("aria-label", s === "playing" ? "Pause (space)" : "Play (space)");
    if (s !== "playing") showControls();
  };
  const setLoading = on => stage.classList.toggle("is-loading", on);

  /* spinner — braille frames, like a terminal */
  const FRAMES = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
  let spinI = 0;
  setInterval(() => {
    if (stage.classList.contains("is-loading")) el.spin.textContent = FRAMES[spinI++ % FRAMES.length];
  }, 80);

  /* ── OSD ── */
  let osdTimer;
  const osd = html => {
    el.osd.innerHTML = html;
    el.osd.classList.add("is-on");
    clearTimeout(osdTimer);
    osdTimer = setTimeout(() => el.osd.classList.remove("is-on"), 1100);
  };

  /* ── controls auto-hide ── */
  let idleTimer;
  let pointerInCtrl = false;
  const showControls = () => {
    stage.classList.remove("is-idle");
    clearTimeout(idleTimer);
  };
  const kick = (delay = 2400) => {
    showControls();
    if (stage.dataset.state !== "playing") return;
    idleTimer = setTimeout(() => {
      if (!pointerInCtrl && !el.seek.classList.contains("is-drag") && stage.dataset.state === "playing") {
        stage.classList.add("is-idle");
      }
    }, delay);
  };

  /* ── playlist ── */
  const items = DEMOS.map((d, i) => {
    const thumb = h("span", { class: "pl__thumb", style: `--c:${d.accent || "var(--acc)"}` },
      d.poster
        ? h("img", { src: d.poster, alt: "", loading: "lazy", decoding: "async" })
        : h("span", { class: "pl__glyph", text: d.glyph || d.title.slice(0, 2).toLowerCase() }),
      h("span", { class: "pl__eq", "aria-hidden": "true" }, h("i"), h("i"), h("i")),
      h("span", {
        class: "pl__badge" + (d.src ? "" : " pl__badge--soon"),
        text: d.src ? (d.duration || "") : "soon",
      }),
    );
    const btn = h("button", { class: "pl__item" + (d.src ? "" : " is-soon"), type: "button", "data-i": i },
      thumb,
      h("span", { class: "pl__text" },
        h("span", { class: "pl__idx", text: pad(i + 1) + (d.src ? "" : " · not recorded yet") }),
        h("span", { class: "pl__title", text: d.title }),
        h("span", { class: "pl__sub", text: d.kind || "" }),
      ),
    );
    btn.addEventListener("click", () => {
      if (i === cur) { toggle(); return; }
      load(i, { autoplay: true });
      if (matchMedia("(max-width: 960px)").matches) {
        player.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
    el.list.append(h("li", {}, btn));
    return btn;
  });
  const ready = DEMOS.filter(d => d.src).length;
  el.count.textContent = `${ready}/${DEMOS.length}`;
  el.count.title = `${ready} of ${DEMOS.length} demos recorded`;

  /* read durations for the playlist badges without loading whole files */
  const probeDurations = () => {
    DEMOS.forEach((d, i) => {
      if (!d.src || d.duration) return;
      const p = document.createElement("video");
      p.preload = "metadata";
      p.muted = true;
      p.addEventListener("loadedmetadata", () => {
        d.duration = fmt(p.duration);
        items[i].querySelector(".pl__badge").textContent = d.duration;
        p.removeAttribute("src"); p.load();
      }, { once: true });
      p.src = d.src;
    });
  };
  if ("requestIdleCallback" in window) requestIdleCallback(probeDurations, { timeout: 2000 });
  else setTimeout(probeDurations, 600);

  /* ── info pane ── */
  const renderInfo = d => {
    el.info.dataset.title = `nvim — ${d.id}/demo.md`;
    el.infoPath.textContent = `~/demos/${d.id}/demo.md`;
    el.infoTags.replaceChildren(
      d.kind ? h("span", { class: "tag", text: d.kind }) : null,
      d.src
        ? h("span", { class: "tag tag--ok", id: "durTag", text: "▶ video" + (d.duration ? ` · ${d.duration}` : "") })
        : h("span", { class: "tag tag--warn", text: "● recording soon" }),
    );
    el.infoTitle.textContent = d.title;
    el.infoSummary.textContent = d.summary || "";
    el.infoStack.replaceChildren(...(d.stack || []).map(s => h("span", { text: s })));
    el.infoLinks.replaceChildren(...(d.links || []).map(l => h("a", { ...linkAttrs(l.href), text: l.label })));

    const hasCh = d.chapters.length > 0;
    el.infoChapters.hidden = !hasCh;
    el.info.querySelector(".info").classList.toggle("has-chapters", hasCh);
    el.chapList.replaceChildren(...d.chapters.map((c, ci) => {
      const b = h("button", { type: "button", "data-ci": ci, disabled: !d.src },
        h("span", { class: "chap__t", text: fmt(c.t) }),
        h("span", { class: "chap__l", text: c.label }));
      b.addEventListener("click", () => {
        seekTo(c.t);
        if (video.paused) play();
        player.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
      });
      return h("li", {}, b);
    }));
  };

  const renderEmpty = d => {
    el.emptyPoster.style.backgroundImage = d.poster ? `url("${d.poster}")` : "";
    el.emptyText.textContent = `I'm recording a walkthrough of ${d.title}. Meanwhile, read the notes or browse the code.`;
    el.emptyLinks.replaceChildren(...(d.links || []).slice(0, 2).map((l, li) =>
      h("a", { class: "btn" + (li === 0 ? " btn--primary" : ""), ...linkAttrs(l.href), text: l.label.replace(/\s*[→↗]$/, "") + (isExternal(l.href) ? " ↗" : " →") })));
  };

  /* ── chapters on the seek bar ── */
  const chapterAt = t => {
    const ch = DEMOS[cur].chapters;
    let found = null;
    for (const c of ch) if (c.t <= t + 0.05) found = c;
    return found;
  };
  const renderMarks = () => {
    const d = DEMOS[cur];
    const D = video.duration;
    el.marks.replaceChildren();
    if (!isFinite(D) || !D) return;
    d.chapters.forEach(c => {
      if (c.t <= 0 || c.t >= D) return;
      el.marks.append(h("i", { style: `left:${(c.t / D) * 100}%` }));
    });
  };
  let lastChap;
  const updateChapter = t => {
    const c = chapterAt(t);
    if (c === lastChap) return;
    lastChap = c;
    el.chap.textContent = c ? c.label : "";
    const ci = c ? DEMOS[cur].chapters.indexOf(c) : -1;
    el.chapList.querySelectorAll("button").forEach((b, i) => b.classList.toggle("is-current", i === ci));
  };

  /* ── progress ── */
  let dragT = null;
  const paint = () => {
    const D = video.duration;
    const t = dragT ?? video.currentTime;
    const p = isFinite(D) && D ? clamp(t / D, 0, 1) : 0;
    el.fill.style.width = p * 100 + "%";
    el.thumb.style.left = p * 100 + "%";
    el.cur.textContent = fmt(t);
    el.seek.setAttribute("aria-valuenow", Math.floor(t));
    el.seek.setAttribute("aria-valuetext", `${spoken(t)} of ${spoken(D)}`);
    updateChapter(t);
  };
  const paintBuffer = () => {
    const D = video.duration, b = video.buffered;
    if (!isFinite(D) || !D || !b.length) { el.buf.style.width = "0"; return; }
    let end = 0;
    for (let i = 0; i < b.length; i++) if (b.start(i) <= video.currentTime + 0.5) end = Math.max(end, b.end(i));
    el.buf.style.width = clamp(end / D, 0, 1) * 100 + "%";
  };
  let raf;
  const loop = () => { paint(); raf = requestAnimationFrame(loop); };

  /* ── playback ── */
  const play = () => {
    const d = DEMOS[cur];
    if (!d || !d.src) return;
    wantPlay = true;
    const p = video.play();
    if (p && p.catch) p.catch(() => { wantPlay = false; setLoading(false); });
  };
  const toggle = () => {
    const s = stage.dataset.state;
    if (s === "empty" || s === "error") return;
    if (video.paused || video.ended) { play(); } else { video.pause(); }
  };
  const seekTo = (t, { fast = false } = {}) => {
    const D = video.duration;
    if (!isFinite(D)) return;
    t = clamp(t, 0, Math.max(0, D - 0.05));
    if (fast && video.fastSeek) video.fastSeek(t); else video.currentTime = t;
    if (stage.dataset.state === "ended") setState("paused");
    paint();
  };
  const nudge = s => {
    if (!isFinite(video.duration)) return;
    seekTo(video.currentTime + s);
    osd(`${s > 0 ? "»" : "«"} <b>${s > 0 ? "+" : ""}${s}s</b>  ${fmt(video.currentTime)} / ${fmt(video.duration)}`);
    kick();
  };

  /* ── countdown to next ── */
  let countTimer;
  const cancelCount = () => {
    clearTimeout(countTimer);
    el.end.classList.remove("is-counting");
  };

  /* ── load a demo ── */
  const load = (i, { autoplay = false, fromHash = false } = {}) => {
    i = clamp(i, 0, DEMOS.length - 1);
    const d = DEMOS[i];
    cancelCount();
    cur = i;
    wantPlay = false;
    lastChap = undefined;

    items.forEach((b, bi) => {
      b.classList.toggle("is-active", bi === i);
      if (bi === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
    el.prev.disabled = i === 0;
    el.nextCtrl.disabled = i === DEMOS.length - 1;

    el.path.textContent = `~/demos/${d.file || d.id}`;
    player.dataset.title = `mpv — ${d.file || d.id}`;
    if (player.classList.contains("is-focus") && el.barTitle) el.barTitle.textContent = player.dataset.title;
    document.title = `${d.title} — Demos — Sadeq Odeh`;
    if (!fromHash && location.hash.slice(1) !== d.id) history.replaceState(null, "", "#" + d.id);

    renderInfo(d);

    video.pause();
    el.errBox.hidden = true;
    el.fill.style.width = el.buf.style.width = el.thumb.style.left = "0";
    el.marks.replaceChildren();
    el.cur.textContent = "0:00";
    el.dur.textContent = d.duration || "0:00";
    el.chap.textContent = "";
    setLoading(false);

    if (!d.src) {
      video.removeAttribute("src");
      video.removeAttribute("poster");
      video.load();
      renderEmpty(d);
      setState("empty");
    } else {
      if (d.poster) video.poster = d.poster; else video.removeAttribute("poster");
      video.src = d.src;
      video.load();
      setState("ready");
      if (autoplay) play();
    }

    if ("mediaSession" in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: d.title, artist: "Sadeq Odeh", album: "Demos",
        artwork: d.poster ? [{ src: new URL(d.poster, location.href).href }] : [],
      });
    }
  };

  const go = step => {
    const n = cur + step;
    if (n < 0 || n >= DEMOS.length) return;
    load(n, { autoplay: !!DEMOS[n].src });
    osd(`${step > 0 ? "▸▸" : "◂◂"} <b>${pad(n + 1)}</b> ${DEMOS[n].title}`);
  };

  /* ── video events ── */
  video.addEventListener("play", () => { setState("playing"); kick(); cancelAnimationFrame(raf); loop(); });
  video.addEventListener("playing", () => { setLoading(false); setState("playing"); kick(); });
  video.addEventListener("pause", () => {
    cancelAnimationFrame(raf); paint(); setLoading(false);
    if (!video.ended && stage.dataset.state !== "empty" && stage.dataset.state !== "error") setState("paused");
  });
  video.addEventListener("waiting", () => setLoading(true));
  video.addEventListener("seeking", () => { if (!video.paused) setLoading(true); });
  ["canplay", "seeked", "loadeddata"].forEach(ev => video.addEventListener(ev, () => { if (!video.paused || ev !== "canplay") setLoading(false); paintBuffer(); }));
  video.addEventListener("progress", paintBuffer);
  video.addEventListener("timeupdate", () => { if (video.paused) paint(); paintBuffer(); });
  video.addEventListener("loadedmetadata", () => {
    const d = DEMOS[cur];
    const D = video.duration;
    el.dur.textContent = fmt(D);
    el.seek.setAttribute("aria-valuemax", Math.floor(D));
    if (!d.duration && isFinite(D)) {
      d.duration = fmt(D);
      items[cur].querySelector(".pl__badge").textContent = d.duration;
      const tag = document.getElementById("durTag");
      if (tag) tag.textContent = `▶ video · ${d.duration}`;
    }
    renderMarks();
    paint();
  });
  video.addEventListener("ended", () => {
    cancelAnimationFrame(raf); paint();
    setState("ended");
    const n = DEMOS[cur + 1];
    el.end.classList.toggle("no-next", !n);
    if (n) {
      el.nextTitle.textContent = n.title;
      if (n.src) {
        el.end.style.setProperty("--count", NEXT_DELAY + "s");
        void el.end.offsetWidth;                      // restart the bar animation
        el.end.classList.add("is-counting");
        countTimer = setTimeout(() => go(1), NEXT_DELAY * 1000);
      }
    }
    (n ? el.next : el.replay).focus({ preventScroll: true });
  });
  video.addEventListener("error", () => {
    const d = DEMOS[cur];
    if (!d || !d.src || !video.getAttribute("src")) return;
    setLoading(false);
    el.errText.textContent = `failed to open ${d.src}`;
    el.errBox.hidden = false;
    setState("error");
  });
  video.addEventListener("volumechange", () => {
    const v = video.muted ? 0 : video.volume;
    stage.dataset.vol = v === 0 ? "mute" : v < 0.5 ? "low" : "high";
    el.vol.value = video.muted ? 0 : video.volume;
    el.vol.style.setProperty("--v", (video.muted ? 0 : video.volume) * 100 + "%");
    el.mute.setAttribute("aria-label", video.muted ? "Unmute (m)" : "Mute (m)");
    store.set("demos.vol", String(video.volume));
    store.set("demos.muted", video.muted ? "1" : "0");
  });
  video.addEventListener("ratechange", () => {
    el.speed.textContent = (video.playbackRate === 1 ? "1" : String(video.playbackRate)) + "×";
  });

  /* ── stage clicks ── */
  let lastPointer = "mouse";
  stage.addEventListener("pointerdown", e => { lastPointer = e.pointerType; }, true);
  video.addEventListener("click", () => {
    if (lastPointer === "touch" && stage.classList.contains("is-idle")) { kick(); return; }
    toggle();
    osd(video.paused ? "❚❚ <b>paused</b>" : "▶ <b>play</b>");
  });
  video.addEventListener("dblclick", () => { if (lastPointer !== "touch") toggleFs(); });
  el.big.addEventListener("click", () => { play(); stage.focus({ preventScroll: true }); });
  stage.addEventListener("pointermove", e => { if (e.pointerType !== "touch") kick(); });
  stage.addEventListener("pointerleave", () => { if (stage.dataset.state === "playing") kick(700); });
  const ctrl = $("ctrl");
  ctrl.addEventListener("pointerenter", () => { pointerInCtrl = true; showControls(); });
  ctrl.addEventListener("pointerleave", () => { pointerInCtrl = false; kick(); });
  ctrl.addEventListener("focusin", () => showControls());

  /* ── buttons ── */
  el.play.addEventListener("click", toggle);
  el.prev.addEventListener("click", () => go(-1));
  el.nextCtrl.addEventListener("click", () => go(1));
  el.replay.addEventListener("click", () => { cancelCount(); seekTo(0); play(); });
  el.next.addEventListener("click", () => { cancelCount(); go(1); });
  el.cancel.addEventListener("click", () => { cancelCount(); el.replay.focus({ preventScroll: true }); });
  el.mute.addEventListener("click", () => {
    if (video.muted || video.volume === 0) { video.muted = false; if (video.volume === 0) video.volume = 0.6; }
    else video.muted = true;
  });
  el.vol.addEventListener("input", () => { video.volume = +el.vol.value; video.muted = +el.vol.value === 0; });

  const setSpeed = r => { video.playbackRate = r; osd(`speed <b>${r.toFixed(2)}×</b>`); };
  const speedStep = dir => {
    const i = SPEEDS.indexOf(video.playbackRate);
    const n = i < 0 ? SPEEDS.indexOf(1) : clamp(i + dir, 0, SPEEDS.length - 1);
    setSpeed(SPEEDS[n]);
  };
  el.speed.addEventListener("click", () => {
    const i = SPEEDS.indexOf(video.playbackRate);
    setSpeed(SPEEDS[(i + 1) % SPEEDS.length] ?? 1);
  });

  /* fullscreen */
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const toggleFs = () => {
    if (fsEl()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
    else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();      // iPhone
  };
  const onFs = () => {
    const on = fsEl() === stage;
    stage.classList.toggle("is-fs", on);
    el.fs.setAttribute("aria-label", on ? "Exit fullscreen (f)" : "Fullscreen (f)");
    kick();
  };
  document.addEventListener("fullscreenchange", onFs);
  document.addEventListener("webkitfullscreenchange", onFs);
  el.fs.addEventListener("click", toggleFs);

  /* picture in picture */
  if (document.pictureInPictureEnabled && !video.disablePictureInPicture) {
    el.pip.hidden = false;
    el.pip.addEventListener("click", () => {
      if (document.pictureInPictureElement) document.exitPictureInPicture();
      else video.requestPictureInPicture().catch(() => {});
    });
  }

  /* ── seek bar ── */
  const tAtX = x => {
    const r = el.seek.getBoundingClientRect();
    return clamp((x - r.left) / r.width, 0, 1) * (video.duration || 0);
  };
  const showTip = x => {
    if (!isFinite(video.duration)) return;
    const r = el.seek.getBoundingClientRect();
    const t = tAtX(x);
    el.tipTime.textContent = fmt(t);
    const c = chapterAt(t);
    el.tipLabel.textContent = c ? c.label : "";
    const half = el.tip.offsetWidth / 2;
    el.tip.style.left = clamp(x - r.left, half, r.width - half) + "px";
  };
  el.seek.addEventListener("pointerdown", e => {
    if (e.button !== 0 || !isFinite(video.duration)) return;
    el.seek.setPointerCapture(e.pointerId);
    el.seek.classList.add("is-drag");
    dragT = tAtX(e.clientX);
    seekTo(dragT, { fast: true });
    showTip(e.clientX);
    showControls();
  });
  el.seek.addEventListener("pointermove", e => {
    showTip(e.clientX);
    if (!el.seek.classList.contains("is-drag")) return;
    dragT = tAtX(e.clientX);
    seekTo(dragT, { fast: true });
  });
  const endDrag = e => {
    if (!el.seek.classList.contains("is-drag")) return;
    el.seek.classList.remove("is-drag");
    if (dragT != null) seekTo(dragT);
    dragT = null;
    if (e.pointerType === "touch") kick(); else showControls();
  };
  el.seek.addEventListener("pointerup", endDrag);
  el.seek.addEventListener("pointercancel", endDrag);

  /* ── keyboard (mpv-ish) ── */
  addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t.matches && t.matches("input[type=text], textarea, [contenteditable]")) return;
    if (t.matches && t.matches("input[type=range]") && /^Arrow/.test(e.key)) return;
    const onBtn = t.closest && t.closest("button, a");
    const inPlayer = player.contains(t) || !!fsEl();
    const k = e.key;
    const hasVideo = !!DEMOS[cur].src;
    let handled = true;

    switch (k) {
      case " ": case "k": case "K":
        if (k === " " && onBtn) { handled = false; break; }
        if (!hasVideo) { handled = false; break; }
        toggle();
        osd(video.paused ? "❚❚ <b>paused</b>" : `▶ <b>play</b>  ${fmt(video.currentTime)} / ${fmt(video.duration)}`);
        break;
      case "ArrowLeft": nudge(-5); break;
      case "ArrowRight": nudge(5); break;
      case "j": case "J": nudge(-10); break;
      case "l": case "L": nudge(10); break;
      case "ArrowUp": case "ArrowDown":
        if (!inPlayer) { handled = false; break; }
        // falls through
      case "9": case "0": {
        const up = k === "ArrowUp" || k === "0";
        video.muted = false;
        video.volume = clamp(Math.round((video.volume + (up ? 0.05 : -0.05)) * 100) / 100, 0, 1);
        osd(`volume <b>${Math.round(video.volume * 100)}%</b>`);
        kick();
        break;
      }
      case "m": case "M":
        el.mute.click();
        osd(video.muted ? "volume <b>muted</b>" : `volume <b>${Math.round(video.volume * 100)}%</b>`);
        break;
      case "f": case "F": if (hasVideo) toggleFs(); else handled = false; break;
      case "n": case "N": case ">": go(1); break;
      case "p": case "P": case "<": go(-1); break;
      case "[": speedStep(-1); break;
      case "]": speedStep(1); break;
      case "Home": if (t === el.seek) seekTo(0); else handled = false; break;
      case "End": if (t === el.seek) seekTo(video.duration); else handled = false; break;
      case ",": case ".":
        if (!hasVideo) { handled = false; break; }
        video.pause();
        seekTo(video.currentTime + (k === "." ? 1 / 30 : -1 / 30));
        osd(`frame <b>${k === "." ? "+1" : "−1"}</b>  ${fmt(video.currentTime)}`);
        break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  });

  /* ── media session (OS media keys) ── */
  if ("mediaSession" in navigator) {
    const ms = navigator.mediaSession;
    try {
      ms.setActionHandler("play", play);
      ms.setActionHandler("pause", () => video.pause());
      ms.setActionHandler("nexttrack", () => go(1));
      ms.setActionHandler("previoustrack", () => go(-1));
      ms.setActionHandler("seekbackward", () => nudge(-10));
      ms.setActionHandler("seekforward", () => nudge(10));
    } catch { /* unsupported action */ }
  }

  /* ── init ── */
  const sv = parseFloat(store.get("demos.vol"));
  if (isFinite(sv)) video.volume = clamp(sv, 0, 1);
  video.muted = store.get("demos.muted") === "1";
  video.dispatchEvent(new Event("volumechange"));

  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    return DEMOS.findIndex(d => d.id === id);
  };
  const start = fromHash();
  load(start >= 0 ? start : 0, { fromHash: start >= 0 });
  addEventListener("hashchange", () => {
    const i = fromHash();
    if (i >= 0 && i !== cur) load(i, { fromHash: true });
  });
})();
