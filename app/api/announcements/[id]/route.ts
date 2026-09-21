import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db';
import {currentUser,unauthorized,forbidden,apiError} from '@/lib/server';
import {z} from 'zod';
import {DISTRICTS} from '@/lib/constants';
const announcementSchema=z.object({title:z.string().trim().min(5).max(140),content:z.string().trim().min(10).max(5000),district:z.string().refine((v:string)=>v==='Tüm İstanbul'||DISTRICTS.includes(v)),type:z.enum(['WATER_OUTAGE','ELECTRICITY_OUTAGE','ROAD_WORK','EVENT','GENERAL']),startDate:z.string().datetime(),endDate:z.string().datetime()}).refine((v)=>new Date(v.endDate)>new Date(v.startDate));
export const dynamic='force-dynamic';
export async function DELETE(_req:Request,{params}:{params:Promise<{id:string}>}){try{const u=await currentUser();if(!u)return unauthorized();if(u.role!=='MUNICIPAL_ADMIN')return forbidden();const {id}=await params;await prisma.announcement.delete({where:{id}});return NextResponse.json({success:true});}catch(e){return apiError(e);}}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){try{const u=await currentUser();if(!u)return unauthorized();if(u.role!=='MUNICIPAL_ADMIN')return forbidden();const {id}=await params;const p=announcementSchema.safeParse(await req.json());if(!p.success)return NextResponse.json({error:'Alanları ve tarihleri kontrol edin.'},{status:400});const row=await prisma.announcement.update({where:{id},data:{...p.data,startDate:new Date(p.data.startDate),endDate:new Date(p.data.endDate)}});return NextResponse.json(row);}catch(e){return apiError(e);}}
