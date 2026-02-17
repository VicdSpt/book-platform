import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      email, username, password
    });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email, password
    });
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  }
};