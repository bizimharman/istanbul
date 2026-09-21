import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { apiError } from './server';
import type { PlanItemView, PlanSummary, PlanDetail } from './plan-shared';

export class PlanError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
export function planError(e: unknown) {
  if (e instanceof PlanError) return NextResponse.json({ error: e.message }, { status: e.status });
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')
    return NextResponse.json({ error: 'Bu kayıt zaten mevcut.' }, { status: 409 });
  return apiError(e);
}

export async function readPlanJson(req: Request) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? new URL(req.url).host;
  if (req.headers.get('sec-fetch-site') === 'cross-site' || (origin && new URL(origin).host !== host))
    throw new PlanError(403, 'Bu kaynaktan işlem yapılamaz.');
  const raw = await req.text();
  if (raw.length > 16000) throw new PlanError(413, 'İçerik çok uzun.');
  try {
    return JSON.parse(raw);
  } catch {
    throw new PlanError(400, 'Geçerli form verisi gönderin.');
  }
}

/** Build target Date from plan date (yyyy-mm-dd Date) + "HH:MM" string, in local wall-clock terms. */
function targetDateTime(planDate: Date, targetTime: string): Date | null {
  if (!targetTime) return null;
  const [h, m] = targetTime.split(':').map((n) => parseInt(n, 10));
  const d = new Date(planDate);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

/** Points awarded for a single item given its completion state. */
export function awardFor(item: {
  status: string;
  points: number;
  completedAt: Date | null;
  targetTime: string;
}, planDate: Date): { awarded: number; onTime: boolean | null } {
  if (item.status !== 'DONE' || !item.completedAt) return { awarded: 0, onTime: null };
  const target = targetDateTime(planDate, item.targetTime);
  if (!target) return { awarded: item.points, onTime: true };
  const onTime = item.completedAt.getTime() <= target.getTime();
  return { awarded: onTime ? item.points : Math.floor(item.points / 2), onTime };
}

export const planInclude = {
  items: { orderBy: { order: 'asc' } },
  owner: { select: { name: true, email: true } },
  assignedBy: { select: { name: true, email: true } },
} satisfies Prisma.DayPlanInclude;

type PlanWithRel = Prisma.DayPlanGetPayload<{ include: typeof planInclude }>;

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function mapSummary(p: PlanWithRel, viewerId: string): PlanSummary {
  let total = 0;
  let earned = 0;
  let done = 0;
  for (const it of p.items) {
    total += it.points;
    if (it.status === 'DONE') {
      done += 1;
      earned += awardFor(it, p.date).awarded;
    }
  }
  return {
    id: p.id,
    kind: p.kind,
    title: p.title,
    date: dateStr(p.date),
    note: p.note,
    cancelled: p.cancelled,
    createdAt: p.createdAt.toISOString(),
    itemCount: p.items.length,
    doneCount: done,
    totalPoints: total,
    earnedPoints: earned,
    ownerName: p.owner.name,
    ownerEmail: p.owner.email,
    assignerName: p.assignedBy?.name ?? null,
    assigneeName: p.kind === 'ASSIGNED' ? p.owner.name : null,
    assigneeEmail: p.kind === 'ASSIGNED' ? p.owner.email : null,
    isOwner: p.ownerId === viewerId,
    isAssigner: p.assignedById === viewerId,
  };
}

export function mapItem(it: PlanWithRel['items'][number], planDate: Date): PlanItemView {
  const { awarded, onTime } = awardFor(it, planDate);
  return {
    id: it.id,
    order: it.order,
    title: it.title,
    description: it.description,
    district: it.district,
    location: it.location,
    targetTime: it.targetTime,
    points: it.points,
    status: it.status,
    completedAt: it.completedAt?.toISOString() ?? null,
    onTime,
    awardedPoints: awarded,
  };
}

export function mapDetail(p: PlanWithRel, viewerId: string): PlanDetail {
  return {
    ...mapSummary(p, viewerId),
    items: p.items.map((it) => mapItem(it, p.date)),
  };
}
