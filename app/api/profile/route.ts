import {NextResponse} from 'next/server';
import {z} from 'zod';
import {hash,compare} from 'bcryptjs';
import {currentUser,unauthorized,apiError} from '@/lib/server';
import {prisma} from '@/lib/db';
import {DISTRICTS} from '@/lib/constants';
export const dynamic='force-dynamic';
export async function GET(){try{const u=await currentUser();return u?NextResponse.json(u):unauthorized();}catch(e){return apiError(e);}}
export async function PATCH(req:Request){try{const u=await currentUser();if(!u)return unauthorized();const p=z.object({name:z.string().trim().min(2).max(80),district:z.string().refine((v:string)=>DISTRICTS.includes(v)),currentPassword:z.string().max(128).optional(),newPassword:z.string().min(10).max(128).optional()}).safeParse(await req.json());if(!p.success)return NextResponse.json({error:'Alanları kontrol edin. Yeni şifre en az 10 karakter olmalı.'},{status:400});let passwordHash:string|undefined;if(p.data.newPassword){const full=await prisma.user.findUniqueOrThrow({where:{id:u.id}});if(!p.data.currentPassword||!await compare(p.data.currentPassword,full.passwordHash))return NextResponse.json({error:'Mevcut şifre doğru değil.'},{status:400});passwordHash=await hash(p.data.newPassword,12);}await prisma.user.update({where:{id:u.id},data:{name:p.data.name,district:p.data.district,...(passwordHash?{passwordHash}:{})}});return NextResponse.json({success:true});}catch(e){return apiError(e);}}
