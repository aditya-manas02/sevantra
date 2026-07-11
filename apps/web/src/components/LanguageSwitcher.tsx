'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-[var(--background)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-primary)] text-sm font-bold rounded-xl transition-all shadow-sm"
      title="Switch Language"
    >
      <Globe className="w-4 h-4" />
      <span>{i18n.language === 'hi' ? 'English' : 'हिन्दी'}</span>
    </button>
  );
}
