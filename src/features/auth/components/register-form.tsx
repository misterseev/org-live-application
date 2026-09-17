'use client';

import { PasswordStrength } from '@/features/auth/components/password-strength';
import { registerSchema, type RegisterFormValues } from '@/lib/validations';
import { useAuthStore } from '@/store/auth-store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Label, TextField, FieldError } from '@heroui/react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import gsap from 'gsap';
import { User, Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [formError, setFormError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const fieldsRef = useRef<HTMLFormElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(containerRef.current, {
        opacity: 0,
        y: 28,
        duration: 0.7,
      })
        .from(badgeRef.current, {
          opacity: 0,
          y: 10,
          duration: 0.4,
        }, '-=0.4')
        .from(headerRef.current, {
          opacity: 0,
          y: 14,
          duration: 0.5,
        }, '-=0.3')
        .from(googleBtnRef.current, {
          opacity: 0,
          y: 12,
          duration: 0.45,
        }, '-=0.25')
        .from(dividerRef.current, {
          opacity: 0,
          scaleX: 0.6,
          duration: 0.4,
        }, '-=0.2')
        .from('.form-field-stagger', {
          opacity: 0,
          y: 14,
          stagger: 0.07,
          duration: 0.45,
        }, '-=0.15')
        .from(footerRef.current, {
          opacity: 0,
          y: 8,
          duration: 0.4,
        }, '-=0.15');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const result = await register({
      fullName: values.fullName,
      email: values.email,
      password: values.password,
    });
    if (!result.ok) {
      setFormError(result.error);
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { x: -8 },
          { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
        );
      }
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
    <div
      ref={containerRef}
      className="auth-card relative w-full border-0 p-2 shadow-none transition-all sm:p-4"
    >
      {/* Content wrapper */}
      <div className="relative z-10 space-y-6">
        {/* Header section */}
        <div ref={headerRef} className="space-y-2 text-center">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Fast & Free Beta</span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Create your account
          </h1>
          <p className="text-sm text-muted">
            Start communicating with friends & team in real time.
          </p>
        </div>

        {/* Google OAuth button */}
        <div ref={googleBtnRef}>
          <button
            type="button"
            disabled={googleLoading || isSubmitting}
            onClick={onGoogle}
            className="auth-input cursor-pointer group flex w-full items-center justify-center gap-3 text-sm font-medium transition-all active:scale-[0.99] disabled:opacity-50 sm:text-base"
          >
            <svg className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{googleLoading ? 'Redirecting to Google…' : 'Sign up with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div
          ref={dividerRef}
          className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <span>or continue with email</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/15 to-transparent" />
        </div>

        {/* Registration Form */}
        <form ref={fieldsRef} onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="form-field-stagger">
            <Controller
              name="fullName"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  isRequired
                  isInvalid={!!fieldState.error}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-ink">
                    <User className="h-3.5 w-3.5 text-teal" />
                    <span>Full name</span>
                  </Label>
                  <Input
                    placeholder="Alex Rivera"
                    autoComplete="name"
                    className="auth-input mt-1.5 w-full placeholder:text-muted/50"
                  />
                  <FieldError className="text-xs text-error">{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
          </div>

          <div className="form-field-stagger">
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
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-ink">
                    <Mail className="h-3.5 w-3.5 text-teal" />
                    <span>Work or personal email</span>
                  </Label>
                  <Input
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="auth-input mt-1.5 w-full placeholder:text-muted/50"
                  />
                  <FieldError className="text-xs text-error">{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
          </div>

          <div className="form-field-stagger">
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
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-ink">
                    <Lock className="h-3.5 w-3.5 text-teal" />
                    <span>Password</span>
                  </Label>
                  <Input
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className="auth-input mt-1.5 w-full placeholder:text-muted/50"
                  />
                  <FieldError className="text-xs text-error">{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
          </div>

          <div className="form-field-stagger">
            <PasswordStrength password={password} />
          </div>

          <div className="form-field-stagger">
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
                  <Label className="flex items-center gap-1.5 text-xs font-medium text-ink">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal" />
                    <span>Confirm password</span>
                  </Label>
                  <Input
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="auth-input mt-1.5 w-full placeholder:text-muted/50"
                  />
                  <FieldError className="text-xs text-error">{fieldState.error?.message}</FieldError>
                </TextField>
              )}
            />
          </div>

          {formError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl bg-error/10 px-3.5 py-2.5 text-sm font-medium text-error"
            >
              <div className="h-2 w-2 shrink-0 rounded-full bg-error" />
              <span>{formError}</span>
            </div>
          )}

          <div className="form-field-stagger pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group cursor-pointer relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] bg-gradient-to-r from-teal to-[#5bb8ab] px-4 text-base font-semibold text-[#1E2035] shadow-none transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Creating account…' : 'Create free account'}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </form>

        {/* Footer */}
        <div ref={footerRef} className="pt-2 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="inline-flex items-center font-semibold text-teal transition hover:underline"
          >
            <span>Log in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
