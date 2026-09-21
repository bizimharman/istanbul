import { PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client,getBucketConfig } from './aws-config';
const client=createS3Client();const config=getBucketConfig();
function shouldServeInline(type:string){return (type.startsWith('image/')&&type!=='image/svg+xml')||type.startsWith('video/')||type.startsWith('audio/');}
export async function generatePresignedUploadUrl(fileName:string,contentType:string,isPublic=false){const safeName=fileName.replace(/[^a-zA-Z0-9._-]/g,'_');const cloud_storage_path=`${config.folderPrefix}${isPublic?'public/':''}uploads/${Date.now()}-${crypto.randomUUID()}-${safeName}`;return {cloud_storage_path,uploadUrl:await getSignedUrl(client,new PutObjectCommand({Bucket:config.bucketName,Key:cloud_storage_path,ContentType:contentType}),{expiresIn:3600})};}
export async function getFileUrl(cloud_storage_path:string,contentType:string,isPublic=false){if(isPublic)return `https://${config.bucketName}.s3.${process.env.AWS_REGION ?? 'us-east-1'}.amazonaws.com/${cloud_storage_path.split('/').map(encodeURIComponent).join('/')}`;return getSignedUrl(client,new GetObjectCommand({Bucket:config.bucketName,Key:cloud_storage_path,ResponseContentDisposition:shouldServeInline(contentType)?'inline':'attachment'}),{expiresIn:3600});}
export async function inspectFile(cloud_storage_path:string){return client.send(new HeadObjectCommand({Bucket:config.bucketName,Key:cloud_storage_path}));}
export async function deleteFile(cloud_storage_path:string){return client.send(new DeleteObjectCommand({Bucket:config.bucketName,Key:cloud_storage_path}));}
