(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.documentElement.classList.add("js");

  /* ── clock (Amman time) ── */
  const clock = $("#clock");
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Amman", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const tick = () => { clock.textContent = "AMM " + fmt.format(new Date()).replace(",", ""); };
  if (clock) { tick(); setInterval(tick, 15000); }

  /* ── window open animation ── */
  const wins = $$(".win");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    wins.forEach(w => w.classList.add("is-open"));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const sibs = $$(".win", e.target.closest(".ws"));
        const i = Math.max(0, sibs.indexOf(e.target));
        setTimeout(() => e.target.classList.add("is-open"), i * 70);
        io.unobserve(e.target);
      });
    }, { threshold: 0.08 });
    wins.forEach(w => io.observe(w));
  }

  /* ── focus follows mouse / scroll, like a tiling WM ── */
  const barTitle = $("#barTitle");
  let focused = null;
  const focusWin = w => {
    if (!w || w === focused) return;
    focused && focused.classList.remove("is-focus");
    focused = w;
    w.classList.add("is-focus");
    if (barTitle) barTitle.textContent = w.dataset.title || "";
  };
  focusWin($(".win"));

  const hoverable = matchMedia("(hover: hover)").matches;
  if (hoverable) wins.forEach(w => w.addEventListener("mouseenter", () => focusWin(w)));

  /* ── active workspace + scroll focus ── */
  const wsLinks = $$(".bar__ws a");
  const sections = $$(".ws[data-ws]");
  let currentWs = null;
  const setWs = n => {
    if (n === currentWs) return;
    currentWs = n;
    wsLinks.forEach(a => a.classList.toggle("is-active", a.dataset.ws === n));
  };

  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const mid = innerHeight * 0.42;
    // workspace = last section whose top passed the 42% line
    if (sections.length) {
      let ws = sections[0];
      for (const s of sections) if (s.getBoundingClientRect().top <= mid) ws = s;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) ws = sections[sections.length - 1];
      setWs(ws.dataset.ws);
    }

    // on touch devices, focus the window closest to the reading line
    if (!hoverable) {
      let best = null, bestD = Infinity;
      for (const w of wins) {
        const r = w.getBoundingClientRect();
        if (r.bottom < 60 || r.top > innerHeight) continue;
        const d = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (d < bestD) { bestD = d; best = w; }
      }
      focusWin(best);
    }
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ── keyboard: 1–6 switch workspace (6 = demos page) ── */
  const input = $("#shellInput");
  addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t.matches && t.matches("input, textarea, [contenteditable]")) return;
    if (/^[1-6]$/.test(e.key)) {
      const s = $(`.ws[data-ws="${e.key}"]`);
      const link = $(`.bar__ws a[data-ws="${e.key}"]`);
      e.preventDefault();
      if (s) s.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      else if (link) location.href = link.href;   // workspace lives on the other page
    } else if (e.key === "/" || e.key === ":") {
      e.preventDefault();
      const contact = $("#ws-contact");
      if (!contact || !input) { location.href = "index.html#ws-contact"; return; }
      contact.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      setTimeout(() => input.focus({ preventScroll: true }), reduceMotion ? 0 : 450);
    }
  });

  /* ── type the first command ── */
  const typed = $(".typed");
  if (typed && !reduceMotion) {
    const text = typed.dataset.type;
    typed.textContent = "";
    typed.classList.add("is-typing");
    let i = 0;
    const step = () => {
      typed.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, 70 + Math.random() * 60);
      else setTimeout(() => typed.classList.remove("is-typing"), 250);
    };
    setTimeout(step, 450);
  }

  /* ── interactive shell ── */
  const out = $("#shellOut");
  const form = $("#shellForm");
  if (!out || !form || !input) return;   // no shell on this page (e.g. demos.html)
  const history = [];
  let hIdx = 0;

  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const print = (html, cls) => {
    const p = document.createElement("p");
    if (cls) p.className = cls;
    p.innerHTML = html;
    out.appendChild(p);
  };
  const jump = id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    const w = el.classList.contains("win") ? el : $(".win", el);
    if (w) setTimeout(() => focusWin(w), 500);
  };
  const open = url => window.open(url, "_blank", "noopener");

  const projects = {
    zyro: "p-zyro", boombx: "p-boombx", grad: "p-grad", graduation: "p-grad", workmint: "p-workmint",
  };

  const commands = {
    help: () => print(
`<b>available commands</b>
  <span class="acc">whoami</span>        who is this
  <span class="acc">ls</span>            list projects
  <span class="acc">open</span> &lt;name&gt;   jump to a project  (zyro, boombx, grad, workmint)
  <span class="acc">demos</span>         watch video demos
  <span class="acc">log</span>           work history
  <span class="acc">stack</span>         what I build with
  <span class="acc">resume</span>        open resume.pdf
  <span class="acc">mail</span>          write me an email
  <span class="acc">github</span> · <span class="acc">linkedin</span>
  <span class="acc">date</span> · <span class="acc">clear</span>`),
    whoami: () => print("Sadeq Odeh — full-stack developer, Amman, Jordan.\nASP.NET Core · React · PostgreSQL · C++. Open to full-stack / backend roles."),
    ls: () => print(
`drwxr-xr-x  <span class="acc">zyro/</span>       C++ browser · WebKitGTK → CEF
drwxr-xr-x  <span class="acc">boombx/</span>     .NET 8 soundboard + audio router
drwxr-x---  <span class="acc">grad/</span>       AI transport-document digitization
drwxr-xr-x  <span class="acc">workmint/</span>   React + Express freelance marketplace

try: <span class="acc">open zyro</span> · or <span class="acc">demos</span> to watch them`),
    open: arg => {
      const key = (arg || "").replace(/\/$/, "").toLowerCase();
      if (!key) return print("usage: open &lt;zyro|boombx|grad|workmint&gt;", "err");
      if (projects[key]) { print(`opening ${esc(key)}…`, "muted"); jump(projects[key]); }
      else print(`open: ${esc(key)}: no such project`, "err");
    },
    demos: arg => {
      const k = (arg || "").replace(/\/$/, "").toLowerCase();
      print("mpv --playlist=~/demos/*.mp4", "muted");
      setTimeout(() => { location.href = "demos.html" + (k ? "#" + encodeURIComponent(k) : ""); }, 350);
    },
    log: () => { print("checking out ~/career…", "muted"); jump("ws-log"); },
    stack: () => { print("cat ~/.config/stack.toml", "muted"); jump("ws-stack"); },
    resume: () => { print("opening resume.pdf ↗", "muted"); open("resume.pdf"); },
    mail: () => { print('composing to <a href="mailto:sadeq_odeh@outlook.com">sadeq_odeh@outlook.com</a>'); location.href = "mailto:sadeq_odeh@outlook.com"; },
    github: () => { print("github.com/sardeq ↗", "muted"); open("https://github.com/sardeq"); },
    linkedin: () => { print("linkedin.com/in/sadeqodeh ↗", "muted"); open("https://www.linkedin.com/in/sadeqodeh"); },
    date: () => print(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Amman", dateStyle: "full", timeStyle: "short" }).format(new Date()) + " (Amman)"),
    clear: () => { out.innerHTML = ""; },
    sudo: arg => {
      if (/hire/.test(arg || "")) { print('[sudo] permission granted. opening mail…', "acc"); setTimeout(commands.mail, 600); }
      else print("sadeq is not in the sudoers file. this incident will be reported.", "err");
    },
    rm: () => print("nice try.", "err"),
    exit: () => print("there is no escape. try <span class=\"acc\">mail</span> instead."),
    cd: arg => {
      const k = (arg || "").replace(/^~?\/?/, "").replace(/\/$/, "").toLowerCase();
      if (projects[k]) return commands.open(k);
      if (k === "projects") return jump("ws-projects");
      if (k === "demos") return commands.demos();
      if (!k) return jump("ws-home");
      print(`cd: ${esc(arg)}: no such directory`, "err");
    },
  };
  commands.cat = arg => (/resume/.test(arg || "") ? commands.resume() : /stack/.test(arg || "") ? commands.stack() : print(`cat: ${esc(arg || "")}: try <span class="acc">ls</span>`, "err"));
  commands.projects = () => jump("ws-projects");
  commands.mpv = commands.demo = commands.demos;
  commands.email = commands.mail;
  commands.contact = commands.mail;
  commands.experience = commands.log;
  commands.neofetch = commands.fetch = () => jump("ws-home");
  commands["?"] = commands.help;

  const names = Object.keys(commands).filter(n => n !== "?");

  const run = raw => {
    const line = raw.trim();
    print(`<span class="ps1">~</span> ${esc(line)}`, "echo");
    if (!line) return;
    history.push(line); hIdx = history.length;
    const [cmd, ...rest] = line.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    if (fn) fn(rest.join(" "));
    else print(`zsh: command not found: ${esc(cmd)} — try <span class="acc">help</span>`, "err");
    out.scrollTop = out.scrollHeight;
  };

  form.addEventListener("submit", e => { e.preventDefault(); run(input.value); input.value = ""; });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx];
    } else if (e.key === "ArrowDown" && history.length) {
      e.preventDefault(); hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || "";
    } else if (e.key === "Tab") {
      const v = input.value;
      const parts = v.split(/\s+/);
      let pool = names, cur = parts[0];
      if (parts.length === 2 && /^(open|cd)$/.test(parts[0])) { pool = Object.keys(projects); cur = parts[1]; }
      else if (parts.length > 1) return;
      const hits = pool.filter(n => n.startsWith(cur.toLowerCase()));
      if (!cur || !hits.length) return;
      e.preventDefault();
      if (hits.length === 1) {
        parts[parts.length - 1] = hits[0];
        input.value = parts.join(" ") + (parts.length === 1 ? " " : "");
      } else {
        print(hits.join("   "), "muted");
        out.scrollTop = out.scrollHeight;
      }
    }
  });
  $("#shell").addEventListener("click", e => { if (!e.target.closest("a")) input.focus(); });
})();
