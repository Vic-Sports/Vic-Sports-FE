import { api } from './api';

export const userApi = {
  // Get all users (for group chat)
  getUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    return api.get('/api/v1/users', { params });
  },

  // Get user by ID
  getUser: (userId: string) => {
    return api.get(`/api/v1/users/${userId}`);
  },

  // Update user profile
  updateProfile: (data: any) => {
    return api.put('/api/v1/users/profile', data);
  },

  // Get user's friends
  getFriends: () => {
    return api.get('/api/v1/users/friends');
  },

  // Add friend
  addFriend: (userId: string) => {
    return api.post(`/api/v1/users/friends/${userId}`);
  },

  // Remove friend
  removeFriend: (userId: string) => {
    return api.delete(`/api/v1/users/friends/${userId}`);
  },

  // Block user
  blockUser: (userId: string) => {
    return api.post(`/api/v1/users/block/${userId}`);
  },

  // Unblock user
  unblockUser: (userId: string) => {
    return api.delete(`/api/v1/users/block/${userId}`);
  }
};
