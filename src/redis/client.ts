import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis({
            host: REDIS_HOST,
            port: REDIS_PORT,
            // password: process.env.REDIS_PASSWORD,
            // db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
        });
    }
    return redisClient;
}

export async function closeRedis(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
}

export const redis = {
    getClient: getRedisClient,
    close: closeRedis,
    connectToRedis: async () => {
        if (!redisClient) {
            redisClient = getRedisClient();
        }
        return redisClient;
    },
    client: () => {
        if (!redisClient) {
            throw new Error('Redis client not initialized. Call connectToRedis first.');
        }
        return redisClient;
    }
};
