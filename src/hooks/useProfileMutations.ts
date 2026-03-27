import { useMutation } from '@tanstack/react-query';
import { authService } from '../services';
import type { UserFull, UserSettings } from '../types';

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: Partial<Pick<UserFull, 'displayName' | 'resolvedAvatar'>>) =>
      authService.updateProfile(data),
  });
}

export function useUpdateSettings() {
  return useMutation({
    mutationFn: (settings: Partial<UserSettings>) =>
      authService.updateSettings(settings),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => authService.deleteAccount(),
  });
}
