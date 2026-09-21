import {createHash,randomUUID} from 'node:crypto';
import {Prisma} from '@prisma/client';
import {NextResponse} from 'next/server';
import {prisma} from './db';
import {apiError} from './server';
import {BusinessForm} from './business-shared';
export class BusinessError extends Error {constructor(public status:number,message:string){super(message);}}
export function businessError(e:unknown){if(e instanceof BusinessError)return NextResponse.json({error:e.message},{status:e.status});if(e instanceof Prisma.PrismaClientKnownRequestError&&e.code==='P2002')return NextResponse.json({error:'Aynı ad, şube ve ilçeyle bir kayıt zaten var. Mevcut profilinizi kontrol edin; sahiplik anlaşmazlığı varsa inceleme gerekir.'},{status:409});return apiError(e);}
export async function readBusinessJson(req:Request){
 const origin=req.headers.get('origin');const host=req.headers.get('x-forwarded-host')??req.headers.get('host')??new URL(req.url).host;
 if(req.headers.get('sec-fetch-site')==='cross-site'||(origin&&new URL(origin).host!==host))throw new BusinessError(403,'Bu kaynaktan işlem yapılamaz.');
 const raw=await req.text();if(raw.length>24000)throw new BusinessError(413,'Gönderilen içerik çok uzun.');try{return JSON.parse(raw);}catch{throw new BusinessError(400,'Geçerli form verisi gönderin.');}
}
export function identityKey(d:BusinessForm){return createHash('sha256').update([d.name,d.branchName,d.district].map(v=>v.toLocaleLowerCase('tr-TR').replace(/\s+/g,' ').trim()).join('|')).digest('hex');}
export function businessSlug(name:string){const base=name.toLocaleLowerCase('tr-TR').replace(/[çğıöşü]/g,c=>({'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u'}[c]!)).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,65)||'isletme';return `${base}-${randomUUID().slice(0,8)}`;}
export async function lockBusinessActor(tx:Prisma.TransactionClient,id:string){await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`business:${id}`}))::text`;const count=await tx.businessEvent.count({where:{actorId:id,createdAt:{gte:new Date(Date.now()-86400000)}}});if(count>=50)throw new BusinessError(429,'Günlük işletme işlem sınırına ulaştınız. Daha sonra tekrar deneyin.');}
export const publicBusinessSelect={id:true,slug:true,name:true,branchName:true,category:true,district:true,description:true,services:true,exclusions:true,serviceDistricts:true,publicAddress:true,publicPhone:true,website:true,hoursText:true,verifiedAt:true,updatedAt:true} satisfies Prisma.BusinessSelect;
export const publishedWhere={status:'PUBLISHED',verified:true,slug:{not:null}} satisfies Prisma.BusinessWhereInput;
export async function publishedBusiness(slug:string){return prisma.business.findFirst({where:{...publishedWhere,slug},select:publicBusinessSelect});}
export async function listPublicBusinesses({category='',district='',q='',page=1}:{category?:string;district?:string;q?:string;page?:number}){
 const where:Prisma.BusinessWhereInput={...publishedWhere,...(category?{category}:{}),...(district?{serviceDistricts:{has:district}}:{}),...(q?{name:{contains:q,mode:'insensitive'}}:{})};
 const rows=await prisma.business.findMany({where,select:publicBusinessSelect,orderBy:{id:'asc'},skip:(page-1)*12,take:13});return {items:rows.slice(0,12),hasNext:rows.length>12,page};
}
