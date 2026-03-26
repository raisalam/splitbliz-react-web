import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Check, LogOut, Receipt, PenLine, Users } from 'lucide-react';
import { MOCK_GROUPS } from '../../mock/groups';
import { colors } from '../../constants/colors';

type ActivityType = 'EXPENSE' | 'SETTLE' | 'EDIT' | 'JOIN' | 'LEAVE';

interface GroupActivityEvent {
  id: string;
  type: ActivityType;
  dateKey: 'TODAY' | 'YESTERDAY' | 'MAR 13'; // simplified for mock
  timeLabel: string;
  
  // Content
  memberName: string;
  actionText: string;
  amount?: string;
  subtitleLabel: string;
}

const MOCK_ACTIVITY: GroupActivityEvent[] = [
  {
    id: 'a1',
    type: 'EXPENSE',
    dateKey: 'TODAY',
    timeLabel: '10:30 AM',
    memberName: 'Sarah Connor',
    actionText: 'added Dinner at Jimbaran',
    amount: '₹4,500',
    subtitleLabel: 'Split equally',
  },
  {
    id: 'a2',
    type: 'JOIN',
    dateKey: 'TODAY',
    timeLabel: '9:15 AM',
    memberName: 'Alex Carter',
    actionText: 'joined the group',
    subtitleLabel: 'Invited by You',
  },
  {
    id: 'a3',
    type: 'EDIT',
    dateKey: 'YESTERDAY',
    timeLabel: '8:45 PM',
    memberName: 'David Brooks',
    actionText: 'edited Snorkeling Gear',
    subtitleLabel: '₹1,200 → ₹1,500',
  },
  {
    id: 'a4',
    type: 'SETTLE',
    dateKey: 'MAR 13',
    timeLabel: '11:20 AM',
    memberName: 'You',
    actionText: 'settled up with Sarah',
    subtitleLabel: '₹450',
  },
  {
    id: 'a5',
    type: 'LEAVE',
    dateKey: 'MAR 13',
    timeLabel: '9:00 AM',
    memberName: 'John Smith',
    actionText: 'left the group',
    subtitleLabel: '',
  }
];

export function GroupActivity() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [activities] = useState(MOCK_ACTIVITY);

  const group = MOCK_GROUPS.find(g => g.publicId === groupId) || MOCK_GROUPS[0];

  const getIconProps = (type: ActivityType) => {
    switch (type) {
      case 'EXPENSE': return { icon: <Receipt className="w-[18px] h-[18px] text-[#6c5ce7]" />, bg: '#ede9ff' };
      case 'SETTLE': return { icon: <Check className="w-[18px] h-[18px] text-[#0f6e56]" strokeWidth={3} />, bg: colors.successLight };
      case 'EDIT': return { icon: <PenLine className="w-[18px] h-[18px] text-[#e28a11]" />, bg: '#faeeda' };
      case 'JOIN': return { icon: <Users className="w-[18px] h-[18px] text-[#2c74c9]" />, bg: '#e6f1fb' };
      case 'LEAVE': return { icon: <LogOut className="w-[18px] h-[18px] text-[#e24b4a]" />, bg: '#fceaea' };
    }
  };

  const renderActivityRow = (event: GroupActivityEvent, index: number) => {
    const iconProps = getIconProps(event.type);
    
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex gap-4 px-5 py-4 cursor-default"
        style={{ borderBottom: `0.5px solid ${colors.primaryFaint}` }}
      >
        <div 
          className="w-[32px] h-[32px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconProps.bg, borderRadius: '10px' }}
        >
          {iconProps.icon}
        </div>
        
        <div className="flex-1 pt-0.5 flex items-start justify-between min-w-0">
          <div className="pr-4">
            <p className="text-[14px] leading-[1.3] text-[#3d3a4a] break-words">
              <span className="font-bold text-[#1a1625]">{event.memberName}</span> {event.actionText}
            </p>
            <p className="mt-1 flex items-center gap-1.5" style={{ fontSize: '9px', color: '#b8b4d8', fontWeight: 600 }}>
              {event.subtitleLabel && <span>{event.subtitleLabel}  · </span>}
              <span>{event.timeLabel}</span>
            </p>
          </div>
          
          {event.type === 'EXPENSE' && event.amount && (
            <div className="font-bold text-[#1a1625] text-[13px] shrink-0 pt-0.5">
              {event.amount}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Group by date
  const groupedEvents = activities.reduce((acc, curr) => {
    if (!acc[curr.dateKey]) acc[curr.dateKey] = [];
    acc[curr.dateKey].push(curr);
    return acc;
  }, {} as Record<string, GroupActivityEvent[]>);

  const groupKeys = Object.keys(groupedEvents);

  return (
    <div className="min-h-screen bg-white font-sans pb-10">
      
      {/* Sticky White Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm flex items-center px-4 h-16">
        <button 
          onClick={() => navigate(`/group/${group.publicId}`)}
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors hover:bg-[#e0ddf5] mr-3"
          style={{ backgroundColor: colors.primaryFaint }}
        >
          <ArrowLeft className="w-4 h-4" style={{ color: '#3d3a4a' }} />
        </button>
        <h1 className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
          Activity
        </h1>
      </header>

      {/* Main Content */}
      <div className="pt-2">
        {groupKeys.map(dateKey => (
          <div key={dateKey} className="mb-2">
            <h3 className="px-5 py-3 font-bold uppercase tracking-[0.06em] sticky top-16 bg-white z-40 border-b border-[#f0eeff]" style={{ fontSize: '11px', color: colors.textMuted }}>
              {dateKey}
            </h3>
            <div className="flex flex-col bg-white">
              {groupedEvents[dateKey].map((event, idx) => renderActivityRow(event, idx))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
