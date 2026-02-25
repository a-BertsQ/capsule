"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutForm({
  plan,
  user,
}: {
  plan: { id: number; name: string; slug: string; priceCents: number };
  user: { id: string; email: string; name?: string | null };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal membuat pembayaran");
      }

      // Redirect to payment URL or success page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push(`/subscription/payment/success?paymentId=${data.paymentId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-form-container">
      <div className="checkout-header">
        <h2 className="checkout-title">Informasi Pembayaran</h2>
        <p className="checkout-subtitle">
          Pilih metode pembayaran untuk melanjutkan
        </p>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        {/* User Info */}
        <div className="form-section">
          <h3 className="form-section-title">Informasi Akun</h3>
          <div className="user-info-display">
            <div className="info-item">
              <label className="info-label">Email</label>
              <div className="info-value">{user.email}</div>
            </div>
            {user.name && (
              <div className="info-item">
                <label className="info-label">Nama</label>
                <div className="info-value">{user.name}</div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="form-section">
          <h3 className="form-section-title">Metode Pembayaran</h3>
          <div className="payment-methods">
            <label className={`payment-method-option ${paymentMethod === "bank_transfer" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="bank_transfer"
                checked={paymentMethod === "bank_transfer"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-content">
                <div className="method-icon">🏦</div>
                <div className="method-info">
                  <div className="method-name">Transfer Bank</div>
                  <div className="method-desc">BCA, Mandiri, BNI, BRI</div>
                </div>
              </div>
              <div className="method-check">
                {paymentMethod === "bank_transfer" && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="currentColor"/>
                    <path d="M14 7L8.5 12.5L6 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </label>

            <label className={`payment-method-option ${paymentMethod === "e_wallet" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="e_wallet"
                checked={paymentMethod === "e_wallet"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-content">
                <div className="method-icon">📱</div>
                <div className="method-info">
                  <div className="method-name">E-Wallet</div>
                  <div className="method-desc">GoPay, OVO, DANA, ShopeePay</div>
                </div>
              </div>
              <div className="method-check">
                {paymentMethod === "e_wallet" && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="currentColor"/>
                    <path d="M14 7L8.5 12.5L6 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </label>

            <label className={`payment-method-option ${paymentMethod === "qris" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="qris"
                checked={paymentMethod === "qris"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-content">
                <div className="method-icon">📲</div>
                <div className="method-info">
                  <div className="method-name">QRIS</div>
                  <div className="method-desc">Scan QR dengan e-wallet apapun</div>
                </div>
              </div>
              <div className="method-check">
                {paymentMethod === "qris" && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="10" fill="currentColor"/>
                    <path d="M14 7L8.5 12.5L6 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 4V8M8 10V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary-checkout"
            disabled={isLoading}
          >
            Kembali
          </button>
          <button
            type="submit"
            className="btn-primary-checkout"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Memproses...
              </>
            ) : (
              <>
                Lanjutkan Pembayaran
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>

        <div className="terms-notice">
          Dengan melanjutkan, Anda setuju dengan{" "}
          <a href="/terms" className="terms-link">Syarat & Ketentuan</a> kami
        </div>
      </form>
    </div>
  );
}
