import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Check, Clock, Star, Users, CreditCard } from 'lucide-react';
import { MOCK_GROUPS } from '../../mock/groups';
import { colors } from '../../constants/colors';

type NotificationType = 'EXPENSE' | 'INVITE' | 'REMINDER' | 'SETTLED' | 'STREAK';

interface AppNotification {
  id: string;
  type: NotificationType;
  read: boolean;
  timeLabel: string;
  
  // Content
  memberName?: string;
  groupName?: string;
  expenseName?: string;
  amount?: string;
  streakText?: string;
  
  // For UI rendering
  avatarColor: string;
  avatarInitial: string;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'EXPENSE',
    read: false,
    timeLabel: '2 hours ago',
    memberName: 'Sarah Connor',
    groupName: 'Bali Vacay',
    expenseName: 'Dinner at Jimbaran',
    amount: '₹450',
    avatarColor: '#fceaea', // rose light
    avatarInitial: 'S'
  },
  {
    id: 'n2',
    type: 'INVITE',
    read: false,
    timeLabel: 'Yesterday',
    memberName: 'Alex Carter',
    groupName: 'Weekend Football',
    avatarColor: '#e6f1fb', // blue light
    avatarInitial: 'A'
  },
  {
    id: 'n3',
    type: 'REMINDER',
    read: true,
    timeLabel: 'Yesterday',
    groupName: 'Apartment Rent',
    amount: '₹12,500',
    avatarColor: 'rgba(0,0,0,0)', // Not used for reminder
    avatarInitial: ''
  },
  {
    id: 'n4',
    type: 'SETTLED',
    read: true,
    timeLabel: 'Mar 12',
    memberName: 'David Brooks',
    groupName: 'Goa Trip 2026',
    amount: '₹4,500',
    avatarColor: '#faeeda', // amber light
    avatarInitial: 'D'
  },
  {
    id: 'n5',
    type: 'STREAK',
    read: true,
    timeLabel: 'Mar 10',
    streakText: 'You settled 5 expenses this week!',
    avatarColor: 'rgba(0,0,0,0)', // Not used for streak
    avatarInitial: ''
  }
];

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (n: AppNotification) => {
    if (n.type !== 'STREAK') {
      const g = MOCK_GROUPS.find(g => g.name === n.groupName);
      if (g) navigate(`/group/${g.publicId}`);
    }
    setNotifications(prev => prev.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
  };
  
  const handleInviteAction = (e: React.MouseEvent, id: string, accept: boolean) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    // In a real app, make API call here.
  };

  const unreadNotifs = notifications.filter(n => !n.read);
  const readNotifs = notifications.filter(n => n.read);

  const renderBadge = (type: NotificationType) => {
    switch (type) {
      case 'EXPENSE': return <span className="text-[10px] leading-none">💳</span>;
      case 'INVITE': return <span className="text-[10px] leading-none">👥</span>;
      case 'REMINDER': return null; // Reminder uses full avatar
      case 'SETTLED': return <Check className="w-2.5 h-2.5 text-white stroke-[4]" />;
      case 'STREAK': return null; // Streak uses full avatar
    }
  };

  const renderAvatarContent = (n: AppNotification) => {
    if (n.type === 'REMINDER') {
      return (
        <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#fceaea' }}>
          <span className="text-[18px]">⏰</span>
        </div>
      );
    }
    if (n.type === 'STREAK') {
      return (
        <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#faeeda' }}>
          <span className="text-[18px]">⭐</span>
        </div>
      );
    }
    
    // Normal user avatar with badge
    return (
      <div className="relative shrink-0">
        <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center font-bold text-[#1a1625]" style={{ backgroundColor: n.avatarColor, fontSize: '15px' }}>
          {n.avatarInitial}
        </div>
        <div 
          className="absolute -bottom-0.5 -right-0.5 w-[16px] h-[16px] rounded-full flex items-center justify-center border-2 border-white"
          style={{ backgroundColor: n.type === 'SETTLED' ? colors.success : colors.pageBg }}
        >
          {renderBadge(n.type)}
        </div>
      </div>
    );
  };

  const renderContent = (n: AppNotification) => {
    switch (n.type) {
      case 'EXPENSE':
        return (
          <>
            <p className="text-[14px] leading-[1.3] text-[#3d3a4a]">
              <span className="font-bold text-[#1a1625]">{n.memberName}</span> added {n.expenseName} in <span style={{ color: colors.primary, fontWeight: 600 }}>{n.groupName}</span>
            </p>
            <p className="mt-1" style={{ fontSize: '9px', color: '#b8b4d8', fontWeight: 600 }}>
              Your share: {n.amount}  ·  {n.timeLabel}
            </p>
          </>
        );
      case 'INVITE':
        return (
          <>
            <p className="text-[14px] leading-[1.3] text-[#3d3a4a]">
              <span className="font-bold text-[#1a1625]">{n.memberName}</span> invited you to join <span style={{ color: colors.primary, fontWeight: 600 }}>{n.groupName}</span>
            </p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={(e) => handleInviteAction(e, n.id, true)}
                className="px-4 py-1.5 font-bold transition-all active:scale-95"
                style={{ backgroundColor: colors.successLight, color: colors.success, borderRadius: '6px', fontSize: '10px' }}
              >
                Accept
              </button>
              <button 
                onClick={(e) => handleInviteAction(e, n.id, false)}
                className="px-4 py-1.5 font-bold transition-all active:scale-95"
                style={{ backgroundColor: '#fceaea', color: '#e24b4a', borderRadius: '6px', fontSize: '10px' }}
              >
                Decline
              </button>
            </div>
          </>
        );
      case 'REMINDER':
        return (
          <>
            <p className="text-[14px] leading-[1.3] text-[#3d3a4a]">
              You still owe <span className="font-bold text-[#1a1625]">{n.amount}</span> in <span style={{ color: colors.primary, fontWeight: 600 }}>{n.groupName}</span>
            </p>
            <p className="mt-1" style={{ fontSize: '9px', color: '#b8b4d8', fontWeight: 600 }}>
              Reminder  ·  {n.timeLabel}
            </p>
          </>
        );
      case 'SETTLED':
        return (
          <>
            <p className="text-[14px] leading-[1.3] text-[#3d3a4a]">
              <span className="font-bold text-[#1a1625]">{n.memberName}</span> settled up <span className="font-bold text-[#1a1625]">{n.amount}</span> in <span style={{ color: colors.primary, fontWeight: 600 }}>{n.groupName}</span>
            </p>
            <p className="mt-1" style={{ fontSize: '9px', color: '#b8b4d8', fontWeight: 600 }}>
              Settled  ·  {n.timeLabel}
            </p>
          </>
        );
      case 'STREAK':
        return (
          <>
            <p className="text-[14px] leading-[1.3] font-bold text-[#1a1625]">
              {n.streakText}
            </p>
            <p className="mt-1" style={{ fontSize: '9px', color: '#b8b4d8', fontWeight: 600 }}>
              Achievement  ·  {n.timeLabel}
            </p>
          </>
        );
    }
  };

  const renderSection = (title: string, items: AppNotification[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="px-5 mb-2 font-bold uppercase tracking-[0.06em]" style={{ fontSize: '11px', color: colors.textMuted }}>
          {title}
        </h3>
        <div className="flex flex-col">
          <AnimatePresence>
            {items.map(n => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onClick={() => handleNotificationClick(n)}
                className="flex gap-3 px-5 py-4 cursor-pointer relative"
                style={{ 
                  backgroundColor: n.read ? '#ffffff' : '#faf9ff',
                  borderTop: `0.5px solid ${colors.primaryFaint}`
                }}
              >
                {!n.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: colors.primary, borderRadius: '0 2px 2px 0' }} />
                )}
                {renderAvatarContent(n)}
                <div className="flex-1 pt-0.5">
                  {renderContent(n)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

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
          <h1 className="font-semibold" style={{ fontSize: '14px', color: colors.textPrimary }}>
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
          <div className="text-center mt-20 px-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ede9ff' }}>
              <span className="text-2xl">📭</span>
            </div>
            <p className="font-bold text-[#1a1625] mb-1" style={{ color: colors.textPrimary }}>No notifications</p>
            <p style={{ fontSize: '13px', color: colors.textMuted }}>You're all caught up!</p>
          </div>
        )}
      </div>

    </div>
  );
}
