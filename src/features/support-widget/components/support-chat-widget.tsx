'use client';

import { SUPPORT_MESSAGE_MAX_LENGTH, SUPPORT_QUICK_REPLIES } from '@/constants/app';
import { createId, delay, isBlank } from '@/lib/utils';
import type { SupportMessage } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, SendHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const SESSION_KEY = 'org-live-support-session';

function loadMessages(): SupportMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SupportMessage[]) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: SupportMessage[]) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
}

function agentReply(input: string): string {
  const lower = input.toLowerCase();
  const match = SUPPORT_QUICK_REPLIES.find((item) =>
    lower.includes(item.id) || lower.includes(item.label.toLowerCase()),
  );
  if (match) return match.reply;
  if (lower.includes('price') || lower.includes('cost')) {
    return SUPPORT_QUICK_REPLIES[0].reply;
  }
  return 'Thanks for reaching out! A support agent will follow up shortly. Meanwhile, try Pricing, Book a demo, or Support hours.';
}

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [lastSentAt, setLastSentAt] = useState(0);
  const [unread, setUnread] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing = loadMessages();
    if (existing.length === 0) {
      const welcome: SupportMessage = {
        id: createId('support'),
        role: 'agent',
        body: 'Hi! I am the Org Live assistant. Ask about pricing, demos, or support hours.',
        createdAt: new Date().toISOString(),
        status: 'sent',
      };
      setMessages([welcome]);
      saveMessages([welcome]);
    } else {
      setMessages(existing);
    }
  }, []);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing, open]);

  const nearLimit = draft.length > SUPPORT_MESSAGE_MAX_LENGTH - 200;

  const send = async (text: string) => {
    const body = text.trim();
    if (isBlank(body)) return;
    if (body.length > SUPPORT_MESSAGE_MAX_LENGTH) return;
    if (Date.now() - lastSentAt < 1500) return;

    const userMessage: SupportMessage = {
      id: createId('support'),
      role: 'user',
      body,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    const next = [...messages, userMessage];
    setMessages(next);
    saveMessages(next);
    setDraft('');
    setLastSentAt(Date.now());
    setTyping(true);

    await delay(700);
    const reply: SupportMessage = {
      id: createId('support'),
      role: 'agent',
      body: agentReply(body),
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    const withReply = [...next, reply];
    setMessages(withReply);
    saveMessages(withReply);
    setTyping(false);
    if (!open) setUnread((count) => count + 1);
  };

  const panel = useMemo(
    () => (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.22, ease: 'easeInOut' }}
        className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden border border-border bg-surface shadow-card sm:bottom-24 sm:right-6 sm:h-[560px] sm:w-[380px] sm:rounded-2xl"
        role="dialog"
        aria-label="Support chat"
      >
        <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
          <div>
            <p className="text-sm font-semibold">Org Live Support</p>
            <p className="text-xs text-white/80">Rule-based assistant · mock agent</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 hover:bg-white/10"
            aria-label="Close support chat"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-surface p-4" aria-live="polite">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-surface-3 text-ink shadow-xs'
                }`}
              >
                {message.body}
              </div>
            </div>
          ))}
          {typing && (
            <p className="text-xs text-muted">Support is typing…</p>
          )}
        </div>

        <div className="space-y-2 border-t border-border p-3">
          <div className="flex flex-wrap gap-2">
            {SUPPORT_QUICK_REPLIES.map((item) => (
              <button
                key={item.id}
                type="button"
                className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-ink hover:bg-surface-3"
                onClick={() => void send(item.label)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={draft}
              maxLength={SUPPORT_MESSAGE_MAX_LENGTH}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void send(draft);
                }
              }}
              placeholder="Ask a question…"
              className="h-10 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm outline-none transition focus:border-primary/50 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_18%,transparent)]"
              aria-label="Support message"
            />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-50"
              aria-label="Send support message"
              disabled={isBlank(draft)}
              onClick={() => void send(draft)}
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </div>
          {nearLimit && (
            <p className="text-right text-[11px] text-muted">
              {SUPPORT_MESSAGE_MAX_LENGTH - draft.length} characters left
            </p>
          )}
        </div>
      </motion.div>
    ),
    [messages, typing, draft, nearLimit],
  );

  return (
    <>
      <AnimatePresence>{open && panel}</AnimatePresence>
      <button
        type="button"
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-md transition hover:bg-primary/90"
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-ink">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
