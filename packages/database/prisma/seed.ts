import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Tree Plantation', description: 'Plant trees in your neighborhood.' },
    { name: 'Cleanup Drive', description: 'Help clean up local parks and streets.' },
    { name: 'Blood Donation', description: 'Donate blood to save lives.' },
    { name: 'Education Drive', description: 'Teach and mentor students.' },
    { name: 'Animal Welfare', description: 'Help local animal shelters.' },
    { name: 'Elderly Care', description: 'Spend time and assist the elderly in your community.' },
    { name: 'Food Distribution', description: 'Cook, pack, and distribute meals to the homeless.' },
    { name: 'Disaster Relief', description: 'Assist in organizing relief materials for disaster-struck areas.' },
    { name: 'Community Gardening', description: 'Help build and maintain local community gardens.' },
    { name: 'Youth Mentorship', description: 'Mentor at-risk youth and help them with life skills.' },
    { name: 'Environmental Conservation', description: 'Participate in large-scale ecological conservation efforts.' },
    { name: 'Tech Literacy', description: 'Teach basic computer and internet skills to marginalized groups.' },
    { name: 'Mental Health Support', description: 'Volunteer for community mental health awareness programs.' }
  ];

  for (const category of categories) {
    await prisma.eventCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  const badges = [
    { name: 'First Timer', description: 'Attended your first event', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2874/2874745.png' },
    { name: 'Regular', description: 'Attended 5 events', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2874/2874780.png' },
    { name: 'Community Leader', description: 'Attended 10 events', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2874/2874805.png' },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
  }

  console.log('Seeded categories and badges successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());
