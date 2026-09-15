export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  targetRole: 'client' | 'technician' | 'all';
  targetUserId?: string;
  eventType: 'appointment' | 'inspection' | 'maintenance' | 'system_alert' | 'deadline' | 'training';
  priority: 'high' | 'medium' | 'low';
  alertMessage: string;
  location?: string;
  createdBy: string;
  isRead?: boolean;
}

// Default Seed Calendar Events
const initialEvents: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: '⚡ Area Electrical Safety Inspection',
    description: 'Scheduled grid inspection and voltage check by certified engineers.',
    date: '2026-08-11', // Today
    time: '10:30',
    targetRole: 'client',
    eventType: 'inspection',
    priority: 'high',
    alertMessage: '🚨 Mandatory Inspection: Engineers will perform load testing at your property today at 10:30 AM. Please ensure main breaker access.',
    location: 'Ntinda / Kampala North',
    createdBy: 'System Administrator',
    isRead: false
  },
  {
    id: 'evt-2',
    title: '🔧 Quarterly HVAC & AC Maintenance',
    description: 'Filter replacement and gas level top-up for client booking #4892.',
    date: '2026-08-13',
    time: '14:00',
    targetRole: 'client',
    eventType: 'appointment',
    priority: 'medium',
    alertMessage: 'Reminder: Technician David Okello is assigned to service your AC unit on Thursday at 2:00 PM.',
    location: 'Residence, Plot 14 Bukoto St',
    createdBy: 'System Administrator',
    isRead: false
  },
  {
    id: 'evt-3',
    title: '💳 Monthly Service Subscription Renewal',
    description: 'Automated invoice generation for premium support package.',
    date: '2026-08-20',
    time: '09:00',
    targetRole: 'client',
    eventType: 'deadline',
    priority: 'low',
    alertMessage: 'Notification: Next billing cycle commences on August 20, 2026.',
    location: 'Online Billing',
    createdBy: 'System Administrator',
    isRead: true
  },
  {
    id: 'evt-4',
    title: '⚡ Regional Substation Power Maintenance',
    description: 'Scheduled grid repair. High voltage work requiring isolated safety gear.',
    date: '2026-08-11', // Today
    time: '11:00',
    targetRole: 'technician',
    eventType: 'maintenance',
    priority: 'high',
    alertMessage: '⚡ URGENT ALERT: Power outage planned in Kololo & Naguru sector today 11:00 AM - 1:00 PM. Carry battery power packs.',
    location: 'Kampala Central Sector 4',
    createdBy: 'System Administrator',
    isRead: false
  },
  {
    id: 'evt-5',
    title: '📋 Safety & Compliance Refresher Workshop',
    description: 'Mandatory online webinar on updated high-voltage electrical safety standards.',
    date: '2026-08-14',
    time: '08:30',
    targetRole: 'technician',
    eventType: 'training',
    priority: 'high',
    alertMessage: 'Mandatory Action: All certified technicians must attend the compliance webinar via Zoom at 8:30 AM.',
    location: 'Zoom Virtual Conference Room',
    createdBy: 'System Administrator',
    isRead: false
  },
  {
    id: 'evt-6',
    title: '🚗 Depot Equipment & Toolkit Audit',
    description: 'Physical inspection of diagnostic scanners, multi-meters, and safety harness kits.',
    date: '2026-08-18',
    time: '15:00',
    targetRole: 'technician',
    eventType: 'inspection',
    priority: 'medium',
    alertMessage: 'Notice: Bring all company-issued tools to Kampala Depot for annual calibration.',
    location: 'Mangu Service Main Depot, Industrial Area',
    createdBy: 'System Administrator',
    isRead: true
  },
  {
    id: 'evt-7',
    title: '📢 System-Wide Platform Upgrades',
    description: 'Server database optimization and real-time GPS tracking patch release.',
    date: '2026-08-25',
    time: '02:00',
    targetRole: 'all',
    eventType: 'system_alert',
    priority: 'medium',
    alertMessage: 'System Alert: Platform maintenance window scheduled overnight on August 25.',
    location: 'All Operational Zones',
    createdBy: 'System Administrator',
    isRead: false
  }
];

class CalendarService {
  private events: CalendarEvent[] = [...initialEvents];
  private listeners: (() => void)[] = [];

  constructor() {
    // Load from localStorage if present
    const saved = localStorage.getItem('mangu_calendar_events');
    if (saved) {
      try {
        this.events = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved calendar events', e);
      }
    }
  }

  private persist() {
    localStorage.setItem('mangu_calendar_events', JSON.stringify(this.events));
    this.notifyListeners();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }

  public getAllEvents(): CalendarEvent[] {
    return [...this.events];
  }

  public getEventsForRole(role: 'client' | 'technician' | 'admin', userId?: string): CalendarEvent[] {
    if (role === 'admin') return this.getAllEvents();
    return this.events.filter(e => {
      if (e.targetRole === 'all') return true;
      if (e.targetRole === role) {
        if (!e.targetUserId || !userId || e.targetUserId === userId) return true;
      }
      return false;
    });
  }

  public getActiveAlerts(role: 'client' | 'technician', userId?: string): CalendarEvent[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getEventsForRole(role, userId).filter(e => {
      // Alert active if event date is today or upcoming and marked high/medium priority and not read
      return e.date >= today && (e.priority === 'high' || e.priority === 'medium');
    });
  }

  public addEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt-${Date.now()}`
    };
    this.events.unshift(newEvent);
    this.persist();
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.events[idx] = { ...this.events[idx], ...updates };
    this.persist();
    return this.events[idx];
  }

  public deleteEvent(id: string): boolean {
    const initialLen = this.events.length;
    this.events = this.events.filter(e => e.id !== id);
    if (this.events.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  public markAsRead(id: string) {
    this.updateEvent(id, { isRead: true });
  }
}

export const calendarService = new CalendarService();
