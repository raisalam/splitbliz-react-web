import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from './ThemeProvider';
import { ArrowLeft, Plus, Pin, Trash2, X, Moon, Sun } from 'lucide-react';
import { getGroupById, MOCK_USER_ID } from '../../api/groups';

const CATEGORIES = [
  { key: 'ALL', label: 'All', emoji: '📋' },
  { key: 'PAYMENT', label: 'Payment Info', emoji: '💳' },
  { key: 'RULES', label: 'Rules', emoji: '📌' },
  { key: 'LINKS', label: 'Links', emoji: '🔗' },
  { key: 'NOTES', label: 'Notes', emoji: '📝' },
];

const CARD_COLORS = [
  'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20',
  'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
  'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20',
  'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
];

const COLOR_KEYS = ['amber', 'sky', 'rose', 'emerald', 'violet', 'orange'];
const COLOR_DOTS = [
  'bg-amber-300', 'bg-sky-300', 'bg-rose-300', 'bg-emerald-300', 'bg-violet-300', 'bg-orange-300'
];

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  colorIndex: number;
  pinned: boolean;
  author: { name: string; avatar: string };
  createdAt: string;
}

const MOCK_NOTES: Note[] = [
  {
    id: 'n1', title: 'UPI Payment ID', content: 'Rais: rais@upi\nAman: aman.pay@paytm\nNeha: neha99@ybl',
    category: 'PAYMENT', colorIndex: 0, pinned: true,
    author: { name: 'Rais', avatar: 'https://i.pravatar.cc/150?u=00' }, createdAt: '2026-03-12T10:00:00Z'
  },
  {
    id: 'n2', title: 'Group Rules', content: '1. Split equally unless discussed\n2. Settle within 7 days\n3. No cash — UPI only',
    category: 'RULES', colorIndex: 1, pinned: true,
    author: { name: 'Rais', avatar: 'https://i.pravatar.cc/150?u=00' }, createdAt: '2026-03-10T08:00:00Z'
  },
  {
    id: 'n3', title: 'Hotel Booking', content: 'Confirmation #GOA2026X\nCheck-in: Mar 15, 2PM\nCheck-out: Mar 18, 11AM\nhttps://booking.com/goa2026',
    category: 'LINKS', colorIndex: 2, pinned: false,
    author: { name: 'User 1', avatar: 'https://i.pravatar.cc/150?u=01' }, createdAt: '2026-03-11T14:30:00Z'
  },
  {
    id: 'n4', title: 'Flight Details', content: 'IndiGo 6E-204\nDep: BOM 06:15 → GOI 07:30\nPNR: ABC123',
    category: 'LINKS', colorIndex: 3, pinned: false,
    author: { name: 'User 2', avatar: 'https://i.pravatar.cc/150?u=02' }, createdAt: '2026-03-09T20:00:00Z'
  },
  {
    id: 'n5', title: 'Remember to bring', content: '• Sunscreen\n• Board games\n• Portable speaker\n• Snorkeling gear',
    category: 'NOTES', colorIndex: 4, pinned: false,
    author: { name: 'User 3', avatar: 'https://i.pravatar.cc/150?u=03' }, createdAt: '2026-03-08T16:00:00Z'
  },
  {
    id: 'n6', title: 'Budget Limit', content: 'Max ₹5000 per person for food.\nActivities budget: ₹3000 each.',
    category: 'RULES', colorIndex: 5, pinned: true,
    author: { name: 'Rais', avatar: 'https://i.pravatar.cc/150?u=00' }, createdAt: '2026-03-07T12:00:00Z'
  },
];

export function GroupWhiteboard() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('NOTES');
  const [newColorIndex, setNewColorIndex] = useState(0);

  const filtered = activeCategory === 'ALL'
    ? [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    : notes.filter(n => n.category === activeCategory).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const togglePin = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };
  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };
  const addNote = () => {
    if (!newTitle.trim()) return;
    const note: Note = {
      id: `n-${Date.now()}`, title: newTitle, content: newContent, category: newCategory,
      colorIndex: newColorIndex, pinned: false,
      author: { name: 'Rais', avatar: 'https://i.pravatar.cc/150?u=00' },
      createdAt: new Date().toISOString()
    };
    setNotes(prev => [note, ...prev]);
    setShowAddSheet(false);
    setNewTitle(''); setNewContent(''); setNewCategory('NOTES'); setNewColorIndex(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/group/${groupId}`)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-lg">📋 Whiteboard</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{notes.length} notes</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddSheet(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-300'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notes Grid */}
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {filtered.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`break-inside-avoid rounded-2xl border p-4 shadow-sm hover:shadow-md transition-shadow ${CARD_COLORS[note.colorIndex]}`}
            >
              {/* Pinned + Category */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {CATEGORIES.find(c => c.key === note.category)?.emoji} {CATEGORIES.find(c => c.key === note.category)?.label}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => togglePin(note.id)} className={`p-1 rounded-full transition-colors ${note.pinned ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}>
                    <Pin className="w-3.5 h-3.5" style={note.pinned ? { fill: 'currentColor' } : {}} />
                  </button>
                  <button onClick={() => deleteNote(note.id)} className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm mb-1.5 text-slate-900 dark:text-white">{note.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed mb-3">{note.content}</p>

              {/* Author + Timestamp */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/30">
                <img src={note.author.avatar} alt={note.author.name} className="w-5 h-5 rounded-full" />
                <span className="text-[10px] text-slate-500 dark:text-slate-500">
                  {note.author.name} • {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No notes in this category</p>
            <p className="text-slate-400 text-sm mt-1">Tap "Add Note" to create one</p>
          </div>
        )}
      </main>

      {/* Add Note Bottom Sheet */}
      <AnimatePresence>
        {showAddSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddSheet(false)}
              className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="pt-4 pb-2 px-6">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Note</h3>
                  <button onClick={() => setShowAddSheet(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="px-6 pb-12 pt-4 overflow-y-auto space-y-5">
                <input
                  type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Note title"
                  className="w-full text-xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-800 pb-3 focus:outline-none focus:border-indigo-500 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  autoFocus
                />
                <textarea
                  value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your note..."
                  rows={4}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                />
                {/* Category Picker */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</p>
                  <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.filter(c => c.key !== 'ALL').map(cat => (
                      <button key={cat.key} onClick={() => setNewCategory(cat.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          newCategory === cat.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Color Picker */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Color</p>
                  <div className="flex gap-3">
                    {COLOR_DOTS.map((col, i) => (
                      <button key={i} onClick={() => setNewColorIndex(i)}
                        className={`w-8 h-8 rounded-full ${col} transition-all ${newColorIndex === i ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110' : 'hover:scale-105'}`}
                      />
                    ))}
                  </div>
                </div>
                <button onClick={addNote} disabled={!newTitle.trim()}
                  className={`w-full py-3.5 rounded-2xl font-bold text-lg transition-all ${
                    newTitle.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  Add to Board
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
