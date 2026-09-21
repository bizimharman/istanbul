'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Trophy, ListChecks, CheckCircle2, Circle, Clock, MapPin,
  UserCog, CircleSlash, Trash2, RotateCcw, AlertCircle,
} from 'lucide-react';
import { PlanDetail as PlanDetailType, PlanItemView, PLAN_KINDS, progressPct } from '@/lib/plan-shared';
import { request, jsonBody } from '@/lib/client';
import { ErrorBox, Loading } from './city-ui';
import { SafeDate } from './safe-format';

export default function PlanDetail({ id }: { id: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyItem, setBusyItem] = useState('');
  const [busyAction, setBusyAction] = useState(false);

  async function load() {
    try {
      setPlan(await request(`/api/plans/${id}`));
    } catch (e: any) {
      setError(e?.message || 'Plan yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, [id]);

  async function toggleItem(item: PlanItemView) {
    if (!plan || !plan.isOwner || plan.cancelled) return;
    setBusyItem(item.id);
    setError('');
    try {
      const action = item.status === 'DONE' ? 'uncomplete_item' : 'complete_item';
      const fresh = await request<PlanDetailType>(`/api/plans/${id}`, { method: 'PATCH', ...jsonBody({ action, itemId: item.id }) });
      setPlan(fresh);
    } catch (e: any) {
      setError(e?.message || 'İşlem tamamlanamadı.');
    } finally {
      setBusyItem('');
    }
  }

  async function doAction(action: 'cancel' | 'reopen' | 'delete') {
    if (!plan) return;
    if (action === 'delete' && !confirm('Bu plan kalıcı olarak silinsin mi?')) return;
    setBusyAction(true);
    setError('');
    try {
      await request(`/api/plans/${id}`, { method: 'PATCH', ...jsonBody({ action }) });
      if (action === 'delete') {
        router.push(plan.isAssigner && !plan.isOwner ? '/ekip' : '/planlar');
        return;
      }
      await load();
    } catch (e: any) {
      setError(e?.message || 'İşlem tamamlanamadı.');
    } finally {
      setBusyAction(false);
    }
  }

  if (loading) return <Loading />;
  if (!plan) return (
    <div className="space-y-4">
      <ErrorBox message={error || 'Plan bulunamadı.'} />
      <button className="btn-light" onClick={() => router.push('/planlar')}><ArrowLeft size={16} />Planlarıma dön</button>
    </div>
  );

  const pct = progressPct(plan.doneCount, plan.itemCount);
  const readOnly = !plan.isOwner || plan.cancelled;

  return (
    <div className="space-y-6">
      <button className="btn-light" onClick={() => router.back()}><ArrowLeft size={16} />Geri</button>

      <div className="panel p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`status flex items-center gap-1 ${plan.kind === 'ASSIGNED' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'}`}>
                {plan.kind === 'ASSIGNED' ? <UserCog size={12} /> : <ListChecks size={12} />}{PLAN_KINDS[plan.kind]}
              </span>
              {plan.cancelled && <span className="status bg-destructive/10 text-destructive flex items-center gap-1"><CircleSlash size={12} />İptal edildi</span>}
            </div>
            <h1 className="page-title">{plan.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">
              <SafeDate date={plan.date} locale="tr-TR" options={{ dateStyle: 'full' }} />
            </p>
            {plan.kind === 'ASSIGNED' && (
              <p className="text-sm text-muted-foreground mt-1">
                {plan.isAssigner && !plan.isOwner
                  ? <>Atanan kişi: <b>{plan.assigneeName || plan.assigneeEmail}</b></>
                  : <>Atayan: <b>{plan.assignerName}</b></>}
              </p>
            )}
            {plan.note && <p className="text-sm mt-3 rounded-lg bg-muted p-3">{plan.note}</p>}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end text-primary"><Trophy size={20} /><span className="text-2xl font-bold">{plan.earnedPoints}</span><span className="text-sm text-muted-foreground">/ {plan.totalPoints}</span></div>
            <div className="text-xs text-muted-foreground mt-1">kazanılan puan</div>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{plan.doneCount}/{plan.itemCount} görev tamamlandı</span><span>%{pct}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <ErrorBox message={error} />

      {plan.isAssigner && !plan.isOwner && !plan.cancelled && (
        <div className="flex items-center gap-2 rounded-lg bg-accent/60 p-3 text-xs text-accent-foreground">
          <AlertCircle size={15} />Bu görevi siz atadınız; tamamlamayı yalnızca atanan kişi işaretleyebilir. Siz ilerlemeyi izleyebilir, planı iptal edebilir veya silebilirsiniz.
        </div>
      )}

      <div className="space-y-3">
        {plan.items.map((it, i) => {
          const done = it.status === 'DONE';
          return (
            <div key={it.id} className={`panel p-4 md:p-5 flex items-start gap-4 ${done ? 'bg-primary/[.04]' : ''}`}>
              <button
                onClick={() => toggleItem(it)}
                disabled={readOnly || busyItem === it.id}
                aria-label={done ? 'Geri al' : 'Tamamlandı işaretle'}
                className={`mt-0.5 shrink-0 transition ${readOnly ? 'cursor-default opacity-70' : 'hover:scale-110'} ${done ? 'text-primary' : 'text-muted-foreground'}`}>
                {done ? <CheckCircle2 size={26} /> : <Circle size={26} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-muted-foreground">#{i + 1}</span>
                  <h3 className={`font-semibold ${done ? 'line-through opacity-70' : ''}`}>{it.title}</h3>
                </div>
                {it.description && <p className="text-sm text-muted-foreground mt-1">{it.description}</p>}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                  {(it.district || it.location) && (
                    <span className="flex items-center gap-1"><MapPin size={13} />{[it.district, it.location].filter(Boolean).join(' · ')}</span>
                  )}
                  {it.targetTime && <span className="flex items-center gap-1"><Clock size={13} />Hedef {it.targetTime}</span>}
                  <span className="flex items-center gap-1"><Trophy size={13} />{it.points} puan</span>
                </div>
                {done && (
                  <div className="mt-2 text-xs">
                    {it.onTime
                      ? <span className="text-primary font-medium">Zamanında tamamlandı · +{it.awardedPoints} puan</span>
                      : <span className="text-amber-600 font-medium">Geç tamamlandı · +{it.awardedPoints} puan (yarım)</span>}
                    {it.completedAt && <span className="text-muted-foreground"> · <SafeDate date={it.completedAt} locale="tr-TR" options={{ dateStyle: 'short', timeStyle: 'short' }} /></span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        {!plan.cancelled
          ? <button className="btn-light" disabled={busyAction} onClick={() => doAction('cancel')}><CircleSlash size={16} />Planı iptal et</button>
          : <button className="btn-light" disabled={busyAction} onClick={() => doAction('reopen')}><RotateCcw size={16} />İptali geri al</button>}
        <button className="btn-light !text-destructive" disabled={busyAction} onClick={() => doAction('delete')}><Trash2 size={16} />Sil</button>
      </div>
    </div>
  );
}
