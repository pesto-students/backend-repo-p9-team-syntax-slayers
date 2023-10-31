import { Salon, SalonInput } from '../types/salon';

export const convertToSalonEntity = (salonInput: SalonInput): SalonInput => {
  return {
    ...salonInput,
    gender: salonInput.gender as 'male' | 'female' | 'unisex',
  };
};
