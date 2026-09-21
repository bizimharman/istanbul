import {headers} from 'next/headers';
export async function siteUrl(){const h=await headers();const host=(h.get('x-forwarded-host')??h.get('host')??'').split(',')[0].trim();if(host&&/^[a-zA-Z0-9.:[\]-]+$/.test(host)){const protocol=h.get('x-forwarded-proto')?.split(',')[0].trim()==='http'?'http':'https';return `${protocol}://${host}`;}return process.env.NEXTAUTH_URL??'http://localhost:3000';}
