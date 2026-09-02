import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';
import { CreateNoteInput, UpdateNoteInput, NoteQueryInput } from './note.schema';
import { Prisma } from '@prisma/client';

export class NoteService {
  async getStudentNotes(studentId: string, query: NoteQueryInput) {
    const where: Prisma.NoteWhereInput = {
      studentId,
      isArchived: false,
    };

    if (query.subjectId) {
      where.subjectId = query.subjectId;
    }

    if (query.isPinned !== undefined) {
      where.isPinned = query.isPinned === 'true';
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return prisma.note.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
        unit: {
          select: {
            id: true,
            title: true,
          },
        },
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async getNoteById(noteId: string, studentId: string) {
    const note = await prisma.note.findFirst({
      where: { id: noteId, studentId },
      include: {
        subject: true,
        unit: true,
        topic: true,
      },
    });

    if (!note) {
      throw new NotFoundError('Note not found or access denied');
    }

    return note;
  }

  async createNote(studentId: string, input: CreateNoteInput) {
    return prisma.note.create({
      data: {
        studentId,
        title: input.title,
        content: input.content,
        subjectId: input.subjectId || null,
        unitId: input.unitId || null,
        topicId: input.topicId || null,
        isPinned: input.isPinned,
        tags: input.tags || [],
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
      },
    });
  }

  async updateNote(noteId: string, studentId: string, input: UpdateNoteInput) {
    const note = await prisma.note.findFirst({
      where: { id: noteId, studentId },
    });

    if (!note) {
      throw new NotFoundError('Note not found or access denied');
    }

    const data: Prisma.NoteUpdateInput = {
      ...(input.title && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.isPinned !== undefined && { isPinned: input.isPinned }),
      ...(input.isArchived !== undefined && { isArchived: input.isArchived }),
      ...(input.tags && { tags: input.tags }),
      ...(input.subjectId !== undefined && {
        subject: input.subjectId ? { connect: { id: input.subjectId } } : { disconnect: true },
      }),
      ...(input.unitId !== undefined && {
        unit: input.unitId ? { connect: { id: input.unitId } } : { disconnect: true },
      }),
      ...(input.topicId !== undefined && {
        topic: input.topicId ? { connect: { id: input.topicId } } : { disconnect: true },
      }),
    };

    return prisma.note.update({
      where: { id: noteId },
      data,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
      },
    });
  }

  async togglePin(noteId: string, studentId: string) {
    const note = await prisma.note.findFirst({
      where: { id: noteId, studentId },
    });

    if (!note) {
      throw new NotFoundError('Note not found or access denied');
    }

    return prisma.note.update({
      where: { id: noteId },
      data: { isPinned: !note.isPinned },
    });
  }

  async deleteNote(noteId: string, studentId: string) {
    const note = await prisma.note.findFirst({
      where: { id: noteId, studentId },
    });

    if (!note) {
      throw new NotFoundError('Note not found or access denied');
    }

    await prisma.note.delete({
      where: { id: noteId },
    });

    return { success: true };
  }
}

export const noteService = new NoteService();
