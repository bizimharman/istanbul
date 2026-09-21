import type {MetadataRoute} from 'next';
import {prisma} from '@/lib/db';
import {publishedWhere} from '@/lib/business-server';
import {siteUrl} from '@/lib/site-url';
export const dynamic='force-dynamic';
export async function generateSitemaps(){const count=await prisma.business.count({where:publishedWhere});return Array.from({length:Math.max(1,Math.ceil(count/5000))},(_,id)=>({id}));}
export default async function sitemap({id}:{id:Promise<string>}):Promise<MetadataRoute.Sitemap>{const index=Number(await id);if(!Number.isSafeInteger(index)||index<0)return [];const rows=await prisma.business.findMany({where:publishedWhere,select:{slug:true,updatedAt:true},orderBy:{id:'asc'},skip:index*5000,take:5000});const base=await siteUrl();return rows.map(b=>({url:`${base}/isletmeler/${b.slug}`,lastModified:b.updatedAt}));}
