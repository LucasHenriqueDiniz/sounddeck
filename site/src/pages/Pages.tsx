import { ArrowUpRight, Check, Download, FileText, Package, ShieldCheck } from 'lucide-react';
import { Layout } from '../Layout';
import { REPO_URL, useReleases, type Release } from '../useLatestRelease';
import { hrefFor, type Lang, type Translate } from '../i18n';

interface PageProps {
  lang: Lang;
  t: Translate;
  downloadHref: string;
  onDownload: () => void;
}

/** Formats an ISO date in the page's own language. */
function formatDate(iso: string, lang: Lang): string {
  try {
    return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function DownloadPage({ lang, t, downloadHref, onDownload }: PageProps) {
  const { releases, loading } = useReleases();
  const latest: Release | undefined = releases[0];
  const asset = (ext: string) => latest?.assets.find((a) => a.name.endsWith(ext));

  return (
    <Layout lang={lang} t={t} downloadHref={downloadHref} onDownload={onDownload} routePath="/download">
      <section className="page container">
        <h1>{t('dl.title')}</h1>
        <p className="page-sub">{t('dl.sub')}</p>

        {loading && <p className="page-note">{t('dl.loading')}</p>}

        {!loading && !latest && (
          <div className="page-card">
            <h2>{t('dl.none.h')}</h2>
            <p>{t('dl.none.p')}</p>
            <a className="primary-button" href={REPO_URL} target="_blank" rel="noreferrer">{t('dl.none.cta')}</a>
          </div>
        )}

        {latest && (
          <div className="page-card">
            <p className="page-note">
              v{latest.tag_name.replace(/^v/, '')} · {t('dl.published')} {formatDate(latest.published_at, lang)}
            </p>
            <div className="asset-list">
              {asset('.exe') && (
                <a className="asset" href={asset('.exe')!.browser_download_url}>
                  <Download size={18} /> {t('dl.exe')}
                </a>
              )}
              {asset('.msi') && (
                <a className="asset" href={asset('.msi')!.browser_download_url}>
                  <Package size={18} /> {t('dl.msi')}
                </a>
              )}
            </div>
            <a className="text-link" href={latest.html_url} target="_blank" rel="noreferrer">
              {t('dl.viewrelease')} <ArrowUpRight size={15} />
            </a>
          </div>
        )}

        <h2 className="page-h2">{t('dl.steps.h')}</h2>
        <ol className="page-steps">
          <li>{t('dl.s1')}</li>
          <li>{t('dl.s2')}</li>
          <li>{t('dl.s3')}</li>
        </ol>

        <h2 className="page-h2">{t('dl.req.h')}</h2>
        <ul className="page-list">
          <li><Check size={16} /> {t('dl.req1')}</li>
          <li><Check size={16} /> {t('dl.req2')}</li>
          <li><Check size={16} /> {t('dl.req3')}</li>
        </ul>

        <h2 className="page-h2">{t('dl.ver.h')}</h2>
        <p className="page-body"><ShieldCheck size={16} /> {t('dl.ver.p')}</p>
      </section>
    </Layout>
  );
}

export function ChangelogPage({ lang, t, downloadHref, onDownload }: PageProps) {
  const { releases, loading } = useReleases();

  return (
    <Layout lang={lang} t={t} downloadHref={downloadHref} onDownload={onDownload} routePath="/changelog">
      <section className="page container">
        <h1>{t('cl.title')}</h1>
        <p className="page-sub">{t('cl.sub')}</p>

        {loading && <p className="page-note">{t('dl.loading')}</p>}

        {!loading && releases.length === 0 && (
          <div className="page-card">
            <h2>{t('cl.none.h')}</h2>
            <p>{t('cl.none.p')}</p>
            <a className="primary-button" href={REPO_URL} target="_blank" rel="noreferrer">{t('cl.none.cta')}</a>
          </div>
        )}

        {releases.map((release, index) => (
          <article className="release" key={release.tag_name}>
            <header>
              <h2>{release.tag_name}</h2>
              {index === 0 && <span className="release-badge">{t('cl.latest')}</span>}
              <span className="release-date">{formatDate(release.published_at, lang)}</span>
            </header>
            {/*
              One bullet per line, straight from the release body. The notes
              are written once, when publishing, and rendered here and in the
              app's "what's new" dialog — never duplicated into the repo.
            */}
            <ul>
              {release.body
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line, i) => <li key={i}>{line.replace(/^[-*]\s*/, '')}</li>)}
            </ul>
            <a className="text-link" href={release.html_url} target="_blank" rel="noreferrer">
              {t('cl.viewrelease')} <ArrowUpRight size={15} />
            </a>
          </article>
        ))}
      </section>
    </Layout>
  );
}

export function PrivacyPage({ lang, t, downloadHref, onDownload }: PageProps) {
  const sections = [
    { h: t('pv.h1'), p: t('pv.p1') },
    { h: t('pv.h2'), p: t('pv.p2') },
    { h: t('pv.h3'), p: t('pv.p3') },
    { h: t('pv.h4'), p: t('pv.p4') },
    { h: t('pv.h5'), p: t('pv.p5') },
  ];

  return (
    <Layout lang={lang} t={t} downloadHref={downloadHref} onDownload={onDownload} routePath="/privacy">
      <section className="page container">
        <h1>{t('pv.title')}</h1>
        <p className="page-sub">{t('pv.sub')}</p>
        {sections.map((section) => (
          <div key={section.h}>
            <h2 className="page-h2">{section.h}</h2>
            <p className="page-body">{section.p}</p>
          </div>
        ))}
        <p className="page-note"><FileText size={15} /> {t('pv.updated')}</p>
      </section>
    </Layout>
  );
}

export function NotFoundPage({ lang, t, downloadHref, onDownload }: PageProps) {
  return (
    <Layout lang={lang} t={t} downloadHref={downloadHref} onDownload={onDownload} routePath="/404">
      <section className="page container page-404">
        <p className="eyebrow">{t('nf.code')}</p>
        <h1>{t('nf.h')}</h1>
        <p className="page-sub">{t('nf.p')}</p>
        <div className="hero-actions">
          <a className="primary-button" href={hrefFor(lang, '/')}>{t('nf.cta')}</a>
          <a className="text-link" href={hrefFor(lang, '/download')}>{t('nav.download')} <ArrowUpRight size={15} /></a>
        </div>
      </section>
    </Layout>
  );
}
