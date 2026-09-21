import {currentUser} from '@/lib/server';
import Announcements from '@/components/announcements';
import {DISTRICTS} from '@/lib/constants';
export default async function Page({searchParams}:{searchParams:Promise<{ilce?:string;duyuru?:string;yonetim?:string}>}){const user=await currentUser();const p=await searchParams;return <Announcements admin={user?.role==='MUNICIPAL_ADMIN'} initialDistrict={p.ilce&&DISTRICTS.includes(p.ilce)?p.ilce:user?.district??'Kadıköy'} initialOpen={p.duyuru??''} initialManage={p.yonetim==='1'}/>;}
