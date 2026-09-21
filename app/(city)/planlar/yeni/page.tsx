export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import PlanForm from '@/components/plan-form';
export const metadata = { title: 'Yeni Plan · İstanbul Akıllı Şehir' };
export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <PlanForm />;
}
