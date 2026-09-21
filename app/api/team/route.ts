export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/server';
import { planError, planInclude, mapSummary } from '@/lib/plan-server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    const plans = await prisma.dayPlan.findMany({
      where: { assignedById: user.id },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 200,
      include: planInclude,
    });
    return NextResponse.json(plans.map((p) => mapSummary(p, user.id)));
  } catch (e) {
    return planError(e);
  }
}
