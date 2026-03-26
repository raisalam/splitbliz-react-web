import { useState, useEffect } from 'react';
import { UserFull } from '../types';
import { authService } from '../services';
import { tokenStore } from '../services/apiClient';

export function useCurrentUser() {
  const [user, setUser] = useState<UserFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    authService.getMe()
      .then(setUser)
      .catch(() => setError('Session expired'))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error, setUser };
}
