import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { useTheme } from '../../providers/ThemeProvider';
import { ArrowLeft, Send, Smile, Receipt, Banknote } from 'lucide-react';
import { MOCK_USER_ID } from '../../api/groups';
import { MOCK_GROUPS } from '../../mock/groups';

interface ChatMessage {
  id: string;
  type: 'USER' | 'SYSTEM';
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  systemIcon?: 'expense' | 'settle';
}

function getGroupForChat(groupId: string) {
  return MOCK_GROUPS.find(g => g.publicId === groupId);
}

function buildMockMessages(groupId: string): ChatMessage[] {
  const group = getGroupForChat(groupId);
  const members = group?.members || [];
  const m = (idx: number) => members[idx] || { userPublicId: `u-${idx}`, displayName: `User ${idx}`, avatarUrl: `https://i.pravatar.cc/150?u=${idx}` };

  return [
    { id: 'c1', type: 'SYSTEM', text: `${m(0).displayName} created the group`, timestamp: '2026-03-01T09:00:00Z' },
    { id: 'c2', type: 'USER', senderId: m(1).userPublicId, senderName: m(1).displayName, senderAvatar: m(1).avatarUrl,
      text: 'Hey everyone! Excited for this 🎉', timestamp: '2026-03-01T09:05:00Z' },
    { id: 'c3', type: 'USER', senderId: m(0).userPublicId, senderName: m(0).displayName, senderAvatar: m(0).avatarUrl,
      text: 'Same here! Let\'s start tracking expenses', timestamp: '2026-03-01T09:06:00Z' },
    { id: 'c4', type: 'SYSTEM', text: `${m(1).displayName} added expense "Flight Tickets" — ₹12,000`, timestamp: '2026-03-01T10:00:00Z', systemIcon: 'expense' },
    { id: 'c5', type: 'USER', senderId: m(2).userPublicId, senderName: m(2).displayName, senderAvatar: m(2).avatarUrl,
      text: 'Got it. I\'ll add the hotel booking later today', timestamp: '2026-03-01T10:15:00Z' },
    { id: 'c6', type: 'USER', senderId: m(0).userPublicId, senderName: m(0).displayName, senderAvatar: m(0).avatarUrl,
      text: 'Perfect. Don\'t forget the cab from airport too!', timestamp: '2026-03-01T10:16:00Z' },
    // Day 2
    { id: 'c7', type: 'SYSTEM', text: `${m(0).displayName} added expense "Dinner at Shack" — ₹3,000`, timestamp: '2026-03-02T20:00:00Z', systemIcon: 'expense' },
    { id: 'c8', type: 'USER', senderId: m(3).userPublicId, senderName: m(3).displayName, senderAvatar: m(3).avatarUrl,
      text: 'That dinner was amazing 🍕🔥', timestamp: '2026-03-02T20:30:00Z' },
    { id: 'c9', type: 'USER', senderId: m(1).userPublicId, senderName: m(1).displayName, senderAvatar: m(1).avatarUrl,
      text: 'Agreed! Best seafood ever', timestamp: '2026-03-02T20:32:00Z' },
    { id: 'c10', type: 'USER', senderId: m(0).userPublicId, senderName: m(0).displayName, senderAvatar: m(0).avatarUrl,
      text: 'Added it to the board so we remember the place', timestamp: '2026-03-02T20:33:00Z' },
    // Today
    { id: 'c11', type: 'SYSTEM', text: `${m(2).displayName} settled ₹100 with ${m(0).displayName}`, timestamp: '2026-03-13T08:00:00Z', systemIcon: 'settle' },
    { id: 'c12', type: 'USER', senderId: m(2).userPublicId, senderName: m(2).displayName, senderAvatar: m(2).avatarUrl,
      text: 'Sent ₹100 via UPI. Please approve!', timestamp: '2026-03-13T08:01:00Z' },
    { id: 'c13', type: 'USER', senderId: m(0).userPublicId, senderName: m(0).displayName, senderAvatar: m(0).avatarUrl,
      text: 'Got it, approved ✅', timestamp: '2026-03-13T08:05:00Z' },
    { id: 'c14', type: 'USER', senderId: m(4).userPublicId, senderName: m(4).displayName, senderAvatar: m(4).avatarUrl,
      text: 'When are we settling everything else? 😅', timestamp: '2026-03-13T10:00:00Z' },
    { id: 'c15', type: 'USER', senderId: m(0).userPublicId, senderName: m(0).displayName, senderAvatar: m(0).avatarUrl,
      text: 'Let\'s settle by end of this week. Use the Settle Up button!', timestamp: '2026-03-13T10:02:00Z' },
  ];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function GroupChat() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const group = getGroupForChat(groupId || '');
  const [messages, setMessages] = useState<ChatMessage[]>(buildMockMessages(groupId || ''));
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: `c-${Date.now()}`, type: 'USER',
      senderId: MOCK_USER_ID, senderName: 'Rais', senderAvatar: 'https://i.pravatar.cc/150?u=00',
      text: inputText, timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  // Group messages by date for separators
  let lastDate = '';

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 shrink-0">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(`/group/${groupId}`)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          {group && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-lg shrink-0">
                {group.emoji}
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-sm truncate">{group.name}</h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{group.memberCount} members</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1 max-w-xl mx-auto w-full">
        {messages.map((msg, idx) => {
          const msgDate = formatDateLabel(msg.timestamp);
          const showDateSep = msgDate !== lastDate;
          lastDate = msgDate;
          const isMe = msg.senderId === MOCK_USER_ID;

          return (
            <React.Fragment key={msg.id}>
              {showDateSep && (
                <div className="flex items-center justify-center py-3">
                  <span className="px-3 py-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-full text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {msgDate}
                  </span>
                </div>
              )}

              {msg.type === 'SYSTEM' ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2 py-2"
                >
                  <div className={`p-1 rounded-full ${msg.systemIcon === 'expense' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                    {msg.systemIcon === 'expense' ? <Receipt className="w-3 h-3" /> : msg.systemIcon === 'settle' ? <Banknote className="w-3 h-3" /> : null}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{msg.text}</span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img src={msg.senderAvatar} alt={msg.senderName} className="w-7 h-7 rounded-full self-end shrink-0" />
                  )}
                  <div className={`max-w-[75%] ${isMe ? 'order-first' : ''}`}>
                    {!isMe && (
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5 ml-1">{msg.senderName}</p>
                    )}
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-bl-md'
                    }`}>
                      {msg.text}
                    </div>
                    <p className={`text-[10px] text-slate-400 mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                      {formatTime(msg.timestamp)}
                      {isMe && ' ✓✓'}
                    </p>
                  </div>
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Input Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            <Smile className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0 ml-2" />
          </div>
          <motion.button
            onClick={sendMessage}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-full transition-colors shrink-0 ${
              inputText.trim()
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
