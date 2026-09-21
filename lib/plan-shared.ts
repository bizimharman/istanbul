import { z } from 'zod';
import { DISTRICTS } from './constants';

export const PLAN_ITEM_STATUSES: Record<string, string> = {
  PENDING: 'Bekliyor',
  DONE: 'Tamamlandı',
  MISSED: 'Kaçırıldı',
};

export const PLAN_KINDS: Record<string, string> = {
  PERSONAL: 'Kişisel plan',
  ASSIGNED: 'Atanan görev',
};

const district = z
  .string()
  .trim()
  .max(40)
  .refine((v) => v === '' || DISTRICTS.includes(v), 'Geçerli bir İstanbul ilçesi seçin.');

// "HH:MM" 24h or empty
const timeStr = z
  .string()
  .trim()
  .max(5)
  .refine((v) => v === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(v), 'Saati SS:DD biçiminde girin.');

export const planItemSchema = z.object({
  title: z.string().trim().min(2, 'En az 2 karakter').max(120),
  description: z.string().trim().max(600).default(''),
  district: district.default(''),
  location: z.string().trim().max(160).default(''),
  targetTime: timeStr.default(''),
  points: z.number().int().min(1, 'En az 1 puan').max(100, 'En fazla 100 puan'),
});
export type PlanItemForm = z.infer<typeof planItemSchema>;

export const planFormSchema = z.object({
  title: z.string().trim().min(3, 'En az 3 karakter').max(120),
  date: z
    .string()
    .trim()
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), 'Geçerli bir tarih seçin.'),
  note: z.string().trim().max(1000).default(''),
  assigneeEmail: z.string().trim().max(160).default(''),
  items: z.array(planItemSchema).min(1, 'En az bir görev ekleyin.').max(20, 'En fazla 20 görev.'),
});
export type PlanForm = z.infer<typeof planFormSchema>;

export type PlanItemView = {
  id: string;
  order: number;
  title: string;
  description: string;
  district: string;
  location: string;
  targetTime: string;
  points: number;
  status: string;
  completedAt: string | null;
  onTime: boolean | null;
  awardedPoints: number;
};

export type PlanSummary = {
  id: string;
  kind: string;
  title: string;
  date: string;
  note: string;
  cancelled: boolean;
  createdAt: string;
  itemCount: number;
  doneCount: number;
  totalPoints: number;
  earnedPoints: number;
  ownerName: string;
  ownerEmail: string;
  assignerName: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
  isOwner: boolean;
  isAssigner: boolean;
};

export type PlanDetail = PlanSummary & {
  items: PlanItemView[];
};

export function progressPct(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export function todayStr(): string {
  const d = new Date();
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}
