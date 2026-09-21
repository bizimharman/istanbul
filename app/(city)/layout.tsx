import CityShell from '@/components/city-shell';
import {currentUser} from '@/lib/server';
export const dynamic='force-dynamic';
export default async function Layout({children}:{children:React.ReactNode}){const user=await currentUser();return <CityShell user={user}>{children}</CityShell>;}
