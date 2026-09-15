import { Technician, TechnicianFormData, FilterOptions } from '../types';

// These shared options keep the form and directory filters aligned.
export const TRADES = [
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Appliance Repair',
  'ICT & Computers',
  'Auto Mechanics',
  'Masonry',
  'Painting',
] as const;

export const TOWNS = ['Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu', 'Masaka'] as const;
export const STATUSES = ['Active', 'Available', 'Busy', 'Inactive'] as const;

type TechnicianResponse = { technician: Technician };
type TechniciansResponse = { technicians: Technician[] };
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// A helper function to make requests to the Express API with JSON and cookies.
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Technician request failed.');
  return body as T;
}

export const technicianService = {
  // Read the directory from PostgreSQL through the Express API.
  async getAll(filters?: Partial<FilterOptions>): Promise<Technician[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('search', filters.search);
    if (filters?.trade && filters.trade !== 'ALL') params.set('trade', filters.trade);
    if (filters?.town && filters.town !== 'ALL') params.set('town', filters.town);
    if (filters?.status && filters.status !== 'ALL') params.set('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const result = await request<TechniciansResponse>(`/api/technicians${query}`);
    return result.technicians;
  },

  // Read one directory record by its database ID.
  async getById(id: string): Promise<Technician | null> {
    try {
      const result = await request<TechnicianResponse>(`/api/technicians/${id}`);
      return result.technician;
    } catch (error: any) {
      if (error.message === 'Technician not found.') return null;
      throw error;
    }
  },

  // Create a technician through the admin-protected API endpoint.
  async create(data: TechnicianFormData): Promise<Technician> {
    const result = await request<TechnicianResponse>('/api/technicians', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.technician;
  },

  // Update a technician; Express enforces admin or ownership permissions.
  async update(id: string, data: Partial<TechnicianFormData>): Promise<Technician> {
    const result = await request<TechnicianResponse>(`/api/technicians/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return result.technician;
  },

  // Delete a technician through the admin-protected API endpoint.
  async delete(id: string): Promise<boolean> {
    await request<void>(`/api/technicians/${id}`, { method: 'DELETE' });
    return true;
  },

  // Reset is intentionally disabled until a reviewed server-side seed endpoint exists.
  async resetToDefaults(): Promise<Technician[]> {
    throw new Error('Resetting production database records is not available through the API.');
  },
};
