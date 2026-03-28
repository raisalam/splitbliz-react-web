import React from 'react';
import { Banknote, ClipboardList, Plus } from '../../../constants/icons';

type GroupQuickActionsProps = {
  onAddExpense: () => void;
  onSettleUp: () => void;
  onWhiteboard: () => void;
};

export function GroupQuickActions({ onAddExpense, onSettleUp, onWhiteboard }: GroupQuickActionsProps) {
  return (
    <div className="flex gap-3 mb-8 overflow-x-auto pb-1 custom-scrollbar">
      <button
        onClick={onAddExpense}
        className="flex items-center gap-3 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-sm shadow-indigo-600/20 transition-all shrink-0 active:scale-95"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Plus className="w-4 h-4" />
        </div>
        <div className="flex flex-col items-start pr-2">
          <span className="text-sm font-bold leading-none">Add Expense</span>
          <span className="text-[10px] text-indigo-200 mt-1 font-medium">track costs</span>
        </div>
      </button>

      <button
        onClick={onSettleUp}
        className="flex items-center gap-3 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-sm shadow-emerald-600/20 transition-all shrink-0 active:scale-95"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <Banknote className="w-4 h-4" />
        </div>
        <div className="flex flex-col items-start pr-2">
          <span className="text-sm font-bold leading-none">Settle Up</span>
          <span className="text-[10px] text-emerald-200 mt-1 font-medium">pay someone</span>
        </div>
      </button>

      <button
        onClick={onWhiteboard}
        className="flex items-center gap-3 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-sm shadow-amber-500/20 transition-all shrink-0 active:scale-95"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <ClipboardList className="w-4 h-4" />
        </div>
        <div className="flex flex-col items-start pr-2">
          <span className="text-sm font-bold leading-none">Split Board</span>
          <span className="text-[10px] text-amber-200 mt-1 font-medium">who owes what</span>
        </div>
      </button>
    </div>
  );
}
