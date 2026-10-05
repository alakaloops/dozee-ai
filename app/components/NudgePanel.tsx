import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateICS } from '../utils/ics';

interface NudgePanelProps {
  recommendation: string; // the AI recommendation text
  onClose: () => void;
}

// Helper to encode WhatsApp URL
const encodeWhatsApp = (msg: string) => encodeURIComponent(msg);

export const NudgePanel: React.FC<NudgePanelProps> = ({ recommendation, onClose }) => {
  const [friendName, setFriendName] = useState('');
  const [vibe, setVibe] = useState<'Sweet' | 'Playful' | 'Flirty-but-cute' | 'Funny'>('Flirty-but-cute');
  const [type, setType] = useState(
    'You two should try this place'
  );
  const [when, setWhen] = useState('Now');
  const [customDate, setCustomDate] = useState('');
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved friend name from localStorage
  useEffect(() => {
    // Defer state update to avoid direct setState in effect body
    const saved = localStorage.getItem('dozeeSettings');
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        if (obj.friendName) {
          setTimeout(() => setFriendName(obj.friendName), 0);
        }
      } catch {}
    }
  }, []);

  // Save friend name back to settings
  useEffect(() => {
    const saved = localStorage.getItem('dozeeSettings');
    const settings = saved ? JSON.parse(saved) : {};
    settings.friendName = friendName;
    localStorage.setItem('dozeeSettings', JSON.stringify(settings));
  }, [friendName]);

  const buildPrompt = useCallback(() => {
    return `Create a cute nudge message for my friend ${friendName || 'someone'} about "${recommendation}". Vibe: ${vibe}. Type: ${type}. Limit to 1-2 short sentences, include at most one emoji, no cringe, no explicit content.`;
  }, [friendName, recommendation, vibe, type]);

  const callGemma = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: buildPrompt() }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || JSON.stringify(data));
      const msg = data.response || data.message?.content || '';
      setGeneratedMsg(msg.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [buildPrompt]);

  // Initial generation when panel opens
  useEffect(() => {
    if (recommendation) {
      (async () => {
        await callGemma();
      })();
    }
  }, [recommendation, callGemma]);

  const handleSendNow = () => {
    const encoded = encodeWhatsApp(generatedMsg);
    const waLink = `https://wa.me/?text=${encoded}`;
    window.open(waLink, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMsg);
  };

  const handleDownloadICS = () => {
    const date = when === 'Custom' && customDate ? new Date(customDate) : new Date();
    // Default to 6 PM if not custom time
    if (when !== 'Custom') date.setHours(18, 0, 0, 0);
    const icsContent = generateICS({
      title: `Send Dozee nudge to ${friendName || 'friend'} 💌`,
      description: generatedMsg,
      start: date,
    });
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dozee-nudge.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReminder = async () => {
    // Save to localStorage nudges list
    const nudges = JSON.parse(localStorage.getItem('dozee:nudges') || '[]');
    const id = Date.now();
    const date = when === 'Custom' && customDate ? new Date(customDate) : new Date();
    if (when !== 'Custom') date.setHours(18, 0, 0, 0);
    nudges.push({ id, friendName, vibe, type, when, customDate, datetime: date.toISOString(), message: generatedMsg, sent: false });
    localStorage.setItem('dozee:nudges', JSON.stringify(nudges));
    // Request notification permission now
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white/20 backdrop-blur-md rounded-xl p-6 w-full max-w-md mx-4 shadow-xl border border-white/30"
          initial={{ scale: 0.9, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: -20 }}
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-lg font-bold mb-4 text-white">Cute Nudge</h2>
          <div className="space-y-3 text-white">
            <label>
              Who? (friend’s name)
              <input
                type="text"
                className="mt-1 w-full rounded bg-white/30 p-2 text-black"
                value={friendName}
                onChange={e => setFriendName(e.target.value)}
              />
            </label>
            <label>
              Vibe
              <select
                className="mt-1 w-full rounded bg-white/30 p-2 text-black"
                value={vibe}
                onChange={e => setVibe(e.target.value as 'Sweet' | 'Playful' | 'Flirty-but-cute' | 'Funny')}
              >
                <option>Sweet</option>
                <option>Playful</option>
                <option>Flirty-but-cute</option>
                <option>Funny</option>
              </select>
            </label>
            <label>
              Nudge type
              <select
                className="mt-1 w-full rounded bg-white/30 p-2 text-black"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option>You two should try this place</option>
                <option>Date idea</option>
                <option>Try this food together</option>
                <option>You two would look cute in this outfit</option>
              </select>
            </label>
            <label>
              When
              <select
                className="mt-1 w-full rounded bg-white/30 p-2 text-black"
                value={when}
                onChange={e => setWhen(e.target.value)}
              >
                <option>Now</option>
                <option>In 2 days</option>
                <option>In 5 days</option>
                <option>In a week</option>
                <option>Custom</option>
              </select>
            </label>
            {when === 'Custom' && (
              <input
                type="datetime-local"
                className="mt-1 w-full rounded bg-white/30 p-2 text-black"
                value={customDate}
                onChange={e => setCustomDate(e.target.value)}
              />
            )}
            <div className="mt-4">
              <button
                className="px-4 py-2 mr-2 bg-lime-accent text-black rounded hover:bg-lime-500"
                onClick={callGemma}
                disabled={loading}
              >
                {loading ? 'Generating…' : 'Regenerate'}
              </button>
            </div>
            {error && <p className="text-red-300">Error: {error}</p>}
            {generatedMsg && (
              <div className="mt-4">
                <textarea
                  className="w-full h-24 p-2 rounded bg-white/30 text-black"
                  value={generatedMsg}
                  onChange={e => setGeneratedMsg(e.target.value)}
                />
                <div className="flex mt-2 space-x-2">
                  <button
                    className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={handleSendNow}
                  >
                    Send now
                  </button>
                  <button
                    className="flex-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ text: generatedMsg });
                      } else {
                        handleCopy();
                      }
                    }}
                  >
                    Share / Copy
                  </button>
                  <button
                    className="flex-1 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
                    onClick={handleDownloadICS}
                  >
                    Download .ics
                  </button>
                </div>
                <button
                  className="mt-2 w-full px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
                  onClick={handleReminder}
                >
                  Remind me to send it
                </button>
                <p className="mt-2 text-sm text-white/70">
                  Dozee runs locally, so reminders ping you, not your friend. Tap send when it pops up.
                </p>
              </div>
            )}
          </div>
          <button
            className="absolute top-2 right-2 text-white text-xl"
            onClick={onClose}
          >
            ×
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
