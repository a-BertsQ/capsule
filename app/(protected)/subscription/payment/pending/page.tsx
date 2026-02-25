import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function PendingPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin");
  }

  const { paymentId: externalId } = await searchParams;

  if (!externalId) {
    redirect("/subscription");
  }

  // Get payment by external ID
  const payment = await prisma.payment.findUnique({
    where: { externalId },
    include: {
      plan: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!payment || payment.userId !== user.id) {
    redirect("/subscription");
  }

  // Check if expired
  const isExpired = payment.expiredAt && new Date() > payment.expiredAt;

  return (
    <div className="pending-payment-container">
      <div className="pending-card">
        <div className="pending-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-16 h-16 text-orange-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="pending-title">
          {isExpired ? "Pembayaran Kadaluarsa" : "Menunggu Pembayaran"}
        </h1>

        <p className="pending-subtitle">
          {isExpired
            ? "Waktu pembayaran telah habis. Silakan buat pembayaran baru."
            : `Silakan selesaikan pembayaran sebelum ${payment.expiredAt?.toLocaleString("id-ID")}`}
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
          <div className="detail-row">
            <span className="detail-label">Metode:</span>
            <span className="detail-value">
              {payment.paymentMethod === "bank_transfer"
                ? "Transfer Bank"
                : payment.paymentMethod === "e_wallet"
                ? "E-Wallet"
                : "QRIS"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">ID Pembayaran:</span>
            <span className="detail-value font-mono text-sm">{payment.externalId}</span>
          </div>
        </div>

        {!isExpired && (
          <div className="payment-instructions">
            <h3>Instruksi Pembayaran:</h3>
            {payment.paymentMethod === "bank_transfer" && (
              <ol>
                <li>Transfer ke rekening yang tertera</li>
                <li>Gunakan ID Pembayaran sebagai berita transfer</li>
                <li>Simpan bukti transfer</li>
                <li>Pembayaran akan diverifikasi otomatis dalam 1-5 menit</li>
              </ol>
            )}
            {payment.paymentMethod === "e_wallet" && (
              <ol>
                <li>Buka aplikasi e-wallet Anda</li>
                <li>Scan QR code pada halaman pembayaran</li>
                <li>Konfirmasi pembayaran</li>
                <li>Tunggu notifikasi sukses</li>
              </ol>
            )}
            {payment.paymentMethod === "qris" && (
              <ol>
                <li>Buka aplikasi mobile banking atau e-wallet</li>
                <li>Pilih bayar dengan QRIS</li>
                <li>Scan QR code yang ditampilkan</li>
                <li>Konfirmasi pembayaran</li>
              </ol>
            )}
          </div>
        )}

        {/* Simulated Payment Buttons (FOR TESTING ONLY) */}
        <div className="simulation-warning">
          <p>⚠️ Mode Testing - Simulasi Pembayaran</p>
        </div>

        <div className="action-buttons">
          {!isExpired && (
            <form action="/api/payment/webhook" method="POST">
              <input type="hidden" name="external_id" value={payment.externalId || ""} />
              <input type="hidden" name="status" value="PAID" />
              <input type="hidden" name="payment_method" value={payment.paymentMethod || ""} />
              <button type="submit" className="btn-primary-checkout">
                ✅ Simulasi Pembayaran Berhasil
              </button>
            </form>
          )}

          <Link href="/subscription/payments" className="btn-secondary">
            Lihat Riwayat Pembayaran
          </Link>

          {isExpired && (
            <Link
              href={`/subscription/checkout/${payment.plan.slug}`}
              className="btn-primary-checkout"
            >
              Buat Pembayaran Baru
            </Link>
          )}
        </div>

        <div className="support-info">
          <p>
            Mengalami masalah?{" "}
            <Link href="/support" className="support-link">
              Hubungi Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
