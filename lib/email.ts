import nodemailer from 'nodemailer';

// Email transporter configuration
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify transporter configuration
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email transporter is ready');
    return true;
  } catch (error) {
    console.error('❌ Email transporter error:', error);
    return false;
  }
}

// Send email helper
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Capsule'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback to HTML without tags
    });

    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error };
  }
}
