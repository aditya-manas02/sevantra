const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminId = 'a78ee09c-6daf-4109-bfc6-d02a71071bd4';
  const orgId = 'd7b62477-8765-4ec3-8a09-92998712fdc4';
  
  const orgMember = await prisma.orgMember.findUnique({
    where: { userId_organizationId: { userId: adminId, organizationId: orgId } }
  });
  console.log('orgMember:', orgMember);

  const allUserOrgs = await prisma.orgMember.findMany({ where: { userId: adminId } });
  console.log('allUserOrgs:', allUserOrgs);

  const event = await prisma.event.findUnique({ where: { id: '6a2ee372-2030-4b74-a05d-93e8f9e73ae3' } });
  console.log('event:', event);
}
main();
