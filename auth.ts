import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';
export const { handlers, auth, signIn, signOut } = NextAuth({
 adapter: PrismaAdapter(prisma), trustHost: true,
 session: { strategy: 'jwt' }, pages: { signIn: '/login' },
 providers: [Credentials({ credentials: {email:{},password:{}}, async authorize(credentials) {
  const parsed = z.object({email:z.string().email(),password:z.string().min(1).max(128)}).safeParse(credentials);
  if(!parsed?.success) return null;
  const user = await prisma.user.findUnique({where:{email:parsed.data.email.toLowerCase().trim()}});
  if(!user || !(await compare(parsed.data.password,user.passwordHash))) return null;
  return {id:user.id,name:user.name,email:user.email,role:user.role,district:user.district};
 }})],
 callbacks: {
  async jwt({token,user}) { if(user){token.role=(user as any)?.role;token.district=(user as any)?.district;} return token; },
  async session({session,token}) { if(session?.user){session.user.id=token?.sub ?? '';(session.user as any).role=token?.role;(session.user as any).district=token?.district;} return session; }
 }
});
