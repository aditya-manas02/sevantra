import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.event.findFirst().then(e => console.log('EVENT_ID:', e?.id)).finally(() => prisma.$disconnect());
