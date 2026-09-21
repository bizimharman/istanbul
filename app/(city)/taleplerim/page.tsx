export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import MyRequests from '@/components/my-requests';
export const metadata = { title: 'Taleplerim · İstanbul Akıllı Şehir' };
export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  return <MyRequests />;
}
