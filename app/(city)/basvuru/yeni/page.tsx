import {currentUser} from '@/lib/server';
import {redirect} from 'next/navigation';
import NewTicket from '@/components/new-ticket';
import {CATEGORIES} from '@/lib/constants';
export default async function Page({searchParams}:{searchParams:Promise<{kategori?:string}>}){const user=await currentUser();if(!user)redirect('/login');const p=await searchParams;return <NewTicket district={user.district} category={p.kategori&&CATEGORIES[p.kategori]?p.kategori:'INFRASTRUCTURE'}/>;}
