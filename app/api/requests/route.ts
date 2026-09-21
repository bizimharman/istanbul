export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/server';
import { requestFormSchema } from '@/lib/request-shared';
import { RequestError, requestError, readRequestJson, matchBusinesses, offerSelect, mapOffer } from '@/lib/request-server';

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    const items = await prisma.serviceRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { _count: { select: { offers: true } } },
    });
    return NextResponse.json(items.map(r => ({
      id: r.id, title: r.title, category: r.category, district: r.district,
      serviceDistricts: r.serviceDistricts, budgetMin: r.budgetMin, budgetMax: r.budgetMax,
      timeline: r.timeline, status: r.status, matchCount: r.matchCount,
      offerCount: r._count.offers, createdAt: r.createdAt.toISOString(),
    })));
  } catch (e) { return requestError(e); }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    const body = await readRequestJson(req);
    const data = requestFormSchema.parse(body);
    // Rate limit: max 5 open requests per user
    const openCount = await prisma.serviceRequest.count({
      where: { userId: user.id, status: { in: ['DRAFT', 'OPEN', 'MATCHED', 'OFFERED'] } },
    });
    if (openCount >= 5) throw new RequestError(429, 'En fazla 5 açık talebiniz olabilir. Mevcut taleplerinizi kapatın veya iptal edin.');
    const sr = await prisma.serviceRequest.create({
      data: {
        userId: user.id, title: data.title, description: data.description,
        category: data.category, district: data.district,
        serviceDistricts: data.serviceDistricts,
        budgetMin: data.budgetMin, budgetMax: data.budgetMax,
        timeline: data.timeline, status: body.draft ? 'DRAFT' : 'OPEN',
      },
    });
    // Auto-match if published
    if (sr.status === 'OPEN') {
      await matchBusinesses(sr.id);
    }
    return NextResponse.json(sr, { status: 201 });
  } catch (e) { return requestError(e); }
}
