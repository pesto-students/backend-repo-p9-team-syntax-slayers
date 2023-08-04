import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import { postgresConnection } from '../config/dbConfig';

import { Salon } from '../postgres/entity/Salon.entity';
import { Salon as ISalon } from '../types/salon';

interface sortByTypes {
  type: 'relevance' | 'distance' | 'rating' | 'highToLow' | 'lowToHigh';
}

interface filterByTypes {
  type: 'default' | 'active' | 'gender';
}

const searchNearBySalons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const { lon, lat, searchKeyWord } = req.query;

    const radius = 20; // In Kms

    const salonRepository = (await postgresConnection).manager.getRepository(
      Salon,
    );

    const nearBySalons: ISalon = await salonRepository.query(
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
        limit 20;
        `,
      [lat, lon, searchKeyWord, radius],
    );

    nearBySalons
      ? sendResponse(res, 200, true, '', nearBySalons)
      : sendResponse(res, 404, false, '');
  });
};

const nearBySalons = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const { lon, lat } = req.query;
    const {
      existingSlonIDs,
      sortByType = 'relevance',
      filterByType = 'default',
      count = 20,
    } = req.body;

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

    const radius = 10;

    const filterBy: filterByTypes = filterByClause[filterByType];
    const sortBy: sortByTypes = sortByClause[sortByType];

    const salonRepository = (await postgresConnection).manager.getRepository(
      Salon,
    );

    const nearBySalons: ISalon[] = await salonRepository.query(
      `
            SELECT
            s.id,
            s.name,
            s.address,
            s.gender,
            s.temp_inactive,
            s.rating,
            s.rating_count::integer,
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

    nearBySalons
      ? sendResponse(res, 200, true, '', nearBySalons)
      : sendResponse(res, 404, false, 'dd');
  });
};

const salonDetails = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const { salonId } = req.params;

    const salonRepository = (await postgresConnection).manager.getRepository(
      Salon,
    );

    const salonDetails: ISalon = await salonRepository.query(
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
            --,
            --(case
            --    when (
            --    select
            --        count(b.id)
            --    from
            --        bookmarked b
            --    where
            --        b.salon_id = s.id
            --        and b.user_id = $1) > 1 then true
            --    else false
            -- end) as "isBookmarked"
        from
            salon s
        where
            s.id = $1
        `,
      [salonId],
    );

    salonDetails
      ? sendResponse(res, 200, true, '', salonDetails)
      : sendResponse(res, 404, false, '');
  });
};

const myFavouriteSalon = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const { salonId } = req.params;
    const { payload } = req.body;
    const { userId } = payload;

    const salonRepository = (await postgresConnection).manager.getRepository(
      Salon,
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

    myFavouriteSalon
      ? sendResponse(res, 200, true, '', myFavouriteSalon)
      : sendResponse(res, 404, false, '');
  });
};

export { nearBySalons, searchNearBySalons, salonDetails, myFavouriteSalon };
