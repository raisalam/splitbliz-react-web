import React from 'react';
import { EmptyState } from '../../../components/EmptyState';
import { ExpenseList } from './ExpenseList';
import type { Expense, GroupMember } from '../../../types';

type GroupExpensesPanelProps = {
  expenses: Expense[];
  members: GroupMember[];
  currencySymbol: string;
  expenseFilter: 'ALL' | 'THIS_MONTH' | 'UNSETTLED';
  onFilterChange: (filter: 'ALL' | 'THIS_MONTH' | 'UNSETTLED') => void;
  onExpenseClick: (expenseId: string) => void;
  onAddExpense: () => void;
  currentUserId: string;
};

export function GroupExpensesPanel({
  expenses,
  members,
  currencySymbol,
  expenseFilter,
  onFilterChange,
  onExpenseClick,
  onAddExpense,
  currentUserId,
}: GroupExpensesPanelProps) {
  if (!expenses || expenses.length === 0) {
    return (
      <EmptyState
        title="No expenses yet"
        description="Add the first expense for this group."
        action={{ label: 'Add expense', onClick: onAddExpense }}
      />
    );
  }

  return (
    <ExpenseList
      expenses={expenses}
      members={members}
      currencySymbol={currencySymbol}
      expenseFilter={expenseFilter}
      onFilterChange={onFilterChange}
      onExpenseClick={onExpenseClick}
      onAddExpense={onAddExpense}
      currentUserId={currentUserId}
    />
  );
}
