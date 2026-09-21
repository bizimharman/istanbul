import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db';
import {currentUser,unauthorized,forbidden} from '@/lib/server';
import {businessError} from '@/lib/business-server';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{const user=await currentUser();if(!user)return unauthorized();if(!user.isPlatformAdmin)return forbidden();const p=new URL(req.url).searchParams;const status=p.get('status')??'PENDING';if(!['PENDING','PUBLISHED','CHANGES_REQUESTED','SUSPENDED'].includes(status))return NextResponse.json({error:'Geçersiz inceleme durumu.'},{status:400});const page=Math.min(10000,Math.max(1,Number(p.get('page'))||1));const items=await prisma.business.findMany({where:{status:status as 'PENDING'},orderBy:{id:'asc'},skip:(Math.floor(page)-1)*20,take:21,include:{user:{select:{name:true,email:true}},events:{orderBy:{createdAt:'desc'},take:20}}});return NextResponse.json({items:items.slice(0,20),hasNext:items.length>20},{headers:{'Cache-Control':'private, no-store'}});}catch(e){return businessError(e);}}
