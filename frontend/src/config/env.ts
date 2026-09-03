import { z } from 'zod';

/**
 * Zod Schema for Client-Side & Build Environment Variables.
 * Client variables MUST use NEXT_PUBLIC_ prefix.
 * Server secrets must NEVER use NEXT_PUBLIC_ and are never exposed here.
 */
const envSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  NEXT_PUBLIC_API_URL: z
    .string({
      required_error: 'NEXT_PUBLIC_API_URL is required',
    })
    .url('NEXT_PUBLIC_API_URL must be a valid URL (e.g. http://localhost:5000/api/v1 or https://your-backend.com/api/v1)'),
  NEXT_PUBLIC_APP_NAME: z
    .string()
    .min(1, 'NEXT_PUBLIC_APP_NAME must not be empty')
    .default('StudyOS'),
});

const rawEnv = {
  NEXT_PUBLIC_APP_ENV:
    process.env.NEXT_PUBLIC_APP_ENV ||
    (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'StudyOS',
};

const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  const errors = parsedEnv.error.flatten().fieldErrors;
  console.error('❌ [StudyOS] Invalid environment variables configuration:', errors);
  throw new Error(`[StudyOS] Invalid environment configuration: ${JSON.stringify(errors)}`);
}

/**
 * Centralized, validated environment configuration.
 * Single source of truth across the frontend application.
 */
export const env = {
  appEnv: parsedEnv.data.NEXT_PUBLIC_APP_ENV,
  apiUrl: parsedEnv.data.NEXT_PUBLIC_API_URL.replace(/\/+$/, ''),
  appName: parsedEnv.data.NEXT_PUBLIC_APP_NAME,
  isDevelopment: parsedEnv.data.NEXT_PUBLIC_APP_ENV === 'development',
  isProduction: parsedEnv.data.NEXT_PUBLIC_APP_ENV === 'production',
  isTest: parsedEnv.data.NEXT_PUBLIC_APP_ENV === 'test',
} as const;

export type Env = typeof env;

/**
 * Safe diagnostic mechanism returning only public configuration.
 * Strictly guarantees no secrets, tokens, passwords, or cookies are logged or leaked.
 */
export function getSafeEnvDiagnostics() {
  return {
    appEnv: env.appEnv,
    apiUrl: env.apiUrl,
    appName: env.appName,
    isDevelopment: env.isDevelopment,
    isProduction: env.isProduction,
  };
}
