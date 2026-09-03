import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from '@/app/page';
import { PwaRegister } from '@/components/pwa-register';
import '@/app/globals.css';
import { canonicalAppUrl } from '@/lib/app-origin.mjs';

const canonicalUrl = canonicalAppUrl(window.location.href);
if (canonicalUrl) {
  window.location.replace(canonicalUrl);
} else {
  createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaRegister />
    <HomePage />
  </StrictMode>,
);
}
