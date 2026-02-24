export const revalidate = 0;
export const dynamic = "force-dynamic";

const plans = [
  {
    name: "Full Access",
    detail:
      "Beli per 1 matakuliah, free tutor meeting 2 coin emas, dan akses ask tutor via chat.",
  },
  {
    name: "Selected",
    detail: "Beli per 1 bab tertentu dan dapat akses ask tutor via chat.",
  },
  {
    name: "Free",
    detail: "Materi pengenalan farmasi yang bisa diakses tanpa pembayaran.",
  },
];

export default function PlansPage() {
  return (
    <section className="app-grid page-section-fill">
      <header className="page-hero">
        <h1 className="section-title">Paket Langganan</h1>
        <p className="section-subtitle">
          Pilih paket belajar sesuai kebutuhan dan tahap adaptasi kuliah farmasi.
        </p>
      </header>

      <div className="cards-grid">
        {plans.map((plan) => (
          <article key={plan.name} className="section-card h-full">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="section-subtitle">{plan.detail}</p>
            <button className="btn btn-primary mt-4 w-full text-sm sm:w-auto">
              Pilih Paket
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}