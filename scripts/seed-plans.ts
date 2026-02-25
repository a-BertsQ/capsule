import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding plans...");

  const plans = [
    {
      name: "Free",
      slug: "free",
      priceCents: 0,
      interval: "monthly",
      description: "Akses dasar untuk belajar farmasi",
      features: JSON.stringify([
        "Akses konten dasar",
        "Audio notes terbatas (5 per bulan)",
        "Akses forum komunitas",
      ]),
      isActive: true,
    },
    {
      name: "Premium",
      slug: "premium",
      priceCents: 49000,
      interval: "monthly",
      description: "Akses penuh ke semua fitur pembelajaran",
      features: JSON.stringify([
        "Akses semua konten",
        "Audio notes unlimited",
        "Prioritas support",
        "Download materi PDF",
        "Akses ke webinar eksklusif",
      ]),
      isActive: true,
    },
    {
      name: "Pro",
      slug: "pro",
      priceCents: 99000,
      interval: "monthly",
      description: "Untuk mahasiswa yang serius & ingin mentoring",
      features: JSON.stringify([
        "Semua fitur Premium",
        "1-on-1 mentoring session (2x/bulan)",
        "Personalized study plan",
        "Akses ke lab virtual",
        "Career guidance",
        "Sertifikat kompetensi",
      ]),
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }

  console.log("✅ Plans seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding plans:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
