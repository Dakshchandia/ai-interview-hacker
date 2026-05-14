"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Mic, MicOff } from "lucide-react";

interface AIAvatarProps {
  isSpeaking: boolean;
  isThinking: boolean;
}

export function AIAvatar({ isSpeaking, isThinking }: AIAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Outer pulse rings */}
      <div className="relative flex items-center justify-center">
        {/* Ring 3 — outermost */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0, 0.15] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-28 h-28 rounded-full border border-purple-500/30"
            />
          )}
        </AnimatePresence>

        {/* Ring 2 */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0, 0.25] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute w-24 h-24 rounded-full border border-purple-500/40"
            />
          )}
        </AnimatePresence>

        {/* Ring 1 — always visible, pulses when speaking */}
        <motion.div
          animate={
            isSpeaking
              ? { scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }
              : { scale: 1, opacity: 0.3 }
          }
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-20 h-20 rounded-full border border-purple-500/50"
        />

        {/* Avatar circle */}
        <motion.div
          animate={isThinking ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 0.5, repeat: isThinking ? Infinity : 0 }}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-glow-purple z-10"
        >
          <Brain className="w-8 h-8 text-white" />

          {/* Thinking spinner overlay */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/60 animate-spin"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Speaking mic indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#050810] flex items-center justify-center z-20"
            >
              <Mic className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status label */}
      <div className="text-center">
        <p className="text-sm font-semibold text-white">AI Interviewer</p>
        <motion.p
          key={isThinking ? "thinking" : isSpeaking ? "speaking" : "listening"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-white/40 mt-0.5"
        >
          {isThinking ? "Thinking..." : isSpeaking ? "Speaking" : "Listening"}
        </motion.p>
      </div>
    </div>
  );
}
