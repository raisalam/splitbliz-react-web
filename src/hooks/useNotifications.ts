import { useState, useEffect } from 'react';
import { Notification } from '../types';
import { notificationsService } from '../services';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    notificationsService.getNotifications()
      .then(({ notifications }) => setNotifications(notifications))
      .catch(() => setError('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  return { notifications, loading, error };
}
