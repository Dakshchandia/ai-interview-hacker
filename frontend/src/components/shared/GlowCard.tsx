"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "purple" | "blue" | "cyan" | "green" | "pink";
  hover?: boolean;
  delay?: number;
}

const glowMap: Record<string, string> = {
  purple: "hover:shadow-glow-purple hover:border-purple-500/30",
  blue: "hover:shadow-glow-blue hover:border-blue-500/30",
  cyan: "hover:shadow-glow-cyan hover:border-cyan-500/30",
  green: "hover:shadow-glow-green hover:border-emerald-500/30",
  pink: "hover:border-pink-500/30",
};

export function GlowCard({
  children,
  className,
  glowColor = "purple",
  hover = true,
  delay = 0,
}: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      className={cn(
        "glass rounded-2xl border border-white/5 transition-all duration-300",
        hover && glowMap[glowColor],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
