// dbConfig.ts
import path from 'path';
import * as redis from 'redis';
import 'reflect-metadata';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../postgres/entity/User.entity';

dotenv.config();

const {
  MONGODB_URL: mongodbUrl,
  POSTGRES_URL: postgresUrl,
  REDIS_URL: redisUrl,
} = process.env;

async function connectToPostgres(): Promise<DataSource> {
  try {
    const connection = new DataSource({
      type: 'postgres',
      url: postgresUrl,
      entities: [path.join(__dirname, '../postgres/entity/*.entity{.ts,.js}')],
      synchronize: true, // Set to false in production
      logging: ['error', 'warn'], // Enable detailed logging for debugging
    });

    // Listen for the 'connect' event to know when the connection is established
    connection
      .initialize()
      .then(() => {
        console.log('Connected to PostgreSQL');
      })
      .catch((error) => {
        console.error('Error connecting to PostgreSQL:', error);
      });

    return connection;
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error);
    throw error;
  }
}
async function connectToMongoDB(): Promise<DataSource> {
  try {
    const connection = new DataSource({
      type: 'mongodb',
      url: mongodbUrl,
      entities: [path.join(__dirname, '../mongodb/entity/*.entity{.ts,.js}')],
      synchronize: true, // Set to false in production
      logging: ['error', 'warn'],
    });

    connection
      .initialize()
      .then(() => {
        console.log('Connected to MongoDB');
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
      });
    return connection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// const createRedisConnection = async () => {
//   try {
//     const client = redis.createClient({
//       url: redisUrl,
//     });

//     // Optional: Add event listeners to handle connection errors
//     client.on('error', (err) => console.log('Redis Server Error', err));
//     client.on('connect', () => console.log('Connected to Redis'));

//     return client.connect();
//   } catch (error) {
//     console.error('Failed to connect to Redis:', error);
//     throw error;
//   }
// };

// Optional: If you need a single instance of DB connection throughout your application
// const redisConnection = createRedisConnection();
const postgresConnection = connectToPostgres();
const mongodbConnection = connectToMongoDB();

export {
  connectToPostgres,
  connectToMongoDB,
  // createRedisConnection,
  // redisConnection,
  postgresConnection,
  mongodbConnection,
};
