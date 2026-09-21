export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/server';
import { requestError, RequestError, offerSelect, mapOffer } from '@/lib/request-server';

/** Businesses see matching open/matched/offered requests */
export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    // Find user's published businesses
    const businesses = await prisma.business.findMany({
      where: { userId: user.id, status: 'PUBLISHED', verified: true, slug: { not: null } },
      select: { id: true, category: true, serviceDistricts: true, name: true, slug: true },
    });
    if (businesses.length === 0) return NextResponse.json([]);
    // Gather matching requests for all businesses
    const results: any[] = [];
    for (const biz of businesses) {
      const requests = await prisma.serviceRequest.findMany({
        where: {
          status: { in: ['OPEN', 'MATCHED', 'OFFERED'] },
          category: biz.category,
          serviceDistricts: { hasSome: biz.serviceDistricts },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { offers: { where: { businessId: biz.id }, select: offerSelect, take: 1 } },
      });
      for (const r of requests) {
        // Avoid duplicates if multiple businesses match same request
        if (results.some(x => x.id === r.id)) continue;
        results.push({
          id: r.id, title: r.title, description: r.description, category: r.category,
          district: r.district, serviceDistricts: r.serviceDistricts,
          budgetMin: r.budgetMin, budgetMax: r.budgetMax, timeline: r.timeline,
          structuredDetails: r.structuredDetails, createdAt: r.createdAt.toISOString(),
          myOffer: r.offers.length > 0 ? mapOffer(r.offers[0]) : null,
        });
      }
    }
    return NextResponse.json(results);
  } catch (e) { return requestError(e); }
}
