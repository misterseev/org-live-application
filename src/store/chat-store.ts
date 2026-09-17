import { MESSAGE_MAX_LENGTH } from '@/constants/app';
import { createId, delay, isBlank } from '@/lib/utils';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '@/services/mock/data';
import type { Attachment, ChatMessage, Conversation } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  conversations: Conversation[];
  messages: ChatMessage[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  ensureConversation: (
    currentUserId: string,
    friendUserId: string,
  ) => string;
  markConversationReadOnly: (
    currentUserId: string,
    friendUserId: string,
    reason: 'removed' | 'blocked',
  ) => void;
  getConversationsForUser: (userId: string) => Conversation[];
  getMessages: (conversationId: string, limit?: number, before?: string) => ChatMessage[];
  getTotalUnread: (userId: string) => number;
  sendMessage: (input: {
    conversationId: string;
    senderId: string;
    body: string;
    attachment?: Attachment;
  }) => Promise<{ ok: true; message: ChatMessage } | { ok: false; error: string }>;
  retryMessage: (tempId: string) => Promise<void>;
  markAsRead: (conversationId: string, userId: string) => void;
  setTyping: (conversationId: string, userId: string | null) => void;
  simulateIncomingReply: (conversationId: string, fromUserId: string) => void;
}

function conversationKey(a: string, b: string): string {
  return [a, b].sort().join(':');
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: MOCK_CONVERSATIONS,
      messages: MOCK_MESSAGES,
      activeConversationId: null,

      setActiveConversationId: (id) => set({ activeConversationId: id }),

      getConversationsForUser: (userId) =>
        get()
          .conversations.filter((conversation) =>
            conversation.participantIds.includes(userId),
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime(),
          ),

      getMessages: (conversationId, limit = 40, before) => {
        const all = get()
          .messages.filter((message) => message.conversationId === conversationId)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );

        if (!before) return all.slice(-limit);

        const index = all.findIndex((message) => message.id === before);
        if (index <= 0) return [];
        return all.slice(Math.max(0, index - limit), index);
      },

      getTotalUnread: (userId) =>
        get().conversations.reduce(
          (total, conversation) => total + (conversation.unreadByUserId[userId] ?? 0),
          0,
        ),

      ensureConversation: (currentUserId, friendUserId) => {
        const existing = get().conversations.find(
          (conversation) =>
            conversationKey(conversation.participantIds[0], conversation.participantIds[1]) ===
            conversationKey(currentUserId, friendUserId),
        );
        if (existing) {
          if (existing.isReadOnly) {
            set((state) => ({
              conversations: state.conversations.map((conversation) =>
                conversation.id === existing.id
                  ? { ...conversation, isReadOnly: false, readOnlyReason: undefined }
                  : conversation,
              ),
            }));
          }
          return existing.id;
        }

        const conversation: Conversation = {
          id: createId('conv'),
          participantIds: [currentUserId, friendUserId],
          lastMessageAt: new Date().toISOString(),
          lastMessagePreview: 'Say hello',
          unreadByUserId: { [currentUserId]: 0, [friendUserId]: 0 },
        };

        set((state) => ({
          conversations: [conversation, ...state.conversations],
        }));
        return conversation.id;
      },

      markConversationReadOnly: (currentUserId, friendUserId, reason) => {
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversationKey(conversation.participantIds[0], conversation.participantIds[1]) ===
            conversationKey(currentUserId, friendUserId)
              ? { ...conversation, isReadOnly: true, readOnlyReason: reason }
              : conversation,
          ),
        }));
      },

      sendMessage: async ({ conversationId, senderId, body, attachment }) => {
        const trimmed = body.trim();
        if (isBlank(trimmed) && !attachment) {
          return { ok: false, error: 'Message cannot be empty.' };
        }
        if (trimmed.length > MESSAGE_MAX_LENGTH) {
          return {
            ok: false,
            error: `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`,
          };
        }

        const conversation = get().conversations.find(
          (item) => item.id === conversationId,
        );
        if (!conversation) {
          return { ok: false, error: 'Conversation not found.' };
        }
        if (conversation.isReadOnly) {
          return { ok: false, error: 'This conversation is read-only.' };
        }

        const tempId = createId('temp');
        const optimistic: ChatMessage = {
          id: tempId,
          clientTempId: tempId,
          conversationId,
          senderId,
          body: trimmed,
          createdAt: new Date().toISOString(),
          status: 'sending',
          attachment,
        };

        set((state) => ({
          messages: [...state.messages, optimistic],
          conversations: state.conversations.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  lastMessageAt: optimistic.createdAt,
                  lastMessagePreview: trimmed || attachment?.name || 'Attachment',
                  typingUserId: null,
                }
              : item,
          ),
        }));

        try {
          await delay(350);
          const confirmedId = createId('msg');
          set((state) => ({
            messages: state.messages.map((message) =>
              message.id === tempId
                ? { ...message, id: confirmedId, status: 'sent' }
                : message,
            ),
          }));

          // Mock delivery + read progression for demo
          window.setTimeout(() => {
            set((state) => ({
              messages: state.messages.map((message) =>
                message.id === confirmedId
                  ? { ...message, status: 'delivered' }
                  : message,
              ),
            }));
          }, 700);

          window.setTimeout(() => {
            set((state) => ({
              messages: state.messages.map((message) =>
                message.id === confirmedId ? { ...message, status: 'read' } : message,
              ),
            }));
          }, 1600);

          const recipientId = conversation.participantIds.find((id) => id !== senderId);
          if (recipientId) {
            set((state) => ({
              conversations: state.conversations.map((item) =>
                item.id === conversationId
                  ? {
                      ...item,
                      unreadByUserId: {
                        ...item.unreadByUserId,
                        [recipientId]: (item.unreadByUserId[recipientId] ?? 0) + 1,
                      },
                    }
                  : item,
              ),
            }));

            // Simulate peer typing + reply for demo liveliness
            window.setTimeout(() => {
              get().setTyping(conversationId, recipientId);
            }, 900);
            window.setTimeout(() => {
              get().setTyping(conversationId, null);
              get().simulateIncomingReply(conversationId, recipientId);
            }, 2200);
          }

          const message = get().messages.find((item) => item.id === confirmedId)!;
          return { ok: true, message };
        } catch {
          set((state) => ({
            messages: state.messages.map((message) =>
              message.id === tempId ? { ...message, status: 'failed' } : message,
            ),
          }));
          return { ok: false, error: 'Failed to send message.' };
        }
      },

      retryMessage: async (tempId) => {
        const failed = get().messages.find((message) => message.id === tempId);
        if (!failed) return;
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== tempId),
        }));
        await get().sendMessage({
          conversationId: failed.conversationId,
          senderId: failed.senderId,
          body: failed.body,
          attachment: failed.attachment,
        });
      },

      markAsRead: (conversationId, userId) => {
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  unreadByUserId: {
                    ...conversation.unreadByUserId,
                    [userId]: 0,
                  },
                }
              : conversation,
          ),
          messages: state.messages.map((message) =>
            message.conversationId === conversationId &&
            message.senderId !== userId &&
            message.status !== 'read'
              ? { ...message, status: 'read' }
              : message,
          ),
        }));
      },

      setTyping: (conversationId, userId) => {
        set((state) => ({
          conversations: state.conversations.map((conversation) =>
            conversation.id === conversationId
              ? { ...conversation, typingUserId: userId }
              : conversation,
          ),
        }));
      },

      simulateIncomingReply: (conversationId, fromUserId) => {
        const replies = [
          'Got it — thanks!',
          'Sounds good 👍',
          'I am on it.',
          'Can we sync later today?',
        ];
        const body = replies[Math.floor(Math.random() * replies.length)]!;
        const message: ChatMessage = {
          id: createId('msg'),
          conversationId,
          senderId: fromUserId,
          body,
          createdAt: new Date().toISOString(),
          status: 'delivered',
        };

        set((state) => {
          const activeId = state.activeConversationId;
          return {
            messages: [...state.messages, message],
            conversations: state.conversations.map((conversation) => {
              if (conversation.id !== conversationId) return conversation;
              const otherId = conversation.participantIds.find((id) => id !== fromUserId);
              const shouldIncrement =
                otherId && activeId !== conversationId
                  ? (conversation.unreadByUserId[otherId] ?? 0) + 1
                  : otherId
                    ? conversation.unreadByUserId[otherId] ?? 0
                    : 0;
              return {
                ...conversation,
                lastMessageAt: message.createdAt,
                lastMessagePreview: body,
                unreadByUserId: otherId
                  ? {
                      ...conversation.unreadByUserId,
                      [otherId]: shouldIncrement,
                    }
                  : conversation.unreadByUserId,
              };
            }),
          };
        });
      },
    }),
    {
      name: 'org-live-chat',
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
      }),
    },
  ),
);
