import { Request, Response } from 'express';

import { connectToPostgres, postgresConnection } from '../config/dbConfig';
import { User } from '../postgres/entity/User.entity';
import { Bookmarked } from '../postgres/entity/Bookmarked.entity';
import { BookingData, MyFavSalonData } from '../types/user';
import { Booking } from '../postgres/entity/Booking.entity';
import { BookingService } from '../postgres/entity/BookingService.entity';
import { TimeSlots } from '../postgres/entity/TimeSlot.entity';

interface bookingState {
  state: 'past' | 'upcoming';
  userID: string;
}

const bookingStates = Object.freeze({
  past: `and b.start_time at TIME zone 'IST' <= now() at TIME zone 'IST'`,
  upcoming: `and b.start_time at TIME zone 'IST' >= now() at TIME zone 'IST'`,
});

const myBookingsCommonQuery = async ({ state, userID }: bookingState) => {
  return `
  	  (
      select
        coalesce(jsonb_agg("${state}Bookings"), '[]')
      from
        (
        select
          b.id as "orderID",
          s."name" as "salonName",
          s.address as "salonAddress",
          s.banner ->> 0 as banner,
           to_char(b.start_time AT TIME ZONE 'IST', 'DDth Mon HH:MI AM') AS "startTime",
          (
          select
            jsonb_agg("bookedService")
          from
            (
            select
              s2."name",
              s2.duration
            from
              booking_service bs
            inner join service s2 on
              s2.id = bs.service_id
            where
              bs.booking_id = b.id
            order by
              s2.duration desc) as "bookedService" ) as "bookedServices"
        from
          booking b
        inner join salon s on
          s.id = b.salon_id
        where
          true
         ${userID ? `and b.user_id = '${userID}'` : ''}
         ${state === 'past' ? bookingStates.past : ''} 
         ${state === 'upcoming' ? bookingStates.upcoming : ''} 
                ) as "${state}Bookings" ) as "${state}Bookings"
  `;
};

const myBookingsService = async (req: Request): Promise<BookingData> => {
  const { payload } = req.body;
  const { userId } = payload;

  const userRepository = (await postgresConnection).manager.getRepository(User);

  const myBookings: BookingData = await userRepository.query(
    `
        select
        ${await myBookingsCommonQuery({ state: 'past', userID: userId })},
        ${await myBookingsCommonQuery({ state: 'upcoming', userID: userId })}
      from
        "user" u
      where
        u.id = $1
      `,
    [userId],
  );

  return myBookings;
};

const myUpComingBookingsService = async (
  req: Request,
): Promise<BookingData> => {
  const { payload } = req.body;
  const { userId } = payload;

  const userRepository = (await postgresConnection).manager.getRepository(User);

  const myUpcomingBookings: BookingData = await userRepository.query(
    `
        select
        ${await myBookingsCommonQuery({
          state: 'upcoming',
          userID: userId,
        })}      
      from
        "user" u
      where
        u.id = $1 
      `,
    [userId],
  );

  return myUpcomingBookings;
};

const addFavouritesService = async (req: Request): Promise<boolean> => {
  const { payload } = req.body;
  const { userId } = payload;
  const { salonid } = req.params;

  const bookmarkRepository = (await postgresConnection).manager.getRepository(
    Bookmarked,
  );

  const addFavourite: BookingData = await bookmarkRepository.query(
    `
      INSERT INTO public.bookmarked
      (created_at, updated_at, id, salon_id, user_id)
      VALUES(now(), now(), uuid_generate_v4(), $1, $2);
      `,
    [salonid, userId],
  );

  if (addFavourite) {
    return true;
  } else return false;
};

const removeFavouritesService = async (req: Request): Promise<boolean> => {
  const { payload } = req.body;
  const { userId } = payload;
  const { salonid } = req.params;

  const bookmarkRepository = (await postgresConnection).manager.getRepository(
    Bookmarked,
  );

  const removeFavourite: BookingData = await bookmarkRepository.query(
    `
      Delete FROM public.bookmarked
      WHERE salon_id = $1 and user_id = $2;
      `,
    [salonid, userId],
  );

  if (removeFavourite) {
    return true;
  } else return false;
};

const myFavouritesService = async (req: Request): Promise<MyFavSalonData[]> => {
  const { payload } = req.body;
  const { userId } = payload;

  const bookmarkedRepository = (await postgresConnection).manager.getRepository(
    Bookmarked,
  );

  const myFavSalons: MyFavSalonData[] = await bookmarkedRepository.query(
    `
      select
        s."name" as "salonName",
        s.address as "salonAddress",
        s.open_from at TIME zone 'IST' as "openFrom",
        s.open_untill at TIME zone 'IST' as "openTill",
        s.banner -> 0 as "banner",
        s.temp_inactive as "currentlyInactive",
        s.rating ,
        s.rating_count::integer as "ratingCount"
      from
        bookmarked b
      inner join "user" u on
        u.id = b.user_id
      inner join salon s on
        s.id = b.salon_id
      where
        b.user_id = $1
        and s.is_active = 1
      order by
        b.created_at desc
    `,
    [userId],
  );

  return myFavSalons;
};

const BookServiceService = async (req: Request) => {
  const { orderId, userId, salonId, serviceIds, finalDates } = req.body;

  const { day, month, slots } = finalDates;

  const booking = new Booking();
  booking.order_id = orderId;
  booking.user = userId;
  booking.salon = salonId;
  booking.start_time = slots[0].slot;
  booking.end_time = slots[slots.length - 1].slot;

  const bookRepository = (await postgresConnection).manager.getRepository(
    Booking,
  );
  await bookRepository.save(booking);

  const bookingServiceRepository = (
    await postgresConnection
  ).manager.getRepository(BookingService);

  for (const serviceId of serviceIds) {
    const bookingService = new BookingService();
    bookingService.booking = booking;
    await bookingServiceRepository.save(bookingService);
  }

  // for (let slot in slots){
  //        const timeSlot = new TimeSlots();
  //        timeSlot.salon_id = salonId;
  //        timeSlot.booking_id = booking.id;
  //        timeSlot.date = new Date(day);
  //        timeSlot.start_time = startTime;
  //        timeSlot.end_time = endTime;

  //        const timeSlotRepository = (
  //          await postgresConnection
  //        ).manager.getRepository(TimeSlots);
  //        await timeSlotRepository.save(timeSlot);
  // }

  return booking;
};
export {
  myBookingsService,
  myUpComingBookingsService,
  myFavouritesService,
  BookServiceService,
  addFavouritesService,
  removeFavouritesService,
};
