"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutFromDeviceAction, logoutFromAllDevicesAction } from "./actions";

interface Session {
  id: string;
  userAgent: string | null;
  createdAt: Date;
  expires: Date;
  isCurrent: boolean;
}

export default function ActiveSessions({ sessions }: { sessions: Session[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSessionTerminated, setShowSessionTerminated] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  // Auto-redirect after session terminated
  useEffect(() => {
    if (!showSessionTerminated) return;

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/signin");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showSessionTerminated, router]);

  const getDeviceName = (userAgent: string | null): string => {
    if (!userAgent) return "Unknown Device";
    
    // Extract browser name
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Mobile")) return "Mobile";
    
    return "Unknown Browser";
  };

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = async (sessionId: string) => {
    setLoadingId(sessionId);
    setMessage(null);
    try {
      const result = await logoutFromDeviceAction(sessionId);
      
      if (result.success) {
        if (result.isCurrentSession) {
          // Current session logged out - show modal and let auto-redirect happen
          setShowSessionTerminated(true);
        } else {
          // Other device logged out - refresh to show updated list
          setMessage({ type: "success", text: "Perangkat berhasil dilogout." });
          // Refresh page to update sessions list
          setTimeout(() => {
            router.refresh();
            // Also hard-navigate to force re-render
            router.push("/profile");
          }, 800);
        }
      } else {
        setMessage({ type: "error", text: result.message || "Gagal logout dari perangkat." });
      }
    } catch (error) {
      console.error("Logout error:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan saat logout." });
    } finally {
      setLoadingId(null);
    }
  };

  const handleLogoutAll = async () => {
    setIsLoggingOutAll(true);
    setMessage(null);
    try {
      const result = await logoutFromAllDevicesAction();
      
      if (result.success) {
        // Show session terminated modal since we logged out current session too
        setShowSessionTerminated(true);
        setShowLogoutAllConfirm(false);
      } else {
        setMessage({ type: "error", text: result.message || "Gagal logout dari semua perangkat." });
      }
    } catch (error) {
      console.error("Logout all error:", error);
      setMessage({ type: "error", text: "Terjadi kesalahan saat logout." });
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="profile-section">
        <h2 className="profile-section-title">Perangkat Aktif</h2>
        <p className="text-muted">Tidak ada sesi aktif.</p>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <h2 className="profile-section-title">Perangkat Aktif</h2>
      <p className="text-sm text-muted" style={{ marginBottom: "1.5rem" }}>
        Kamu bisa login dari maksimal 2 perangkat berbeda. Logout dari perangkat lain untuk login di perangkat baru.
      </p>

      <div style={{ marginBottom: "1.5rem" }}>
        <button
          onClick={() => setShowLogoutAllConfirm(true)}
          disabled={isLoggingOutAll}
          className="btn-logout-all"
        >
          {isLoggingOutAll ? "Sedang logout..." : "Logout dari Semua Perangkat"}
        </button>
      </div>

      {message && (
        <div className={message.type === "success" ? "form-success" : "form-error"} style={{ marginBottom: "1rem" }}>
          {message.text}
        </div>
      )}

      <div className="sessions-list">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`session-item ${session.isCurrent ? "session-item-current" : ""}`}
          >
            <div className="session-device">
              <div className="device-icon">📱</div>
              <div className="device-info">
                <div className="device-name">
                  {getDeviceName(session.userAgent)}
                  {session.isCurrent && <span className="session-badge">Perangkat Saat Ini</span>}
                </div>
                <div className="device-details">
                  <div className="detail-row">
                    <span className="detail-label">Login:</span>
                    <span>{formatDate(session.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Expired:</span>
                    <span>{formatDate(session.expires)}</span>
                  </div>
                </div>
              </div>
            </div>

            {!session.isCurrent && (
              <button
                onClick={() => handleLogout(session.id)}
                disabled={loadingId === session.id}
                className="btn-logout-device"
              >
                {loadingId === session.id ? "Logging out..." : "Logout"}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Session Terminated Modal */}
      {showSessionTerminated && (
        <div className="session-terminated-overlay">
          <div className="session-terminated-modal">
            <div className="modal-icon">⚠️</div>
            <h2 className="modal-title">Sesi Anda Telah Diakhiri</h2>
            <p className="modal-message">
              Sesi login Anda pada perangkat ini telah dihentikan. Ini mungkin karena Anda menutup sesi dari perangkat lain atau alasan keamanan.
            </p>
            <p className="modal-countdown">
              Mengalihkan ke halaman login dalam <strong>{redirectCountdown}</strong> detik...
            </p>
            <div className="modal-actions">
              <button
                onClick={() => router.push("/signin")}
                className="btn-modal-signin"
              >
                Kembali ke Login Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
