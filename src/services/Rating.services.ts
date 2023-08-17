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

export { addRatingService };
