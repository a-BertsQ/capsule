import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin");
  }

  const { paymentId } = await searchParams;

  if (!paymentId) {
    redirect("/subscription");
  }

  // Get payment details
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      plan: true,
      invoices: true,
    },
  });

  if (!payment || payment.userId !== user.id) {
    redirect("/subscription");
  }

  const invoice = payment.invoices[0];

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-16 h-16 text-green-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="success-title">
          {payment.status === "completed"
            ? "Pembayaran Berhasil!"
            : "Menunggu Pembayaran"}
        </h1>

        <p className="success-subtitle">
          {payment.status === "completed"
            ? `Akun Anda telah berhasil di-upgrade ke plan ${payment.plan.name}`
            : `Silakan selesaikan pembayaran Anda sebelum ${payment.expiredAt?.toLocaleString("id-ID")}`}
        </p>

        <div className="payment-details">
          <div className="detail-row">
            <span className="detail-label">Plan:</span>
            <span className="detail-value">{payment.plan.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total Bayar:</span>
            <span className="detail-value">
              Rp {(payment.amountCents / 100).toLocaleString("id-ID")}
            </span>
          </div>
          {invoice && (
            <div className="detail-row">
              <span className="detail-label">No. Invoice:</span>
              <span className="detail-value">{invoice.invoiceNumber}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">Metode Pembayaran:</span>
            <span className="detail-value">
              {payment.paymentMethod === "bank_transfer"
                ? "Transfer Bank"
                : payment.paymentMethod === "e_wallet"
                ? "E-Wallet"
                : "QRIS"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span
              className={`status-badge ${
                payment.status === "completed"
                  ? "status-completed"
                  : payment.status === "pending"
                  ? "status-pending"
                  : "status-failed"
              }`}
            >
              {payment.status === "completed"
                ? "Berhasil"
                : payment.status === "pending"
                ? "Menunggu"
                : "Gagal"}
            </span>
          </div>
          {payment.paidAt && (
            <div className="detail-row">
              <span className="detail-label">Tanggal Bayar:</span>
              <span className="detail-value">
                {payment.paidAt.toLocaleString("id-ID")}
              </span>
            </div>
          )}
        </div>

        {payment.status === "pending" && payment.externalUrl && (
          <div className="action-buttons">
            <a
              href={payment.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-checkout"
            >
              Lanjutkan Pembayaran
            </a>
          </div>
        )}

        <div className="action-buttons">
          <Link href="/subscription" className="btn-secondary">
            Kembali ke Dashboard
          </Link>
          {payment.status === "completed" && (
            <Link href="/subscription/payments" className="btn-outline">
              Lihat Riwayat Pembayaran
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
