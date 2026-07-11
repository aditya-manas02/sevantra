const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { email: 'manasaditya7907@gmail.com' },
    data: { role: 'PLATFORM_ADMIN' }
  });
  console.log('User upgraded to PLATFORM_ADMIN');
}
main();
