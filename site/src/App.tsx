import { useState } from 'react';
import { useLatestRelease, RELEASES_URL } from './useLatestRelease';
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
  Volume2,
  X,
} from 'lucide-react';

const iconPath = '/assets/chimer-icon.png';
const REPO = 'LucasHenriqueDiniz/sounddeck';
const REPO_URL = `https://github.com/${REPO}`;

// A selection from the published catalog. Every name here is a real pack —
// the mock shipped invented "Minimal" and "Calm" entries.
const packs = [
  { name: 'Windows XP', detail: 'Bright, familiar cues', color: '#f0a15f', tag: 'Classic' },
  { name: 'Windows Vista', detail: 'Soft and cinematic', color: '#cf6d82', tag: 'Atmospheric' },
  { name: 'Windows 7', detail: 'Quiet, polished tones', color: '#7d9ca1', tag: 'Balanced' },
  { name: 'Windows 98', detail: 'Where it all started', color: '#8d8a82', tag: 'Classic' },
  { name: 'Microsoft Plus!', detail: 'Jungle, Utopia and friends', color: '#a4a878', tag: 'Themed' },
];

const features = [
  { icon: Sparkles, title: 'Pack library', text: 'Preview complete sound schemes and switch your system mood in one click.' },
  { icon: SlidersHorizontal, title: 'Event-by-event editor', text: 'Fine-tune a single notification, startup sound, or alert without the noise.' },
  { icon: History, title: 'Safe by default', text: 'Every change is backed up, reversible, and made without touching system files.' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const { release, failed } = useLatestRelease();

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
          <h1>Make Windows<br /><em>sound like yours.</em></h1>
          <p className="hero-text">Chimer brings back the character of Windows sounds. Pick a pack, hear the preview, and make it yours in one click.</p>
          <div className="hero-actions">
            <a className="primary-button" href={downloadHref} onClick={onDownload}><ArrowDownToLine size={18} /> Download for Windows</a>
            <a className="text-link" href="#packs">Explore the packs <ArrowUpRight size={16} /></a>
          </div>
          <div className="hero-note"><Check size={15} /> Free and open source <span /> No admin privileges</div>
        </div>
        <div className="hero-art" aria-label="Chimer app interface">
          <div className="screenshot-frame">
            <div className="screenshot-topline"><span className="screenshot-dot" /><span>Chimer · Library</span><span className="screenshot-caption">The real app</span></div>
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
        <div className="section-heading"><div><p className="eyebrow">The collection</p><h2>Thirty ways to hear<br /><em>your desktop.</em></h2></div><p className="section-intro">The default schemes from Windows 98 through 10, the Windows 7 bonus themes, the Vista themes and the Microsoft Plus! packs — each applied as one cohesive soundscape.</p></div>
        <div className="pack-grid">{packs.map((pack, index) => <article className={`pack-card ${index === 0 ? 'featured-pack' : ''}`} key={pack.name}><div className="pack-swatch" style={{ background: `linear-gradient(135deg, ${pack.color}, #242323)` }}><Volume2 size={20} /></div><div className="pack-meta"><span>{pack.tag}</span><small>0{index + 1}</small></div><h3>{pack.name}</h3><p>{pack.detail}</p><button className="listen-button"><CirclePlay size={16} /> Listen to preview</button></article>)}</div>
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
