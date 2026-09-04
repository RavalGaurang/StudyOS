import { Request, Response } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../common/utils/responseFormatter';

export class UserController {
  async getUsers(req: Request, res: Response) {
    const result = await userService.getUsers(req.query as any);
    return sendSuccess(res, 'Users fetched successfully', result.users, result.meta);
  }

  async getUserById(req: Request, res: Response) {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, 'User fetched successfully', { user });
  }

  async createUser(req: Request, res: Response) {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, 'User created successfully', { user }, undefined, 201);
  }

  async updateUser(req: Request, res: Response) {
    const user = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, 'User updated successfully', { user });
  }

  async deleteUser(req: Request, res: Response) {
    await userService.deleteUser(req.params.id, req.user?.id);
    return sendSuccess(res, 'User deleted successfully');
  }

  async updateStatus(req: Request, res: Response) {
    const user = await userService.updateUserStatus(req.params.id, req.body.isActive);
    return sendSuccess(res, 'User status updated successfully', { user });
  }
}

export const userController = new UserController();
