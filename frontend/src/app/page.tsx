'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Sparkles,
  Timer,
  BookOpen,
  BarChart3,
  Bot,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'PARENT') router.push('/parent/dashboard');
      else if (user.role === 'ADMIN') router.push('/admin/dashboard');
      else router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center">
          <img
            src="/images/logo.png"
            alt="StudyOS"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Get Started Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          The Commercial-Grade Academic Operating System
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 max-w-4xl leading-[1.15]">
          Master Your Courses, Study Sessions & Academic Goals in{' '}
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
            One Unified Workspace
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mt-6 leading-relaxed">
          StudyOS replaces scattered notes, calendars, flashcards, and timers with an intelligent,
          production-grade platform built specifically for students, parents, and educators.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link href="/register">
            <Button size="lg" className="font-bold px-8 shadow-xl shadow-indigo-500/25" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Student Account
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="font-bold border-slate-300 hover:bg-slate-100 text-slate-700">
              Demo Logins & Sign In
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Syllabus & Course Hierarchy</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Organize subjects into units and topics with real-time completion percentages and target grades.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
              <Timer className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pomodoro Deep Work Engine</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              25/5 and 50/10 focus intervals automatically linked to subjects, tracking exact study duration.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Academic Analytics & Attendance</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Rich Recharts visual trends for weekly study hours, attendance health, and task velocities.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">AI Study Assistant & Quiz Generator</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Ask the AI tutor concept explanations, summarize markdown notes, and generate instant practice quizzes.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Parent Portal & Privacy Isolation</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Parents can monitor grades, attendance, and study hours with strict multi-tenant authorization guards.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-rose-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Exams & Spaced Repetition</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Exam countdown timers, grade weightage calculators, and adaptive 5-level flashcard review queues.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        StudyOS • Production-Grade Academic Operating System &copy; 2026. Built with Next.js, Express, TypeScript & PostgreSQL.
      </footer>
    </div>
  );
}
