// =============================================================================
// SplitBliz — Auth service
// Bounded context: Identity
// Endpoints: POST /auth/*, GET /auth/me, GET /users/me, PATCH /users/me
// =============================================================================

import apiClient, { tokenStore } from './apiClient';
import {
  UserFull,
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  FacebookAuthRequest,
  UserSettings,
  UserContact,
  ActionItemsPreview,
} from '../types';

export const authService = {

  async checkEmail(email: string): Promise<boolean> {
    const res = await apiClient.post<{ exists: boolean }>('/auth/checkEmail', { email });
    return res.data.exists;
  },

  async loginEmail(data: LoginRequest): Promise<UserFull> {
    const res = await apiClient.post<{ user: UserFull; accessToken: string }>(
      '/auth/login', data
    );
    tokenStore.set(res.data.accessToken);
    return res.data.user;
  },

  async register(data: RegisterRequest): Promise<UserFull> {
    const res = await apiClient.post<{ user: UserFull; accessToken: string }>(
      '/auth/register', data
    );
    tokenStore.set(res.data.accessToken);
    return res.data.user;
  },

  async loginGoogle(data: GoogleAuthRequest): Promise<UserFull> {
    const res = await apiClient.post<{ user: UserFull; accessToken: string }>(
      '/auth/google', data
    );
    tokenStore.set(res.data.accessToken);
    return res.data.user;
  },

  async loginFacebook(data: FacebookAuthRequest): Promise<UserFull> {
    const res = await apiClient.post<{ user: UserFull; accessToken: string }>(
      '/auth/facebook', data
    );
    tokenStore.set(res.data.accessToken);
    return res.data.user;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout').catch(() => {});
    tokenStore.clear();
  },

  async getMe(): Promise<UserFull> {
    const res = await apiClient.get<{ user: UserFull }>('/auth/me');
    return res.data.user;
  },

  async getProfile(): Promise<UserFull> {
    const res = await apiClient.get<UserFull>('/users/me');
    return res.data;
  },

  async updateProfile(data: Partial<Pick<UserFull, 'displayName' | 'resolvedAvatar'>>): Promise<UserFull> {
    const res = await apiClient.patch<UserFull>('/users/me', data);
    return res.data;
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserFull> {
    const res = await apiClient.patch<UserFull>('/users/me/settings', settings);
    return res.data;
  },

  async getContacts(): Promise<UserContact[]> {
    const res = await apiClient.get<{ contacts: UserContact[] }>('/users/me/contacts');
    return res.data.contacts;
  },

  async getActionItems(): Promise<ActionItemsPreview> {
    const res = await apiClient.get<ActionItemsPreview>('/users/me/action-items');
    return res.data;
  },

  async searchUsers(query: string): Promise<UserContact[]> {
    const res = await apiClient.get<{ users: UserContact[] }>('/users/search', {
      params: { q: query },
    });
    return res.data.users;
  },

  async deleteAccount(): Promise<void> {
    await apiClient.delete('/users/me');
    tokenStore.clear();
  },
};
