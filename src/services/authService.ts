// 
import { User, UserRole, SystemSettings } from '../types';

const SETTINGS_STORAGE_KEY = 'mangu_settings_v1';
let currentUser: User | null = null;
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

type AuthResponse = { user: User };
type PasswordResetResponse = { message: string; resetToken?: string };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Authentication request failed.');
  return body as T;
}

export const authService = {
  // Return the in-memory user while the HTTP-only cookie remains the source of session truth.
  getCurrentUser(): User | null {
    return currentUser;
  },

  // Restore the current user from the Express session cookie after a page reload.
  async hydrateCurrentUser(): Promise<User | null> {
    try {
      const result = await request<AuthResponse>('/api/auth/me');
      currentUser = result.user;
      return currentUser;
    } catch {
      currentUser = null;
      return null;
    }
  },

  // Authenticate against PostgreSQL through Express and enforce the requested portal role.
  async login(email: string, password: string, allowedRoles?: UserRole | UserRole[], rememberMe = false): Promise<User> {
    const result = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    });
    const roles = allowedRoles ? (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]) : undefined;
    if (roles && !roles.includes(result.user.role)) {
      await this.logout();
      if (roles.includes('admin')) {
        throw new Error('Access denied. This portal is strictly reserved for system administrators.');
      }
      throw new Error('Access denied. System administrators must log in through the separate Admin Portal.');
    }
    currentUser = result.user;
    return currentUser;
  },

  // Clear the server session cookie and local in-memory user state.
  async logout(): Promise<void> {
    await request<void>('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    currentUser = null;
  },

  // Register a client or technician atomically through the Express API.
  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole,
    phone?: string,
    town?: string,
    trade?: string
  ): Promise<User> {
    const result = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, phone, town, trade }),
    });
    currentUser = result.user;
    return currentUser;
  },

  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    return request<PasswordResetResponse>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await request<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  // Update the authenticated profile through Express and synchronize linked technician data.
  async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'phone' | 'town'>>): Promise<User> {
    if (!currentUser || currentUser.id !== userId) throw new Error('You can only update your own profile.');
    const result = await request<AuthResponse>('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    currentUser = result.user;
    return currentUser;
  },

  async getUsers(): Promise<User[]> {
    const result = await request<{ users: User[] }>('/api/auth/users');
    return result.users;
  },

  // Keep non-sensitive platform display settings local until a settings endpoint is added.
  getSettings(): SystemSettings {
    const fallback: SystemSettings = {
      platformName: 'Mangu Service UG',
      contactEmail: 'support@mangu.ug',
      supportPhone: '+256 700 100 000',
      defaultCurrency: 'UGX',
      allowClientRegistration: true,
    };
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    const updated = { ...this.getSettings(), ...settings };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

};
