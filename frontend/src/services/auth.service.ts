import api from './api.js';
import type { LoginRequest, LoginResponse, User } from '../types/index.js';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(email: string, password: string, roleId: string): Promise<User> {
    const response = await api.post<User>('/auth/register', { email, password, roleId });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
