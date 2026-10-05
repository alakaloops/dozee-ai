"use client";

import { Space_Grotesk } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NudgePanel } from "./components/NudgePanel";
import { UpcomingNudges } from "./components/UpcomingNudges";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

// ---------- Hero helper data ----------
const rotatingWords = ["eat", "watch", "do", "wear", "try"];

// ---------- Suggestion chips ----------
interface Chip {
  key: string;
  emoji: string;
  label: string;
  prompts: string[];
}

const chips: Chip[] = [
  {
    key: "food",
    emoji: "🍕",
    label: "Food",
    prompts: [
      "Something cozy and cheap for dinner tonight",
      "A quick snack idea for a movie night",
      "A tasty vegetarian meal for two",
    ],
  },
  {
    key: "places",
    emoji: "📍",
    label: "Going out",
    prompts: [
      "A hidden café to hang out at",
      "A scenic rooftop bar for sunset",
      "A quiet park for a stroll",
    ],
  },
  {
    key: "movies",
    emoji: "🎬",
    label: "Movies",
    prompts: [
      "A feel‑good comedy for a relaxed evening",
      "A thrilling sci‑fi adventure",
      "A classic romance film",
    ],
  },
  {
    key: "date",
    emoji: "💘",
    label: "Date ideas",
    prompts: [
      "A cute low-budget date idea for two",
      "A fun indoor activity for a rainy night",
      "A romantic stargazing spot",
    ],
  },
  {
    key: "late",
    emoji: "🌙",
    label: "Late night",
    prompts: [
      "A midnight snack idea",
      "A quiet late‑night walk route",
      "A soothing playlist for winding down",
    ],
  },
  {
    key: "celebrate",
    emoji: "🎉",
    label: "Celebrate",
    prompts: [
      "A fun party theme for friends",
      "A simple celebration dinner",
      "A creative birthday surprise",
    ],
  },
  {
    key: "outfit",
    emoji: "👗",
    label: "Outfit",
    prompts: [
      "A cute casual outfit for a coffee date",
      "A sleek evening look",
      "A comfortable workout ensemble",
    ],
  },
  {
    key: "surprise",
    emoji: "✨",
    label: "Surprise me",
    prompts: [
      "Give me a random fun idea",
      "Surprise me with something quirky",
      "Anything exciting for tonight",
    ],
  },
];

