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
  distance: number;
  openingSoon?: boolean;
  closingSoon?: boolean;
}