"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Compass, CalendarPlus, Building2, UserCircle, Settings, LogOut, Menu, X, CalendarHeart, LifeBuoy } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BottomNav } from "@/components/BottomNav";
import { useTranslation } from "react-i18next";

const navItems = [
  { icon: LayoutDashboard, key: "adminDashboard", href: "/admin", fallback: "Admin Dashboard" },
  { icon: Compass, key: "discoverEvents", href: "/events", fallback: "Discover Events" },
  { icon: CalendarPlus, key: "createEvent", href: "/events/new", fallback: "Create Event" },
  { icon: CalendarHeart, key: "manageEvents", href: "/manage-events", fallback: "Manage Events" },
  { icon: Building2, key: "organizations", href: "/organizations/new", fallback: "Organizations" },
  { icon: UserCircle, key: "myProfile", href: "/profile", fallback: "My Profile" },
  { icon: LifeBuoy, key: "support", href: "/support", fallback: "Support" }
];

import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  const filteredNavItems = navItems.filter(item => {
    if (item.href === '/admin' && user?.role !== 'PLATFORM_ADMIN') return false;
    return true;
  });

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout API failed', e);
    } finally {
      logout();
      router.push('/login');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[var(--surface)]/60 backdrop-blur-xl border-r border-[var(--border)] p-6 relative z-50">
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[var(--border)]">
        <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-soft-sm">
          <span className="text-white font-bold text-xl">S</span>
        </div>
        <span className="text-2xl font-black font-heading tracking-tight text-[var(--primary)]">Sevantra</span>
      </div>

      <nav className="flex-1 space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = 
            item.href === '/events' 
              ? pathname === '/events' 
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div 
                whileHover={{ x: 5 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] transition-all relative overflow-hidden group ${isActive ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/5'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[var(--primary)]' : 'group-hover:text-[var(--primary)]'}`} />
                <span className="font-semibold text-sm">{t(`sidebar.${item.key}`, item.fallback)}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <LanguageSwitcher />
        </div>
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
          <ThemeToggle />
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-[var(--background)]/10"
          >
            <LogOut className="w-4 h-4" />
            {t('sidebar.logout', 'Logout')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans selection:bg-[var(--primary)] selection:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 h-full z-40">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Removed in favor of BottomNav) */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden z-10">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[var(--surface)] border-b border-[var(--border)] z-30">
          <span className="text-xl font-bold font-heading text-[var(--primary)]">Sevantra</span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <button onClick={handleLogout} className="text-red-500 hover:text-red-600 p-1">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-6xl mx-auto min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
          <div className="h-20 md:hidden" /> {/* Spacer for BottomNav */}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
