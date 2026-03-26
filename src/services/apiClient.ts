// =============================================================================
// SplitBliz — Axios base client
// Source: API Contract v1.7
// - Auth: Authorization: Bearer <jwt> header
// - Every request gets X-Request-Id header
// - Error shape: { error: { code, message, action, details } }
// =============================================================================

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/v1';

// Token storage key — stored in memory for the session.
// On app start, restore from sessionStorage (NOT localStorage per Core Spec §2.4).
const TOKEN_KEY = 'sb_access_token';

export const tokenStore = {
  get: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string): void => sessionStorage.setItem(TOKEN_KEY, token),
  clear: (): void => sessionStorage.removeItem(TOKEN_KEY),
};

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — attach Bearer token and X-Request-Id
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    config.headers['X-Request-Id'] = uuidv4();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize errors, handle 401 globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Session expired — clear token and redirect to login
      tokenStore.clear();
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

/**
 * Extract the typed ApiError from an axios error.
 * Use this in catch blocks inside service files.
 */
export function extractApiError(error: unknown): ApiError['error'] | null {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    return error.response.data.error;
  }
  return null;
}

/**
 * Generate a UUID v4 for use as Idempotency-Key.
 * Required on: POST /expenses, POST /settlements
 */
export function generateIdempotencyKey(): string {
  return uuidv4();
}

export default apiClient;
