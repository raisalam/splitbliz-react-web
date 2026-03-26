// =============================================================================
// SplitBliz — Activity service
// Bounded context: Activity
// Endpoints: /groups/:id/activity
// =============================================================================

import apiClient from './apiClient';
import { ActivityEntry, PaginationResponse } from '../types';

export const activityService = {

  async getActivity(
    groupId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<{ entries: ActivityEntry[]; pagination: PaginationResponse }> {
    const res = await apiClient.get(`/groups/${groupId}/activity`, { params });
    return res.data;
  },
};
