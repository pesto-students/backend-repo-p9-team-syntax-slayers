// dbConfig.ts
import path from 'path';
import * as redis from 'redis';
import 'reflect-metadata';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import dotenv from 'dotenv';
import type { RedisClientType } from 'redis';

dotenv.config();

const {
  MONGODB_URL: mongodbUrl,
  POSTGRES_URL: postgresUrl,
  REDIS_URL: redisUrl,
} = process.env;

let redisClient: RedisClientType;
let isReady: boolean;

async function connectToPostgres(): Promise<DataSource> {
  try {
    const connection = new DataSource({
      type: 'postgres',
      url: postgresUrl,
      entities: [path.join(__dirname, '../postgres/entity/*.entity{.ts,.js}')],
      synchronize: false, // Set to false in production
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
      synchronize: false, // Set to false in production
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

const createRedisConnection = async (): Promise<RedisClientType> => {
  try {
    if (!isReady) {
      redisClient = redis.createClient({
        url: redisUrl,
      });
    }

    redisClient.on('error', (err: any) =>
      console.log('Redis Server Error', err),
    );
    redisClient.on('connect', () => console.log('Connected to Redis'));
    redisClient.on('ready', () => {
      (isReady = true), console.log('Redis Is Ready');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
};

// Optional: If you need a single instance of DB connection throughout your application
const redisConnection = createRedisConnection();
const postgresConnection = connectToPostgres();
const mongodbConnection = connectToMongoDB();

export {
  connectToPostgres,
  connectToMongoDB,
  // createRedisConnection,
  redisConnection,
  postgresConnection,
  mongodbConnection,
};
