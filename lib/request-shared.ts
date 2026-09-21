import { z } from 'zod';
import { DISTRICTS } from './constants';
import { BUSINESS_CATEGORIES } from './business-shared';

export const REQUEST_STATUSES: Record<string, string> = {
  DRAFT: 'Taslak',
  OPEN: 'Açık',
  MATCHED: 'Eşleştirildi',
  OFFERED: 'Teklif geldi',
  ACCEPTED: 'Teklif kabul edildi',
  CLOSED: 'Tamamlandı',
  CANCELLED: 'İptal edildi',
};
export const OFFER_STATUSES: Record<string, string> = {
  PENDING: 'Beklemede',
  ACCEPTED: 'Kabul edildi',
  DECLINED: 'Reddedildi',
  WITHDRAWN: 'Geri çekildi',
};

const district = z.string().refine(v => DISTRICTS.includes(v), 'Geçerli bir İstanbul ilçesi seçin.');

export const requestFormSchema = z.object({
  title: z.string().trim().min(5, 'En az 5 karakter').max(120),
  description: z.string().trim().min(30, 'En az 30 karakter').max(3000),
  category: z.enum(['CUSTOM_FURNITURE', 'EDUCATION', 'RENOVATION', 'OTHER']),
  district: district,
  serviceDistricts: z.array(district).min(1).max(39).transform(v => Array.from(new Set(v))),
  budgetMin: z.number().int().min(0).max(10_000_000).nullable(),
  budgetMax: z.number().int().min(0).max(10_000_000).nullable(),
  timeline: z.string().trim().max(200),
}).refine(d => {
  if (d.budgetMin != null && d.budgetMax != null) return d.budgetMax >= d.budgetMin;
  return true;
}, { message: 'Üst bütçe, alt bütçeden düşük olamaz.', path: ['budgetMax'] });

export type RequestForm = z.infer<typeof requestFormSchema>;

export const offerFormSchema = z.object({
  price: z.number().int().min(0).max(10_000_000).nullable(),
  priceNote: z.string().trim().max(300),
  timeline: z.string().trim().max(200),
  message: z.string().trim().min(10, 'En az 10 karakter').max(2000),
});
export type OfferForm = z.infer<typeof offerFormSchema>;

export type ServiceRequestSummary = {
  id: string; title: string; category: string; district: string;
  serviceDistricts: string[]; budgetMin: number | null; budgetMax: number | null;
  timeline: string; status: string; matchCount: number;
  offerCount: number; createdAt: string;
};
export type ServiceRequestDetail = ServiceRequestSummary & {
  description: string; structuredDetails: any;
  offers: OfferView[];
};
export type OfferView = {
  id: string; businessId: string; businessName: string; businessSlug: string | null;
  businessCategory: string; price: number | null; priceNote: string;
  timeline: string; message: string; status: string; createdAt: string;
};
export type BusinessRequestView = {
  id: string; title: string; description: string; category: string;
  district: string; serviceDistricts: string[]; budgetMin: number | null;
  budgetMax: number | null; timeline: string; structuredDetails: any;
  createdAt: string; myOffer: OfferView | null;
};

export function formatBudget(min: number | null, max: number | null): string {
  const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `${fmt(min)}+`;
  if (max != null) return `${fmt(max)}'e kadar`;
  return 'Belirtilmedi';
}
