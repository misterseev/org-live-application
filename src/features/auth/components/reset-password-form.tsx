'use client';

import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validations';
import { PasswordStrength } from '@/features/auth/components/password-strength';
import { useAuthStore } from '@/store/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FieldError, Input, Label, TextField } from '@heroui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const [formError, setFormError] = useState<string | null>(
    token ? null : 'Missing reset token. Request a new link.',
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setFormError(null);
    const result = await resetPassword(token, values.password);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    router.push('/login');
  });

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-[32px] font-bold leading-10 text-ink">Set a new password</h1>
        <p className="text-sm text-muted">Choose a strong password to secure your account.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              isRequired
              type="password"
              isInvalid={!!fieldState.error}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            >
              <Label>New password</Label>
              <Input autoComplete="new-password" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />
        <PasswordStrength password={password} />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              isRequired
              type="password"
              isInvalid={!!fieldState.error}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            >
              <Label>Confirm password</Label>
              <Input autoComplete="new-password" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        {formError && (
          <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            {formError}{' '}
            <Link href="/forgot-password" className="font-semibold underline">
              Request a new link
            </Link>
          </p>
        )}

        <Button type="submit" fullWidth variant="primary" isDisabled={isSubmitting || !token}>
          {isSubmitting ? 'Saving…' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}
