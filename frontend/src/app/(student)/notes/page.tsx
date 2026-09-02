'use client';

import React, { useState, useEffect } from 'react';
import { noteService } from '../../../services/noteService';
import { subjectService } from '../../../services/subjectService';
import { Note } from '../../../types/study.types';
import { Subject } from '../../../types/academic.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { FormInput } from '../../../components/ui/FormInput';
import { FormSelect } from '../../../components/ui/FormSelect';
import { FormTextarea } from '../../../components/ui/FormTextarea';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pin, Search, Tag, BookMarked, Trash2, Edit3 } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subjectId: z.string().optional(),
  content: z.string().min(1, 'Note content is required'),
  tags: z.string().optional(),
});

type NoteFormValues = z.infer<typeof noteSchema>;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: '',
      subjectId: '',
      content: '',
      tags: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedSubject) params.subjectId = selectedSubject;

      const [notesRes, subRes] = await Promise.all([
        noteService.getNotes(params),
        subjectService.getSubjects(),
      ]);
      setNotes(notesRes);
      setSubjects(subRes);
      if (notesRes.length > 0 && !selectedNote) {
        setSelectedNote(notesRes[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSubject]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      await noteService.togglePin(noteId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await noteService.deleteNote(noteId);
      if (selectedNote?.id === noteId) setSelectedNote(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (values: NoteFormValues) => {
    try {
      const tagsArray = values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await noteService.createNote({
        title: values.title,
        content: values.content,
        subjectId: values.subjectId || undefined,
        tags: tagsArray,
        isPinned: false,
      });

      setIsCreateOpen(false);
      reset();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving note');
    }
  };

  const subjectOptions = [
    { value: '', label: '-- General Notes (No Subject) --' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Notes & Knowledge Vault
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Structured Markdown study notes, exam cheat sheets, and tagged summaries.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Create Note
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes content or tags..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </form>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Split Viewer: Note List on Left, Content Viewer on Right */}
      {loading ? (
        <LoadingState message="Loading notes vault..." />
      ) : notes.length === 0 ? (
        <EmptyState
          title="No notes recorded"
          description="Create markdown notes to summarize key topics, formulas, or lecture takeaways."
          action={
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + Write First Note
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Note List (1 Col) */}
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {notes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <Card
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : 'hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                      {note.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(note.id);
                      }}
                      className={`p-1 rounded-lg transition-colors ${
                        note.isPinned
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-300 hover:text-slate-500'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {note.content.replace(/[#*`_]/g, '')}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    {note.subject ? (
                      <span
                        className="font-bold px-1.5 py-0.2 rounded"
                        style={{
                          backgroundColor: `${note.subject.color}15`,
                          color: note.subject.color,
                        }}
                      >
                        {note.subject.name}
                      </span>
                    ) : (
                      <span>General</span>
                    )}
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Note Full Content Viewer (2 Cols) */}
          <div className="lg:col-span-2">
            {selectedNote ? (
              <Card className="p-6 h-full flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedNote.isPinned && (
                          <Badge variant="primary">Pinned Note</Badge>
                        )}
                        {selectedNote.subject && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: `${selectedNote.subject.color}15`,
                              color: selectedNote.subject.color,
                            }}
                          >
                            {selectedNote.subject.name}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
                        {selectedNote.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(selectedNote.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Render Note Markdown Content */}
                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-6 whitespace-pre-wrap font-mono leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {selectedNote.content}
                  </div>

                  {/* Tags */}
                  {selectedNote.tags && selectedNote.tags.length > 0 && (
                    <div className="flex items-center gap-2 mt-6 flex-wrap">
                      {selectedNote.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Tag className="w-3 h-3 text-slate-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Last updated on {formatDate(selectedNote.updatedAt)}</span>
                  <span>Markdown Support Active</span>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center p-12 text-center text-slate-400">
                Select a note from the left to read and review.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Note */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Markdown Note"
        description="Write notes with headings, code snippets, and active tags."
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="title"
            label="Note Title"
            placeholder="e.g. ACID Properties & Transaction Isolation"
            control={control}
          />

          <FormSelect
            name="subjectId"
            label="Subject (Optional)"
            options={subjectOptions}
            control={control}
          />

          <FormTextarea
            name="content"
            label="Markdown Content"
            placeholder="# Key Concept&#10;&#10;1. Definition&#10;2. Formulas and Rules..."
            rows={8}
            control={control}
          />

          <FormInput
            name="tags"
            label="Tags (Comma separated)"
            placeholder="e.g. database, acid, exam-prep"
            control={control}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
