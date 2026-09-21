import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { apiError } from './server';

export class RequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function requestError(e: unknown) {
  if (e instanceof RequestError) return NextResponse.json({ error: e.message }, { status: e.status });
  return apiError(e);
}

export async function readRequestJson(req: Request) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? new URL(req.url).host;
  if (req.headers.get('sec-fetch-site') === 'cross-site' || (origin && new URL(origin).host !== host))
    throw new RequestError(403, 'Bu kaynaktan işlem yapılamaz.');
  const raw = await req.text();
  if (raw.length > 12000) throw new RequestError(413, 'İçerik çok uzun.');
  try { return JSON.parse(raw); } catch { throw new RequestError(400, 'Geçerli form verisi gönderin.'); }
}

/** Match open request to published & verified businesses by category + overlapping service districts */
export async function matchBusinesses(requestId: string) {
  const req = await prisma.serviceRequest.findUniqueOrThrow({ where: { id: requestId } });
  if (req.status !== 'OPEN') return 0;
  // Find published businesses in same category that serve at least one of the requested districts
  const businesses = await prisma.business.findMany({
    where: {
      status: 'PUBLISHED', verified: true, slug: { not: null },
      category: req.category,
      serviceDistricts: { hasSome: req.serviceDistricts },
    },
    select: { id: true },
    take: 50,
  });
  const count = businesses.length;
  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { matchCount: count, status: count > 0 ? 'MATCHED' : 'OPEN' },
  });
  return count;
}

export const offerSelect = {
  id: true, businessId: true, price: true, priceNote: true,
  timeline: true, message: true, status: true, createdAt: true,
  business: { select: { name: true, slug: true, category: true } },
} satisfies Prisma.OfferSelect;

export function mapOffer(o: any) {
  return {
    id: o.id, businessId: o.businessId, businessName: o.business.name,
    businessSlug: o.business.slug, businessCategory: o.business.category,
    price: o.price, priceNote: o.priceNote, timeline: o.timeline,
    message: o.message, status: o.status, createdAt: o.createdAt.toISOString(),
  };
}
