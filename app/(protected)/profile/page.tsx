import { redirect } from "next/navigation";
import { getCurrentUser, getActiveSessions } from "./actions";
import UpdateProfileForm from "./UpdateProfileForm";
import ChangeEmailForm from "./ChangeEmailForm";
import ChangePasswordForm from "./ChangePasswordForm";
import ActiveSessions from "./ActiveSessions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const sessionsData = await getActiveSessions();
  const activeSessions = sessionsData.map(session => ({
    ...session,
  }));

  if (!user) {
    redirect("/signin");
  }

  const emailVerificationStatus = user.emailVerified
    ? `Diverifikasi pada ${new Date(user.emailVerified).toLocaleDateString("id-ID")}`
    : "Belum diverifikasi";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-title">{user.name || "Pengguna"}</h1>
            <p className="profile-email">{user.email}</p>
            <span className={`email-status ${user.emailVerified ? "verified" : "unverified"}`}>
              {user.emailVerified ? "✓ Email Terverifikasi" : "⚠ Email Belum Terverifikasi"}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        {/* Account Settings */}
        <div className="profile-section">
          <h2 className="section-title">Pengaturan Akun</h2>

          <div className="forms-grid">
            <UpdateProfileForm currentName={user.name} />
          </div>
        </div>

        {/* Email & Password */}
        <div className="profile-section">
          <h2 className="section-title">Keamanan</h2>

          <div className="forms-grid">
            <ChangeEmailForm currentEmail={user.email} />
            <ChangePasswordForm />
          </div>
        </div>

        {/* Active Sessions / Devices */}
        <ActiveSessions sessions={activeSessions} />

        {/* Account Info */}
        <div className="profile-section">
          <h2 className="section-title">Informasi Akun</h2>
          <div className="account-info">
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email Verification</span>
              <span className={`info-value ${user.emailVerified ? "success" : "warning"}`}>
                {emailVerificationStatus}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className="info-value">{user.role}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Akun Dibuat</span>
              <span className="info-value">
                {new Date(user.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
