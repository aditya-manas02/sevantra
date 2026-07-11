'use client';

import React, { useEffect, useState } from 'react';
import '../i18n/config'; // Initializes i18next

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Wait until mounted on client to prevent hydration mismatch
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render children without translations on the server to avoid hydration errors
    return <>{children}</>;
  }

  return <>{children}</>;
}
