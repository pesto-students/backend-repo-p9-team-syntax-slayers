export interface CreateService {
  name: string;
  description: string;
  price: number;
  duration: number;
  is_active?: number;
  featured: number;
  salon_id: string;
  treatment_tags: string[];
}
