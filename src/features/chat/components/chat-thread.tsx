'use client';

import { Avatar } from '@/components/ui/avatar';
import { MessageComposer } from '@/features/chat/components/message-composer';
import { MESSAGE_MAX_LENGTH } from '@/constants/app';
import { escapeHtml } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { format, isSameDay } from 'date-fns';
import { ArrowLeft, Check, CheckCheck, Clock3 } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';

interface ChatThreadProps {
  currentUserId: string;
  conversationId: string | null;
  onBack: () => void;
}

export function ChatThread({
  currentUserId,
  conversationId,
  onBack,
}: ChatThreadProps) {
  const getUserById = useAuthStore((state) => state.getUserById);
  const conversations = useChatStore((state) => state.conversations);
  const getMessages = useChatStore((state) => state.getMessages);
  const markAsRead = useChatStore((state) => state.markAsRead);
  const retryMessage = useChatStore((state) => state.retryMessage);

  const bottomRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);

  const conversation = conversations.find((item) => item.id === conversationId);
  const otherId = conversation?.participantIds.find((id) => id !== currentUserId);
  const other = otherId ? getUserById(otherId) : undefined;
  const messages = useMemo(
    () => (conversationId ? getMessages(conversationId) : []),
    [conversationId, getMessages],
  );

  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId, currentUserId);
    }
  }, [conversationId, currentUserId, markAsRead, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, conversation?.typingUserId]);

  // Animate conversation switch
  useEffect(() => {
    if (!conversationId) return;
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
    if (messagesContainerRef.current) {
      const bubbles = messagesContainerRef.current.querySelectorAll('.thread-msg-bubble');
      const recent = Array.from(bubbles).slice(-20);
      if (recent.length > 0) {
        gsap.fromTo(
          recent,
          { opacity: 0, y: 8, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.02, duration: 0.28, ease: 'power2.out' }
        );
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [conversationId]);

  // Animate new sent or received message
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current && messagesContainerRef.current) {
      const bubbles = messagesContainerRef.current.querySelectorAll('.thread-msg-bubble');
      const lastBubble = bubbles[bubbles.length - 1];
      if (lastBubble) {
        gsap.fromTo(
          lastBubble,
          { opacity: 0, y: 14, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'back.out(1.3)' }
        );
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length]);

  if (!conversationId || !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center bg-surface">
        <p className="text-lg font-semibold text-ink">Select a conversation</p>
        <p className="max-w-sm text-sm text-muted">
          Choose a friend from the sidebar, or add someone new to start messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      <div
        ref={headerRef}
        className="flex items-center gap-3 border-b border-white/10 bg-surface px-4 py-3"
      >
        <button
          type="button"
          className="rounded-lg p-2 text-muted transition hover:bg-surface-2 md:hidden"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Avatar name={other?.fullName ?? 'User'} src={other?.avatarUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {other?.fullName ?? 'Unknown user'}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            {conversation.isReadOnly ? (
              conversation.readOnlyReason === 'blocked' ? (
                'Blocked — conversation is read-only'
              ) : (
                'Friendship removed — conversation is read-only'
              )
            ) : conversation.typingUserId ? (
              <span className="inline-flex items-center gap-1 text-teal">
                <span>{other?.fullName ?? 'Friend'} is typing</span>
                <span className="flex gap-0.5">
                  <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-teal" />
                  <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-teal [animation-delay:0.15s]" />
                  <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-teal [animation-delay:0.3s]" />
                </span>
              </span>
            ) : (
              'Direct message'
            )}
          </p>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-surface-2/60 p-6 text-center shadow-xs">
            <p className="text-sm font-medium text-ink">No messages yet</p>
            <p className="mt-1 text-sm text-muted">Say hello to start the conversation.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1];
            const showDay =
              !previous ||
              !isSameDay(new Date(previous.createdAt), new Date(message.createdAt));
            const mine = message.senderId === currentUserId;

            return (
              <div key={message.id}>
                {showDay && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full border border-white/10 bg-surface-2/80 px-3 py-1 text-xs text-muted shadow-xs">
                      {format(new Date(message.createdAt), 'EEEE, MMM d')}
                    </span>
                  </div>
                )}
                <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`thread-msg-bubble max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-xs transition-colors ${
                      mine
                        ? 'rounded-br-sm bg-gradient-to-r from-teal to-[#5bb8ab] font-medium text-[#1E2035]'
                        : 'rounded-bl-sm border border-white/10 bg-surface-2 text-ink'
                    }`}
                  >
                    <p
                      className="whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{
                        __html: escapeHtml(message.body).replaceAll('\n', '<br />'),
                      }}
                    />
                    <div
                      className={`mt-1 flex items-center gap-1 text-[11px] ${
                        mine ? 'justify-end text-[#1E2035]/80' : 'text-muted'
                      }`}
                    >
                      <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
                      {mine && (
                        <>
                          {message.status === 'sending' && <Clock3 className="h-3 w-3" />}
                          {message.status === 'sent' && <Check className="h-3 w-3" />}
                          {(message.status === 'delivered' || message.status === 'read') && (
                            <CheckCheck
                              className={`h-3 w-3 ${
                                message.status === 'read' ? 'text-indigo' : ''
                              }`}
                            />
                          )}
                          {message.status === 'failed' && (
                            <button
                              type="button"
                              className="underline hover:text-red-700"
                              onClick={() => retryMessage(message.id)}
                            >
                              Retry
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer
        conversationId={conversation.id}
        senderId={currentUserId}
        disabled={!!conversation.isReadOnly}
        maxLength={MESSAGE_MAX_LENGTH}
      />
    </div>
  );
}
