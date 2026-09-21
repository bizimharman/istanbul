export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import TeamPlans from '@/components/team-plans';
export const metadata = { title: 'Ekip Görevleri · İstanbul Akıllı Şehir' };
export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <TeamPlans />;
}
