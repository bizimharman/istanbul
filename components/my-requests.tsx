'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, ArrowRight, CheckCircle2, XCircle, Clock, Send } from 'lucide-react';
import { ServiceRequestSummary, REQUEST_STATUSES, formatBudget } from '@/lib/request-shared';
import { BUSINESS_CATEGORIES } from '@/lib/business-shared';
import { request } from '@/lib/client';
import { ErrorBox, Loading, Empty } from './city-ui';
import { SafeDate } from './safe-format';

const statusIcon: Record<string, any> = {
  OPEN: Clock, MATCHED: Send, OFFERED: Send,
  ACCEPTED: CheckCircle2, CLOSED: CheckCircle2,
  CANCELLED: XCircle, DRAFT: FileText,
};

export default function MyRequests() {
  const [items, setItems] = useState<ServiceRequestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try { setItems(await request('/api/requests')); }
      catch (e: any) { setError(e?.message || 'Talepler yüklenemedi.'); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-primary mb-2">HİZMET TALEPLERİM</p>
          <h1 className="page-title">Taleplerim</h1>
          <p className="text-sm text-muted-foreground mt-2">Oluşturduğunuz talepler ve gelen teklifler.</p>
        </div>
        <Link href="/talep/yeni" className="btn"><Plus size={16} />Yeni talep</Link>
      </div>

      <ErrorBox message={error} />
      {loading ? <Loading /> : items.length === 0 ? (
        <Empty title="Henüz talep oluşturmadınız."
          description="İhtiyacınızı tanımlayın, uygun işletmelerden teklif alın." />
      ) : (
        <div className="grid gap-4">
          {items.map(item => {
            const Icon = statusIcon[item.status] || Clock;
            return (
              <Link key={item.id} href={`/taleplerim/${item.id}`}
                className="panel p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="status bg-accent text-accent-foreground flex items-center gap-1">
                        <Icon size={12} />{REQUEST_STATUSES[item.status]}
                      </span>
                      {item.offerCount > 0 && (
                        <span className="status bg-primary/10 text-primary">
                          {item.offerCount} teklif
                        </span>
                      )}
                    </div>
                    <h2 className="section-title truncate">{item.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {BUSINESS_CATEGORIES[item.category] || item.category} · {item.district}
                      {' · '}{formatBudget(item.budgetMin, item.budgetMax)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <SafeDate date={item.createdAt} locale="tr-TR" options={{ dateStyle: 'medium' }} />
                    <div className="mt-1">{item.matchCount} eşleşme</div>
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
