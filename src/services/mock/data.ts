import type {
  ChatMessage,
  Conversation,
  FriendRequest,
  Friendship,
  User,
} from '@/types';

export const MOCK_USERS: User[] = [
  {
    id: 'user_alex',
    fullName: 'Alex Rivera',
    email: 'alex@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
    provider: 'email',
    emailVerified: true,
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'user_maya',
    fullName: 'Maya Chen',
    email: 'maya@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maya',
    provider: 'google',
    emailVerified: true,
    createdAt: '2026-01-12T08:00:00.000Z',
  },
  {
    id: 'user_sam',
    fullName: 'Sam Okonkwo',
    email: 'sam@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sam',
    provider: 'email',
    emailVerified: true,
    createdAt: '2026-01-14T08:00:00.000Z',
  },
  {
    id: 'user_jordan',
    fullName: 'Jordan Lee',
    email: 'jordan@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan',
    provider: 'email',
    emailVerified: true,
    createdAt: '2026-01-16T08:00:00.000Z',
  },
  {
    id: 'user_priya',
    fullName: 'Priya Nair',
    email: 'priya@orglive.com',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya',
    provider: 'google',
    emailVerified: true,
    createdAt: '2026-01-18T08:00:00.000Z',
  },
];

export const MOCK_PASSWORDS: Record<string, string> = {
  'alex@orglive.com': 'Password1',
  'sam@orglive.com': 'Password1',
  'jordan@orglive.com': 'Password1',
};

export const MOCK_FRIENDSHIPS: Friendship[] = [
  {
    id: 'fs_1',
    userIds: ['user_alex', 'user_maya'],
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'fs_2',
    userIds: ['user_alex', 'user_sam'],
    createdAt: '2026-02-03T10:00:00.000Z',
  },
];

export const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'fr_1',
    fromUserId: 'user_jordan',
    toUserId: 'user_alex',
    status: 'pending',
    createdAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'fr_2',
    fromUserId: 'user_alex',
    toUserId: 'user_priya',
    status: 'pending',
    createdAt: '2026-03-02T09:00:00.000Z',
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_alex_maya',
    participantIds: ['user_alex', 'user_maya'],
    lastMessageAt: '2026-03-10T14:30:00.000Z',
    lastMessagePreview: 'See you at standup!',
    unreadByUserId: { user_alex: 1, user_maya: 0 },
  },
  {
    id: 'conv_alex_sam',
    participantIds: ['user_alex', 'user_sam'],
    lastMessageAt: '2026-03-09T18:12:00.000Z',
    lastMessagePreview: 'Sending the designs tonight.',
    unreadByUserId: { user_alex: 0, user_sam: 0 },
  },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_alex_maya',
    senderId: 'user_maya',
    body: 'Hey Alex — ready for the product review?',
    createdAt: '2026-03-10T14:20:00.000Z',
    status: 'read',
  },
  {
    id: 'msg_2',
    conversationId: 'conv_alex_maya',
    senderId: 'user_alex',
    body: 'Almost! Finishing the messenger empty states.',
    createdAt: '2026-03-10T14:22:00.000Z',
    status: 'read',
  },
  {
    id: 'msg_3',
    conversationId: 'conv_alex_maya',
    senderId: 'user_maya',
    body: 'See you at standup!',
    createdAt: '2026-03-10T14:30:00.000Z',
    status: 'delivered',
  },
  {
    id: 'msg_4',
    conversationId: 'conv_alex_sam',
    senderId: 'user_sam',
    body: 'Can you review the landing hero copy?',
    createdAt: '2026-03-09T17:50:00.000Z',
    status: 'read',
  },
  {
    id: 'msg_5',
    conversationId: 'conv_alex_sam',
    senderId: 'user_alex',
    body: 'Sending the designs tonight.',
    createdAt: '2026-03-09T18:12:00.000Z',
    status: 'read',
  },
];
