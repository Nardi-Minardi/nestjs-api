import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('rahasia123', 10);

  await prisma.user.createMany({
    data: [
      {
        id: crypto.randomUUID(),
        email: 'admin@example.com',
        username: 'admin',
        role: Role.ADMIN,
        fullname: 'User Admin',
        password_hash: password,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
