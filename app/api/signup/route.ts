import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { DISTRICTS } from '@/lib/constants';
import { apiError } from '@/lib/server';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const parsed=z.object({name:z.string().trim().min(2).max(80),email:z.string().email().max(254),password:z.string().min(8).max(128),district:z.string().refine((v:string)=>DISTRICTS.includes(v)).default('Kadıköy'),role:z.preprocess((value)=>value==='BUSINESS'||value==='TOURIST'?value:'CITIZEN',z.enum(['CITIZEN','BUSINESS','TOURIST']))}).safeParse(await req.json());
 if(!parsed?.success)return NextResponse.json({error:'Ad, geçerli e-posta, ilçe ve en az 8 karakterli şifre gereklidir.',fields:parsed.error.issues.map((issue)=>({field:issue.path.join('.'),code:issue.code}))},{status:400});
 const d=parsed.data; const email=d.email.toLowerCase().trim();
 if(await prisma.user.findUnique({where:{email}}))return NextResponse.json({error:'Bu e-posta ile kayıt yapılamıyor. Giriş yapmayı deneyin.'},{status:409});
 await prisma.user.create({data:{name:d.name,email,passwordHash:await hash(d.password,12),district:d.district,role:d.role}});
 return NextResponse.json({success:true},{status:201});
 }catch(e){return apiError(e);}}
