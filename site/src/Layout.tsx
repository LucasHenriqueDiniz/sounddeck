import { useState, type ReactNode } from 'react';
import { ArrowUpRight, Download, Github, Menu, X } from 'lucide-react';
import { LANGS, LANG_NAMES, hrefFor, type Lang, type Translate } from './i18n';
import { REPO_URL } from './useLatestRelease';

export const ICON_PATH = '/assets/chimer-icon.png';

interface LayoutProps {
  lang: Lang;
  t: Translate;
  downloadHref: string;
  onDownload?: () => void;
  /** Home shows in-page anchors; the other pages link back to sections. */
  homeAnchors?: boolean;
  /**
   * This page's path without the language prefix. Passed in rather than read
   * from window.location so the server and the client render the same hrefs —
   * reading location during SSR yields "/" and mismatches on hydration.
   */
  routePath: string;
  children: ReactNode;
}

export function Layout({ lang, t, downloadHref, onDownload, homeAnchors, routePath, children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const home = hrefFor(lang, '/');
  const anchor = (hash: string) => (homeAnchors ? hash : `${home}${hash}`);

  return (
    <main className="site-shell">
      <div className="grain" aria-hidden="true" />

      <nav className="nav container">
        <a href={home} className="brand" aria-label={t('a11y.home')}>
          <img src={ICON_PATH} alt="" className="brand-icon" />
          <span>chimer</span>
        </a>
        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          <a href={anchor('#packs')} onClick={() => setMenuOpen(false)}>{t('nav.packs')}</a>
          <a href={anchor('#features')} onClick={() => setMenuOpen(false)}>{t('nav.howItWorks')}</a>
          <a href={hrefFor(lang, '/changelog')} onClick={() => setMenuOpen(false)}>{t('nav.changelog')}</a>
          <a href={hrefFor(lang, '/download')} onClick={() => setMenuOpen(false)}>{t('nav.download')}</a>
        </div>
        <div className="nav-actions">
          <a className="github-link" href={REPO_URL} target="_blank" rel="noreferrer">
            <Github size={16} /> {t('nav.openSource')}
          </a>
          <a className="nav-download" href={downloadHref} onClick={onDownload}>
            <Download size={16} /> {t('nav.get')}
          </a>
          <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={t('a11y.menu')}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {children}

      <footer className="footer container">
        <a href={home} className="brand">
          <img src={ICON_PATH} alt="" className="brand-icon" />
          <span>chimer</span>
        </a>
        <span>{t('foot.tagline')}</span>
        <div>
          <a href={hrefFor(lang, '/privacy')}>{t('foot.privacy')}</a>
          <a href={hrefFor(lang, '/changelog')}>{t('foot.changelog')}</a>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>

      {/*
        Real links, one per language, rather than a JavaScript switcher. A
        switcher is why only the default language ever got indexed.
      */}
      <nav className="lang-bar container" aria-label={t('lang.label')}>
        {LANGS.map((code) => (
          <a key={code} href={hrefFor(code, routePath)} className={code === lang ? 'is-current' : ''} hrefLang={code}>
            {LANG_NAMES[code]}
          </a>
        ))}
      </nav>

      <p className="legal container">{t('foot.legal')}</p>
    </main>
  );
}
