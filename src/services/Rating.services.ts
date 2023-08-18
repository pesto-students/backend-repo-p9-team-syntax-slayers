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
  const newRating = await ratingRepository
    .createQueryBuilder()
    .insert()
    .values(obj)
    .execute();

  return newRating;
};

const getRatingService = async (req: Request): Promise<any> => {
  const { salon_id } = req.params;

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
            WHERE r2.salon_id = '0db5c3bf-d9de-442a-96ce-14b7fcb8b12c'
                AND r2.is_active = 1
                group by r2.created_at
            ORDER BY r2.created_at DESC
        ) AS ratings
    FROM rating r
    INNER JOIN salon s ON s.id = r.salon_id
    WHERE r.salon_id = $1
        AND r.is_active = 1;

  `,
    [salon_id],
  );

  return salonRatings;
};

export { addRatingService, getRatingService };
