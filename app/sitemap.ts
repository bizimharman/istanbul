import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/site-url';
import {prisma} from '@/lib/db';
import {publishedWhere} from '@/lib/business-server';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=await siteUrl();const hasPublished=!!(await prisma.business.findFirst({where:publishedWhere,select:{id:true}}));return [{url:base},...(hasPublished?[{url:`${base}/isletmeler`}]:[])];}
