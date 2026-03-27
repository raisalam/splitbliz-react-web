import React from 'react';
import { motion } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { colors } from '../../constants/colors';
import { Skeleton } from '../../components/ui/skeleton';
import { EmptyState } from '../../components/EmptyState';
import { useActivity } from '../../hooks/useActivity';
import { GROUP_ACTIVITY_ICON_MAP } from '../../constants/iconography';

interface GroupActivityEvent {
  id: string;
  type: 'EXPENSE' | 'SETTLE' | 'EDIT' | 'JOIN' | 'LEAVE';
  dateKey: string;
  timeLabel: string;

  // Content
  memberName: string;
  actionText: string;
  amount?: string;
  subtitleLabel: string;
}

export function GroupActivity() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading: loading, error } = useActivity(groupId || '');
  const entries = data?.entries ?? [];

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans pb-10">
        <header className="sticky top-0 z-50 bg-white shadow-sm flex items-center px-4 h-16">
          <button
            onClick={() => navigate(`/group/${groupId}`)}
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors hover:bg-[#e0ddf5] mr-3"
            style={{ backgroundColor: colors.primaryFaint }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#3d3a4a' }} />
          </button>
          <h1 className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
            Activity
          </h1>
        </header>

        <div className="pt-2">
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
      <div className="min-h-screen bg-white font-sans pb-10">
        <header className="sticky top-0 z-50 bg-white shadow-sm flex items-center px-4 h-16">
          <button
            onClick={() => navigate(`/group/${groupId}`)}
            className="w-[28px] h-[28px] rounded-full flex items-center justify-center transition-colors hover:bg-[#e0ddf5] mr-3"
            style={{ backgroundColor: colors.primaryFaint }}
          >
            <ArrowLeft className="w-4 h-4" style={{ color: '#3d3a4a' }} />
          </button>
          <h1 className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
            Activity
          </h1>
        </header>
        <div className="pt-10 text-center text-sm text-slate-500">
          Failed to load activity. Please try again.
        </div>
      </div>
    );
  }

  const getIconProps = (type: GroupActivityEvent['type']) => {
    return GROUP_ACTIVITY_ICON_MAP[type] ?? GROUP_ACTIVITY_ICON_MAP.EXPENSE;
  };

  const toEvent = (entry: any): GroupActivityEvent => {
    const createdAt = entry.createdAt;
    const dateKey = new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const timeLabel = new Date(createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const memberName = entry.actor?.displayName || 'Someone';
    const amount = entry.metadata?.amount;

    let type: GroupActivityEvent['type'] = 'EXPENSE';
    let actionText = 'updated activity';
    let subtitleLabel = entry.metadata?.subtitle || '';
    switch (entry.eventType) {
      case 'EXPENSE_CREATED':
        type = 'EXPENSE';
        actionText = `added ${entry.metadata?.title || 'an expense'}`;
        break;
      case 'EXPENSE_EDITED':
        type = 'EDIT';
        actionText = `edited ${entry.metadata?.title || 'an expense'}`;
        break;
      case 'EXPENSE_DELETED':
        type = 'EDIT';
        actionText = `deleted ${entry.metadata?.title || 'an expense'}`;
        break;
      case 'SETTLEMENT_CREATED':
        type = 'SETTLE';
        actionText = 'requested a settlement';
        break;
      case 'SETTLEMENT_APPROVED':
        type = 'SETTLE';
        actionText = 'approved a settlement';
        break;
      case 'SETTLEMENT_REJECTED':
        type = 'SETTLE';
        actionText = 'rejected a settlement';
        break;
      case 'MEMBER_JOINED':
        type = 'JOIN';
        actionText = 'joined the group';
        break;
      case 'MEMBER_REMOVED':
      case 'MEMBER_LEFT':
        type = 'LEAVE';
        actionText = 'left the group';
        break;
      default:
        break;
    }

    return {
      id: entry.id,
      type,
      dateKey,
      timeLabel,
      memberName,
      actionText,
      amount,
      subtitleLabel,
    };
  };

  const activities = entries.map(toEvent);

  const renderActivityRow = (event: GroupActivityEvent, index: number) => {
    const iconProps = getIconProps(event.type);
    const Icon = iconProps.Icon;

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
          <Icon className={iconProps.className} strokeWidth={iconProps.strokeWidth} />
        </div>

        <div className="flex-1 pt-0.5 flex items-start justify-between min-w-0">
          <div className="pr-4">
            <p className="text-[14px] leading-[1.3] text-[#3d3a4a] break-words">
              <span className="font-bold text-[#1a1625]">{event.memberName}</span> {event.actionText}
            </p>
            <p className="mt-1 flex items-center gap-1.5" style={{ fontSize: '9px', color: '#b8b4d8', fontWeight: 600 }}>
              {event.subtitleLabel && <span>{event.subtitleLabel} - </span>}
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
          onClick={() => navigate(`/group/${groupId}`)}
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
        {activities.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Activity will appear here as your group adds expenses and settlements."
          />
        ) : (
          groupKeys.map(dateKey => (
            <div key={dateKey} className="mb-2">
              <h3 className="px-5 py-3 font-bold uppercase tracking-[0.06em] sticky top-16 bg-white z-40 border-b border-[#f0eeff]" style={{ fontSize: '11px', color: colors.textMuted }}>
                {dateKey}
              </h3>
              <div className="flex flex-col bg-white">
                {groupedEvents[dateKey].map((event, idx) => renderActivityRow(event, idx))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
