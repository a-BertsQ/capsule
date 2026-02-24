require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  const email = (process.env.CAPSULE_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const raw = process.env.CAPSULE_ADMIN_PASSWORD || 'Capsule123!';
  const hash = await bcrypt.hash(raw, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash, name: 'Admin' },
  });

  console.log('Admin seeded:', user.email);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
