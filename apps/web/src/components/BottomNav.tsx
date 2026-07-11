import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Compass, CalendarPlus, UserCircle, LifeBuoy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { icon: Compass, key: "discoverEvents", href: "/events", fallback: "Events" },
    { icon: CalendarPlus, key: "createEvent", href: "/events/new", fallback: "Create" },
    { icon: UserCircle, key: "myProfile", href: "/profile", fallback: "Profile" },
    { icon: LifeBuoy, key: "support", href: "/support", fallback: "Support" }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--surface)]/90 backdrop-blur-xl border-t border-[var(--border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = 
          item.href === '/events' 
            ? pathname === '/events' 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center justify-center relative h-full">
            <div className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}>
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'drop-shadow-md' : ''}`} />
              <span className="text-[10px] font-bold tracking-tight">{t(`sidebar.${item.key}`, item.fallback)}</span>
              
              {isActive && (
                <motion.div 
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-8 h-1 bg-[var(--primary)] rounded-b-full shadow-[0_2px_8px_var(--primary)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
