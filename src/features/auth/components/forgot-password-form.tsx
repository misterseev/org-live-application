'use client';

import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validations';
import { useAuthStore } from '@/store/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FieldError, Input, Label, TextField } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function ForgotPasswordForm() {
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const [message, setMessage] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await requestPasswordReset(values.email);
    setMessage(result.message);
    setDemoToken(result.token ?? null);
  });

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-[32px] font-bold leading-10 text-ink">Reset password</h1>
        <p className="text-sm text-muted">
          Enter your email and we will send a time-limited reset link.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              isRequired
              type="email"
              isInvalid={!!fieldState.error}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            >
              <Label>Email</Label>
              <Input placeholder="you@company.com" autoComplete="email" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        {message && (
          <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            {message}
          </p>
        )}

        {demoToken && (
          <p className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted">
            Demo reset link:{' '}
            <Link
              href={`/reset-password?token=${demoToken}`}
              className="font-semibold text-primary hover:underline"
            >
              Continue to set a new password
            </Link>
          </p>
        )}

        <Button type="submit" fullWidth variant="primary" isDisabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
