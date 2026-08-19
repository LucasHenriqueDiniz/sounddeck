import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';
import { translator, type Lang } from './i18n';
import { routeById, type RouteId } from './routes';

export interface RenderResult {
  html: string;
  title: string;
  description: string;
}

/**
 * Renders one (language, page) pair to a string. Called by scripts/prerender.mjs
 * once per page so every URL ships real translated HTML — the reason this site
 * is prerendered at all rather than shipped as a plain SPA.
 */
export function render(lang: Lang, routeId: RouteId): RenderResult {
  const t = translator(lang);
  const route = routeById(routeId);

  return {
    html: renderToString(
      <StrictMode>
        <App lang={lang} route={routeId} />
      </StrictMode>,
    ),
    title: t(route.titleKey),
    description: t(route.descKey),
  };
}

export { allPages } from './routes';
export { LANGS, hrefFor } from './i18n';
