import { Request, Response } from 'express';
import { timetableService } from './timetable.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class TimetableController {
  private getStudentId(req: Request): string {
    const studentId = req.user?.profileId;
    if (!studentId) {
      throw new UnauthorizedError('Student profile not found for active user');
    }
    return studentId;
  }

  async getTimetable(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const dayOfWeek =
      req.query.dayOfWeek !== undefined ? parseInt(req.query.dayOfWeek as string, 10) : undefined;
    const events = await timetableService.getStudentTimetable(studentId, dayOfWeek);
    return sendSuccess(res, 'Timetable events retrieved successfully', { events });
  }

  async createEvent(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const event = await timetableService.createEvent(studentId, req.body);
    return sendSuccess(res, 'Timetable event created successfully', { event }, undefined, 201);
  }

  async updateEvent(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const event = await timetableService.updateEvent(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Timetable event updated successfully', { event });
  }

  async deleteEvent(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    await timetableService.deleteEvent(req.params.id, studentId);
    return sendSuccess(res, 'Timetable event deleted successfully');
  }
}

export const timetableController = new TimetableController();
