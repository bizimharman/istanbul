import {currentUser} from '@/lib/server';
import {redirect} from 'next/navigation';
import Dashboard from '@/components/dashboard';
export default async function Page(){const user=await currentUser();if(!user)redirect('/login');if(user.role!=='MUNICIPAL_ADMIN')redirect('/');return <Dashboard user={user} adminPage/>;}
