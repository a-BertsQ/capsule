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
