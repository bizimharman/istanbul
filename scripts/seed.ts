import { prisma } from '../lib/db';
import { hash } from 'bcryptjs';
async function main(){
 if(process.env.SEED_BUSINESS_ADMIN_ONLY==='true'){
  const result=await prisma.user.updateMany({where:{email:'yonetici@istanbul-akilli.test'},data:{isPlatformAdmin:true}});
  if(result.count!==1)throw new Error('Mevcut proje yöneticisi bulunamadı; yetki verilmedi.');
  console.log('Mevcut proje yöneticisinin ayrı platform yönetim yetkisi etkinleştirildi.');return;
 }
 const accounts=[{email:'abacus-eef42cd8@example.com',password:'H0h*WeipE1',name:'Sistem Test Yöneticisi'},{email:'yonetici@istanbul-akilli.test',password:'4KU92VvjA4ElyAb6cPfM',name:'Belediye Yöneticisi'}];
 for(const a of accounts)await prisma.user.upsert({where:{email:a.email},update:{},create:{email:a.email,name:a.name,passwordHash:await hash(a.password,12),role:'MUNICIPAL_ADMIN',district:'Kadıköy'}});
 const admin=await prisma.user.findUniqueOrThrow({where:{email:'yonetici@istanbul-akilli.test'}});
 const rows=[{id:'demo-water',title:'Planlı su kesintisi bilgilendirmesi',content:'Bu bir örnek duyurudur, gerçek bir kesinti bildirmez. Planlı su kesintilerinin kapsamı ve saatleri bu alanda paylaşılacaktır.',type:'WATER_OUTAGE' as const,district:'Kadıköy'},{id:'demo-road',title:'Daha güvenli yollar için birlikte',content:'Bu bir örnek duyurudur. Yol bakım ve onarım çalışmalarını mahalle bilgileriyle bu alandan takip edebilirsiniz.',type:'ROAD_WORK' as const,district:'Kadıköy'},{id:'demo-event',title:'Şehrin geleceğine sen de katkı sağla',content:'Bu bir örnek duyurudur. Mahalle buluşmaları ve kent etkinlikleri belediye yöneticileri tarafından burada duyurulacaktır.',type:'EVENT' as const,district:'Tüm İstanbul'}];
 for(const a of rows)await prisma.announcement.upsert({where:{id:a.id},update:{},create:{...a,adminId:admin.id,startDate:new Date('2026-01-01T00:00:00Z'),endDate:new Date('2030-12-31T23:59:00Z'),isDemo:true}});
 console.log('Başlangıç verileri hazır.');
}
main().catch((e:unknown)=>{console.error(e);process.exitCode=1;}).finally(()=>prisma.$disconnect());
