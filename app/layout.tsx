import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
const dmSans=DM_Sans({subsets:['latin','latin-ext'],variable:'--font-sans'});
const jakartaSans=Plus_Jakarta_Sans({subsets:['latin','latin-ext'],variable:'--font-display'});
const mono=JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});
export const dynamic='force-dynamic';
export const metadata={metadataBase:new URL(process.env.NEXTAUTH_URL??'http://localhost:3000'),title:{default:'İstanbul Akıllı Şehir',template:'%s | İstanbul Akıllı Şehir'},description:'Şehrinle bağlantıda kal. İstanbul için başvur, takip et, haberdar ol.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'},openGraph:{title:'İstanbul Akıllı Şehir',description:'Daha yaşanabilir bir İstanbul için birlikte.',images:['/og-image.png']}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr" suppressHydrationWarning><head><script src="https://apps.abacus.ai/chatllm/appllm-lib.js" /></head><body className={`${dmSans.variable} ${jakartaSans.variable} ${mono.variable} font-sans`}><ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">{children}<Toaster/><ChunkLoadErrorHandler/></ThemeProvider></body></html>;}
