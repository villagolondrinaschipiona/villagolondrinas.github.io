import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let connectionUrl = process.env.DATABASE_URL;

// Auto-upgrade legacy Supabase PgBouncer URLs to the new Supavisor format.
// Legacy Vercel ENVs used: postgresql://postgres:password@db.[ref].supabase.co:6543
// Supavisor requires: postgresql://postgres.[ref]:password@aws-0-region.pooler.supabase.com:6543
if (connectionUrl && connectionUrl.includes('supabase.co')) {
    const pwdMatch = connectionUrl.match(/postgres:(.*?)@db\./);
    if (pwdMatch && pwdMatch[1]) {
        const pwd = pwdMatch[1];
        // The project ref from local .env is acojffdhkegurjuztpax
        connectionUrl = `postgresql://postgres.acojffdhkegurjuztpax:${pwd}@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    }
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: connectionUrl
        }
    }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
