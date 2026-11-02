import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../users/user.model.js';
import { config } from '../../config/env.js';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../common/errors.js';
import { AuthUserPayload } from '../../common/types.js';

export class AuthService {
  static generateToken(user: IUser): string {
    const payload: AuthUserPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }

  static async login(email: string, password: string):Promise<{ user: IUser; token: string }> {
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated. Please contact administrator.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = this.generateToken(user);
    return { user, token };
  }

  static async bootstrapAdmin(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<IUser> {
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      throw new ConflictError('Bootstrap is only available when no users exist in the system.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const admin = await User.create({
      username: userData.username.toLowerCase().trim(),
      email: userData.email.toLowerCase().trim(),
      passwordHash,
      role: 'ADMIN',
      fullName: userData.fullName,
      department: 'Executive Administration',
      isActive: true,
    });

    return admin;
  }
}
