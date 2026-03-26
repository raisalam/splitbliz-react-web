// =============================================================================
// SplitBliz — System service
// Endpoints: GET /system/config — called on app start, no auth required
// =============================================================================

import apiClient from './apiClient';
import { SystemConfig } from '../types';

export const systemService = {

  async getConfig(): Promise<SystemConfig> {
    const res = await apiClient.get<SystemConfig>('/system/config');
    return res.data;
  },
};
