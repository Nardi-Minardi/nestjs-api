import { z, ZodType } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z.object({
    email: z.string().email().max(255),
    username: z.string().min(1).max(50),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8),
  });
}
