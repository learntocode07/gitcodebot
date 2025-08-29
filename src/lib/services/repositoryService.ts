import { ObjectId } from 'mongodb';
import type { Repository } from '@/types/repository';
import { mongo } from '@/mongodb/client';

const DB_NAME = 'gitcodebot';
const COLLECTION = 'repositories';

export async function getRepositoryCollection() {
  const client = await mongo.client;
  return client.db(DB_NAME).collection<Repository>(COLLECTION);
}

export async function createRepository(data: Repository) {
  const col = await getRepositoryCollection();

  const result = await col.insertOne({
    ...data,
    createdAt: new Date(),
    availableToConsume: false,
  });
  return result.insertedId;
}

export async function findRepositories(filter: Partial<Repository>) {
  const col = await getRepositoryCollection();
  return await col.find(filter).toArray();
}

export async function findRepositoryByUrl(url: string) {
  const col = await getRepositoryCollection();
  return await col.findOne({ url });
}

export async function updateRepositoryByUrl(url: string, update: Partial<Repository>) {
  const col = await getRepositoryCollection();
  return await col.updateOne({ url }, { $set: update });
}

export async function deleteRepositoryByUrl(url: string) {
  const col = await getRepositoryCollection();
  return await col.deleteOne({ url });
}

export async function getRepositoriesByUser(userId: string) {
  const col = await getRepositoryCollection();
  const response = await col.find({ users: userId }).toArray();
  return response.map(repo => ({
    ...repo,
    _id: repo._id.toString(), // Convert ObjectId to string for easier handling
  }));
}