'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Store, Clock, Ban } from 'lucide-react';
import { ServiceRequestDetail, OfferView, REQUEST_STATUSES, OFFER_STATUSES, formatBudget } from '@/lib/request-shared';
import { BUSINESS_CATEGORIES } from '@/lib/business-shared';
import { request, jsonBody } from '@/lib/client';
import { ErrorBox, Loading } from './city-ui';
import { SafeDate } from './safe-format';

export default function RequestDetail({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<ServiceRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  async function load() {
    setLoading(true);
    try { setData(await request(`/api/requests/${id}`)); }
    catch (e: any) { setError(e?.message || 'Talep yüklenemedi.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [id]);

  async function action(act: string, offerId?: string) {
    setBusy(act + (offerId || ''));
    setError('');
    try {
      await request(`/api/requests/${id}`, {
        method: 'PATCH', ...jsonBody({ action: act, offerId }),
      });
      await load();
    } catch (e: any) { setError(e?.message || 'İşlem tamamlanamadı.'); }
    finally { setBusy(''); }
  }

  if (loading) return <Loading />;
  if (!data) return <ErrorBox message={error || 'Talep bulunamadı.'} />;

  const active = !['CLOSED', 'CANCELLED'].includes(data.status);

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/taleplerim')} className="btn-light text-sm">
        <ArrowLeft size={16} />Taleplerime dön
      </button>

      <div className="panel p-5 md:p-7 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="status bg-accent text-accent-foreground">{REQUEST_STATUSES[data.status]}</span>
            <h1 className="page-title mt-3">{data.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {BUSINESS_CATEGORIES[data.category] || data.category} · {data.district}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <SafeDate date={data.createdAt} locale="tr-TR" options={{ dateStyle: 'long' }} />
            <div className="mt-1">{data.matchCount} eşleşme · {data.offerCount} teklif</div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap">{data.description}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div><span className="text-muted-foreground">Bütçe:</span> {formatBudget(data.budgetMin, data.budgetMax)}</div>
          <div><span className="text-muted-foreground">Süre:</span> {data.timeline || 'Belirtilmedi'}</div>
          <div><span className="text-muted-foreground">Hizmet ilçeleri:</span> {data.serviceDistricts.join(', ')}</div>
        </div>

        {active && data.status !== 'DRAFT' && (
          <button className="btn-light text-destructive" disabled={!!busy}
            onClick={() => void action('cancel')}>
            <Ban size={16} />Talebi iptal et
          </button>
        )}
        {data.status === 'DRAFT' && (
          <button className="btn" disabled={!!busy}
            onClick={() => void action('publish')}>
            Talebi yayınla
          </button>
        )}
      </div>

      <ErrorBox message={error} />

      {/* Offers */}
      {data.offers.length > 0 && (
        <div className="space-y-4">
          <h2 className="section-title">Gelen teklifler ({data.offers.length})</h2>
          {data.offers.map(offer => (
            <OfferCard key={offer.id} offer={offer} active={active}
              busy={busy} onAction={(act) => void action(act, offer.id)} />
          ))}
        </div>
      )}

      {active && data.offers.length === 0 && data.status !== 'DRAFT' && (
        <div className="panel p-6 text-center">
          <Clock size={28} className="mx-auto text-primary/50 mb-3" />
          <p className="text-sm font-medium">Teklif bekleniyor</p>
          <p className="text-xs text-muted-foreground mt-2">
            Talebiniz {data.matchCount} uygun işletmeyle eşleştirildi. Teklifler burada görünecek.
          </p>
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer, active, busy, onAction }: {
  offer: OfferView; active: boolean; busy: string;
  onAction: (action: string) => void;
}) {
  const accepted = offer.status === 'ACCEPTED';
  const pending = offer.status === 'PENDING';
  return (
    <div className={`panel p-5 ${accepted ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Store size={20} className="text-primary" />
          <div>
            {offer.businessSlug ? (
              <Link href={`/isletmeler/${offer.businessSlug}`} className="font-medium text-sm hover:underline">
                {offer.businessName}
              </Link>
            ) : (
              <span className="font-medium text-sm">{offer.businessName}</span>
            )}
            <span className="ml-2 status bg-accent text-accent-foreground text-xs">
              {OFFER_STATUSES[offer.status]}
            </span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          <SafeDate date={offer.createdAt} locale="tr-TR" options={{ dateStyle: 'medium' }} />
        </span>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
        <div><span className="text-muted-foreground">Fiyat:</span>{' '}
          {offer.price != null ? `${new Intl.NumberFormat('tr-TR').format(offer.price)} ₺` : 'Belirtilmedi'}
          {offer.priceNote && <span className="text-muted-foreground ml-1">({offer.priceNote})</span>}
        </div>
        <div><span className="text-muted-foreground">Süre:</span> {offer.timeline || 'Belirtilmedi'}</div>
      </div>

      <p className="mt-3 text-sm whitespace-pre-wrap">{offer.message}</p>

      {active && pending && (
        <div className="flex gap-3 mt-4">
          <button className="btn !text-sm" disabled={!!busy}
            onClick={() => onAction('accept_offer')}>
            <CheckCircle2 size={16} />Teklifi kabul et
          </button>
          <button className="btn-light !text-sm text-destructive" disabled={!!busy}
            onClick={() => onAction('decline_offer')}>
            <XCircle size={16} />Reddet
          </button>
        </div>
      )}
    </div>
  );
}
