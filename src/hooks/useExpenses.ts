import { useState, useEffect } from 'react';
import { Expense, PaginationResponse } from '../types';
import { expensesService } from '../services';

export function useExpenses(groupId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    expensesService.getExpenses(groupId)
      .then(({ expenses, pagination }) => {
        setExpenses(expenses);
        setPagination(pagination);
      })
      .catch(() => setError('Failed to load expenses'))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { expenses, pagination, loading, error };
}
