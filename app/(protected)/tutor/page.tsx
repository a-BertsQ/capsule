"use client";

import { useState } from "react";

const tutorSchedules = [
  {
    time: "09:00 - 10:00",
    tutor: "Alya, S.Farm.",
    achievement: "Best Academic Mentor 2025",
    social: "IG: @alya.pharm • LinkedIn: /in/alyapharm",
  },
  {
    time: "13:00 - 14:00",
    tutor: "Rafi, Apt.",
    achievement: "Top Clinical Intern 2024",
    social: "IG: @rafi.apt • LinkedIn: /in/rafiapt",
  },
  {
    time: "19:00 - 20:00",
    tutor: "Nadia, M.Farm.",
    achievement: "Research Award Nasional",
    social: "IG: @nadia.mfarm • LinkedIn: /in/nadiamfarm",
  },
];

export default function TutorPage() {
  const [coinBalance, setCoinBalance] = useState(2);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [message, setMessage] = useState("Pilih jadwal tutor untuk booking sesi.");

  const bookTutor = () => {
    if (selectedSession === null) {
      setMessage("Pilih jadwal terlebih dahulu.");
      return;
    }

    if (coinBalance < 1) {
      setMessage("Saldo coin emas tidak cukup.");
      return;
    }

    setCoinBalance((prev) => prev - 1);
    setMessage(`Booking berhasil untuk ${tutorSchedules[selectedSession].time}.`);
  };

  return (
    <section className="app-grid page-section-fill">
      <header className="page-hero">
        <h1 className="section-title">Coin Emas & Tutor Meeting</h1>
        <p className="section-subtitle">1 coin digunakan untuk 1 sesi private Zoom tutor.</p>
        <p className="badge mt-3">Saldo coin saat ini: {coinBalance}</p>
      </header>

      <div className="cards-grid">
        {tutorSchedules.map((slot, index) => (
          <button
            key={slot.time}
            onClick={() => setSelectedSession(index)}
            className={`section-card h-full text-left transition ${
              selectedSession === index
                ? "ring-2 ring-[color:var(--primary)]"
                : ""
            }`}
          >
            <p className="font-semibold">{slot.time}</p>
            <p className="text-sm">{slot.tutor}</p>
            <p className="section-subtitle mt-1 text-xs">{slot.achievement}</p>
            <p className="section-subtitle mt-2 text-xs">{slot.social}</p>
          </button>
        ))}
      </div>

      <div className="section-card">
        <button
          onClick={bookTutor}
          className="btn btn-primary w-full text-sm sm:w-auto"
        >
          Tukar 1 Coin untuk Booking
        </button>
        <p className="section-subtitle mt-3">{message}</p>
      </div>
    </section>
  );
}