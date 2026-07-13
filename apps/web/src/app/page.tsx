"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Users, Calendar, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Home() {
  const { t } = useTranslation();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  const { data: stats } = useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const response = await api.get('/public/stats');
      return response.data;
    }
  });

  return (
    <div className="min-h-screen animated-gradient-bg flex flex-col overflow-hidden relative">
      {/* Navbar */}
      <nav className="glass fixed top-0 w-full z-50 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <Heart className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-bold font-heading text-[var(--text-primary)]">Sevantra</span>
        </div>
        <div className="flex gap-2 md:gap-4 items-center">
          <LanguageSwitcher />
          <div className="hidden md:flex gap-4 items-center">
            <Link href="/login">
              <Button variant="outline" className="glass hover:bg-[var(--primary)] hover:text-white transition-colors border-[var(--primary)] text-[var(--primary)]">{t('landing.signIn', 'Sign In')}</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-lg shadow-orange-500/30">{t('landing.getStarted', 'Get Started')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4 text-center z-10 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 rounded-full glass border border-[var(--primary)] text-[var(--primary)] font-medium text-xs md:text-sm mb-4">
            {t('landing.elevating', '✨ Elevating Civic Engagement')}
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-black font-heading text-[var(--text-primary)] tracking-tight leading-tight px-2">
            {t('landing.titleConnect', 'Connect. Act.')} <br className="hidden md:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">{t('landing.titleTransform', 'Transform.')}</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto font-medium px-4">
            {t('landing.subtitle', 'Sevantra is the modern platform bridging the gap between citizens, NGOs, and local governance. Build a better community today.')}
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 justify-center pt-4 w-full px-6">
            <Link href="/events" className="w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto h-14 px-8 text-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] hover:scale-105 transition-transform shadow-xl shadow-orange-500/20 rounded-full">
                {t('landing.exploreEvents', 'Explore Events')}
              </Button>
            </Link>
            <Link href="/login" className="w-full md:w-auto md:hidden">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg glass border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white rounded-full">
                {t('landing.signIn', 'Sign In')}
              </Button>
            </Link>
            <Link href="/organizations/new" className="w-full md:w-auto hidden md:block">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg glass border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white hover:scale-105 transition-all rounded-full">
                {t('landing.registerNGO', 'Register NGO')}
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto w-full relative z-20">
          {[
            { icon: Users, title: stats?.volunteers ? `${stats.volunteers}+` : "10,000+", desc: t('landing.activeVolunteers', 'Active Volunteers'), color: "text-blue-500", bg: "bg-[var(--background)]0/10" },
            { icon: Calendar, title: stats?.events ? `${stats.events}+` : "500+", desc: t('landing.communityEvents', 'Community Events'), color: "text-green-500", bg: "bg-[var(--background)]0/10" },
            { icon: MapPin, title: stats?.cities ? `${stats.cities}+` : "50+", desc: t('landing.citiesCovered', 'Cities Covered'), color: "text-orange-500", bg: "bg-orange-500/10" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.2, type: "spring" }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="glass p-8 rounded-2xl shadow-warm-md text-left border border-[var(--border)] relative overflow-hidden group cursor-pointer"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150`} />
              <stat.icon className={`w-10 h-10 ${stat.color} mb-4`} />
              <h3 className="text-3xl font-black font-heading text-[var(--text-primary)]">{stat.title}</h3>
              <p className="text-[var(--text-secondary)] font-medium">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
      
      {/* Ambient background blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--secondary)]/20 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
