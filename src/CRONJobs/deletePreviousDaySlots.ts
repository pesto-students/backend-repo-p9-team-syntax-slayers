import { postgresConnection } from '../config/dbConfig';
import { Salon } from '../postgres/entity/Salon.entity'; // Require your Salon entity
import { TimeSlots } from '../postgres/entity/TimeSlot.entity'; // Require your TimeSlot entity
import { schedule } from 'node-cron';

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
        await deletePreviousDaysTimeSlots(salon);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
