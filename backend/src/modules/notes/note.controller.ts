import { Request, Response } from 'express';
import { noteService } from './note.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class NoteController {
  private getStudentId(req: Request): string {
    const studentId = req.user?.profileId;
    if (!studentId) {
      throw new UnauthorizedError('Student profile not found for active user');
    }
    return studentId;
  }

  async getNotes(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const notes = await noteService.getStudentNotes(studentId, req.query as any);
    return sendSuccess(res, 'Notes retrieved successfully', { notes });
  }

  async getNoteById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const note = await noteService.getNoteById(req.params.id, studentId);
    return sendSuccess(res, 'Note retrieved successfully', { note });
  }

  async createNote(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const note = await noteService.createNote(studentId, req.body);
    return sendSuccess(res, 'Note created successfully', { note }, undefined, 201);
  }

  async updateNote(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const note = await noteService.updateNote(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Note updated successfully', { note });
  }

  async togglePin(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const note = await noteService.togglePin(req.params.id, studentId);
    return sendSuccess(res, 'Note pin status toggled', { note });
  }

  async deleteNote(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    await noteService.deleteNote(req.params.id, studentId);
    return sendSuccess(res, 'Note deleted successfully');
  }
}

export const noteController = new NoteController();
