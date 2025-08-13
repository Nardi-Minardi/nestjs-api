import { PrismaClient, Role } from '@prisma/client';
import { createUserFactory } from './factories/user.factory';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const users: Awaited<ReturnType<typeof createUserFactory>>[] = [];

  // 1 admin
  users.push(
    await createUserFactory({
      email: 'admin@example.com',
      username: 'admin',
      role: Role.ADMIN,
      fullname: 'User Admin',
    }),
  );

  // 499 user
  for (let i = 0; i < 499; i++) {
    users.push(await createUserFactory());
  }

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
