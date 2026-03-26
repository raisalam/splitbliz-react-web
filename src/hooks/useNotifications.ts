import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '../services';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
  });
}
