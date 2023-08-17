import { Request, Response } from 'express';

import { connectToPostgres, postgresConnection } from '../config/dbConfig';
import { User } from '../postgres/entity/User.entity';
import { Bookmarked } from '../postgres/entity/Bookmarked.entity';
import { BookingData, MyFavSalonData } from '../types/user';

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
          b.start_time at TIME zone 'IST' as "startTime",
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

export { myBookingsService, myUpComingBookingsService, myFavouritesService };
