export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import ServiceRequestForm from '@/components/request-form';
export const metadata = { title: 'Yeni Talep · İstanbul Akıllı Şehir' };
export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <ServiceRequestForm />;
}
