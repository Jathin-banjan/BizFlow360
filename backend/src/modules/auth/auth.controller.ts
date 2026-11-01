import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { recordAudit } from '../../middleware/auditLogger.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);

      // Set secure HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Audit log successful login
      await recordAudit(req, 'USER_LOGIN', 'User', user._id.toString(), {
        email: user.email,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            department: user.department,
            lastLoginAt: user.lastLoginAt,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async bootstrap(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = await AuthService.bootstrapAdmin(req.body);
      return res.status(201).json({
        success: true,
        message: 'Administrator account provisioned successfully',
        data: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
