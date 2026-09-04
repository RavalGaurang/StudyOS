import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.development') });
dotenv.config(); // Also check current working directory for .env

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .default(5000),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/studyos_db?schema=public'),
  JWT_ACCESS_SECRET: z
    .string()
    .default('studyos_default_jwt_access_secret_key_prod_2026_super_secure'),
  JWT_REFRESH_SECRET: z
    .string()
    .default('studyos_default_jwt_refresh_secret_key_prod_2026_super_secure'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  AI_PROVIDER: z.string().default('mock'),
  AI_API_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
