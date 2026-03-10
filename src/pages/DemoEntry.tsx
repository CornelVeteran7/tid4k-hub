import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_ENVIRONMENTS } from '@/config/demoEnvironments';

export default function DemoEntry() {
  const { setDemoUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const vertical = searchParams.get('vertical');
    const role = searchParams.get('role');

    if (vertical && role) {
      const env = DEMO_ENVIRONMENTS.find(e => e.key === vertical);
      const account = env?.accounts.find(a => a.label.toLowerCase().includes(role.toLowerCase()));
      if (account) {
        setDemoUser({
          vertical: account.vertical,
          status: account.status,
          orgName: account.orgName,
          groups: account.groups,
          userName: account.userName,
        });
        return;
      }
    }
    setDemoUser();
  }, [setDemoUser, searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      const vertical = searchParams.get('vertical');
      const role = searchParams.get('role');
      if (vertical && role) {
        const env = DEMO_ENVIRONMENTS.find(e => e.key === vertical);
        const account = env?.accounts.find(a => a.label.toLowerCase().includes(role.toLowerCase()));
        if (account) {
          navigate(account.redirect, { replace: true });
          return;
        }
      }
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
