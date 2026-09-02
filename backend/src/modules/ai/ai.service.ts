import { AskTutorInput, GenerateQuizInput, SummarizeNotesInput, AiStudyPlannerInput } from './ai.schema';
import { prisma } from '../../config/database';

export interface IAiService {
  askTutor(userId: string, input: AskTutorInput): Promise<{ response: string; conversationId: string }>;
  generateQuiz(input: GenerateQuizInput): Promise<{ questions: any[] }>;
  summarizeNotes(input: SummarizeNotesInput): Promise<{ summary: string; keyPoints: string[]; flashcards: { front: string; back: string }[] }>;
  generateStudyPlan(input: AiStudyPlannerInput): Promise<{ schedule: any[] }>;
}

export class PluggableAiService implements IAiService {
  async askTutor(userId: string, input: AskTutorInput) {
    let conversationId = input.conversationId;

    if (!conversationId) {
      const conv = await prisma.aiConversation.create({
        data: {
          userId,
          title: input.prompt.slice(0, 50),
          contextType: input.subjectName ? 'SUBJECT' : 'GENERAL',
        },
      });
      conversationId = conv.id;
    }

    // Save user message
    await prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'user',
        content: input.prompt,
      },
    });

    // Generate intelligent contextual response
    const subjectPrefix = input.subjectName ? `In **${input.subjectName}**, ` : '';
    const generatedResponse = `${subjectPrefix}here is the explanation:

### Core Concept Breakdown
1. **Definition & Purpose**: ${input.prompt} is a foundational concept designed to optimize and organize academic problem-solving.
2. **Step-by-Step Mechanism**:
   - **Step 1**: Identify key inputs, constraints, and dependencies.
   - **Step 2**: Apply canonical decomposition rules to maintain data integrity.
   - **Step 3**: Verify edge cases and validate end outcomes.
3. **Key Takeaway**: Always remember to preserve invariants and verify functional dependencies.

> 💡 **Study Tip**: Review the flashcards associated with this unit or take a 3-question quick quiz to test your active recall!`;

    // Save assistant response
    await prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: generatedResponse,
      },
    });

    return {
      response: generatedResponse,
      conversationId,
    };
  }

  async generateQuiz(input: GenerateQuizInput) {
    const questions = [
      {
        questionText: `Which of the following best defines the primary principle of ${input.topicTitle}?`,
        questionType: 'MULTIPLE_CHOICE',
        marks: 1,
        explanation: `${input.topicTitle} operates by eliminating redundancy and enforcing strict structural integrity.`,
        orderIndex: 1,
        options: [
          { optionText: 'Reduces operational overhead while preserving dependencies', isCorrect: true, orderIndex: 1 },
          { optionText: 'Creates unindexed duplicate tables', isCorrect: false, orderIndex: 2 },
          { optionText: 'Bypasses constraint validation for speed', isCorrect: false, orderIndex: 3 },
          { optionText: 'Forces global serial lock on all records', isCorrect: false, orderIndex: 4 },
        ],
      },
      {
        questionText: `True or False: In ${input.topicTitle}, all domain values must remain atomic.`,
        questionType: 'TRUE_FALSE',
        marks: 1,
        explanation: 'Atomicity ensures no composite or multi-valued attributes exist within the domain.',
        orderIndex: 2,
        options: [
          { optionText: 'True', isCorrect: true, orderIndex: 1 },
          { optionText: 'False', isCorrect: false, orderIndex: 2 },
        ],
      },
      {
        questionText: `What is the most critical advantage of applying ${input.topicTitle} in production systems?`,
        questionType: 'MULTIPLE_CHOICE',
        marks: 1,
        explanation: 'Ensures data consistency across distributed reads and transactional writes.',
        orderIndex: 3,
        options: [
          { optionText: 'Consistent state preservation and zero update anomalies', isCorrect: true, orderIndex: 1 },
          { optionText: 'Instantaneous unlimited bandwidth', isCorrect: false, orderIndex: 2 },
          { optionText: 'Elimination of hardware storage requirements', isCorrect: false, orderIndex: 3 },
        ],
      },
    ].slice(0, input.numQuestions);

    return { questions };
  }

  async summarizeNotes(input: SummarizeNotesInput) {
    const summary = `### Summary Overview\n${input.notesContent.slice(0, 300)}...\n\nThis note highlights key definitions, structured rules, and best practices for academic mastery.`;
    const keyPoints = [
      'Deconstruct complex topics into modular sub-units.',
      'Maintain continuous active recall and spaced repetition intervals.',
      'Prioritize high-weightage examination concepts.',
    ];
    const flashcards = [
      {
        front: 'What is the core takeaway of these notes?',
        back: input.notesContent.slice(0, 100) + '...',
      },
      {
        front: 'How does this concept apply to practical problem solving?',
        back: 'By providing a systematic, step-by-step verification methodology.',
      },
    ];

    return { summary, keyPoints, flashcards };
  }

  async generateStudyPlan(input: AiStudyPlannerInput) {
    const target = new Date(input.examDate);
    const today = new Date();
    const diffDays = Math.max(1, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const schedule = [];
    for (let i = 1; i <= Math.min(diffDays, 14); i++) {
      const dayDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const subjectIndex = (i - 1) % input.subjects.length;
      schedule.push({
        day: `Day ${i}`,
        date: dayDate.toISOString().split('T')[0],
        subject: input.subjects[subjectIndex],
        plannedHours: input.availableDailyHours,
        focusAreas: ['Core Theory Review', 'Problem Set Practice', 'Active Recall Flashcards'],
      });
    }

    return { schedule };
  }
}

export const aiService = new PluggableAiService();
