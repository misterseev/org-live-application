'use client';

import { MessengerShell } from '@/features/chat/components/messenger-shell';
import { ChannelChat } from '@/features/workspace/components/channel-chat';
import { ChannelSidebar } from '@/features/workspace/components/channel-sidebar';
import { EnsureServerMembership } from '@/features/workspace/components/ensure-server-membership';
import { MemberList } from '@/features/workspace/components/member-list';
import { ServerRail } from '@/features/workspace/components/server-rail';
import { useWorkspaceStore } from '@/store/workspace-store';
import { AnimatePresence, motion } from 'framer-motion';

export function WorkspaceShell() {
  const view = useWorkspaceStore((state) => state.view);
  const stubToast = useWorkspaceStore((state) => state.stubToast);

  return (
    <div className="flex h-screen overflow-hidden bg-discord-app">
      <EnsureServerMembership />
      <ServerRail />

      <div className="relative min-w-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {view === 'home' ? (
            <motion.div
              key="home"
              className="absolute inset-0 border-l border-white/10"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <MessengerShell />
            </motion.div>
          ) : (
            <motion.div
              key="server"
              className="absolute inset-0 flex border-l border-white/10"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <ChannelSidebar />
              <ChannelChat />
              <MemberList />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {stubToast && <StubToast message={stubToast} />}
    </div>
  );
}

function StubToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-4 py-2 text-sm text-white shadow-md"
    >
      {message}
    </div>
  );
}
