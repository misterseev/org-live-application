export type AuthProvider = 'email' | 'google';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined';

export type RelationshipStatus =
  | 'none'
  | 'pending_outgoing'
  | 'pending_incoming'
  | 'friends'
  | 'blocked';

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  provider: AuthProvider;
  emailVerified: boolean;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface Friendship {
  id: string;
  userIds: [string, string];
  createdAt: string;
  blockedByUserId?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  status: MessageStatus;
  attachment?: Attachment;
  clientTempId?: string;
}

export interface Conversation {
  id: string;
  participantIds: [string, string];
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadByUserId: Record<string, number>;
  typingUserId?: string | null;
  isReadOnly?: boolean;
  readOnlyReason?: 'removed' | 'blocked';
}

export interface SupportMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  body: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed';
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export type PresenceStatus = 'online' | 'idle' | 'dnd' | 'offline';

export type ChannelType = 'text';

export interface Role {
  id: string;
  serverId: string;
  name: string;
  color: string;
  position: number;
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: ChannelType;
  topic?: string;
  unreadCount?: number;
}

export interface ChannelCategory {
  id: string;
  serverId: string;
  name: string;
  channelIds: string[];
  collapsed?: boolean;
}

export interface Server {
  id: string;
  name: string;
  iconUrl: string;
  iconLabel?: string;
  unread?: boolean;
  categoryIds: string[];
}

export interface ServerMember {
  userId: string;
  serverId: string;
  roleIds: string[];
  status: PresenceStatus;
  isBot?: boolean;
  displayName?: string;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  senderId: string;
  body: string;
  createdAt: string;
  status: MessageStatus;
  attachment?: Attachment;
  clientTempId?: string;
}
