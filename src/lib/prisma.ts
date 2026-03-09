import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

// Auto-correct Supabase pooler URLs to direct URLs if DIRECT_URL is missing in Vercel
// This prevents "Tenant or user not found" and massive payload drops via PgBouncer
if (connectionUrl && connectionUrl.includes('supabase.com:6543') && !process.env.DIRECT_URL) {
    connectionUrl = connectionUrl.replace(':6543', ':5432').replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');
}

export const prisma =
    globalForPrisma.prisma || new PrismaClient({
        datasources: {
            db: {
                url: connectionUrl
            }
        }
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
