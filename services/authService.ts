import { UserRepo } from '../repositories/userRepo';
import { hashPassword, comparePassword, signToken } from '../lib/auth';
import { SignUpData, SignInData } from '../types';

export class AuthService {
  static async signUp(data: SignUpData) {
    const existingUser = await UserRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await UserRepo.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const token = await signToken({ userId: user.id, email: user.email });
    return { user, token };
  }

  static async signIn(data: SignInData) {
    const user = await UserRepo.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = await signToken({ userId: user.id, email: user.email });
    return { user, token };
  }
}
