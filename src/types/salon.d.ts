export interface longlat {
  lon: number;
  lat: number;
  radius?: number; // In Kms
}

export interface Location {
  type: string;
  coordinates: [number, number];
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  gender: 'male' | 'female' | 'unisex';
  temp_inactive: number;
  rating: number;
  rating_count: number;
  location: Location;
  distance?: number;
  openingSoon?: boolean;
  closingSoon?: boolean;
}

export interface SalonInput {
  name: string;
  address: string;
  description?: string;
  contact_number: string;
  gender: 'male' | 'female' | 'unisex';
  open_untill: Date;
  location: Point;
  open_from: Date;
  temp_inactive?: number;
  banner: string[];
  kyc_completed?: number;
  is_active?: number;
  services?: Service[];
  treatment_tags?: string[];
  city_id: string;
  user_id: string;
}
