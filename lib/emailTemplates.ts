// Email template base styles
const emailStyles = `
  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    background-color: #E8D8C4;
    margin: 0;
    padding: 0;
  }
  .email-wrapper {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(86, 28, 36, 0.12);
  }
  .email-header {
    background: linear-gradient(135deg, #561C24 0%, #6D2932 100%);
    padding: 40px 30px;
    text-align: center;
  }
  .email-logo {
    font-size: 32px;
    font-weight: 800;
    color: #E8D8C4;
    margin: 0;
    letter-spacing: -0.02em;
  }
  .email-body {
    padding: 40px 30px;
    color: #561C24;
  }
  .email-title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 20px;
    color: #561C24;
  }
  .email-text {
    font-size: 16px;
    line-height: 1.6;
    color: #6D2932;
    margin: 0 0 20px;
  }
  .email-button {
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #E8D8C4 0%, #C7B7A3 100%);
    color: #561C24;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 16px;
    margin: 20px 0;
    transition: all 0.3s ease;
  }
  .email-button:hover {
    background: linear-gradient(135deg, #C7B7A3 0%, #E8D8C4 100%);
  }
  .email-footer {
    background-color: #F9F6F2;
    padding: 30px;
    text-align: center;
    color: #6D2932;
    font-size: 14px;
  }
  .email-divider {
    border: none;
    border-top: 1px solid #C7B7A3;
    margin: 30px 0;
  }
  .code-box {
    background-color: #F9F6F2;
    border: 2px solid #C7B7A3;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: #561C24;
    letter-spacing: 4px;
    margin: 20px 0;
  }
`;

