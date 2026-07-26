// SoundDeck site — tema, prévias de áudio e idioma (pt-BR / en)
const I18N = {
 "pt": {
  "nav.problem": "O problema",
  "nav.packs": "Packs",
  "nav.features": "Recursos",
  "nav.safety": "Segurança",
  "nav.changelog": "Notas de versão",
  "nav.download": "Baixar",
  "foot.tagline": "App nativo para Windows · Tauri + Rust",
  "foot.changelog": "Notas de versão",
  "foot.privacy": "Privacidade",
  "foot.github": "Código no GitHub",
  "foot.legal": "Windows é marca da Microsoft. Este projeto não é afiliado à Microsoft.",
  "foot.back": "Voltar para a página inicial",
  "hero.eyebrow": "App para Windows 10 e 11",
  "hero.h1a": "Um seletor de sons",
  "hero.h1b": "para o Windows.",
  "hero.sub": "Escolha um pack, ouça a prévia, aplique. Vêm inclusos os esquemas do XP, do Vista e do 7, mais dois originais — e o editor troca evento por evento quando você quiser detalhar.",
  "hero.cta": "Baixar para Windows",
  "hero.cta2": "Ver os packs",
  "hero.listen": "Ouça agora",
  "hero.fine": "Gratuito e de código aberto · em desenvolvimento ativo · prévias de XP, Vista e 7 são o áudio real desses esquemas",
  "hero.shotnote": "Representação ilustrativa da interface.",
  "shot.library": "Biblioteca de packs",
  "shot.editor": "Editor",
  "shot.backups": "Backups",
  "shot.settings": "Ajustes",
  "shot.libnav": "Biblioteca",
  "shot.packs5": "5 packs",
  "shot.events": "Eventos",
  "shot.applied": "Aplicado agora",
  "shot.original": "Original",
  "shot.ev1": "Asterisco do sistema",
  "shot.ev2": "Dispositivo conectado",
  "shot.ev3": "Bateria fraca",
  "shot.ev4": "Logon do Windows",
  "shot.foot": "Backup criado antes de aplicar",
  "shot.restore": "Restaurar",
  "prob.kicker": "Por que o app existe",
  "prob.h": "O Windows ainda tem esquemas de som. Só não tem onde mexer neles.",
  "prob.1": "<b>A tela é de 2009.</b> O sistema de esquemas continua completo por baixo, mas a interface para editá-lo é a mesma janela do Windows 7, hoje escondida atrás de alguns cliques nas Configurações.",
  "prob.2": "<b>Os sons novos são mais neutros.</b> O 10 e o 11 padronizaram tudo em poucos toques curtos e parecidos. Funciona, mas perdeu o caráter que o XP, o Vista e o 7 tinham.",
  "prob.3": "<b>Trocar à mão dá trabalho.</b> São cerca de trinta eventos, um seletor de arquivo por vez, sem prévia confortável e sem uma forma simples de voltar atrás.",
  "packs.h": "Cinco packs inclusos.",
  "packs.lede": "Cada pack cobre todos os eventos do sistema e se aplica de uma vez. Toque a prévia abaixo para ter uma ideia do tom de cada um.",
  "packs.xp": "Recriação do esquema clássico: toques curtos e claros, fáceis de reconhecer sem olhar para a tela.",
  "packs.vista": "Recriação do esquema do Vista: notas mais longas e suaves, com a assinatura de logon da época.",
  "packs.seven": "Recriação do esquema do 7: o mesmo timbre do Vista, um pouco mais curto e discreto.",
  "packs.min": "Pack original: quase tudo desativado, com cliques bem curtos só onde o silêncio total atrapalharia.",
  "packs.calm": "Pack original: sinos suaves no lugar dos alertas mais duros e silêncio nos erros críticos.",
  "packs.note": "As prévias de Windows XP, Vista e 7 são o áudio real desses esquemas, servido pelo mesmo catálogo público que o app usa — recriações aplicadas localmente na sua máquina, não arquivos redistribuídos pela Microsoft. As prévias de Minimal e Calm são sintetizadas no navegador, como ilustração: são conceitos originais do SoundDeck, sem uma gravação de referência.",
  "packs.original": "Original",
  "feat.kicker": "Recursos",
  "feat.h": "O que o app faz.",
  "feat.1t": "Biblioteca de packs",
  "feat.1c": "Os packs aparecem como cards com prévia de som. Ouça, clique em aplicar e o esquema inteiro entra no lugar.",
  "feat.2t": "Editor evento a evento",
  "feat.2c": "Dá para trocar o som de um evento só — asterisco do sistema, notificação, dispositivo conectado ou desconectado, bateria fraca, logon, logoff, UAC — com prévia antes de aplicar.",
  "feat.3t": "Backups com restauração de um clique",
  "feat.3c": "Cada vez que você aplica algo, o esquema anterior é salvo. Para voltar, basta escolher o backup na lista.",
  "feat.4t": "Detecção de mudança externa",
  "feat.4c": "Se outro programa ou o Painel de Controle mudar o esquema, o app avisa e oferece resincronizar com o que está no sistema.",
  "safe.kicker": "Segurança",
  "safe.h": "Mexe pouco, e só no que dá para desfazer.",
  "safe.1t": "Sem privilégios de admin",
  "safe.1c": "Roda na sua conta de usuário, sem pedir elevação.",
  "safe.2t": "Sem tocar em arquivos do sistema",
  "safe.2c": "Nenhuma DLL do Windows é modificada ou substituída.",
  "safe.3t": "Só o registro do usuário",
  "safe.3c": "Escreve apenas em <code class=\"reg\">HKCU</code> — o mesmo lugar que o painel oficial usa.",
  "safe.4t": "Reversível e aberto",
  "safe.4c": "Backup a cada aplicação, e o código é aberto para você conferir o que ele faz.",
  "close.h": "Baixe e escolha o seu esquema.",
  "close.p": "Instale, ouça os packs e aplique o que preferir. Se não gostar, o backup devolve o esquema anterior. Gratuito e de código aberto.",
  "close.cta": "Baixar o SoundDeck",
  "close.cta2": "Ver o código no GitHub",
  "close.fine": "Windows 10/11 · gratuito · código aberto",
  "dl.title": "Baixar o SoundDeck",
  "dl.sub": "Para Windows 10 (1809 ou mais recente) e Windows 11. Sem dependências extras — usa o WebView2 já presente no sistema.",
  "dl.loading": "Procurando a versão mais recente…",
  "dl.none.h": "Ainda não lançamos uma versão.",
  "dl.none.p": "O SoundDeck está em desenvolvimento ativo. Acompanhe o progresso e os builds no repositório do GitHub.",
  "dl.none.cta": "Ver o repositório",
  "dl.exe": "Instalador (.exe)",
  "dl.msi": "Instalador (.msi)",
  "dl.zip": "Versão portátil (.zip)",
  "dl.published": "Publicado em",
  "dl.viewrelease": "Ver esta versão no GitHub",
  "dl.steps.h": "Como instalar",
  "dl.s1": "Baixe e abra o instalador. Não é preciso ser administrador.",
  "dl.s2": "Escolha um pack na biblioteca e ouça a prévia.",
  "dl.s3": "Clique em aplicar. O esquema anterior é salvo automaticamente.",
  "dl.req.h": "Requisitos",
  "dl.req1": "Windows 10 versão 1809 ou mais recente, ou Windows 11.",
  "dl.req2": "Cerca de 30 MB de espaço em disco.",
  "dl.req3": "Nenhum runtime extra: o app usa o WebView2 já presente no sistema.",
  "dl.ver.h": "De onde vêm os binários",
  "dl.ver.p": "Cada versão é compilada automaticamente pelo GitHub Actions a partir do código-fonte nesta tag, sem passar por uma máquina pessoal. O link acima leva direto para a página da release no GitHub.",
  "cl.title": "Notas de versão",
  "cl.sub": "Cada versão publicada no GitHub, da mais recente para a mais antiga.",
  "cl.latest": "Versão atual",
  "cl.none.h": "Ainda não lançamos uma versão.",
  "cl.none.p": "Quando a primeira release sair, o histórico aparece aqui automaticamente. Por enquanto, o commits do projeto estão no GitHub.",
  "cl.none.cta": "Ver o repositório",
  "cl.viewrelease": "Ver no GitHub",
  "pv.title": "Privacidade",
  "pv.sub": "O SoundDeck é um app local. Não tem conta, não tem servidor e não coleta dados de uso.",
  "pv.h1": "O que o app acessa",
  "pv.p1": "O SoundDeck lê e escreve as chaves de esquema de sons no registro do usuário (<code class=\"reg\">HKCU</code>) e lê os arquivos de áudio dos packs instalados junto do app. Nada fora disso.",
  "pv.h2": "O que não é coletado",
  "pv.p2": "Sem conta, sem login, sem telemetria, sem identificadores de máquina e sem análise de uso. Nenhum dado pessoal sai do seu computador.",
  "pv.h3": "Rede",
  "pv.p3": "A única conexão de rede é a verificação opcional de novas versões, que consulta a página de releases e pode ser desligada em Ajustes. Ela não envia informações sobre você nem sobre o seu sistema.",
  "pv.h4": "Backups",
  "pv.p4": "Os backups do esquema anterior ficam em uma pasta dentro do seu perfil de usuário. Você pode apagá-los a qualquer momento; o app nunca os envia para fora da máquina.",
  "pv.h5": "Licença e código",
  "pv.p5": "O SoundDeck é gratuito e de código aberto sob a licença MIT. O repositório mostra exatamente quais chaves são lidas e escritas.",
  "pv.updated": "Atualizado em julho de 2026."
 },
 "en": {
  "nav.problem": "The problem",
  "nav.packs": "Packs",
  "nav.features": "Features",
  "nav.safety": "Safety",
  "nav.changelog": "Changelog",
  "nav.download": "Download",
  "foot.tagline": "Native Windows app · Tauri + Rust",
  "foot.changelog": "Changelog",
  "foot.privacy": "Privacy",
  "foot.github": "Source on GitHub",
  "foot.legal": "Windows is a Microsoft trademark. This project is not affiliated with Microsoft.",
  "foot.back": "Back to the home page",
  "hero.eyebrow": "App for Windows 10 and 11",
  "hero.h1a": "A sound picker",
  "hero.h1b": "for Windows.",
  "hero.sub": "Pick a pack, hear the preview, apply. The XP, Vista and 7 schemes are included, plus two originals — and the editor swaps sounds event by event when you want the detail.",
  "hero.cta": "Download for Windows",
  "hero.cta2": "See the packs",
  "hero.listen": "Listen now",
  "hero.fine": "Free and open source · under active development · XP, Vista and 7 previews are the real audio of those schemes",
  "hero.shotnote": "Illustrative representation of the interface.",
  "shot.library": "Pack library",
  "shot.editor": "Editor",
  "shot.backups": "Backups",
  "shot.settings": "Settings",
  "shot.libnav": "Library",
  "shot.packs5": "5 packs",
  "shot.events": "Events",
  "shot.applied": "Applied just now",
  "shot.original": "Original",
  "shot.ev1": "System asterisk",
  "shot.ev2": "Device connected",
  "shot.ev3": "Low battery",
  "shot.ev4": "Windows logon",
  "shot.foot": "Backup created before applying",
  "shot.restore": "Restore",
  "prob.kicker": "Why the app exists",
  "prob.h": "Windows still has sound schemes. It just has nowhere to edit them.",
  "prob.1": "<b>The panel is from 2009.</b> The scheme engine is still complete underneath, but the only UI for it is the same Windows 7 dialog, now buried a few clicks deep in Settings.",
  "prob.2": "<b>The new sounds are more neutral.</b> Windows 10 and 11 flattened everything into a few short, similar tones. It works, but it lost the character XP, Vista and 7 had.",
  "prob.3": "<b>Doing it by hand is tedious.</b> Around thirty events, one file picker at a time, no comfortable preview and no simple way back.",
  "packs.h": "Five packs included.",
  "packs.lede": "Each pack covers every system event and applies in one go. Play a preview below to get a sense of the tone.",
  "packs.xp": "A recreation of the classic scheme: short, bright cues you recognise without looking at the screen.",
  "packs.vista": "A recreation of the Vista scheme: longer, softer notes, with the logon signature of the era.",
  "packs.seven": "A recreation of the Windows 7 scheme: the Vista timbre, a little shorter and quieter.",
  "packs.min": "Original pack: almost everything off, with very short clicks only where full silence would confuse.",
  "packs.calm": "Original pack: soft bells instead of harsh alerts, and silence for critical errors.",
  "packs.note": "The Windows XP, Vista and 7 previews are the real audio of those schemes, served from the same public catalog the app uses — recreations applied locally on your machine, not files redistributed by Microsoft. The Minimal and Calm previews are synthesized in your browser, as an illustration: they're original SoundDeck concepts with no reference recording.",
  "packs.original": "Original",
  "feat.kicker": "Features",
  "feat.h": "What the app does.",
  "feat.1t": "Pack library",
  "feat.1c": "Packs show up as cards with sound previews. Listen, hit apply, and the whole scheme takes over.",
  "feat.2t": "Event-by-event editor",
  "feat.2c": "You can change a single event — system asterisk, notification, device connect or disconnect, low battery, logon, logoff, UAC — with a preview before applying.",
  "feat.3t": "Backups with one-click restore",
  "feat.3c": "Every time you apply something, the previous scheme is saved. To go back, pick the backup from the list.",
  "feat.4t": "External change detection",
  "feat.4c": "If another program or Control Panel changes the scheme, the app notices and offers to resync with what is on the system.",
  "safe.kicker": "Safety",
  "safe.h": "It touches little, and only what can be undone.",
  "safe.1t": "No admin privileges",
  "safe.1c": "Runs in your user account, with no elevation prompt.",
  "safe.2t": "No system files touched",
  "safe.2c": "No Windows DLL is modified or replaced.",
  "safe.3t": "Only the user registry",
  "safe.3c": "It only writes to <code class=\"reg\">HKCU</code> — the same place the official panel uses.",
  "safe.4t": "Reversible and open",
  "safe.4c": "A backup on every apply, and the source is open so you can check what it does.",
  "close.h": "Download it and pick your scheme.",
  "close.p": "Install it, listen to the packs and apply whichever you like. If you change your mind, the backup restores the previous scheme. Free and open source.",
  "close.cta": "Download SoundDeck",
  "close.cta2": "View the source on GitHub",
  "close.fine": "Windows 10/11 · free · open source",
  "dl.title": "Download SoundDeck",
  "dl.sub": "For Windows 10 (1809 or later) and Windows 11. No extra dependencies — uses the WebView2 already on your system.",
  "dl.loading": "Looking up the latest version…",
  "dl.none.h": "No release yet.",
  "dl.none.p": "SoundDeck is under active development. Follow progress and builds on the GitHub repository.",
  "dl.none.cta": "View the repository",
  "dl.exe": "Installer (.exe)",
  "dl.msi": "Installer (.msi)",
  "dl.zip": "Portable version (.zip)",
  "dl.published": "Published",
  "dl.viewrelease": "View this release on GitHub",
  "dl.steps.h": "How to install",
  "dl.s1": "Download and open the installer. No administrator rights needed.",
  "dl.s2": "Pick a pack in the library and hear the preview.",
  "dl.s3": "Click apply. The previous scheme is saved automatically.",
  "dl.req.h": "Requirements",
  "dl.req1": "Windows 10 version 1809 or later, or Windows 11.",
  "dl.req2": "About 30 MB of disk space.",
  "dl.req3": "No extra runtime: the app uses the WebView2 already on your system.",
  "dl.ver.h": "Where the binaries come from",
  "dl.ver.p": "Every release is built automatically by GitHub Actions straight from the source at that tag, never from a personal machine. The link above goes straight to the release page on GitHub.",
  "cl.title": "Changelog",
  "cl.sub": "Every release published on GitHub, newest first.",
  "cl.latest": "Current release",
  "cl.none.h": "No release yet.",
  "cl.none.p": "Once the first release ships, its history shows up here automatically. For now, the project's commit history is on GitHub.",
  "cl.none.cta": "View the repository",
  "cl.viewrelease": "View on GitHub",
  "pv.title": "Privacy",
  "pv.sub": "SoundDeck is a local app. No account, no server, no usage data collected.",
  "pv.h1": "What the app accesses",
  "pv.p1": "SoundDeck reads and writes the sound-scheme keys in your user registry (<code class=\"reg\">HKCU</code>) and reads the audio files of the packs installed with the app. Nothing else.",
  "pv.h2": "What is not collected",
  "pv.p2": "No account, no login, no telemetry, no machine identifiers and no usage analytics. No personal data leaves your computer.",
  "pv.h3": "Network",
  "pv.p3": "The only network connection is the optional update check, which queries the releases page and can be turned off in Settings. It sends no information about you or your system.",
  "pv.h4": "Backups",
  "pv.p4": "Backups of your previous scheme live in a folder inside your user profile. You can delete them at any time; the app never sends them off the machine.",
  "pv.h5": "Licence and source",
  "pv.p5": "SoundDeck is free and open source under the MIT licence. The repository shows exactly which keys are read and written.",
  "pv.updated": "Updated July 2026."
 }
};

