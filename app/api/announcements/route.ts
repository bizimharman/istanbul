import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {currentUser,unauthorized,forbidden,apiError} from '@/lib/server';
import {DISTRICTS} from '@/lib/constants';
export const dynamic='force-dynamic';
const announcementSchema=z.object({title:z.string().trim().min(5).max(140),content:z.string().trim().min(10).max(5000),district:z.string().refine((v:string)=>v==='Tüm İstanbul'||DISTRICTS.includes(v)),type:z.enum(['WATER_OUTAGE','ELECTRICITY_OUTAGE','ROAD_WORK','EVENT','GENERAL']),startDate:z.string().datetime(),endDate:z.string().datetime()}).refine((v)=>new Date(v.endDate)>new Date(v.startDate));
export async function GET(req:Request){try{const user=await currentUser();const p=new URL(req.url).searchParams;const district=p.get('district')??user?.district??'Kadıköy';const manage=p.get('manage')==='true'&&user?.role==='MUNICIPAL_ADMIN';const rows=await prisma.announcement.findMany({where:manage?{}:{district:{in:[district,'Tüm İstanbul']},startDate:{lte:new Date()},endDate:{gte:new Date()}},orderBy:{createdAt:'desc'},take:100});return NextResponse.json(rows);}catch(e){return apiError(e);}}
export async function POST(req:Request){try{const user=await currentUser();if(!user)return unauthorized();if(user.role!=='MUNICIPAL_ADMIN')return forbidden();const p=announcementSchema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:'Alanları ve tarih aralığını kontrol edin. Bitiş, başlangıçtan sonra olmalı.'},{status:400});const row=await prisma.announcement.create({data:{...p.data,adminId:user.id,startDate:new Date(p.data.startDate),endDate:new Date(p.data.endDate)}});return NextResponse.json(row,{status:201});}catch(e){return apiError(e);}}
