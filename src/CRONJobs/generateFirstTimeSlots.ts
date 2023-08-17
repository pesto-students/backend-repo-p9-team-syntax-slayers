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

        generatedDate.setDate(currentDate.getDate() + day); // Set the date of the current day
        generatedDate.setHours(
          parseInt(openFromParts[0]),
          parseInt(openFromParts[1]),
          0,
          0,
        );

        const endTime = new Date(generatedDate);
        endTime.setHours(
          parseInt(openUntilParts[0]),
          parseInt(openUntilParts[1]),
          0,
          0,
        );

        while (generatedDate < endTime) {
          const startTime = new Date(generatedDate);
          const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Add 30 minutes

          // Convert the start time, end time, and date to IST
          const startTimeIST = new Date(
            startTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
          );
          const endTimeIST = new Date(
            endTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
          );
          const dateIST = new Date(
            generatedDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
          );

          await timeSlotsRepository.query(
            `
        INSERT INTO public.time_slot
        ( id, salon_id, start_time, end_time, "date")
        VALUES( uuid_generate_v4(), $1, $2, $3, $4);
      `,
            [salon.id, startTimeIST, endTimeIST, dateIST],
          );

          generatedDate.setTime(generatedDate.getTime() + 30 * 60 * 1000); // Move to the next time slot
        }
      }
    }

    const salons = await salonRepository.query(
      `
        SELECT id, open_untill::text,  open_from::text
        FROM salon
        where is_active = 1 and kyc_completed = 1
    `,
    );

    for (const salon of salons) {
      await generateTimeSlots(salon);
    }
    res.json({ success: true });
  });
};

export default generateTimeSlotsForSalons;
