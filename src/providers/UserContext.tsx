import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserFull } from '../types';
import { authService } from '../services';
import { tokenStore } from '../services/apiClient';

interface UserContextValue {
  user: UserFull | null;
  setUser: (user: UserFull | null) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    authService.getMe()
      .then(setUser)
      .catch(async () => { await tokenStore.clear(); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      loading,
      isAuthenticated: !!user,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
