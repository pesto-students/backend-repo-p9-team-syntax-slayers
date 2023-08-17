import { postgresConnection } from '../config/dbConfig';
import {Salon} from '../postgres/entity/Salon.entity'; // Require your Salon entity
import {TimeSlots} from '../postgres/entity/TimeSlot.entity'; // Require your TimeSlot entity
import { schedule } from 'node-cron';
// Generate for 7th Day Every Day:
(async () => {
  try {
    const timeSlotsRepository = (
      await postgresConnection
    ).manager.getRepository(TimeSlots);

    // Define a function to generate time slots for the 7th day
    async function generateTimeSlotsFor7thDay(salon:Salon) {
      const targetDate = new Date();

      targetDate.setDate(targetDate.getDate() + 7); // 7 days from today
      targetDate.setHours(salon.open_from.getHours(), 0, 0, 0);

      const endTime = new Date(targetDate);
      endTime.setHours(salon.open_untill.getHours(), 0, 0, 0);

      while (targetDate < endTime) {
        const startTime = new Date(targetDate);
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Add 30 minutes

        const timeSlot = new TimeSlots();
        timeSlot.start_time = startTime;
        timeSlot.end_time = endTime;
        timeSlot.date = targetDate;
        timeSlot.salon_id = salon.id;

        await timeSlotsRepository.save(timeSlot);

        targetDate.setTime(targetDate.getTime() + 30 * 60 * 1000); // Move to the next time slot
      }
    }
    schedule('0 0 * * *', async () => {
      const salonRepository = (await postgresConnection).manager.getRepository(
        Salon,
      );

      const salons = await salonRepository
        .createQueryBuilder('s')
        .select(['*'])
        .where('s.is_active = 1 and s.kyc_completed = 1')
        .getMany();

      for (const salon of salons) {
        await generateTimeSlotsFor7thDay(salon);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
