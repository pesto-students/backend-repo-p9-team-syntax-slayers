import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AddRating } from '../types/ratinf';

export const registerSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  type: Joi.string().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const salonCreateSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  description: Joi.string().optional(),
  contact_number: Joi.string().required(),
  gender: Joi.string().valid('male', 'female', 'unisex').required(),
  open_untill: Joi.string().required(),
  location: Joi.object().required(),
  open_from: Joi.string().required(),
  temp_inactive: Joi.number().optional(),
  banner: Joi.array().required(),
  kyc_completed: Joi.number().optional(),
  is_active: Joi.number().optional(),
  city_id: Joi.string().required(),
  user_id: Joi.string().required(),
  treatment_tags: Joi.array().required(),
});

export const serviceCreateSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  duration: Joi.number().positive().required(),
  is_active: Joi.number().integer().valid(0, 1).optional(),
  featured: Joi.number().integer().valid(0, 1).required(),
  salon_id: Joi.string().required(),
  treatment_tags: Joi.array().required(),
  payload: Joi.any().required(),
});

export const addRatingSchema = Joi.object<AddRating>({
  rating: Joi.number().required(),
  feedback: Joi.string().required(),
  salon_id: Joi.string().uuid().required(),
  user_id: Joi.string().uuid().required(),
});

export const validateAddRating = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { error } = addRatingSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateSalonCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { error } = salonCreateSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};

export const validateServiceInput = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { error } = serviceCreateSchema.validate(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  next();
};
