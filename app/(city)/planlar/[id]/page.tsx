export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import PlanDetail from '@/components/plan-detail';
export const metadata = { title: 'Plan Detayı · İstanbul Akıllı Şehir' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const { id } = await params;
  return <PlanDetail id={id} />;
}
