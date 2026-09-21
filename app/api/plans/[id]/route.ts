export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/server';
import { PlanError, planError, readPlanJson, planInclude, mapDetail } from '@/lib/plan-server';

async function loadViewable(id: string, viewerId: string) {
  const plan = await prisma.dayPlan.findFirst({
    where: { id, OR: [{ ownerId: viewerId }, { assignedById: viewerId }] },
    include: planInclude,
  });
  return plan;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    const { id } = await params;
    const plan = await loadViewable(id, user.id);
    if (!plan) return NextResponse.json({ error: 'Plan bulunamadı.' }, { status: 404 });
    return NextResponse.json(mapDetail(plan, user.id));
  } catch (e) {
    return planError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    const { id } = await params;
    const body = await readPlanJson(req);
    const plan = await prisma.dayPlan.findFirst({
      where: { id, OR: [{ ownerId: user.id }, { assignedById: user.id }] },
      select: { id: true, ownerId: true, assignedById: true, cancelled: true },
    });
    if (!plan) return NextResponse.json({ error: 'Plan bulunamadı.' }, { status: 404 });
    const isOwner = plan.ownerId === user.id;

    if (body.action === 'complete_item' || body.action === 'uncomplete_item') {
      if (!isOwner) throw new PlanError(403, 'Görevleri yalnızca planı yürüten kişi işaretleyebilir.');
      if (plan.cancelled) throw new PlanError(400, 'İptal edilmiş planda değişiklik yapılamaz.');
      const itemId = String(body.itemId ?? '');
      const item = await prisma.planItem.findFirst({ where: { id: itemId, planId: id } });
      if (!item) throw new PlanError(404, 'Görev bulunamadı.');
      if (body.action === 'complete_item') {
        await prisma.planItem.update({
          where: { id: itemId },
          data: { status: 'DONE', completedAt: new Date() },
        });
      } else {
        await prisma.planItem.update({
          where: { id: itemId },
          data: { status: 'PENDING', completedAt: null },
        });
      }
      const fresh = await prisma.dayPlan.findFirst({ where: { id }, include: planInclude });
      return NextResponse.json(mapDetail(fresh!, user.id));
    }

    if (body.action === 'cancel') {
      await prisma.dayPlan.update({ where: { id }, data: { cancelled: true } });
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'reopen') {
      await prisma.dayPlan.update({ where: { id }, data: { cancelled: false } });
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'delete') {
      // Only the creator may delete: owner of a personal plan, or assigner of an assigned plan.
      const canDelete = plan.assignedById ? plan.assignedById === user.id : plan.ownerId === user.id;
      if (!canDelete) throw new PlanError(403, 'Bu planı silme yetkiniz yok.');
      await prisma.dayPlan.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    throw new PlanError(400, 'Geçersiz işlem.');
  } catch (e) {
    return planError(e);
  }
}
