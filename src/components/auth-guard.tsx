'use client';

import { useAuthStore } from '@/store/auth-store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const hydrated = useAuthStore((state) => state.hydrated);
  const { status } = useSession();

  const waitingForGoogle = status === 'loading' || (status === 'authenticated' && !session);

  useEffect(() => {
    if (!hydrated || waitingForGoogle) return;
    if (!session && status === 'unauthenticated') {
      router.replace('/login?reason=session');
    }
  }, [hydrated, session, router, waitingForGoogle, status]);

  if (!hydrated || waitingForGoogle) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-muted">
        Loading session…
      </div>
    );
  }

  if (!session) return null;
  return <>{children}</>;
}
