import { Request, Response } from 'express';

import { Rating } from '../postgres/entity/Rating.entity';
import { postgresConnection } from '../config/dbConfig';
import { AddRating } from '../types/ratinf';

const addRatingService = async (req: Request): Promise<any> => {
  const { payload } = req.body;
  const { userId } = payload;

  const { rating, feedback, salon_id } = req.body;
  const ratingRepository = (await postgresConnection).manager.getRepository(
    Rating,
  );

  const obj: AddRating = {
    rating: rating,
    feedback: feedback,
    salon_id: salon_id,
    user_id: userId,
  };

  const newRating = await ratingRepository.query(
    `
    INSERT INTO public.rating
    (created_at, updated_at, id, rating, feedback,  salon_id, user_id)
    VALUES(now(), now(), uuid_generate_v4(), $1, $2, $3, $4);
  `,
    [rating, feedback, salon_id, userId],
  );

  return newRating;
};

const getRatingService = async (req: Request): Promise<any> => {
  const { salonid } = req.params;

  const ratingRepository = (await postgresConnection).manager.getRepository(
    Rating,
  );

  const salonRatings = await ratingRepository.query(
    `
      SELECT
        s.id AS "salonID",
        s.rating AS "ratingAvg",
        s.rating_count AS "ratingCount",
        (
            SELECT JSONB_AGG(
                JSON_BUILD_OBJECT(
                    'id', u.id,
                    'name', CONCAT(u.firstname, ' ', u.lastname),
                    'profilePicURL', u.profile_pic_url,
                    'rating', r2.rating,
                    'feedback', r2.feedback,
                    'createdAT', TO_CHAR(r2.created_at AT TIME zone 'IST', 'DDth Mon HH:MI AM')
                )
            )
            FROM rating r2
            INNER JOIN "user" u ON u.id = r2.user_id
            WHERE r2.salon_id = r.salon_id
                AND r2.is_active = 1
                group by r2.created_at
            ORDER BY r2.created_at DESC
        ) AS ratings
    FROM rating r
    INNER JOIN salon s ON s.id = r.salon_id
    WHERE r.salon_id = $1
        AND r.is_active = 1;

  `,
    [salonid],
  );

  return salonRatings;
};

export { addRatingService, getRatingService };
