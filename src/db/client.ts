import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL?.trim();

export const queryClient = connectionString
  ? postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: 'require',
    })
  : null;

export const db: ReturnType<typeof drizzle<typeof schema>> = queryClient
  ? drizzle(queryClient, { schema })
  : (new Proxy(
      {},
      {
        get() {
          throw new Error('DATABASE_URL is not configured');
        },
      }
    ) as any);
