'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSearchModalOpen } from '../../store/slices/uiSlice';
import { Search, BookOpen, CheckSquare, BookMarked, GraduationCap, X } from 'lucide-react';
import { taskService } from '../../services/taskService';
import { subjectService } from '../../services/subjectService';
import { noteService } from '../../services/noteService';
import { examService } from '../../services/examService';
import Link from 'next/link';

export const SearchModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { searchModalOpen } = useAppSelector((state) => state.ui);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    subjects: any[];
    tasks: any[];
    notes: any[];
    exams: any[];
  }>({ subjects: [], tasks: [], notes: [], exams: [] });
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        dispatch(setSearchModalOpen(true));
      }
      if (e.key === 'Escape' && searchModalOpen) {
        dispatch(setSearchModalOpen(false));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, searchModalOpen]);

  // Debounced multi-entity search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ subjects: [], tasks: [], notes: [], exams: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [subjects, taskRes, notes, exams] = await Promise.all([
          subjectService.getSubjects(),
          taskService.getTasks({ search: query, limit: 5 }),
          noteService.getNotes({ search: query }),
          examService.getExams(),
        ]);

        const filteredSubjects = subjects.filter((s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          (s.code && s.code.toLowerCase().includes(query.toLowerCase()))
        );

        const filteredExams = exams.filter((ex) =>
          ex.title.toLowerCase().includes(query.toLowerCase())
        );

        setResults({
          subjects: filteredSubjects.slice(0, 4),
          tasks: taskRes.tasks.slice(0, 5),
          notes: notes.slice(0, 5),
          exams: filteredExams.slice(0, 4),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!searchModalOpen) return null;

  const totalResults =
    results.subjects.length + results.tasks.length + results.notes.length + results.exams.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search subjects, tasks, notes, exams..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => dispatch(setSearchModalOpen(false))}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categorized Results */}
        <div className="overflow-y-auto py-3 space-y-4 flex-1">
          {loading ? (
            <p className="text-center text-xs text-slate-400 py-8">Searching across StudyOS...</p>
          ) : query && totalResults === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">
              No results found for "{query}"
            </p>
          ) : !query ? (
            <div className="text-center py-8">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Quick Navigation & Academic Search
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Type any task title, subject name, syllabus topic, or notes keywords
              </p>
            </div>
          ) : (
            <>
              {/* Subjects */}
              {results.subjects.length > 0 && (
                <div>
                  <h6 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Subjects
                  </h6>
                  <div className="space-y-1">
                    {results.subjects.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/subjects/${sub.id}`}
                        onClick={() => dispatch(setSearchModalOpen(false))}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span>{sub.name}</span>
                        {sub.code && (
                          <span className="text-[10px] text-slate-400 ml-auto">{sub.code}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <h6 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Tasks
                  </h6>
                  <div className="space-y-1">
                    {results.tasks.map((t) => (
                      <Link
                        key={t.id}
                        href="/tasks"
                        onClick={() => dispatch(setSearchModalOpen(false))}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <CheckSquare className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                        <span className="truncate">{t.title}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 ml-auto">
                          {t.priority}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {results.notes.length > 0 && (
                <div>
                  <h6 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Notes
                  </h6>
                  <div className="space-y-1">
                    {results.notes.map((n) => (
                      <Link
                        key={n.id}
                        href="/notes"
                        onClick={() => dispatch(setSearchModalOpen(false))}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <BookMarked className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{n.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Exams */}
              {results.exams.length > 0 && (
                <div>
                  <h6 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    Exams
                  </h6>
                  <div className="space-y-1">
                    {results.exams.map((ex) => (
                      <Link
                        key={ex.id}
                        href="/exams"
                        onClick={() => dispatch(setSearchModalOpen(false))}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <GraduationCap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{ex.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
