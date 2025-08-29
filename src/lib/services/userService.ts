import { ObjectId } from 'mongodb';
import type { Repository } from '@/types/repository';
import { mongo } from '@/mongodb/client';

const DB_NAME = 'gitcodebot';
const COLLECTION = 'users';

export async function getUserCollection() {
    const client = await mongo.client;
    return client.db(DB_NAME).collection<Repository>(COLLECTION);
}

export async function createUser(data: Repository) {
    const col = await getUserCollection();

    const result = await col.insertOne({
        ...data,
        createdAt: new Date(),
    });
    return result.insertedId;
}

export async function findAllUser() {
    const col = await getUserCollection();
    return await col.find().toArray();
}

export async function findUserByEmail(email: string) {
    const col = await getUserCollection();
    return await col.findOne({ email });
}

export async function updateUserByEmail(email: string, update: Partial<Repository>) {
    const col = await getUserCollection();
    return await col.updateOne({ email }, { $set: update });
}

export async function deleteUserByEmail(email: string) {
    const col = await getUserCollection();
    return await col.deleteOne({ email });
}

