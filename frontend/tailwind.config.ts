import type { Config } from 'tailwindcss';

// Tailwind v4 — theme tokens are defined via @theme in globals.css.
// This file is kept for content-path overrides and future JS-based config.
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
};

export default config;
