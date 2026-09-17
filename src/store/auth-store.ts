import { MOCK_ACCESS_TTL_MS } from '@/constants/app';
import { clearSessionCookie, setSessionCookie } from '@/lib/session';
import { createId, delay, normalizeEmail } from '@/lib/utils';
import {
  MOCK_PASSWORDS,
  MOCK_USERS,
} from '@/services/mock/data';
import { WORKSPACE_EXTRA_USERS } from '@/services/mock/workspace-data';
import type { AuthSession, User } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SEED_USERS: User[] = [...MOCK_USERS, ...WORKSPACE_EXTRA_USERS];

interface AuthState {
  session: AuthSession | null;
  users: User[];
  passwords: Record<string, string>;
  loginAttempts: Record<string, { count: number; lockedUntil?: number }>;
  resetTokens: Record<string, { email: string; expiresAt: number; used: boolean }>;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  register: (input: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  login: (input: {
    email: string;
    password: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  syncFromGoogleProfile: (input: {
    googleId: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  }) => void;
  logout: () => Promise<void>;
  requestPasswordReset: (
    email: string,
  ) => Promise<{ ok: true; token?: string; message: string }>;
  resetPassword: (
    token: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  getUserById: (id: string) => User | undefined;
  searchUsers: (query: string, excludeUserId?: string) => User[];
  upsertUser: (user: User, password?: string) => void;
}

function createSession(user: User): AuthSession {
  const accessToken = createId('access');
  const refreshToken = createId('refresh');
  setSessionCookie(accessToken);
  return {
    user,
    accessToken,
    refreshToken,
    expiresAt: Date.now() + MOCK_ACCESS_TTL_MS,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      users: SEED_USERS,
      passwords: { ...MOCK_PASSWORDS },
      loginAttempts: {},
      resetTokens: {},
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),

      getUserById: (id) => get().users.find((user) => user.id === id),

      searchUsers: (query, excludeUserId) => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return get().users.filter((user) => {
          if (excludeUserId && user.id === excludeUserId) return false;
          return (
            user.fullName.toLowerCase().includes(q) ||
            user.email.toLowerCase().includes(q)
          );
        });
      },

      upsertUser: (user, password) => {
        set((state) => {
          const exists = state.users.some((item) => item.id === user.id);
          return {
            users: exists
              ? state.users.map((item) => (item.id === user.id ? user : item))
              : [...state.users, user],
            passwords: password
              ? { ...state.passwords, [user.email]: password }
              : state.passwords,
          };
        });
      },

      register: async ({ fullName, email, password }) => {
        await delay(450);
        const normalized = normalizeEmail(email);
        const existing = get().users.find((user) => user.email === normalized);
        if (existing) {
          return { ok: false, error: 'An account with this email already exists.' };
        }

        const user: User = {
          id: createId('user'),
          fullName: fullName.trim(),
          email: normalized,
          avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
          provider: 'email',
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [...state.users, user],
          passwords: { ...state.passwords, [normalized]: password },
          session: createSession(user),
        }));

        return { ok: true };
      },

      login: async ({ email, password }) => {
        await delay(400);
        const normalized = normalizeEmail(email);
        const attempts = get().loginAttempts[normalized];
        if (attempts?.lockedUntil && attempts.lockedUntil > Date.now()) {
          return {
            ok: false,
            error: 'Too many failed attempts. Try again in a few minutes.',
          };
        }

        const user = get().users.find((item) => item.email === normalized);
        const valid = user && get().passwords[normalized] === password;

        if (!valid) {
          const nextCount = (attempts?.count ?? 0) + 1;
          set((state) => ({
            loginAttempts: {
              ...state.loginAttempts,
              [normalized]: {
                count: nextCount,
                lockedUntil:
                  nextCount >= 5 ? Date.now() + 15 * 60 * 1000 : undefined,
              },
            },
          }));
          return { ok: false, error: 'Invalid email or password.' };
        }

        if (!user.emailVerified) {
          return {
            ok: false,
            error: 'Please verify your email before signing in.',
          };
        }

        set((state) => ({
          session: createSession(user),
          loginAttempts: { ...state.loginAttempts, [normalized]: { count: 0 } },
        }));
        return { ok: true };
      },

      syncFromGoogleProfile: ({ googleId, fullName, email, avatarUrl }) => {
        const normalized = normalizeEmail(email);
        const existingByEmail = get().users.find((item) => item.email === normalized);
        const existingByGoogle = get().users.find(
          (item) => item.id === `google_${googleId}` || item.id === googleId,
        );

        let user = existingByGoogle ?? existingByEmail;

        if (user) {
          // Link Google to an existing email account when emails match.
          user = {
            ...user,
            fullName: fullName || user.fullName,
            avatarUrl: avatarUrl || user.avatarUrl,
            provider: user.provider === 'email' ? 'email' : 'google',
            emailVerified: true,
          };
          set((state) => ({
            users: state.users.map((item) => (item.id === user!.id ? user! : item)),
            session: createSession(user!),
          }));
          return;
        }

        user = {
          id: `google_${googleId}`,
          fullName: fullName.trim() || 'Google User',
          email: normalized,
          avatarUrl:
            avatarUrl ||
            `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
          provider: 'google',
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          users: [...state.users, user!],
          session: createSession(user!),
        }));
      },

      logout: async () => {
        await delay(150);
        clearSessionCookie();
        set({ session: null });
      },

      requestPasswordReset: async (email) => {
        await delay(350);
        const normalized = normalizeEmail(email);
        const exists = get().users.some((user) => user.email === normalized);
        const message =
          'If this email exists, a reset link has been sent.';

        if (!exists) {
          return { ok: true, message };
        }

        const token = createId('reset');
        set((state) => ({
          resetTokens: {
            ...state.resetTokens,
            [token]: {
              email: normalized,
              expiresAt: Date.now() + 20 * 60 * 1000,
              used: false,
            },
          },
        }));

        // Token returned only for the mock UI so demos can continue without email.
        return { ok: true, token, message };
      },

      resetPassword: async (token, password) => {
        await delay(350);
        const entry = get().resetTokens[token];
        if (!entry || entry.used || entry.expiresAt < Date.now()) {
          return {
            ok: false,
            error: 'This reset link is expired or already used. Request a new one.',
          };
        }

        set((state) => ({
          passwords: { ...state.passwords, [entry.email]: password },
          resetTokens: {
            ...state.resetTokens,
            [token]: { ...entry, used: true },
          },
        }));
        return { ok: true };
      },
    }),
    {
      name: 'org-live-auth',
      partialize: (state) => ({
        session: state.session,
        users: state.users,
        passwords: state.passwords,
        resetTokens: state.resetTokens,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        if (state?.session) {
          setSessionCookie(state.session.accessToken);
        }
      },
    },
  ),
);
