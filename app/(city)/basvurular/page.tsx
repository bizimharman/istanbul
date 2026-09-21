import {currentUser} from '@/lib/server';
import {redirect} from 'next/navigation';
import TicketList from '@/components/ticket-list';
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){const user=await currentUser();if(!user)redirect('/login');const p=await searchParams;return <TicketList admin={user.role==='MUNICIPAL_ADMIN'} initialQuery={p.q??''}/>;}
