import { NextResponse } from 'next/server';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import {z} from 'zod';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const origin=req.headers.get('origin');const host=req.headers.get('x-forwarded-host')??req.headers.get('host');
 if(!origin||new URL(origin).host!==host)return NextResponse.json({error:'Geçersiz istek kaynağı.'},{status:403});
 const p=z.object({email:z.string().email(),password:z.string().min(1).max(128)}).safeParse(await req.json());
 if(!p.success)return NextResponse.json({error:'Geçerli e-posta ve şifre girin.'},{status:400});
 await signIn('credentials',{email:p.data.email,password:p.data.password,redirect:false});
 return NextResponse.json({success:true});
 }catch(e){if(e instanceof AuthError)return NextResponse.json({error:'E-posta veya şifre doğru değil.'},{status:401});console.error(e);return NextResponse.json({error:'Giriş işlemi tamamlanamadı.'},{status:500});}}
