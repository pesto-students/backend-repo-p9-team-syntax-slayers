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
    VALUES(now() , now() , uuid_generate_v4(), $1, $2, $3, $4);
  `,
    [rating, feedback, salon_id, userId],
  );

  return newRating;
};

const getRatingService = async (req: Request): Promise<any> => {
  const { salonid, userId } = req.params;

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
          CASE
            WHEN (SELECT COUNT(r3.user_id) FROM rating r3 WHERE r3.salon_id = s.id AND r3.user_id = $2) > 0 THEN 1
            ELSE 0
          END
        ) AS "userHaveRated",
        (
          SELECT JSONB_AGG(ratings) FROM (
            SELECT
              u.id,
              CONCAT(u.firstname, ' ', u.lastname) AS "name",
              u.profile_pic_url AS "profilePicURL",
              MAX(r2.rating) AS "rating",
              (
                CASE
                  WHEN (SELECT COUNT(r3.user_id) FROM rating r3 WHERE r3.salon_id = s.id AND r3.user_id = $2) > 0 THEN 1
                  ELSE 0
                END
              ) AS "userHaveRated",
              MAX(r2.feedback) AS "feedback",
              TO_CHAR(r2.created_at AT TIME ZONE 'UTC', 'DDth Mon HH:MI AM') AS "createdAT"
            FROM rating r2
            INNER JOIN "user" u ON u.id = r2.user_id
            WHERE r2.salon_id = r.salon_id
              AND r2.is_active = 1
            GROUP BY r2.created_at, u.id
            ORDER BY
              "userHaveRated" DESC,
              r2.created_at DESC
          ) AS "ratings"
        ) AS "ratings"
      FROM rating r
      INNER JOIN salon s ON s.id = r.salon_id
      WHERE r.salon_id = $1
        AND r.is_active = 1;

  `,
    [salonid, userId],
  );

  return salonRatings;
};

export { addRatingService, getRatingService };
