'use client';

import React, { useState, useEffect } from 'react';
import { quizService } from '../../../services/quizService';
import { subjectService } from '../../../services/subjectService';
import { FlashcardDeck, Flashcard } from '../../../types/study.types';
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
import { Layers, Plus, RotateCw, Check, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const deckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(500).optional(),
  subjectId: z.string().optional(),
});

const cardSchema = z.object({
  front: z.string().min(1, 'Front text is required'),
  back: z.string().min(1, 'Back answer is required'),
});

type DeckFormValues = z.infer<typeof deckSchema>;
type CardFormValues = z.infer<typeof cardSchema>;

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const deckForm = useForm<DeckFormValues>({
    resolver: zodResolver(deckSchema),
    defaultValues: { title: '', description: '', subjectId: '' },
  });

  const cardForm = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: { front: '', back: '' },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [deckRes, subRes] = await Promise.all([
        quizService.getDecks(),
        subjectService.getSubjects(),
      ]);
      setDecks(deckRes);
      setSubjects(subRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDeck = async (deckId: string) => {
    try {
      const fullDeck = await quizService.getDeckById(deckId);
      setSelectedDeck(fullDeck);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async (masteryLevel: number) => {
    if (!selectedDeck?.flashcards?.length) return;
    const currentCard = selectedDeck.flashcards[currentCardIndex];

    try {
      await quizService.reviewCard(currentCard.id, masteryLevel);
      setIsFlipped(false);
      if (currentCardIndex < selectedDeck.flashcards.length - 1) {
        setCurrentCardIndex((prev) => prev + 1);
      } else {
        alert('🎉 Deck Completed! You reviewed all cards in this deck.');
        setSelectedDeck(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onCreateDeck = async (values: DeckFormValues) => {
    try {
      await quizService.createDeck({
        ...values,
        subjectId: values.subjectId || undefined,
      });
      setIsCreateDeckOpen(false);
      deckForm.reset();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create deck');
    }
  };

  const onAddCard = async (values: CardFormValues) => {
    if (!selectedDeck) return;
    try {
      await quizService.addCard(selectedDeck.id, values);
      setIsAddCardOpen(false);
      cardForm.reset();
      handleOpenDeck(selectedDeck.id);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add card');
    }
  };

  const subjectOptions = [
    { value: '', label: '-- General Study Deck --' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  if (loading) return <LoadingState message="Loading flashcard decks..." />;

  const activeCards = selectedDeck?.flashcards || [];
  const currentCard = activeCards[currentCardIndex];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Flashcards & Spaced Repetition
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active recall flip cards with adaptive 5-level review intervals.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateDeckOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Create Deck
        </Button>
      </div>

      {/* Active Flip Card Review Player */}
      {selectedDeck && currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedDeck(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              ← Back to All Decks
            </button>
            <span className="text-xs font-bold text-slate-500">
              Card {currentCardIndex + 1} of {activeCards.length}
            </span>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[280px] p-8 rounded-3xl border-2 border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 shadow-2xl flex flex-col justify-between items-center text-center cursor-pointer select-none transition-all hover:scale-[1.01]"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
              {isFlipped ? 'Answer / Concept Details' : 'Question / Concept Prompt'} (Click to Flip)
            </span>

            <div className="my-auto">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </h2>
            </div>

            <span className="text-xs text-slate-400 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Tap anywhere to flip card
            </span>
          </div>

          {/* Mastery Rating Response Buttons */}
          {isFlipped ? (
            <div className="space-y-2 text-center animate-in fade-in">
              <p className="text-xs font-bold text-slate-500">How well did you know this?</p>
              <div className="grid grid-cols-5 gap-2">
                <Button variant="danger" size="sm" onClick={() => handleReview(1)}>
                  1: Again (1d)
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleReview(2)}>
                  2: Hard (3d)
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleReview(3)}>
                  3: Good (7d)
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleReview(4)}>
                  4: Easy (14d)
                </Button>
                <Button variant="success" size="sm" onClick={() => handleReview(5)}>
                  5: Master (30d)
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Button variant="secondary" size="md" onClick={() => setIsFlipped(true)}>
                Reveal Answer
              </Button>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddCardOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Card to this Deck
            </Button>
          </div>
        </div>
      ) : (
        /* Decks Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {decks.map((deck) => (
            <Card key={deck.id} hoverable className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {deck.title}
                    </h3>
                  </div>
                </div>

                {deck.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {deck.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span>{deck._count?.flashcards || 0} Flashcards</span>
                  <Badge variant="primary">Spaced Repetition</Badge>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full mt-4 font-bold"
                onClick={() => handleOpenDeck(deck.id)}
              >
                Start Review Session
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Deck */}
      <Modal
        isOpen={isCreateDeckOpen}
        onClose={() => setIsCreateDeckOpen(false)}
        title="Create Flashcard Deck"
        description="Create a deck linked to an enrolled subject or general study topic."
      >
        <form onSubmit={deckForm.handleSubmit(onCreateDeck)} className="space-y-4">
          <FormInput
            name="title"
            label="Deck Title"
            placeholder="e.g. DBMS Normalization Rules"
            control={deckForm.control}
          />
          <FormSelect
            name="subjectId"
            label="Subject"
            options={subjectOptions}
            control={deckForm.control}
          />
          <FormTextarea
            name="description"
            label="Description (Optional)"
            placeholder="Scope of flashcards in this deck..."
            control={deckForm.control}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateDeckOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={deckForm.formState.isSubmitting}>
              Create Deck
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Card to Deck */}
      <Modal
        isOpen={isAddCardOpen}
        onClose={() => setIsAddCardOpen(false)}
        title="Add Flashcard"
        description={`Add a new flashcard to ${selectedDeck?.title}`}
      >
        <form onSubmit={cardForm.handleSubmit(onAddCard)} className="space-y-4">
          <FormTextarea
            name="front"
            label="Front Side (Prompt / Question)"
            placeholder="e.g. What is Boyce-Codd Normal Form (BCNF)?"
            control={cardForm.control}
          />
          <FormTextarea
            name="back"
            label="Back Side (Answer / Key Explanation)"
            placeholder="e.g. In BCNF, for every functional dependency X -> Y, X must strictly be a Super Key."
            control={cardForm.control}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddCardOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={cardForm.formState.isSubmitting}>
              Add Card
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
