import { Request, Response } from 'express';
import { studyService } from './study.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class StudyController {
  private getStudentId(req: Request): string {
    const studentId = req.user?.profileId;
    if (!studentId) {
      throw new UnauthorizedError('Student profile not found for active user');
    }
    return studentId;
  }

  // Sessions
  async getSessions(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const result = await studyService.getStudySessions(studentId, limit);
    return sendSuccess(res, 'Study sessions retrieved successfully', result);
  }

  async getSessionById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const session = await studyService.getSessionById(req.params.id, studentId);
    return sendSuccess(res, 'Study session retrieved successfully', { session });
  }

  async logSession(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const session = await studyService.logStudySession(studentId, req.body);
    return sendSuccess(res, 'Study session logged successfully', { session }, undefined, 201);
  }

  // Study Plans
  async getPlans(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const plans = await studyService.getStudyPlans(studentId);
    return sendSuccess(res, 'Study plans retrieved successfully', { plans });
  }

  async getPlanById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const plan = await studyService.getPlanById(req.params.id, studentId);
    return sendSuccess(res, 'Study plan retrieved successfully', { plan });
  }

  async createPlan(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const plan = await studyService.createStudyPlan(studentId, req.body);
    return sendSuccess(res, 'Study plan created successfully', { plan }, undefined, 201);
  }

  async updatePlanItem(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const item = await studyService.updatePlanItem(req.params.itemId, studentId, req.body);
    return sendSuccess(res, 'Plan item updated successfully', { item });
  }

  // Goals
  async getGoals(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const goals = await studyService.getGoals(studentId);
    return sendSuccess(res, 'Goals retrieved successfully', { goals });
  }

  async getGoalById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const goal = await studyService.getGoalById(req.params.id, studentId);
    return sendSuccess(res, 'Goal retrieved successfully', { goal });
  }

  async createGoal(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const goal = await studyService.createGoal(studentId, req.body);
    return sendSuccess(res, 'Goal created successfully', { goal }, undefined, 201);
  }

  async updateGoal(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const goal = await studyService.updateGoal(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Goal updated successfully', { goal });
  }

  async deleteGoal(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    await studyService.deleteGoal(req.params.id, studentId);
    return sendSuccess(res, 'Goal deleted successfully');
  }
}

export const studyController = new StudyController();
