import { createId, delay } from '@/lib/utils';
import {
  MOCK_FRIEND_REQUESTS,
  MOCK_FRIENDSHIPS,
} from '@/services/mock/data';
import type {
  FriendRequest,
  Friendship,
  RelationshipStatus,
} from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FriendsState {
  friendships: Friendship[];
  requests: FriendRequest[];
  getRelationship: (currentUserId: string, otherUserId: string) => RelationshipStatus;
  getFriendsOf: (userId: string) => string[];
  getIncoming: (userId: string) => FriendRequest[];
  getOutgoing: (userId: string) => FriendRequest[];
  sendRequest: (
    fromUserId: string,
    toUserId: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  cancelRequest: (requestId: string, userId: string) => Promise<void>;
  acceptRequest: (requestId: string, userId: string) => Promise<{ friendshipId: string; otherUserId: string } | null>;
  declineRequest: (requestId: string, userId: string) => Promise<void>;
  removeFriend: (currentUserId: string, friendUserId: string) => Promise<void>;
  blockUser: (currentUserId: string, otherUserId: string) => Promise<void>;
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join(':');
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      friendships: MOCK_FRIENDSHIPS,
      requests: MOCK_FRIEND_REQUESTS,

      getFriendsOf: (userId) =>
        get()
          .friendships.filter(
            (friendship) =>
              friendship.userIds.includes(userId) && !friendship.blockedByUserId,
          )
          .map((friendship) =>
            friendship.userIds[0] === userId
              ? friendship.userIds[1]
              : friendship.userIds[0],
          ),

      getIncoming: (userId) =>
        get().requests.filter(
          (request) => request.toUserId === userId && request.status === 'pending',
        ),

      getOutgoing: (userId) =>
        get().requests.filter(
          (request) => request.fromUserId === userId && request.status === 'pending',
        ),

      getRelationship: (currentUserId, otherUserId) => {
        if (currentUserId === otherUserId) return 'none';

        const friendship = get().friendships.find(
          (item) => pairKey(item.userIds[0], item.userIds[1]) === pairKey(currentUserId, otherUserId),
        );
        if (friendship?.blockedByUserId) return 'blocked';
        if (friendship) return 'friends';

        const pending = get().requests.find(
          (request) =>
            request.status === 'pending' &&
            pairKey(request.fromUserId, request.toUserId) ===
              pairKey(currentUserId, otherUserId),
        );
        if (!pending) return 'none';
        return pending.fromUserId === currentUserId
          ? 'pending_outgoing'
          : 'pending_incoming';
      },

      sendRequest: async (fromUserId, toUserId) => {
        await delay(300);
        if (fromUserId === toUserId) {
          return { ok: false, error: 'You cannot add yourself.' };
        }

        const status = get().getRelationship(fromUserId, toUserId);
        if (status === 'friends') {
          return { ok: false, error: 'You are already friends.' };
        }
        if (status === 'pending_outgoing' || status === 'pending_incoming') {
          return { ok: false, error: 'A friend request is already pending.' };
        }
        if (status === 'blocked') {
          return { ok: false, error: 'Unable to send friend request.' };
        }

        const request: FriendRequest = {
          id: createId('fr'),
          fromUserId,
          toUserId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ requests: [request, ...state.requests] }));
        return { ok: true };
      },

      cancelRequest: async (requestId, userId) => {
        await delay(200);
        set((state) => ({
          requests: state.requests.filter(
            (request) =>
              !(
                request.id === requestId &&
                request.fromUserId === userId &&
                request.status === 'pending'
              ),
          ),
        }));
      },

      acceptRequest: async (requestId, userId) => {
        await delay(250);
        const request = get().requests.find(
          (item) =>
            item.id === requestId &&
            item.toUserId === userId &&
            item.status === 'pending',
        );
        if (!request) return null;

        const friendship: Friendship = {
          id: createId('fs'),
          userIds: [request.fromUserId, request.toUserId],
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          requests: state.requests.map((item) =>
            item.id === requestId ? { ...item, status: 'accepted' } : item,
          ),
          friendships: [friendship, ...state.friendships],
        }));

        return { friendshipId: friendship.id, otherUserId: request.fromUserId };
      },

      declineRequest: async (requestId, userId) => {
        await delay(200);
        set((state) => ({
          requests: state.requests.map((item) =>
            item.id === requestId && item.toUserId === userId
              ? { ...item, status: 'declined' }
              : item,
          ),
        }));
      },

      removeFriend: async (currentUserId, friendUserId) => {
        await delay(250);
        set((state) => ({
          friendships: state.friendships.filter(
            (friendship) =>
              pairKey(friendship.userIds[0], friendship.userIds[1]) !==
              pairKey(currentUserId, friendUserId),
          ),
        }));
      },

      blockUser: async (currentUserId, otherUserId) => {
        await delay(250);
        set((state) => {
          const key = pairKey(currentUserId, otherUserId);
          const existing = state.friendships.find(
            (friendship) =>
              pairKey(friendship.userIds[0], friendship.userIds[1]) === key,
          );

          const friendships = existing
            ? state.friendships.map((friendship) =>
                pairKey(friendship.userIds[0], friendship.userIds[1]) === key
                  ? { ...friendship, blockedByUserId: currentUserId }
                  : friendship,
              )
            : [
                {
                  id: createId('fs'),
                  userIds: [currentUserId, otherUserId] as [string, string],
                  createdAt: new Date().toISOString(),
                  blockedByUserId: currentUserId,
                },
                ...state.friendships,
              ];

          return {
            friendships,
            requests: state.requests.filter(
              (request) =>
                pairKey(request.fromUserId, request.toUserId) !== key,
            ),
          };
        });
      },
    }),
    {
      name: 'org-live-friends',
      partialize: (state) => ({
        friendships: state.friendships,
        requests: state.requests,
      }),
    },
  ),
);
