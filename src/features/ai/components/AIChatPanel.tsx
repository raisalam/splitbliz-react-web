import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, Users, MessageSquare } from 'lucide-react';

type ChatMessage = {
  id: number;
  sender: 'ai' | 'user';
  text: string;
};

type AIChatPanelProps = {
  messages: ChatMessage[];
  isTyping: boolean;
  chatInput: string;
  onInputChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
  showInput: boolean;
};

const TypewriterText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

export function AIChatPanel({
  messages,
  isTyping,
  chatInput,
  onInputChange,
  onSend,
  showInput
}: AIChatPanelProps) {
  return (
    <>
      <div className="space-y-4 pt-2">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.sender === 'ai' ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                    <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  </div>
                )}
                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm'
                }`}>
                  {msg.sender === 'ai' && idx === 0 ? (
                    <TypewriterText text={msg.text} delay={0.5} />
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-lg mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-sm flex items-center gap-1.5 h-[52px]">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-indigo-400" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-indigo-400" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showInput && (
        <motion.div 
          initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent dark:from-[#0A0F1C] dark:via-[#0A0F1C] dark:to-transparent z-40"
        >
          <div className="max-w-3xl mx-auto">
            <form onSubmit={onSend} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50">
                <div className="pl-4 pr-2">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text" value={chatInput} onChange={(e) => onInputChange(e.target.value)}
                  placeholder="Ask SplitBliz AI about your expenses..."
                  className="flex-1 py-4 bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                <button
                  type="submit" disabled={!chatInput.trim() || isTyping}
                  className="mr-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white rounded-xl transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </>
  );
}
