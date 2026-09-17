'use client';

import { getPasswordStrength } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { score, label } = getPasswordStrength(password);
  const colors = [
    'bg-error',
    'bg-error',
    'bg-warning',
    'bg-primary',
    'bg-success',
  ] as const;

  return (
    <div className="space-y-1" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full bg-border transition-all duration-300 ease-out',
              index < score && colors[score],
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted">Password strength: {label}</p>
    </div>
  );
}
