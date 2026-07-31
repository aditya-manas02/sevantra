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

  const isHindi = i18n.language?.startsWith('hi');

  const toggleLanguage = () => {
    const newLang = isHindi ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', newLang);
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-[var(--background)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-primary)] text-sm font-bold rounded-xl transition-all shadow-sm"
      title="Switch Language / भाषा बदलें"
    >
      <Globe className="w-4 h-4" />
      <span>{isHindi ? 'English' : 'हिन्दी'}</span>
    </button>
  );
}
