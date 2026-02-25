require("dotenv").config({ path: ".env" });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🌱 Starting to seed plans...");
    console.log("Database URL:", process.env.DATABASE_URL ? "✓ Set" : "✗ Not set");

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

    let createdCount = 0;
    let skippedCount = 0;

    for (const plan of plans) {
      const existing = await prisma.plan.findUnique({
        where: { slug: plan.slug },
      });

      if (existing) {
        console.log(`  ✓ Paket "${plan.name}" sudah ada (ID: ${existing.id})`);
        skippedCount++;
      } else {
        const created = await prisma.plan.create({ data: plan });
        console.log(`  ✓ Paket "${created.name}" berhasil dibuat (ID: ${created.id})`);
        createdCount++;
      }
    }

    console.log(`\n✅ Seeding selesai! ${createdCount} dibuat, ${skippedCount} sudah ada`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
