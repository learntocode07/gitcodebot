import { NextRequest, NextResponse } from "next/server";
import {
  createRepository,
  findRepositories,
} from "@/lib/services/repositoryService";

import { addToQueue } from "@/lib/services/redisService";

export async function GET(req: NextRequest) {
  const filters = Object.fromEntries(req.nextUrl.searchParams.entries());
  const repos = await findRepositories(filters);
  return NextResponse.json(repos);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const id = await createRepository(data);
  if (!id) {
    return NextResponse.json(
      { error: "Failed to create repository" },
      { status: 500 }
    );
  }
  await addToQueue("repository-creation", data.url);
  return NextResponse.json({ insertedId: id });
}
