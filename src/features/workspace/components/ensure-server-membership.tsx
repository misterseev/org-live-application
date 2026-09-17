'use client';

import { useAuthStore } from '@/store/auth-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useEffect } from 'react';

/** Ensures the signed-in user appears in the active server member list. */
export function EnsureServerMembership() {
  const session = useAuthStore((state) => state.session);
  const activeServerId = useWorkspaceStore((state) => state.activeServerId);
  const members = useWorkspaceStore((state) => state.members);

  useEffect(() => {
    if (!session || !activeServerId) return;
    const exists = members.some(
      (member) =>
        member.serverId === activeServerId && member.userId === session.user.id,
    );
    if (exists) return;

    useWorkspaceStore.setState((state) => ({
      members: [
        {
          userId: session.user.id,
          serverId: activeServerId,
          roleIds:
            state.roles
              .filter((role) => role.serverId === activeServerId)
              .slice(0, 1)
              .map((role) => role.id),
          status: 'online' as const,
        },
        ...state.members,
      ],
    }));
  }, [session, activeServerId, members]);

  return null;
}
