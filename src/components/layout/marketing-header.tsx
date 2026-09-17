'use client';

import { APP_NAME } from '@/constants/app';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MarketingHeader() {
  const pathname = usePathname();
  const session = useAuthStore((state) => state.session);
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-2/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-ink">
          {APP_NAME}
        </Link>
        <nav className="flex items-center gap-2">
          {session ? (
            <Link
              href="/app"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none"
            >
              Open app
            </Link>
          ) : (
            <>
              {!isAuthPage && (
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-ink transition hover:bg-surface focus-visible:outline-none"
                >
                  Log in
                </Link>
              )}
              <Link
                href="/register"
                className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
