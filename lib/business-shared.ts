import { z } from 'zod';
import { DISTRICTS } from './constants';
export const BUSINESS_CATEGORIES: Record<string,string> = {CUSTOM_FURNITURE:'Özel ölçü mobilya',EDUCATION:'Özel okul ve eğitim',RENOVATION:'Tadilat ve dekorasyon',OTHER:'Diğer hizmetler'};
export const BUSINESS_STATUSES: Record<string,string> = {DRAFT:'Taslak',PENDING:'İncelemede',PUBLISHED:'Yayında',CHANGES_REQUESTED:'Düzeltme bekleniyor',SUSPENDED:'Yayın durduruldu'};
export const VERIFICATION_METHODS: Record<string,string> = {OFFICIAL_CONTACT:'Bağımsız kaynaktaki kurumsal iletişimle teyit',REGISTRY:'Yetki ve işletme kaydı incelemesi'};
const district=z.string().refine(v=>DISTRICTS.includes(v),'Geçerli bir İstanbul ilçesi seçin.');
export const businessFormSchema=z.object({
 name:z.string().trim().min(2).max(120),branchName:z.string().trim().min(2).max(80),
 category:z.enum(['CUSTOM_FURNITURE','EDUCATION','RENOVATION','OTHER']),district,
 description:z.string().trim().min(80).max(2400),services:z.string().trim().min(20).max(1600),
 exclusions:z.string().trim().max(800),serviceDistricts:z.array(district).min(1).max(39).transform(v=>Array.from(new Set(v))),
 publicAddress:z.string().trim().max(300),publicPhone:z.string().trim().max(30).refine(v=>!v||/^\+?[0-9 ()-]{10,30}$/.test(v)),
 website:z.string().trim().max(300).refine(v=>{if(!v)return true;try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}}),
 hoursText:z.string().trim().max(300),verificationContact:z.string().trim().min(8).max(240),
 ownershipStatement:z.string().trim().min(30).max(1600),
});
export type BusinessForm=z.infer<typeof businessFormSchema>;
export type ManagedBusiness=BusinessForm & {id:string;slug:string|null;status:string;revision:number;verified:boolean;reviewMessage:string;updatedAt:string;events:{id:string;action:string;message:string;createdAt:string}[]};
export const emptyBusiness:BusinessForm={name:'',branchName:'Merkez',category:'CUSTOM_FURNITURE',district:'Kadıköy',description:'',services:'',exclusions:'',serviceDistricts:['Kadıköy'],publicAddress:'',publicPhone:'',website:'',hoursText:'',verificationContact:'',ownershipStatement:''};
