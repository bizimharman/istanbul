export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import BusinessRequests from '@/components/business-requests';
export const metadata = { title: 'Eşleşen Talepler · İstanbul Akıllı Şehir' };
export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <BusinessRequests />;
}
