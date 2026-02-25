"use client";

import { useState } from "react";
import UpdateProfileForm from "./UpdateProfileForm";
import ChangeEmailForm from "./ChangeEmailForm";
import ChangePasswordForm from "./ChangePasswordForm";
import ActiveSessions from "./ActiveSessions";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface User {
  name?: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Session {
  id: string;
  userAgent: string;
  createdAt: Date;
  expires: Date;
  isCurrent: boolean;
}

interface Tab {
  id: string;
  title: string;
  isLink?: boolean;
  href?: string;
}

export default function ProfileTabs({ user, sessions }: { user: User; sessions: Session[] }) {
  const [activeTab, setActiveTab] = useState<"account" | "security" | "sessions" | "plans" | "info">("account");

  const tabs: Tab[] = [
    { id: "account", title: "Akun" },
    { id: "security", title: "Keamanan" },
    { id: "sessions", title: "Perangkat Aktif" },
    { id: "plans", title: "Langganan", isLink: true, href: "/subscription" },
    { id: "info", title: "Informasi Akun" },
  ];

  return (
    <div className="profile-layout">
      <div className="profile-sidebar">
        <div className="sidebar-card">
          <div className="sidebar-avatar">
            <div className="avatar-circle">{user.name?.charAt(0).toUpperCase() || "U"}</div>
          </div>
          <div className="sidebar-name">{user.name || "Pengguna"}</div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map((t) => {
            if (t.isLink && t.href) {
              return (
                <a
                  key={t.id}
                  href={t.href}
                  className="sidebar-link"
                >
                  {t.title}
                </a>
              );
            }
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as "account" | "security" | "sessions" | "plans" | "info")}
                className={classNames(
                  "sidebar-link",
                  activeTab === t.id ? "active" : ""
                )}
              >
                {t.title}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="profile-main">
        {activeTab === "account" && (
          <div className="profile-section">
            <h2 className="section-title">Pengaturan Akun</h2>
            <UpdateProfileForm currentName={user.name || null} />
          </div>
        )}

        {activeTab === "security" && (
          <div className="profile-section">
            <h2 className="section-title">Keamanan</h2>
            <div className="forms-grid">
              <ChangeEmailForm currentEmail={user.email} />
              <ChangePasswordForm />
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="profile-section">
            <ActiveSessions sessions={sessions} />
          </div>
        )}

        {activeTab === "info" && (
          <div className="profile-section">
            <h2 className="section-title">Informasi Akun</h2>
            <div className="account-info">
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Role</span>
                <span className="info-value">{user.role}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Akun Dibuat</span>
                <span className="info-value">{new Date(user.createdAt).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
