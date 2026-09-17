'use client';

import { MarketingHeader } from '@/components/layout/marketing-header';
import { RegisterForm } from '@/features/auth/components/register-form';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Zap, Shield, Users, Star, Sparkles, MessageCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating ambient background orbs animation
      gsap.to(orb1Ref.current, {
        x: 25,
        y: -30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(orb2Ref.current, {
        x: -30,
        y: 25,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1,
      });

      gsap.to(orb3Ref.current, {
        x: 20,
        y: 20,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2,
      });

      // Left showcase column entrance
      if (leftColRef.current) {
        const elements = leftColRef.current.querySelectorAll('.showcase-stagger');
        gsap.from(elements, {
          opacity: 0,
          y: 24,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_0%,color-mix(in_srgb,var(--primary)_15%,transparent)_0%,transparent_50%),radial-gradient(circle_at_85%_25%,color-mix(in_srgb,var(--secondary)_14%,transparent)_0%,transparent_45%),linear-gradient(var(--background),var(--background))]"
    >
      {/* Ambient background glowing orbs */}
      <div
        ref={orb1Ref}
        className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-teal/15 blur-[100px]"
      />
      <div
        ref={orb2Ref}
        className="pointer-events-none absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-indigo/20 blur-[120px]"
      />
      <div
        ref={orb3Ref}
        className="pointer-events-none absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-coral/10 blur-[90px]"
      />

      {/* Modern subtle grid texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />

      <MarketingHeader />

      <main className="relative z-10 mx-auto flex max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-12 lg:min-h-[calc(100vh-80px)] lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left showcase column (visible on large screens) */}
          <div ref={leftColRef} className="hidden space-y-8 lg:col-span-6 lg:block xl:col-span-7">
            <div className="showcase-stagger inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3.5 py-1.5 text-xs font-semibold text-teal shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
              </span>
              <span>Next-Gen Private Messaging</span>
            </div>

            <h2 className="showcase-stagger text-4xl font-extrabold tracking-tight text-ink xl:text-5xl">
              Connect privately with{' '}
              <span className="bg-gradient-to-r from-teal via-[#86d9ce] to-indigo bg-clip-text text-transparent">
                zero noise & friction.
              </span>
            </h2>

            <p className="showcase-stagger max-w-lg text-base leading-relaxed text-muted">
              Org Live is built for teams, creators, and friends who want real-time conversations
              without algorithms, tracking, or unsolicited spam.
            </p>

            {/* Perks list */}
            <div className="showcase-stagger space-y-4 pt-2">
              <div className="flex items-start gap-4 rounded-2xl border-0 bg-surface/30 p-4 backdrop-blur-md transition-all hover:bg-surface/50">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Ultra-low latency</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    Sub-20ms message delivery with instant read receipts & typing indicators.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border-0 bg-surface/30 p-4 backdrop-blur-md transition-all hover:bg-surface/50">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo/15 text-indigo">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Friends-first protection</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    Direct conversations only unlock after mutual acceptance. No spam requests.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border-0 bg-surface/30 p-4 backdrop-blur-md transition-all hover:bg-surface/50">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">Collaborative channels</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    Rich organization spaces, channels, voice notes, and seamless media sharing.
                  </p>
                </div>
              </div>
            </div>

            {/* Social proof trust bar */}
            <div className="showcase-stagger flex items-center gap-4 rounded-2xl border-0 bg-surface-2/30 px-5 py-3.5 backdrop-blur-sm">
              <div className="flex -space-x-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-xs font-bold text-[#1E2035] ring-2 ring-surface">
                  SK
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo text-xs font-bold text-cream ring-2 ring-surface">
                  MV
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-bold text-[#1E2035] ring-2 ring-surface">
                  KP
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-xs font-bold text-cream ring-2 ring-surface">
                  AL
                </div>
              </div>
              <div className="border-l border-border/60 pl-4">
                <div className="flex items-center gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-gold" />
                  ))}
                </div>
                <p className="mt-0.5 text-xs font-medium text-muted">
                  Loved by <span className="font-semibold text-ink">5,000+</span> teams & early adopters
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Register Form Card */}
          <div className="mx-auto w-full max-w-md lg:col-span-6 xl:col-span-5">
            <RegisterForm />
          </div>
        </div>
      </main>
    </div>
  );
}
