import { Request, Response } from 'express';
import { connectToPostgres, postgresConnection } from '../config/dbConfig';
import { Salon } from '../postgres/entity/Salon.entity'; // Require your Salon entity
import { TimeSlots } from '../postgres/entity/TimeSlot.entity'; // Require your TimeSlot entity
import tryCatchWrapper from '../utils/sentryWrapper';

//Generate for 1st Time for 7 Days:

const generateTimeSlotsForSalons = async (res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const salonRepository = (await postgresConnection).manager.getRepository(
      Salon,
    );

    const timeSlotsRepository = (
      await postgresConnection
    ).manager.getRepository(TimeSlots);

    async function generateTimeSlots(salon: Salon) {
      const currentDate = new Date();
      const daysToGenerate = 7;

      for (let day = 0; day < daysToGenerate; day++) {
        const generatedDate = new Date(currentDate); // Create a new date instance

        const openFromParts = salon.open_from.toString().split(':');
        const openUntilParts = salon.open_untill.toString().split(':');

        currentDate.setHours(
          parseInt(openFromParts[0]),
          parseInt(openFromParts[1]),
          0,
          0,
        );
        const endTime = new Date(currentDate);
        endTime.setHours(
          parseInt(openUntilParts[0]),
          parseInt(openUntilParts[1]),
          0,
          0,
        );

        while (currentDate < endTime) {
          const startTime = new Date(currentDate);
          const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Add 30 minutes

          // const timeSlot = new TimeSlots();
          // timeSlot.start_time = startTime;
          // timeSlot.end_time = endTime;
          // timeSlot.date = generatedDate; // Use the generatedDate here
          // timeSlot.salon_id = salon.id;

          await timeSlotsRepository.query(
            `
        INSERT INTO public.time_slot
          ( id, salon_id, start_time, end_time, "date")
          VALUES( uuid_generate_v4(), $1, $2, $3, $4);
        `,
            [salon.id, startTime, endTime, generatedDate], // Use generatedDate here as well
          );

          currentDate.setTime(currentDate.getTime() + 30 * 60 * 1000); // Move to the next time slot
        }

        // Increment the generatedDate by one day for the next iteration
        generatedDate.setDate(generatedDate.getDate() + 1);
      }
    }

    const salons = await salonRepository.query(
      `
        SELECT id, open_untill::text,  open_from::text
        FROM salon
        where is_active = 1 and kyc_completed = 1
        limit 1
    `,
    );

    for (const salon of salons) {
      await generateTimeSlots(salon);
    }
    res.json({ success: true });
  });
};

export default generateTimeSlotsForSalons;
