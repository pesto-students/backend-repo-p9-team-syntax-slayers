import { postgresConnection } from '../config/dbConfig';
import { Salon } from '../postgres/entity/Salon.entity'; // Import your Salon entity
import { TimeSlots } from '../postgres/entity/TimeSlot.entity'; // Import your TimeSlot entity
import cron from 'node-cron';

//Generate for 1st Time for 7 Days:
(async () => {
  try {
    const salonRepository = (await postgresConnection).manager.getRepository(
      Salon,
    );

    const timeSlotsRepository = (
      await postgresConnection
    ).manager.getRepository(TimeSlots);

    // Define a function to generate time slots
    async function generateTimeSlots(salon: Salon) {
      const currentDate = new Date();
      const daysToGenerate = 7;

      for (let day = 0; day < daysToGenerate; day++) {
        currentDate.setDate(currentDate.getDate() + day);
        currentDate.setHours(salon.open_from.getHours(), 0, 0, 0);

        const endTime = new Date(currentDate);
        endTime.setHours(salon.open_untill.getHours(), 0, 0, 0);

        while (currentDate < endTime) {
          const startTime = new Date(currentDate);
          const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Add 30 minutes

          const timeSlot = new TimeSlots();
          timeSlot.start_time = startTime;
          timeSlot.end_time = endTime;
          timeSlot.date = currentDate; // Set the specific date
          timeSlot.salon_id = salon.id;

          await timeSlotsRepository.save(timeSlot);

          currentDate.setTime(currentDate.getTime() + 30 * 60 * 1000); // Move to the next time slot
        }
      }
    }

    const salons = await salonRepository
      .createQueryBuilder('s')
      .select(['*'])
      .where('s.is_active = 1 and s.kyc_completed = 1')
      .getMany();

    for (const salon of salons) {
      await generateTimeSlots(salon);
    }
  } catch (error) {
    console.error('Error:', error);
  }
})();

// Generate for 7th Day Every Day:
(async () => {
  try {
    const timeSlotsRepository = (
      await postgresConnection
    ).manager.getRepository(TimeSlots);

    // Define a function to generate time slots for the 7th day
    async function generateTimeSlotsFor7thDay(salon: Salon) {
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
    cron.schedule('0 0 * * *', async () => {
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

(async () => {
  try {
    const timeSlotsRepository = (
      await postgresConnection
    ).manager.getRepository(TimeSlots);

    // Define a function to delete previous day's time slots
    async function deletePreviousDaysTimeSlots(salon: Salon) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 1);

      await timeSlotsRepository
        .createQueryBuilder()
        .delete()
        .from(TimeSlots)
        .where('date = :currentDate AND salonId = :salonId', {
          currentDate,
          salonId: salon.id,
        })
        .execute();
    }
    cron.schedule('0 0 * * *', async () => {
      const salonRepository = (await postgresConnection).manager.getRepository(
        Salon,
      );

      const salons = await salonRepository
        .createQueryBuilder('s')
        .select(['*'])
        .where('s.is_active = 1 and s.kyc_completed = 1')
        .getMany();

      for (const salon of salons) {
        await deletePreviousDaysTimeSlots(salon);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
