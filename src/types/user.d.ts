export interface BookedService {
  name: string;
  duration: number;
}

export interface UpcomingBooking {
  orderID: number;
  salonName: string;
  startTime: string;
  salonAddress: string;
  bookedServices: BookedService[];
}

export interface PastBooking {
  orderID: number;
  salonName: string;
  startTime: string;
  salonAddress: string;
  bookedServices: BookedService[];
}

export interface BookingData {
  upcomingBookings: UpcomingBooking[];
  pastBookings: PastBooking[];
}

export interface MyFavSalonData {
  salonName: string;
  salonAddress: string;
  openFrom: string;
  openTill: string;
  currentlyInactive: number;
  banner: null | string;
  rating: number;
  ratingCount: number;
}
