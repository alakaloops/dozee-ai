# 🔮 Dozee AI — Personal AI Decision Assistant

**Your Mood. Your Budget. Your Next Move.**

Dozee is a 100% local, privacy-first personal AI assistant built to solve decision paralysis. Powered by **Next.js 16**, **Tailwind CSS**, **Framer Motion**, and **Ollama + Gemma 3 4B**, Dozee helps you decide what to eat, watch, wear, or do—without sending any of your private data to external servers.

---

## ✨ Features

- 🤖 **100% Local AI Execution**: Connects to local Ollama API using Gemma 3 4B / Ollama models.
- 🎨 **Personal Assistant UI**: Sleek dark obsidian glassmorphism aesthetic inspired by modern AI assistant apps.
- 🍕 **Interactive Suggestion Chips**: Quick prompt chips for Food, Movies, Going Out, Date Ideas, Late Night, Celebrations, Outfits, and Surprises.
- 💌 **Friend Nudge Integration**: Generate cute custom nudge messages, copy/share links, download `.ics` calendar files, or schedule local browser reminders.
- ⚡ **Local Persistence**: Saves settings, nudge schedules, and active preferences in browser `localStorage`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: Vanilla CSS & [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Font**: Space Grotesk & Geist
- **AI Backend**: Local [Ollama](https://ollama.com/) (Gemma 3 4B model)

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed and [Ollama](https://ollama.com/) running locally.

Pull the model in Ollama:
```bash
ollama pull gemma
```

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/alakaloops/dozee-ai.git
cd dozee-ai/dozee-app
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start chatting with Dozee!

---

## 📦 Build & Lint

To check for type errors and build for production:

```bash
npm run lint
npm run build
```

---

## 📄 License

MIT
