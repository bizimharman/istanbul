export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/server';
import { offerFormSchema } from '@/lib/request-shared';
import { RequestError, requestError, readRequestJson } from '@/lib/request-server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    const { id: requestId } = await params;
    const body = await readRequestJson(req);
    const data = offerFormSchema.parse(body);

    // Verify user owns a published business that matches this request
    const sr = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!sr || !['OPEN', 'MATCHED', 'OFFERED'].includes(sr.status))
      throw new RequestError(404, 'Talep bulunamadı veya teklif kabul etmiyor.');

    const biz = await prisma.business.findFirst({
      where: {
        userId: user.id, status: 'PUBLISHED', verified: true, slug: { not: null },
        category: sr.category,
        serviceDistricts: { hasSome: sr.serviceDistricts },
      },
      select: { id: true },
    });
    if (!biz) throw new RequestError(403, 'Bu talep kategorisiyle eşleşen yayında bir işletmeniz yok.');

    // Check if already offered
    const existing = await prisma.offer.findUnique({ where: { requestId_businessId: { requestId, businessId: biz.id } } });
    if (existing) throw new RequestError(409, 'Bu talebe zaten teklif gönderdiniz.');

    // Rate limit: max 20 offers per business per day
    const dayAgo = new Date(Date.now() - 86400000);
    const recentOffers = await prisma.offer.count({ where: { businessId: biz.id, createdAt: { gte: dayAgo } } });
    if (recentOffers >= 20) throw new RequestError(429, 'Günlük teklif sınırına ulaştınız.');

    const offer = await prisma.offer.create({
      data: {
        requestId, businessId: biz.id,
        price: data.price, priceNote: data.priceNote,
        timeline: data.timeline, message: data.message,
      },
    });
    // Update request status
    await prisma.serviceRequest.update({ where: { id: requestId }, data: { status: 'OFFERED' } });
    return NextResponse.json(offer, { status: 201 });
  } catch (e) { return requestError(e); }
}
