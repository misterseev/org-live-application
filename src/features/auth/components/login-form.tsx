'use client';

import { DEMO_CREDENTIALS } from '@/constants/app';
import { loginSchema, type LoginFormValues } from '@/lib/validations';
import { useAuthStore } from '@/store/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FieldError, Input, Label, TextField } from '@heroui/react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [formError, setFormError] = useState<string | null>(() => {
    if (searchParams.get('reason') === 'session') {
      return 'Your session expired. Please log in again.';
    }
    if (searchParams.get('error')) {
      return 'Google sign-in failed. Please try again.';
    }
    return null;
  });
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await login(values);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    router.push('/app');
  });

  const onGoogle = async () => {
    setFormError(null);
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/app' });
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-[32px] font-bold leading-10 text-ink">Welcome back</h1>
        <p className="text-sm text-muted">Log in to continue your conversations.</p>
      </div>

      <Button
        fullWidth
        variant="primary"
        isDisabled={googleLoading || isSubmitting}
        onPress={onGoogle}
      >
        {googleLoading ? 'Redirecting to Google…' : 'Login with Google'}
      </Button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
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
              <Label>Password</Label>
              <Input placeholder="Your password" autoComplete="current-password" />
              <FieldError>{fieldState.error?.message}</FieldError>
            </TextField>
          )}
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">
            {formError}
          </p>
        )}

        <Button type="submit" fullWidth variant="secondary" isDisabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Log in'}
        </Button>
      </form>

      <button
        type="button"
        className="w-full rounded-lg border border-dashed border-border bg-surface px-3 py-2 text-left text-xs text-muted transition hover:border-primary/40"
        onClick={() => {
          setValue('email', DEMO_CREDENTIALS.email);
          setValue('password', DEMO_CREDENTIALS.password);
        }}
      >
        Demo: fill {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
      </button>

      <p className="text-center text-sm text-muted">
        New here?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
