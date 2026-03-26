import { useQuery } from '@tanstack/react-query';
import { groupsService } from '../services';

export function useHomeData() {
  return useQuery({
    queryKey: ['home'],
    queryFn: () => groupsService.getHomeData(),
  });
}
