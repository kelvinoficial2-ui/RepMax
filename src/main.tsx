import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from '@/app/page';
import { PwaRegister } from '@/components/pwa-register';
import '@/app/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaRegister />
    <HomePage />
  </StrictMode>,
);
