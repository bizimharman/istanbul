import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { hash } from 'bcryptjs';
import { prisma } from '../lib/db';
import { admitTicketRequest, TICKET_LIMITS } from '../lib/ticket-rate-limit';

const base = 'http://localhost:3000'; // Abacus AI Agent virtual machine only.
const tag = randomUUID();
const userIds: string[] = [];
const ticketIds: string[] = [];
const subjects: string[] = [];
const subjectFor = (id: string) => createHash('sha256').update(id).digest('hex');
const check = (message: string) => console.log(`PASS: ${message}`);
async function api(path: string, cookie = '', method = 'GET', body?: unknown) {
  return fetch(`${base}${path}`, {
    method, headers: { Cookie: cookie, Origin: base, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(20000),
  });
}
async function account(role: 'CITIZEN' | 'MUNICIPAL_ADMIN') {
  const password = randomUUID() + randomUUID();
  const email = `guard-${role.toLowerCase()}-${tag}@example.test`;
  const user = await prisma.user.create({ data: { name: 'Geçici koruma testi', email, passwordHash: await hash(password, 12), role } });
  userIds.push(user.id); subjects.push(subjectFor(user.id));
  const response = await api('/api/auth/login', '', 'POST', { email, password });
  assert.equal(response.status, 200, 'Geçici test oturumu açılmalı');
  const cookie = response.headers.getSetCookie().map((value) => value.split(';')[0]).join('; ');
  assert.ok(cookie, 'Oturum çerezi dönmeli');
  assert.equal((await api('/api/profile', cookie)).status, 200);
  return { user, cookie };
}
async function fillBucket(id: string, rule: typeof TICKET_LIMITS[number]) {
  const now = Date.now();
  const start = Math.floor(now / rule.windowMs) * rule.windowMs;
  const key = `ticket:${subjectFor(id)}:${rule.name}:${start}`;
  await prisma.rateLimitBucket.upsert({ where: { key }, create: { key, count: rule.limit, expiresAt: new Date(start + rule.windowMs) }, update: { count: rule.limit } });
}
async function main() {
  try {
    const citizen = await account('CITIZEN');
    const admin = await account('MUNICIPAL_ADMIN');
    const limiterId = `guard-limit-${tag}`;
    subjects.push(subjectFor(limiterId));
    const results = await Promise.all(Array.from({ length: 5 }, () => admitTicketRequest(limiterId)));
    assert.equal(results.filter((r) => r.allowed).length, 3);
    assert.equal(results.filter((r) => !r.allowed).length, 2);
    const counters = await prisma.rateLimitBucket.findMany({ where: { key: { startsWith: `ticket:${subjectFor(limiterId)}:` } } });
    assert.equal(counters.length, 2);
    assert.ok(counters.every((row) => row.count === 3));
    check('Eşzamanlı 5 istekte yalnız 3 kabul; reddedilenler diğer sayacı tüketmiyor.');

    const dailyId = `guard-day-${tag}`;
    subjects.push(subjectFor(dailyId));
    await fillBucket(dailyId, TICKET_LIMITS[1]);
    const daily = await admitTicketRequest(dailyId);
    assert.equal(daily.allowed, false);
    assert.equal(await prisma.rateLimitBucket.count({ where: { key: { startsWith: `ticket:${subjectFor(dailyId)}:burst:` } } }), 0);
    check('Günlük sınır ve işlem geri alma koruması.');
    await prisma.rateLimitBucket.deleteMany({ where: { key: { startsWith: `ticket:${subjectFor(dailyId)}:` } } });
    await prisma.rateLimitBucket.create({ data: { key: `ticket:${subjectFor(dailyId)}:expired`, count: 20, expiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await admitTicketRequest(dailyId)).allowed, true);
    assert.equal(await prisma.rateLimitBucket.count({ where: { key: `ticket:${subjectFor(dailyId)}:expired` } }), 0);
    check('Süresi dolan sayaç temizleniyor; yeni dönem başvuruyu kabul ediyor.');

    // Saturate both rules before the endpoint call; no LLM request is made by this test.
    for (const rule of TICKET_LIMITS) await fillBucket(citizen.user.id, rule);
    const payload = { title: 'Pilot güvenlik kontrolü', description: 'Bu kayıt yalnızca gönderim sınırını doğrulayan geçici bir testtir.', district: 'Kadıköy', category: 'OTHER', uploadIds: [] };
    assert.equal((await api('/api/tickets', '', 'POST', payload)).status, 401);
    assert.equal((await api('/api/tickets', citizen.cookie, 'POST', { ...payload, title: 'x' })).status, 400);
    const limited = await api('/api/tickets', citizen.cookie, 'POST', payload);
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get('Retry-After')) > 0);
    assert.equal(await prisma.ticket.count({ where: { userId: citizen.user.id } }), 0);
    assert.equal((await api('/api/tickets', citizen.cookie)).status, 200);
    check('Gerçek API: oturumsuz 401, geçersiz veri 400, sınırda 429 ve bekleme süresi; listeleme açık.');

    for (let round = 0; round < 3; round++) {
      const ticket = await prisma.ticket.create({ data: { userId: citizen.user.id, title: 'Geçici eşzamanlılık testi', description: 'Yalnızca otomatik test için oluşturulan ve test sonunda silinen kayıt.', district: 'Kadıköy', selectedCategory: 'OTHER', category: 'OTHER', assignedDepartment: 'Test birimi', aiConfidenceScore: 0 } });
      ticketIds.push(ticket.id);
      const path = `/api/tickets/${ticket.id}`;
      const body = { status: 'IN_PROGRESS', adminResponse: 'Kontrol işlemi başlatıldı.', expectedUpdatedAt: ticket.updatedAt.toISOString() };
      assert.equal((await api(path, citizen.cookie, 'PATCH', body)).status, 403);
      assert.equal((await api(path, admin.cookie, 'PATCH', { status: 'IN_PROGRESS', adminResponse: body.adminResponse })).status, 400);
      assert.equal((await api(path, admin.cookie, 'PATCH', { ...body, status: 'RESOLVED' })).status, 400);
      const concurrent = await Promise.all([api(path, admin.cookie, 'PATCH', body), api(path, admin.cookie, 'PATCH', { ...body, adminResponse: 'İkinci yönetici kontrolü.' })]);
      assert.deepEqual(concurrent.map((r) => r.status).sort(), [200, 409]);
      assert.equal(await prisma.ticketEvent.count({ where: { ticketId: ticket.id } }), 1);
      assert.equal((await api(path, admin.cookie, 'PATCH', body)).status, 409);
      const freshResponse = await api(path, admin.cookie);
      assert.equal(freshResponse.status, 200);
      const fresh = await freshResponse.json();
      assert.equal(fresh.status, 'IN_PROGRESS');
      assert.equal((await api(path, admin.cookie, 'PATCH', { ...body, status: 'RESOLVED', expectedUpdatedAt: fresh.updatedAt })).status, 200);
      const resolved = await prisma.ticket.findUniqueOrThrow({ where: { id: ticket.id } });
      assert.equal((await api(path, admin.cookie, 'PATCH', { ...body, status: 'OPEN', expectedUpdatedAt: resolved.updatedAt.toISOString() })).status, 400);
      assert.equal(await prisma.ticketEvent.count({ where: { ticketId: ticket.id } }), 2);
    }
    check('3 tur: eşzamanlı güncellemelerde 200/409, tek geçmiş kaydı; güncel sürümle çözüm başarılı.');
    check('Vatandaşın yönetici yazma yetkisi yok; eski sürüm ve geçersiz durum geçişleri reddediliyor.');
  } finally {
    // Delete only IDs allocated by this invocation, never existing app records.
    if (ticketIds.length) await prisma.ticket.deleteMany({ where: { id: { in: ticketIds } } });
    if (userIds.length) await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    if (subjects.length) await prisma.rateLimitBucket.deleteMany({ where: { OR: subjects.map((s) => ({ key: { startsWith: `ticket:${s}:` } })) } });
    check('Bu çalıştırmaya ait geçici test verileri temizlendi.');
    await prisma.$disconnect();
  }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : 'Pilot testi başarısız.'); process.exitCode = 1; });
