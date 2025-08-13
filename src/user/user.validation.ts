import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly UPDATE_USER: ZodType = z.object({
    userId: z.string(),
    email: z.string().email().max(255).optional(),
    username: z.string().min(1).max(50).optional(),
    role: z.string().min(1).max(5).optional(),
    fullname: z.string().min(1).max(100).optional(),
    password: z.string().min(8).optional(),
    confirmPassword: z.string().min(8).optional(),
    avatar: z.string().optional(),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
  });

  static readonly GET_USER_PAGINATION: ZodType = z.object({
    search: z.string().optional(),
    page: z.preprocess(
      (val) => (typeof val === 'string' ? Number(val) : val),
      z.number(),
    ),
    limit: z.preprocess(
      (val) => (typeof val === 'string' ? Number(val) : val),
      z.number(),
    ),
    orderBy: z.string().optional(),
    orderDirection: z.enum(['asc', 'desc']).optional(),
    filters: z.preprocess((val) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return undefined;
        }
      }
      return val;
    }, z.array(
      z.object({
        field: z.string().min(1),
        value: z.string().min(1),
      }),
    ).optional()),
  });

  static readonly USER_ID: ZodType = z.object({
    userId: z.string(),
  });

  static readonly AVATAR: ZodType = z.object({
    userId: z.string(),
  });
}
