'use client';

import { Avatar } from '@/components/ui/avatar';
import { ALL_WORKSPACE_USERS } from '@/services/mock/workspace-data';
import { useAuthStore } from '@/store/auth-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import type { PresenceStatus, Role, ServerMember } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

const PANEL_WIDTH = 320;

function resolveUser(userId: string) {
  return (
    useAuthStore.getState().getUserById(userId) ??
    ALL_WORKSPACE_USERS.find((user) => user.id === userId)
  );
}

function memberLabel(member: ServerMember): string {
  const user = resolveUser(member.userId);
  return member.displayName || user?.fullName || 'Unknown';
}

function statusDot(status: PresenceStatus): string {
  switch (status) {
    case 'online':
      return 'bg-discord-online';
    case 'idle':
      return 'bg-warning';
    case 'dnd':
      return 'bg-error';
    default:
      return 'bg-discord-muted';
  }
}

function MemberRow({
  member,
  roleColor,
}: {
  member: ServerMember;
  roleColor?: string;
}) {
  const user = resolveUser(member.userId);
  const name = member.displayName || user?.fullName || 'Unknown';

  return (
    <div className="member-row-item flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/5 transition-colors">
      <div className="relative shrink-0">
        <Avatar name={name} src={user?.avatarUrl} size="sm" />
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-discord-sidebar ${statusDot(member.status)}`}
        />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="truncate text-sm font-medium"
            style={{ color: roleColor || undefined }}
          >
            {name}
          </span>
          {member.isBot && (
            <span className="rounded bg-primary px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
              App
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Group({
  title,
  members,
  roleColor,
}: {
  title: string;
  members: ServerMember[];
  roleColor?: string;
}) {
  if (members.length === 0) return null;
  const uniqueMembers = Array.from(
    new Map(members.map((m) => [`${m.serverId}-${m.userId}`, m])).values()
  );

  return (
    <div className="mb-4">
      <p className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wide text-discord-muted">
        {title} — {members.length}
      </p>
      <ul>
        {uniqueMembers.map((member) => (
          <li key={`${member.serverId}-${member.userId}`}>
            <MemberRow member={member} roleColor={roleColor} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function matchesQuery(member: ServerMember, query: string): boolean {
  if (!query) return true;
  return memberLabel(member).toLowerCase().includes(query);
}

export function MemberList() {
  const [query, setQuery] = useState('');
  const membersContainerRef = useRef<HTMLDivElement>(null);
  const activeServerId = useWorkspaceStore((state) => state.activeServerId);
  const memberListOpen = useWorkspaceStore((state) => state.memberListOpen);
  const getMembersForServer = useWorkspaceStore((state) => state.getMembersForServer);
  const getRolesForServer = useWorkspaceStore((state) => state.getRolesForServer);

  const grouped = useMemo(() => {
    if (!activeServerId) return null;
    const members = getMembersForServer(activeServerId);
    const roles = getRolesForServer(activeServerId);
    const q = query.trim().toLowerCase();

    const assigned = new Set<string>();
    const roleGroups = roles
      .map((role: Role) => {
        const roleMembers = members.filter(
          (member) =>
            !member.isBot &&
            member.status !== 'offline' &&
            member.roleIds.includes(role.id),
        );
        roleMembers.forEach((member) => assigned.add(member.userId));
        return {
          role,
          members: roleMembers.filter((member) => matchesQuery(member, q)),
        };
      })
      .filter((group) => group.members.length > 0);

    const online = members.filter(
      (member) =>
        member.status !== 'offline' &&
        !member.isBot &&
        !assigned.has(member.userId) &&
        matchesQuery(member, q),
    );
    const bots = members.filter(
      (member) =>
        member.isBot && member.status !== 'offline' && matchesQuery(member, q),
    );
    const offline = members.filter(
      (member) => member.status === 'offline' && matchesQuery(member, q),
    );

    return { roleGroups, online, bots, offline };
  }, [activeServerId, getMembersForServer, getRolesForServer, query]);

  const showPanel = Boolean(memberListOpen && activeServerId && grouped);

  useEffect(() => {
    if (showPanel && membersContainerRef.current) {
      const rows = membersContainerRef.current.querySelectorAll('.member-row-item');
      if (rows.length > 0) {
        gsap.fromTo(
          Array.from(rows).slice(0, 30),
          { opacity: 0, x: 8 },
          { opacity: 1, x: 0, stagger: 0.02, duration: 0.25, ease: 'power2.out' }
        );
      }
    }
  }, [showPanel, query]);

  return (
    <AnimatePresence initial={false}>
      {showPanel && grouped ? (
        <motion.aside
          key="member-list"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: PANEL_WIDTH, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="hidden h-full shrink-0 overflow-hidden border-l border-white/10 bg-discord-sidebar lg:block"
        >
          <div
            className="flex h-full flex-col"
            style={{ width: PANEL_WIDTH, minWidth: PANEL_WIDTH }}
          >
            <div className="shrink-0 border-b border-white/10 px-3 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-discord-muted" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search"
                  className="composer-input h-9 w-full rounded-md border border-white/10 bg-surface-3 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-discord-muted focus:border-white/25 focus:bg-surface-2 focus:shadow-[0_0_8px_rgba(255,255,255,0.05)]"
                  aria-label="Search members"
                />
              </div>
            </div>

            <div ref={membersContainerRef} className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
              {grouped.roleGroups.map(({ role, members }) => (
                <Group
                  key={role.id}
                  title={role.name}
                  members={members}
                  roleColor={role.color}
                />
              ))}
              <Group title="Online" members={grouped.online} />
              <Group title="Online — Apps" members={grouped.bots} />
              <Group title="Offline" members={grouped.offline} />
            </div>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
