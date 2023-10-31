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

interface Slot {
  slot: Date | string;
  slotId: string;
  avaliableForBooking: boolean;
  startTimeSLot: Date;
  endTimeSlot: Date;
}

interface Slots {
  slots: Slot[];
}

const bookingStates = Object.freeze({
  past: `and b.start_time   <= now()  `,
  upcoming: `and b.start_time   >= now()  `,
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
           to_char(b.start_time  , 'DDth Mon HH:MI AM') AS "startTime",
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
          ${
            state === 'upcoming'
              ? 'order by b.start_time asc'
              : 'order by b.start_time desc'
          }
         
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
        s.open_from   as "openFrom",
        s.open_untill   as "openTill",
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

  const { slots }: Slots = finalDates;

  let startTimeSLotOfFirst = null;
  let endTimeSlotOfLast = null;

  if (slots?.length > 1) {
    startTimeSLotOfFirst = slots[0]?.startTimeSLot;
    endTimeSlotOfLast = slots[slots.length - 1]?.endTimeSlot;
  }

  if (slots?.length === 1) {
    startTimeSLotOfFirst = slots[0]?.startTimeSLot;
    endTimeSlotOfLast = slots[0]?.endTimeSlot;
  }

  const bookingRepository = (await postgresConnection).manager.getRepository(
    Booking,
  );

  const [bookingResp] = await bookingRepository.query(
    `
    INSERT INTO public.booking
    (created_at, updated_at, order_id, start_time, end_time, user_id, salon_id, id)
    VALUES(now(), now(), uuid_generate_v4(), $1, $2, $3, $4, uuid_generate_v4())
    RETURNING *
  `,
    [startTimeSLotOfFirst, endTimeSlotOfLast, userId, salonId],
  );
  console.log('bookingResp', bookingResp);
  if (bookingResp) {
    const bookingServiceRepository = (
      await postgresConnection
    ).manager.getRepository(BookingService);

    for (const serviceId of serviceIds) {
      await bookingServiceRepository.query(
        `
      INSERT INTO public.booking_service
      (created_at, updated_at, id, service_id, booking_id)
      VALUES(now(), now(), uuid_generate_v4(), $1, $2);
    `,
        [serviceId, bookingResp.id],
      );
    }

    const timeSlotRepository = (await postgresConnection).manager.getRepository(
      TimeSlots,
    );

    for (let slot of slots) {
      await timeSlotRepository.query(
        `
        UPDATE public.time_slot
        SET salon_id=$5, start_time=$2, end_time=$3, 
        booking_id= $4
        WHERE id= $1
        `,
        [
          slot.slotId,
          slot.startTimeSLot,
          slot.endTimeSlot,
          bookingResp.id,
          salonId,
        ],
      );
    }

    return bookingResp;
  }
};
export {
  myBookingsService,
  myUpComingBookingsService,
  myFavouritesService,
  BookServiceService,
  addFavouritesService,
  removeFavouritesService,
};
