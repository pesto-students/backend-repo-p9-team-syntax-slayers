import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import { connectToPostgres, postgresConnection } from '../config/dbConfig';
import { User } from '../postgres/entity/User.entity';
import { Bookmarked } from '../postgres/entity/Bookmarked.entity';
import { BookingData, MyFavSalonData } from '../types/user';

const myBookings = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const { payload } = req.body;
    const { userId } = payload;

    const userRepository = (await postgresConnection).manager.getRepository(
      User,
    );

    const pastBookingQuery = `
	  (
      select
        coalesce(jsonb_agg("pastBookings"), '[]')
      from
        (
        select
          b.id as "orderID",
          s."name" as "salonName",
          s.address as "salonAddress",
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
          b.user_id = u.id
          and b.start_time at TIME zone 'IST' <= now() at TIME zone 'IST'
                ) as "pastBookings" ) as "pastBookings"
       `;

    const upcomingBookingQuery = `
	  (
      select
        coalesce(jsonb_agg("upcomingBooking"), '[]')
      from
        (
        select
          b.id as "orderID",
          s."name" as "salonName",
          s.address as "salonAddress",
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
          b.user_id = u.id
          and b.start_time at TIME zone 'IST' >= now() at TIME zone 'IST'
                ) as "upcomingBooking" ) as "upcomingBookings"
       `;

    const myBookings: BookingData = await userRepository.query(
      `
        select
        ${upcomingBookingQuery},
        ${pastBookingQuery}          
      from
        "user" u
      where
        u.id = '${userId}'
      `,
    );

    !!myBookings
      ? sendResponse(res, 200, true, '', myBookings)
      : sendResponse(res, 404, false);
  });
};

const myFavourites = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const { payload } = req.body;
    const { userId } = payload;

    const bookmarkedRepository = (
      await postgresConnection
    ).manager.getRepository(Bookmarked);

    const myFavSalons: MyFavSalonData[] = await bookmarkedRepository.query(`
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
        b.user_id = '${userId}'
        and s.is_active = 1
      order by
        b.created_at desc
    `);

    !!myFavSalons && !!myFavSalons.length
      ? sendResponse(res, 200, true, '', myFavSalons)
      : sendResponse(res, 404, false, '');
  });
};

// const myBookings = async (req: Request, res: Response): Promise<void> => {
//   tryCatchWrapper(res, async () => {
//     const { password } = req.body;

//     const data = { password };
//     sendResponse(res, 200, true, 'User Login Successful', data);

//     sendResponse(res, 404, false, 'No User Found With This Email ID');
//   });
// };
export { myBookings, myFavourites };
