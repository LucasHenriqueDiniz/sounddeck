import { useRef, useState } from 'react';
import { useLatestRelease, RELEASES_URL } from './useLatestRelease';
import { PACKS, PACK_COUNT } from './packs.generated';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronRight,
  CirclePlay,
  Download,
  Github,
  Headphones,
  History,
  Laptop,
  Menu,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';

const iconPath = '/assets/chimer-icon.png';
const REPO = 'LucasHenriqueDiniz/sounddeck';
const REPO_URL = `https://github.com/${REPO}`;

/** How many cards show before the grid is expanded. */
const FEATURED_COUNT = 6;

const features = [
  { icon: Sparkles, title: 'Pack library', text: 'Preview complete sound schemes and switch your system mood in one click.' },
  { icon: SlidersHorizontal, title: 'Event-by-event editor', text: 'Fine-tune a single notification, startup sound, or alert without the noise.' },
  { icon: History, title: 'Safe by default', text: 'Every change is backed up, reversible, and made without touching system files.' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { release, failed } = useLatestRelease();

  const visiblePacks = showAll ? PACKS : PACKS.slice(0, FEATURED_COUNT);

  /**
   * Plays the pack's real logon chime. Only one at a time — clicking a second
   * card stops the first, otherwise the previews stack into noise.
   */
  const playPreview = (id: string, url: string | null) => {
    if (!url) return;
    audioRef.current?.pause();
    if (playingId === id) {
      setPlayingId(null);
      return;
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.volume = 0.7;
    audio.onended = () => setPlayingId((current) => (current === id ? null : current));
    void audio.play().then(() => setPlayingId(id)).catch(() => setPlayingId(null));
  };

  // Until the API answers, point at the releases page: it always resolves, so
  // the button is never dead, it just takes one extra click.
  const downloadHref = release?.downloadUrl ?? RELEASES_URL;
  const versionLabel = release ? `Windows 10 / 11 · v${release.version}` : 'Windows 10 / 11';

  const onDownload = () => {
    if (release || !failed) return;
    // Only nag when we know the lookup failed.
    setNotice(true);
    window.setTimeout(() => setNotice(false), 4200);
  };


  return (
    <main className="site-shell">
      <div className="grain" aria-hidden="true" />
      <nav className="nav container">
        <a href="#top" className="brand" aria-label="Chimer home">
          <img src={iconPath} alt="" className="brand-icon" />
          <span>chimer</span>
        </a>
        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href="#packs" onClick={() => setMenuOpen(false)}>Packs</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#safety" onClick={() => setMenuOpen(false)}>Safety</a>
          <a href="#download" onClick={() => setMenuOpen(false)}>Download</a>
        </div>
        <div className="nav-actions">
          <a className="github-link" href={REPO_URL} target="_blank" rel="noreferrer"><Github size={16} /> Open source</a>
          <a className="nav-download" href={downloadHref} onClick={onDownload}><Download size={16} /> Get Chimer</a>
          <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <section className="hero container" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> Made for Windows 10 & 11</div>
          <h1>Change every Windows sound<br /><em>in one click.</em></h1>
          <p className="hero-text">Pick a pack, hear it before you commit, and apply the whole scheme at once. Your old sounds are backed up, so you can go back whenever you want.</p>
          <div className="hero-actions">
            <a className="primary-button" href={downloadHref} onClick={onDownload}><ArrowDownToLine size={18} /> Download for Windows</a>
            <a className="text-link" href="#packs">Explore the packs <ArrowUpRight size={16} /></a>
          </div>
          <div className="hero-note"><Check size={15} /> Free and open source <span /> No admin privileges</div>
        </div>
        <div className="hero-art" aria-label="Chimer app interface">
          <div className="screenshot-frame">
            <img src="/assets/app-screenshot.png" alt="Chimer app showing a library of Windows sound packs and the Apply button" />
          </div>
          <div className="floating-label">
            <span className="label-icon"><Sparkles size={15} /></span>
            <div><strong>Choose. Preview. Apply.</strong><small>the real Chimer experience</small></div>
          </div>
        </div>
      </section>

      <section className="ticker" aria-label="Chimer benefits"><div className="ticker-track"><span><Headphones size={16} /> Listen before you apply</span><i /> <span><RotateCcw size={16} /> Undo whenever you want</span><i /> <span><ShieldCheck size={16} /> Nothing gets overwritten</span><i /> <span><Headphones size={16} /> Listen before you apply</span></div></section>

      <section className="packs-section container" id="packs">
        <div className="section-heading"><div><p className="eyebrow">The collection</p><h2>{PACK_COUNT} ways to hear<br /><em>your desktop.</em></h2></div><p className="section-intro">The default schemes from Windows 98 through 10, the Windows 7 bonus themes, the Vista themes and the Microsoft Plus! packs — each applied as one cohesive soundscape.</p></div>
        <div className="pack-grid">
          {visiblePacks.map((pack) => (
            <article className="pack-card" key={pack.id}>
              <div
                className="pack-cover"
                style={pack.coverUrl ? undefined : { background: `linear-gradient(135deg, ${pack.gradientFrom}, ${pack.gradientTo})` }}
              >
                {pack.coverUrl && <img src={pack.coverUrl} alt="" loading="lazy" />}
              </div>
              <div className="pack-meta">
                <span>{pack.author}</span>
                <small>{pack.releaseYear ?? ''}</small>
              </div>
              <h3>{pack.name}</h3>
              <p>{pack.soundCount} sounds</p>
              <button
                className="listen-button"
                onClick={() => playPreview(pack.id, pack.previewUrl)}
                disabled={!pack.previewUrl}
              >
                <CirclePlay size={16} /> {playingId === pack.id ? 'Playing…' : 'Listen to preview'}
              </button>
            </article>
          ))}
        </div>
        {PACK_COUNT > FEATURED_COUNT && (
          <button className="expand-button" onClick={() => setShowAll((open) => !open)}>
            {showAll ? 'Show fewer packs' : `Show all ${PACK_COUNT} packs`}
            <ChevronRight size={16} className={showAll ? 'expand-chevron is-open' : 'expand-chevron'} />
          </button>
        )}
      </section>

      <section className="feature-section" id="features"><div className="container"><div className="feature-title"><p className="eyebrow">Small tool, big difference</p><h2>Good sound design<br />is <em>felt, not noticed.</em></h2></div><div className="features-grid">{features.map(({ icon: Icon, title, text }, index) => <article className="feature-card" key={title}><div className="feature-number">0{index + 1}</div><div className="feature-icon"><Icon size={21} /></div><h3>{title}</h3><p>{text}</p><a href="#download">Learn more <ChevronRight size={15} /></a></article>)}</div></div></section>

      <section className="safety-section container" id="safety"><div className="safety-visual"><div className="ring ring-one" /><div className="ring ring-two" /><div className="safe-center"><ShieldCheck size={34} /><span>safe to try</span></div></div><div className="safety-copy"><p className="eyebrow">A little peace of mind</p><h2>It touches little.<br /><em>And only what can be undone.</em></h2><div className="safety-list"><div><Check size={18} /><span><strong>No admin privileges</strong>Runs in your user account, no elevation prompt.</span></div><div><Check size={18} /><span><strong>No system files touched</strong>Only the same user settings Windows already uses.</span></div><div><Check size={18} /><span><strong>Backup on every apply</strong>Go back to your previous sound scheme anytime.</span></div></div></div></section>

      <section className="download-section container" id="download"><div className="download-card"><div><p className="eyebrow">Ready when you are</p><h2>Give your Windows<br /><em>a little more character.</em></h2><p>Free, open source, and made for the sounds you remember.</p></div><a className="download-large" href={downloadHref} onClick={onDownload}><Laptop size={20} /> Download Chimer <small>{versionLabel}</small></a></div></section>

      <footer className="footer container"><a href="#top" className="brand"><img src={iconPath} alt="" className="brand-icon" /><span>chimer</span></a><span>Sound should feel like home.</span><div><a href="#features">About</a><a href={REPO_URL} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13} /></a></div></footer>
      {notice && <div className="toast"><Check size={18} /><div><strong>Opening the releases page</strong><span>The download link could not be resolved automatically.</span></div><button onClick={() => setNotice(false)} aria-label="Close notification"><X size={16} /></button></div>}
    </main>
  );
}

export default App;
