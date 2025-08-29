import { NextRequest, NextResponse } from 'next/server';
import {
  deleteRepositoryByUrl,
  findRepositoryByUrl,
  updateRepositoryByUrl,
} from '@/lib/services/repositoryService';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });

  const repo = await findRepositoryByUrl(decodeURIComponent(urlParam));
  if (!repo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(repo);
}

export async function PUT(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });

  const update = await req.json();
  await updateRepositoryByUrl(decodeURIComponent(urlParam), update);

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam) return NextResponse.json({ error: 'Missing URL' }, { status: 400 });

  await deleteRepositoryByUrl(decodeURIComponent(urlParam));
  return NextResponse.json({ success: true });
}
