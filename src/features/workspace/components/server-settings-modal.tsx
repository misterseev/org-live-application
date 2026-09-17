'use client';

import { ModalFrame } from '@/features/workspace/components/modal-frame';
import { useWorkspaceStore } from '@/store/workspace-store';
import type { Server } from '@/types';
import { Camera, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ServerSettingsModalProps {
  open: boolean;
  serverId: string | null;
  onClose: () => void;
}

export function ServerSettingsModal({
  open,
  serverId,
  onClose,
}: ServerSettingsModalProps) {
  const getServer = useWorkspaceStore((state) => state.getServer);
  const server = serverId ? getServer(serverId) : undefined;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <ModalFrame
      open={open && !!server}
      onClose={onClose}
      labelledBy="server-settings-title"
      closeLabel="Close server settings"
      className="max-w-lg"
    >
      {server ? (
        <ServerSettingsForm key={server.id} server={server} onClose={onClose} />
      ) : null}
    </ModalFrame>
  );
}

function ServerSettingsForm({
  server,
  onClose,
}: {
  server: Server;
  onClose: () => void;
}) {
  const updateServer = useWorkspaceStore((state) => state.updateServer);
  const deleteServer = useWorkspaceStore((state) => state.deleteServer);

  const [name, setName] = useState(server.name);
  const [iconUrl, setIconUrl] = useState(server.iconUrl);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const previewLabel = useMemo(() => {
    return (
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') ||
      server.iconLabel ||
      'SV'
    );
  }, [name, server.iconLabel]);

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 id="server-settings-title" className="text-lg font-bold text-ink">
          Server Settings
        </h2>
        <button
          type="button"
          className="rounded-md p-1.5 text-discord-muted hover:bg-surface hover:text-ink"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6 p-5">
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-discord-muted">
            Overview
          </h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="group relative h-20 w-20 overflow-hidden rounded-full bg-surface-3 ring-1 ring-border/40"
              onClick={() => fileRef.current?.click()}
              aria-label="Change server icon"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconUrl} alt="" className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-ink/45 opacity-0 transition group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                  setError('Icon must be 5MB or smaller.');
                  return;
                }
                setIconUrl(URL.createObjectURL(file));
                setError(null);
                event.target.value = '';
              }}
            />
            <div className="min-w-0 flex-1 space-y-1.5">
              <label
                htmlFor="settings-server-name"
                className="text-xs font-bold uppercase tracking-wide text-discord-muted"
              >
                Server name
              </label>
              <input
                id="settings-server-name"
                value={name}
                maxLength={40}
                className="composer-input h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary/50 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_18%,transparent)]"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              onClick={() => {
                const trimmed = name.trim();
                if (trimmed.length < 2) {
                  setError('Server name must be at least 2 characters.');
                  return;
                }
                updateServer(server.id, {
                  name: trimmed,
                  iconUrl,
                  iconLabel: previewLabel,
                });
                setError(null);
                onClose();
              }}
            >
              Save changes
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-error/20 bg-error/5 p-4">
          <h3 className="text-sm font-bold text-error">Danger zone</h3>
          <p className="mt-1 text-sm text-discord-muted">
            Deleting <span className="font-semibold text-ink">{server.name}</span> removes
            its channels and messages from this device. This cannot be undone.
          </p>
          {!confirmDelete ? (
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-error/30 bg-white px-3 py-2 text-sm font-semibold text-error hover:bg-error/5"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Server
            </button>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-error px-3 py-2 text-sm font-semibold text-white hover:bg-error/90"
                onClick={() => {
                  const id = server.id;
                  onClose();
                  window.setTimeout(() => deleteServer(id), 220);
                }}
              >
                Yes, delete forever
              </button>
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-medium text-discord-muted hover:bg-surface"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </section>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
