const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const creatorId = 'f41fedfb-b2ae-48f3-a923-2a45789d554a';
  const creator = await prisma.user.findUnique({ where: { id: creatorId } });
  console.log('Creator:', creator);
}
main();
