import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { env } from '../src/config/env.config';
import { userService } from '../src/modules/users/user.service';
import { UserRole } from '@prisma/client';
import { prisma } from '../src/config/database';

describe('StudyOS User Management Module Tests', () => {
  const app = createApp();

  const mockAdminToken = jwt.sign(
    { userId: 'admin-test-id', email: 'admin@test.com', role: UserRole.ADMIN },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  const mockStudentToken = jwt.sign(
    { userId: 'student-test-id', email: 'student@test.com', role: UserRole.STUDENT },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization & Access Control', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-admin users with 403 Forbidden', async () => {
      // Mock user verification in auth.middleware
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'student-test-id',
        email: 'student@test.com',
        role: UserRole.STUDENT,
        firstName: 'Student',
        lastName: 'User',
        isActive: true,
      } as any);

      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${mockStudentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users and /api/users', () => {
    it('should return paginated users for admin', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'admin-test-id',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      } as any);

      const mockUsers = [
        {
          id: 'user-1',
          email: 'alice@example.com',
          firstName: 'Alice',
          lastName: 'Smith',
          mobile: '1234567890',
          role: UserRole.STUDENT,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(userService, 'getUsers').mockResolvedValueOnce({
        users: mockUsers as any,
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/v1/users?page=1&limit=10')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toBeDefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.data[0].email).toBe('alice@example.com');
      // Verify passwordHash is never returned
      expect(res.body.data[0].passwordHash).toBeUndefined();
    });

    it('should support both /api/v1/users and /api/users endpoints', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'admin-test-id',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      } as any);

      jest.spyOn(userService, 'getUsers').mockResolvedValueOnce({
        users: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should validate required fields during user creation', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'admin-test-id',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      } as any);

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({
          email: 'invalid-email',
          password: 'short',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should successfully create a new user and return 201 without password', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'admin-test-id',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      } as any);

      const createdUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        mobile: '9876543210',
        role: UserRole.STUDENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'createUser').mockResolvedValueOnce(createdUser as any);

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@example.com',
          mobile: '9876543210',
          password: 'Password@123',
          role: UserRole.STUDENT,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });
  });

  describe('PATCH /api/v1/users/:id/status', () => {
    it('should validate boolean isActive and update user status', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'admin-test-id',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      } as any);

      const updatedUser = {
        id: 'user-1',
        email: 'user1@example.com',
        firstName: 'Alice',
        lastName: 'Smith',
        mobile: null,
        role: UserRole.STUDENT,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userService, 'updateUserStatus').mockResolvedValueOnce(updatedUser as any);

      const res = await request(app)
        .patch('/api/v1/users/user-1/status')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.isActive).toBe(false);
    });

    it('should reject non-boolean isActive with 422', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'admin-test-id',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      } as any);

      const res = await request(app)
        .patch('/api/v1/users/user-1/status')
        .set('Authorization', `Bearer ${mockAdminToken}`)
        .send({ isActive: 'not-a-boolean' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete a user and return success response', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce({
        id: 'admin-test-id',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      } as any);

      jest.spyOn(userService, 'deleteUser').mockResolvedValueOnce(undefined);

      const res = await request(app)
        .delete('/api/v1/users/target-user-id')
        .set('Authorization', `Bearer ${mockAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted');
    });
  });
});
