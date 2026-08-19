import type { Lang, TranslationKey } from './i18n';
import { LANGS, hrefFor } from './i18n';

export type RouteId = 'home' | 'download' | 'changelog' | 'privacy' | 'notFound';

interface RouteDef {
  id: RouteId;
  /** Path relative to the language prefix. */
  path: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

export const ROUTES: RouteDef[] = [
  { id: 'home', path: '/', titleKey: 'meta.index.title', descKey: 'meta.index.desc' },
  { id: 'download', path: '/download', titleKey: 'meta.download.title', descKey: 'meta.download.desc' },
  { id: 'changelog', path: '/changelog', titleKey: 'meta.changelog.title', descKey: 'meta.changelog.desc' },
  { id: 'privacy', path: '/privacy', titleKey: 'meta.privacy.title', descKey: 'meta.privacy.desc' },
  { id: 'notFound', path: '/404', titleKey: 'meta.404.title', descKey: 'meta.404.desc' },
];

export function routeById(id: RouteId): RouteDef {
  const route = ROUTES.find((r) => r.id === id);
  if (!route) throw new Error(`unknown route: ${id}`);
  return route;
}

/** Every (language, page) pair the build emits. */
export function allPages(): Array<{ lang: Lang; route: RouteDef; url: string }> {
  const pages = [];
  for (const lang of LANGS) {
    for (const route of ROUTES) {
      // hrefFor is the single place the canonical URL shape is decided, so
      // the sitemap, the canonical tag and every link agree by construction.
      pages.push({ lang, route, url: hrefFor(lang, route.path) });
    }
  }
  return pages;
}

/**
 * Resolves a pathname to a language and page. Used by the client on hydration
 * so it agrees with whatever the prerenderer wrote into that file.
 */
export function resolve(pathname: string): { lang: Lang; id: RouteId } {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const segments = clean.split('/').filter(Boolean);

  let lang: Lang = 'en';
  if (segments.length && (LANGS as readonly string[]).includes(segments[0])) {
    lang = segments.shift() as Lang;
  }

  const rest = `/${segments.join('/')}`;
  const route = ROUTES.find((r) => r.path === rest);
  return { lang, id: route ? route.id : 'notFound' };
}
