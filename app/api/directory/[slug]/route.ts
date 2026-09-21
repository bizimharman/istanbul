import {NextResponse} from 'next/server';
import {publishedBusiness,businessError} from '@/lib/business-server';
export const dynamic='force-dynamic';
export async function GET(_req:Request,{params}:{params:Promise<{slug:string}>}){try{const {slug}=await params;const b=await publishedBusiness(slug);return b?NextResponse.json(b):NextResponse.json({error:'İşletme bulunamadı.'},{status:404});}catch(e){return businessError(e);}}
