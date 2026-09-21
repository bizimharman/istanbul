import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
export async function currentUser() { const session=await auth(); if(!session?.user?.id) return null; return prisma.user.findUnique({where:{id:session.user.id},select:{id:true,name:true,email:true,role:true,district:true,isPlatformAdmin:true}}); }
export function apiError(error: unknown) { console.error(error); return NextResponse.json({error:'İşlem tamamlanamadı. Lütfen tekrar deneyin.'},{status:500}); }
export const unauthorized=()=>NextResponse.json({error:'Bu işlem için giriş yapmalısınız.'},{status:401});
export const forbidden=()=>NextResponse.json({error:'Bu işlem için yetkiniz bulunmuyor.'},{status:403});
