import Link from "next/link";

export const revalidate = 0; // Always revalidate
export const dynamic = "force-dynamic"; // Force dynamic rendering

const cards = [
  {
    title: "Belajar Interaktif",
    text: "Worksheet coret langsung, audio Spotify, dan video penjelasan materi.",
    href: "/learn",
  },
  {
    title: "Langganan",
    text: "Pilih paket Full Access, Selected, atau Free sesuai kebutuhan belajar.",
    href: "/plans",
  },
  {
    title: "Tutor Meeting",
    text: "Tukar coin emas untuk sesi private dan pilih jadwal tutor tersedia.",
    href: "/tutor",
  },
];

export default function DashboardPage() {
  return (
    <section className="app-grid page-section-fill">
      <header className="page-hero">
        <p className="badge badge-primary">Insight, packed for you.</p>
        <h1 className="section-title mt-4">Dashboard Capsule</h1>
        <p className="section-subtitle max-w-3xl">
          Platform adaptasi mahasiswa farmasi yang menggabungkan belajar visual,
          audio, dan mentoring dalam satu alur belajar.
        </p>
      </header>

      <div className="cards-grid">
        {cards.map((card) => (
          <article key={card.title} className="section-card h-full">
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="section-subtitle">{card.text}</p>
            <Link href={card.href} className="btn btn-secondary mt-4 w-full sm:w-auto">
              Buka halaman
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}