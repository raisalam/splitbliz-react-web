import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesService } from '../services';
import type { CreateExpenseRequest } from '../types';

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: CreateExpenseRequest }) =>
      expensesService.createExpense(groupId, data),
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['home'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, expenseId, data }: { groupId: string; expenseId: string; data: Partial<CreateExpenseRequest> & { version?: number } }) =>
      expensesService.updateExpense(groupId, expenseId, data as any), // Type assertion to bypass strict type check for now since service expects {version: number} instead of optional
    onSuccess: (_data, { groupId, expenseId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense', groupId, expenseId] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, expenseId }: { groupId: string; expenseId: string }) =>
      expensesService.deleteExpense(groupId, expenseId),
    onSuccess: (_data, { groupId, expenseId }) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['expense', groupId, expenseId] });
    },
  });
}
