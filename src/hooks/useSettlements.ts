import { useState, useEffect } from 'react';
import { Settlement } from '../types';
import { settlementsService } from '../services';

export function useSettlements(groupId: string) {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    settlementsService.getSettlements(groupId)
      .then(({ settlements }) => setSettlements(settlements))
      .catch(() => setError('Failed to load settlements'))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { settlements, loading, error };
}
