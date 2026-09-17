'use client';

import { Avatar } from '@/components/ui/avatar';
import { FriendsPanel } from '@/features/friends/components/friends-panel';
import { ChatThread } from '@/features/chat/components/chat-thread';
import { ConversationList } from '@/features/chat/components/conversation-list';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { Button } from '@heroui/react';
import { LogOut, UserPlus } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export function MessengerShell() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session)!;
  const logout = useAuthStore((state) => state.logout);
  const getTotalUnread = useChatStore((state) => state.getTotalUnread);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const unread = useMemo(
    () => getTotalUnread(session.user.id),
    [getTotalUnread, session.user.id],
  );

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileShowChat(true);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    await logout();
    router.replace('/login');
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="flex h-14 items-center justify-between border-b border-white/10 bg-surface px-4">
        <div className="flex items-center gap-3">
          <Avatar name={session.user.fullName} src={session.user.avatarUrl} size="sm" />
          <div>
            <p className="text-sm font-semibold text-ink">{session.user.fullName}</p>
            <p className="text-xs text-muted">
              Messenger{unread > 0 ? ` · ${unread} unread` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onPress={() => setFriendsOpen(true)}
          >
            <UserPlus className="mr-1 h-4 w-4" />
            Friends
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Log out"
            onPress={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        <aside
          className={`w-full border-r border-white/10 bg-surface md:w-[420px] md:shrink-0 ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          } flex-col`}
        >
          <ConversationList
            currentUserId={session.user.id}
            activeConversationId={activeConversationId}
            onSelect={handleSelectConversation}
            onOpenFriends={() => setFriendsOpen(true)}
          />
        </aside>

        <section
          className={`min-w-0 flex-1 ${
            mobileShowChat ? 'flex' : 'hidden md:flex'
          } flex-col bg-surface`}
        >
          <ChatThread
            currentUserId={session.user.id}
            conversationId={activeConversationId}
            onBack={() => {
              setMobileShowChat(false);
              setActiveConversationId(null);
            }}
          />
        </section>
      </div>

      <FriendsPanel
        open={friendsOpen}
        onClose={() => setFriendsOpen(false)}
        currentUserId={session.user.id}
        onOpenConversation={(conversationId) => {
          setFriendsOpen(false);
          handleSelectConversation(conversationId);
        }}
      />
    </div>
  );
}
