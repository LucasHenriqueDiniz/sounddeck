import { useState } from 'react';
import { Home } from './pages/Home';
import { ChangelogPage, DownloadPage, NotFoundPage, PrivacyPage } from './pages/Pages';
import { RELEASES_URL, useLatestRelease } from './useLatestRelease';
import { translator, type Lang } from './i18n';
import type { RouteId } from './routes';

export interface AppProps {
  lang: Lang;
  route: RouteId;
}

export function App({ lang, route }: AppProps) {
  const t = translator(lang);
  const [notice, setNotice] = useState(false);
  const { release, failed } = useLatestRelease();

  // Until the API answers, point at the releases page: it always resolves, so
  // the button is never dead, it just takes one extra click.
  const downloadHref = release?.downloadUrl ?? RELEASES_URL;

  const onDownload = () => {
    if (release || !failed) return;
    // Only nag when the lookup is known to have failed.
    setNotice(true);
    window.setTimeout(() => setNotice(false), 4200);
  };

  const shared = { lang, t, downloadHref, onDownload };

  switch (route) {
    case 'download':
      return <DownloadPage {...shared} />;
    case 'changelog':
      return <ChangelogPage {...shared} />;
    case 'privacy':
      return <PrivacyPage {...shared} />;
    case 'notFound':
      return <NotFoundPage {...shared} />;
    default:
      return (
        <Home
          {...shared}
          version={release?.version ?? null}
          notice={notice}
          dismissNotice={() => setNotice(false)}
        />
      );
  }
}
