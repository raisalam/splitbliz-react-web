// =============================================================================
// SplitBliz — Engagement service
// Bounded context: Engagement (Chat + Whiteboard)
// Endpoints: /groups/:id/messages, /groups/:id/whiteboard
// =============================================================================

import apiClient from './apiClient';
import {
  ChatMessage,
  WhiteboardItem,
  SendMessageRequest,
  PaginationResponse,
} from '../types';

export const engagementService = {

  // Chat
  async getMessages(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<{ messages: ChatMessage[]; pagination: PaginationResponse }> {
    const res = await apiClient.get(`/groups/${groupId}/messages`, { params });
    return res.data;
  },

  async sendMessage(groupId: string, data: SendMessageRequest): Promise<ChatMessage> {
    const res = await apiClient.post<{ message: ChatMessage }>(
      `/groups/${groupId}/messages`,
      data
    );
    return res.data.message;
  },

  // Whiteboard
  async getWhiteboardItems(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<{ items: WhiteboardItem[]; pagination: PaginationResponse }> {
    const res = await apiClient.get(`/groups/${groupId}/whiteboard`, { params });
    return res.data;
  },

  async createWhiteboardItem(
    groupId: string,
    data: { title: string; content?: string }
  ): Promise<WhiteboardItem> {
    const res = await apiClient.post<{ item: WhiteboardItem }>(
      `/groups/${groupId}/whiteboard`,
      data
    );
    return res.data.item;
  },

  async updateWhiteboardItem(
    groupId: string,
    itemId: string,
    data: { title?: string; content?: string }
  ): Promise<WhiteboardItem> {
    const res = await apiClient.patch<{ item: WhiteboardItem }>(
      `/groups/${groupId}/whiteboard/${itemId}`,
      data
    );
    return res.data.item;
  },

  async deleteWhiteboardItem(groupId: string, itemId: string): Promise<void> {
    await apiClient.delete(`/groups/${groupId}/whiteboard/${itemId}`);
  },
};
