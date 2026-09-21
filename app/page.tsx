import CityShell from '@/components/city-shell';
import Dashboard from '@/components/dashboard';
import {currentUser} from '@/lib/server';
export const dynamic='force-dynamic';
export default async function Page(){const user=await currentUser();return <CityShell user={user}><Dashboard user={user}/></CityShell>;}
