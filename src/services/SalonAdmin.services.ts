import { Request } from 'express';
import { postgresConnection } from '../config/dbConfig';
import { Salon, Salon as SalonEntity } from '../postgres/entity/Salon.entity';
import { Service } from '../postgres/entity/Service.entity';
import { SalonInput } from '../types/salon';
import { CreateService } from '../types/services';
import { convertToSalonEntity } from '../utils/converters';

interface alreadyExists {
  alreadyExists?: boolean;
}

const createSalon = async (
  salonInput: SalonInput,
): Promise<SalonInput | alreadyExists> => {
  const salonRepository = (await postgresConnection).manager.getRepository(
    SalonEntity,
  );

  const newSalon = convertToSalonEntity(salonInput);

  const {
    name,
    address,
    description,
    contact_number,
    gender,
    open_untill,
    location,
    open_from,
    temp_inactive,
    banner,
    kyc_completed,
    treatment_tags,
    is_active,
    city_id,
    user_id,
  } = newSalon;

  const salonExistsForUser = await salonRepository
    .createQueryBuilder('s')
    .select(['s.id'])
    .where('s.user_id =  :user_id', { user_id: user_id })
    .getOne();

  if (salonExistsForUser) {
    return { alreadyExists: true };
  }

  const [savedSalon] = await salonRepository.query(
    `
  INSERT INTO public.salon
    (name, address, description, contact_number, gender, open_untill, location, open_from, banner, city_id, user_id, temp_inactive, kyc_completed)
  VALUES
    ('${name}', '${address}', '${description}', '${contact_number}', '${gender}', '${open_untill}', '${JSON.stringify(
      location,
    )}', '${open_from}', '${JSON.stringify(
      banner,
    )}', '${city_id}', '${user_id}', ${temp_inactive}, ${kyc_completed})
    RETURNING *
`,
  );

  treatment_tags?.forEach(async (treatmentTag) => {
    await (
      await postgresConnection
    ).manager.query(
      `INSERT INTO public.treatment_tag_salon
        (treatment_tag_id, salon_id)
        VALUES('${treatmentTag}', '${savedSalon?.id}');
    `,
    );
  });

  return savedSalon;
};

const createService = async (
  serviceInput: CreateService,
  req: Request,
): Promise<CreateService | alreadyExists | any> => {
  const serviceRepository = (await postgresConnection).manager.getRepository(
    Service,
  );
  const salonRepository = (await postgresConnection).manager.getRepository(
    Salon,
  );

  const {
    name,
    description,
    price,
    duration,
    featured,
    salon_id,
    treatment_tags,
  } = serviceInput;

  const { payload } = req.body;
  const { userId, userType } = payload;

  if (userType === 'salon_admin') {
    const isSalonAdmin = await salonRepository
      .createQueryBuilder('s')
      .select(['s.id'])
      .where('s.id = :salon_id', { salon_id: salon_id })
      .andWhere('s.user_id = :user_id', { user_id: userId });

    if (isSalonAdmin) {
      const serviceExistsForSalon = await serviceRepository
        .createQueryBuilder('s')
        .select(['s.id'])
        .where('s.name =  :name', { name: name })
        .andWhere('s.salon_id = :salon_id', { salon_id: salon_id })
        .getOne();

      if (serviceExistsForSalon) {
        return { alreadyExists: true };
      }

      const [savedService] = await (
        await postgresConnection
      ).manager.query(
        `
      INSERT INTO public.service
      ( id, "name", description, price, duration, featured, salon_id)
      VALUES( uuid_generate_v4(), $1, $2, $3, $4,  $5, $6)
      RETURNING *
    `,
        [name, description, price, duration, featured, salon_id],
      );

      treatment_tags?.forEach(async (treatmentTag) => {
        await (
          await postgresConnection
        ).manager.query(
          `INSERT INTO public.treatment_tag_service
        (treatment_tag_id, service_id)
        VALUES('${treatmentTag}', '${savedService?.id}');
    `,
        );
      });

      return savedService;
    }
  }
  return null;
};
export { createSalon, createService };
