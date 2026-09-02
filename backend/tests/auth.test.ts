import request from 'supertest';
import { createApp } from '../src/app';
import { authService } from '../src/modules/auth/auth.service';
import { UserRole } from '@prisma/client';

describe('StudyOS Authentication Module Tests', () => {
  const app = createApp();

  describe('Validation & Auth Logic', () => {
    it('should reject registration when password does not meet complexity requirements', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid@example.com',
          password: 'simple', // Missing number and uppercase, <8 chars
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.STUDENT,
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Password123',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });

    it('should provide healthy status on /health endpoint', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('healthy');
    });
  });
});