// Email verification template
export function emailVerificationTemplate(params: {
  userName: string;
  verificationLink: string;
  expiresIn?: string;
}) {
  const { userName, verificationLink, expiresIn = '24 jam' } = params;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Email - Capsule</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <h1 class="email-logo">💊 Capsule</h1>
    </div>
    
    <div class="email-body">
      <h2 class="email-title">Selamat Datang, ${userName}!</h2>
      
      <p class="email-text">
        Terima kasih telah mendaftar di Capsule - platform pembelajaran farmasi modern. 
        Untuk mengaktifkan akun Anda dan mulai belajar, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini.
      </p>
      
      <div style="text-align: center;">
        <a href="${verificationLink}" class="email-button">
          Verifikasi Email Saya
        </a>
      </div>
      
      <p class="email-text" style="font-size: 14px; color: #6D2932;">
        Link verifikasi ini akan kedaluwarsa dalam ${expiresIn}. Jika Anda tidak mendaftar untuk akun Capsule, 
        Anda dapat mengabaikan email ini dengan aman.
      </p>
      
      <hr class="email-divider">
      
      <p class="email-text" style="font-size: 14px; color: #6D2932;">
        <strong>Tidak bisa klik tombol?</strong><br>
        Salin dan tempel URL berikut ke browser Anda:<br>
        <span style="color: #561C24; word-break: break-all;">${verificationLink}</span>
      </p>
    </div>
    
    <div class="email-footer">
      <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Capsule — Platform E-Learning Farmasi</p>
      <p style="margin: 0; color: #C7B7A3;">Built for learning</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Password reset template
export function passwordResetTemplate(params: {
  userName: string;
  resetLink: string;
  expiresIn?: string;
}) {
  const { userName, resetLink, expiresIn = '1 jam' } = params;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - Capsule</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <h1 class="email-logo">💊 Capsule</h1>
    </div>
    
    <div class="email-body">
      <h2 class="email-title">Reset Password</h2>
      
      <p class="email-text">
        Halo ${userName},
      </p>
      
      <p class="email-text">
        Kami menerima permintaan untuk mereset password akun Capsule Anda. 
        Klik tombol di bawah ini untuk membuat password baru.
      </p>
      
      <div style="text-align: center;">
        <a href="${resetLink}" class="email-button">
          Reset Password Saya
        </a>
      </div>
      
      <p class="email-text" style="font-size: 14px; color: #6D2932;">
        Link reset password ini akan kedaluwarsa dalam ${expiresIn}. Jika Anda tidak meminta reset password, 
        abaikan email ini dan password Anda tidak akan berubah.
      </p>
      
      <hr class="email-divider">
      
      <p class="email-text" style="font-size: 14px; color: #6D2932;">
        <strong>Tips Keamanan:</strong><br>
        • Gunakan password yang kuat dengan kombinasi huruf besar, huruf kecil, angka, dan simbol<br>
        • Jangan bagikan password Anda kepada siapa pun<br>
        • Gunakan password yang berbeda untuk setiap akun
      </p>
      
      <hr class="email-divider">
      
      <p class="email-text" style="font-size: 14px; color: #6D2932;">
        <strong>Tidak bisa klik tombol?</strong><br>
        Salin dan tempel URL berikut ke browser Anda:<br>
        <span style="color: #561C24; word-break: break-all;">${resetLink}</span>
      </p>
    </div>
    
    <div class="email-footer">
      <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Capsule — Platform E-Learning Farmasi</p>
      <p style="margin: 0; color: #C7B7A3;">Built for learning</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Welcome email template (after verification)
export function welcomeEmailTemplate(params: {
  userName: string;
  dashboardLink: string;
}) {
  const { userName, dashboardLink } = params;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selamat Datang di Capsule</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <h1 class="email-logo">💊 Capsule</h1>
    </div>
    
    <div class="email-body">
      <h2 class="email-title">Selamat! Akun Anda Sudah Aktif 🎉</h2>
      
      <p class="email-text">
        Halo ${userName},
      </p>
      
      <p class="email-text">
        Email Anda telah berhasil diverifikasi! Anda sekarang bisa mengakses semua fitur Capsule 
        dan mulai perjalanan belajar farmasi Anda.
      </p>
      
      <div style="text-align: center;">
        <a href="${dashboardLink}" class="email-button">
          Mulai Belajar Sekarang
        </a>
      </div>
      
      <hr class="email-divider">
      
      <h3 style="color: #561C24; font-size: 18px; margin: 20px 0 10px;">Apa yang bisa Anda lakukan di Capsule?</h3>
      
      <p class="email-text">
        ✓ Akses materi pembelajaran farmasi komprehensif<br>
        ✓ Belajar dengan tutor profesional berpengalaman<br>
        ✓ Track progress pembelajaran Anda<br>
        ✓ Dapatkan sertifikat digital untuk setiap modul
      </p>
    </div>
    
    <div class="email-footer">
      <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Capsule — Platform E-Learning Farmasi</p>
      <p style="margin: 0; color: #C7B7A3;">Built for learning</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Payment success and plan upgrade template
export function paymentSuccessTemplate(params: {
  userName: string;
  planName: string;
  amountPaid: string;
  invoiceNumber: string;
  nextBillingDate: string;
  dashboardLink: string;
}) {
  const { userName, planName, amountPaid, invoiceNumber, nextBillingDate, dashboardLink } = params;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pembayaran Berhasil - Capsule</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <h1 class="email-logo">💊 Capsule</h1>
    </div>
    
    <div class="email-body">
      <h2 class="email-title">✅ Pembayaran Berhasil!</h2>
      
      <p class="email-text">
        Halo ${userName},
      </p>
      
      <p class="email-text">
        Terima kasih! Pembayaran Anda telah berhasil diproses dan akun Anda telah di-upgrade ke plan <strong>${planName}</strong>.
      </p>

      <div class="code-box" style="background: linear-gradient(135deg, #F9F6F2 0%, #E8D8C4 100%); text-align: left; font-size: 14px; letter-spacing: 0;">
        <p style="margin: 0 0 8px; color: #6D2932; font-size: 12px; font-weight: 600;">DETAIL PEMBAYARAN</p>
        <p style="margin: 5px 0; color: #561C24; font-size: 14px;"><strong>Plan:</strong> ${planName}</p>
        <p style="margin: 5px 0; color: #561C24; font-size: 14px;"><strong>Total Dibayar:</strong> ${amountPaid}</p>
        <p style="margin: 5px 0; color: #561C24; font-size: 14px;"><strong>No. Invoice:</strong> ${invoiceNumber}</p>
        <p style="margin: 5px 0; color: #561C24; font-size: 14px;"><strong>Billing Berikutnya:</strong> ${nextBillingDate}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${dashboardLink}" class="email-button">
          Lihat Dashboard Saya
        </a>
      </div>
      
      <hr class="email-divider">
      
      <p class="email-text" style="font-size: 14px;">
        Pembayaran akan diperpanjang otomatis pada tanggal <strong>${nextBillingDate}</strong>. Anda akan menerima email reminder 7 hari sebelum tanggal perpanjangan.
      </p>
    </div>
    
    <div class="email-footer">
      <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Capsule — Platform E-Learning Farmasi</p>
      <p style="margin: 0; color: #C7B7A3;">Built for learning</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Outstanding payment reminder template
export function outstandingPaymentTemplate(params: {
  userName: string;
  planName: string;
  amountDue: string;
  dueDate: string;
  invoiceNumber: string;
  paymentLink: string;
}) {
  const { userName, planName, amountDue, dueDate, invoiceNumber, paymentLink } = params;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder Pembayaran - Capsule</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header" style="background: linear-gradient(135deg, #b45309 0%, #d97706 100%);">
      <h1 class="email-logo">💊 Capsule</h1>
    </div>
    
    <div class="email-body">
      <h2 class="email-title">⚠️ Pembayaran Belum Terselesaikan</h2>
      
      <p class="email-text">
        Halo ${userName},
      </p>
      
      <p class="email-text">
        Kami mendeteksi ada pembayaran yang belum diselesaikan untuk plan <strong>${planName}</strong> Anda.
      </p>

      <div class="code-box" style="background: rgba(180, 83, 9, 0.1); border-color: #d97706; text-align: left; font-size: 14px; letter-spacing: 0;">
        <p style="margin: 0 0 8px; color: #b45309; font-size: 12px; font-weight: 600;">DETAIL TAGIHAN</p>
        <p style="margin: 5px 0; color: #561C24; font-size: 14px;"><strong>Plan:</strong> ${planName}</p>
        <p style="margin: 5px 0; color: #561C24; font-size: 14px;"><strong>Total Tagihan:</strong> ${amountDue}</p>
        <p style="margin: 5px 0; color: #561C24; font-size: 14px;"><strong>No. Invoice:</strong> ${invoiceNumber}</p>
        <p style="margin: 5px 0; color: #b45309; font-size: 14px;"><strong>Jatuh Tempo:</strong> ${dueDate}</p>
      </div>
      
      <p class="email-text">
        Silakan selesaikan pembayaran sebelum tanggal jatuh tempo untuk menghindari gangguan layanan.
      </p>
      
      <div style="text-align: center;">
        <a href="${paymentLink}" class="email-button" style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); color: white;">
          Bayar Sekarang
        </a>
      </div>
      
      <hr class="email-divider">
      
      <p class="email-text" style="font-size: 13px; color: #6D2932;">
        Jika Anda memiliki pertanyaan tentang tagihan ini, silakan hubungi tim support kami.
      </p>
    </div>
    
    <div class="email-footer">
      <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Capsule — Platform E-Learning Farmasi</p>
      <p style="margin: 0; color: #C7B7A3;">Built for learning</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Subscription expiring soon template
export function subscriptionExpiringTemplate(params: {
  userName: string;
  planName: string;
  expiryDate: string;
  daysRemaining: number;
  renewalLink: string;
}) {
  const { userName, planName, expiryDate, daysRemaining, renewalLink } = params;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Langganan Akan Berakhir - Capsule</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <h1 class="email-logo">💊 Capsule</h1>
    </div>
    
    <div class="email-body">
      <h2 class="email-title">⏰ Langganan Anda Akan Berakhir</h2>
      
      <p class="email-text">
        Halo ${userName},
      </p>
      
      <p class="email-text">
        Langganan <strong>${planName}</strong> Anda akan berakhir dalam <strong>${daysRemaining} hari</strong> pada tanggal <strong>${expiryDate}</strong>.
      </p>

      <div class="code-box" style="background: rgba(180, 83, 9, 0.05); border-color: #C7B7A3;">
        <p style="margin: 0; font-size: 36px; color: #b45309;">${daysRemaining}</p>
        <p style="margin: 8px 0 0; font-size: 14px; color: #6D2932; letter-spacing: 0;">hari tersisa</p>
      </div>
      
      <p class="email-text">
        Untuk melanjutkan akses ke semua fitur premium, silakan perpanjang langganan Anda sekarang.
      </p>
      
      <div style="text-align: center;">
        <a href="${renewalLink}" class="email-button">
          Perpanjang Langganan
        </a>
      </div>
      
      <hr class="email-divider">
      
      <p class="email-text" style="font-size: 13px; color: #6D2932;">
        <strong>Apa yang terjadi jika tidak diperpanjang?</strong><br>
        Jika langganan tidak diperpanjang sebelum tanggal ${expiryDate}, akun Anda akan otomatis diturunkan ke <strong>Free Plan</strong> dan Anda akan kehilangan akses ke fitur premium.
      </p>
    </div>
    
    <div class="email-footer">
      <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Capsule — Platform E-Learning Farmasi</p>
      <p style="margin: 0; color: #C7B7A3;">Built for learning</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Subscription downgraded to free plan template
export function subscriptionDowngradedTemplate(params: {
  userName: string;
  previousPlan: string;
  dashboardLink: string;
}) {
  const { userName, previousPlan, dashboardLink } = params;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Akun Diturunkan ke Free Plan - Capsule</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header" style="background: linear-gradient(135deg, #6D2932 0%, #561C24 100%);">
      <h1 class="email-logo">💊 Capsule</h1>
    </div>
    
    <div class="email-body">
      <h2 class="email-title">📋 Langganan Diturunkan ke Free Plan</h2>
      
      <p class="email-text">
        Halo ${userName},
      </p>
      
      <p class="email-text">
        Langganan <strong>${previousPlan}</strong> Anda telah berakhir dan tidak diperpanjang. Akun Anda sekarang menggunakan <strong>Free Plan</strong>.
      </p>

      <div class="code-box" style="background: #F9F6F2; text-align: left; font-size: 14px; letter-spacing: 0;">
        <p style="margin: 0 0 12px; color: #561C24; font-size: 16px; font-weight: 700;">Yang Masih Bisa Anda Akses:</p>
        <p style="margin: 5px 0; color: #6D2932; font-size: 14px;">✓ Materi dasar farmasi</p>
        <p style="margin: 5px 0; color: #6D2932; font-size: 14px;">✓ Forum komunitas</p>
        <p style="margin: 5px 0; color: #6D2932; font-size: 14px;">✓ Artikel dan blog</p>
        <hr style="border: none; border-top: 1px solid #C7B7A3; margin: 12px 0;">
        <p style="margin: 5px 0; color: #b91c1c; font-size: 14px;">✗ Akses materi premium</p>
        <p style="margin: 5px 0; color: #b91c1c; font-size: 14px;">✗ Sesi tutor private</p>
        <p style="margin: 5px 0; color: #b91c1c; font-size: 14px;">✗ Sertifikat digital</p>
      </div>
      
      <p class="email-text">
        Ingin kembali ke plan premium? Upgrade kapan saja untuk mendapatkan akses penuh ke semua fitur!
      </p>
      
      <div style="text-align: center;">
        <a href="${dashboardLink}" class="email-button">
          Lihat Pilihan Plan
        </a>
      </div>
      
      <hr class="email-divider">
      
      <p class="email-text" style="font-size: 13px; color: #6D2932;">
        Terima kasih telah menggunakan Capsule. Kami senang bisa membantu perjalanan belajar farmasi Anda! 🙏
      </p>
    </div>
    
    <div class="email-footer">
      <p style="margin: 0 0 10px;">© ${new Date().getFullYear()} Capsule — Platform E-Learning Farmasi</p>
      <p style="margin: 0; color: #C7B7A3;">Built for learning</p>
    </div>
  </div>
</body>
</html>
  `;
}

