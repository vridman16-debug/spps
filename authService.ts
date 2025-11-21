import { User, Role } from '../types';
import { apiService } from './apiService';
import { localStorageUtil } from './localStorageUtil';
import { LOCAL_STORAGE_KEYS } from '../constants';

export const authService = {
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      const user = await apiService.login(username, password);
      if (user) {
        localStorageUtil.save(LOCAL_STORAGE_KEYS.CURRENT_USER_TOKEN, user.id); // Store only user ID (as token)
        return user;
      }
      return null;
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to be handled by UI
    }
  },

  logout: async (): Promise<void> => {
    await apiService.logout();
    localStorageUtil.remove(LOCAL_STORAGE_KEYS.CURRENT_USER_TOKEN);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const userId = localStorageUtil.load<string | null>(LOCAL_STORAGE_KEYS.CURRENT_USER_TOKEN, null);
    if (userId) {
      try {
        const user = await apiService.getAuthenticatedUser(); // Fetch user details from API
        return user;
      } catch (error) {
        console.error("Failed to fetch authenticated user:", error);
        localStorageUtil.remove(LOCAL_STORAGE_KEYS.CURRENT_USER_TOKEN); // Clear invalid token
        return null;
      }
    }
    return null;
  },

  getAllUsers: async (): Promise<User[]> => {
    return apiService.getAllUsers();
  },

  addUser: async (newUser: Omit<User, 'id'> & { password: string }): Promise<User> => {
    return apiService.addUser(newUser);
  },

  updateUser: async (updatedUser: User & { password?: string }): Promise<User | null> => {
    return apiService.updateUser(updatedUser);
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    return apiService.deleteUser(userId);
  },
};