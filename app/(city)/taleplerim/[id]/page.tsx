export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import RequestDetail from '@/components/request-detail';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: 'Talep Detayı · İstanbul Akıllı Şehir' };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const { id } = await params;
  return <RequestDetail id={id} />;
}
