import { Request, Response } from 'express';
import { parentService } from './parent.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class ParentController {
  private getParentId(req: Request): string {
    const parentId = req.user?.profileId;
    if (!parentId) {
      throw new UnauthorizedError('Parent profile not found for active user');
    }
    return parentId;
  }

  async getChildren(req: Request, res: Response) {
    const parentId = this.getParentId(req);
    const children = await parentService.getChildren(parentId);
    return sendSuccess(res, 'Linked children retrieved successfully', { children });
  }

  async getChildOverview(req: Request, res: Response) {
    const parentId = this.getParentId(req);
    const overview = await parentService.getChildOverview(parentId, req.params.studentId);
    return sendSuccess(res, 'Child academic overview retrieved', overview);
  }

  async linkStudent(req: Request, res: Response) {
    const parentId = this.getParentId(req);
    const link = await parentService.linkStudent(parentId, req.body);
    return sendSuccess(res, 'Student linked successfully to parent profile', { link }, undefined, 201);
  }
}

export const parentController = new ParentController();
