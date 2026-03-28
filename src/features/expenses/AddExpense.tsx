import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useTheme } from '../../providers/ThemeProvider';
import { expensesService, groupsService } from '../../services';
import { extractApiError } from '../../services/apiClient';
import { useCreateExpense, useUpdateExpense } from '../../hooks/useExpenseMutations';
import { ArrowLeft, Banknote, Check, ChevronRight, Info, Receipt, Search, X } from '../../constants/icons';
import { useUser } from '../../providers/UserContext';
import { toast } from 'sonner';
import { formatCurrency, formatCurrencyParts } from '../../utils/formatCurrency';
import {
  SplitType, validatePayers, computeSplits, calculateBalances, computeSettlements
} from '../../utils/expenseCalculator';
import { ExpenseBasicForm } from './components/ExpenseBasicForm';
import { ExpenseSplitForm } from './components/ExpenseSplitForm';
import { PayerSelector } from './components/PayerSelector';

// --- Overlay Types ---
type ActiveSheet = 'NONE' | 'PAYERS' | 'SPLIT_TYPE' | 'MEMBERS' | 'AMOUNT' | 'DESCRIPTION';

export function AddExpense() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useTheme();
  const { user } = useUser();

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const editExpenseId = searchParams.get('edit');
  const duplicateExpenseId = searchParams.get('duplicate');
  const prefillExpenseId = editExpenseId || duplicateExpenseId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [editingVersion, setEditingVersion] = useState<number | null>(null);

  // ---- UX Flow State ----
  // step 1: Hero Amount Entry -> step 2: Property List Builder
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('NONE');

  // ---- Data State ----
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [payers, setPayers] = useState<Record<string, string>>({});
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<any>('OTHER');

  const descInputRef = useRef<HTMLInputElement>(null);
  const amtInputRef = useRef<HTMLInputElement>(null);
  const currentUserId = user?.id ?? '';
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!groupId) return;
      try {
        setLoading(true);
        const detail = await groupsService.getGroupDetail(groupId);
        setGroup(detail.group);
        setMembers(detail.members);

        // Setup defaults
        setSelectedMemberIds(new Set(detail.members.map(mbr => mbr.userId)));
        const initSplits: Record<string, string> = {};
        detail.members.forEach(mbr => { initSplits[mbr.userId] = ''; });
        setCustomSplits(initSplits);

        if (prefillExpenseId) {
          const expense = await expensesService.getExpense(groupId, prefillExpenseId);
          setDescription(expense.title ?? '');
          setAmountStr(expense.amount ?? '');
          setSplitType((expense.splitType as any) ?? 'EQUAL');

          setSelectedCategory(expense.category ?? 'OTHER');

          const splitsMap: Record<string, string> = {};
          const splitIds = new Set<string>();
          expense.splits?.forEach((s) => {
            splitsMap[s.userId] = s.splitAmount;
            splitIds.add(s.userId);
          });
          if (splitIds.size > 0) {
            setSelectedMemberIds(splitIds);
          }
          setCustomSplits((prev) => ({ ...prev, ...splitsMap }));

          const payerMap: Record<string, string> = {};
          expense.payers?.forEach((p) => {
            payerMap[p.userId] = p.paidAmount;
          });
          setPayers(payerMap);

          setEditingVersion(expense.version ?? null);
          setCurrentStep(2);
        }
      } catch (err) {
        toast.error("Group not found");
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [groupId, navigate, prefillExpenseId]);

  const numAmount = parseFloat(amountStr) || 0;
  const currencyCode = group?.currencyCode || 'INR';
  const currencyParts = formatCurrencyParts(numAmount.toFixed(2), currencyCode);

  // Auto-fill Current User as 100% payer when moving to Step 2 for the first time
  useEffect(() => {
    if (currentStep === 2 && Object.keys(payers).length === 0 && numAmount > 0) {
      setPayers({ [currentUserId]: numAmount.toString() });
    }
  }, [currentStep, numAmount, payers, currentUserId]);

  // Sync default payer when total amount changes if only 1 payer exists
  useEffect(() => {
    const payerKeys = Object.keys(payers);
    if (payerKeys.length === 1 && numAmount > 0 && currentStep === 2) {
      setPayers({ [payerKeys[0]]: amountStr });
    }
  }, [amountStr]);


  // ---- Setters ----
  const togglePayer = (userId: string) => {
    setPayers(prev => {
      const next = { ...prev };
      if (next[userId] !== undefined) {
        delete next[userId];
        if (Object.keys(next).length === 0) next[currentUserId] = amountStr; // Fallback
      } else {
        next[userId] = '';
      }
      return next;
    });
  };

  const toggleSplitMember = (userId: string) => {
    const next = new Set(selectedMemberIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedMemberIds(next);

    // Recalculate percent/fixed if active
    if (splitType === 'PERCENTAGE' || splitType === 'FIXED') {
      const nextSplits: Record<string, string> = {};
      const selectedArray = Array.from(next);
      const numSelected = selectedArray.length;

      if (numSelected > 0 && numAmount > 0) {
        const total = splitType === 'PERCENTAGE' ? 100 : numAmount;
        const share = total / numSelected;
        let assigned = 0;
        selectedArray.forEach((id, idx) => {
          if (idx === numSelected - 1) nextSplits[id] = (total - assigned).toFixed(2);
          else {
            nextSplits[id] = share.toFixed(2);
            assigned += Number(share.toFixed(2));
          }
        });
      }
      setCustomSplits(nextSplits);
    }
  };

  const handleSplitTypeChange = (newType: SplitType) => {
    setSplitType(newType);
    const nextSplits: Record<string, string> = {};
    const selectedArray = Array.from(selectedMemberIds);
    const numSelected = selectedArray.length;

    if (numSelected === 0 || numAmount <= 0) return;

    if (newType === 'PERCENTAGE' || newType === 'FIXED') {
      const total = newType === 'PERCENTAGE' ? 100 : numAmount;
      const share = total / numSelected;
      let assigned = 0;
      selectedArray.forEach((id, idx) => {
        if (idx === numSelected - 1) nextSplits[id] = (total - assigned).toFixed(2);
        else {
          nextSplits[id] = share.toFixed(2);
          assigned += Number(share.toFixed(2));
        }
      });
      setCustomSplits(nextSplits);
    }
  };


  // ---- Main Calculation Engine ----
  const calculations = useMemo(() => {
    let numericPayers: Record<string, number> = {};
    Object.entries(payers).forEach(([id, val]) => {
      const num = parseFloat(val) || 0;
      if (num > 0) numericPayers[id] = num;
    });

    const payerValidation = validatePayers(numAmount, numericPayers);

    const splitNumericInputs: Record<string, number> = {};
    for (const [id, val] of Object.entries(customSplits)) {
      splitNumericInputs[id] = parseFloat(val) || 0;
    }
    const selectedArray = members.filter(m => selectedMemberIds.has(m.userPublicId)).map(m => m.userPublicId);

    const splitValidation = computeSplits(numAmount, splitType, selectedArray, splitNumericInputs);

    let balances: Record<string, number> = {};
    let settlements: any[] = [];
    const isReady = payerValidation.isValid && splitValidation.isValid && description.trim() !== '' && numAmount > 0;

    if (isReady) {
      balances = calculateBalances(numericPayers, splitValidation.results);
      settlements = computeSettlements(balances);
    }

    return {
      numericPayers,
      numericSplits: splitValidation.results,
      payerValidation,
      splitValidation,
      balances,
      settlements,
      isReady
    };
  }, [numAmount, description, payers, customSplits, splitType, selectedMemberIds, members]);


  const handleCreateExpense = async () => {
    if (!groupId || !calculations.isReady) return;
    if (!currentUserId) {
      toast.error('Session expired. Please log in again.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const apiSplitType = splitType === 'FIXED' ? 'EXACT' : splitType;
      const total = parseFloat(amountStr);
      if (!Number.isFinite(total) || total <= 0) {
        const msg = 'Amount must be greater than zero.';
        setSubmitError(msg);
        toast.error(msg);
        return;
      }

      const splitTotal = Object.values(calculations.numericSplits || {}).reduce((sum, val) => sum + (val || 0), 0);
      if (Math.abs(splitTotal - total) > 0.01) {
        const msg = 'Split amounts must equal the total.';
        setSubmitError(msg);
        toast.error(msg);
        return;
      }

      const formattedAmount = total.toFixed(2);
      const memberById = new Map(members.map(m => [m.userPublicId ?? m.userId, m.userId ?? m.userPublicId]));

      const payers = Object.entries(calculations.numericPayers!).map(([id, amt]) => ({
        userId: memberById.get(id) ?? id,
        paidAmount: amt.toFixed(2)
      }));
      const splits = Object.entries(calculations.numericSplits!).map(([id, amt]) => ({
        userId: memberById.get(id) ?? id,
        splitAmount: amt.toFixed(2)
      }));

      const categoryKey = selectedCategory || 'OTHER';

      if (editExpenseId && !duplicateExpenseId) {
        if (!editingVersion) {
          throw new Error('Missing expense version.');
        }
          await updateExpense.mutateAsync({
            groupId,
            expenseId: editExpenseId,
            data: {
              version: editingVersion,
              title: description,
              amount: formattedAmount,
              category: categoryKey,
              expenseDate: new Date().toISOString().slice(0, 10),
              splitType: apiSplitType,
              payers,
              splits,
            }
          });
        toast.success('Expense updated successfully!');
        navigate(`/group/${groupId}/expense/${editExpenseId}`);
      } else {
          await createExpense.mutateAsync({
            groupId,
            data: {
              title: description,
              amount: formattedAmount,
              currencyCode: currencyCode,
              category: categoryKey,
              expenseDate: new Date().toISOString().slice(0, 10),
              splitType: apiSplitType,
              payers,
              splits,
            }
          });
        toast.success('Expense added successfully!');
        navigate(`/group/${groupId}`);
      }
    } catch (err) {
      const apiErr = extractApiError(err);
      let msg = 'Failed to create expense. Please try again.';
      if (apiErr?.code === 'ERR_SPLIT_MISMATCH') {
        msg = 'Split amounts do not add up to the total.';
      } else if (apiErr?.code === 'ERR_PAYMENT_SUM_MISMATCH') {
        msg = 'Payer amounts do not add up to the total.';
      } else if (apiErr?.code === 'ERR_INVALID_AMOUNT') {
        msg = 'Amount must be greater than zero.';
      } else if (apiErr?.code === 'ERR_PAYER_NOT_SPLITTER') {
        msg = 'Every payer must also be in the split.';
      }
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Text Generators for Property List ----
  const getPayerDisplay = () => {
    const pKeys = Object.keys(payers);
    if (pKeys.length === 0) return 'Someone';
    if (pKeys.length === 1) {
      const m = members.find(m => m.userPublicId === pKeys[0]);
      return m?.userPublicId === currentUserId ? 'You' : m?.displayName;
    }
    return `${pKeys.length} people`;
  };

  const getParticipantsDisplay = () => {
    if (selectedMemberIds.size === members.length) return 'everyone';
    if (selectedMemberIds.size === 1) {
      const mId = Array.from(selectedMemberIds)[0];
      const m = members.find(m => m.userPublicId === mId);
      return m?.userPublicId === currentUserId ? 'just you' : `just ${m?.displayName}`;
    }
    return `${selectedMemberIds.size} members`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const getInitial = (name?: string | null) => name?.trim()?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans overflow-x-hidden relative">

      {/* Header Line */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(`/group/${groupId}`)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-full dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {group?.name}
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 min-h-screen flex flex-col relative z-10 pt-16">

        <AnimatePresence mode="wait">

          {currentStep === 1 && (
            <ExpenseBasicForm
              amountStr={amountStr}
              numAmount={numAmount}
              currencyCode={currencyCode}
              selectedCategory={selectedCategory}
              onAmountChange={setAmountStr}
              onSelectCategory={(c) => setSelectedCategory(c)}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col pt-8 pb-32"
            >
              {/* Hero Amount (Tappable) */}
              <div
                onClick={() => setActiveSheet('AMOUNT')}
                className="flex flex-col items-center justify-center py-6 mb-4 cursor-pointer group"
              >
                <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 group-hover:text-indigo-500 transition-colors">Total Amount</span>
                <div className="flex items-center text-6xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:scale-105 transition-transform">
                  <span className="text-slate-400 mr-1 text-5xl font-medium">{currencyParts.symbol}</span>
                  {currencyParts.amount}
                </div>
              </div>

              {/* Vertical Property List */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {/* For What? */}
                  <div onClick={() => { setActiveSheet('DESCRIPTION'); setTimeout(() => descInputRef.current?.focus(), 100); }} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">For What?</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-semibold ${description ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>{description || 'Add description'}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>

                  {/* Who Paid? */}
                  <div onClick={() => setActiveSheet('PAYERS')} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">Who Paid?</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">{getPayerDisplay()}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>

                  {/* Split How? */}
                  <div onClick={() => setActiveSheet('SPLIT_TYPE')} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">Split How?</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">
                        {splitType === 'EQUAL' ? 'Equally' : splitType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amounts'}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>

                  {/* With Who? */}
                  <div onClick={() => setActiveSheet('MEMBERS')} className="flex items-center justify-between p-4 px-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="text-slate-500 dark:text-slate-400 font-medium text-lg">With Who?</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-slate-900 dark:text-white">{getParticipantsDisplay()}</span>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Preview Summary (Inline) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="mt-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80"
              >
                {!calculations.payerValidation.isValid ? (
                  <p className="text-rose-500 font-medium flex items-center gap-2 text-sm"><Info className="w-4 h-4" /> Who paid doesn't total {formatCurrency(numAmount.toFixed(2), currencyCode)}</p>
                ) : !calculations.splitValidation.isValid ? (
                  <p className="text-rose-500 font-medium flex items-center gap-2 text-sm"><Info className="w-4 h-4" /> Validation error in split amounts</p>
                ) : calculations.settlements.length === 0 ? (
                  <div className="flex items-center gap-3 text-emerald-500 dark:text-emerald-400 font-medium text-sm">
                    <Check className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/50 rounded-full p-0.5" />
                    Everything resolves perfectly.
                  </div>
                ) : (
                  <ul className="space-y-2.5">
                    {calculations.settlements.map((s, idx) => {
                      const fromM = members.find(m => m.userPublicId === s.fromUser);
                      const toM = members.find(m => m.userPublicId === s.toUser);
                      const fromName = fromM?.userPublicId === currentUserId ? 'You' : fromM?.displayName;
                      const toName = toM?.userPublicId === currentUserId ? 'You' : toM?.displayName;
                      return (
                        <li key={idx} className="flex items-center text-[15px] border-l-2 border-slate-200 dark:border-slate-700 pl-3 gap-2">
                          {fromM && (
                            fromM.resolvedAvatar && fromM.resolvedAvatar.startsWith('http') ? (
                              <img src={fromM.resolvedAvatar} className="w-6 h-6 rounded-full object-cover shrink-0" alt="" />
                            ) : (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-700 bg-slate-200 shrink-0">
                                {fromM.resolvedAvatar || getInitial(fromM.displayName)}
                              </div>
                            )
                          )}
                          <span className="font-semibold text-slate-900 dark:text-white">{fromName}</span>
                          <span className="text-slate-500 dark:text-slate-400">owes</span>
                          {toM && (
                            toM.resolvedAvatar && toM.resolvedAvatar.startsWith('http') ? (
                              <img src={toM.resolvedAvatar} className="w-6 h-6 rounded-full object-cover shrink-0" alt="" />
                            ) : (
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-700 bg-slate-200 shrink-0">
                                {toM.resolvedAvatar || getInitial(toM.displayName)}
                              </div>
                            )
                          )}
                          <span className="font-semibold text-slate-900 dark:text-white mr-auto">{toName}</span>
                          <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(s.amount.toFixed(2), currencyCode)}</span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </motion.div>

              <div className="mt-auto pt-8 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                  {description ? (
                    <><Check className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-600 dark:text-emerald-400">Ready to save</span></>
                  ) : 'Add a description to continue'}
                </p>
                <button
                  disabled={!calculations.isReady || submitting} onClick={handleCreateExpense}
                  className={`px-8 py-3.5 rounded-full font-bold text-lg transition-all shadow-lg flex items-center gap-2 ${calculations.isReady && !submitting ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25 active:scale-[0.98]' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 shadow-transparent cursor-not-allowed'
                    }`}
                >
                  {submitting ? 'Saving' : 'Save'} {submitting ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin ml-1" /> : <ChevronRight className="w-5 h-5 ml-1" />}
                </button>
              </div>
              {submitError && (
                <p className="mt-4 text-sm font-semibold text-rose-500">
                  {submitError}
                </p>
              )}
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* ---- Interactive Bottom Sheets ---- */}
      <AnimatePresence>
        {activeSheet !== 'NONE' && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveSheet('NONE')}
              className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
            />

            {/* Sheet Surface */}
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl safe-m-bottom overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Drag Handle & Header */}
              <div className="pt-4 pb-2 px-6 sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeSheet === 'PAYERS' && 'Who Paid?'}
                    {activeSheet === 'SPLIT_TYPE' && 'Split Method'}
                    {activeSheet === 'MEMBERS' && 'Who is splitting?'}
                    {activeSheet === 'AMOUNT' && 'Edit Amount'}
                    {activeSheet === 'DESCRIPTION' && 'What is this for?'}
                  </h3>
                  <button onClick={() => setActiveSheet('NONE')} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="px-6 pb-12 pt-4 overflow-y-auto">

                {/* SHEET: PAYERS */}
                {activeSheet === 'PAYERS' && (
                  <PayerSelector
                    members={members}
                    payers={payers}
                    selectedMemberIds={selectedMemberIds}
                    numAmount={numAmount}
                    currencyCode={currencyCode}
                    currentUserId={currentUserId}
                    onTogglePayer={togglePayer}
                    onPayerAmountChange={(userId, value) => setPayers(prev => ({ ...prev, [userId]: value }))}
                    payerValidation={calculations.payerValidation}
                    numericPayers={calculations.numericPayers}
                  />
                )}

                {/* SHEET: SPLIT TYPE */}
                {activeSheet === 'SPLIT_TYPE' && (
                  <ExpenseSplitForm
                    splitType={splitType}
                    numAmount={numAmount}
                    members={members}
                    selectedMemberIds={selectedMemberIds}
                    customSplits={customSplits}
                    onSplitTypeChange={handleSplitTypeChange}
                    onCustomSplitChange={(userId, value) => setCustomSplits(prev => ({ ...prev, [userId]: value }))}
                    splitValidation={calculations.splitValidation}
                    currencyCode={currencyCode}
                  />
                )}

                {/* SHEET: MEMBERS */}
                {activeSheet === 'MEMBERS' && (
                  <div className="space-y-2">
                    {/* Header with count and toggle */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {selectedMemberIds.size} of {members.length} splitting
                      </span>
                      <button 
                        onClick={() => {
                          if (selectedMemberIds.size === members.length) setSelectedMemberIds(new Set());
                          else setSelectedMemberIds(new Set(members.map(m => m.userPublicId)));
                        }}
                        className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                      >
                        {selectedMemberIds.size === members.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    {members.map(member => {
                      const isSelected = selectedMemberIds.has(member.userPublicId);
                      const shareAmount = selectedMemberIds.size > 0 && numAmount > 0 ? (numAmount / selectedMemberIds.size) : 0;
                      return (
                        <div key={member.userPublicId} onClick={() => toggleSplitMember(member.userPublicId)} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                          isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}>
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                            isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          {member.resolvedAvatar && member.resolvedAvatar.startsWith('http') ? (
                            <img src={member.resolvedAvatar} alt={member.displayName} className={`w-10 h-10 rounded-full object-cover transition-opacity ${!isSelected && 'opacity-40 grayscale'}`} />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-700 bg-slate-200 transition-opacity ${!isSelected && 'opacity-40 grayscale'}`}>
                              {member.resolvedAvatar || getInitial(member.displayName)}
                            </div>
                          )}
                          <span className={`font-semibold text-base flex-1 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            {member.displayName} {member.userPublicId === currentUserId && '(You)'}
                          </span>
                          {isSelected && numAmount > 0 && (
                            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                              {formatCurrency(shareAmount.toFixed(2), currencyCode)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* SHEET: AMOUNT */}
                {activeSheet === 'AMOUNT' && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="flex items-center text-6xl font-black text-slate-900 dark:text-white">
                      <span className="text-slate-300 mr-2 text-4xl">{currencyParts.symbol}</span>
                      <input
                        ref={amtInputRef} type="number" value={amountStr} onChange={(e) => setAmountStr(e.target.value)}
                        className="bg-transparent border-none outline-none text-center w-[200px] caret-indigo-500" autoFocus
                      />
                    </div>
                    <button onClick={() => setActiveSheet('NONE')} className="mt-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full font-bold">Done</button>
                  </div>
                )}

                {/* SHEET: DESCRIPTION */}
                {activeSheet === 'DESCRIPTION' && (
                  <div className="py-4">
                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Dinner', 'Taxi', 'Hotel', 'Groceries', 'Drinks', 'Fuel'].map(chip => (
                        <button
                          key={chip}
                          onClick={() => setDescription(chip)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            description === chip
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    <input
                      ref={descInputRef} type="text" value={description} 
                      onChange={(e) => { if (e.target.value.length <= 50) setDescription(e.target.value) }}
                      maxLength={50}
                      placeholder="e.g. Flight tickets, Groceries..."
                      className="w-full text-2xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-800 pb-4 focus:outline-none focus:border-indigo-500 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      onKeyDown={(e) => { if (e.key === 'Enter') setActiveSheet('NONE') }}
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">
                      {description.length}/50 characters
                    </p>
                    <button onClick={() => setActiveSheet('NONE')} className="mt-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-8 py-3 rounded-full font-bold w-full hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/25">
                      Confirm
                    </button>
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
