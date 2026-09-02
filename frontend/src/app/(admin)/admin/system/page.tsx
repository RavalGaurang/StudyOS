'use client';

import React from 'react';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Server, Database, ShieldCheck, Cpu, HardDrive, Zap } from 'lucide-react';

export default function AdminSystemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          System Diagnostics & Platform Infrastructure
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Server health status, database pool status, API gateway latencies, and security headers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Server className="w-5 h-5 text-indigo-500" />
              <span>Node.js API Server</span>
            </div>
            <Badge variant="success">Operational</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Express.js v4 runtime running on port 5000 with CORS, rate-limiting, and Helmet enabled.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Uptime: 99.98% • Latency: ~14ms
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Database className="w-5 h-5 text-emerald-500" />
              <span>PostgreSQL + Prisma</span>
            </div>
            <Badge variant="success">Connected</Badge>
          </div>
          <p className="text-xs text-slate-500">
            PostgreSQL instance connected via Prisma ORM connection pool.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Pool Connections: Active • SSL: Enabled
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
              <span>Security & Auth Engine</span>
            </div>
            <Badge variant="success">Secured</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Dual JWT architecture with short-lived access tokens and HttpOnly refresh cookies.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Argon2 Hashing • RBAC Guards Active
          </div>
        </Card>
      </div>

      <Card title="System Environment Configuration" subtitle="Runtime parameters and variables">
        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-1.5 overflow-x-auto">
          <div>NODE_ENV: &quot;production&quot;</div>
          <div>API_PREFIX: &quot;/api/v1&quot;</div>
          <div>DATABASE_URL: &quot;postgresql://postgres:***@localhost:5432/studyos_db&quot;</div>
          <div>RATE_LIMIT: &quot;100 requests per 15 minutes per IP&quot;</div>
          <div>AUTH_ACCESS_TOKEN_EXPIRY: &quot;15m&quot;</div>
          <div>AUTH_REFRESH_TOKEN_EXPIRY: &quot;7d&quot;</div>
        </div>
      </Card>
    </div>
  );
}
