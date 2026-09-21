import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {hash} from 'bcryptjs';
import {prisma} from '../lib/db';
import {emptyBusiness} from '../lib/business-shared';
const base='http://localhost:3000'; // Yalnızca ajan sanal makinesindeki çalışan önizleme.
const tag=randomUUID(),ids:string[]=[];
let checks=0;
function pass(label:string){checks++;console.log(`GEÇTİ: ${label}`);}
async function api(path:string,cookie='',method='GET',body?:unknown,origin=base){return fetch(base+path,{method,headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(40000)});}
async function account(role:'CITIZEN'|'MUNICIPAL_ADMIN',isPlatformAdmin=false){const password=randomUUID()+randomUUID();const email=`business-${randomUUID()}@example.test`;const u=await prisma.user.create({data:{name:'Geçici işletme testi',email,passwordHash:await hash(password,10),role,isPlatformAdmin}});ids.push(u.id);const r=await api('/api/auth/login','','POST',{email,password});assert.equal(r.status,200);const cookie=r.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');return {...u,cookie};}
async function main(){try{
 const owner=await account('CITIZEN'),municipal=await account('MUNICIPAL_ADMIN'),moderator=await account('CITIZEN',true);
 const form={...emptyBusiness,name:`Geçici Mobilya ${tag}`,description:'İstanbul’da özel ölçü kitaplık ve dolap üretimi için geçici doğrulama kaydıdır. Gerçek işletme değildir. <script>window.__unsafe=1</script>',services:'Özel ölçü kitaplık üretimi, montaj ve keşif hizmeti.',verificationContact:`private-${tag}@example.test`,ownershipStatement:`PRIVATE-${tag}: Test hesabı, gerçek işletme veya gerçek kontrol değildir.`,publicAddress:'Geçici Test İş Merkezi, örnek adres',attested:true,submit:true};
 assert.equal((await api('/api/businesses')).status,401);assert.equal((await api('/api/platform/businesses')).status,401);assert.equal((await api('/api/platform/businesses',municipal.cookie)).status,403);pass('Oturum ve belediye/platform yetkisi ayrımı');
 const signupEmail=`business-signup-${tag}@example.test`;const signed=await api('/api/signup','','POST',{name:'Geçici Yetki Testi',email:signupEmail,password:randomUUID()+randomUUID(),role:'MUNICIPAL_ADMIN',isPlatformAdmin:true});assert.equal(signed.status,201);const signedUser=await prisma.user.findUniqueOrThrow({where:{email:signupEmail}});ids.push(signedUser.id);assert.equal(signedUser.isPlatformAdmin,false);assert.equal(signedUser.role,'CITIZEN');pass('Kayıttan yönetici yetkisi alınamıyor');
 assert.equal((await api('/api/businesses',owner.cookie,'POST',{...form,serviceDistricts:['Ankara']})).status,400);
 assert.equal((await api('/api/businesses',owner.cookie,'POST',{...form,website:'javascript:alert(1)'})).status,400);
 assert.equal((await api('/api/businesses',owner.cookie,'POST',form,'https://foreign.example')).status,403);pass('Alan doğrulama, zararlı URL ve farklı kaynak kontrolü');
 const created=await api('/api/businesses',owner.cookie,'POST',{...form,status:'PUBLISHED',verified:true,userId:moderator.id});assert.equal(created.status,201);let b=await created.json();assert.equal(b.userId,owner.id);assert.equal(b.status,'PENDING');assert.equal(b.verified,false);const id=b.id,slug=b.slug;
 assert.equal((await api(`/api/directory/${slug}`)).status,404);assert.ok(!(await (await api('/isletmeler/sitemap/0.xml')).text()).includes(slug));pass('Onaysız profil açık API ve site haritasından gizli');
 assert.equal((await api('/api/businesses',owner.cookie,'POST',form)).status,409);
 assert.equal((await api(`/api/businesses/${id}`,municipal.cookie,'PATCH',{...form,action:'save',revision:b.revision})).status,404);
 assert.equal((await api('/api/businesses',municipal.cookie)).status,200);assert.deepEqual(await (await api('/api/businesses',municipal.cookie)).json(),[]);pass('Mükerrer kayıt ve başka işletmenin kaydına erişim engeli');
 const approve={action:'approve',revision:b.revision,message:'Geçici test: bağımsız sahiplik kontrol adımı sınandı.',method:'OFFICIAL_CONTACT',confirmed:true};
 assert.equal((await api(`/api/platform/businesses/${id}`,owner.cookie,'PATCH',approve)).status,403);
 assert.equal((await api(`/api/platform/businesses/${id}`,municipal.cookie,'PATCH',approve)).status,403);
 assert.equal((await api(`/api/platform/businesses/${id}`,moderator.cookie,'PATCH',{...approve,confirmed:false})).status,400);pass('Yayın onayı ayrı yetki ve kontrol beyanı istiyor');
 for(let round=0;round<3;round++){
  if(round){b=await prisma.business.findUniqueOrThrow({where:{id}});assert.equal((await api(`/api/businesses/${id}`,owner.cookie,'PATCH',{...form,action:'submit',revision:b.revision})).status,200);b=await prisma.business.findUniqueOrThrow({where:{id}});}
  const before=await prisma.businessEvent.count({where:{businessId:id,action:'APPROVE'}});
  const results=await Promise.all([api(`/api/platform/businesses/${id}`,moderator.cookie,'PATCH',{...approve,revision:b.revision}),api(`/api/platform/businesses/${id}`,moderator.cookie,'PATCH',{...approve,revision:b.revision})]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal(await prisma.businessEvent.count({where:{businessId:id,action:'APPROVE'}}),before+1);
 }pass('Üç tur eşzamanlı onay: tek onay ve tek işlem kaydı');
 b=await prisma.business.findUniqueOrThrow({where:{id}});
 const publicResponse=await api(`/api/directory/${slug}`);assert.equal(publicResponse.status,200);const pub=await publicResponse.json();for(const k of ['userId','verificationContact','ownershipStatement','reviewMessage','identityKey','events'])assert.ok(!(k in pub));
 const html=await (await api(`/isletmeler/${slug}`)).text();assert.ok(html.includes(b.name));assert.ok(!html.includes(form.verificationContact));assert.ok(!html.includes(`PRIVATE-${tag}`));assert.ok(!html.includes('<script>window.__unsafe=1</script>'));const json=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);assert.ok(json);const schema=JSON.parse(json![1]);assert.equal(schema['@type'],'LocalBusiness');assert.equal(schema.description,form.description);assert.ok(!schema.aggregateRating);assert.ok(html.includes('rel="canonical"'));pass('Açık profil HTML/JSON-LD, özel veri ayrımı ve içerik enjeksiyonu kontrolü');
 const listing=await (await api(`/api/directory?district=${encodeURIComponent('Kadıköy')}&q=${encodeURIComponent(tag)}&category=CUSTOM_FURNITURE`)).json();assert.equal(listing.items.length,1);const excluded=await (await api(`/api/directory?district=${encodeURIComponent('Adalar')}&q=${encodeURIComponent(tag)}`)).json();assert.equal(excluded.items.length,0);pass('Ad, kategori ve hizmet bölgesi filtreleri');
 const sitemap=await api('/isletmeler/sitemap/0.xml');assert.equal(sitemap.status,200);assert.ok((await sitemap.text()).includes(slug));const robots=await (await api('/robots.txt')).text();assert.ok(robots.includes('/isletmeler/sitemap/0.xml'));assert.ok(robots.includes('/platform/'));const filtered=await (await api('/isletmeler?q=notfound')).text();assert.match(filtered,/name="robots" content="noindex, follow"/);pass('Bölümlü site haritası, robots ve filtre noindex çıktıları');
 const stale=await api(`/api/businesses/${id}`,owner.cookie,'PATCH',{...form,action:'save',revision:1});assert.equal(stale.status,409);
 assert.equal((await api(`/api/businesses/${id}`,owner.cookie,'PATCH',{...form,action:'save',revision:b.revision})).status,200);
 assert.equal((await api(`/api/directory/${slug}`)).status,404);assert.ok(!(await (await api('/isletmeler/sitemap/0.xml')).text()).includes(slug));b=await prisma.business.findUniqueOrThrow({where:{id}});assert.equal(b.slug,slug);assert.equal(b.status,'DRAFT');pass('Düzenlemede tekrar inceleme, sabit profil adresi ve eski sürüm engeli');
 assert.equal((await api(`/api/businesses/${id}`,owner.cookie,'PATCH',{...form,action:'submit',revision:b.revision})).status,200);b=await prisma.business.findUniqueOrThrow({where:{id}});
 assert.equal((await api(`/api/platform/businesses/${id}`,moderator.cookie,'PATCH',{...approve,revision:b.revision,action:'changes',message:'Geçici test için hizmet kapsamını açıklayın.'})).status,200);b=await prisma.business.findUniqueOrThrow({where:{id}});assert.equal(b.status,'CHANGES_REQUESTED');
 assert.equal((await api(`/api/businesses/${id}`,owner.cookie,'PATCH',{...form,action:'submit',revision:b.revision})).status,200);b=await prisma.business.findUniqueOrThrow({where:{id}});
 assert.equal((await api(`/api/platform/businesses/${id}`,moderator.cookie,'PATCH',{...approve,revision:b.revision})).status,200);b=await prisma.business.findUniqueOrThrow({where:{id}});
 assert.equal((await api(`/api/platform/businesses/${id}`,moderator.cookie,'PATCH',{...approve,revision:b.revision,action:'suspend'})).status,200);b=await prisma.business.findUniqueOrThrow({where:{id}});
 assert.equal((await api(`/api/businesses/${id}`,owner.cookie,'PATCH',{...form,action:'submit',revision:b.revision})).status,403);assert.equal((await api(`/api/directory/${slug}`)).status,404);
 assert.equal((await api(`/api/platform/businesses/${id}`,moderator.cookie,'PATCH',{...approve,revision:b.revision,action:'changes'})).status,200);pass('Düzeltme, yeniden gönderim, yayın durdurma ve kontrollü açma');
 const selfResponse=await api('/api/businesses',moderator.cookie,'POST',{...form,name:`Kendi kaydı ${tag}`});assert.equal(selfResponse.status,201);const self=await selfResponse.json();assert.equal((await api(`/api/platform/businesses/${self.id}`,moderator.cookie,'PATCH',{...approve,revision:self.revision})).status,403);pass('İnceleyici kendi işletmesini onaylayamıyor');
 for(let i=0;i<4;i++)assert.equal((await api('/api/businesses',owner.cookie,'POST',{...form,name:`Kota ${i} ${tag}`,submit:false})).status,201);assert.equal((await api('/api/businesses',owner.cookie,'POST',{...form,name:`Kota fazlası ${tag}`})).status,429);pass('Hesap başına kayıt kotası');
 const count=await prisma.businessEvent.count({where:{actorId:owner.id}});if(count<50)await prisma.businessEvent.createMany({data:Array.from({length:50-count},()=>({businessId:id,actorId:owner.id,action:'TEST',message:'Geçici kota testi'}))});b=await prisma.business.findUniqueOrThrow({where:{id}});assert.equal((await api(`/api/businesses/${id}`,owner.cookie,'PATCH',{action:'withdraw',revision:b.revision})).status,429);assert.equal((await api('/api/businesses',owner.cookie)).status,200);pass('Günlük işlem sınırı okumayı engellemiyor');
 console.log(`SONUÇ: ${checks} hedefli kontrol grubu geçti. Yapay zekâ çağrısı yapılmadı.`);
 }finally{await prisma.business.deleteMany({where:{userId:{in:ids}}});await prisma.user.deleteMany({where:{id:{in:ids}}});console.log('Yalnızca bu çalışmanın geçici hesap ve işletmeleri temizlendi.');await prisma.$disconnect();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
