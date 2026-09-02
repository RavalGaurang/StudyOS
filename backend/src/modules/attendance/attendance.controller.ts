import { Request, Response } from 'express';
import { attendanceService } from './attendance.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class AttendanceController {
  private getStudentId(req: Request): string {
    const studentId = req.user?.profileId;
    if (!studentId) {
      throw new UnauthorizedError('Student profile not found for active user');
    }
    return studentId;
  }

  async getAttendance(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const { subjectId, startDate, endDate } = req.query;
    const result = await attendanceService.getStudentAttendance(
      studentId,
      subjectId as string,
      startDate as string,
      endDate as string
    );
    return sendSuccess(res, 'Attendance data retrieved successfully', result);
  }

  async recordAttendance(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const record = await attendanceService.recordAttendance(studentId, req.body);
    return sendSuccess(res, 'Attendance logged successfully', { record }, undefined, 201);
  }

  async updateAttendance(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const record = await attendanceService.updateAttendance(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Attendance updated successfully', { record });
  }

  async deleteAttendance(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    await attendanceService.deleteAttendance(req.params.id, studentId);
    return sendSuccess(res, 'Attendance record deleted successfully');
  }
}

export const attendanceController = new AttendanceController();
