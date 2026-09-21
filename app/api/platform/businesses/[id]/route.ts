import {NextResponse} from 'next/server';
import {z} from 'zod';
import {prisma} from '@/lib/db';
import {currentUser,unauthorized,forbidden} from '@/lib/server';
import {businessFormSchema} from '@/lib/business-shared';
import {businessError,BusinessError,lockBusinessActor,readBusinessJson} from '@/lib/business-server';
export const dynamic='force-dynamic';
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){try{
 const user=await currentUser();if(!user)return unauthorized();if(!user.isPlatformAdmin)return forbidden();const {id}=await params;
 const parsed=z.object({action:z.enum(['approve','changes','suspend']),revision:z.number().int().positive(),message:z.string().trim().min(15).max(1000),method:z.enum(['OFFICIAL_CONTACT','REGISTRY']).optional(),confirmed:z.boolean().optional()}).safeParse(await readBusinessJson(req));
 if(!parsed.success)throw new BusinessError(400,'İşlem, sürüm ve en az 15 karakterlik inceleme notu gereklidir.');const d=parsed.data;
 if(d.action==='approve'&&(!d.method||!d.confirmed))throw new BusinessError(400,'Bağımsız sahiplik kontrolünü tamamlayıp teyit yöntemini seçin.');
 await prisma.$transaction(async tx=>{await lockBusinessActor(tx,user.id);const old=await tx.business.findUnique({where:{id}});if(!old)throw new BusinessError(404,'İşletme bulunamadı.');if(old.userId===user.id)throw new BusinessError(403,'Kendi işletmenizin incelemesini yapamazsınız.');
 if(d.action==='approve'&&old.status!=='PENDING')throw new BusinessError(409,'Yalnızca inceleme bekleyen profiller onaylanabilir.');
 if(d.action==='approve'&&(!old.slug||!businessFormSchema.safeParse(old).success))throw new BusinessError(400,'Profil yayın için eksik; sahibinden düzeltme isteyin.');
 if(d.action==='suspend'&&old.status!=='PUBLISHED')throw new BusinessError(409,'Yalnızca yayındaki profil durdurulabilir.');
 if(d.action==='changes'&&!['PENDING','SUSPENDED','PUBLISHED'].includes(old.status))throw new BusinessError(409,'Bu durum için düzeltme işlemi uygulanamaz.');
 const status=d.action==='approve'?'PUBLISHED':d.action==='suspend'?'SUSPENDED':'CHANGES_REQUESTED';
 const result=await tx.business.updateMany({where:{id,revision:d.revision},data:{status,reviewMessage:d.message,verified:d.action==='approve',verifiedAt:d.action==='approve'?new Date():null,verificationMethod:d.action==='approve'?d.method:null,...(d.action==='approve'?{publishedAt:new Date()}:{}),revision:{increment:1}}});
 if(!result.count)throw new BusinessError(409,'Kayıt değişti; güncel bilgileri yükleyip yeniden inceleyin.');
 await tx.businessEvent.create({data:{businessId:id,actorId:user.id,action:d.action.toUpperCase(),message:d.message}});
 });return NextResponse.json({success:true});
 }catch(e){return businessError(e);}}
