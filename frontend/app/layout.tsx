import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import CookieConsent from '@/components/CookieConsent';
import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

export const metadata: Metadata = {
  title: 'Investchê — Aporto?',
  description: 'Valuation de ações brasileiras — Modelo Graham & Bazin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${cormorant.variable} antialiased`}>
        <ThemeProvider>
          <Header />
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
