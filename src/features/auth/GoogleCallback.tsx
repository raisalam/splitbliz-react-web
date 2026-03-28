import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { tokenStore } from '../../services/apiClient';

export function GoogleCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const accessToken = params.get('accessToken');
      const error = params.get('error');
      if (error) {
        navigate('/login', { replace: true, state: { oauthError: error } });
        return;
      }
      if (accessToken) {
        await tokenStore.set(accessToken);
        navigate('/', { replace: true });
        return;
      }
      navigate('/login', { replace: true });
    };
    void run();
  }, [navigate, params]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500">
      Completing sign in...
    </div>
  );
}
