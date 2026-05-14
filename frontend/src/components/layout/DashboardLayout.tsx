"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#050810] overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#050810]/80 backdrop-blur-xl flex-shrink-0">
          <div>
            {title && (
              <h1 className="font-heading text-xl font-bold text-white">{title}</h1>
            )}
            {subtitle && (
              <p className="text-white/40 text-sm mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 glass border border-white/8 rounded-xl px-3 py-2 w-48">
              <Search className="w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-white/60 placeholder:text-white/20 outline-none w-full"
              />
            </div>

            {/* Notifications */}
            <button className="relative w-9 h-9 glass border border-white/8 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
              U
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
