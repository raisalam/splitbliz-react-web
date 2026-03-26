import { useState, useEffect } from 'react';
import { HomeScreenData } from '../types';
import { groupsService } from '../services';
import { MOCK_GROUPS } from '../mock/groups';
import { MOCK_SETTLEMENTS } from '../mock/settlements';

export function useHomeData() {
  const [data, setData] = useState<HomeScreenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO Phase 2: remove mock fallback once backend is wired
    const useMock = !import.meta.env.VITE_API_BASE_URL || import.meta.env.DEV;
    if (useMock) {
      setData({
        groups: MOCK_GROUPS as any,
        actionItemsPreview: { totalCount: 0, items: [] },
        recentActivity: [],
      });
      setLoading(false);
      return;
    }
    groupsService.getHomeData()
      .then(setData)
      .catch(() => setError('Failed to load home data'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
