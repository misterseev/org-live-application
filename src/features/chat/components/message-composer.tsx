'use client';

import { ALLOWED_ATTACHMENT_TYPES, ATTACHMENT_MAX_BYTES } from '@/constants/app';
import { isBlank } from '@/lib/utils';
import { useChatStore } from '@/store/chat-store';
import { Button } from '@heroui/react';
import { Paperclip, SendHorizontal, Smile } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const EMOJIS = ['😀', '👍', '🎉', '❤️', '🔥', '🙏', '✨', '🚀'];

interface MessageComposerProps {
  conversationId: string;
  senderId: string;
  disabled?: boolean;
  maxLength: number;
}

export function MessageComposer({
  conversationId,
  senderId,
  disabled,
  maxLength,
}: MessageComposerProps) {
  const sendMessage = useChatStore((state) => state.sendMessage);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const sendBtnRef = useRef<HTMLDivElement>(null);

  const remaining = maxLength - body.length;

  useEffect(() => {
    if (emojiOpen && emojiPickerRef.current) {
      gsap.fromTo(
        emojiPickerRef.current,
        { opacity: 0, scale: 0.9, y: 6 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power3.out' }
      );
    }
  }, [emojiOpen]);

  const handleSend = async (attachment?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }) => {
    if (disabled || sending) return;
    if (isBlank(body) && !attachment) return;
    setSending(true);
    setError(null);

    // Micro-bounce send button
    if (sendBtnRef.current) {
      gsap.fromTo(
        sendBtnRef.current,
        { scale: 0.88 },
        { scale: 1, duration: 0.25, ease: 'back.out(2)' }
      );
    }

    const result = await sendMessage({
      conversationId,
      senderId,
      body,
      attachment,
    });
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setBody('');
    setEmojiOpen(false);
  };

  const onFile = async (file?: File | null) => {
    if (!file) return;
    if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type as (typeof ALLOWED_ATTACHMENT_TYPES)[number])) {
      setError('Only JPG, PNG, GIF, or PDF files are allowed.');
      return;
    }
    if (file.size > ATTACHMENT_MAX_BYTES) {
      setError('File must be 10MB or smaller.');
      return;
    }
    const url = URL.createObjectURL(file);
    await handleSend({
      id: `att_${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url,
    });
  };

  return (
    <div className="border-t border-white/10 bg-surface p-3">
      {disabled && (
        <p className="mb-2 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
          Messaging is disabled for this conversation.
        </p>
      )}
      {error && (
        <p role="alert" className="mb-2 text-xs text-error">
          {error}
        </p>
      )}
      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          {emojiOpen && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-xl border border-white/15 bg-surface-2 p-2 shadow-lg"
            >
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded-md px-2 py-1 text-lg transition-transform hover:scale-125 hover:bg-surface-3 active:scale-95"
                  onClick={() => setBody((value) => `${value}${emoji}`)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <textarea
            value={body}
            disabled={disabled}
            maxLength={maxLength}
            rows={1}
            placeholder="Write a message…"
            className="composer-input max-h-32 min-h-11 w-full resize-y rounded-xl border border-white/12 bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted outline-none transition focus:border-white/25 focus:bg-surface-3 focus:shadow-[0_0_10px_rgba(255,255,255,0.04)] disabled:opacity-60"
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
          />
          {remaining <= 200 && (
            <p className="mt-1 text-right text-[11px] text-muted">{remaining}</p>
          )}
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-surface-2 text-muted transition hover:border-white/25 hover:bg-surface-3 hover:text-ink"
          aria-label="Insert emoji"
          disabled={disabled}
          onClick={() => setEmojiOpen((value) => !value)}
        >
          <Smile className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-surface-2 text-muted transition hover:border-white/25 hover:bg-surface-3 hover:text-ink"
          aria-label="Attach file"
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept={ALLOWED_ATTACHMENT_TYPES.join(',')}
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        <div ref={sendBtnRef}>
          <Button
            isIconOnly
            variant="primary"
            aria-label="Send message"
            isDisabled={disabled || sending || isBlank(body)}
            onPress={() => void handleSend()}
            className="h-11 w-11 rounded-xl bg-teal text-[#1E2035] hover:brightness-105"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
