export const APP_HOST = 'repmax-c5c87.firebaseapp.com';
export const APP_RELEASE = '2026.09.05-26';

// Only migrate the known Hosting alias. Never trust a query parameter or
// redirect auth helper URLs, and never redirect back from the canonical host.
export function canonicalAppUrl(href) {
  const url = new URL(href);
  if (
    url.hostname !== 'repmax-c5c87.web.app' ||
    url.pathname.startsWith('/__/')
  ) {
    return null;
  }
  url.protocol = 'https:';
  url.host = APP_HOST;
  return url.href;
}
