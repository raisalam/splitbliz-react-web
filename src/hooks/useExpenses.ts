import { useQuery } from '@tanstack/react-query';
import { expensesService } from '../services';

export function useExpenses(groupId: string) {
  return useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => expensesService.getExpenses(groupId),
    enabled: !!groupId,
  });
}
