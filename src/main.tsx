import '@mantine/core/styles.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import {
  MantineProvider,
  createTheme,
  localStorageColorSchemeManager,
} from '@mantine/core';
import { registerSW } from 'virtual:pwa-register';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

registerSW({ immediate: true });

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'sdd-planner:color-scheme',
});

const theme = createTheme({
  fontFamily: 'Manrope, Arial, sans-serif',
  headings: {
    fontFamily: 'Space Grotesk, Manrope, Arial, sans-serif',
  },
  primaryColor: 'orange',
  colors: {
    dark: [
      '#f3f4f6',
      '#d8dde3',
      '#bec6cf',
      '#a6b1bc',
      '#8b99a8',
      '#748294',
      '#5d6a79',
      '#3f4955',
      '#20262e',
      '#14181d',
    ],
    orange: [
      '#fff3ec',
      '#ffe1d2',
      '#ffc1a1',
      '#fda16f',
      '#f68a52',
      '#f97352',
      '#dd5f41',
      '#b94d33',
      '#953d27',
      '#732d1b',
    ],
  },
});

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <MantineProvider
      theme={theme}
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme="auto"
    >
      <App />
    </MantineProvider>
  </StrictMode>,
);
