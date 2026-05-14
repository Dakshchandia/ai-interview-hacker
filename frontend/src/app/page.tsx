"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Brain, Menu, X } from "lucide-react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { DemoPreview } from "@/components/landing/DemoPreview";
import { Footer } from "@/components/landing/Footer";

function scrollToSection(href: string) {
  if (href.startsWith("#")) {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Dashboard", href: "/dashboard" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass border border-white/8 rounded-2xl px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-glow-purple">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-white">AI Interview Hacker</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="text-white/60 hover:text-white text-sm font-medium transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.label} href={link.href} className="text-white/60 hover:text-white text-sm font-medium transition-colors">
                  {link.label}
                </Link>
              )
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-glow-purple transition-all"
              >
                Get Started Free
              </motion.button>
            </Link>
          </div>

          <button className="md:hidden text-white/60 hover:text-white" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong border border-white/10 rounded-2xl mt-2 p-4 flex flex-col gap-3"
          >
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <button
                  key={link.label}
                  onClick={() => { scrollToSection(link.href); setOpen(false); }}
                  className="text-white/70 hover:text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-all text-left w-full"
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.label} href={link.href} className="text-white/70 hover:text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-white/5 transition-all" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              )
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}

const testimonials = [
  { name: "Priya Sharma", role: "SDE @ Google", text: "Practiced 30+ mock interviews here. The AI feedback was spot-on. Got my Google offer in 3 weeks.", avatar: "PS", color: "purple" },
  { name: "Rahul Verma", role: "Backend Engineer @ Amazon", text: "The resume analyzer found 12 missing keywords I never noticed. ATS score went from 54 to 91.", avatar: "RV", color: "blue" },
  { name: "Aisha Khan", role: "Full Stack Dev @ Microsoft", text: "The personalized roadmap was a game changer. Knew exactly what to study each day.", avatar: "AK", color: "cyan" },
];

const avatarColors: Record<string, string> = {
  purple: "bg-purple-500/20 border-purple-500/30 text-purple-400",
  blue: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  cyan: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050810]">
      <Navbar />
      <Hero />
      <Features />
      <DemoPreview />

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by <span className="gradient-text">10,000+ Engineers</span>
            </h2>
            <p className="text-white/50">Who landed jobs at top tech companies</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} whileHover={{ y: -4 }} className="glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300">
                <p className="text-white/70 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold ${avatarColors[t.color]}`}>{t.avatar}</div>
                  <div>
                    <div className="text-white text-sm font-semibold">{t.name}</div>
                    <div className="text-white/40 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-strong rounded-3xl border border-purple-500/20 p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-radial from-purple-600/10 via-transparent to-transparent" />
            <div className="relative z-10">
              <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
                Ready to Hack <span className="gradient-text">Your Interview?</span>
              </h2>
              <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
                Join thousands of engineers who used AI Interview Hacker to land their dream jobs.
              </p>
              <Link href="/dashboard">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-lg px-10 py-5 rounded-2xl shadow-glow-purple hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all">
                  Start for Free — No Credit Card
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
