import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';
import { CreateTimetableEventInput, UpdateTimetableEventInput } from './timetable.schema';

export class TimetableService {
  async getStudentTimetable(studentId: string, dayOfWeek?: number) {
    const where: any = { studentId };
    if (dayOfWeek !== undefined) {
      where.dayOfWeek = dayOfWeek;
    }

    return prisma.timetableEvent.findMany({
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
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async createEvent(studentId: string, input: CreateTimetableEventInput) {
    return prisma.timetableEvent.create({
      data: {
        studentId,
        subjectId: input.subjectId || null,
        title: input.title,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        room: input.room,
        location: input.location,
        color: input.color,
        recurrence: input.recurrence,
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

  async updateEvent(eventId: string, studentId: string, input: UpdateTimetableEventInput) {
    const event = await prisma.timetableEvent.findFirst({
      where: { id: eventId, studentId },
    });

    if (!event) {
      throw new NotFoundError('Timetable event not found or access denied');
    }

    const data: any = {
      ...(input.title && { title: input.title }),
      ...(input.dayOfWeek !== undefined && { dayOfWeek: input.dayOfWeek }),
      ...(input.startTime && { startTime: input.startTime }),
      ...(input.endTime && { endTime: input.endTime }),
      ...(input.room !== undefined && { room: input.room }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.color && { color: input.color }),
      ...(input.recurrence && { recurrence: input.recurrence }),
      ...(input.subjectId !== undefined && {
        subject: input.subjectId ? { connect: { id: input.subjectId } } : { disconnect: true },
      }),
    };

    return prisma.timetableEvent.update({
      where: { id: eventId },
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

  async deleteEvent(eventId: string, studentId: string) {
    const event = await prisma.timetableEvent.findFirst({
      where: { id: eventId, studentId },
    });

    if (!event) {
      throw new NotFoundError('Timetable event not found or access denied');
    }

    await prisma.timetableEvent.delete({
      where: { id: eventId },
    });

    return { success: true };
  }
}

export const timetableService = new TimetableService();
