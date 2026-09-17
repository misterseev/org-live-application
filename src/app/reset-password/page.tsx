import { MarketingHeader } from '@/components/layout/marketing-header';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,color-mix(in_srgb,var(--primary)_12%,transparent)_0%,transparent_50%),radial-gradient(circle_at_85%_15%,color-mix(in_srgb,var(--secondary)_10%,transparent)_0%,transparent_45%),linear-gradient(var(--background),var(--background))]">
      <MarketingHeader />
      <main className="px-4 py-12 sm:px-6">
        <Suspense fallback={<div className="text-center text-sm text-muted">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
