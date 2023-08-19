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

const createSalonService = async (
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

const updateSalonService = async (
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

  if (!salonExistsForUser) {
    return { alreadyExists: false };
  }

  await salonRepository.query(
    `
    UPDATE public.salon
    SET 
        name = '${name}', 
        address = '${address}', 
        description = '${description}', 
        contact_number = '${contact_number}', 
        gender = '${gender}', 
        open_untill = '${open_untill}', 
        location = '${JSON.stringify(location)}', 
        open_from = '${open_from}', 
        banner = '${JSON.stringify(banner)}', 
        city_id = '${city_id}', 
        temp_inactive = ${temp_inactive}, 
        kyc_completed = ${kyc_completed}
    WHERE user_id = '${user_id}'
    `,
  );

  return newSalon;
};

const createServiceService = async (
  serviceInput: CreateService,
  req: Request,
): Promise<CreateService | alreadyExists | null> => {
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

const updateServiceService = async (
  serviceInput: CreateService,
  req: Request,
): Promise<CreateService | alreadyExists | null> => {
  const serviceRepository = (await postgresConnection).manager.getRepository(
    Service,
  );
  const salonRepository = (await postgresConnection).manager.getRepository(
    Salon,
  );

  const { name, description, price, duration, featured, salon_id } =
    serviceInput;
  console.log(salon_id, 'salonid');
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

      if (!serviceExistsForSalon) {
        return { alreadyExists: false };
      }

      const [savedService] = await (
        await postgresConnection
      ).manager.query(
        `
      UPDATE public.service
      ( id, "name", description, price, duration, featured, salon_id)
      VALUES( uuid_generate_v4(), $1, $2, $3, $4,  $5, $6)
      RETURNING *
    `,
        [name, description, price, duration, featured, salon_id],
      );

      return savedService;
    }
  }
  return null;
};

const getSalonDetailsByUserIdService = async (userId: string) => {
  const salonRepository = (await postgresConnection).manager.getRepository(
    SalonEntity,
  );

  const salonDetails = await salonRepository.query(
    `
     select  "name",id,address,description, contact_number, gender, banner, city_id from salon where user_id= $1
   `,
    [userId],
  );

  console.log(salonDetails, userId);

  return salonDetails;
};

const getSalonBookingDeatilsService = async (req: Request): Promise<any> => {
  const salonRepository = (await postgresConnection).manager.getRepository(
    SalonEntity,
  );

  const { salonId } = req.params;
  const salonBookingDetails = await salonRepository.query(
    `
    SELECT
        subquery."bookingId",
        subquery."userId",
        subquery."customerName",
        subquery."StartTime",
        subquery."paymentConfirmed",
        (SELECT JSONB_AGG(services) FROM (SELECT s3."name" FROM service s3 WHERE s3.id = subquery."serviceId") AS services) AS services
    FROM (
        SELECT
            b.id AS "bookingId",
            u.id AS "userId",
            CONCAT(u.firstname, ' ', u.lastname) AS "customerName",
            TO_CHAR(b.start_time, 'HH:MI AM') AS "StartTime",
            TRUE AS "paymentConfirmed",
            s2."name" AS "serviceName",
            s2.id AS "serviceId"
        FROM
            salon s
        INNER JOIN booking b ON
            b.salon_id = s.id 
            AND b.start_time::date = current_date 
        INNER JOIN booking_service bs ON bs.booking_id = b.id 
        INNER JOIN service s2 ON s2.id = bs.service_id 
        INNER JOIN "user" u ON
            u.id = b.user_id
        WHERE
            s.id = $1
        ORDER BY
            b.start_time ASC
    ) AS subquery
    GROUP BY
        subquery."bookingId",
        subquery."userId",
        subquery."customerName",
        subquery."StartTime",
        subquery."paymentConfirmed",
        subquery."serviceId"
    ORDER BY
        subquery."StartTime" ASC;
   `,
    [salonId],
  );

  return salonBookingDetails;
};

export {
  createSalonService,
  createServiceService,
  getSalonDetailsByUserIdService,
  updateSalonService,
  updateServiceService,
  getSalonBookingDeatilsService,
};
