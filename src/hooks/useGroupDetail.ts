import { useQuery } from '@tanstack/react-query';
import { groupsService } from '../services';

export function useGroupDetail(groupId: string) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsService.getGroupDetail(groupId),
    enabled: !!groupId,
  });
}
