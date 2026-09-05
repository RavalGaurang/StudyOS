'use client';

import React, { useState, useEffect } from 'react';
import { aiService } from '../../../services/aiService';
import { subjectService } from '../../../services/subjectService';
import { Subject } from '../../../types/academic.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { FormInput } from '../../../components/ui/FormInput';
import { FormSelect } from '../../../components/ui/FormSelect';
import { FormTextarea } from '../../../components/ui/FormTextarea';
import { Select } from '../../../components/ui/Select';
import { Tabs } from '../../../components/ui/Tabs';
import { Bot, Sparkles, HelpCircle, FileText, Calendar, Send, Check } from 'lucide-react';

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState('tutor');
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // AI Tutor State
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [tutorLoading, setTutorLoading] = useState(false);

  // AI Quiz Generator State
  const [quizTopic, setQuizTopic] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);

  // AI Notes Summarizer State
  const [notesInput, setNotesInput] = useState('');
  const [notesSummary, setNotesSummary] = useState<any>(null);
  const [notesLoading, setNotesLoading] = useState(false);

  // AI Study Planner State
  const [examDate, setExamDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [dailyHours, setDailyHours] = useState(3);
  const [planSchedule, setPlanSchedule] = useState<any[]>([]);
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    subjectService.getSubjects().then(setSubjects).catch(console.error);
  }, []);

  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorPrompt.trim()) return;
    setTutorLoading(true);
    try {
      const res = await aiService.askTutor({
        prompt: tutorPrompt,
        subjectName: selectedSubject || undefined,
      });
      setTutorResponse(res.response);
    } catch (err) {
      console.error(err);
    } finally {
      setTutorLoading(false);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic.trim()) return;
    setQuizLoading(true);
    try {
      const res = await aiService.generateQuiz({
        topicTitle: quizTopic,
        subjectName: selectedSubject || undefined,
        numQuestions: 3,
      });
      setQuizQuestions(res.questions);
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSummarizeNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesInput.trim()) return;
    setNotesLoading(true);
    try {
      const res = await aiService.summarizeNotes({
        notesContent: notesInput,
      });
      setNotesSummary(res);
    } catch (err) {
      console.error(err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanLoading(true);
    try {
      const subjectNames = subjects.length > 0 ? subjects.map((s) => s.name) : ['Core Subjects'];
      const res = await aiService.generateStudyPlan({
        examDate,
        availableDailyHours: dailyHours,
        subjects: subjectNames,
      });
      setPlanSchedule(res.schedule);
    } catch (err) {
      console.error(err);
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              AI Study Assistant & Tools
            </h1>
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalized AI tutor, automated practice test generator, notes summarizer, and exam planner.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'tutor', label: 'AI Concept Tutor', icon: <Bot className="w-4 h-4" /> },
          { id: 'quiz', label: 'AI Quiz Generator', icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'summarizer', label: 'Notes Summarizer', icon: <FileText className="w-4 h-4" /> },
          { id: 'planner', label: 'Exam Revision Planner', icon: <Calendar className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* 1. AI Tutor Tab */}
      {activeTab === 'tutor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Ask AI Academic Tutor
            </h3>
            <form onSubmit={handleAskTutor} className="space-y-4">
              <Select
                label="Subject Context (Optional)"
                value={selectedSubject}
                onChange={(e: any) => setSelectedSubject(e.target.value)}
                options={[
                  { value: '', label: '-- General Science & Engineering --' },
                  ...subjects.map((s) => ({ value: s.name, label: s.name })),
                ]}
                placeholder="-- General Science & Engineering --"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Question / Concept to Explain
                </label>
                <textarea
                  value={tutorPrompt}
                  onChange={(e) => setTutorPrompt(e.target.value)}
                  placeholder="e.g. Explain database normalization from 1NF to BCNF with a practical hospital example..."
                  rows={5}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-bold shadow-md shadow-indigo-500/20"
                isLoading={tutorLoading}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Get Step-by-Step Explanation
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              AI Tutor Response & Breakdown
            </h3>
            {tutorLoading ? (
              <p className="text-xs text-indigo-500 py-12 text-center animate-pulse">
                AI is structuring the concept breakdown...
              </p>
            ) : tutorResponse ? (
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                {tutorResponse}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Enter your question on the left to receive an interactive, structured tutorial.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 2. AI Quiz Generator Tab */}
      {activeTab === 'quiz' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Generate Practice Quiz
            </h3>
            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Chapter Name
                </label>
                <input
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="e.g. Dijkstra Shortest Path Algorithm"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-bold shadow-md shadow-indigo-500/20"
                isLoading={quizLoading}
              >
                Generate 3-Question Practice Test
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              Generated Practice Questions
            </h3>
            {quizLoading ? (
              <p className="text-xs text-indigo-500 py-12 text-center animate-pulse">
                Generating active recall test questions...
              </p>
            ) : quizQuestions.length > 0 ? (
              <div className="space-y-4">
                {quizQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Question {idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {q.questionText}
                    </h4>
                    <div className="space-y-1 pt-1">
                      {q.options.map((opt: any, oIdx: number) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg text-xs flex items-center justify-between ${
                            opt.isCorrect
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500 text-emerald-800 dark:text-emerald-200 font-semibold'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span>{opt.optionText}</span>
                          {opt.isCorrect && <Badge variant="success">Correct Answer</Badge>}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span className="font-bold">Explanation: </span> {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Enter any chapter or topic title to auto-generate MCQ practice tests.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 3. AI Notes Summarizer Tab */}
      {activeTab === 'summarizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Input Notes / Textbook Text
            </h3>
            <form onSubmit={handleSummarizeNotes} className="space-y-4">
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Paste raw lecture notes, chapter paragraphs, or study points here..."
                rows={10}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-bold"
                isLoading={notesLoading}
              >
                Summarize & Extract Flashcards
              </Button>
            </form>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              AI Summary & Extracted Flashcards
            </h3>
            {notesLoading ? (
              <p className="text-xs text-indigo-500 py-12 text-center animate-pulse">
                Distilling key concepts and flashcard pairs...
              </p>
            ) : notesSummary ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs leading-relaxed">
                  <h4 className="font-bold text-indigo-500 mb-1">Summary</h4>
                  <p>{notesSummary.summary}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Auto-Extracted Flashcards
                  </h4>
                  {notesSummary.flashcards.map((fc: any, fIdx: number) => (
                    <div key={fIdx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs space-y-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100">Q: {fc.front}</p>
                      <p className="text-slate-500 dark:text-slate-400">A: {fc.back}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Paste study notes on the left to extract bullet points and flashcards.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 4. AI Exam Revision Planner Tab */}
      {activeTab === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Exam Planner Parameters
            </h3>
            <form onSubmit={handleGeneratePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Upcoming Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Available Daily Study Hours
                </label>
                <input
                  type="number"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value, 10))}
                  min={1}
                  max={12}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-bold shadow-md shadow-indigo-500/20"
                isLoading={planLoading}
              >
                Generate 14-Day Revision Schedule
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-2 p-6">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              Recommended Revision Roadmap
            </h3>
            {planLoading ? (
              <p className="text-xs text-indigo-500 py-12 text-center animate-pulse">
                Optimizing daily study allocations...
              </p>
            ) : planSchedule.length > 0 ? (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {planSchedule.map((item, sIdx) => (
                  <div key={sIdx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {item.day} ({item.date})
                        </span>
                        <Badge variant="primary">{item.subject}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Focus: {item.focusAreas.join(' • ')}
                      </p>
                    </div>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">
                      {item.plannedHours} Hours
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Set your exam date to generate an optimal daily revision roadmap.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
