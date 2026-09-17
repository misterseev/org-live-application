'use client';

import { useAuthStore } from '@/store/auth-store';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * Maps a real Auth.js Google session into the local mock messenger store
 * so chat/friends continue to work with the signed-in Google profile.
 */
export function GoogleSessionSync() {
  const { data, status } = useSession();
  const syncFromGoogleProfile = useAuthStore((state) => state.syncFromGoogleProfile);
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    if (status !== 'authenticated' || !data?.user?.email) return;

    const email = data.user.email;
    const alreadySynced =
      session?.user.email === email &&
      (session.user.provider === 'google' || session.user.emailVerified);

    if (alreadySynced && session?.user.fullName === (data.user.name ?? session.user.fullName)) {
      return;
    }

    syncFromGoogleProfile({
      googleId: data.user.id || email,
      fullName: data.user.name ?? email.split('@')[0] ?? 'Google User',
      email,
      avatarUrl: data.user.image,
    });
  }, [status, data, syncFromGoogleProfile, session]);

  return null;
}
