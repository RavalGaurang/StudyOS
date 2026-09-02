import { Request, Response } from 'express';
import { assignmentService } from './assignment.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class AssignmentController {
  private getStudentId(req: Request): string {
    const studentId = req.user?.profileId;
    if (!studentId) {
      throw new UnauthorizedError('Student profile not found for active user');
    }
    return studentId;
  }

  async getAssignments(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const { subjectId, status } = req.query;
    const assignments = await assignmentService.getStudentAssignments(
      studentId,
      subjectId as string,
      status as any
    );
    return sendSuccess(res, 'Assignments retrieved successfully', { assignments });
  }

  async getAssignmentById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const assignment = await assignmentService.getAssignmentById(req.params.id, studentId);
    return sendSuccess(res, 'Assignment retrieved successfully', { assignment });
  }

  async createAssignment(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const assignment = await assignmentService.createAssignment(studentId, req.body);
    return sendSuccess(res, 'Assignment created successfully', { assignment }, undefined, 201);
  }

  async updateAssignment(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const assignment = await assignmentService.updateAssignment(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Assignment updated successfully', { assignment });
  }

  async deleteAssignment(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    await assignmentService.deleteAssignment(req.params.id, studentId);
    return sendSuccess(res, 'Assignment deleted successfully');
  }
}

export const assignmentController = new AssignmentController();
