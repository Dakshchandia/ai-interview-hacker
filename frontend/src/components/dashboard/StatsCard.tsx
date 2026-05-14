"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  change: number;       // e.g. +12 or -5
  changeLabel?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  delay?: number;
}

export function StatsCard({
  title, value, suffix = "", prefix = "",
  change, changeLabel = "vs last week",
  icon: Icon, iconColor, iconBg, delay = 0,
}: StatsCardProps) {
  const positive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="glass rounded-2xl border border-white/5 hover:border-white/10 p-6 transition-all duration-300 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg",
          positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
        )}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {positive ? "+" : ""}{change}%
        </div>
      </div>

      <div className="text-3xl font-bold font-heading text-white mb-1">
        <AnimatedCounter end={value} suffix={suffix} prefix={prefix} duration={1500} />
      </div>
      <div className="text-sm text-white/40">{title}</div>
      <div className="text-xs text-white/20 mt-1">{changeLabel}</div>
    </motion.div>
  );
}
