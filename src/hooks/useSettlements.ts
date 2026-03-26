import { useQuery } from '@tanstack/react-query';
import { settlementsService } from '../services';

export function useSettlements(groupId: string) {
  return useQuery({
    queryKey: ['settlements', groupId],
    queryFn: () => settlementsService.getSettlements(groupId),
    enabled: !!groupId,
  });
}
