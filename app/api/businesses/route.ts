import {NextResponse} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/lib/db';
import {currentUser,unauthorized} from '@/lib/server';
import {businessFormSchema} from '@/lib/business-shared';
import {businessError,BusinessError,businessSlug,identityKey,lockBusinessActor,readBusinessJson} from '@/lib/business-server';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await currentUser();if(!user)return unauthorized();return NextResponse.json(await prisma.business.findMany({where:{userId:user.id},orderBy:{createdAt:'desc'},include:{events:{orderBy:{createdAt:'desc'},take:20}}}),{headers:{'Cache-Control':'private, no-store'}});}catch(e){return businessError(e);}}
export async function POST(req:Request){try{
 const user=await currentUser();if(!user)return unauthorized();
 const parsed=businessFormSchema.extend({submit:z.boolean(),attested:z.literal(true)}).safeParse(await readBusinessJson(req));if(!parsed.success)throw new BusinessError(400,'Zorunlu alanları, hizmet bölgelerini ve yetki beyanını kontrol edin.');
 const {submit,attested,...d}=parsed.data;
 const business=await prisma.$transaction(async tx=>{await lockBusinessActor(tx,user.id);if(await tx.business.count({where:{userId:user.id}})>=5)throw new BusinessError(429,'Pilot döneminde hesap başına en fazla 5 işletme kaydı oluşturabilirsiniz.');
 return tx.business.create({data:{...d,userId:user.id,slug:businessSlug(d.name),identityKey:identityKey(d),status:submit?'PENDING':'DRAFT',submittedAt:submit?new Date():null,events:{create:{actorId:user.id,action:submit?'SUBMIT':'CREATE',message:submit?'İşletme yetki beyanıyla incelemeye gönderildi.':'İşletme taslağı oluşturuldu.'}}}});});
 return NextResponse.json(business,{status:201});
 }catch(e){return businessError(e);}}
