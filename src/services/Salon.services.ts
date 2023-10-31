import { Request } from 'express';
import { Salon } from '../types/salon';
import { postgresConnection, redisConnection } from '../config/dbConfig';
import { Salon as SalonEntity } from '../postgres/entity/Salon.entity';
import { Service } from '../postgres/entity/Service.entity';
import { TimeSlots } from '../postgres/entity/TimeSlot.entity';

interface sortByTypes {
  type: 'relevance' | 'distance' | 'rating' | 'highToLow' | 'lowToHigh';
}

interface filterByTypes {
  type: 'default' | 'active' | 'gender';
}

const searchNearBySalonsService = async (
  req: Request,
): Promise<Salon[] | null> => {
  const salonRepository = (await postgresConnection).manager.getRepository(
    SalonEntity,
  );

  const { lon, lat, searchKeyWord } = req.query;

  const radius = 20; // In Kms

  const nearBySalons: Salon[] = await salonRepository.query(
    `
            select
            s.id,
            s.name,
            s.address,
            s.gender,
            s.temp_inactive,
            s.rating,
            s.rating_count::integer,
            ST_AsGeoJSON(s.location) as location,
            ST_Distance(
                ST_Transform(s.location, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 3857)
            ) / 1000 AS distance,
            ts_rank_cd(s.search_vector, plainto_tsquery('english', $3)) as title_rank
        from
            salon s
        where
            ST_Distance(s.location,
            ST_SetSRID(ST_MakePoint($1,
            $2),
            4326)) <= $4 * 1000
            and s.search_vector @@ plainto_tsquery('english', $3)
            and s.is_active = 1
            and s.kyc_completed = 1
        order by
            title_rank desc,
            distance
        limit 5;
        `,
    [lat, lon, searchKeyWord, radius],
  );

  return nearBySalons;
};

const nearBySalonsService = async (req: Request): Promise<any> => {
  const {
    existingSlonIDs,
    sortByType = 'relevance',
    filterByType = 'default',
    lon,
    lat,
    count = 20,
  } = req.body;

  const cachedValue = await (
    await redisConnection
  ).get(
    `Coord:${lon}-${lat}<sortByType:${sortByType}><existingSlonIDs: ${existingSlonIDs}><count: ${count}>`,
  );

  // if (cachedValue) {
  //   console.log('Value from cache:', JSON.parse(cachedValue || ''));
  // }

  if (cachedValue) {
    return JSON.parse(cachedValue || '');
  } else {
  }
  if (!cachedValue) {
    const filterByClause: any = Object.freeze({
      default: '',
      active: 'AND s.temp_inactive = 0',
      inActive: 'AND s.temp_inactive = 1',
      male: `AND s.gender = 'male'`,
      female: `AND s.gender = 'female'`,
      unisex: `AND s.gender = 'unisex'`,
    });

    const sortByClause: any = Object.freeze({
      relevance: `order by s.rating, s.created_at desc`,

      distance: `order by
            ST_Distance(
                    ST_Transform(s.location,
            3857),
            ST_Transform(ST_SetSRID(ST_MakePoint($1,
            $2),
            4326),
            3857))`,

      rating: 'order by s.rating desc',
      highToLow: ``,
      lowToHigh: ``,
    });

    const radius = 20;

    const filterBy: filterByTypes = filterByClause[filterByType];
    const sortBy: sortByTypes = sortByClause[sortByType];

    const salonRepository = (await postgresConnection).manager.getRepository(
      SalonEntity,
    );

    const nearBySalonsCount: number = await salonRepository.query(
      `
            SELECT
            count(s.id) 
            FROM
            salon s
            WHERE
            ST_Distance(
                ST_Transform(s.location, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 3857)
            ) <= $3 * 1000
            -- Multiply radius_in_kilometers by 1000 to convert to meters
            AND s.is_active = 1
            AND s.kyc_completed = 1
            ${filterBy}
        
        `,
      [lat, lon, radius],
    );
    const nearBySalons: Salon[] = await salonRepository.query(
      `
            SELECT
            s.id,
            s.name,
            s.address,
            s.banner ->> 0 as banner,
            s.gender,
            s.temp_inactive,
            s.rating,
            s.rating_count::integer,
                (case
                    when now()::time   <= s.open_from::time
                    and s.open_from - now()::time between '00:00:00' and 
                    '01:00:00'
                    and s.temp_inactive = 0
                    and s.is_active = 1 then true
                    else false
                end) as "openingSoon",
                    (case
                    when now()::time   <= s.open_from::time
                    and s.open_untill - now()::time between '00:00:00' and 
                    '01:00:00'
                    and s.temp_inactive = 0
                    and s.is_active = 1 then true
                    else false
                end) as "closingSoon",
            ST_AsGeoJSON(s.location) AS location,
            ST_Distance(
                ST_Transform(s.location, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 3857)
            ) / 1000 AS distance
            -- Divide by 1000 to get distance in kilometers
            FROM
            salon s
            WHERE
            ST_Distance(
                ST_Transform(s.location, 3857),
                ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 3857)
            ) <= $3 * 1000
            -- Multiply radius_in_kilometers by 1000 to convert to meters
            AND s.id NOT IN (SELECT UNNEST($4::UUID[])) -- Use the ANY operator
            AND s.is_active = 1
            AND s.kyc_completed = 1
            ${filterBy}
            ${sortBy}
            LIMIT $5
        `,
      [lat, lon, radius, existingSlonIDs, count],
    );

    const stringifiedToCache = JSON.stringify({
      nearBySalons,
      nearBySalonsCount,
    });

    await (
      await redisConnection
    ).setEx(
      `Coord:${lon}-${lat}<sortByType:${sortByType}><existingSlonIDs: ${existingSlonIDs}><count: ${count}>`,
      360,
      `${stringifiedToCache}`,
    );

    return { nearBySalons, nearBySalonsCount };
  }
};

