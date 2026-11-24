import { useEffect, useState } from 'react';
import { type Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { isSupabaseConfigured, supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setSession(data.session ?? null);
          setIsAuthLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isMounted) {
        setSession(nextSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    if (!supabase) return;
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" aria-hidden="true" />
          <span>Loading TaskFlow...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dashboard
        userId={session?.user?.id ?? null}
        userEmail={session?.user?.email ?? null}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
