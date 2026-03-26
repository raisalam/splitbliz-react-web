import { useQuery } from '@tanstack/react-query';
import { groupsService } from '../services';

export function useGroupDetail(groupId: string | undefined) {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsService.getGroupDetail(groupId!),
    enabled: !!groupId,
  });
}
