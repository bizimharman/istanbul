'use client';
import {useEffect,useState} from 'react';
import {motion} from 'framer-motion';
import {AlertCircle,Inbox,Loader2} from 'lucide-react';
import {STATUSES} from '@/lib/constants';
export function Status({value}:{value:string}){return <span className={`status status-${value}`}><span className="h-1.5 w-1.5 rounded-full bg-current"/>{STATUSES[value]??value}</span>;}
export function ErrorBox({message}:{message:string}){return message?<div role="alert" className="my-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive"><AlertCircle size={18}/>{message}</div>:null;}
export function Loading(){return <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 size={20} className="animate-spin"/>Yükleniyor…</div>;}
export function Empty({title='Henüz kayıt bulunmuyor.',description='Yeni kayıtlar burada görünecek.'}:{title?:string;description?:string}){return <div className="grid min-h-44 place-content-center p-6 text-center"><Inbox className="mx-auto mb-3 text-primary/50" size={30}/><p className="text-sm font-medium">{title}</p><p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p></div>;}
export function Reveal({children,delay=0}:{children:React.ReactNode;delay?:number}){return <motion.div initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.35,delay}}>{children}</motion.div>;}
export function Counter({value}:{value:number}){const [shown,setShown]=useState(0);useEffect(()=>{let start:number|undefined;let frame=0;const step=(t:number)=>{if(start===undefined)start=t;const p=Math.min((t-start)/650,1);setShown(Math.round(value*(1-(1-p)**3)));if(p<1)frame=requestAnimationFrame(step);};frame=requestAnimationFrame(step);return()=>cancelAnimationFrame(frame);},[value]);return <>{shown}</>;}
