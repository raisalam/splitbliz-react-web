import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Send, Smile } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { engagementService, groupsService } from '../../services';
import { useUser } from '../../providers/UserContext';
import { v4 as uuidv4 } from 'uuid';
import { GROUP_TYPE_EMOJI } from '../../constants/app';
import type { ChatMessage } from '../../types';
import { useGroupMqtt } from '../../hooks/useGroupMqtt';
import { useSendMessage } from '../../hooks/useEngagementMutations';
import { CachedAvatar } from '../../components/CachedAvatar';

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
  const { user } = useUser();
  const queryClient = useQueryClient();
  useGroupMqtt(groupId || '');
  const currentUserId = user?.id;
  const { data: groupDetail } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsService.getGroupDetail(groupId || ''),
    enabled: !!groupId,
  });
  const group = groupDetail?.group;
  const members = groupDetail?.members ?? [];
  const emoji = group?.groupType ? GROUP_TYPE_EMOJI[group.groupType] : GROUP_TYPE_EMOJI['OTHER'];

  const {
    data: pagedMessages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', groupId],
    queryFn: ({ pageParam }) =>
      engagementService.getMessages(groupId || '', { cursor: pageParam, limit: 50 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? lastPage.pagination?.nextCursor : undefined,
    enabled: !!groupId,
  });

  const sendMessageMutation = useSendMessage();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pagedMessages?.pages) return;
    const membersById = new Map(members.map((m: any) => [m.userId, m]));
    const all = pagedMessages.pages.flatMap((page) => page.messages ?? []);
    const existing = new Map(all.map(m => [m.clientMessageId || m.id, m]));
    const merged = Array.from(existing.values()).map((msg) => {
      const member = membersById.get(msg.sender?.userId);
      if (!member) return msg;
      const displayName = !msg.sender?.displayName || msg.sender.displayName === 'Member'
        ? member.displayName
        : msg.sender.displayName;
      const resolvedAvatar = msg.sender?.resolvedAvatar || member.resolvedAvatar || member.avatarUrl || null;
      return {
        ...msg,
        sender: {
          ...msg.sender,
          displayName,
          resolvedAvatar,
        },
      };
    });
    merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    setMessages(merged);
  }, [pagedMessages, members]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isLoading]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || !hasNextPage || isFetchingNextPage) return;
    if (container.scrollTop <= 80) {
      fetchNextPage();
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const clientMessageId = uuidv4();
    const optimistic: ChatMessage = {
      id: `tmp-${clientMessageId}`,
      clientMessageId,
      groupId: groupId || '',
      sender: {
        userId: user?.id || 'me',
        displayName: user?.displayName || 'You',
        resolvedAvatar: user?.resolvedAvatar || null,
      },
      content: inputText,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setInputText('');
    try {
      await sendMessageMutation.mutateAsync({
        groupId: groupId || '',
        data: { content: optimistic.content, clientMessageId }
      });
    } catch {
      // keep optimistic message; optionally show error
    }
  };

  // Group messages by date for separators
  let lastDate = '';

  const getInitial = (name?: string | null) => {
    const trimmed = name?.trim();
    return trimmed ? trimmed[0].toUpperCase() : '?';
  };

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
                {emoji}
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
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 max-w-xl mx-auto w-full"
      >
        {isLoading && (
          <div className="text-center text-sm text-slate-500 mt-10">Loading messages...</div>
        )}
        {error && (
          <div className="text-center text-sm text-slate-500 mt-10">Failed to load messages.</div>
        )}
        {!isLoading && !error && messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Be the first to say something."
          />
        ) : (
          messages.map((msg, idx) => {
            const msgDate = formatDateLabel(msg.createdAt);
            const showDateSep = msgDate !== lastDate;
            lastDate = msgDate;
            const isMe = msg.sender?.userId === currentUserId || msg.sender?.userId === 'me';

            return (
              <React.Fragment key={msg.clientMessageId || msg.id}>
                {showDateSep && (
                  <div className="flex items-center justify-center py-3">
                    <span className="px-3 py-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-full text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {msgDate}
                    </span>
                  </div>
                )}

                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      msg.sender?.resolvedAvatar && msg.sender.resolvedAvatar.startsWith('http') ? (
                        <CachedAvatar
                          src={msg.sender.resolvedAvatar}
                          alt={msg.sender?.displayName}
                          className="w-7 h-7 rounded-full self-end shrink-0 object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full self-end shrink-0 flex items-center justify-center text-[11px] font-bold bg-slate-200 text-slate-700">
                          {msg.sender?.resolvedAvatar && !msg.sender.resolvedAvatar.startsWith('http')
                            ? msg.sender.resolvedAvatar
                            : getInitial(msg.sender?.displayName)}
                        </div>
                      )
                    )}
                    <div className={`max-w-[75%] ${isMe ? 'order-first' : ''}`}>
                      {!isMe && (
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5 ml-1">{msg.sender?.displayName}</p>
                      )}
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-md'
                          : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-bl-md'
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-[10px] text-slate-400 mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatTime(msg.createdAt)}
                        {isMe && ' ✓✓'}
                      </p>
                    </div>
                  </motion.div>
              </React.Fragment>
            );
          })
        )}
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
