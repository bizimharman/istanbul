import {NextResponse} from 'next/server';
import {BUSINESS_CATEGORIES} from '@/lib/business-shared';
import {DISTRICTS} from '@/lib/constants';
import {listPublicBusinesses,businessError} from '@/lib/business-server';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const p=new URL(req.url).searchParams;const category=p.get('category')??'',district=p.get('district')??'';if((category&&!BUSINESS_CATEGORIES[category])||(district&&!DISTRICTS.includes(district)))return NextResponse.json({error:'Geçersiz kategori veya ilçe.'},{status:400});return NextResponse.json(await listPublicBusinesses({category,district,q:(p.get('q')??'').trim().slice(0,80),page:Math.max(1,Math.min(10000,Math.floor(Number(p.get('page'))||1)))}));}catch(e){return businessError(e);}}
