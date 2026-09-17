'use client';

import { Avatar } from '@/components/ui/avatar';
import { ChannelCategoryList } from '@/features/workspace/components/channel-category-list';
import { ServerSettingsModal } from '@/features/workspace/components/server-settings-modal';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import {
  Bell,
  FolderPlus,
  Headphones,
  Menu,
  Mic,
  MicOff,
  PlusCircle,
  Settings,
  UserPlus,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

function HeadphoneIcon({ deafened }: { deafened: boolean }) {
  return (
    <span className="relative inline-flex">
      <Headphones className={`h-4 w-4 ${deafened ? 'text-error' : ''}`} />
      {deafened && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-5 w-0.5 rotate-45 bg-error" />
        </span>
      )}
    </span>
  );
}

export function UserControlBar() {
  const session = useAuthStore((state) => state.session);
  const muted = useWorkspaceStore((state) => state.muted);
  const deafened = useWorkspaceStore((state) => state.deafened);
  const toggleMute = useWorkspaceStore((state) => state.toggleMute);
  const toggleDeafen = useWorkspaceStore((state) => state.toggleDeafen);
  const showStub = useWorkspaceStore((state) => state.showStub);

  if (!session) return null;

  return (
    <div className="flex items-center gap-2 border-t border-white/10 bg-surface-2 px-2 py-1.5">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 hover:bg-white/5"
        onClick={() => showStub('User settings stub')}
      >
        <div className="relative">
          <Avatar name={session.user.fullName} src={session.user.avatarUrl} size="sm" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface-2 bg-discord-online" />
        </div>
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-semibold text-ink">{session.user.fullName}</p>
          <p className="truncate text-[11px] text-discord-muted">Online</p>
        </div>
      </button>
      <button
        type="button"
        className="rounded-md p-1.5 text-discord-muted hover:bg-white/5 hover:text-ink"
        aria-label={muted ? 'Unmute' : 'Mute'}
        onClick={toggleMute}
      >
        {muted ? <MicOff className="h-4 w-4 text-error" /> : <Mic className="h-4 w-4" />}
      </button>
      <button
        type="button"
        className="rounded-md p-1.5 text-discord-muted hover:bg-white/5 hover:text-ink"
        aria-label={deafened ? 'Undeafen' : 'Deafen'}
        onClick={toggleDeafen}
      >
        <HeadphoneIcon deafened={deafened} />
      </button>
      <button
        type="button"
        className="rounded-md p-1.5 text-discord-muted hover:bg-white/5 hover:text-ink"
        aria-label="User settings"
        onClick={() => showStub('User settings stub')}
      >
        <Settings className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ChannelSidebar() {
  const activeServerId = useWorkspaceStore((state) => state.activeServerId);
  const activeChannelId = useWorkspaceStore((state) => state.activeChannelId);
  const getServer = useWorkspaceStore((state) => state.getServer);
  const showStub = useWorkspaceStore((state) => state.showStub);

  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuOpen && dropdownRef.current) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, scale: 0.94, y: -4 },
        { opacity: 1, scale: 1, y: 0, duration: 0.18, ease: 'power2.out' }
      );
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  if (!activeServerId) return null;
  const server = getServer(activeServerId);
  if (!server) return null;

  return (
    <>
      <aside className="flex w-60 shrink-0 flex-col bg-discord-sidebar">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-between border-b border-white/10 px-4 text-left shadow-xs hover:bg-white/5 transition-colors"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="truncate text-base font-bold text-ink">{server.name}</span>
            <Menu
              className={cn(
                'h-5 w-5 text-discord-muted transition-transform duration-200',
                menuOpen && 'rotate-90 text-ink',
              )}
            />
          </button>

          {menuOpen && (
            <div
              ref={dropdownRef}
              role="menu"
              className="absolute left-2 right-2 top-[calc(100%+4px)] z-40 overflow-hidden rounded-xl border border-white/15 bg-surface py-2 shadow-[0_8px_24px_rgba(0,0,0,0.25)] ring-0"
            >
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-discord-online transition-colors hover:bg-discord-online hover:text-white"
                onClick={() => {
                  setMenuOpen(false);
                  showStub('Invite People stub');
                }}
              >
                Invite People
                <UserPlus className="h-4 w-4" />
              </button>
              
              <div className="my-1.5 h-px w-full bg-white/10" />

              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-primary hover:text-white group"
                onClick={() => {
                  setMenuOpen(false);
                  setSettingsOpen(true);
                }}
              >
                Server Settings
                <Settings className="h-4 w-4 text-discord-muted group-hover:text-white transition-colors" />
              </button>
              
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-primary hover:text-white group"
                onClick={() => {
                  setMenuOpen(false);
                  showStub('Create Channel stub');
                }}
              >
                Create Channel
                <PlusCircle className="h-4 w-4 text-discord-muted group-hover:text-white transition-colors" />
              </button>
              
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-primary hover:text-white group"
                onClick={() => {
                  setMenuOpen(false);
                  showStub('Create Category stub');
                }}
              >
                Create Category
                <FolderPlus className="h-4 w-4 text-discord-muted group-hover:text-white transition-colors" />
              </button>
              
              <div className="my-1.5 h-px w-full bg-white/10" />

              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-primary hover:text-white group"
                onClick={() => {
                  setMenuOpen(false);
                  showStub('Notification Settings stub');
                }}
              >
                Notification Settings
                <Bell className="h-4 w-4 text-discord-muted group-hover:text-white transition-colors" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 border-b border-white/10 px-2 py-3">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md bg-surface-3 px-3 py-2 text-left text-xs shadow-xs transition-colors duration-150 hover:bg-discord-channel-hover"
            onClick={() => showStub('Boost Goal stub')}
          >
            <span className="font-medium text-ink">Boost Goal</span>
            <span className="text-discord-muted">2 / 3</span>
          </button>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-secondary" />
          </div>
          <button
            type="button"
            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-discord-muted transition-colors duration-150 hover:bg-discord-channel-hover hover:text-ink"
            onClick={() => showStub('Events stub')}
          >
            Events
          </button>
        </div>

        <ChannelCategoryList
          serverId={activeServerId}
          activeChannelId={activeChannelId}
        />

        <UserControlBar />
      </aside>

      <ServerSettingsModal
        open={settingsOpen}
        serverId={activeServerId}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
