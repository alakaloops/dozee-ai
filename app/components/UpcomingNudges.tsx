import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NudgeItem {
  id: number;
  friendName: string;
  vibe: string;
  type: string;
  when: string;
  customDate?: string;
  datetime: string; // ISO string
  message: string;
  sent: boolean;
}

export const UpcomingNudges: React.FC = () => {
  const [nudges, setNudges] = useState<NudgeItem[]>([]);

  const load = () => {
    const data = JSON.parse(localStorage.getItem('dozee:nudges') || '[]');
    setNudges(data);
  };

  useEffect(() => {
  // Defer initial load to avoid direct setState in effect body
  setTimeout(load, 0);
  const interval = setInterval(() => {
    const now = new Date();
    const stored = JSON.parse(localStorage.getItem('dozee:nudges') || '[]') as NudgeItem[];
    let changed = false;
    stored.forEach(item => {
      if (!item.sent && new Date(item.datetime) <= now) {
        if (Notification.permission === 'granted') {
          new Notification(`Dozee Nudge for ${item.friendName}`, { body: item.message });
        }
        item.sent = true;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem('dozee:nudges', JSON.stringify(stored));
      setNudges(stored);
    }
  }, 60_000);
  return () => clearInterval(interval);
}, []);

  const handleDelete = (id: number) => {
    const stored = JSON.parse(localStorage.getItem('dozee:nudges') || '[]') as NudgeItem[];
    const filtered = stored.filter(n => n.id !== id);
    localStorage.setItem('dozee:nudges', JSON.stringify(filtered));
    setNudges(filtered);
  };

  if (nudges.length === 0) return null;

  return (
    <motion.div
      className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
    >
      <h3 className="text-lg font-semibold text-white mb-2">Upcoming nudges</h3>
      <ul className="space-y-2 text-white">
        {nudges.map(n => (
          <li key={n.id} className="flex justify-between items-center">
            <span>{n.friendName} – {new Date(n.datetime).toLocaleString()}</span>
            <button
              className="text-red-400 hover:underline"
              onClick={() => handleDelete(n.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};
