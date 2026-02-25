import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import InvoiceDownloadButton from "./InvoiceDownloadButton";

export default async function PaymentHistoryPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signin");
  }

  // Get all user payments with related data
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    include: {
      plan: true,
      invoices: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="payment-history-container">
      <div className="history-header">
        <h1 className="history-title">Riwayat Pembayaran</h1>
        <Link href="/subscription" className="btn-back">
          ← Kembali
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
            />
          </svg>
          <p className="empty-text">Belum ada riwayat pembayaran</p>
          <Link href="/subscription" className="btn-primary-checkout">
            Lihat Plans
          </Link>
        </div>
      ) : (
        <div className="payments-list">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payments.map((payment: any) => {
            const invoice = payment.invoices[0];
            return (
              <div key={payment.id} className="payment-card">
                <div className="payment-card-header">
                  <div className="payment-info">
                    <h3 className="payment-plan">{payment.plan.name}</h3>
                    <p className="payment-date">
                      {payment.createdAt.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="payment-amount">
                    <span className="amount-value">
                      Rp {(payment.amountCents / 100).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="payment-card-body">
                  <div className="payment-meta">
                    <div className="meta-item">
                      <span className="meta-label">Metode:</span>
                      <span className="meta-value">
                        {payment.paymentMethod === "bank_transfer"
                          ? "Transfer Bank"
                          : payment.paymentMethod === "e_wallet"
                          ? "E-Wallet"
                          : payment.paymentMethod === "qris"
                          ? "QRIS"
                          : "Free"}
                      </span>
                    </div>
                    {invoice && (
                      <div className="meta-item">
                        <span className="meta-label">Invoice:</span>
                        <span className="meta-value">
                          {invoice.invoiceNumber}
                        </span>
                      </div>
                    )}
                    <div className="meta-item">
                      <span className="meta-label">Status:</span>
                      <span
                        className={`status-badge ${
                          payment.status === "completed"
                            ? "status-completed"
                            : payment.status === "pending"
                            ? "status-pending"
                            : payment.status === "expired"
                            ? "status-expired"
                            : "status-failed"
                        }`}
                      >
                        {payment.status === "completed"
                          ? "Berhasil"
                          : payment.status === "pending"
                          ? "Menunggu"
                          : payment.status === "expired"
                          ? "Kadaluarsa"
                          : "Gagal"}
                      </span>
                    </div>
                  </div>

                  {payment.paidAt && (
                    <div className="payment-paid-info">
                      <span className="paid-label">Dibayar pada:</span>
                      <span className="paid-date">
                        {payment.paidAt.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  {/* Invoice Download Buttons - only show for completed payments with invoice */}
                  {payment.status === "completed" && invoice && (
                    <div className="payment-invoice-actions">
                      <InvoiceDownloadButton
                        invoice={{
                          invoiceNumber: invoice.invoiceNumber,
                          createdAt: invoice.createdAt,
                          dueDate: invoice.dueDate,
                          paidAt: invoice.paidAt,
                          status: invoice.status,
                          amountCents: invoice.amountCents,
                        }}
                        plan={{
                          name: payment.plan.name,
                          priceCents: payment.plan.priceCents,
                        }}
                        user={{
                          name: user.name || "User",
                          email: user.email,
                        }}
                        paymentMethod={payment.paymentMethod}
                      />
                    </div>
                  )}

                  {payment.status === "pending" &&
                    payment.expiredAt &&
                    new Date() < payment.expiredAt && (
                      <div className="payment-actions">
                        {payment.externalUrl && (
                          <a
                            href={payment.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-pay-now"
                          >
                            Bayar Sekarang
                          </a>
                        )}
                        <span className="expire-info">
                          Berlaku hingga{" "}
                          {payment.expiredAt.toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}

                  {(payment.status === "failed" ||
                    payment.status === "expired") && (
                    <div className="payment-actions">
                      <Link
                        href={`/subscription/checkout/${payment.plan.slug}`}
                        className="btn-retry"
                      >
                        Coba Lagi
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
