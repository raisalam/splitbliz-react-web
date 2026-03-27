import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Pin, Trash2, X } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { engagementService } from '../../services';
import { useCreateWhiteboardItem, useUpdateWhiteboardItem, useDeleteWhiteboardItem } from '../../hooks/useEngagementMutations';
import { WHITEBOARD_CATEGORIES } from '../../constants/emoji';

const CATEGORIES = WHITEBOARD_CATEGORIES;

const CARD_COLORS = [
  'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20',
  'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
  'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20',
  'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
];

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

export function GroupWhiteboard() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['whiteboard', groupId],
    queryFn: () => engagementService.getWhiteboardItems(groupId || ''),
    enabled: !!groupId,
  });

  const createItem = useCreateWhiteboardItem();
  const updateItem = useUpdateWhiteboardItem();
  const deleteItem = useDeleteWhiteboardItem();

  const [noteMeta, setNoteMeta] = useState<Record<string, { category: string; colorIndex: number; pinned: boolean }>>({});
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('NOTES');
  const [newColorIndex, setNewColorIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const notes: Note[] = useMemo(() => {
    return (data?.items ?? []).map((item: any, idx: number) => {
      const meta = noteMeta[item.id];
      return {
        id: item.id,
        title: item.title,
        content: item.content || '',
        category: meta?.category ?? 'NOTES',
        colorIndex: meta?.colorIndex ?? (idx % CARD_COLORS.length),
        pinned: meta?.pinned ?? false,
        author: {
          name: item.createdBy?.displayName || 'Member',
          avatar: item.createdBy?.resolvedAvatar || '',
        },
        createdAt: item.createdAt,
      };
    });
  }, [data?.items, noteMeta]);

  const filtered = activeCategory === 'ALL'
    ? [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    : notes.filter(n => n.category === activeCategory).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const togglePin = (id: string) => {
    setNoteMeta(prev => {
      const current = prev[id] || { category: 'NOTES', colorIndex: 0, pinned: false };
      return { ...prev, [id]: { ...current, pinned: !current.pinned } };
    });
  };
  const deleteNote = async (id: string) => {
    if (!groupId) return;
    await deleteItem.mutateAsync({ groupId, itemId: id });
  };
  const addNote = async () => {
    if (!newTitle.trim()) return;
    if (!groupId) return;
    if (editingId) {
      await updateItem.mutateAsync({
        groupId,
        itemId: editingId,
        data: {
          title: newTitle,
          content: newContent,
        }
      });
    } else {
      const created = await createItem.mutateAsync({
        groupId,
        data: {
          title: newTitle,
          content: newContent || undefined,
        }
      });
      setNoteMeta(prev => ({
        ...prev,
        [created.id]: { category: newCategory, colorIndex: newColorIndex, pinned: false },
      }));
    }
    setShowAddSheet(false);
    setNewTitle(''); setNewContent(''); setNewCategory('NOTES'); setNewColorIndex(0);
    setEditingId(null);
  };
  const onAddItem = () => setShowAddSheet(true);
  const closeSheet = () => {
    setShowAddSheet(false);
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
    setNewCategory('NOTES');
    setNewColorIndex(0);
  };

  const headerEmoji = CATEGORIES[0]?.emoji ?? '';

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
              <h1 className="font-bold text-lg">{headerEmoji ? `${headerEmoji} ` : ''}Whiteboard</h1>
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
        {isLoading && (
          <div className="text-center text-sm text-slate-500 py-10">Loading whiteboard...</div>
        )}
        {error && (
          <div className="text-center text-sm text-slate-500 py-10">Failed to load whiteboard.</div>
        )}

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
              onClick={() => {
                setEditingId(note.id);
                setNewTitle(note.title);
                setNewContent(note.content);
                setNewCategory(note.category);
                setNewColorIndex(note.colorIndex);
                setShowAddSheet(true);
              }}
            >
              {/* Pinned + Category */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {CATEGORIES.find(c => c.key === note.category)?.emoji} {CATEGORIES.find(c => c.key === note.category)?.label}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                    className={`p-1 rounded-full transition-colors ${note.pinned ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                  >
                    <Pin className="w-3.5 h-3.5" style={note.pinned ? { fill: 'currentColor' } : {}} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                  >
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
                  {note.author.name} - {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && !isLoading && (
          <EmptyState
            title="Whiteboard is empty"
            description="Add your first note or task."
            action={{ label: 'Add item', onClick: onAddItem }}
          />
        )}
      </main>

      {/* Add Note Bottom Sheet */}
      <AnimatePresence>
        {showAddSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeSheet}
              className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="pt-4 pb-2 px-6">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Note' : 'New Note'}</h3>
                  <button onClick={closeSheet} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
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
                  {editingId ? 'Save changes' : 'Add to Board'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
