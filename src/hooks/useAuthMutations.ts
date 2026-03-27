import { useMutation } from '@tanstack/react-query';
import { authService } from '../services';
import type { LoginRequest, RegisterRequest, UserFull } from '../types';

export function useLoginEmail() {
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.loginEmail(data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => authService.logout(),
  });
}
