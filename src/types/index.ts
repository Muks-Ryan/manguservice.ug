export type TechnicianStatus = 'Active' | 'Available' | 'Busy' | 'Inactive';

export interface Technician {
  id: string;
  name: string;
  trade: string;
  phone: string;
  email: string;
  town: string;
  hourlyRateUgx: number;
  bio: string;
  status: TechnicianStatus;
  createdAt: string;
  updatedAt: string;
}

export type TechnicianFormData = Omit<Technician, 'id' | 'createdAt' | 'updatedAt'>;

export interface FilterOptions {
  search: string;
  trade: string;
  town: string;
  status: string;
}

export type UserRole = 'admin' | 'technician' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  town?: string;
  technicianId?: string; // Links technician user to their technician record
}

export interface SystemSettings {
  platformName: string;
  contactEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  allowClientRegistration: boolean;
}

export type BookingStatus = 'Pending' | 'Accepted' | 'Declined' | 'Cancelled' | 'Completed';

export interface Booking {
  id: string;
  clientId: string;
  technicianId: string;
  clientName: string;
  technicianName: string;
  trade: string;
  town: string;
  serviceDescription: string;
  scheduledFor: string;
  estimatedHours: number;
  estimatedCostUgx: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}
