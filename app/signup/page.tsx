import {auth} from '@/auth';
import {redirect} from 'next/navigation';
import AuthForm from '@/components/auth-form';
export default async function Page(){const session=await auth();if(session?.user)redirect('/');return <AuthForm signup/>;}
