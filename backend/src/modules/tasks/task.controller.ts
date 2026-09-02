import { Request, Response } from 'express';
import { taskService } from './task.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class TaskController {
  private getStudentId(req: Request): string {
    const studentId = req.user?.profileId;
    if (!studentId) {
      throw new UnauthorizedError('Student profile not found for active user');
    }
    return studentId;
  }

  async getTasks(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const result = await taskService.getTasks(studentId, req.query as any);
    return sendSuccess(res, 'Tasks retrieved successfully', result.tasks, result.meta);
  }

  async getTaskById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const task = await taskService.getTaskById(req.params.id, studentId);
    return sendSuccess(res, 'Task retrieved successfully', { task });
  }

  async createTask(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const task = await taskService.createTask(studentId, req.body);
    return sendSuccess(res, 'Task created successfully', { task }, undefined, 201);
  }

  async updateTask(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const task = await taskService.updateTask(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Task updated successfully', { task });
  }

  async toggleStatus(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const task = await taskService.toggleTaskStatus(req.params.id, studentId);
    return sendSuccess(res, 'Task status updated successfully', { task });
  }

  async deleteTask(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    await taskService.deleteTask(req.params.id, studentId);
    return sendSuccess(res, 'Task deleted successfully');
  }
}

export const taskController = new TaskController();
