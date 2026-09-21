import {NextResponse} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/lib/db';
import {currentUser,unauthorized} from '@/lib/server';
import {businessFormSchema} from '@/lib/business-shared';
import {businessError,BusinessError,identityKey,lockBusinessActor,readBusinessJson} from '@/lib/business-server';
export const dynamic='force-dynamic';
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await currentUser();if(!user)return unauthorized();const {id}=await params;
 const body=await readBusinessJson(req);const parsed=z.object({action:z.enum(['save','submit','withdraw']),revision:z.number().int().positive()}).safeParse(body);if(!parsed.success)throw new BusinessError(400,'İşlem ve güncel sürüm bilgisi gereklidir.');
 const {action,revision}=parsed.data;const form=action==='withdraw'?null:businessFormSchema.extend({attested:z.literal(true)}).safeParse(body);
 if(form&&!form.success)throw new BusinessError(400,'Profil alanlarını ve yetki beyanını kontrol edin.');
 const result=await prisma.$transaction(async tx=>{
 await lockBusinessActor(tx,user.id);const old=await tx.business.findFirst({where:{id,userId:user.id}});if(!old)throw new BusinessError(404,'İşletme bulunamadı.');if(old.status==='SUSPENDED')throw new BusinessError(403,'Yayını durdurulan kayıt yalnızca platform incelemesiyle açılabilir.');
 const d=form?.success?form.data:null;const {attested,...fields}=d??{};
 const next=action==='submit'?'PENDING':'DRAFT';
 const count=await tx.business.updateMany({where:{id,userId:user.id,revision},data:{...fields,...(d?{identityKey:identityKey(d)}:{}),status:next,verified:false,verifiedAt:null,verificationMethod:null,submittedAt:action==='submit'?new Date():null,revision:{increment:1}}});
 if(!count.count)throw new BusinessError(409,'Profil başka bir işlemle değişti. Taslağınızı kopyalayıp güncel kaydı yeniden açın.');
 await tx.businessEvent.create({data:{businessId:id,actorId:user.id,action:action.toUpperCase(),message:action==='submit'?'Güncel profil incelemeye gönderildi.':action==='withdraw'?'İşletme sahibi profili yayından/incelemeden çekti.':'Profil güncellendi; yayın için yeniden onay gerekir.'}});
 return tx.business.findUniqueOrThrow({where:{id}});
 });return NextResponse.json(result);
 }catch(e){return businessError(e);}}
