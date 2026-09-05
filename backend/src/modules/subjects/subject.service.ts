import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import {
  CreateSubjectInput,
  UpdateSubjectInput,
  CreateUnitInput,
  UpdateUnitInput,
  CreateTopicInput,
  UpdateTopicInput,
} from './subject.schema';

export class SubjectService {
  async getStudentSubjects(studentId: string, includeArchived: boolean = false) {
    const subjects = await prisma.subject.findMany({
      where: {
        studentId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      include: {
        units: {
          include: {
            topics: true,
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            tasks: { where: { status: { not: 'COMPLETED' } } },
            assignments: { where: { status: { not: 'GRADED' } } },
            notes: true,
            studySessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate dynamic syllabus progress
    return subjects.map((sub) => {
      let totalTopics = 0;
      let completedTopics = 0;

      for (const unit of sub.units) {
        for (const topic of unit.topics) {
          totalTopics += 1;
          if (topic.isCompleted) completedTopics += 1;
        }
      }

      const syllabusProgress =
        totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

      return {
        ...sub,
        totalUnits: sub.units.length,
        totalTopics,
        completedTopics,
        syllabusProgress,
      };
    });
  }

  async getSubjectById(subjectId: string, studentId: string) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, studentId },
      include: {
        units: {
          include: {
            topics: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        assignments: {
          orderBy: { dueDate: 'asc' },
        },
        exams: {
          orderBy: { examDate: 'asc' },
        },
        _count: {
          select: {
            tasks: true,
            notes: true,
            studySessions: true,
            attendance: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundError('Subject not found or access denied');
    }

    let totalTopics = 0;
    let completedTopics = 0;

    for (const unit of subject.units) {
      for (const topic of unit.topics) {
        totalTopics += 1;
        if (topic.isCompleted) completedTopics += 1;
      }
    }

    const syllabusProgress =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      ...subject,
      totalUnits: subject.units.length,
      totalTopics,
      completedTopics,
      syllabusProgress,
    };
  }

  async createSubject(studentId: string, input: CreateSubjectInput) {
    return prisma.subject.create({
      data: {
        studentId,
        ...input,
      },
      include: {
        units: true,
      },
    });
  }

  async updateSubject(subjectId: string, studentId: string, input: UpdateSubjectInput) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, studentId },
    });

    if (!subject) {
      throw new NotFoundError('Subject not found or access denied');
    }

    return prisma.subject.update({
      where: { id: subjectId },
      data: input,
    });
  }

  async deleteSubject(subjectId: string, studentId: string) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, studentId },
    });

    if (!subject) {
      throw new NotFoundError('Subject not found or access denied');
    }

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return { success: true };
  }

  // Unit Operations
  async createUnit(subjectId: string, studentId: string, input: CreateUnitInput) {
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, studentId },
    });

    if (!subject) {
      throw new NotFoundError('Subject not found or access denied');
    }

    return prisma.unit.create({
      data: {
        subjectId,
        ...input,
      },
      include: {
        topics: true,
      },
    });
  }

  async updateUnit(unitId: string, studentId: string, input: UpdateUnitInput) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, subject: { studentId } },
    });

    if (!unit) {
      throw new NotFoundError('Unit not found or access denied');
    }

    return prisma.unit.update({
      where: { id: unitId },
      data: input,
    });
  }

  async deleteUnit(unitId: string, studentId: string) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, subject: { studentId } },
    });

    if (!unit) {
      throw new NotFoundError('Unit not found or access denied');
    }

    await prisma.unit.delete({
      where: { id: unitId },
    });

    return { success: true };
  }

  // Topic Operations
  async createTopic(unitId: string, studentId: string, input: CreateTopicInput) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, subject: { studentId } },
    });

    if (!unit) {
      throw new NotFoundError('Unit not found or access denied');
    }

    return prisma.topic.create({
      data: {
        unitId,
        ...input,
      },
    });
  }

  async updateTopic(topicId: string, studentId: string, input: UpdateTopicInput) {
    const topic = await prisma.topic.findFirst({
      where: { id: topicId, unit: { subject: { studentId } } },
    });

    if (!topic) {
      throw new NotFoundError('Topic not found or access denied');
    }

    const dataToUpdate: any = { ...input };
    if (input.isCompleted !== undefined) {
      dataToUpdate.completedAt = input.isCompleted ? new Date() : null;
    }

    return prisma.topic.update({
      where: { id: topicId },
      data: dataToUpdate,
    });
  }

  async deleteTopic(topicId: string, studentId: string) {
    const topic = await prisma.topic.findFirst({
      where: { id: topicId, unit: { subject: { studentId } } },
    });

    if (!topic) {
      throw new NotFoundError('Topic not found or access denied');
    }

    await prisma.topic.delete({
      where: { id: topicId },
    });

    return { success: true };
  }

  async getUnitById(unitId: string, studentId: string) {
    const unit = await prisma.unit.findFirst({
      where: { id: unitId, subject: { studentId } },
      include: {
        topics: { orderBy: { orderIndex: 'asc' } },
        subject: { select: { id: true, name: true, code: true, color: true } },
      },
    });

    if (!unit) {
      throw new NotFoundError('Unit not found or access denied');
    }

    return unit;
  }

  async getTopicById(topicId: string, studentId: string) {
    const topic = await prisma.topic.findFirst({
      where: { id: topicId, unit: { subject: { studentId } } },
      include: {
        unit: {
          select: {
            id: true,
            title: true,
            subject: { select: { id: true, name: true, code: true, color: true } },
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundError('Topic not found or access denied');
    }

    return topic;
  }
}

export const subjectService = new SubjectService();
