'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const CONSENT_KEY = 'cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
        >
          <div
            className="card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-2) 100%)',
              }}
            >
              <Cookie className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Cookies Necessários
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Utilizamos cookies para salvar sua watchlist de ações entre sessões.
                Sem eles, suas seleções não serão preservadas.
              </p>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={decline}
                className="px-4 py-2 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors"
                style={{
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-btn)',
                }}
              >
                <X className="w-3 h-3" />
                Recusar
              </button>
              <button
                onClick={accept}
                className="px-5 py-2 text-xs font-semibold text-white rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-2) 100%)',
                  borderRadius: 'var(--radius-btn)',
                }}
              >
                Aceitar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
