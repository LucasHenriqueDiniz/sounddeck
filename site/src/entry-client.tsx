import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { resolve } from './routes';
import './index.css';

/**
 * Hydrates the prerendered HTML rather than replacing it. The language and
 * page are derived from the URL, which is what the prerenderer used to write
 * this file — so the first client render matches the served markup and React
 * doesn't throw the tree away.
 */
const { lang, id } = resolve(window.location.pathname);

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <App lang={lang} route={id} />
  </StrictMode>,
);
