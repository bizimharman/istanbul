'use client';
import { useEffect, useState } from 'react';
import { FileText, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import { BusinessRequestView, OFFER_STATUSES, formatBudget } from '@/lib/request-shared';
import type { OfferForm as OfferFormType } from '@/lib/request-shared';
import { BUSINESS_CATEGORIES } from '@/lib/business-shared';
import { request, jsonBody } from '@/lib/client';
import { ErrorBox, Loading, Empty } from './city-ui';
import { SafeDate } from './safe-format';

export default function BusinessRequests() {
  const [items, setItems] = useState<BusinessRequestView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offerFor, setOfferFor] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { setItems(await request('/api/business-requests')); }
    catch (e: any) { setError(e?.message || 'Talepler yüklenemedi.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-primary mb-2">GELEN HİZMET TALEPLERİ</p>
        <h1 className="page-title">Eşleşen talepler</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Kategoriniz ve hizmet ilçelerinizle eşleşen açık talepler. Her talebe bir teklif gönderebilirsiniz.
        </p>
      </div>

      <ErrorBox message={error} />
      {loading ? <Loading /> : items.length === 0 ? (
        <Empty title="Eşleşen talep yok."
          description="Kategoriniz ve hizmet bölgenizle eşleşen yeni talepler burada görünecek. İşletme profilinizin yayında olduğundan emin olun." />
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="panel p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="section-title">{item.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {BUSINESS_CATEGORIES[item.category] || item.category} · {item.district}
                    {' · '}{formatBudget(item.budgetMin, item.budgetMax)}
                    {item.timeline && ` · ${item.timeline}`}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  <SafeDate date={item.createdAt} locale="tr-TR" options={{ dateStyle: 'medium' }} />
                </span>
              </div>

              <p className="text-sm whitespace-pre-wrap line-clamp-4">{item.description}</p>

              <div className="text-xs text-muted-foreground">
                Hizmet ilçeleri: {item.serviceDistricts.join(', ')}
              </div>

              {item.myOffer ? (
                <div className="rounded-lg bg-accent p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 size={16} className="text-primary" />
                    Teklifiniz: {OFFER_STATUSES[item.myOffer.status]}
                  </div>
                  {item.myOffer.price != null && (
                    <p className="text-sm mt-1">{new Intl.NumberFormat('tr-TR').format(item.myOffer.price)} ₺
                      {item.myOffer.priceNote && ` (${item.myOffer.priceNote})`}
                    </p>
                  )}
                </div>
              ) : (
                offerFor === item.id ? (
                  <OfferForm requestId={item.id}
                    onClose={() => setOfferFor(null)}
                    onSent={async () => { setOfferFor(null); await load(); }} />
                ) : (
                  <button className="btn" onClick={() => setOfferFor(item.id)}>
                    <Send size={16} />Teklif gönder
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OfferForm({ requestId, onClose, onSent }: {
  requestId: string; onClose: () => void; onSent: () => Promise<void>;
}) {
  const [form, setForm] = useState<OfferFormType>({ price: null, priceNote: '', timeline: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await request(`/api/business-requests/${requestId}/offer`, {
        method: 'POST', ...jsonBody(form),
      });
      await onSent();
    } catch (err: any) {
      setError(err?.message || 'Teklif gönderilemedi.');
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="rounded-lg bg-muted p-4 space-y-4">
      <h3 className="font-semibold text-sm">Teklif gönder</h3>
      <ErrorBox message={error} />
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="field">Fiyat (₺)
          <input type="number" min={0} max={10000000}
            value={form.price ?? ''}
            onChange={e => setForm(f => ({ ...f, price: e.target.value ? parseInt(e.target.value) : null }))} />
        </label>
        <label className="field">Fiyat notu
          <input maxLength={300} value={form.priceNote}
            onChange={e => setForm(f => ({ ...f, priceNote: e.target.value }))} placeholder="Örn: KDV dahil" />
        </label>
        <label className="field">Teslim süresi
          <input maxLength={200} value={form.timeline}
            onChange={e => setForm(f => ({ ...f, timeline: e.target.value }))} placeholder="Örn: 10 iş günü" />
        </label>
      </div>
      <label className="field">Mesaj *
        <textarea rows={4} required minLength={10} maxLength={2000}
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Hizmet detaylarınızı, avantajlarınızı ve referanslarınızı paylaşın…" />
      </label>
      <div className="flex gap-3">
        <button className="btn !text-sm" disabled={busy}>
          <Send size={16} />{busy ? 'Gönderiliyor…' : 'Teklifi gönder'}
        </button>
        <button type="button" className="btn-light !text-sm" disabled={busy} onClick={onClose}>Vazgeç</button>
      </div>
      <p className="text-xs text-muted-foreground">
        Teklifiniz yalnızca talep sahibine gösterilir. Fiyat veya süre taahhüdü değildir; son anlaşma taraflar arasındadır.
      </p>
    </form>
  );
}
