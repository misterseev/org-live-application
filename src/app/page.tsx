'use client';

import { MarketingHeader } from '@/components/layout/marketing-header';
import { LazySupportChat } from '@/features/support-widget/components/lazy-support-chat';
import { APP_NAME, APP_TAGLINE, DEMO_CREDENTIALS } from '@/constants/app';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  CheckCircle2,
  Lock,
  MessageSquare,
  Smartphone,
  Users,
  Zap,
  ArrowRight,
  Star,
  Shield,
  Globe,
} from 'lucide-react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ──────────────────────────────────────────────────────────────── */
const features = [
  {
    title: 'Real-time chat',
    description: 'Instant delivery, typing indicators, and read receipts for every conversation.',
    icon: Zap,
    color: 'text-teal',
    bg: 'bg-teal/10',
  },
  {
    title: 'Friends-first',
    description: 'Chat only opens after a friend request is accepted — no spam DMs.',
    icon: Users,
    color: 'text-indigo',
    bg: 'bg-indigo/10',
  },
  {
    title: 'Secure sessions',
    description: 'Cookie-based sessions, validated forms, and sanitized message rendering.',
    icon: Lock,
    color: 'text-coral',
    bg: 'bg-coral/10',
  },
  {
    title: 'Cross-device ready',
    description: 'Desktop split view and mobile full-screen conversation flow out of the box.',
    icon: Smartphone,
    color: 'text-gold',
    bg: 'bg-gold/10',
  },
  {
    title: 'Global reach',
    description: 'Lao, English, and beyond — built with multi-language font support from the start.',
    icon: Globe,
    color: 'text-teal',
    bg: 'bg-teal/10',
  },
  {
    title: 'Privacy focused',
    description: 'Your data stays local. No telemetry, no tracking, no third-party analytics.',
    icon: Shield,
    color: 'text-indigo',
    bg: 'bg-indigo/10',
  },
];

const faqs = [
  {
    q: 'Is Org Live free?',
    a: 'Yes during beta. Pro plans are planned at $8/user/month after launch.',
  },
  {
    q: 'Can I message anyone?',
    a: 'No. You must send a friend request and have it accepted before a direct chat opens.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. On small screens the conversation list and chat are separate full-screen views.',
  },
];

const testimonials = [
  { name: 'Sone K.', role: 'Product Designer', body: 'Finally a messenger that feels intentional. The friends-first model is genius.' },
  { name: 'Maly V.', role: 'Engineering Lead', body: 'Love the real-time receipts. Our team switched from Slack in a day.' },
  { name: 'Keo P.', role: 'Startup Founder', body: 'Dark mode, clean UI, no distractions. This is what I wanted.' },
];

