import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
  await prisma.user.upsert({ where:{email:'admin@example.com'}, update:{}, create:{email:'admin@example.com',name:'Administrator',passwordHash,role:Role.SUPER_ADMIN} });
}
main().finally(() => prisma.$disconnect());
