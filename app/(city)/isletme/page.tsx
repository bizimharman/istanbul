import {redirect} from 'next/navigation';
import {currentUser} from '@/lib/server';
import BusinessManager from '@/components/business-manager';
export const dynamic='force-dynamic';
export const metadata={title:'İşletme panelim',robots:{index:false,follow:false}};
export default async function Page(){const user=await currentUser();if(!user)redirect('/login');return <BusinessManager/>;}
