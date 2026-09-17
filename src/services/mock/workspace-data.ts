import type {
  Channel,
  ChannelCategory,
  ChannelMessage,
  Role,
  Server,
  ServerMember,
  User,
} from '@/types';
import { MOCK_USERS } from '@/services/mock/data';

export const WORKSPACE_EXTRA_USERS: User[] = [
  {
    id: 'user_nuts',
    fullName: 'NUTS',
    email: 'nuts@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Nuts',
    provider: 'email',
    emailVerified: true,
    createdAt: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'user_jack',
    fullName: 'Jack',
    email: 'jack@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jack',
    provider: 'email',
    emailVerified: true,
    createdAt: '2026-02-02T08:00:00.000Z',
  },
  {
    id: 'user_see',
    fullName: 'MisterSee VANG',
    email: 'see@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=See',
    provider: 'google',
    emailVerified: true,
    createdAt: '2026-02-03T08:00:00.000Z',
  },
  {
    id: 'bot_green',
    fullName: 'Green-bot',
    email: 'green-bot@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/bottts/svg?seed=Green',
    provider: 'email',
    emailVerified: true,
    createdAt: '2026-02-04T08:00:00.000Z',
  },
  {
    id: 'bot_lara',
    fullName: 'Lara',
    email: 'lara@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/bottts/svg?seed=Lara',
    provider: 'email',
    emailVerified: true,
    createdAt: '2026-02-05T08:00:00.000Z',
  },
  {
    id: 'bot_todo',
    fullName: 'To-do Bot',
    email: 'todo@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/bottts/svg?seed=Todo',
    provider: 'email',
    emailVerified: true,
    createdAt: '2026-02-06T08:00:00.000Z',
  },
];

export const ALL_WORKSPACE_USERS: User[] = [...MOCK_USERS, ...WORKSPACE_EXTRA_USERS];

export const MOCK_SERVERS: Server[] = [
  {
    id: 'server_aif',
    name: 'AIF GROUP',
    iconUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=AiF&backgroundColor=2563eb',
    iconLabel: 'AiF',
    unread: true,
    categoryIds: ['cat_main', 'cat_projects'],
  },
  {
    id: 'server_org',
    name: 'Org Live',
    iconUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=OL&backgroundColor=7c3aed',
    iconLabel: 'OL',
    categoryIds: ['cat_org_general'],
  },
];

export const MOCK_ROLES: Role[] = [
  {
    id: 'role_fe',
    serverId: 'server_aif',
    name: 'Front-End Developer',
    color: '#57F287',
    position: 2,
  },
  {
    id: 'role_be',
    serverId: 'server_aif',
    name: 'Back-End Developer',
    color: '#5865F2',
    position: 1,
  },
  {
    id: 'role_member',
    serverId: 'server_org',
    name: 'Member',
    color: '#2563EB',
    position: 1,
  },
];

export const MOCK_CHANNELS: Channel[] = [
  {
    id: 'ch_aif_group',
    serverId: 'server_aif',
    name: 'aif-group',
    type: 'text',
    topic: 'General AIF discussion',
  },
  {
    id: 'ch_hi',
    serverId: 'server_aif',
    name: '👋-ໄຊ້ສູງລະ',
    type: 'text',
  },
  {
    id: 'ch_team',
    serverId: 'server_aif',
    name: '🚀-team-sharing',
    type: 'text',
    unreadCount: 3,
  },
  {
    id: 'ch_odoo',
    serverId: 'server_aif',
    name: 'aif-odoo',
    type: 'text',
  },
  {
    id: 'ch_motc',
    serverId: 'server_aif',
    name: 'motc-1percent',
    type: 'text',
    topic: '1% MOTC project channel',
  },
  {
    id: 'ch_design',
    serverId: 'server_aif',
    name: 'design-wip',
    type: 'text',
  },
  {
    id: 'ch_org_general',
    serverId: 'server_org',
    name: 'general',
    type: 'text',
  },
  {
    id: 'ch_org_product',
    serverId: 'server_org',
    name: 'product',
    type: 'text',
  },
];

