import { authorize } from '../src/middleware/rbac.middleware';
import { UserRole } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../src/common/errors/AppError';

describe('RBAC Authorization Middleware Tests', () => {
  it('should throw UnauthorizedError if user is not authenticated', () => {
    const req: any = {};
    const res: any = {};
    const next = jest.fn();

    const guard = authorize(UserRole.STUDENT);
    guard(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should throw ForbiddenError if user role is not permitted', () => {
    const req: any = {
      user: {
        id: '123',
        email: 'parent@example.com',
        role: UserRole.PARENT,
      },
    };
    const res: any = {};
    const next = jest.fn();

    const guard = authorize(UserRole.ADMIN);
    guard(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('should call next() without error if user role matches permitted roles', () => {
    const req: any = {
      user: {
        id: '123',
        email: 'student@example.com',
        role: UserRole.STUDENT,
      },
    };
    const res: any = {};
    const next = jest.fn();

    const guard = authorize(UserRole.STUDENT, UserRole.PARENT);
    guard(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
