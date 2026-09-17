import { createId, delay, isBlank } from '@/lib/utils';
import {
  MOCK_CATEGORIES,
  MOCK_CHANNEL_MESSAGES,
  MOCK_CHANNELS,
  MOCK_ROLES,
  MOCK_SERVER_MEMBERS,
  MOCK_SERVERS,
} from '@/services/mock/workspace-data';
import type {
  Attachment,
  Channel,
  ChannelCategory,
  ChannelMessage,
  Role,
  Server,
  ServerMember,
} from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkspaceView = 'home' | 'server';

interface WorkspaceState {
  servers: Server[];
  categories: ChannelCategory[];
  channels: Channel[];
  roles: Role[];
  members: ServerMember[];
  messages: ChannelMessage[];
  view: WorkspaceView;
  activeServerId: string | null;
  activeChannelId: string | null;
  memberListOpen: boolean;
  muted: boolean;
  deafened: boolean;
  stubToast: string | null;
  setViewHome: () => void;
  selectServer: (serverId: string) => void;
  selectChannel: (channelId: string) => void;
  toggleCategory: (categoryId: string) => void;
  toggleMemberList: () => void;
  setMemberListOpen: (open: boolean) => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  showStub: (label: string) => void;
  clearStub: () => void;
  getServer: (serverId: string) => Server | undefined;
  getChannel: (channelId: string) => Channel | undefined;
  getCategoriesForServer: (serverId: string) => ChannelCategory[];
  getChannelsForCategory: (categoryId: string) => Channel[];
  getRolesForServer: (serverId: string) => Role[];
  getMembersForServer: (serverId: string) => ServerMember[];
  getMessagesForChannel: (channelId: string) => ChannelMessage[];
  getPrimaryRoleColor: (serverId: string, roleIds: string[]) => string | undefined;
  sendChannelMessage: (input: {
    channelId: string;
    senderId: string;
    body: string;
    attachment?: Attachment;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  createServer: (input: {
    name: string;
    iconUrl?: string;
    iconLabel?: string;
  }) => string;
  updateServer: (
    serverId: string,
    input: { name?: string; iconUrl?: string; iconLabel?: string },
  ) => void;
  deleteServer: (serverId: string) => void;
  createChannel: (input: {
    categoryId: string;
    name: string;
  }) => { ok: true; channelId: string } | { ok: false; error: string };
  createCategory: (input: {
    serverId: string;
    name: string;
  }) => { ok: true; categoryId: string } | { ok: false; error: string };
  updateChannel: (
    channelId: string,
    input: { name?: string; topic?: string },
  ) => { ok: true } | { ok: false; error: string };
  deleteChannel: (channelId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      servers: MOCK_SERVERS,
      categories: MOCK_CATEGORIES,
      channels: MOCK_CHANNELS,
      roles: MOCK_ROLES,
      members: MOCK_SERVER_MEMBERS,
      messages: MOCK_CHANNEL_MESSAGES,
      view: 'server',
      activeServerId: 'server_aif',
      activeChannelId: 'ch_motc',
      memberListOpen: true,
      muted: false,
      deafened: false,
      stubToast: null,

      setViewHome: () => set({ view: 'home', activeServerId: null }),

      selectServer: (serverId) => {
        const firstCategory = get().categories.find((item) => item.serverId === serverId);
        const firstChannelId = firstCategory?.channelIds[0] ?? null;
        set({
          view: 'server',
          activeServerId: serverId,
          activeChannelId: firstChannelId,
          memberListOpen: true,
        });
      },

      selectChannel: (channelId) => {
        const channel = get().channels.find((item) => item.id === channelId);
        if (!channel) return;
        set({
          view: 'server',
          activeServerId: channel.serverId,
          activeChannelId: channelId,
          channels: get().channels.map((item) =>
            item.id === channelId ? { ...item, unreadCount: 0 } : item,
          ),
        });
      },

      toggleCategory: (categoryId) => {
        set({
          categories: get().categories.map((category) =>
            category.id === categoryId
              ? { ...category, collapsed: !(!!category.collapsed) }
              : category,
          ),
        });
      },

      toggleMemberList: () =>
        set((state) => ({ memberListOpen: !state.memberListOpen })),

      setMemberListOpen: (open) => set({ memberListOpen: open }),

      toggleMute: () => set((state) => ({ muted: !state.muted })),

      toggleDeafen: () =>
        set((state) => ({
          deafened: !state.deafened,
          muted: !state.deafened ? true : state.muted,
        })),

      showStub: (label) => {
        set({ stubToast: label });
        window.setTimeout(() => {
          if (get().stubToast === label) set({ stubToast: null });
        }, 2200);
      },

      clearStub: () => set({ stubToast: null }),

      getServer: (serverId) => get().servers.find((server) => server.id === serverId),

      getChannel: (channelId) =>
        get().channels.find((channel) => channel.id === channelId),

      getCategoriesForServer: (serverId) =>
        get().categories.filter((category) => category.serverId === serverId),

      getChannelsForCategory: (categoryId) => {
        const category = get().categories.find((item) => item.id === categoryId);
        if (!category) return [];
        return category.channelIds
          .map((id) => get().channels.find((channel) => channel.id === id))
          .filter((channel): channel is Channel => Boolean(channel));
      },

      getRolesForServer: (serverId) =>
        get()
          .roles.filter((role) => role.serverId === serverId)
          .sort((a, b) => b.position - a.position),

      getMembersForServer: (serverId) =>
        get().members.filter((member) => member.serverId === serverId),

      getMessagesForChannel: (channelId) =>
        get()
          .messages.filter((message) => message.channelId === channelId)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),

      getPrimaryRoleColor: (serverId, roleIds) => {
        const roles = get()
          .roles.filter(
            (role) => role.serverId === serverId && roleIds.includes(role.id),
          )
          .sort((a, b) => b.position - a.position);
        return roles[0]?.color;
      },

      sendChannelMessage: async ({ channelId, senderId, body, attachment }) => {
        const trimmed = body.trim();
        if (isBlank(trimmed) && !attachment) {
          return { ok: false, error: 'Message cannot be empty.' };
        }

        const tempId = createId('cmsg');
        const optimistic: ChannelMessage = {
          id: tempId,
          clientTempId: tempId,
          channelId,
          senderId,
          body: trimmed,
          createdAt: new Date().toISOString(),
          status: 'sending',
          attachment,
        };

        set((state) => ({ messages: [...state.messages, optimistic] }));
        await delay(280);
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === tempId
              ? { ...message, id: createId('cmsg'), status: 'sent' }
              : message,
          ),
        }));
        return { ok: true };
      },

      createServer: ({ name, iconUrl, iconLabel }) => {
        const trimmed = name.trim();
        const id = createId('server');
        const categoryId = createId('cat');
        const channelId = createId('ch');
        const label =
          iconLabel?.trim() ||
          trimmed
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') ||
          'SV';
        const server: Server = {
          id,
          name: trimmed || 'New Server',
          iconUrl:
            iconUrl ||
            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(label)}&backgroundColor=16a34a`,
          iconLabel: label,
          categoryIds: [categoryId],
        };
        set((state) => ({
          servers: [...state.servers, server],
          categories: [
            ...state.categories,
            {
              id: categoryId,
              serverId: id,
              name: 'Text Channels',
              channelIds: [channelId],
              collapsed: false,
            },
          ],
          channels: [
            ...state.channels,
            {
              id: channelId,
              serverId: id,
              name: 'general',
              type: 'text',
            },
          ],
          view: 'server',
          activeServerId: id,
          activeChannelId: channelId,
        }));
        return id;
      },

      updateServer: (serverId, input) => {
        set((state) => ({
          servers: state.servers.map((server) =>
            server.id === serverId
              ? {
                  ...server,
                  name: input.name?.trim() || server.name,
                  iconUrl: input.iconUrl ?? server.iconUrl,
                  iconLabel: input.iconLabel ?? server.iconLabel,
                }
              : server,
          ),
        }));
      },

      deleteServer: (serverId) => {
        set((state) => {
          const remainingServers = state.servers.filter((server) => server.id !== serverId);
          const channelIds = state.channels
            .filter((channel) => channel.serverId === serverId)
            .map((channel) => channel.id);
          const wasActive = state.activeServerId === serverId;
          const nextServer = remainingServers[0] ?? null;
          const nextCategory = nextServer
            ? state.categories.find((category) => category.serverId === nextServer.id)
            : undefined;
          const nextChannelId = nextCategory?.channelIds[0] ?? null;

          return {
            servers: remainingServers,
            categories: state.categories.filter((category) => category.serverId !== serverId),
            channels: state.channels.filter((channel) => channel.serverId !== serverId),
            roles: state.roles.filter((role) => role.serverId !== serverId),
            members: state.members.filter((member) => member.serverId !== serverId),
            messages: state.messages.filter(
              (message) => !channelIds.includes(message.channelId),
            ),
            view: wasActive ? (nextServer ? 'server' : 'home') : state.view,
            activeServerId: wasActive ? nextServer?.id ?? null : state.activeServerId,
            activeChannelId: wasActive ? nextChannelId : state.activeChannelId,
          };
        });
      },

      createCategory: ({ serverId, name }) => {
        const trimmed = name.trim();
        if (!trimmed) {
          return { ok: false, error: 'Enter a valid category name.' };
        }

        const categoryId = createId('cat');
        set((state) => ({
          categories: [
            ...state.categories,
            {
              id: categoryId,
              serverId,
              name: trimmed,
              channelIds: [],
              collapsed: false,
            },
          ],
        }));

        return { ok: true, categoryId };
      },

      createChannel: ({ categoryId, name }) => {
        const category = get().categories.find((item) => item.id === categoryId);
        if (!category) {
          return { ok: false, error: 'Category not found.' };
        }

        const slug = name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\u0e80-\u0eff\-_+.!~*']/gi, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');

        if (!slug || slug.length < 1) {
          return { ok: false, error: 'Enter a valid channel name.' };
        }

        const exists = get().channels.some(
          (channel) =>
            channel.serverId === category.serverId && channel.name === slug,
        );
        if (exists) {
          return { ok: false, error: 'A channel with this name already exists.' };
        }

        const channelId = createId('ch');
        const channel: Channel = {
          id: channelId,
          serverId: category.serverId,
          name: slug,
          type: 'text',
        };

        set((state) => ({
          channels: [...state.channels, channel],
          categories: state.categories.map((item) =>
            item.id === categoryId
              ? {
                  ...item,
                  collapsed: false,
                  channelIds: [...item.channelIds, channelId],
                }
              : item,
          ),
          view: 'server',
          activeServerId: category.serverId,
          activeChannelId: channelId,
        }));

        return { ok: true, channelId };
      },

      updateChannel: (channelId, { name, topic }) => {
        const existing = get().channels.find((ch) => ch.id === channelId);
        if (!existing) return { ok: false, error: 'Channel not found.' };

        let slug = existing.name;
        if (name !== undefined) {
          slug = name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\u0e80-\u0eff\-_+.!~*']/gi, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
          if (!slug) return { ok: false, error: 'Enter a valid channel name.' };
          const duplicate = get().channels.some(
            (ch) => ch.serverId === existing.serverId && ch.name === slug && ch.id !== channelId,
          );
          if (duplicate) return { ok: false, error: 'A channel with this name already exists.' };
        }

        set((state) => ({
          channels: state.channels.map((ch) =>
            ch.id === channelId
              ? { ...ch, name: slug, topic: topic !== undefined ? topic : ch.topic }
              : ch,
          ),
        }));
        return { ok: true };
      },

      deleteChannel: (channelId) => {
        const wasActive = get().activeChannelId === channelId;
        set((state) => {
          const remaining = state.channels.filter((ch) => ch.id !== channelId);
          const categories = state.categories.map((cat) => ({
            ...cat,
            channelIds: cat.channelIds.filter((id) => id !== channelId),
          }));
          // If the deleted channel was active, switch to the first available channel
          let activeChannelId = state.activeChannelId;
          if (wasActive) {
            activeChannelId = remaining.find((ch) => ch.serverId === state.activeServerId)?.id ?? null;
          }
          return { channels: remaining, categories, activeChannelId };
        });
      },
    }),
    {
      name: 'org-live-workspace',
      partialize: (state) => ({
        servers: state.servers,
        categories: state.categories,
        channels: state.channels,
        messages: state.messages,
        members: state.members,
        roles: state.roles,
        view: state.view,
        activeServerId: state.activeServerId,
        activeChannelId: state.activeChannelId,
        memberListOpen: state.memberListOpen,
        muted: state.muted,
        deafened: state.deafened,
      }),
    },
  ),
);
