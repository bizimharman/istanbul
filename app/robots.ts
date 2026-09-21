import type {MetadataRoute} from 'next';
import {siteUrl} from '@/lib/site-url';
import {prisma} from '@/lib/db';
import {publishedWhere} from '@/lib/business-server';
export const dynamic='force-dynamic';
export default async function robots():Promise<MetadataRoute.Robots>{const base=await siteUrl();const count=await prisma.business.count({where:publishedWhere});return {rules:[{userAgent:'*',allow:'/',disallow:['/api/','/isletme$','/platform/','/profil','/basvurular','/basvuru/','/yonetim','/login','/signup']}],sitemap:[`${base}/sitemap.xml`,...Array.from({length:Math.max(1,Math.ceil(count/5000))},(_,i)=>`${base}/isletmeler/sitemap/${i}.xml`)]};}
