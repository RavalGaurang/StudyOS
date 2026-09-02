import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from './task.schema';
import { Prisma, TaskStatus } from '@prisma/client';

export class TaskService {
  async getTasks(studentId: string, query: TaskQueryInput) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      studentId,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.subjectId) {
      where.subjectId = query.subjectId;
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (query.dueFilter === 'today') {
      where.dueDate = {
        gte: startOfToday,
        lte: endOfToday,
      };
    } else if (query.dueFilter === 'overdue') {
      where.dueDate = {
        lt: startOfToday,
      };
      where.status = { not: TaskStatus.COMPLETED };
    } else if (query.dueFilter === 'upcoming') {
      where.dueDate = {
        gt: endOfToday,
      };
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (query.sortBy === 'dueDate') {
      orderBy.dueDate = query.sortOrder;
    } else if (query.sortBy === 'priority') {
      orderBy.priority = query.sortOrder;
    } else if (query.sortBy === 'title') {
      orderBy.title = query.sortOrder;
    } else {
      orderBy.createdAt = query.sortOrder;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tasks,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getTaskById(taskId: string, studentId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, studentId },
      include: {
        subject: true,
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found or access denied');
    }

    return task;
  }

  async createTask(studentId: string, input: CreateTaskInput) {
    return prisma.task.create({
      data: {
        studentId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        priority: input.priority,
        status: input.status,
        subjectId: input.subjectId || null,
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

  async updateTask(taskId: string, studentId: string, input: UpdateTaskInput) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, studentId },
    });

    if (!task) {
      throw new NotFoundError('Task not found or access denied');
    }

    const dataToUpdate: Prisma.TaskUpdateInput = {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.priority && { priority: input.priority }),
      ...(input.status && { status: input.status }),
      ...(input.subjectId !== undefined && {
        subject: input.subjectId ? { connect: { id: input.subjectId } } : { disconnect: true },
      }),
    };

    if (input.dueDate !== undefined) {
      dataToUpdate.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    if (input.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      dataToUpdate.completedAt = new Date();
    } else if (input.status && input.status !== TaskStatus.COMPLETED) {
      dataToUpdate.completedAt = null;
    }

    return prisma.task.update({
      where: { id: taskId },
      data: dataToUpdate,
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

  async toggleTaskStatus(taskId: string, studentId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, studentId },
    });

    if (!task) {
      throw new NotFoundError('Task not found or access denied');
    }

    const newStatus =
      task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED;
    const completedAt = newStatus === TaskStatus.COMPLETED ? new Date() : null;

    return prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        completedAt,
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

  async deleteTask(taskId: string, studentId: string) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, studentId },
    });

    if (!task) {
      throw new NotFoundError('Task not found or access denied');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return { success: true };
  }
}

export const taskService = new TaskService();
