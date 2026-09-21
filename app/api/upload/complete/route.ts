import {NextResponse} from 'next/server';
import {currentUser,unauthorized,apiError} from '@/lib/server';
import {prisma} from '@/lib/db';
import {inspectFile,deleteFile} from '@/lib/s3';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{const user=await currentUser();if(!user)return unauthorized();const body=await req.json();if(typeof body?.id!=='string')return NextResponse.json({error:'Geçersiz dosya.'},{status:400});const file=await prisma.upload.findFirst({where:{id:body.id,userId:user.id,ticketId:null}});if(!file)return NextResponse.json({error:'Dosya bulunamadı.'},{status:404});const head=await inspectFile(file.cloud_storage_path);if(head?.ContentLength!==file.size || head?.ContentType!==file.contentType){await deleteFile(file.cloud_storage_path);return NextResponse.json({error:'Dosya boyutu veya türü doğrulanamadı.'},{status:400});}await prisma.upload.update({where:{id:file.id},data:{confirmed:true}});return NextResponse.json({id:file.id});}catch(e){return apiError(e);}}
