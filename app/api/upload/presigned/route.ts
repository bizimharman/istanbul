import {NextResponse} from 'next/server';
import {z} from 'zod';
import {currentUser,unauthorized,apiError} from '@/lib/server';
import {prisma} from '@/lib/db';
import {generatePresignedUploadUrl,deleteFile} from '@/lib/s3';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{const user=await currentUser();if(!user)return unauthorized();
 const d=z.object({fileName:z.string().min(1).max(160),contentType:z.enum(['image/jpeg','image/png','image/webp']),size:z.number().int().positive().max(10*1024*1024)}).safeParse(await req.json());
 if(!d.success)return NextResponse.json({error:'En fazla 10 MB boyutunda JPG, PNG veya WebP yükleyin.'},{status:400});
 const old=await prisma.upload.findMany({where:{userId:user.id,ticketId:null,createdAt:{lt:new Date(Date.now()-86400000)}},take:30});
 for(const file of old){await deleteFile(file.cloud_storage_path);await prisma.upload.delete({where:{id:file.id}});}
 if(await prisma.upload.count({where:{userId:user.id,ticketId:null}})>=15)return NextResponse.json({error:'Bekleyen fotoğraf sınırına ulaştınız. Mevcut fotoğraflarla başvurunuzu tamamlayın.'},{status:429});
 const result=await generatePresignedUploadUrl(d.data.fileName,d.data.contentType,false);
 const file=await prisma.upload.create({data:{...d.data,cloud_storage_path:result.cloud_storage_path,userId:user.id,isPublic:false}});
 return NextResponse.json({...result,id:file.id});
 }catch(e){return apiError(e);}}
