"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import DrawingCanvas from "@/app/components/DrawingCanvas";

const userFilters = [
  "Pre-Pharm Learner",
  "Pharm Enthusiast",
  "Pharm Rookie",
  "Pharm Seniors",
];

const NOTES_STORAGE_KEY = "learn_page_notes";
const AUTO_SAVE_INTERVAL = 5000; // Save notes every 5 seconds

export default function LearnPage() {
  const [selectedFilter, setSelectedFilter] = useState(userFilters[0]);
  const [notes, setNotes] = useState(() => {
    try {
      return localStorage.getItem(NOTES_STORAGE_KEY) || "";
    } catch (error) {
      console.error("Failed to load notes:", error);
      return "";
    }
  });
  const [privacyOn, setPrivacyOn] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save notes to localStorage
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        if (notes) {
          localStorage.setItem(NOTES_STORAGE_KEY, notes);
        }
      } catch (error) {
        console.error("Failed to save notes:", error);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [notes]);

  useEffect(() => {
    const onVisibility = () => setPrivacyOn(document.hidden);
    const block = (event: Event) => event.preventDefault();

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
    };
  }, []);

  const watermark = useMemo(() => {
    return `${selectedFilter} • ${new Date().toLocaleDateString("id-ID")}`;
  }, [selectedFilter]);

  return (
    <section className="app-grid page-section-fill">
      {privacyOn && (
        <div className="protected-overlay">
          Aset dilindungi. Kembali ke tab Capsule untuk melanjutkan belajar.
        </div>
      )}

      <header className="page-hero">
        <h1 className="section-title">Learn Workspace</h1>
        <p className="section-subtitle">
          Materi kurikulum lama & baru, disajikan dengan format visual, audio, dan worksheet.
        </p>
      </header>

      <section className="section-card">
        <h2 className="section-title text-2xl">Filter User Segment</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          {userFilters.map((filter) => (
            <label key={filter} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="user-filter"
                checked={selectedFilter === filter}
                onChange={() => setSelectedFilter(filter)}
              />
              {filter}
            </label>
          ))}
        </div>
      </section>

      <section className="section-card">
        <h2 className="section-title text-2xl">Worksheet Interaktif</h2>
        <div className="app-grid-2 mt-4">
          <div>
            <h3 className="font-semibold mb-2">Catatan Teks</h3>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="field-textarea min-h-96"
              placeholder="Tulis ringkasan materi di sini..."
            />
            <button
              onClick={() => {
                const element = document.createElement("a");
                element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(notes));
                element.setAttribute("download", `catatan-${new Date().toISOString().split("T")[0]}.txt`);
                element.style.display = "none";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="btn btn-secondary mt-3 w-full sm:w-auto"
            >
              💾 Download Catatan
            </button>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Coretan & Gambar</h3>
            <DrawingCanvas watermark={watermark} />
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="app-grid-2">
        <div>
          <h2 className="section-title text-2xl">Belajar Audio (Spotify)</h2>
          <iframe
            className="media-frame mt-3 h-52 sm:h-40"
            src="https://open.spotify.com/embed/episode/7makk4oTQel546B0PZlDM5"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify capsule"
          />
        </div>
        <div>
          <h2 className="section-title text-2xl">Belajar Visual (Video)</h2>
          <iframe
            className="media-frame mt-3 h-52 sm:h-40"
            src="https://www.youtube.com/embed/rQjA5RG6M6Y"
            title="Video penjelasan materi"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        </div>
      </section>
    </section>
  );
}