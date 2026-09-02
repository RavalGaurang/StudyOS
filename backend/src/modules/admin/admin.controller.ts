import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { sendSuccess } from '../../common/utils/responseFormatter';

export class AdminController {
  async getUsers(req: Request, res: Response) {
    const result = await adminService.getUsers(req.query as any);
    return sendSuccess(res, 'Users directory retrieved', result.users, result.meta);
  }

  async toggleStatus(req: Request, res: Response) {
    const user = await adminService.toggleUserStatus(req.params.id);
    return sendSuccess(res, `User status updated to ${user.isActive ? 'Active' : 'Inactive'}`, { user });
  }
}

export const adminController = new AdminController();
