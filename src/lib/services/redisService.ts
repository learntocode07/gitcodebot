import { redis } from '@/redis/client';

export async function addToQueue(queueName: string, data: string): Promise<number> {
    await redis.connectToRedis();
    const client = redis.client();
    return client.rpush(queueName, data);
}