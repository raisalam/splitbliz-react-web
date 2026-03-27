import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, Clock, CreditCard, Users, X } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { colors } from '../../constants/colors';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/EmptyState';
import { notificationsService } from '../../services';
import type { Notification } from '../../types';

type NotificationStyle = {
  icon: React.ReactNode;
  bg: string;
};

function formatTimeLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getNotificationStyle(type: Notification['type']): NotificationStyle {
  switch (type) {
    case 'NEW_EXPENSE':
      return { icon: <CreditCard className="w-4 h-4 text-[#6c5ce7]" />, bg: '#ede9ff' };
    case 'GROUP_INVITE':
    case 'MEMBER_JOINED':
      return { icon: <Users className="w-4 h-4 text-[#2c74c9]" />, bg: '#e6f1fb' };
    case 'REMINDER':
      return { icon: <Clock className="w-4 h-4 text-[#e24b4a]" />, bg: '#fceaea' };
    case 'SETTLEMENT_APPROVED':
      return { icon: <Check className="w-4 h-4 text-[#0f6e56]" strokeWidth={3} />, bg: colors.successLight };
    case 'SETTLEMENT_REJECTED':
      return { icon: <X className="w-4 h-4 text-[#e24b4a]" />, bg: '#fceaea' };
    case 'SETTLEMENT_REQUEST':
    default:
      return { icon: <Clock className="w-4 h-4 text-[#e28a11]" />, bg: '#faeeda' };
  }
}

export function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
  });

  const notifications = data?.notifications ?? [];
  const unreadNotifs = notifications.filter(n => !n.isRead);
  const readNotifs = notifications.filter(n => n.isRead);

  const markAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await notificationsService.markAsRead(n.id);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['home'] });
      } catch {
        toast.error('Failed to mark as read.');
      }
    }
    if (n.groupId) navigate(`/group/${n.groupId}`);
  };

  const renderSection = (title: string, items: Notification[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="px-5 mb-2 font-bold uppercase tracking-[0.06em]" style={{ fontSize: '11px', color: colors.textMuted }}>
          {title}
        </h3>
        <div className="flex flex-col">
          <AnimatePresence>
            {items.map(n => {
              const style = getNotificationStyle(n.type);
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={() => handleNotificationClick(n)}
                  className="flex gap-3 px-5 py-4 cursor-pointer relative"
                  style={{
                    backgroundColor: n.isRead ? '#ffffff' : '#faf9ff',
                    borderTop: `0.5px solid ${colors.primaryFaint}`
                  }}
                >
                  {!n.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: colors.primary, borderRadius: '0 2px 2px 0' }} />
                  )}
                  <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: style.bg }}>
                    {style.icon}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-[14px] leading-[1.3] text-[#3d3a4a]">
                      <span className="font-bold text-[#1a1625]">{n.title}</span>
                    </p>
                    {n.body && (
                      <p className="mt-1" style={{ fontSize: '11px', color: '#7a7699', fontWeight: 500 }}>
                        {n.body}
                      </p>
                    )}
                    <p className="mt-1" style={{ fontSize: '9px', color: '#b8b4d8', fontWeight: 600 }}>
                      {formatTimeLabel(n.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen font-sans pb-10" style={{ backgroundColor: colors.pageBg }}>
        <header className="sticky top-0 z-50 bg-white shadow-sm flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors hover:bg-[#e0ddf5]"
              style={{ backgroundColor: colors.primaryFaint }}
            >
              <ArrowLeft className="w-4 h-4" style={{ color: '#3d3a4a' }} />
            </button>
            <h1 className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
              Notifications
            </h1>
          </div>
        </header>

        <div className="pt-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen font-sans pb-10" style={{ backgroundColor: colors.pageBg }}>
        <header className="sticky top-0 z-50 bg-white shadow-sm flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors hover:bg-[#e0ddf5]"
              style={{ backgroundColor: colors.primaryFaint }}
            >
              <ArrowLeft className="w-4 h-4" style={{ color: '#3d3a4a' }} />
            </button>
            <h1 className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
              Notifications
            </h1>
          </div>
        </header>
        <div className="pt-10 text-center text-sm text-slate-500">
          Failed to load notifications. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans pb-10" style={{ backgroundColor: colors.pageBg }}>
      {/* Sticky White Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors hover:bg-[#e0ddf5]"
            style={{ backgroundColor: colors.primaryFaint }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#3d3a4a' }} />
          </button>
          <h1 className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
            Notifications
          </h1>
        </div>

        {unreadNotifs.length > 0 && (
          <button
            onClick={markAllRead}
            className="font-semibold transition-colors hover:opacity-80"
            style={{ fontSize: '10px', color: colors.primary }}
          >
            Mark all read
          </button>
        )}
      </header>

      {/* Main Content */}
      <div className="pt-6">
        {renderSection('NEW', unreadNotifs)}
        {renderSection('EARLIER', readNotifs)}

        {notifications.length === 0 && (
          <div className="mt-20 px-6">
            <EmptyState
              title="You're all caught up"
              description="No new notifications."
            />
          </div>
        )}
      </div>

    </div>
  );
}
