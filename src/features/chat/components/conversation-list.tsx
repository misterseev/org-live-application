'use client';

import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { formatDistanceToNow } from 'date-fns';
import { Search, UserPlus, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

interface ConversationListProps {
  currentUserId: string;
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onOpenFriends: () => void;
}

export function ConversationList({
  currentUserId,
  activeConversationId,
  onSelect,
  onOpenFriends,
}: ConversationListProps) {
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLUListElement>(null);
  const getConversationsForUser = useChatStore((state) => state.getConversationsForUser);
  const getUserById = useAuthStore((state) => state.getUserById);
  const conversations = getConversationsForUser(currentUserId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conversation) => {
      const otherId = conversation.participantIds.find((id) => id !== currentUserId);
      const other = otherId ? getUserById(otherId) : undefined;
      return (
        other?.fullName.toLowerCase().includes(q) ||
        conversation.lastMessagePreview.toLowerCase().includes(q)
      );
    });
  }, [conversations, query, currentUserId, getUserById]);

  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll('.conversation-item-anim');
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { opacity: 0, x: -8 },
          { opacity: 1, x: 0, stagger: 0.035, duration: 0.28, ease: 'power2.out' }
        );
      }
    }
  }, [filtered.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-base font-bold text-ink">All Friends</h2>
            <p className="text-xs text-muted">Direct messages</p>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search friends or conversations"
            className="composer-input h-11 w-full rounded-xl border border-white/10 bg-surface pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-white/25 focus:bg-surface-2 focus:shadow-[0_0_8px_rgba(255,255,255,0.05)]"
            aria-label="Search friends or conversations"
          />
        </div>

        <button
          type="button"
          onClick={onOpenFriends}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-sm font-medium text-ink transition hover:border-white/25 hover:bg-surface-2"
        >
          <UserPlus className="h-4 w-4" />
          Manage friends
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="space-y-2 p-6 text-center">
            <p className="text-sm font-medium text-ink">No conversations yet</p>
            <p className="text-sm text-muted">Add a friend to start chatting.</p>
          </div>
        ) : (
          <ul ref={listRef} className="divide-y divide-white/10">
            {filtered.map((conversation) => {
              const otherId = conversation.participantIds.find(
                (id) => id !== currentUserId,
              );
              const other = otherId ? getUserById(otherId) : undefined;
              const unread = conversation.unreadByUserId[currentUserId] ?? 0;
              const active = conversation.id === activeConversationId;

              return (
                <li key={conversation.id} className="conversation-item-anim">
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      active ? 'bg-teal/10 border-l-2 border-teal' : 'hover:bg-surface-2/60'
                    }`}
                  >
                    <Avatar
                      name={other?.fullName ?? 'User'}
                      src={other?.avatarUrl}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-ink">
                          {other?.fullName ?? 'Unknown user'}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted">
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: false,
                          })}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <p className="truncate text-sm text-muted">
                          {conversation.lastMessagePreview}
                        </p>
                        {unread > 0 && (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-teal px-1.5 text-[11px] font-semibold text-[#1E2035]">
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
