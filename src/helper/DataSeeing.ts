import { createConnection, getRepository } from 'typeorm';
import { User } from '../postgres/entity/User.entity';
import { hashPassword } from '../utils/bcryptPassword';
import { postgresConnection } from '../config/dbConfig';
import axios from 'axios';

async function getRandomUserData() {
  try {
    const response = await axios.get('https://randomuser.me/api/?results=30');

    const randomUsers = response.data.results.map(
      (result: any, index: number) => {
        const userType = index < 10 ? 'salon_admin' : 'user';

        return {
          firstname: result.name.first,
          lastname: result.name.last,
          email: result.email,
          password: `123Pass`,
          profile_pic_url: result.picture.large,
          type: userType,
        };
      },
    );

    return randomUsers;
  } catch (error) {
    console.error('Error fetching random user data:', error);
    return [];
  }
}

async function createUsers() {
  try {
    const userRepository = (await postgresConnection).manager.getRepository(
      User,
    );

    const randomUsers = await getRandomUserData();

    // Create users
    for (const userData of randomUsers) {
      const user = new User();
      user.email = userData.email;
      user.password = await hashPassword(userData.password);
      user.firstname = userData.firstname;
      user.lastname = userData.lastname;
      user.type = userData.type;
      user.profile_pic_url = userData.profile_pic_url;
      await userRepository.save(user);
    }

    console.log('Users created successfully.');
  } catch (error) {
    console.error('Error creating users:', error);
  }
}

export default createUsers;
