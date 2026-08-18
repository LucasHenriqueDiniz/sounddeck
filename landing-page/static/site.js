// SoundDeck site — tema, prévias de áudio e idioma (pt-BR / en)

(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('sounddeck-theme');
  const setTheme = (t) => { root.dataset.theme = t; localStorage.setItem('sounddeck-theme', t); };
  setTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const tb = document.getElementById('themeBtn');
  if (tb) tb.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));


  // ---- releases reais do GitHub ----
  // download.html e changelog.html não têm nenhum número de versão fixo no
  // HTML: tudo vem da API pública do GitHub em runtime. Enquanto não existir
  // nenhuma release publicada (o workflow em .github/workflows/release.yml
  // cria releases como rascunho, então elas só aparecem aqui depois que
  // alguém publicar manualmente no GitHub), as duas páginas mostram um
  // estado honesto de "ainda não lançamos uma versão" em vez de inventar
  // uma.
  const GITHUB_REPO = 'LucasHenriqueDiniz/sounddeck';
  const DOWNLOAD_ICON =
    '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 5.5 10 4.6v6.9H3zM11 4.4 21 3v8.5H11zM3 12.5h7v6.9L3 18.5zM11 12.5h10V21l-10-1.4z"/></svg>';
  let releasesPromise = null;
  function fetchReleases() {
    if (!releasesPromise) {
      releasesPromise = fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases`)
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => []);
    }
    return releasesPromise;
  }
  function pickAsset(assets, suffix) {
    return (assets || []).find((a) => a.name.toLowerCase().endsWith(suffix));
  }
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(document.documentElement.lang || "en", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  function renderDownload() {
    const card = document.getElementById('dlCard');
    if (!card) return;
    const t = window.__I18N || {};
    fetchReleases().then((releases) => {
      if (!releases.length) {
        card.innerHTML =
          `<h2>${t['dl.none.h']}</h2>` +
          `<p class="dl-alt">${t['dl.none.p']}</p>` +
          `<div class="dl-actions"><a class="btn btn-primary btn-lg" href="https://github.com/${GITHUB_REPO}">${DOWNLOAD_ICON}<span>${t['dl.none.cta']}</span></a></div>`;
        return;
      }
      const rel = releases[0];
      const exe = pickAsset(rel.assets, '-setup.exe') || pickAsset(rel.assets, '.exe');
      const msi = pickAsset(rel.assets, '.msi');
      const zip = pickAsset(rel.assets, '.zip');
      const buttons = [];
      if (exe) buttons.push(`<a class="btn btn-primary btn-lg" href="${exe.browser_download_url}">${DOWNLOAD_ICON}<span>${t['dl.exe']}</span></a>`);
      if (msi) buttons.push(`<a class="btn btn-ghost btn-lg" href="${msi.browser_download_url}">${t['dl.msi']}</a>`);
      if (zip) buttons.push(`<a class="btn btn-ghost btn-lg" href="${zip.browser_download_url}">${t['dl.zip']}</a>`);
      card.innerHTML =
        `<h2>SoundDeck ${rel.tag_name}</h2>` +
        `<div class="dl-meta"><span>${t['dl.published']} ${formatDate(rel.published_at)}</span></div>` +
        `<div class="dl-actions">${buttons.join('')}</div>` +
        `<p class="dl-alt"><a href="${rel.html_url}">${t['dl.viewrelease']}</a></p>`;
    });
  }
  function renderChangelog() {
    const list = document.getElementById('relList');
    if (!list) return;
    const t = window.__I18N || {};
    fetchReleases().then((releases) => {
      if (!releases.length) {
        list.innerHTML =
          `<div class="rel"><h2 class="rel-v">${t['cl.none.h']}</h2>` +
          `<p>${t['cl.none.p']}</p>` +
          `<p><a href="https://github.com/${GITHUB_REPO}">${t['cl.none.cta']}</a></p></div>`;
        return;
      }
      list.innerHTML = releases
        .map((rel, i) => {
          const tag = i === 0 ? `<span class="rel-tag">${t['cl.latest']}</span>` : '';
          const body = (rel.body || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => `<li>${line.replace(/^[-*]\s*/, '')}</li>`)
            .join('');
          return (
            `<div class="rel"><div class="rel-head"><span class="rel-v">${rel.tag_name}</span>` +
            `<span class="rel-date">${formatDate(rel.published_at)}</span>${tag}</div>` +
            (body ? `<ul>${body}</ul>` : '') +
            `<p><a href="${rel.html_url}">${t['cl.viewrelease']}</a></p></div>`
          );
        })
        .join('');
    });
  }


  // ---- seletor de idioma ----
  const langs = document.querySelector(".langs");
  if (langs) {
    const btn = langs.querySelector(".langs-btn");
    const toggle = (open) => {
      langs.dataset.open = open ? "1" : "";
      btn.setAttribute("aria-expanded", String(open));
    };
    btn.addEventListener("click", (e) => { e.stopPropagation(); toggle(langs.dataset.open !== "1"); });
    document.addEventListener("click", () => toggle(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });
  }

  renderDownload();
  renderChangelog();

  // ---- prévias de áudio ----
  // XP, Vista e 7 tocam o áudio real desses esquemas, servido pelo mesmo
  // catálogo público (R2) que o app usa (services/tauri/remoteCatalogService.ts).
  // Minimal e Calm são conceitos originais do SoundDeck sem gravação de
  // referência, então continuam com um tom sintetizado no navegador,
  // deixado claro no texto da seção de packs (packs.note).
  const REAL_AUDIO_BASE = 'https://pub-a7bb18fa003c4b529e764f1c308a7146.r2.dev';
  const REAL_PREVIEWS = {
    xp:    { packId: 'xp-real',        file: 'Windows XP Logon Sound.wav' },
    vista: { packId: 'vista-glass',    file: 'start.wav' },
    seven: { packId: 'win7-landscape', file: 'Windows Logon Sound.wav' }
  };
  const SYNTH_PREVIEWS = {
    minimal: { wave: 'square', notes: [[1400,0,.045],[1400,.13,.045]], gain: .05 },
    calm:    { wave: 'sine',   notes: [[349.2,0,2.4],[523.3,.35,2.6]], gain: .12, attack: .2 }
  };

  let ctx;
  function playSynth(id, onEnd) {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const p = SYNTH_PREVIEWS[id], t0 = ctx.currentTime + .02;
    const out = ctx.createGain(); out.gain.value = p.gain; out.connect(ctx.destination);
    let end = 0;
    for (const [f, at, dur] of p.notes) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = p.wave; o.frequency.value = f;
      const a = p.attack || .006, s = t0 + at;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(1, s + a);
      g.gain.exponentialRampToValueAtTime(.0008, s + dur);
      o.connect(g); g.connect(out); o.start(s); o.stop(s + dur + .05);
      if (p.wave === 'sine' || p.wave === 'triangle') {
        const o2 = ctx.createOscillator(), g2 = ctx.createGain();
        o2.type = 'sine'; o2.frequency.value = f * 2;
        g2.gain.setValueAtTime(0, s);
        g2.gain.linearRampToValueAtTime(.22, s + a);
        g2.gain.exponentialRampToValueAtTime(.0008, s + dur * .7);
        o2.connect(g2); g2.connect(out); o2.start(s); o2.stop(s + dur + .05);
      }
      end = Math.max(end, at + dur);
    }
    setTimeout(onEnd, end * 1000);
  }

  let audioEl = null;
  function playReal(id, onEnd) {
    const ref = REAL_PREVIEWS[id];
    if (!audioEl) audioEl = new Audio();
    audioEl.onended = null;
    audioEl.onerror = null;
    audioEl.pause();
    audioEl.src = `${REAL_AUDIO_BASE}/packs/${encodeURIComponent(ref.packId)}/${encodeURIComponent(ref.file)}`;
    audioEl.currentTime = 0;
    audioEl.onended = onEnd;
    // Rede indisponível ou arquivo ausente: cai para o tom sintetizado em vez
    // de deixar o botão preso em "tocando" para sempre.
    audioEl.onerror = () => playSynth(id in SYNTH_PREVIEWS ? id : 'calm', onEnd);
    const p = audioEl.play();
    if (p && p.catch) p.catch(() => onEnd());
  }

  let busy = null;
  document.querySelectorAll('[data-pack]').forEach((b) => {
    b.addEventListener('click', () => {
      const id = b.dataset.pack;
      if (busy) {
        busy.stop();
        busy = null;
      }
      const onEnd = () => { b.removeAttribute('data-playing'); if (busy && busy.el === b) busy = null; };
      b.setAttribute('data-playing', '1');
      if (REAL_PREVIEWS[id]) {
        playReal(id, onEnd);
        busy = { el: b, stop: () => { if (audioEl) audioEl.pause(); onEnd(); } };
      } else {
        playSynth(id, onEnd);
        busy = { el: b, stop: onEnd };
      }
    });
  });
})();
