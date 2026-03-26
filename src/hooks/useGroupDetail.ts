import { useState, useEffect } from 'react';
import { GroupDetailData } from '../types';
import { groupsService } from '../services';

export function useGroupDetail(groupId: string) {
  const [data, setData] = useState<GroupDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    groupsService.getGroupDetail(groupId)
      .then(setData)
      .catch(() => setError('Failed to load group'))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { data, loading, error, refetch: () => groupsService.getGroupDetail(groupId).then(setData) };
}
