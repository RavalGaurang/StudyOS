import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { env } from '../../config/env.config';

const REFRESH_COOKIE_NAME = 'studyos_refresh';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    setRefreshCookie(res, result.rawRefreshToken);

    return sendSuccess(
      res,
      'Registration successful',
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      undefined,
      201
    );
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result.rawRefreshToken);

    return sendSuccess(res, 'Login successful', {
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  async refresh(req: Request, res: Response) {
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
    const result = await authService.refreshTokens(rawRefreshToken);
    setRefreshCookie(res, result.rawRefreshToken);

    return sendSuccess(res, 'Tokens refreshed successfully', {
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  async logout(req: Request, res: Response) {
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
    await authService.logout(rawRefreshToken);
    clearRefreshCookie(res);

    return sendSuccess(res, 'Logged out successfully');
  }

  async me(req: Request, res: Response) {
    const user = await authService.getCurrentUser(req.user!.id);
    return sendSuccess(res, 'User profile fetched successfully', { user });
  }

  async forgotPassword(req: Request, res: Response) {
    // Return generic success to avoid account enumeration
    return sendSuccess(
      res,
      'If an account exists with this email, password reset instructions have been sent.'
    );
  }

  async resetPassword(req: Request, res: Response) {
    return sendSuccess(res, 'Password has been reset successfully. Please log in.');
  }
}

export const authController = new AuthController();
