"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

const userFilters = [
  "Pre-Pharm Learner",
  "Pharm Enthusiast",
  "Pharm Rookie",
  "Pharm Seniors",
];

export default function LearnPage() {
  const [selectedFilter, setSelectedFilter] = useState(userFilters[0]);
  const [notes, setNotes] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [privacyOn, setPrivacyOn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onStartDraw = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cursor = point(event);
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    setIsDrawing(true);
  };

  const onMoveDraw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cursor = point(event);
    ctx.lineTo(cursor.x, cursor.y);
    ctx.stroke();
  };

  const onStopDraw = () => setIsDrawing(false);

  const clearDraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

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
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="field-textarea min-h-60"
            placeholder="Tulis ringkasan materi di sini..."
          />
          <div className="media-frame relative p-2">
            <canvas
              ref={canvasRef}
              width={600}
              height={240}
              onPointerDown={onStartDraw}
              onPointerMove={onMoveDraw}
              onPointerUp={onStopDraw}
              onPointerLeave={onStopDraw}
              className="w-full rounded-md border border-dashed border-border"
            />
            <p className="watermark absolute left-4 top-4">{watermark}</p>
            <button
              onClick={clearDraw}
              className="btn btn-secondary mt-3 w-full sm:w-auto"
            >
              Clear Coretan
            </button>
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