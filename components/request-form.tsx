'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Save, ArrowLeft } from 'lucide-react';
import { BUSINESS_CATEGORIES } from '@/lib/business-shared';
import { DISTRICTS } from '@/lib/constants';
import { RequestForm } from '@/lib/request-shared';
import { request, jsonBody } from '@/lib/client';
import { ErrorBox } from './city-ui';

export default function ServiceRequestForm() {
  const router = useRouter();
  const [form, setForm] = useState<RequestForm>({
    title: '', description: '', category: 'CUSTOM_FURNITURE', district: 'Kadıköy',
    serviceDistricts: ['Kadıköy'], budgetMin: null, budgetMax: null, timeline: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function field(key: keyof RequestForm, value: any) { setForm(f => ({ ...f, [key]: value })); }

  async function submit(draft: boolean) {
    setBusy(true); setError('');
    try {
      await request('/api/requests', {
        method: 'POST',
        ...jsonBody({ ...form, draft }),
      });
      router.push('/taleplerim');
    } catch (e: any) {
      setError(e?.message || 'Talep oluşturulamadı.');
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-primary mb-2">HİZMET TALEBİ</p>
        <h1 className="page-title">Yeni talep oluştur</h1>
        <p className="text-sm text-muted-foreground mt-2">
          İhtiyacınızı tanımlayın, uygun işletmelerden teklif alın. AI fiyat veya müsaitlik uydurmaz; gerçek işletmeler size doğrudan teklif sunar.
        </p>
      </div>

      <ErrorBox message={error} />

      <form className="panel p-5 md:p-7 space-y-6" onSubmit={e => { e.preventDefault(); void submit(false); }}>
        <fieldset disabled={busy} className="space-y-5">
          <legend className="font-semibold mb-4">Talep bilgileri</legend>

          <label className="field">
            <span>Başlık *</span>
            <input required minLength={5} maxLength={120} value={form.title}
              onChange={e => field('title', e.target.value)}
              placeholder="Örn: Kadıköy'de çocuk odası mobilyası" />
          </label>

          <label className="field">
            <span>Açıklama *</span>
            <textarea rows={5} required minLength={30} maxLength={3000} value={form.description}
              onChange={e => field('description', e.target.value)}
              placeholder="İhtiyacınızı, ölçüleri, malzeme tercihlerinizi ve beklentilerinizi yazın…" />
            <span className="text-xs text-muted-foreground">En az 30, en fazla 3000 karakter.</span>
          </label>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="field">Kategori *
              <select value={form.category} onChange={e => field('category', e.target.value)}>
                {Object.entries(BUSINESS_CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label className="field">Bulunduğunuz ilçe *
              <select value={form.district} onChange={e => field('district', e.target.value)}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </label>
          </div>

          <fieldset>
            <legend className="text-sm font-medium mb-3">Hizmet alacağınız ilçeler * — en az bir ilçe</legend>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto rounded-lg bg-muted p-3">
              {DISTRICTS.map(d => (
                <label key={d} className="flex gap-2 items-center text-xs py-1">
                  <input type="checkbox" className="!w-4 !h-4"
                    checked={form.serviceDistricts.includes(d)}
                    onChange={e => setForm(f => ({
                      ...f, serviceDistricts: e.target.checked
                        ? [...f.serviceDistricts, d]
                        : f.serviceDistricts.filter(v => v !== d)
                    }))} />{d}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid sm:grid-cols-3 gap-4">
            <label className="field">Alt bütçe (₺)
              <input type="number" min={0} max={10000000}
                value={form.budgetMin ?? ''}
                onChange={e => field('budgetMin', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Örn: 5000" />
            </label>
            <label className="field">Üst bütçe (₺)
              <input type="number" min={0} max={10000000}
                value={form.budgetMax ?? ''}
                onChange={e => field('budgetMax', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Örn: 15000" />
            </label>
            <label className="field">Zaman çerçevesi
              <input maxLength={200} value={form.timeline}
                onChange={e => field('timeline', e.target.value)}
                placeholder="Örn: 2 hafta içinde" />
            </label>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button className="btn" disabled={busy}><Send size={16} />{busy ? 'Gönderiliyor…' : 'Talebi yayınla'}</button>
          <button type="button" className="btn-light" disabled={busy} onClick={() => void submit(true)}><Save size={16} />Taslak kaydet</button>
          <button type="button" className="btn-light" onClick={() => router.back()}><ArrowLeft size={16} />Vazgeç</button>
        </div>
        <p className="text-xs text-muted-foreground">Yayınlanan talepler kategori ve hizmet ilçesine göre uygun işletmelerle eşleştirilir. Kişisel bilgileriniz paylaşılmaz.</p>
      </form>
    </div>
  );
}
