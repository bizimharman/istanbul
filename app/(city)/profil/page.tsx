import {currentUser} from '@/lib/server';
import {redirect} from 'next/navigation';
import ProfileForm from '@/components/profile-form';
export default async function Page(){const user=await currentUser();if(!user)redirect('/login');return <ProfileForm user={user}/>;}
