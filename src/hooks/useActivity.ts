import { useState, useEffect } from 'react';
import { ActivityEntry } from '../types';
import { activityService } from '../services';

export function useActivity(groupId: string) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    activityService.getActivity(groupId)
      .then(({ entries }) => setEntries(entries))
      .catch(() => setError('Failed to load activity'))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { entries, loading, error };
}
