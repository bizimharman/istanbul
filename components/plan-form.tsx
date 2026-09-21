'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Plus, Trash2, UserCog, User } from 'lucide-react';
import { DISTRICTS } from '@/lib/constants';
import { PlanForm as PlanFormType, PlanItemForm, todayStr } from '@/lib/plan-shared';
import { request, jsonBody } from '@/lib/client';
import { ErrorBox } from './city-ui';

const emptyItem = (): PlanItemForm => ({
  title: '', description: '', district: '', location: '', targetTime: '', points: 10,
});

export default function PlanForm() {
  const router = useRouter();
  const [assignMode, setAssignMode] = useState(false);
  const [form, setForm] = useState<PlanFormType>({
    title: '', date: todayStr(), note: '', assigneeEmail: '', items: [emptyItem()],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function field(key: keyof PlanFormType, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function itemField(i: number, key: keyof PlanItemForm, value: any) {
    setForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)) }));
  }
  function addItem() {
    setForm((f) => (f.items.length >= 20 ? f : { ...f, items: [...f.items, emptyItem()] }));
  }
  function removeItem(i: number) {
    setForm((f) => (f.items.length <= 1 ? f : { ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }

  const totalPoints = form.items.reduce((s, it) => s + (Number(it.points) || 0), 0);

  async function submit() {
    setBusy(true);
    setError('');
    try {
      const payload = { ...form, assigneeEmail: assignMode ? form.assigneeEmail : '' };
      const res = await request<{ id: string }>('/api/plans', { method: 'POST', ...jsonBody(payload) });
      router.push(`/planlar/${res.id}`);
    } catch (e: any) {
      setError(e?.message || 'Plan oluşturulamadı.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-primary mb-2">GÜNLÜK GÖREV &amp; ROTA</p>
        <h1 className="page-title">Yeni plan oluştur</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Günün görevlerini ve durak/rota bilgilerini ekleyin. Her görev için hedef saat ve puan belirleyin; zamanında tamamlanan görev tam, geç tamamlanan yarım puan kazanır.
        </p>
      </div>

      <ErrorBox message={error} />

      <form className="panel p-5 md:p-7 space-y-6" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <fieldset disabled={busy} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="field">
              <span>Plan başlığı *</span>
              <input required minLength={3} maxLength={120} value={form.title}
                onChange={(e) => field('title', e.target.value)}
                placeholder="Örn: Salı saha ziyaretleri" />
            </label>
            <label className="field">
              <span>Tarih *</span>
              <input type="date" required value={form.date} onChange={(e) => field('date', e.target.value)} />
            </label>
          </div>

          <label className="field">
            <span>Not (opsiyonel)</span>
            <textarea rows={2} maxLength={1000} value={form.note}
              onChange={(e) => field('note', e.target.value)}
              placeholder="Güne dair genel not veya öncelikler…" />
          </label>

          <div className="rounded-xl bg-muted p-4 space-y-3">
            <div className="flex items-center gap-4 flex-wrap">
              <button type="button" onClick={() => setAssignMode(false)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${!assignMode ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                <User size={15} />Kişisel plan
              </button>
              <button type="button" onClick={() => setAssignMode(true)}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${assignMode ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                <UserCog size={15} />Başka birine ata
              </button>
            </div>
            {assignMode && (
              <label className="field !mb-0">
                <span>Atanacak kişinin e-postası *</span>
                <input type="email" maxLength={160} value={form.assigneeEmail}
                  onChange={(e) => field('assigneeEmail', e.target.value)}
                  placeholder="calisan@ornek.com" />
                <span className="text-xs text-muted-foreground">Kişinin platforma kayıtlı olması gerekir. Görev, o kişinin “Planlarım” sayfasında görünür; ilerlemeyi “Atadığım Görevler” sayfasından izlersiniz.</span>
              </label>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <legend className="font-semibold">Görevler ({form.items.length})</legend>
              <span className="text-xs text-muted-foreground">Toplam {totalPoints} puan</span>
            </div>
            {form.items.map((it, i) => (
              <div key={i} className="rounded-xl border border-border/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Görev {i + 1}</span>
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="text-destructive hover:opacity-70" aria-label="Görevi sil"><Trash2 size={16} /></button>
                  )}
                </div>
                <label className="field !mb-0">
                  <span>Başlık *</span>
                  <input required minLength={2} maxLength={120} value={it.title}
                    onChange={(e) => itemField(i, 'title', e.target.value)}
                    placeholder="Örn: Kadıköy şube denetimi" />
                </label>
                <label className="field !mb-0">
                  <span>Açıklama</span>
                  <textarea rows={2} maxLength={600} value={it.description}
                    onChange={(e) => itemField(i, 'description', e.target.value)}
                    placeholder="Detay veya yönerge (opsiyonel)" />
                </label>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="field !mb-0">
                    <span>İlçe</span>
                    <select value={it.district} onChange={(e) => itemField(i, 'district', e.target.value)}>
                      <option value="">Seçiniz</option>
                      {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </label>
                  <label className="field !mb-0">
                    <span>Konum/adres</span>
                    <input maxLength={160} value={it.location}
                      onChange={(e) => itemField(i, 'location', e.target.value)}
                      placeholder="Örn: Bağdat Cd. No:12" />
                  </label>
                  <label className="field !mb-0">
                    <span>Hedef saat</span>
                    <input type="time" value={it.targetTime} onChange={(e) => itemField(i, 'targetTime', e.target.value)} />
                  </label>
                  <label className="field !mb-0">
                    <span>Puan *</span>
                    <input type="number" min={1} max={100} required value={it.points}
                      onChange={(e) => itemField(i, 'points', e.target.value ? parseInt(e.target.value) : 0)} />
                  </label>
                </div>
              </div>
            ))}
            <button type="button" onClick={addItem} disabled={form.items.length >= 20}
              className="btn-light w-full justify-center disabled:opacity-50"><Plus size={16} />Görev ekle</button>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button className="btn" disabled={busy}><Send size={16} />{busy ? 'Oluşturuluyor…' : assignMode ? 'Görevi ata' : 'Planı oluştur'}</button>
          <button type="button" className="btn-light" onClick={() => router.back()}><ArrowLeft size={16} />Vazgeç</button>
        </div>
      </form>
    </div>
  );
}
