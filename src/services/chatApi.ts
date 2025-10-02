import { api } from './api';

export const chatApi = {
  // Get user's chats
  getUserChats: (params?: { page?: number; limit?: number; type?: string }) => {
    return api.get('/api/v1/chats', { params });
  },

  // Create direct chat
  createDirectChat: (data: { participantId: string }) => {
    return api.post('/api/v1/chats/direct', data);
  },

  // Create group chat
  createGroupChat: (data: {
    name: string;
    description?: string;
    participantIds: string[];
    avatar?: string;
  }) => {
    return api.post('/api/v1/chats/group', data);
  },

  // Get chat messages
  getChatMessages: (chatId: string, params?: { page?: number; limit?: number; before?: string }) => {
    return api.get(`/api/v1/chats/${chatId}/messages`, { params });
  },

  // Send message
  sendMessage: (chatId: string, data: {
    content: string;
    type?: string;
    replyTo?: string;
    attachments?: any[];
    priority?: string;
  }) => {
    return api.post(`/api/v1/chats/${chatId}/messages`, data);
  },

  // Mark messages as read
  markMessagesAsRead: (chatId: string) => {
    return api.put(`/api/v1/chats/${chatId}/read`);
  },

  // Delete message
  deleteMessage: (messageId: string, reason?: string) => {
    return api.delete(`/api/v1/messages/${messageId}`, { data: { reason } });
  },

  // Edit message
  editMessage: (messageId: string, content: string) => {
    return api.put(`/api/v1/messages/${messageId}`, { content });
  },

  // Add reaction
  addReaction: (messageId: string, emoji: string) => {
    return api.post(`/api/v1/messages/${messageId}/reaction`, { emoji });
  },

  // Remove reaction
  removeReaction: (messageId: string) => {
    return api.delete(`/api/v1/messages/${messageId}/reaction`);
  },

  // Add participant to group
  addParticipant: (chatId: string, participantId: string) => {
    return api.post(`/api/v1/chats/${chatId}/participants`, { participantId });
  },

  // Remove participant from group
  removeParticipant: (chatId: string, participantId: string) => {
    return api.delete(`/api/v1/chats/${chatId}/participants/${participantId}`);
  },

  // Get unread count
  getUnreadCount: () => {
    return api.get('/api/v1/chats/unread-count');
  },

  // Get online users
  getOnlineUsers: () => {
    return api.get('/api/v1/chats/online-users');
  }
};
