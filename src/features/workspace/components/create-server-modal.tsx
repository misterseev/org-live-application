'use client';

import { ModalFrame } from '@/features/workspace/components/modal-frame';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Camera, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const ICON_COLORS = [
  '2563eb',
  '16a34a',
  '7c3aed',
  'dc2626',
  'f59e0b',
  '0891b2',
  'db2777',
  '4f46e5',
] as const;

interface CreateServerModalProps {
  open: boolean;
  onClose: () => void;
}

function initialsFromName(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'SV'
  );
}

export function CreateServerModal({ open, onClose }: CreateServerModalProps) {
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
      open={open}
      onClose={onClose}
      labelledBy="create-server-title"
      closeLabel="Close create server modal"
      className="max-w-md p-6"
    >
      {open ? <CreateServerForm onClose={onClose} /> : null}
    </ModalFrame>
  );
}

function CreateServerForm({ onClose }: { onClose: () => void }) {
  const createServer = useWorkspaceStore((state) => state.createServer);
  const [name, setName] = useState('');
  const [color, setColor] = useState<(typeof ICON_COLORS)[number]>('16a34a');
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const previewLabel = useMemo(() => initialsFromName(name), [name]);
  const previewUrl = useMemo(() => {
    if (customIcon) return customIcon;
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(previewLabel)}&backgroundColor=${color}`;
  }, [customIcon, previewLabel, color]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Server name must be at least 2 characters.');
      return;
    }
    createServer({
      name: trimmed,
      iconUrl: previewUrl,
      iconLabel: previewLabel,
    });
    onClose();
  };

  return (
    <>
      <button
        type="button"
        className="absolute cursor-pointer group right-3 top-3 rounded-md p-1.5 text-discord-muted hover:bg-surface hover:text-ink"
        aria-label="Close"
        onClick={onClose}
      >
        <X className="h-5 w-5 group-hover:text-primary" />
      </button>

      <div className="space-y-1 pr-8 text-center">
        <h2 id="create-server-title" className="text-xl font-bold text-ink">
          Customize your server
        </h2>
        <p className="text-sm text-discord-muted">
          Give your new server a name and profile icon. You can change these later.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            className="group relative h-24 w-24 overflow-hidden rounded-full bg-surface-3 ring-1 ring-border/40"
            onClick={() => fileRef.current?.click()}
            aria-label="Upload server icon"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex flex-col items-center justify-center bg-ink/45 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
              <Camera className="mb-1 h-5 w-5" />
              Upload
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
              const url = URL.createObjectURL(file);
              setCustomIcon(url);
              setError(null);
              event.target.value = '';
            }}
          />
          {!customIcon && (
            <div className="flex flex-wrap justify-center gap-2">
              {ICON_COLORS.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Color ${swatch}`}
                  className={`h-7 w-7 rounded-full ring-2 ring-offset-2 ${
                    color === swatch ? 'ring-primary' : 'ring-transparent'
                  }`}
                  style={{ backgroundColor: `#${swatch}` }}
                  onClick={() => setColor(swatch)}
                />
              ))}
            </div>
          )}
          {customIcon && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => setCustomIcon(null)}
            >
              Use generated icon instead
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="server-name"
            className="text-xs font-bold uppercase tracking-wide text-discord-muted"
          >
            Server name
          </label>
          <input
            id="server-name"
            value={name}
            maxLength={40}
            autoFocus
            placeholder="My awesome server"
            className="chat-input h-11 w-full px-3.5 text-sm"
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError(null);
            }}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="submit"
            className="rounded-lg bg-primary w-full uppercase cursor-pointer px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Create
          </button>
        </div>
      </form>
    </>
  );
}
