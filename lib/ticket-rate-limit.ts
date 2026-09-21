import { createHash } from 'crypto';
import { prisma } from '@/lib/db';

// Pilot defaults: admission attempts, including failed AI requests. No automatic retries.
export const TICKET_LIMITS = [
  { name: 'burst', limit: 3, windowMs: 10 * 60 * 1000 },
  { name: 'daily', limit: 20, windowMs: 24 * 60 * 60 * 1000 },
] as const;

class LimitReached extends Error {
  constructor(readonly retryAfter: number) { super('Başvuru gönderim sınırına ulaşıldı.'); }
}

export async function admitTicketRequest(userId: string): Promise<{ allowed: true } | { allowed: false; retryAfter: number }> {
  const now = Date.now();
  const subject = createHash('sha256').update(userId).digest('hex');
  // Only expired operational counters are removed; no user or ticket data is touched.
  await prisma.rateLimitBucket.deleteMany({ where: { expiresAt: { lte: new Date(now) } } });
  try {
    await prisma.$transaction(async (tx) => {
      for (const rule of TICKET_LIMITS) {
        const start = Math.floor(now / rule.windowMs) * rule.windowMs;
        const expiresAt = new Date(start + rule.windowMs);
        const key = `ticket:${subject}:${rule.name}:${start}`;
        // Atomic across application processes; denied attempts cannot increment past the cap.
        const rows = await tx.$queryRaw<{ count: number }[]>`
          INSERT INTO "RateLimitBucket" ("key", "count", "expiresAt")
          VALUES (${key}, 1, ${expiresAt})
          ON CONFLICT ("key") DO UPDATE SET "count" = "RateLimitBucket"."count" + 1
          WHERE "RateLimitBucket"."count" < ${rule.limit}
          RETURNING "count"`;
        if (!rows.length) throw new LimitReached(Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)));
      }
    });
    return { allowed: true };
  } catch (error) {
    if (error instanceof LimitReached) return { allowed: false, retryAfter: error.retryAfter };
    throw error; // Fail closed: a database failure must not permit an unmetered AI call.
  }
}
