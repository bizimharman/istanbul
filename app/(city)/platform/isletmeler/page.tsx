import {redirect,notFound} from 'next/navigation';
import {currentUser} from '@/lib/server';
import BusinessModeration from '@/components/business-moderation';
export const dynamic='force-dynamic';
export const metadata={title:'İşletme yayın yönetimi',robots:{index:false,follow:false}};
export default async function Page(){const user=await currentUser();if(!user)redirect('/login');if(!user.isPlatformAdmin)notFound();return <BusinessModeration/>;}
