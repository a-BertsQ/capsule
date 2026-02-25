import { redirect } from "next/navigation";
import { getCurrentUser, getActiveSessions } from "./actions";
import ProfileTabs from "./ProfileTabs";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const sessionsData = await getActiveSessions();
  const activeSessions = sessionsData.map((session: typeof sessionsData[number]) => ({
    ...session,
    userAgent: session.userAgent || "",
  }));

  if (!user) {
    redirect("/signin");
  }

  const normalizedUser = {
    ...user,
    name: user.name ?? undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            <div className="avatar-circle">{user.name?.charAt(0).toUpperCase() || "U"}</div>
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

      <ProfileTabs user={normalizedUser} sessions={activeSessions} />
    </div>
  );
}