export const MOCK_CATEGORIES: ChannelCategory[] = [
  {
    id: 'cat_main',
    serverId: 'server_aif',
    name: 'AIF GROUP',
    channelIds: ['ch_aif_group', 'ch_hi', 'ch_team', 'ch_odoo'],
    collapsed: false,
  },
  {
    id: 'cat_projects',
    serverId: 'server_aif',
    name: '🔥 AIF Projects [In Progress]',
    channelIds: ['ch_motc', 'ch_design'],
    collapsed: false,
  },
  {
    id: 'cat_org_general',
    serverId: 'server_org',
    name: 'Text Channels',
    channelIds: ['ch_org_general', 'ch_org_product'],
    collapsed: false,
  },
];

export const MOCK_SERVER_MEMBERS: ServerMember[] = [
  {
    userId: 'user_see',
    serverId: 'server_aif',
    roleIds: ['role_fe'],
    status: 'online',
  },
  {
    userId: 'user_alex',
    serverId: 'server_aif',
    roleIds: ['role_fe'],
    status: 'online',
  },
  {
    userId: 'user_maya',
    serverId: 'server_aif',
    roleIds: ['role_be'],
    status: 'online',
  },
  {
    userId: 'user_sam',
    serverId: 'server_aif',
    roleIds: ['role_be'],
    status: 'online',
  },
  {
    userId: 'user_jordan',
    serverId: 'server_aif',
    roleIds: ['role_be'],
    status: 'idle',
  },
  {
    userId: 'user_nuts',
    serverId: 'server_aif',
    roleIds: [],
    status: 'online',
  },
  {
    userId: 'user_jack',
    serverId: 'server_aif',
    roleIds: [],
    status: 'online',
  },
  {
    userId: 'user_priya',
    serverId: 'server_aif',
    roleIds: [],
    status: 'offline',
  },
  {
    userId: 'bot_green',
    serverId: 'server_aif',
    roleIds: [],
    status: 'online',
    isBot: true,
  },
  {
    userId: 'bot_lara',
    serverId: 'server_aif',
    roleIds: [],
    status: 'online',
    isBot: true,
  },
  {
    userId: 'bot_todo',
    serverId: 'server_aif',
    roleIds: [],
    status: 'online',
    isBot: true,
  },
  {
    userId: 'user_alex',
    serverId: 'server_org',
    roleIds: ['role_member'],
    status: 'online',
  },
  {
    userId: 'user_maya',
    serverId: 'server_org',
    roleIds: ['role_member'],
    status: 'offline',
  },
];

export const MOCK_CHANNEL_MESSAGES: ChannelMessage[] = [
  {
    id: 'cmsg_1',
    channelId: 'ch_motc',
    senderId: 'user_nuts',
    body: 'Draft overview for the 1% MOTC kickoff — please review.',
    createdAt: '2026-09-10T09:12:00.000Z',
    status: 'sent',
    attachment: {
      id: 'att_pdf_1',
      name: 'Draft1 Overview 1%MOTC.pdf',
      type: 'application/pdf',
      size: 130560,
      url: '#',
    },
  },
  {
    id: 'cmsg_2',
    channelId: 'ch_motc',
    senderId: 'user_nuts',
    body: 'Also sharing the first mockup doc.',
    createdAt: '2026-09-10T09:14:00.000Z',
    status: 'sent',
    attachment: {
      id: 'att_docx_1',
      name: '1% MOTC_ 1st Mockup.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 260342,
      url: '#',
    },
  },
  {
    id: 'cmsg_3',
    channelId: 'ch_motc',
    senderId: 'user_jack',
    body: 'Reference photo from the workshop:',
    createdAt: '2026-09-10T10:05:00.000Z',
    status: 'sent',
    attachment: {
      id: 'att_img_1',
      name: 'workshop.jpg',
      type: 'image/jpeg',
      size: 245000,
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640&h=400&fit=crop',
    },
  },
  {
    id: 'cmsg_4',
    channelId: 'ch_motc',
    senderId: 'user_alex',
    body: 'Looks good — I will sync the frontend empty states with this mockup today.',
    createdAt: '2026-09-10T11:20:00.000Z',
    status: 'sent',
  },
  {
    id: 'cmsg_5',
    channelId: 'ch_team',
    senderId: 'user_maya',
    body: 'Standup notes are in the shared folder.',
    createdAt: '2026-09-12T08:00:00.000Z',
    status: 'sent',
  },
  {
    id: 'cmsg_6',
    channelId: 'ch_org_general',
    senderId: 'user_alex',
    body: 'Welcome to Org Live workspace!',
    createdAt: '2026-09-01T10:00:00.000Z',
    status: 'sent',
  },
];
