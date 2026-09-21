export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/server';
import { RequestError, requestError, readRequestJson, matchBusinesses, offerSelect, mapOffer } from '@/lib/request-server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    const { id } = await params;
    const sr = await prisma.serviceRequest.findFirst({
      where: { id, userId: user.id },
      include: { offers: { select: offerSelect, orderBy: { createdAt: 'asc' } } },
    });
    if (!sr) return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 });
    return NextResponse.json({
      id: sr.id, title: sr.title, description: sr.description, category: sr.category,
      district: sr.district, serviceDistricts: sr.serviceDistricts,
      budgetMin: sr.budgetMin, budgetMax: sr.budgetMax, timeline: sr.timeline,
      structuredDetails: sr.structuredDetails, status: sr.status,
      matchCount: sr.matchCount, offerCount: sr.offers.length,
      createdAt: sr.createdAt.toISOString(),
      offers: sr.offers.map(mapOffer),
    });
  } catch (e) { return requestError(e); }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    const { id } = await params;
    const body = await readRequestJson(req);
    const sr = await prisma.serviceRequest.findFirst({ where: { id, userId: user.id } });
    if (!sr) return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 });

    // Cancel
    if (body.action === 'cancel') {
      if (['CLOSED', 'CANCELLED'].includes(sr.status)) throw new RequestError(400, 'Bu talep zaten sonuçlanmış.');
      await prisma.serviceRequest.update({ where: { id }, data: { status: 'CANCELLED' } });
      return NextResponse.json({ ok: true });
    }
    // Accept offer
    if (body.action === 'accept_offer') {
      const offerId = body.offerId;
      if (!offerId) throw new RequestError(400, 'Teklif seçilmedi.');
      const offer = await prisma.offer.findFirst({ where: { id: offerId, requestId: id, status: 'PENDING' } });
      if (!offer) throw new RequestError(404, 'Teklif bulunamadı veya zaten yanıtlanmış.');
      await prisma.$transaction([
        prisma.offer.update({ where: { id: offerId }, data: { status: 'ACCEPTED' } }),
        prisma.offer.updateMany({ where: { requestId: id, id: { not: offerId }, status: 'PENDING' }, data: { status: 'DECLINED' } }),
        prisma.serviceRequest.update({ where: { id }, data: { status: 'ACCEPTED' } }),
      ]);
      return NextResponse.json({ ok: true });
    }
    // Decline offer
    if (body.action === 'decline_offer') {
      const offerId = body.offerId;
      if (!offerId) throw new RequestError(400, 'Teklif seçilmedi.');
      const offer = await prisma.offer.findFirst({ where: { id: offerId, requestId: id, status: 'PENDING' } });
      if (!offer) throw new RequestError(404, 'Teklif bulunamadı veya zaten yanıtlanmış.');
      await prisma.offer.update({ where: { id: offerId }, data: { status: 'DECLINED' } });
      return NextResponse.json({ ok: true });
    }
    // Publish draft
    if (body.action === 'publish') {
      if (sr.status !== 'DRAFT') throw new RequestError(400, 'Yalnız taslak talepler yayınlanabilir.');
      await prisma.serviceRequest.update({ where: { id }, data: { status: 'OPEN' } });
      await matchBusinesses(id);
      return NextResponse.json({ ok: true });
    }
    throw new RequestError(400, 'Geçersiz işlem.');
  } catch (e) { return requestError(e); }
}
