'use client';

import { ChevronDown, Hash, Plus, Settings2, Trash2, X, AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useShallow } from 'zustand/react/shallow';

import { ModalFrame } from '@/components/ui/modal-frame';
import { useWorkspaceStore } from '@/store/workspace-store';
import type { Channel } from '@/types';

function slugifyChannelName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0e80-\u0eff\-_+.!~*']/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─────────────────────────────────────────────
// Channel Settings Modal (using global ModalFrame)
// ─────────────────────────────────────────────
function ChannelSettingsModal({
  open,
  channel,
  onClose,
}: {
  open: boolean;
  channel: Channel;
  onClose: () => void;
}) {
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
      labelledBy="channel-settings-title"
      closeLabel="Close channel settings"
      className="max-w-lg"
    >
      {open ? (
        <ChannelSettingsForm key={channel.id} channel={channel} onClose={onClose} />
      ) : null}
    </ModalFrame>
  );
}

function ChannelSettingsForm({
  channel,
  onClose,
}: {
  channel: Channel;
  onClose: () => void;
}) {
  const updateChannel = useWorkspaceStore((s) => s.updateChannel);
  const deleteChannel = useWorkspaceStore((s) => s.deleteChannel);

  // Form states
  const [nameVal, setNameVal] = useState(channel.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [topicVal, setTopicVal] = useState(channel.topic ?? '');

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const hasNameChanged = nameVal.trim() !== channel.name;
  const hasTopicChanged = topicVal.trim() !== (channel.topic ?? '');
  const hasChanges = (hasNameChanged || hasTopicChanged) && nameVal.trim().length > 0;

  const handleSave = () => {
    const trimmed = nameVal.trim();
    if (!trimmed) {
      setNameError('Please enter a channel name');
      return;
    }

    const result = updateChannel(channel.id, {
      name: trimmed,
      topic: topicVal.trim(),
    });

    if (!result.ok) {
      setNameError(result.error);
      return;
    }

    onClose();
  };

  const handleDelete = () => {
    const deletedName = channel.name;
    deleteChannel(channel.id);
    onClose();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('channel-deleted', { detail: { name: deletedName } })
      );
    }
  };

  const previewSlug = slugifyChannelName(nameVal);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-surface-2/40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-3 text-teal">
            <Settings2 className="h-4 w-4" />
          </div>
          <div>
            <h2 id="channel-settings-title" className="text-base font-semibold text-ink">
              Channel Settings
            </h2>
            <p className="text-xs text-muted">#{channel.name}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close"
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-white/10 hover:text-ink"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[75vh] overflow-y-auto px-6 py-5 space-y-5">
        {/* Section 1: Channel Name */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted">
            <span>Channel Name</span>
            <span className="text-[11px] font-normal normal-case text-muted/80">Max 40 characters</span>
          </label>

          <div className="chat-input-box flex items-center gap-2 px-3.5 py-2.5">
            <Hash className="h-4 w-4 shrink-0 text-muted" />
            <input
              autoFocus
              value={nameVal}
              maxLength={40}
              placeholder={channel.name}
              aria-label="Channel name"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 placeholder:text-muted"
              onChange={(e) => {
                setNameVal(e.target.value);
                if (nameError) setNameError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (hasChanges) handleSave();
                }
              }}
            />
          </div>

          {previewSlug && previewSlug !== nameVal.trim().toLowerCase() && (
            <p className="text-[11px] text-muted">
              Will be formatted as: <span className="font-medium text-teal">#{previewSlug}</span>
            </p>
          )}
          {nameError && (
            <p className="text-xs text-error" role="alert">
              {nameError}
            </p>
          )}
        </div>

        {/* Section 2: Channel Topic */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted">
            <span>Topic</span>
            <span className="text-[11px] font-normal normal-case text-muted/80">
              {topicVal.length} / 120
            </span>
          </label>

          <div className="chat-input-box flex flex-col p-3">
            <textarea
              value={topicVal}
              maxLength={120}
              rows={3}
              placeholder="Add a topic or description for this channel..."
              aria-label="Channel topic"
              className="w-full resize-none border-0 bg-transparent text-sm text-ink outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 placeholder:text-muted"
              onChange={(e) => setTopicVal(e.target.value)}
            />
          </div>
        </div>

        {/* Save / Cancel Action Bar */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className="rounded-xl bg-teal px-5 py-2 text-sm font-semibold text-[#1E2035] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save Changes
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-2" />

        {/* Section 3: Danger Zone */}
        <div className="rounded-xl border border-error/20 bg-error/5 p-4">
          {!deleteConfirm ? (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-error">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Channel</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  All messages in channel <span className="font-semibold text-ink">#{channel.name}</span> will be permanently removed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="shrink-0 rounded-xl border border-error/30 bg-error/10 px-3.5 py-2 text-xs font-semibold text-error transition hover:bg-error hover:text-white"
              >
                Delete Channel
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                <p className="text-xs text-ink">
                  Are you sure you want to delete <span className="font-bold text-error">#{channel.name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="rounded-xl px-3.5 py-1.5 text-xs text-muted transition hover:bg-white/5 hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-xl bg-error px-4 py-1.5 text-xs font-semibold text-white shadow-[0_0_12px_rgba(255,127,92,0.35)] transition hover:brightness-110"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Channel Item
// ─────────────────────────────────────────────
function ChannelItem({
  channel,
  active,
}: {
  channel: Channel;
  active: boolean;
}) {
  const selectChannel = useWorkspaceStore((s) => s.selectChannel);
  const [modalOpen, setModalOpen] = useState(false);

  const activeCls = active
    ? 'bg-discord-channel-active font-semibold text-ink'
    : 'text-discord-muted hover:bg-discord-channel-hover hover:text-ink';

  return (
    <>
      <li className="channel-item group/item">
        <button
          type="button"
          onClick={() => selectChannel(channel.id)}
          className={`relative flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 ${activeCls}`}
        >
          <Hash className="h-4 w-4 shrink-0 opacity-70" />
          <span className="truncate">{channel.name}</span>

          {/* Unread badge */}
          {(channel.unreadCount ?? 0) > 0 && !active && (
            <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
              {channel.unreadCount}
            </span>
          )}

          {/* Settings gear — appears on hover */}
          <span
            role="button"
            aria-label={`Settings for #${channel.name}`}
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setModalOpen(true); } }}
            className={[
              'ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all duration-150',
              'opacity-0 group-hover/item:opacity-100',
              active
                ? 'text-ink/60 hover:bg-white/10 hover:text-ink'
                : 'text-discord-muted hover:bg-white/10 hover:text-ink',
              (channel.unreadCount ?? 0) > 0 && !active ? 'hidden' : '',
            ].join(' ')}
          >
            <Settings2 className="h-3.5 w-3.5" />
          </span>
        </button>
      </li>

      {/* Modal portal using global ModalFrame */}
      <ChannelSettingsModal
        open={modalOpen}
        channel={channel}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// Category Block (Accordion)
// ─────────────────────────────────────────────
function ChannelCategoryBlock({
  categoryId,
  activeChannelId,
}: {
  categoryId: string;
  activeChannelId: string | null;
}) {
  // ---------- store subscriptions ----------
  const collapsed = useWorkspaceStore(
    (state) => state.categories.find((c) => c.id === categoryId)?.collapsed ?? false,
  );
  const categoryName = useWorkspaceStore(
    (state) => state.categories.find((c) => c.id === categoryId)?.name ?? '',
  );
  const categoryExists = useWorkspaceStore(
    (state) => state.categories.some((c) => c.id === categoryId),
  );
  const channels = useWorkspaceStore(
    useShallow((state): Channel[] => {
      const cat = state.categories.find((c) => c.id === categoryId);
      if (!cat) return [];
      return cat.channelIds
        .map((id) => state.channels.find((ch) => ch.id === id))
        .filter((ch): ch is Channel => Boolean(ch));
    }),
  );

  const toggleCategory = useWorkspaceStore((state) => state.toggleCategory);
  const createChannel = useWorkspaceStore((state) => state.createChannel);

  // ---------- local state — ALL hooks before any return ----------
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsWrapRef = useRef<HTMLUListElement>(null);
  const createRowRef = useRef<HTMLLIElement>(null);
  const didInitRef = useRef(false);
  const prevCollapsedRef = useRef<boolean>(collapsed);
  const prevChannelsLenRef = useRef<number>(channels.length);

  // ---------- effects ----------
  useEffect(() => {
    if (!creating) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [creating]);

  useEffect(() => {
    const el = chevronRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, { rotation: collapsed ? -90 : 0, duration: 0.24, ease: 'power2.out' });
  }, [collapsed]);

  useEffect(() => {
    const container = containerRef.current;
    const wrap = itemsWrapRef.current;
    if (!container || !wrap) return;

    const isFirstRender = !didInitRef.current;
    const wasCollapsed = prevCollapsedRef.current;
    const isNowCollapsed = collapsed;

    gsap.killTweensOf(container);
    gsap.killTweensOf(wrap.querySelectorAll('.channel-item'));

    if (isFirstRender) {
      gsap.set(container, { height: isNowCollapsed ? 0 : 'auto', opacity: isNowCollapsed ? 0 : 1 });
      if (chevronRef.current) gsap.set(chevronRef.current, { rotation: isNowCollapsed ? -90 : 0 });
      didInitRef.current = true;
      prevCollapsedRef.current = isNowCollapsed;
      return;
    }

    if (wasCollapsed === isNowCollapsed) { prevCollapsedRef.current = isNowCollapsed; return; }

    const items = wrap.querySelectorAll<HTMLElement>('.channel-item');

    if (!isNowCollapsed) {
      gsap.set(container, { height: 0, opacity: 1 });
      gsap.to(container, {
        height: wrap.scrollHeight, duration: 0.26, ease: 'power2.out',
        onComplete: () => gsap.set(container, { height: 'auto' }),
      });
      gsap.fromTo(Array.from(items).slice(0, 20), { opacity: 0, x: -6 }, { opacity: 1, x: 0, stagger: 0.018, duration: 0.22, ease: 'power2.out', delay: 0.04 });
    } else {
      gsap.set(container, { height: wrap.scrollHeight });
      gsap.to(container, { height: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(Array.from(items).slice(0, 20), { opacity: 0, x: -4, stagger: 0.01, duration: 0.16, ease: 'power2.in' });
    }

    prevCollapsedRef.current = isNowCollapsed;
  }, [collapsed, channels.length]);

  useEffect(() => {
    const container = containerRef.current;
    const wrap = itemsWrapRef.current;
    if (!container || !wrap || collapsed) return;
    if (channels.length === prevChannelsLenRef.current) { prevChannelsLenRef.current = channels.length; return; }
    prevChannelsLenRef.current = channels.length;
    gsap.killTweensOf(container);
    gsap.to(container, { height: wrap.scrollHeight, duration: 0.22, ease: 'power2.out', onComplete: () => gsap.set(container, { height: 'auto' }) });
  }, [channels.length, collapsed]);

  useEffect(() => {
    const row = createRowRef.current;
    const container = containerRef.current;
    const wrap = itemsWrapRef.current;
    if (!row) return;

    gsap.killTweensOf(row);
    if (creating) {
      gsap.fromTo(row, { opacity: 0, height: 0 }, {
        opacity: 1, height: 'auto', duration: 0.22, ease: 'power2.out',
        onComplete: () => {
          if (container && wrap && !collapsed) {
            gsap.to(container, { height: wrap.scrollHeight, duration: 0.22, ease: 'power2.out', onComplete: () => gsap.set(container, { height: 'auto' }) });
          }
        },
      });
    } else {
      gsap.to(row, {
        opacity: 0, height: 0, duration: 0.18, ease: 'power2.in',
        onComplete: () => {
          if (container && wrap && !collapsed) {
            gsap.to(container, { height: wrap.scrollHeight, duration: 0.2, ease: 'power2.out', onComplete: () => gsap.set(container, { height: 'auto' }) });
          }
        },
      });
    }
  }, [creating, collapsed]);

  // ---------- guard (after ALL hooks) ----------
  if (!categoryExists) return null;

  // ---------- helpers ----------
  const startCreate = () => { if (collapsed) toggleCategory(categoryId); setCreating(true); setDraft(''); setError(null); };
  const cancelCreate = () => { setCreating(false); setDraft(''); setError(null); };
  const submitCreate = () => {
    const result = createChannel({ categoryId, name: draft });
    if (!result.ok) { setError(result.error); return; }
    cancelCreate();
  };
  const preview = slugifyChannelName(draft);

  return (
    <div className="mb-1">
      {/* Accordion Header */}
      <div className="group/category flex items-center gap-0.5 px-1">
        <button
          type="button"
          className={[
            'flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 py-1.5 text-left text-[11px] font-bold uppercase tracking-widest transition-all duration-150',
            collapsed ? 'text-discord-muted hover:bg-white/5 hover:text-ink' : 'text-ink/80 hover:bg-white/5',
          ].join(' ')}
          aria-expanded={!collapsed}
          aria-controls={`channel-category-${categoryId}`}
          aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${categoryName}`}
          onClick={() => toggleCategory(categoryId)}
        >
          <ChevronDown ref={chevronRef} className="h-3.5 w-3.5 shrink-0 transition-colors duration-150" />
          <span className="truncate">{categoryName}</span>
        </button>

        <button
          type="button"
          title="Create Channel"
          aria-label={`Create channel in ${categoryName}`}
          className="rounded-md p-1 text-discord-muted opacity-0 transition-all duration-150 hover:bg-white/10 hover:text-ink group-hover/category:opacity-100 focus-visible:opacity-100"
          onClick={(e) => { e.stopPropagation(); startCreate(); }}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Accordion Body */}
      <div id={`channel-category-${categoryId}`} ref={containerRef} className="overflow-hidden">
        <ul ref={itemsWrapRef} className="space-y-0.5 pb-1">
          {channels.map((channel) => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              active={channel.id === activeChannelId}
            />
          ))}

          <li ref={createRowRef} style={{ overflow: 'hidden' }}>
            {creating && (
              <div className="chat-input-box px-2.5 py-1.5 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-4 w-4 shrink-0 text-muted" />
                  <input
                    ref={inputRef}
                    value={draft}
                    maxLength={40}
                    placeholder="new-channel"
                    aria-label="New channel name"
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 placeholder:text-muted"
                    onChange={(e) => { setDraft(e.target.value); if (error) setError(null); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); submitCreate(); }
                      if (e.key === 'Escape') { e.preventDefault(); cancelCreate(); }
                    }}
                    onBlur={() => { if (!draft.trim()) cancelCreate(); }}
                  />
                </div>
                {preview && preview !== draft.trim().toLowerCase() && (
                  <p className="mt-1 pl-5 text-[11px] text-muted">
                    Will create <span className="font-medium text-ink">#{preview}</span>
                  </p>
                )}
                {error && <p role="alert" className="mt-1 pl-5 text-[11px] text-error">{error}</p>}
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Channel Deleted GSAP Notification
// ─────────────────────────────────────────────
function ChannelDeletedNotification() {
  const [notice, setNotice] = useState<{ name: string; id: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onChannelDeleted = (e: Event) => {
      const customEvent = e as CustomEvent<{ name: string }>;
      if (customEvent.detail?.name) {
        setNotice({ name: customEvent.detail.name, id: Date.now() });
      }
    };

    window.addEventListener('channel-deleted', onChannelDeleted);
    return () => window.removeEventListener('channel-deleted', onChannelDeleted);
  }, []);

  useEffect(() => {
    if (!notice || !cardRef.current) return;
    const el = cardRef.current;
    gsap.killTweensOf(el);

    const tl = gsap.timeline({
      onComplete: () => setNotice(null),
    });

    // Drops down smoothly from top of screen to the center with a gentle bounce
    tl.fromTo(
      el,
      { y: -350, opacity: 0, scale: 0.82, rotateX: 12 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        duration: 0.8,
        ease: 'back.out(1.5)',
      },
    )
      // Pauses in the center of the screen, then gracefully fades away
      .to(el, {
        y: -24,
        opacity: 0,
        scale: 0.94,
        duration: 0.55,
        ease: 'power2.in',
        delay: 1.4,
      });

    return () => {
      gsap.killTweensOf(el);
    };
  }, [notice]);

  if (!notice) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-90 flex items-center justify-center p-4">
      <div
        ref={cardRef}
        role="status"
        aria-live="polite"
        className="flex items-center gap-3.5 rounded-2xl border border-white/15 bg-surface/95 px-6 py-4 shadow-[0_24px_64px_rgba(0,0,0,0.65)] backdrop-blur-xl"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-error/25 bg-error/15 text-error shadow-sm">
          <Trash2 className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink">Channel Deleted</h4>
          <p className="text-xs text-muted">
            <span className="font-semibold text-ink">#{notice.name}</span> has been successfully removed.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Channel Category List (root export)
// ─────────────────────────────────────────────
export function ChannelCategoryList({
  serverId,
  activeChannelId,
}: {
  serverId: string;
  activeChannelId: string | null;
}) {
  const categoryIds = useWorkspaceStore(
    useShallow((state) =>
      state.categories.filter((c) => c.serverId === serverId).map((c) => c.id),
    ),
  );

  const createCategory = useWorkspaceStore((state) => state.createCategory);

  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(timer);
    }
  }, [creating]);

  const submitCreate = () => {
    const result = createCategory({ serverId, name: draft });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setCreating(false);
    setDraft('');
    setError(null);
  };

  const cancelCreate = () => {
    setCreating(false);
    setDraft('');
    setError(null);
  };

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <div>
          {categoryIds.map((id) => (
            <ChannelCategoryBlock key={id} categoryId={id} activeChannelId={activeChannelId} />
          ))}

          {/* Create Category UI */}
          <div className="mt-2 px-1">
            {!creating ? (
              <button
                type="button"
                onClick={() => { setCreating(true); setDraft(''); setError(null); }}
                className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-discord-muted transition-colors hover:bg-white/5 hover:text-ink"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
                <span>Create Category</span>
              </button>
            ) : (
              <div className="chat-input-box px-2.5 py-1.5 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <input
                    ref={inputRef}
                    value={draft}
                    maxLength={40}
                    placeholder="New Category"
                    aria-label="New category name"
                    className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink font-bold uppercase tracking-widest outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 placeholder:text-muted placeholder:font-normal placeholder:normal-case placeholder:tracking-normal"
                    onChange={(e) => { setDraft(e.target.value); if (error) setError(null); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); submitCreate(); }
                      if (e.key === 'Escape') { e.preventDefault(); cancelCreate(); }
                    }}
                    onBlur={() => { if (!draft.trim()) cancelCreate(); }}
                  />
                </div>
                {error && <p role="alert" className="mt-1 text-[11px] text-error">{error}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
      <ChannelDeletedNotification />
    </>
  );
}
