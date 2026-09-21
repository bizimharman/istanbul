'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Trophy, ListChecks, Plus, CircleSlash } from 'lucide-react';
import { PlanSummary, progressPct } from '@/lib/plan-shared';
import { request } from '@/lib/client';
import { ErrorBox, Loading, Empty } from './city-ui';
import { SafeDate } from './safe-format';

export default function TeamPlans() {
  const [items, setItems] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        setItems(await request('/api/team'));
      } catch (e: any) {
        setError(e?.message || 'Ekip görevleri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalEarned = items.reduce((s, p) => s + p.earnedPoints, 0);
  const totalPoints = items.reduce((s, p) => s + p.totalPoints, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-primary mb-2">EKİP &amp; GÖREV TAKİBİ</p>
          <h1 className="page-title">Atadığım Görevler</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Çalışanlarınıza veya ekip arkadaşlarınıza atadığınız günlük görevlerin ilerlemesini ve puanlarını buradan takip edin.
          </p>
        </div>
        <Link href="/planlar/yeni" className="btn"><Plus size={16} />Görev ata</Link>
      </div>

      <ErrorBox message={error} />
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Empty title="Henüz görev atamadınız." description="Yeni plan oluştururken bir kullanıcının e-postasını girerek ona günlük görev atayabilirsiniz." />
      ) : (
        <>
          <div className="panel p-5 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2"><Users size={18} className="text-primary" /><span className="text-sm"><b>{items.length}</b> atanan plan</span></div>
            <div className="flex items-center gap-2"><Trophy size={18} className="text-primary" /><span className="text-sm">Toplam <b>{totalEarned}</b>/{totalPoints} puan kazanıldı</span></div>
          </div>
          <div className="grid gap-4">
            {items.map((p) => {
              const pct = progressPct(p.doneCount, p.itemCount);
              return (
                <Link key={p.id} href={`/planlar/${p.id}`} className="panel p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="status bg-primary/10 text-primary flex items-center gap-1"><Users size={12} />{p.assigneeName || p.assigneeEmail}</span>
                        {p.cancelled && <span className="status bg-destructive/10 text-destructive flex items-center gap-1"><CircleSlash size={12} />İptal</span>}
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
        </>
      )}
    </div>
  );
}
