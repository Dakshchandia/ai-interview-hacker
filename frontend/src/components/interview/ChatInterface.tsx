"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RotateCcw, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
        AI
      </div>
      <div className="glass border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
            className="w-1.5 h-1.5 bg-purple-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, 18); // typing speed
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

function MessageBubble({ message, isLatestAI }: { message: Message; isLatestAI: boolean }) {
  const isAI = message.role === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3", !isAI && "flex-row-reverse")}
    >
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold self-end",
        isAI
          ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white"
          : "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400"
      )}>
        {isAI ? "AI" : "You"}
      </div>

      {/* Bubble */}
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
        isAI
          ? "glass border border-white/5 text-white/85 rounded-bl-sm"
          : "bg-purple-600/25 border border-purple-500/30 text-white rounded-br-sm"
      )}>
        {isAI && isLatestAI ? (
          <TypewriterText text={message.text} />
        ) : (
          message.text
        )}
        <div className={cn("text-xs mt-1.5", isAI ? "text-white/20" : "text-white/30")}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  );
}

export function ChatInterface({ messages, onSend, isLoading, disabled }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Find the latest AI message index for typewriter effect
  const latestAIIndex = messages.reduce(
    (latest, msg, i) => (msg.role === "ai" ? i : latest),
    -1
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isLatestAI={msg.role === "ai" && i === latestAIIndex}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-white/5">
        {/* Hint */}
        <div className="flex items-center gap-1.5 mb-2 text-xs text-white/20">
          <Lightbulb className="w-3 h-3" />
          <span>Press Enter to send · Shift+Enter for new line</span>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1 glass border border-white/8 hover:border-purple-500/30 focus-within:border-purple-500/50 rounded-2xl transition-all duration-200 px-4 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "Interview ended" : "Type your answer..."}
              disabled={disabled || isLoading}
              rows={1}
              className="w-full bg-transparent text-white text-sm placeholder:text-white/20 outline-none resize-none leading-relaxed max-h-32 overflow-y-auto disabled:opacity-40"
              style={{ minHeight: "24px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 128) + "px";
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading || disabled}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
              input.trim() && !isLoading && !disabled
                ? "bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-glow-purple"
                : "glass border border-white/5 text-white/20 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
