'use client';

import { ChevronDown, Hash, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import { useWorkspaceStore } from '@/store/workspace-store';
import type { Channel, ChannelCategory } from '@/types';

function slugifyChannelName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u0e80-\u0eff\-_+.!~*']/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function ChannelCategoryBlock({
  category,
  channels,
  activeChannelId,
}: {
  category: ChannelCategory;
  channels: Channel[];
  activeChannelId: string | null;
}) {
  const toggleCategory = useWorkspaceStore((state) => state.toggleCategory);
  const selectChannel = useWorkspaceStore((state) => state.selectChannel);
  const createChannel = useWorkspaceStore((state) => state.createChannel);

  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chevronRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsWrapRef = useRef<HTMLUListElement>(null);
  const createRowRef = useRef<HTMLLIElement>(null);
  const didInitRef = useRef(false);
  const prevCollapsedRef = useRef<boolean>(!!category.collapsed);
  const prevChannelsLenRef = useRef<number>(channels.length);

  useEffect(() => {
    if (!creating) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [creating]);

  useEffect(() => {
    const el = chevronRef.current;
    if (!el) return;
    gsap.killTweensOf(el);
    gsap.to(el, {
      rotation: category.collapsed ? -90 : 0,
      duration: 0.24,
      ease: 'power2.out',
    });
  }, [category.collapsed]);

  useEffect(() => {
    const container = containerRef.current;
    const wrap = itemsWrapRef.current;
    if (!container || !wrap) return;

    const isFirstRender = !didInitRef.current;
    const wasCollapsed = prevCollapsedRef.current;
    const isNowCollapsed = !!category.collapsed;

    gsap.killTweensOf(container);
    gsap.killTweensOf(wrap.querySelectorAll('.channel-item'));

    if (isFirstRender) {
      gsap.set(container, {
        height: isNowCollapsed ? 0 : 'auto',
        opacity: isNowCollapsed ? 0 : 1,
      });
      if (chevronRef.current) {
        gsap.set(chevronRef.current, { rotation: isNowCollapsed ? -90 : 0 });
      }
      didInitRef.current = true;
      prevCollapsedRef.current = isNowCollapsed;
      return;
    }

    if (wasCollapsed === isNowCollapsed) {
      prevCollapsedRef.current = isNowCollapsed;
      return;
    }

    const items = wrap.querySelectorAll<HTMLElement>('.channel-item');

    if (!isNowCollapsed) {
      const targetHeight = wrap.scrollHeight;
      gsap.killTweensOf(container);
      gsap.set(container, { height: 0, opacity: 1 });
      gsap.to(container, {
        height: targetHeight,
        duration: 0.26,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(container, { height: 'auto' });
        },
      });
      gsap.fromTo(
        Array.from(items).slice(0, 20),
        { opacity: 0, x: -6 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.018,
          duration: 0.22,
          ease: 'power2.out',
          delay: 0.04,
        },
      );
    } else {
      gsap.killTweensOf(container);
      gsap.set(container, { height: wrap.scrollHeight });
      gsap.to(container, {
        height: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
      gsap.to(Array.from(items).slice(0, 20), {
        opacity: 0,
        x: -4,
        stagger: 0.01,
        duration: 0.16,
        ease: 'power2.in',
      });
    }

    prevCollapsedRef.current = isNowCollapsed;
  }, [category.collapsed, channels.length]);

  useEffect(() => {
    const container = containerRef.current;
    const wrap = itemsWrapRef.current;
    if (!container || !wrap || category.collapsed) return;
    if (channels.length === prevChannelsLenRef.current) {
      prevChannelsLenRef.current = channels.length;
      return;
    }
    prevChannelsLenRef.current = channels.length;

    gsap.killTweensOf(container);
    const targetHeight = wrap.scrollHeight;
    gsap.to(container, {
      height: targetHeight,
      duration: 0.22,
      ease: 'power2.out',
      onComplete: () => gsap.set(container, { height: 'auto' }),
    });
  }, [channels.length, category.collapsed]);

  useEffect(() => {
    const row = createRowRef.current;
    const container = containerRef.current;
    const wrap = itemsWrapRef.current;
    if (!row) return;

    gsap.killTweensOf(row);
    if (creating) {
      gsap.fromTo(
        row,
        { opacity: 0, height: 0 },
        {
          opacity: 1,
          height: 'auto',
          duration: 0.22,
          ease: 'power2.out',
          onComplete: () => {
            if (container && wrap && !category.collapsed) {
              gsap.killTweensOf(container);
              const targetHeight = wrap.scrollHeight;
              gsap.to(container, {
                height: targetHeight,
                duration: 0.22,
                ease: 'power2.out',
                onComplete: () => gsap.set(container, { height: 'auto' }),
              });
            }
          },
        },
      );
    } else {
      gsap.to(row, {
        opacity: 0,
        height: 0,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          if (container && wrap && !category.collapsed) {
            gsap.killTweensOf(container);
            const targetHeight = wrap.scrollHeight;
            gsap.to(container, {
              height: targetHeight,
              duration: 0.2,
              ease: 'power2.out',
              onComplete: () => gsap.set(container, { height: 'auto' }),
            });
          }
        },
      });
    }
  }, [creating, category.collapsed]);

  const startCreate = () => {
    if (category.collapsed) toggleCategory(category.id);
    setCreating(true);
    setDraft('');
    setError(null);
  };

  const cancelCreate = () => {
    setCreating(false);
    setDraft('');
    setError(null);
  };

  const submitCreate = () => {
    const result = createChannel({ categoryId: category.id, name: draft });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    cancelCreate();
  };

  const preview = slugifyChannelName(draft);

  const channelItemActiveCls = (active: boolean) =>
    active
      ? 'bg-discord-channel-active font-semibold text-ink'
      : 'text-discord-muted hover:bg-discord-channel-hover hover:text-ink';

  return (
    <div className="mb-2">
      <div className="group/category mb-0.5 flex items-center gap-0.5 rounded-md px-1">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1 rounded-md py-1 text-left text-[11px] font-bold uppercase tracking-wide text-discord-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink"
          aria-expanded={!category.collapsed}
          aria-controls={`channel-category-${category.id}`}
          aria-label={`${category.collapsed ? 'Expand' : 'Collapse'} ${category.name}`}
          onClick={() => toggleCategory(category.id)}
        >
          <ChevronDown
            ref={chevronRef}
            className="h-3 w-3 shrink-0"
          />
          <span className="truncate">{category.name}</span>
        </button>
        <button
          type="button"
          title="Create Channel"
          aria-label={`Create channel in ${category.name}`}
          className="rounded p-0.5 text-discord-muted opacity-0 transition-all duration-150 hover:bg-black/5 hover:text-ink group-hover/category:opacity-100 focus-visible:opacity-100"
          onClick={(event) => {
            event.stopPropagation();
            startCreate();
          }}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      <div
        id={`channel-category-${category.id}`}
        ref={containerRef}
        className="overflow-hidden"
      >
        <ul ref={itemsWrapRef} className="space-y-0.5 pb-1">
          {channels.map((channel) => {
            const active = channel.id === activeChannelId;
            return (
              <li key={channel.id} className="channel-item">
                <button
                  type="button"
                  onClick={() => selectChannel(channel.id)}
                  className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 ${channelItemActiveCls(active)}`}
                >
                  <Hash className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{channel.name}</span>
                  {(channel.unreadCount ?? 0) > 0 && !active && (
                    <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            );
          })}

          <li ref={createRowRef} style={{ overflow: 'hidden' }}>
            {creating && (
              <div className="rounded-md border border-white/15 bg-surface-3 px-2 py-1.5 shadow-xs">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-4 w-4 shrink-0 text-discord-muted" />
                  <input
                    ref={inputRef}
                    value={draft}
                    maxLength={40}
                    placeholder="new-channel"
                    aria-label="New channel name"
                    className="composer-input min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-discord-muted"
                    onChange={(event) => {
                      setDraft(event.target.value);
                      if (error) setError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        submitCreate();
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        cancelCreate();
                      }
                    }}
                    onBlur={() => {
                      if (!draft.trim()) cancelCreate();
                    }}
                  />
                </div>
                {preview && preview !== draft.trim().toLowerCase() && (
                  <p className="mt-1 pl-5 text-[11px] text-discord-muted">
                    Will create <span className="font-medium text-ink">#{preview}</span>
                  </p>
                )}
                {error && (
                  <p role="alert" className="mt-1 pl-5 text-[11px] text-error">
                    {error}
                  </p>
                )}
              </div>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}

export function ChannelCategoryList({
  categories,
  activeChannelId,
}: {
  categories: ChannelCategory[];
  activeChannelId: string | null;
}) {
  const getChannelsForCategory = useWorkspaceStore(
    (state) => state.getChannelsForCategory,
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
      {categories.map((category) => (
        <ChannelCategoryBlock
          key={category.id}
          category={category}
          channels={getChannelsForCategory(category.id)}
          activeChannelId={activeChannelId}
        />
      ))}
    </div>
  );
}
