import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useTheme } from './ThemeProvider';
import { ArrowLeft, ArrowRight, Check, X, ChevronRight, StickyNote, Users, Plus, Banknote, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { getGroupById, getGroupMembers, requestSettlement, MOCK_USER_ID } from '../../api/groups';
import { MOCK_PAIR_BALANCES } from '../../mock/balances';
import { toast } from 'sonner';

type ActiveSheet = 'NONE' | 'AMOUNT' | 'NOTE' | 'FROM' | 'TO';

export function SettleUp() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('NONE');

  // Smart defaults: from = current user, to/amount from query params or empty
  const [selectedFromId, setSelectedFromId] = useState(searchParams.get('from') || MOCK_USER_ID);
  const [selectedToId, setSelectedToId] = useState(searchParams.get('to') || '');
  const initialAmount = searchParams.get('amount') || '0';
  const currency = searchParams.get('currency') || 'INR';

  const [amountStr, setAmountStr] = useState(initialAmount);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const amtInputRef = useRef<HTMLInputElement>(null);
  const noteInputRef = useRef<HTMLInputElement>(null);

  const numAmount = parseFloat(amountStr) || 0;

  useEffect(() => {
    async function fetchData() {
      if (!groupId) return;
      try {
        setLoading(true);
        const [g, m] = await Promise.all([
          getGroupById(groupId),
          getGroupMembers(groupId)
        ]);
        setGroup(g);
        setMembers(m);
      } catch (err) {
        toast.error("Group not found");
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [groupId, navigate]);

  const fromMember = members.find(m => m.userPublicId === selectedFromId);
  const toMember = members.find(m => m.userPublicId === selectedToId);
  const fromName = selectedFromId === MOCK_USER_ID ? 'You' : fromMember?.displayName || 'Select sender';
  const toName = selectedToId ? (selectedToId === MOCK_USER_ID ? 'You' : toMember?.displayName || 'Unknown') : 'Select recipient';
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const canSubmit = numAmount > 0 && selectedFromId && selectedToId && selectedFromId !== selectedToId;

  const handleSettle = async () => {
    if (!groupId || !canSubmit) return;
    setSubmitting(true);
    try {
      await requestSettlement(groupId, {
        payeeUserPublicId: selectedToId,
        amount: numAmount.toFixed(2),
        currencyCode: currency,
        note: note || undefined
      });
      setSuccess(true);
    } catch (err) {
      toast.error('Settlement failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Other members (for pickers — exclude the already-selected member)
  const fromPickerMembers = members.filter(m => m.userPublicId !== selectedToId);
  
  // For 'To' picker: only show members with an outstanding balance
  const pairBalances = groupId ? (MOCK_PAIR_BALANCES[groupId] || []) : [];
  const toPickerMembers = members.filter(m => {
    if (m.userPublicId === selectedFromId) return false;
    // Check if this member has a balance with the current user
    return pairBalances.some((b: any) =>
      (b.userLowPublicId === m.userPublicId || b.userHighPublicId === m.userPublicId)
    );
  });
  
  // Helper to get the balance amount between current user and a specific member
  const getBalanceWithMember = (memberId: string): { amount: number; direction: 'owe' | 'owed' } => {
    const balance = pairBalances.find((b: any) =>
      (b.userLowPublicId === memberId || b.userHighPublicId === memberId)
    );
    if (!balance) return { amount: 0, direction: 'owe' };
    const netAmount = parseFloat(balance.netAmount);
    // If MOCK_USER_ID is userHighPublicId: negative netAmount means user owes, positive means user is owed
    if (balance.userHighPublicId === MOCK_USER_ID) {
      return { amount: Math.abs(netAmount), direction: netAmount < 0 ? 'owe' : 'owed' };
    } else {
      return { amount: Math.abs(netAmount), direction: netAmount > 0 ? 'owed' : 'owe' };
    }
  };

  const paymentMethods = [
    { id: 'UPI', label: 'UPI', icon: Smartphone },
    { id: 'Cash', label: 'Cash', icon: Banknote },
    { id: 'Bank Transfer', label: 'Bank', icon: Building2 },
    { id: 'Other', label: 'Other', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans overflow-x-hidden relative">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(`/group/${groupId}`)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-full dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {group?.name}
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 min-h-screen flex flex-col relative z-10 pt-16">
        <AnimatePresence mode="wait">

          {/* Success State */}
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center flex-1 py-20 space-y-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.15 }}
                className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center"
              >
                <Check className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </motion.div>

              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Request Sent</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400">
                  {currencySymbol}{numAmount.toFixed(2)} sent to <span className="font-semibold text-slate-900 dark:text-white">{toName}</span> for approval
                </p>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => navigate(`/group/${groupId}`)}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-full font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Back to Group
              </motion.button>
            </motion.div>
          )}

          {/* Settlement Form */}
          {!success && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col pt-8 pb-32"
            >
              {/* Hero Visual: Avatar → Arrow → Avatar */}
              <div className="flex flex-col items-center py-8 mb-4">
                <div className="flex items-center gap-6 mb-6">
                  {/* From Avatar — tappable */}
                  <div
                    onClick={() => setActiveSheet('FROM')}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    {fromMember?.avatarUrl ? (
                      <img src={fromMember.avatarUrl} alt={fromName} className="w-16 h-16 rounded-full object-cover border-3 border-rose-200 dark:border-rose-800 shadow-lg group-hover:ring-2 group-hover:ring-rose-400 transition-all" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-2xl border-3 border-rose-200 dark:border-rose-800 group-hover:ring-2 group-hover:ring-rose-400 transition-all">
                        {fromName.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-rose-500 transition-colors">{fromName}</span>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20">
                    <ArrowRight className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  {/* To Avatar — tappable */}
                  <div
                    onClick={() => setActiveSheet('TO')}
                    className="flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    {toMember?.avatarUrl ? (
                      <img src={toMember.avatarUrl} alt={toName} className="w-16 h-16 rounded-full object-cover border-3 border-emerald-200 dark:border-emerald-800 shadow-lg group-hover:ring-2 group-hover:ring-emerald-400 transition-all" />
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-500 dark:text-emerald-400 group-hover:ring-2 group-hover:ring-emerald-400 group-hover:border-emerald-400 transition-all bg-emerald-50/50 dark:bg-emerald-900/20">
                        <Plus className="w-7 h-7" />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">{toName}</span>
                  </div>
                </div>

                {/* Tappable Hero Amount */}
                <div
                  onClick={() => setActiveSheet('AMOUNT')}
                  className="cursor-pointer group"
                >
                  <div className="flex items-center text-6xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:scale-105 transition-transform">
                    <span className="text-slate-400 mr-1 text-5xl font-medium">{currencySymbol}</span>
                    {numAmount.toFixed(2)}
                  </div>
                  <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-2 group-hover:text-indigo-500 transition-colors">Tap to edit amount</p>
                </div>
              </div>

              {/* Property List */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {/* From */}
                  <div
                    onClick={() => setActiveSheet('FROM')}
                    className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">From</span>
                    <div className="flex items-center gap-3">
                      {fromMember?.avatarUrl && <img src={fromMember.avatarUrl} alt={fromName} className="w-7 h-7 rounded-full" />}
                      <span className={`text-lg font-semibold ${selectedFromId ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{fromName}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>

                  {/* To */}
                  <div
                    onClick={() => setActiveSheet('TO')}
                    className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">To</span>
                    <div className="flex items-center gap-3">
                      {toMember?.avatarUrl && <img src={toMember.avatarUrl} alt={toName} className="w-7 h-7 rounded-full" />}
                      <span className={`text-lg font-semibold ${selectedToId ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{toName}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>

                  {/* Amount */}
                  <div onClick={() => setActiveSheet('AMOUNT')} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">Amount</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">{currencySymbol}{numAmount.toFixed(2)}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>

                  {/* Via (Payment Method) */}
                  <div className="flex items-center justify-between p-4 px-5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">Via</span>
                    <div className="flex items-center gap-2">
                      {paymentMethods.map(pm => {
                        const Icon = pm.icon;
                        const isActive = paymentMethod === pm.id;
                        return (
                          <button
                            key={pm.id}
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {pm.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Note */}
                  <div onClick={() => { setActiveSheet('NOTE'); setTimeout(() => noteInputRef.current?.focus(), 100); }} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">Note</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-semibold ${note ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>{note || 'Optional'}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Validation hint */}
              {!canSubmit && !submitting && (
                <p className="text-center text-sm text-slate-400 mb-4">
                  {!selectedToId ? 'Please select a recipient' : numAmount <= 0 ? 'Enter an amount' : selectedFromId === selectedToId ? 'Sender and recipient must be different' : ''}
                </p>
              )}

              {/* Settle Button */}
              <button
                disabled={!canSubmit || submitting}
                onClick={handleSettle}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                  canSubmit && !submitting
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 active:scale-[0.98]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 shadow-transparent cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <>Settling <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin ml-2" /></>
                ) : (
                  <>Settle {currencySymbol}{numAmount.toFixed(2)}</>
                )}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Bottom Sheets */}
      <AnimatePresence>
        {activeSheet !== 'NONE' && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveSheet('NONE')}
              className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="pt-4 pb-2 px-6 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeSheet === 'AMOUNT' && 'Edit Amount'}
                    {activeSheet === 'NOTE' && 'Add a Note'}
                    {activeSheet === 'FROM' && 'Who is paying?'}
                    {activeSheet === 'TO' && 'Paying to whom?'}
                  </h3>
                  <button onClick={() => setActiveSheet('NONE')} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-12 pt-4 overflow-y-auto">
                {activeSheet === 'AMOUNT' && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="flex items-center text-7xl font-black text-slate-900 dark:text-white">
                      <span className="text-slate-300 mr-2 text-5xl font-medium">{currencySymbol}</span>
                      <input
                        ref={amtInputRef} type="number" value={amountStr}
                        onChange={(e) => setAmountStr(e.target.value)}
                        className="bg-transparent border-none outline-none text-center w-[250px] caret-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" autoFocus
                      />
                    </div>
                    <button onClick={() => setActiveSheet('NONE')} className="mt-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-8 py-3 rounded-full font-bold w-full max-w-xs hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/25">Done</button>
                  </div>
                )}

                {activeSheet === 'NOTE' && (
                  <div className="py-4">
                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['UPI', 'Cash', 'PhonePe', 'GPay', 'Bank Transfer'].map(chip => (
                        <button
                          key={chip}
                          onClick={() => setNote(chip)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            note === chip
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    <input
                      ref={noteInputRef} type="text" value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. UPI transfer, Cash..."
                      className="w-full text-2xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-800 pb-4 focus:outline-none focus:border-indigo-500 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      onKeyDown={(e) => { if (e.key === 'Enter') setActiveSheet('NONE') }}
                    />
                    <button onClick={() => setActiveSheet('NONE')} className="mt-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-8 py-3 rounded-full font-bold w-full hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/25">Confirm</button>
                  </div>
                )}

                {/* Member Picker for From / To */}
                {(activeSheet === 'FROM' || activeSheet === 'TO') && (
                  <div className="space-y-2 py-2">
                    {(activeSheet === 'FROM' ? fromPickerMembers : toPickerMembers).map((member: any) => {
                      const isSelected = activeSheet === 'FROM' 
                        ? member.userPublicId === selectedFromId 
                        : member.userPublicId === selectedToId;
                      const displayName = member.userPublicId === MOCK_USER_ID ? `${member.displayName} (You)` : member.displayName;
                      
                      // For 'TO' sheet, show balance info
                      const balanceInfo = activeSheet === 'TO' ? getBalanceWithMember(member.userPublicId) : null;
                      const borderColor = balanceInfo 
                        ? (balanceInfo.direction === 'owe' ? 'border-l-rose-500' : 'border-l-emerald-500')
                        : '';
                      
                      return (
                        <button
                          key={member.userPublicId}
                          onClick={() => {
                            if (activeSheet === 'FROM') {
                              setSelectedFromId(member.userPublicId);
                            } else {
                              setSelectedToId(member.userPublicId);
                              // Pre-fill amount with outstanding debt
                              if (balanceInfo && balanceInfo.amount > 0) {
                                setAmountStr(balanceInfo.amount.toFixed(2));
                              }
                            }
                            setActiveSheet('NONE');
                          }}
                          className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all active:scale-[0.98] ${
                            activeSheet === 'TO' ? `border-l-4 ${borderColor}` : ''
                          } ${
                            isSelected 
                              ? 'bg-indigo-50 dark:bg-indigo-500/10 border-2 border-indigo-500' 
                              : `bg-slate-50 dark:bg-slate-800/50 ${activeSheet === 'TO' ? '' : 'border-2 border-transparent'} hover:bg-slate-100 dark:hover:bg-slate-800`
                          }`}
                        >
                          <img 
                            src={member.avatarUrl} 
                            alt={displayName} 
                            className="w-10 h-10 rounded-full object-cover" 
                          />
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">{displayName}</p>
                            {member.role === 'OWNER' && (
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Owner</span>
                            )}
                          </div>
                          {activeSheet === 'TO' && balanceInfo && balanceInfo.amount > 0 && (
                            <span className={`text-sm font-bold ${
                              balanceInfo.direction === 'owe' 
                                ? 'text-rose-600 dark:text-rose-400' 
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {balanceInfo.direction === 'owe' ? 'You owe' : 'Owes you'} {currencySymbol}{balanceInfo.amount.toFixed(2)}
                            </span>
                          )}
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
