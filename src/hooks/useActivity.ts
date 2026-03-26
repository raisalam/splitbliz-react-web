import { useQuery } from '@tanstack/react-query';
import { activityService } from '../services';

export function useActivity(groupId: string) {
  return useQuery({
    queryKey: ['activity', groupId],
    queryFn: () => activityService.getActivity(groupId),
    enabled: !!groupId,
  });
}
