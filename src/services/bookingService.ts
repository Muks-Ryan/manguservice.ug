import { Booking, BookingStatus } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Booking request failed.');
  return body as T;
}

export const bookingService = {
  async getAll(): Promise<Booking[]> {
    const result = await request<{ bookings: Booking[] }>('/api/bookings');
    return result.bookings;
  },

  async create(data: { technicianId: string; serviceDescription: string; scheduledFor: string; estimatedHours: number }): Promise<Booking> {
    const result = await request<{ booking: Booking }>('/api/bookings', { method: 'POST', body: JSON.stringify(data) });
    return result.booking;
  },

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const result = await request<{ booking: Booking }>(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return result.booking;
  },
};