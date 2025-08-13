import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import * as crypto from 'crypto';

export async function createUserFactory(
  overrides: Partial<{
    id: string;
    email: string;
    username: string;
    role: Role;
    fullname: string;
    password: string;
  }> = {},
) {
  const defaultPassword = 'rahasia123';
  const hashedPassword = await bcrypt.hash(overrides.password || defaultPassword, 10);

  return {
    id: overrides.id || crypto.randomUUID(),
    email: overrides.email || faker.internet.email(),
    username: overrides.username || faker.internet.username(),
    role: overrides.role || Role.USER,
    fullname: overrides.fullname || faker.person.fullName(),
    password_hash: hashedPassword,
  };
}
