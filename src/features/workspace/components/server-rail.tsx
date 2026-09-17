'use client';

import { CreateServerModal } from '@/features/workspace/components/create-server-modal';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Compass, Download, Plus } from 'lucide-react';
import { useState } from 'react';

function ServerIconButton({
  label,
  src,
  active,
  unread,
  onClick,
  variant = 'image',
}: {
  label: string;
  src?: string;
  active?: boolean;
  unread?: boolean;
  onClick: () => void;
  variant?: 'image' | 'home' | 'action';
}) {
  return (
    <div className="relative flex w-full justify-center">
      <span
        className={cn(
          'absolute left-0 top-1/2 h-0 w-1 -translate-y-1/2 rounded-r-full bg-ink transition-all',
          active ? 'h-10' : unread ? 'h-2' : 'h-0',
        )}
      />
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-current={active ? 'true' : undefined}
        onClick={onClick}
        className={cn(
          'group relative cursor-pointer flex h-12 w-12 items-center justify-center overflow-hidden rounded-[24px] bg-discord-panel text-ink transition-all duration-300 ease-out',
          'border border-transparent hover:rounded-[16px] hover:border-white/10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]',
          variant === 'action' && 'text-discord-online hover:bg-discord-online hover:text-white hover:border-discord-online',
          active && 'rounded-[16px] border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]',
        )}
      >
        {variant === 'home' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/home-icon.jpg"
            alt={label}
            className="h-full w-full object-cover"
          />
        ) : variant === 'action' ? (
          label === 'Explore' ? (
            <Compass className="h-5 w-5" />
          ) : label === 'Download Apps' ? (
            <Download className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" />
          )
        ) : src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-ink">{label.slice(0, 2)}</span>
        )}
      </button>
    </div>
  );
}

export function ServerRail() {
  const servers = useWorkspaceStore((state) => state.servers);
  const view = useWorkspaceStore((state) => state.view);
  const activeServerId = useWorkspaceStore((state) => state.activeServerId);
  const setViewHome = useWorkspaceStore((state) => state.setViewHome);
  const selectServer = useWorkspaceStore((state) => state.selectServer);
  const showStub = useWorkspaceStore((state) => state.showStub);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <nav
        className="flex w-[72px] shrink-0 flex-col items-center gap-2 bg-discord-sidebar py-3"
        aria-label="Servers"
      >
        <ServerIconButton
          label="Direct Messages"
          variant="home"
          active={view === 'home'}
          onClick={setViewHome}
        />
        <div className="mx-auto h-px w-8 rounded-full bg-white/10" />
        <div className="flex w-full flex-col items-center gap-2 overflow-y-auto">
          {servers.map((server) => (
            <ServerIconButton
              key={server.id}
              label={server.name}
              src={server.iconUrl}
              active={view === 'server' && activeServerId === server.id}
              unread={server.unread}
              onClick={() => selectServer(server.id)}
            />
          ))}
        </div>
        <ServerIconButton
          label="Add a Server"
          variant="action"
          onClick={() => setCreateOpen(true)}
        />
        <ServerIconButton
          label="Explore"
          variant="action"
          onClick={() => showStub('Explore is coming soon')}
        />
        <div className="mt-auto">
          <ServerIconButton
            label="Download Apps"
            variant="action"
            onClick={() => showStub('Download Apps is a stub')}
          />
        </div>
      </nav>

      <CreateServerModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
