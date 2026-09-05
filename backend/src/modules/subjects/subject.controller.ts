import { Request, Response } from 'express';
import { subjectService } from './subject.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class SubjectController {
  private getStudentId(req: Request): string {
    const studentId = req.user?.profileId;
    if (!studentId) {
      throw new UnauthorizedError('Student profile not found for active user');
    }
    return studentId;
  }

  async getSubjects(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const includeArchived = req.query.includeArchived === 'true';
    const subjects = await subjectService.getStudentSubjects(studentId, includeArchived);
    return sendSuccess(res, 'Subjects retrieved successfully', { subjects });
  }

  async getSubjectById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const subject = await subjectService.getSubjectById(req.params.id, studentId);
    return sendSuccess(res, 'Subject details retrieved successfully', { subject });
  }

  async createSubject(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const subject = await subjectService.createSubject(studentId, req.body);
    return sendSuccess(res, 'Subject created successfully', { subject }, undefined, 201);
  }

  async updateSubject(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const subject = await subjectService.updateSubject(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Subject updated successfully', { subject });
  }

  async deleteSubject(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    await subjectService.deleteSubject(req.params.id, studentId);
    return sendSuccess(res, 'Subject deleted successfully');
  }

  // Units
  async createUnit(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const unit = await subjectService.createUnit(req.params.subjectId, studentId, req.body);
    return sendSuccess(res, 'Unit created successfully', { unit }, undefined, 201);
  }

  async updateUnit(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const unit = await subjectService.updateUnit(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Unit updated successfully', { unit });
  }

  async deleteUnit(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    await subjectService.deleteUnit(req.params.id, studentId);
    return sendSuccess(res, 'Unit deleted successfully');
  }

  async getUnitById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const unit = await subjectService.getUnitById(req.params.id, studentId);
    return sendSuccess(res, 'Unit retrieved successfully', { unit });
  }

  // Topics
  async createTopic(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const topic = await subjectService.createTopic(req.params.unitId, studentId, req.body);
    return sendSuccess(res, 'Topic created successfully', { topic }, undefined, 201);
  }

  async updateTopic(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const topic = await subjectService.updateTopic(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Topic updated successfully', { topic });
  }

  async deleteTopic(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    await subjectService.deleteTopic(req.params.id, studentId);
    return sendSuccess(res, 'Topic deleted successfully');
  }

  async getTopicById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const topic = await subjectService.getTopicById(req.params.id, studentId);
    return sendSuccess(res, 'Topic retrieved successfully', { topic });
  }
}

export const subjectController = new SubjectController();
