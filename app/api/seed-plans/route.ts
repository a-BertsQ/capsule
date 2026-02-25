import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if plans already exist
    const existingPlans = await prisma.plan.findMany();

    if (existingPlans.length > 0) {
      return NextResponse.json({
        message: "Plans already exist",
        plans: existingPlans,
      });
    }

    // Create plans
    const plansToCreate = [
      {
        name: "Free",
        slug: "free",
        priceCents: 0,
        interval: "monthly",
        description: "Akses dasar untuk belajar farmasi",
        features: [
          "Akses konten dasar",
          "Audio notes terbatas (5 per bulan)",
          "Akses forum komunitas",
        ],
        isActive: true,
      },
      {
        name: "Premium",
        slug: "premium",
        priceCents: 49000,
        interval: "monthly",
        description: "Akses penuh ke semua fitur pembelajaran",
        features: [
          "Akses semua konten",
          "Audio notes unlimited",
          "Prioritas support",
          "Download materi PDF",
          "Akses ke webinar eksklusif",
        ],
        isActive: true,
      },
      {
        name: "Pro",
        slug: "pro",
        priceCents: 99000,
        interval: "monthly",
        description: "Untuk mahasiswa yang serius & ingin mentoring",
        features: [
          "Semua fitur Premium",
          "1-on-1 mentoring session (2x/bulan)",
          "Personalized study plan",
          "Akses ke lab virtual",
          "Career guidance",
          "Sertifikat kompetensi",
        ],
        isActive: true,
      },
    ];

    const created = await Promise.all(
      plansToCreate.map((plan) =>
        prisma.plan.create({
          data: {
            ...plan,
            features: JSON.stringify(plan.features),
          },
        })
      )
    );

    return NextResponse.json({
      message: "Plans created successfully",
      plans: created,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
