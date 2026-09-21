'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, CalendarCheck, Trophy, ListChecks, UserCog, CircleSlash } from 'lucide-react';
import { PlanSummary, PLAN_KINDS, progressPct } from '@/lib/plan-shared';
import { request } from '@/lib/client';
import { ErrorBox, Loading, Empty } from './city-ui';
import { SafeDate } from './safe-format';

export default function MyPlans() {
  const [items, setItems] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        setItems(await request('/api/plans'));
      } catch (e: any) {
        setError(e?.message || 'Planlar yüklenemedi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-primary mb-2">GÜNLÜK GÖREV &amp; ROTA</p>
          <h1 className="page-title">Planlarım</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Gününüzü planlayın, görevleri zamanında tamamlayıp puan kazanın. Size atanan görevler de burada görünür.
          </p>
        </div>
        <Link href="/planlar/yeni" className="btn"><Plus size={16} />Yeni plan</Link>
      </div>

      <ErrorBox message={error} />
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty title="Henüz planınız yok." description="İlk günlük planınızı oluşturun; görevleri zamanında bitirdikçe puanınız artar." />
      ) : (
        <div className="grid gap-4">
          {items.map((p) => {
            const pct = progressPct(p.doneCount, p.itemCount);
            return (
              <Link key={p.id} href={`/planlar/${p.id}`} className="panel p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`status flex items-center gap-1 ${p.kind === 'ASSIGNED' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'}`}>
                        {p.kind === 'ASSIGNED' ? <UserCog size={12} /> : <CalendarCheck size={12} />}
                        {PLAN_KINDS[p.kind]}
                      </span>
                      {p.cancelled && (
                        <span className="status bg-destructive/10 text-destructive flex items-center gap-1"><CircleSlash size={12} />İptal</span>
                      )}
                      {p.kind === 'ASSIGNED' && p.assignerName && (
                        <span className="text-xs text-muted-foreground">Atayan: {p.assignerName}</span>
                      )}
                    </div>
                    <h2 className="section-title truncate">{p.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><ListChecks size={14} />{p.doneCount}/{p.itemCount} görev</span>
                      <span className="flex items-center gap-1"><Trophy size={14} />{p.earnedPoints}/{p.totalPoints} puan</span>
                    </p>
                    <div className="mt-3 h-2 w-full max-w-xs rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <SafeDate date={p.date} locale="tr-TR" options={{ dateStyle: 'medium' }} />
                    <div className="mt-1">%{pct} tamam</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
