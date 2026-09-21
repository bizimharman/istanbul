import {prisma} from '../lib/db';
async function main(){
 await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "Business_slug_key" ON "Business" ("slug")');
 await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "Business_identityKey_key" ON "Business" ("identityKey")');
 await prisma.$executeRawUnsafe('CREATE INDEX CONCURRENTLY IF NOT EXISTS "Business_userId_createdAt_idx" ON "Business" ("userId", "createdAt")');
 await prisma.$executeRawUnsafe('CREATE INDEX CONCURRENTLY IF NOT EXISTS "Business_status_category_id_idx" ON "Business" ("status", "category", "id")');
 await prisma.$executeRawUnsafe('CREATE INDEX CONCURRENTLY IF NOT EXISTS "Business_status_id_idx" ON "Business" ("status", "id")');
 await prisma.$executeRawUnsafe('CREATE INDEX CONCURRENTLY IF NOT EXISTS "Business_serviceDistricts_idx" ON "Business" USING GIN ("serviceDistricts")');
 await prisma.$executeRawUnsafe('CREATE INDEX CONCURRENTLY IF NOT EXISTS "BusinessEvent_businessId_createdAt_idx" ON "BusinessEvent" ("businessId", "createdAt")');
 await prisma.$executeRawUnsafe('CREATE INDEX CONCURRENTLY IF NOT EXISTS "BusinessEvent_actorId_createdAt_idx" ON "BusinessEvent" ("actorId", "createdAt")');
 console.log('İşletme dizinleri oluşturuldu.');
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>prisma.$disconnect());
