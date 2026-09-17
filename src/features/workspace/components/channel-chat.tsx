'use client';

import { Avatar } from '@/components/ui/avatar';
import { AttachmentCard } from '@/features/workspace/components/attachment-card';
import { ALLOWED_ATTACHMENT_TYPES, ATTACHMENT_MAX_BYTES } from '@/constants/app';
import { escapeHtml, isBlank } from '@/lib/utils';
import { ALL_WORKSPACE_USERS } from '@/services/mock/workspace-data';
import { useAuthStore } from '@/store/auth-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import { format, isSameDay } from 'date-fns';
import {
  Bell,
  ChartNoAxesColumn,
  Gift,
  Hash,
  Image as ImageLucide,
  LayoutGrid,
  MessageSquarePlus,
  Pin,
  Plus,
  Smile,
  Sticker,
  Upload,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';

function resolveUser(userId: string) {
  return (
    useAuthStore.getState().getUserById(userId) ??
    ALL_WORKSPACE_USERS.find((user) => user.id === userId)
  );
}

export function ChannelChat() {
  const session = useAuthStore((state) => state.session);
  const activeServerId = useWorkspaceStore((state) => state.activeServerId);
  const activeChannelId = useWorkspaceStore((state) => state.activeChannelId);
  const getChannel = useWorkspaceStore((state) => state.getChannel);
  const getMessagesForChannel = useWorkspaceStore((state) => state.getMessagesForChannel);
  const getMembersForServer = useWorkspaceStore((state) => state.getMembersForServer);
  const getPrimaryRoleColor = useWorkspaceStore((state) => state.getPrimaryRoleColor);
  const sendChannelMessage = useWorkspaceStore((state) => state.sendChannelMessage);
  const memberListOpen = useWorkspaceStore((state) => state.memberListOpen);
  const toggleMemberList = useWorkspaceStore((state) => state.toggleMemberList);
  const showStub = useWorkspaceStore((state) => state.showStub);

  const [body, setBody] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const emojiMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef(0);

  const channel = activeChannelId ? getChannel(activeChannelId) : undefined;
  const messages = useMemo(
    () => (activeChannelId ? getMessagesForChannel(activeChannelId) : []),
    [activeChannelId, getMessagesForChannel],
  );

  // Smooth scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeChannelId]);

  // Animate channel switch
  useEffect(() => {
    if (!activeChannelId) return;
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
    if (messagesContainerRef.current) {
      const rows = messagesContainerRef.current.querySelectorAll('.chat-msg-row');
      const recent = Array.from(rows).slice(-20);
      if (recent.length > 0) {
        gsap.fromTo(
          recent,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.02, duration: 0.32, ease: 'power2.out' }
        );
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [activeChannelId]);

  // Animate new incoming / sent message
  useEffect(() => {
    if (messages.length > prevMsgCountRef.current && messagesContainerRef.current) {
      const rows = messagesContainerRef.current.querySelectorAll('.chat-msg-row');
      const lastRow = rows[rows.length - 1];
      if (lastRow) {
        gsap.fromTo(
          lastRow,
          { opacity: 0, y: 16, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'back.out(1.2)' }
        );
      }
    }
    prevMsgCountRef.current = messages.length;
  }, [messages.length]);

  // Animate popups (Plus menu & Emoji picker)
  useEffect(() => {
    if (plusOpen && plusMenuRef.current) {
      gsap.fromTo(
        plusMenuRef.current,
        { opacity: 0, scale: 0.92, y: 6 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power3.out' }
      );
    }
  }, [plusOpen]);

  useEffect(() => {
    if (emojiOpen && emojiMenuRef.current) {
      gsap.fromTo(
        emojiMenuRef.current,
        { opacity: 0, scale: 0.92, y: 6 },
        { opacity: 1, scale: 1, y: 0, duration: 0.2, ease: 'power3.out' }
      );
    }
  }, [emojiOpen]);

  useEffect(() => {
    if (!plusOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!plusMenuRef.current?.contains(event.target as Node)) {
        setPlusOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPlusOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [plusOpen]);

  if (!channel || !activeServerId || !session) {
    return (
      <div className="flex flex-1 items-center justify-center bg-discord-panel text-sm text-discord-muted">
        Select a channel to start chatting
      </div>
    );
  }

  const send = async (attachment?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }) => {
    if (sending) return;
    if (isBlank(body) && !attachment) return;
    setSending(true);
    setError(null);
    const result = await sendChannelMessage({
      channelId: channel.id,
      senderId: session.user.id,
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
      // Allow docx for Discord-like demo even if not in DM allowlist
      const allowedExtra = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      if (!allowedExtra.includes(file.type)) {
        setError('Unsupported file type.');
        return;
      }
    }
    if (file.size > ATTACHMENT_MAX_BYTES) {
      setError('File must be 10MB or smaller.');
      return;
    }
    const url = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : '#';
    await send({
      id: `att_${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url,
    });
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-discord-panel">
      <header ref={headerRef} className="flex h-12 items-center gap-3 border-b border-white/10 px-4 shadow-xs">
        <Hash className="h-5 w-5 text-discord-muted" />
        <h1 className="text-base font-bold text-ink">{channel.name}</h1>
        {channel.topic && (
          <>
            <span className="h-4 w-px bg-white/10" />
            <p className="hidden truncate text-sm text-discord-muted lg:block">{channel.topic}</p>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <IconBtn label="Threads" onClick={() => showStub('Threads stub')} icon={<Hash className="h-5 w-5" />} />
          <IconBtn label="Notifications" onClick={() => showStub('Notifications stub')} icon={<Bell className="h-5 w-5" />} />
          <IconBtn label="Pinned Messages" onClick={() => showStub('Pinned Messages stub')} icon={<Pin className="h-5 w-5" />} />
          <IconBtn
            label="Member List"
            onClick={toggleMemberList}
            icon={<Users className={`h-5 w-5 ${memberListOpen ? 'text-primary' : ''}`} />}
          />
        </div>
      </header>

      <div ref={messagesContainerRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const showDay =
            !previous ||
            !isSameDay(new Date(previous.createdAt), new Date(message.createdAt));
          const author = resolveUser(message.senderId);
          const member = getMembersForServer(activeServerId).find(
            (item) => item.userId === message.senderId,
          );
          const roleColor = member
            ? getPrimaryRoleColor(activeServerId, member.roleIds)
            : undefined;

          return (
            <div key={message.id} className="chat-msg-row">
              {showDay && (
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="rounded-full border border-white/10 bg-surface-2/80 px-3 py-1 text-xs font-semibold text-discord-muted shadow-xs">
                    {format(new Date(message.createdAt), 'MMMM d, yyyy')}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              )}
              <div className="group flex gap-3 rounded-md px-2 py-1 hover:bg-white/[0.04]">
                <Avatar
                  name={author?.fullName ?? 'User'}
                  src={author?.avatarUrl}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: roleColor || undefined }}
                    >
                      {author?.fullName ?? 'Unknown'}
                    </span>
                    <span className="text-[11px] text-discord-muted">
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                  </div>
                  {message.body && (
                    <p
                      className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink"
                      dangerouslySetInnerHTML={{
                        __html: escapeHtml(message.body).replaceAll('\n', '<br />'),
                      }}
                    />
                  )}
                  {message.attachment && <AttachmentCard attachment={message.attachment} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="bg-discord-panel px-4 pb-6 pt-2">
        {error && (
          <p role="alert" className="mb-2 text-xs text-error">
            {error}
          </p>
        )}

        <div className="relative flex min-h-[44px] items-end gap-2 rounded-xl border border-white/12 bg-surface-2 px-3 py-2.5 shadow-sm transition-all focus-within:border-white/25 focus-within:bg-surface-3 focus-within:shadow-[0_0_12px_rgba(255,255,255,0.04)]">
          <div className="relative shrink-0 self-center" ref={plusMenuRef}>
            <button
              type="button"
              aria-label="Open attachments menu"
              aria-expanded={plusOpen}
              aria-haspopup="menu"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-muted/20 text-muted transition hover:border-white/30 hover:bg-muted/30 hover:text-ink"
              onClick={() => {
                setEmojiOpen(false);
                setPlusOpen((open) => !open);
              }}
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>

            {plusOpen && (
              <div
                role="menu"
                aria-label="Message actions"
                className="absolute bottom-[calc(100%+10px)] left-0 z-30 w-56 overflow-hidden rounded-xl border border-white/15 bg-surface py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] ring-0"
              >
                <PlusMenuItem
                  icon={<Upload className="h-4 w-4" />}
                  label="Upload a File"
                  onClick={() => {
                    setPlusOpen(false);
                    fileRef.current?.click();
                  }}
                />
                <PlusMenuItem
                  icon={<MessageSquarePlus className="h-4 w-4" />}
                  label="Create Thread"
                  onClick={() => {
                    setPlusOpen(false);
                    showStub('Create Thread stub');
                  }}
                />
                <PlusMenuItem
                  icon={<ChartNoAxesColumn className="h-4 w-4" />}
                  label="Create Poll"
                  onClick={() => {
                    setPlusOpen(false);
                    showStub('Create Poll stub');
                  }}
                />
                <PlusMenuItem
                  icon={<LayoutGrid className="h-4 w-4" />}
                  label="Use Apps"
                  onClick={() => {
                    setPlusOpen(false);
                    showStub('Use Apps stub');
                  }}
                />
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept={[...ALLOWED_ATTACHMENT_TYPES, '.doc', '.docx'].join(',')}
            onChange={(event) => {
              void onFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />

          {emojiOpen && (
            <div
              ref={emojiMenuRef}
              className="absolute bottom-[calc(100%+8px)] right-3 z-20 flex gap-1 rounded-xl border border-white/15 bg-surface p-2 shadow-[0_8px_24px_rgba(0,0,0,0.25)] ring-0"
            >
              {['😀', '👍', '🎉', '❤️', '🔥', '🙏'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded-md px-2 py-1 text-lg hover:bg-surface-3"
                  onClick={() => setBody((value) => `${value}${emoji}`)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <textarea
            value={body}
            rows={1}
            placeholder={`Message #${channel.name}`}
            className="composer-input max-h-40 min-h-[24px] flex-1 resize-none self-center border-0 bg-transparent py-1 text-[15px] leading-6 text-ink outline-none placeholder:text-muted"
            onChange={(event) => setBody(event.target.value)}
            onFocus={() => setPlusOpen(false)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
          />

          <div className="flex shrink-0 items-center gap-0.5 self-center text-muted">
            <StubIcon
              label="Gift"
              onClick={() => showStub('Gift stub')}
              icon={<Gift className="h-[22px] w-[22px]" />}
            />
            <StubIcon
              label="GIF"
              onClick={() => showStub('GIF stub')}
              icon={<ImageLucide className="h-[22px] w-[22px]" />}
            />
            <StubIcon
              label="Stickers"
              onClick={() => showStub('Stickers stub')}
              icon={<Sticker className="h-[22px] w-[22px]" />}
            />
            <button
              type="button"
              className="rounded-md p-1.5 transition hover:bg-white/5 hover:text-ink"
              aria-label="Emoji"
              onClick={() => {
                setPlusOpen(false);
                setEmojiOpen((value) => !value);
              }}
            >
              <Smile className="h-[22px] w-[22px]" />
            </button>
            <StubIcon
              label="Apps"
              onClick={() => showStub('Apps stub')}
              icon={<LayoutGrid className="h-[22px] w-[22px]" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PlusMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-surface-3"
      onClick={onClick}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md text-muted">
        {icon}
      </span>
      {label}
    </button>
  );
}

function IconBtn({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="rounded-md p-1.5 text-discord-muted hover:bg-white/5 hover:text-ink"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

function StubIcon({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="rounded-md p-1.5 transition hover:bg-white/5 hover:text-ink"
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
