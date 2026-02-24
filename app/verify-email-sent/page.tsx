import Link from "next/link";
import Image from "next/image";

export default function VerifyEmailSentPage() {
  return (
    <div className="verify-email-sent-container">
      <div className="verify-email-sent-card">
        <div className="verify-email-header">
          <Image
            src="/mascot/mascot capsule.webp"
            alt="Capsule Mascot"
            width={180}
            height={180}
            className="verify-mascot"
            priority
          />
          <h1 className="verify-title">Cek Email Kamu! 📧</h1>
        </div>

        <div className="verify-content">
          <p className="verify-text">
            Kami telah mengirimkan link verifikasi ke email kamu. 
            Silakan cek inbox atau folder spam dan klik link tersebut untuk mengaktifkan akun.
          </p>

          <div className="verify-info">
            <h3 className="verify-info-title">Belum menerima email?</h3>
            <ul className="verify-info-list">
              <li>Cek folder spam atau junk</li>
              <li>Pastikan email yang kamu masukkan benar</li>
              <li>Tunggu beberapa menit, email mungkin sedang dalam perjalanan</li>
            </ul>
          </div>

          <div className="verify-actions">
            <Link href="/resend-verification" className="btn-verify-signin">
              Kirim Ulang Email
            </Link>
            <Link href="/signin" className="btn-verify-home">
              Kembali ke Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
