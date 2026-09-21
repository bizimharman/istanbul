export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/server';
import { planFormSchema } from '@/lib/plan-shared';
import { PlanError, planError, readPlanJson, planInclude, mapSummary } from '@/lib/plan-server';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    const plans = await prisma.dayPlan.findMany({
      where: { ownerId: user.id },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 100,
      include: planInclude,
    });
    return NextResponse.json(plans.map((p) => mapSummary(p, user.id)));
  } catch (e) {
    return planError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    const body = await readPlanJson(req);
    const data = planFormSchema.parse(body);

    const email = data.assigneeEmail.trim().toLowerCase();
    let ownerId = user.id;
    let kind: 'PERSONAL' | 'ASSIGNED' = 'PERSONAL';
    let assignedById: string | null = null;

    if (email) {
      if (email === user.email.toLowerCase())
        throw new PlanError(400, 'Kendinize görev atamak yerine kişisel plan oluşturun (e-posta alanını boş bırakın).');
      const target = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (!target)
        throw new PlanError(404, 'Bu e-posta ile kayıtlı bir kullanıcı bulunamadı. Kişinin platforma kayıtlı olması gerekir.');
      ownerId = target.id;
      kind = 'ASSIGNED';
      assignedById = user.id;

      // Rate limit: max 30 assignments created per assigner per day
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const assignedToday = await prisma.dayPlan.count({
        where: { assignedById: user.id, createdAt: { gte: since } },
      });
      if (assignedToday >= 30)
        throw new PlanError(429, 'Günlük görev atama sınırına ulaştınız (24 saatte 30). Lütfen daha sonra tekrar deneyin.');
    } else {
      // Rate limit: max 60 active personal plans
      const activeCount = await prisma.dayPlan.count({
        where: { ownerId: user.id, cancelled: false },
      });
      if (activeCount >= 60)
        throw new PlanError(429, 'Çok fazla aktif planınız var. Eski planları iptal edin veya silin.');
    }

    const plan = await prisma.dayPlan.create({
      data: {
        ownerId,
        assignedById,
        kind,
        title: data.title,
        date: new Date(data.date),
        note: data.note,
        items: {
          create: data.items.map((it, i) => ({
            order: i,
            title: it.title,
            description: it.description,
            district: it.district,
            location: it.location,
            targetTime: it.targetTime,
            points: it.points,
          })),
        },
      },
      select: { id: true },
    });
    return NextResponse.json({ id: plan.id }, { status: 201 });
  } catch (e) {
    return planError(e);
  }
}
