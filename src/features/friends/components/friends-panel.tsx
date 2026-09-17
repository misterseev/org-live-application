'use client';

import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { useFriendsStore } from '@/store/friends-store';
import type { RelationshipStatus, User } from '@/types';
import { Button } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface FriendsPanelProps {
  open: boolean;
  onClose: () => void;
  currentUserId: string;
  onOpenConversation: (conversationId: string) => void;
}

function statusLabel(status: RelationshipStatus): string {
  switch (status) {
    case 'friends':
      return 'Friends';
    case 'pending_outgoing':
      return 'Pending';
    case 'pending_incoming':
      return 'Respond';
    case 'blocked':
      return 'Blocked';
    default:
      return 'Add friend';
  }
}

export function FriendsPanel({
  open,
  onClose,
  currentUserId,
  onOpenConversation,
}: FriendsPanelProps) {
  const [tab, setTab] = useState<'all' | 'add' | 'incoming' | 'outgoing'>('all');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const searchUsers = useAuthStore((state) => state.searchUsers);
  const getUserById = useAuthStore((state) => state.getUserById);
  const getRelationship = useFriendsStore((state) => state.getRelationship);
  const getFriendsOf = useFriendsStore((state) => state.getFriendsOf);
  const getIncoming = useFriendsStore((state) => state.getIncoming);
  const getOutgoing = useFriendsStore((state) => state.getOutgoing);
  const sendRequest = useFriendsStore((state) => state.sendRequest);
  const cancelRequest = useFriendsStore((state) => state.cancelRequest);
  const acceptRequest = useFriendsStore((state) => state.acceptRequest);
  const declineRequest = useFriendsStore((state) => state.declineRequest);
  const removeFriend = useFriendsStore((state) => state.removeFriend);
  const blockUser = useFriendsStore((state) => state.blockUser);
  const ensureConversation = useChatStore((state) => state.ensureConversation);
  const markConversationReadOnly = useChatStore((state) => state.markConversationReadOnly);

  const incoming = getIncoming(currentUserId);
  const outgoing = getOutgoing(currentUserId);
  const friendIds = getFriendsOf(currentUserId);

  const friends = useMemo(() => {
    const q = query.trim().toLowerCase();
    return friendIds
      .map((id) => getUserById(id))
      .filter((user): user is User => Boolean(user))
      .filter((user) => {
        if (!q) return true;
        return (
          user.fullName.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q)
        );
      });
  }, [friendIds, getUserById, query]);

  const addResults = useMemo(
    () => searchUsers(query, currentUserId),
    [searchUsers, query, currentUserId],
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <motion.button
            type="button"
            aria-label="Close friends panel"
            className="absolute inset-0 bg-ink/35 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
          />

          <motion.aside
            className="relative flex h-full w-full max-w-[520px] flex-col bg-surface shadow-[-12px_0_40px_rgba(0,0,0,0.35)] border-l border-white/10"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34, mass: 0.9 }}
          >
            <div className="border-b border-white/10 px-5 pb-4 pt-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">All Friends</h2>
                  <p className="text-xs text-muted">{friendIds.length} friends</p>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-ink"
                  aria-label="Close"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={
                    tab === 'add'
                      ? 'Search people by name or email'
                      : 'Search friends'
                  }
                  className="composer-input h-11 w-full rounded-xl border border-white/10 bg-surface-2 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-white/25 focus:shadow-[0_0_8px_rgba(255,255,255,0.05)]"
                  aria-label="Search friends"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2">
              {(
                [
                  ['all', `All (${friendIds.length})`],
                  ['add', 'Add Friend'],
                  ['incoming', `Incoming (${incoming.length})`],
                  ['outgoing', `Outgoing (${outgoing.length})`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    tab === id ? 'bg-primary text-white' : 'text-muted hover:bg-surface'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {notice && (
                <p
                  role="status"
                  className="mb-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary"
                >
                  {notice}
                </p>
              )}

              {tab === 'all' && (
                <ul className="space-y-2">
                  {friends.length === 0 && (
                    <p className="text-sm text-muted">
                      {query.trim()
                        ? 'No friends match your search.'
                        : 'Add friends to unlock direct chat.'}
                    </p>
                  )}
                  {friends.map((user) => (
                    <li
                      key={user.id}
                      className="space-y-3 rounded-xl border border-white/10 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{user.fullName}</p>
                          <p className="truncate text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onPress={() => {
                            const conversationId = ensureConversation(
                              currentUserId,
                              user.id,
                            );
                            onOpenConversation(conversationId);
                          }}
                        >
                          Message
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          isDisabled={busyId === user.id}
                          onPress={async () => {
                            setBusyId(user.id);
                            await removeFriend(currentUserId, user.id);
                            markConversationReadOnly(currentUserId, user.id, 'removed');
                            setBusyId(null);
                            setNotice('Friend removed. Chat history kept as read-only.');
                          }}
                        >
                          Remove
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          isDisabled={busyId === user.id}
                          onPress={async () => {
                            setBusyId(user.id);
                            await blockUser(currentUserId, user.id);
                            markConversationReadOnly(currentUserId, user.id, 'blocked');
                            setBusyId(null);
                            setNotice('User blocked. Conversation is read-only.');
                          }}
                        >
                          Block
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {tab === 'add' && (
                <div className="space-y-3">
                  {!query.trim() && (
                    <p className="text-sm text-muted">
                      Type a name or email above to find people.
                    </p>
                  )}
                  {query.trim() && addResults.length === 0 && (
                    <p className="text-sm text-muted">No users found.</p>
                  )}
                  <ul className="space-y-2">
                    {addResults.map((user) => {
                      const status = getRelationship(currentUserId, user.id);
                      return (
                        <li
                          key={user.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{user.fullName}</p>
                              <p className="truncate text-xs text-muted">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={status === 'none' ? 'primary' : 'secondary'}
                            isDisabled={status !== 'none' || busyId === user.id}
                            onPress={async () => {
                              setBusyId(user.id);
                              const result = await sendRequest(currentUserId, user.id);
                              setBusyId(null);
                              setNotice(result.ok ? 'Friend request sent.' : result.error);
                            }}
                          >
                            {statusLabel(status)}
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {tab === 'incoming' && (
                <ul className="space-y-2">
                  {incoming.length === 0 && (
                    <p className="text-sm text-muted">No incoming requests.</p>
                  )}
                  {incoming.map((request) => {
                    const user = getUserById(request.fromUserId);
                    if (!user) return null;
                    return (
                      <li
                        key={request.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                          <p className="text-sm font-semibold">{user.fullName}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            isDisabled={busyId === request.id}
                            onPress={async () => {
                              setBusyId(request.id);
                              const accepted = await acceptRequest(
                                request.id,
                                currentUserId,
                              );
                              if (accepted) {
                                const conversationId = ensureConversation(
                                  currentUserId,
                                  accepted.otherUserId,
                                );
                                setNotice('Friend request accepted.');
                                onOpenConversation(conversationId);
                              }
                              setBusyId(null);
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            isDisabled={busyId === request.id}
                            onPress={async () => {
                              setBusyId(request.id);
                              await declineRequest(request.id, currentUserId);
                              setBusyId(null);
                              setNotice(
                                'Request declined. They can send again anytime.',
                              );
                            }}
                          >
                            Decline
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {tab === 'outgoing' && (
                <ul className="space-y-2">
                  {outgoing.length === 0 && (
                    <p className="text-sm text-muted">No outgoing requests.</p>
                  )}
                  {outgoing.map((request) => {
                    const user = getUserById(request.toUserId);
                    if (!user) return null;
                    return (
                      <li
                        key={request.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                          <p className="text-sm font-semibold">{user.fullName}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          isDisabled={busyId === request.id}
                          onPress={async () => {
                            setBusyId(request.id);
                            await cancelRequest(request.id, currentUserId);
                            setBusyId(null);
                            setNotice('Request cancelled.');
                          }}
                        >
                          Cancel
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