/* ─── Chat preview messages ─────────────────────────────────────────────── */
const chatMessages = [
  { from: 'other', text: 'Hey — standup in 5? 👋' },
  { from: 'me', text: 'On my way! Bringing the mock ✨' },
  { from: 'other', text: 'Ping me when you are here' },
  { from: 'me', text: 'Done ✅' },
];

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLParagraphElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const ctaBannerRef = useRef<HTMLElement>(null);
  const orbRef1 = useRef<HTMLDivElement>(null);
  const orbRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero entrance — staggered fade+slide up */
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from(badgeRef.current, { opacity: 0, y: 20, duration: 0.6 })
        .from(headingRef.current, { opacity: 0, y: 40, duration: 0.8 }, '-=0.3')
        .from(subRef.current, { opacity: 0, y: 30, duration: 0.7 }, '-=0.5')
        .from(ctaRef.current, { opacity: 0, y: 24, duration: 0.6 }, '-=0.4')
        .from(demoRef.current, { opacity: 0, duration: 0.5 }, '-=0.3')
        .from(previewRef.current, { opacity: 0, y: 50, scale: 0.95, duration: 0.9, ease: 'power4.out' }, '-=0.5');

      /* Floating orbs — infinite gentle drift */
      gsap.to(orbRef1.current, {
        y: -28, x: 14, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
      gsap.to(orbRef2.current, {
        y: 22, x: -18, duration: 7.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1,
      });

      /* Feature cards — scroll-triggered stagger */
      if (featuresRef.current) {
        const cards = featuresRef.current.querySelectorAll('.feature-card');
        gsap.from(cards, {
          scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' },
          opacity: 0, y: 48, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        });
      }

      /* Testimonials */
      if (testimonialsRef.current) {
        const cards = testimonialsRef.current.querySelectorAll('.testimonial-card');
        gsap.from(cards, {
          scrollTrigger: { trigger: testimonialsRef.current, start: 'top 80%' },
          opacity: 0, y: 40, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        });
      }

      /* FAQ items */
      if (faqRef.current) {
        const items = faqRef.current.querySelectorAll('.faq-item');
        gsap.from(items, {
          scrollTrigger: { trigger: faqRef.current, start: 'top 80%' },
          opacity: 0, x: -30, duration: 0.6, stagger: 0.1, ease: 'power3.out',
        });
      }

      /* CTA banner */
      gsap.from(ctaBannerRef.current, {
        scrollTrigger: { trigger: ctaBannerRef.current, start: 'top 85%' },
        opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
      });

      /* Chat bubble stagger inside preview */
      const bubbles = document.querySelectorAll('.chat-bubble');
      gsap.from(bubbles, {
        opacity: 0, scale: 0.85, y: 12,
        duration: 0.4, stagger: 0.18, ease: 'back.out(1.6)', delay: 0.9,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-ink">
      {/* ── Ambient orbs ─────────────────────────────────────────────── */}
      <div
        ref={orbRef1}
        className="pointer-events-none fixed left-[-15vw] top-[-10vh] h-[60vw] max-h-[640px] w-[60vw] max-w-[640px] rounded-full bg-teal/8 blur-[120px]"
        aria-hidden
      />
      <div
        ref={orbRef2}
        className="pointer-events-none fixed bottom-[-15vh] right-[-10vw] h-[55vw] max-h-[580px] w-[55vw] max-w-[580px] rounded-full bg-indigo/10 blur-[100px]"
        aria-hidden
      />


      <main>
        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-28"
        >
          {/* Left */}
          <div className="space-y-7">
            <div ref={badgeRef} className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-xs font-semibold text-teal">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
              </span>
              Now in beta — free for everyone
            </div>

            <h1
              ref={headingRef}
              className="max-w-xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl"
            >
              {APP_TAGLINE.split(' ').slice(0, 3).join(' ')}{' '}
              <span className="bg-gradient-to-r from-teal via-teal to-indigo bg-clip-text text-transparent">
                {APP_TAGLINE.split(' ').slice(3).join(' ')}
              </span>
            </h1>

            <p ref={subRef} className="max-w-md text-base leading-7 text-muted">
              A focused messenger for people you actually know — optimistic sending, unread badges,
              real-time receipts, and a support widget that never blocks the page.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-teal px-6 text-sm font-semibold text-background transition-all duration-200 hover:bg-teal/90 hover:shadow-[0_0_28px_rgba(114,206,193,0.35)]"
              >
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-xl border border-border bg-surface px-6 text-sm font-semibold text-ink transition hover:bg-surface-2"
              >
                Log in
              </Link>
            </div>

            <p ref={demoRef} className="flex items-center gap-2 text-xs text-muted">
              <span className="rounded bg-surface-3 px-2 py-0.5 font-mono">{DEMO_CREDENTIALS.email}</span>
              <span>/</span>
              <span className="rounded bg-surface-3 px-2 py-0.5 font-mono">{DEMO_CREDENTIALS.password}</span>
            </p>
          </div>

          {/* Right — Chat preview */}
          <div ref={previewRef}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card">
              {/* Window chrome */}
              <div className="mb-4 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-coral/70" />
                <span className="h-3 w-3 rounded-full bg-gold/70" />
                <span className="h-3 w-3 rounded-full bg-teal/70" />
                <div className="ml-3 flex items-center gap-2 text-sm font-semibold text-ink">
                  <MessageSquare className="h-4 w-4 text-teal" />
                  {APP_NAME} — Live preview
                </div>
              </div>

              {/* Message list */}
              <div className="space-y-3 rounded-xl bg-surface-2 p-4">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`chat-bubble flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <span
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${msg.from === 'me'
                        ? 'rounded-br-md bg-teal text-background font-medium'
                        : 'rounded-bl-md bg-surface-3 text-ink'
                        }`}
                    >
                      {msg.text}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-1 text-xs text-muted">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal" />
                  Delivered · Read receipts enabled
                </div>
              </div>

              {/* Glow accent */}
              <div className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-indigo/20 blur-3xl" aria-hidden />
            </div>
          </div>
        </section>

        {/* ══ FEATURES ══════════════════════════════════════════════════ */}
        <section className="border-y border-border py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal">What's included</p>
              <h2 className="text-3xl font-bold text-ink sm:text-4xl">
                Built for focused conversations
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted">
                Every feature from the functional spec ships in this mock — zero backend required.
              </p>
            </div>

            <div
              ref={featuresRef}
              className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="feature-card group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                >
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${feature.bg}`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-ink">{feature.title}</h3>
                  <p className="text-sm leading-6 text-muted">{feature.description}</p>
                  {/* Subtle corner glow on hover */}
                  <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-teal/5 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-gold">Loved by teams</p>
              <h2 className="text-3xl font-bold text-ink sm:text-4xl">What people are saying</h2>
            </div>

            <div ref={testimonialsRef} className="mt-10 grid gap-5 sm:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="testimonial-card rounded-2xl border border-border bg-surface p-6"
                >
                  <div className="mb-3 flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-6 text-muted">"{t.body}"</p>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FAQ ═══════════════════════════════════════════════════════ */}
        <section className="border-t border-border py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo">FAQ</p>
              <h2 className="text-3xl font-bold text-ink sm:text-4xl">Frequently asked questions</h2>
            </div>
            <div ref={faqRef} className="space-y-3">
              {faqs.map((item) => (
                <div key={item.q} className="faq-item rounded-2xl border border-border bg-surface p-6">
                  <h3 className="mb-2 text-base font-bold text-ink">{item.q}</h3>
                  <p className="text-sm leading-6 text-muted">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA BANNER ════════════════════════════════════════════════ */}
        <section ref={ctaBannerRef} className="px-4 py-20 sm:px-6">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-teal/20 bg-gradient-to-br from-teal/10 via-surface to-indigo/10 p-12 text-center shadow-card">
            {/* Background glows */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-teal/15 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-indigo/15 blur-3xl" aria-hidden />

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-teal">Ready to dive in?</p>
            <h2 className="mb-3 text-3xl font-bold text-ink sm:text-4xl">
              Message your people, right now
            </h2>
            <p className="mx-auto mb-8 max-w-md text-sm leading-7 text-muted">
              Create an account in seconds, accept a friend request, and start chatting.
              No credit card. No BS.
            </p>
            <Link
              href="/register"
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-teal px-8 text-sm font-semibold text-background transition-all duration-200 hover:bg-teal/90 hover:shadow-[0_0_32px_rgba(114,206,193,0.4)]"
            >
              Create your account
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface px-4 py-8 text-center sm:px-6">
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} <span className="font-semibold text-ink">{APP_NAME}</span>.
          {' '}Frontend mock · local data only · no real backend.
        </p>
      </footer>

      <LazySupportChat />
    </div>
  );
}