export default function Home() {
  // ----- Core chat state -----
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [currentRec, setCurrentRec] = useState("");

  // ----- Hero animation state -----
  const [rotIndex, setRotIndex] = useState(0);

  // Auto scroll reference for chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ----- Chip interaction state -----
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // Load saved active chip on mount
  useEffect(() => {
    const saved = localStorage.getItem("dozeeSettings");
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        if (obj.lastChip) {
          const chip = obj.lastChip;
          setTimeout(() => setActiveChip(chip), 0);
        }
      } catch {}
    }
  }, []);

  // Rotating word effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRotIndex((i) => (i + 1) % rotatingWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Save last chip when changed
  useEffect(() => {
    if (activeChip) {
      const saved = localStorage.getItem("dozeeSettings");
      const data = saved ? JSON.parse(saved) : {};
      data.lastChip = activeChip;
      localStorage.setItem("dozeeSettings", JSON.stringify(data));
    }
  }, [activeChip]);

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = `User: ${input}`;
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: currentInput }] }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || JSON.stringify(data);
        throw new Error(errorMsg);
      }
      const aiMsg = data.response || data.message?.content || JSON.stringify(data);
      const trimmed = aiMsg.trim();
      setMessages((prev) => [...prev, `Dozee: ${trimmed}`]);
      setCurrentRec(trimmed);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : String(e);
      setMessages((prev) => [...prev, `Dozee: ${msg}`]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip: Chip) => {
    const prompt = chip.prompts[0];
    setInput(prompt);
    setActiveChip(chip.key);
  };

  return (
    <div className={`min-h-screen bg-[#0B0914] text-white flex flex-col justify-between selection:bg-purple-500 selection:text-white ${spaceGrotesk.className}`}>
      <UpcomingNudges />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0B0914]/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            dozee.
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Local AI
          </span>
        </div>
        <a
          href="#chat-section"
          className="px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:opacity-95 transition"
        >
          Try Assistant
        </a>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Hero Banner (Matching Image 1 & 2) */}
        <section className="text-center pt-4 pb-2 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Your Mood. Your Budget. Your Next Move.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-3"
          >
            Can&apos;t decide? <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 bg-clip-text text-transparent">
              We&apos;ve got you.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-white/70 max-w-md"
          >
            Dozee helps you decide what to{" "}
            <motion.span
              key={rotIndex}
              className="font-semibold text-purple-300 underline decoration-purple-500/50 underline-offset-4"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {rotatingWords[rotIndex]}
            </motion.span>{" "}
            tonight.
          </motion.p>

          {/* Glowing Iridescent AI Orb (Matching Image 2 Reference) */}
          <div className="relative my-8 w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/40 via-pink-500/30 to-indigo-500/40 blur-2xl animate-pulse" />
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-purple-400 via-pink-300 to-indigo-300 p-0.5 shadow-2xl shadow-purple-500/30 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#120F24] flex flex-col items-center justify-center p-4 backdrop-blur-3xl text-center border border-white/20">
                <span className="text-3xl mb-1">🔮</span>
                <span className="text-xs font-semibold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Luna AI Assistant
                </span>
                <span className="text-[10px] text-white/50">Ready to help</span>
              </div>
            </div>
          </div>
        </section>

        {/* Chat & Assistant Card Container (Matches "What's the plan today?" section from Image 1 & 2) */}
        <section
          id="chat-section"
          className="bg-[#151326]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-6"
        >
          {/* Card Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">
              What&apos;s the plan today?
            </h2>
            <p className="text-sm text-white/60">
              Tell Dozee what you&apos;re feeling or pick a suggestion below.
            </p>
          </div>

          {/* Suggestion Chips Row */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
            {chips.map((chip) => {
              const isSelected = activeChip === chip.key;
              return (
                <button
                  key={chip.key}
                  onClick={() => handleChipClick(chip)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30"
                      : "bg-white/5 text-white/80 border-white/10 hover:bg-white/15 hover:border-white/20"
                  }`}
                >
                  <span>{chip.emoji}</span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Chat Messages Area */}
          <div className="bg-[#0D0B18]/70 border border-white/5 rounded-2xl p-4 sm:p-5 min-h-[220px] max-h-[380px] overflow-y-auto flex flex-col gap-4">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/40 gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300 text-lg">
                  ✨
                </div>
                <p className="text-sm">
                  &quot;Hello! I can help you answer questions, pick food, movies, outfits or date spots. Ask me anything!&quot;
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isUser = msg.startsWith("User:");
                const content = msg.replace(/^(User:|Dozee:)\s*/, "");
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40">
                        {isUser ? "You" : "Dozee AI"}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-md ${
                        isUser
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-xs"
                          : "bg-white/10 border border-white/10 text-white/95 rounded-tl-xs backdrop-blur-md"
                      }`}
                    >
                      {content}
                    </div>

                    {/* Nudge button if this is the latest assistant recommendation */}
                    {!isUser && i === messages.length - 1 && currentRec && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowNudge(true)}
                        className="mt-2.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-semibold shadow-lg shadow-pink-500/20 flex items-center gap-1.5 border border-pink-400/30"
                      >
                        <span>Nudge my friend</span>
                        <span>💌</span>
                      </motion.button>
                    )}
                  </motion.div>
                );
              })
            )}

            {loading && (
              <div className="flex items-center gap-2 text-purple-300 text-xs py-2 px-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-1 text-white/50">Dozee is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Type bar / Message Composer (Matches Image 2 pill input format) */}
          <div className="relative flex items-center gap-2 bg-[#0D0B18] border border-white/15 focus-within:border-purple-500/80 rounded-full p-1.5 transition shadow-lg">
            <input
              id="dozee-input"
              type="text"
              placeholder="Ask Dozee..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold disabled:opacity-40 hover:opacity-90 transition flex items-center justify-center gap-1 shadow-md shadow-purple-500/30"
            >
              <span>Send</span>
              <span className="text-sm">↑</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-white/30 border-t border-white/5">
        <p>Runs 100% locally · Ollama + Gemma 3 4B · Your data stays on your device</p>
      </footer>

      {/* Nudge Modal Popup */}
      <AnimatePresence>
        {showNudge && <NudgePanel recommendation={currentRec} onClose={() => setShowNudge(false)} />}
      </AnimatePresence>
    </div>
  );
}
