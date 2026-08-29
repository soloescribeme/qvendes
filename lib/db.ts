import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_oAkpVQtM2dY7@ep-calm-morning-ac8e6m5u.sa-east-1.aws.neon.tech/neondb?sslmode=require';

export const sql = neon(databaseUrl);
