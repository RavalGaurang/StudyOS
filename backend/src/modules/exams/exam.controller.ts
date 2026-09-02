import { Request, Response } from 'express';
import { examService } from './exam.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class ExamController {
  private getStudentId(req: Request): string {
    const studentId = req.user?.profileId;
    if (!studentId) {
      throw new UnauthorizedError('Student profile not found for active user');
    }
    return studentId;
  }

  async getExams(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const { subjectId, upcomingOnly } = req.query;
    const exams = await examService.getStudentExams(
      studentId,
      subjectId as string,
      upcomingOnly === 'true'
    );
    return sendSuccess(res, 'Exams retrieved successfully', { exams });
  }

  async getExamById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const exam = await examService.getExamById(req.params.id, studentId);
    return sendSuccess(res, 'Exam retrieved successfully', { exam });
  }

  async createExam(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const exam = await examService.createExam(studentId, req.body);
    return sendSuccess(res, 'Exam scheduled successfully', { exam }, undefined, 201);
  }

  async updateExam(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const exam = await examService.updateExam(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Exam updated successfully', { exam });
  }

  async deleteExam(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    await examService.deleteExam(req.params.id, studentId);
    return sendSuccess(res, 'Exam deleted successfully');
  }
}

export const examController = new ExamController();
