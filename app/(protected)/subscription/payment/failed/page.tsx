import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin");
  }

  const { paymentId } = await searchParams;

  let payment = null;
  if (paymentId) {
    payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { plan: true },
    });

    if (payment && payment.userId !== user.id) {
      redirect("/subscription");
    }
  }

  return (
    <div className="payment-failed-container">
      <div className="failed-card">
        <div className="failed-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-16 h-16 text-red-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="failed-title">Pembayaran Gagal</h1>

        <p className="failed-subtitle">
          {payment?.status === "expired"
            ? "Waktu pembayaran telah habis. Silakan coba lagi."
            : "Terjadi kesalahan saat memproses pembayaran Anda. Silakan coba lagi."}
        </p>

        {payment && (
          <div className="payment-details">
            <div className="detail-row">
              <span className="detail-label">Plan:</span>
              <span className="detail-value">{payment.plan.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total:</span>
              <span className="detail-value">
                Rp {(payment.amountCents / 100).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="status-badge status-failed">
                {payment.status === "expired" ? "Kadaluarsa" : "Gagal"}
              </span>
            </div>
          </div>
        )}

        <div className="failure-reasons">
          <h3>Kemungkinan penyebab:</h3>
          <ul>
            <li>Waktu pembayaran telah habis</li>
            <li>Saldo tidak mencukupi</li>
            <li>Masalah koneksi saat memproses</li>
            <li>Informasi pembayaran tidak valid</li>
          </ul>
        </div>

        <div className="action-buttons">
          {payment && (
            <Link
              href={`/subscription/checkout/${payment.plan.slug}`}
              className="btn-primary-checkout"
            >
              Coba Lagi
            </Link>
          )}
          <Link href="/subscription" className="btn-secondary">
            Kembali ke Dashboard
          </Link>
          <Link href="/subscription/payments" className="btn-outline">
            Riwayat Pembayaran
          </Link>
        </div>

        <div className="support-info">
          <p>
            Butuh bantuan?{" "}
            <Link href="/support" className="support-link">
              Hubungi Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
