import {currentUser} from '@/lib/server';
import {redirect} from 'next/navigation';
import TicketDetail from '@/components/ticket-detail';
export default async function Page({params}:{params:Promise<{id:string}>}){const user=await currentUser();if(!user)redirect('/login');const {id}=await params;return <TicketDetail id={id} admin={user.role==='MUNICIPAL_ADMIN'}/>;}
