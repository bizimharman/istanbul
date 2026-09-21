export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import MyPlans from '@/components/my-plans';
export const metadata = { title: 'Günlük Planlarım · İstanbul Akıllı Şehir' };
export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <MyPlans />;
}
