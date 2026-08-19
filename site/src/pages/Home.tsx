import { useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronRight,
  CirclePlay,
  Headphones,
  History,
  Laptop,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { Layout } from '../Layout';
import { PACKS, PACK_COUNT } from '../packs.generated';
import type { Lang, Translate, TranslationKey } from '../i18n';
import { hrefFor } from '../i18n';

/** How many cards show before the grid is expanded. */
const FEATURED_COUNT = 6;

interface HomeProps {
  lang: Lang;
  t: Translate;
  downloadHref: string;
  version: string | null;
  onDownload: () => void;
  notice: boolean;
  dismissNotice: () => void;
}

export function Home({ lang, t, downloadHref, version, onDownload, notice, dismissNotice }: HomeProps) {
  const [showAll, setShowAll] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const visiblePacks = showAll ? PACKS : PACKS.slice(0, FEATURED_COUNT);
  const versionLabel = version ? `${t('d.os')} · v${version}` : t('d.os');

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

  const features = [
    { icon: Sparkles, title: t('f.oneTitle'), text: t('f.oneText') },
    { icon: SlidersHorizontal, title: t('f.twoTitle'), text: t('f.twoText') },
    { icon: History, title: t('f.threeTitle'), text: t('f.threeText') },
  ];

  const steps = [
    { title: t('how.oneTitle'), text: t('how.oneText') },
    { title: t('how.twoTitle'), text: t('how.twoText') },
    { title: t('how.threeTitle'), text: t('how.threeText') },
  ];

  const faqs = ([1, 2, 3, 4, 5] as const).map((n) => ({
    question: t(`faq.q${n}` as TranslationKey),
    answer: t(`faq.a${n}` as TranslationKey),
  }));

  return (
    <Layout lang={lang} t={t} downloadHref={downloadHref} onDownload={onDownload} homeAnchors routePath="/">
      <section className="hero container" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> {t('h.eyebrow')}</div>
          <h1>{t('h.title')}<br /><em>{t('h.titleEm')}</em></h1>
          <p className="hero-text">{t('h.text')}</p>
          <div className="hero-actions">
            <a className="primary-button" href={downloadHref} onClick={onDownload}>
              <ArrowDownToLine size={18} /> {t('h.cta')}
            </a>
            <a className="text-link" href="#packs">{t('h.explore')} <ArrowUpRight size={16} /></a>
          </div>
          <div className="hero-note"><Check size={15} /> {t('h.free')} <span /> {t('h.noAdmin')}</div>
        </div>
        <div className="hero-art">
          <div className="screenshot-frame">
            {/*
              The LCP element. As a PNG it was 786 KB, dwarfing the 4 KB of
              compressed HTML around it; AVIF is 51 KB and WebP 86 KB for the
              same pixels. width/height are intrinsic, so the frame reserves
              its space before the bytes land and the hero doesn't shift.
            */}
            <picture>
              <source srcSet="/img/app-screenshot.avif" type="image/avif" />
              <source srcSet="/img/app-screenshot.webp" type="image/webp" />
              <img
                src="/img/app-screenshot.png"
                alt={t('a11y.shot')}
                width={1280}
                height={800}
                fetchpriority="high"
              />
            </picture>
          </div>
          <div className="floating-label">
            <span className="label-icon"><Sparkles size={15} /></span>
            <div><strong>{t('h.explore')}</strong><small>{t('c.eyebrow')}</small></div>
          </div>
        </div>
      </section>

      <section className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span><Headphones size={16} /> {t('t.listen')}</span><i />
          <span><RotateCcw size={16} /> {t('t.undo')}</span><i />
          <span><ShieldCheck size={16} /> {t('t.nothing')}</span><i />
          <span><Headphones size={16} /> {t('t.listen')}</span>
        </div>
      </section>

      <section className="packs-section container" id="packs">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t('c.eyebrow')}</p>
            <h2>{t('c.title', { count: PACK_COUNT })}<br /><em>{t('c.titleEm')}</em></h2>
          </div>
          <p className="section-intro">{t('c.intro')}</p>
        </div>
        <div className="pack-grid">
          {visiblePacks.map((pack) => (
            <article className="pack-card" key={pack.id}>
              <div
                className="pack-cover"
                style={pack.coverUrl ? undefined : { background: `linear-gradient(135deg, ${pack.gradientFrom}, ${pack.gradientTo})` }}
              >
                {pack.coverUrl && <img src={pack.coverUrl} alt={t('a11y.cover', { name: pack.name })} loading="lazy" />}
              </div>
              <div className="pack-meta">
                <span>{pack.author}</span>
                <small>{pack.releaseYear ?? ''}</small>
              </div>
              <h3>{pack.name}</h3>
              <p>{t('c.sounds', { count: pack.soundCount })}</p>
              <button className="listen-button" onClick={() => playPreview(pack.id, pack.previewUrl)} disabled={!pack.previewUrl}>
                <CirclePlay size={16} /> {playingId === pack.id ? t('c.playing') : t('c.listen')}
              </button>
            </article>
          ))}
        </div>
        {PACK_COUNT > FEATURED_COUNT && (
          <button className="expand-button" onClick={() => setShowAll((open) => !open)}>
            {showAll ? t('c.showFewer') : t('c.showAll', { count: PACK_COUNT })}
            <ChevronRight size={16} className={showAll ? 'expand-chevron is-open' : 'expand-chevron'} />
          </button>
        )}
      </section>

      <section className="feature-section" id="features">
        <div className="container">
          <div className="feature-title">
            <p className="eyebrow">{t('f.eyebrow')}</p>
            <h2>{t('f.title')}<br /><em>{t('f.titleEm')}</em></h2>
          </div>
          <div className="features-grid">
            {features.map(({ icon: Icon, title, text }, index) => (
              <article className="feature-card" key={title}>
                <div className="feature-number">0{index + 1}</div>
                <div className="feature-icon"><Icon size={21} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
                <a href={hrefFor(lang, '/download')}>{t('f.more')} <ChevronRight size={15} /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="safety-section container" id="safety">
        <div className="safety-visual" aria-hidden="true">
          <div className="ring ring-one" />
          <div className="ring ring-two" />
          <div className="safe-center"><ShieldCheck size={34} /><span>{t('s.badge')}</span></div>
        </div>
        <div className="safety-copy">
          <p className="eyebrow">{t('s.eyebrow')}</p>
          <h2>{t('s.title')}<br /><em>{t('s.titleEm')}</em></h2>
          <div className="safety-list">
            <div><Check size={18} /><span><strong>{t('s.oneTitle')}</strong>{t('s.oneText')}</span></div>
            <div><Check size={18} /><span><strong>{t('s.twoTitle')}</strong>{t('s.twoText')}</span></div>
            <div><Check size={18} /><span><strong>{t('s.threeTitle')}</strong>{t('s.threeText')}</span></div>
          </div>
        </div>
      </section>

      {/*
        The page previously said what Chimer is but never answered the thing
        people actually search for — how you change a Windows sound at all.
        These two sections carry that, including the manual Control Panel
        route, which is worth stating plainly even though it argues against
        needing the app.
      */}
      <section className="how-section container" id="how">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t('how.eyebrow')}</p>
            <h2>{t('how.title')}<br /><em>{t('how.titleEm')}</em></h2>
          </div>
          <p className="section-intro">{t('how.intro')}</p>
        </div>
        <ol className="how-grid">
          {steps.map(({ title, text }, index) => (
            <li className="step-card" key={title}>
              <div className="feature-number">0{index + 1}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="manual-note">
          <h3>{t('how.manualTitle')}</h3>
          <p>{t('how.manualText')}</p>
        </div>
      </section>

      <section className="faq-section container" id="faq">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t('faq.eyebrow')}</p>
            <h2>{t('faq.title')}<br /><em>{t('faq.titleEm')}</em></h2>
          </div>
        </div>
        <div className="faq-list">
          {faqs.map(({ question, answer }) => (
            <div key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="download-section container" id="download">
        <div className="download-card">
          <div>
            <p className="eyebrow">{t('d.eyebrow')}</p>
            <h2>{t('d.title')}<br /><em>{t('d.titleEm')}</em></h2>
            <p>{t('d.text')}</p>
          </div>
          <a className="download-large" href={downloadHref} onClick={onDownload}>
            <Laptop size={20} /> {t('d.cta')} <small>{versionLabel}</small>
          </a>
        </div>
      </section>

      {notice && (
        <div className="toast">
          <Check size={18} />
          <div><strong>{t('toast.title')}</strong><span>{t('toast.text')}</span></div>
          <button onClick={dismissNotice} aria-label={t('a11y.close')}><ArrowUpRight size={16} /></button>
        </div>
      )}
    </Layout>
  );
}