const salonDetailsService = async (req: Request): Promise<Salon | null> => {
  const { salonId } = req.params;

  const salonRepository = (await postgresConnection).manager.getRepository(
    SalonEntity,
  );

  const salonDetails: Salon = await salonRepository.query(
    `
        select
            s.id,
            s."name",
            s.gender,
            s.description,
            s.open_from as "openFrom",
            s.open_untill as "openUntill",
            s.rating,
            s.rating_count as "ratingCount",
            s.gender,
            s.address,
            coalesce(s.banner, '[]') as "banners",
            (
                select
                    JSONB_AGG(
                        JSONB_BUILD_OBJECT(
                            'treatmentTagId', tt.id,
                            'treatmentTagName', tt."name"
                        )
                    )
                from
                    treatment_tag tt
                inner join treatment_tag_salon tts on
                    tts.treatment_tag_id = tt.id
                    and tts.salon_id = s.id
                ) as "treatmentTags"
              ,
              (case
                  when (
                  select
                      count(b.id)
                  from
                      bookmarked b
                  where
                      b.salon_id = s.id
                      and b.user_id = $1) > 1 then true
                  else false
             end) as "isBookmarked"
        from
            salon s
        where
            s.id = $1
        `,
    [salonId],
  );

  return salonDetails;
};

const myFavouriteSalonService = async (req: Request): Promise<Salon | null> => {
  const { salonId } = req.params;
  const { payload } = req.body;
  const { userId } = payload;

  const salonRepository = (await postgresConnection).manager.getRepository(
    SalonEntity,
  );

  const myFavouriteSalon = await salonRepository.query(
    `
        select
            s.id,
            s."name",
            (case
                when (
                select
                    count(b.id)
                from
                    bookmarked b
                where
                    b.salon_id = s.id
                    and b.user_id = $2) > 1 then true
                else false
             end) as "isBookmarked"
        from
            salon s
        where
            s.id = $1
        `,
    [salonId, userId],
  );

  return myFavouriteSalon;
};

const getSalonServicesService = async (req: Request): Promise<Salon | null> => {
  const { salonId } = req.params;

  const serviceRepository = (await postgresConnection).manager.getRepository(
    Service,
  );

  const listOfServices = await serviceRepository.query(
    `select * from service where salon_id= $1`,
    [salonId],
  );

  return listOfServices;
};

const getSalonSlotsService = async (req: Request): Promise<Salon | null> => {
  const { salonId } = req.params;

  const timeSlotsRepository = (await postgresConnection).manager.getRepository(
    TimeSlots,
  );

  const timeSlots = await timeSlotsRepository.query(
    `
    SELECT
      TO_CHAR(ts."date" , 'Mon') AS month,
      EXTRACT(DAY FROM ts."date" ) || CASE WHEN EXTRACT(DAY FROM ts."date" ) % 10 = 1 AND EXTRACT(DAY FROM ts."date" ) != 11 THEN 'st'
          WHEN EXTRACT(DAY FROM ts."date" ) % 10 = 2 AND EXTRACT(DAY FROM ts."date" ) != 12 THEN 'nd'
          WHEN EXTRACT(DAY FROM ts."date" ) % 10 = 3 AND EXTRACT(DAY FROM ts."date" ) != 13 THEN 'rd'
          ELSE 'th' END AS day,
      TO_CHAR(ts."date" , 'Dy') AS week,
      json_agg(json_build_object('slot', TO_CHAR(ts.start_time , 'HH:MI AM'), 'slotId', ts.id, 'avaliableForBooking', (case when ts.booking_id is null then true else false end), 'startTimeSLot',ts.start_time , 'endTimeSlot', ts.end_time  )) as slots
    FROM
      public.time_slot ts
    WHERE
      ts.salon_id = $1
      and ts."date"::date  >= current_date
    GROUP BY
      month, day, week, ts."date" 
    ORDER BY
      ts."date" ;

    `,
    [salonId],
  );

  return timeSlots;
};

export {
  searchNearBySalonsService,
  nearBySalonsService,
  salonDetailsService,
  myFavouriteSalonService,
  getSalonServicesService,
  getSalonSlotsService,
};