(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('sounddeck-theme');
  const setTheme = (t) => { root.dataset.theme = t; localStorage.setItem('sounddeck-theme', t); };
  setTheme(savedTheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const tb = document.getElementById('themeBtn');
  if (tb) tb.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  // ---- idioma ----
  const apply = (lang) => {
    const d = I18N[lang] || I18N.pt;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const v = d[el.dataset.i18n];
      if (v != null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const v = d[el.dataset.i18nAria];
      if (v != null) el.setAttribute('aria-label', v);
    });
    root.lang = lang === 'en' ? 'en' : 'pt-BR';
    localStorage.setItem('sounddeck-lang', lang);
    document.querySelectorAll('.langs button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    const t = document.querySelector('title[data-title-pt]');
    if (t) t.textContent = lang === 'en' ? t.dataset.titleEn : t.dataset.titlePt;
    renderDownload(lang);
    renderChangelog(lang);
  };
  const savedLang = localStorage.getItem('sounddeck-lang');
  const guess = (navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en';

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
  function formatDate(iso, lang) {
    return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  function renderDownload(lang) {
    const card = document.getElementById('dlCard');
    if (!card) return;
    const t = I18N[lang] || I18N.pt;
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
        `<div class="dl-meta"><span>${t['dl.published']} ${formatDate(rel.published_at, lang)}</span></div>` +
        `<div class="dl-actions">${buttons.join('')}</div>` +
        `<p class="dl-alt"><a href="${rel.html_url}">${t['dl.viewrelease']}</a></p>`;
    });
  }
  function renderChangelog(lang) {
    const list = document.getElementById('relList');
    if (!list) return;
    const t = I18N[lang] || I18N.pt;
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
            `<span class="rel-date">${formatDate(rel.published_at, lang)}</span>${tag}</div>` +
            (body ? `<ul>${body}</ul>` : '') +
            `<p><a href="${rel.html_url}">${t['cl.viewrelease']}</a></p></div>`
          );
        })
        .join('');
    });
  }

  apply(savedLang || guess);
  document.querySelectorAll('.langs button').forEach((b) => b.addEventListener('click', () => apply(b.dataset.lang)));

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
