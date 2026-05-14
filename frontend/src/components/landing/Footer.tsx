"use client";

import { motion } from "framer-motion";
import { Brain, Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading font-bold text-white">AI Interview Hacker</span>
        </Link>
        <p className="text-white/30 text-sm">© 2025 AI Interview Hacker. Built for hackathon.</p>
        <div className="flex items-center gap-3">
          {[Github, Twitter, Linkedin].map((Icon, i) => (
            <motion.a key={i} href="#" whileHover={{ scale: 1.1, y: -2 }} className="w-9 h-9 glass border border-white/10 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <Icon className="w-4 h-4" />
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
}
