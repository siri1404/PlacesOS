export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface ResourceType {
  id: number;
  name: string;
  description: string;
  bookable_window_days: number;
  max_booking_minutes: number;
}

export interface Resource {
  id: number;
  name: string;
  location: string;
  floor: string;
  capacity: number;
  status: string;
  metadata_json: Record<string, unknown>;
  resource_type_id: number;
  resource_type_name?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  resource_id: number;
  recurring_rule_id: number | null;
  starts_at: string;
  ends_at: string;
  purpose: string;
  status: string;
  booked_by?: string;
  resource_name?: string;
}

export interface AvailabilityGridItem {
  id: number;
  name: string;
  location: string;
  floor: string;
  capacity: number;
  status: string;
  available: boolean;
}
