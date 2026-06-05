import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

export class EmailService {
  private static getTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      logger.warn("Email credentials (EMAIL_USER / EMAIL_PASS) are missing in .env. Running EmailService in DRY-RUN mode (emails will only be logged).");
      return null;
    }

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass,
      },
    });
  }

  static async sendWelcomeEmail(to: string, name: string, role: string) {
    const transporter = this.getTransporter();
    const subject = "Selamat Datang di EduBridge!";
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">
        <h2 style="color: #7C3AED; text-align: center;">Selamat Datang di EduBridge!</h2>
        <p>Halo <strong>${name}</strong>,</p>
        <p>Terima kasih telah bergabung di platform pembelajaran adaptif EduBridge sebagai <strong>${role === 'TEACHER' ? 'Guru' : 'Siswa'}</strong>.</p>
        <p>EduBridge dirancang untuk membantu Anda belajar dan mengajar dengan dukungan teknologi AI terdepan. Anda sekarang dapat masuk ke aplikasi menggunakan email ini.</p>
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748B; text-align: center;">Tim Pengembang EduBridge &copy; 2026</p>
      </div>
    `;

    if (!transporter) {
      logger.info(`[Email Dry-Run] Welcome email to: ${to}. Name: ${name}, Role: ${role}`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"EduBridge" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      });
      logger.info(`Welcome email sent to ${to}`);
    } catch (err) {
      logger.error(`Failed to send welcome email to ${to}:`, err);
    }
  }

  static async sendForgotPasswordEmail(to: string, name: string, tempPassword: string) {
    const transporter = this.getTransporter();
    const subject = "Reset Password Akun EduBridge Anda";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">
        <h2 style="color: #7C3AED; text-align: center;">Reset Password EduBridge</h2>
        <p>Halo <strong>${name}</strong>,</p>
        <p>Kami menerima permintaan untuk mereset password akun EduBridge Anda.</p>
        <p>Kami telah menghasilkan password sementara untuk Anda gunakan masuk kembali:</p>
        <div style="background-color: #F8FAFC; border: 1px dashed #7C3AED; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; color: #7C3AED; margin: 20px 0; border-radius: 8px;">
          ${tempPassword}
        </div>
        <p><strong>Penting:</strong> Demi keamanan akun Anda, harap segera login menggunakan password sementara ini dan ganti password Anda melalui menu <strong>Profil &rarr; Pengaturan &rarr; Ganti Password</strong> di aplikasi.</p>
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748B; text-align: center;">Tim Pengembang EduBridge &copy; 2026</p>
      </div>
    `;

    if (!transporter) {
      logger.info(`[Email Dry-Run] Forgot password email to: ${to}. TempPassword: ${tempPassword}`);
      return;
    }

    try {
      await transporter.sendMail({
        from: `"EduBridge" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: htmlContent,
      });
      logger.info(`Forgot password email sent to ${to}`);
    } catch (err) {
      logger.error(`Failed to send forgot password email to ${to}:`, err);
    }
  }
}
