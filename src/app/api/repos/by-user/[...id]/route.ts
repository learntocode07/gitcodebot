import { NextRequest, NextResponse } from 'next/server';

import {
    getRepositoriesByUser
} from '@/lib/services/repositoryService';

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.pathname.split('/').pop();
    console.log("🚀 ~ GET repositories by user ~ userId:", userId);
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const repos = await getRepositoriesByUser(userId);
    if (!repos) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    console.log("🚀 ~ GET repositories by user ~ repos:", repos);
    return NextResponse.json(repos);
}