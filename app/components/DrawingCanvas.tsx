"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import jsPDF from "jspdf";

type DrawingTool = "pen" | "highlighter" | "eraser";
type ColorSelection = string;

interface DrawingPage {
  id: string;
  imageData: string; // Base64 encoded canvas data
}

interface CanvasState {
  pages: DrawingPage[];
  currentPageIndex: number;
  selectedTool: DrawingTool;
  selectedColor: ColorSelection;
  penSize: number;
  canvasMode: "pages" | "endless";
  notes: string;
  lastSaved: number;
}

const STORAGE_KEY = "drawing_canvas_state";
const AUTO_SAVE_INTERVAL = 5000; // Save every 5 seconds

export default function DrawingCanvas({
  watermark,
  notes: externalNotes = "",
  onNotesChange,
}: {
  watermark: string;
  notes?: string;
  onNotesChange?: (notes: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<DrawingTool>("pen");
  const [selectedColor, setSelectedColor] = useState<ColorSelection>("#000000");
  const [penSize, setPenSize] = useState(2);
  const [pages, setPages] = useState<DrawingPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [canvasMode, setCanvasMode] = useState<"pages" | "endless">("pages");
  const [showToolbar, setShowToolbar] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notes, setNotes] = useState(externalNotes);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  const penColors = ["#000000", "#FF0000", "#0000FF", "#00AA00", "#FF8800", "#FF00FF"];
  const highlighterColors = ["#FFFF00", "#FF00FF", "#00FFFF", "#FFAA00"];

  // Create new blank page
  const createNewPage = (): DrawingPage => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    return { id: `page-${Date.now()}`, imageData: canvas.toDataURL("image/png") };
  };

  // Save state to localStorage
  const saveStateToStorage = async (state: CanvasState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setLastSavedTime(new Date());
    } catch (error) {
      console.error("Failed to save drawing state:", error);
      // Fallback: try to clear old data if storage is full
      if (error instanceof Error && error.name === "QuotaExceededError") {
        localStorage.removeItem(STORAGE_KEY);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (err) {
          console.error("Still cannot save after clearing:", err);
        }
      }
    }
  };

  // Load state from localStorage
  const loadStateFromStorage = (): CanvasState | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load drawing state:", error);
    }
    return null;
  };

  // Initialize state from storage or create new
  useEffect(() => {
    const savedState = loadStateFromStorage();

    if (savedState) {
      setPages(savedState.pages);
      setCurrentPageIndex(savedState.currentPageIndex);
      setSelectedTool(savedState.selectedTool);
      setSelectedColor(savedState.selectedColor);
      setPenSize(savedState.penSize);
      setCanvasMode(savedState.canvasMode);
      if (savedState.notes && !externalNotes) {
        setNotes(savedState.notes);
      }
    } else {
      // Create initial page
      setPages([createNewPage()]);
    }

    setIsLoaded(true);
  }, []);

  // Auto-save state periodically
  useEffect(() => {
    if (!isLoaded) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const currentCanvas = canvasRef.current;
      if (currentCanvas) {
        const updatedPages = [...pages];
        if (currentPageIndex < updatedPages.length) {
          updatedPages[currentPageIndex].imageData = currentCanvas.toDataURL("image/png");
        }

        const state: CanvasState = {
          pages: updatedPages,
          currentPageIndex,
          selectedTool,
          selectedColor,
          penSize,
          canvasMode,
          notes: notes || externalNotes,
          lastSaved: Date.now(),
        };

        saveStateToStorage(state);
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isDrawing, pages, currentPageIndex, selectedTool, selectedColor, penSize, canvasMode, notes, isLoaded]);

  // Update canvas display when page changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || pages.length === 0 || !isLoaded) return;

    const page = pages[currentPageIndex];
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 900;

    // Load from stored image data
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
    img.onerror = () => {
      // Fallback to white canvas if image fails to load
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    img.src = page.imageData;
  }, [currentPageIndex, pages, isLoaded]);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onStartDraw = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Prevent default to allow touch/stylus interaction
    event.preventDefault();

    const cursor = point(event);
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);

    if (selectedTool === "eraser") {
      ctx.clearRect(cursor.x - penSize / 2, cursor.y - penSize / 2, penSize, penSize);
    } else {
      ctx.lineWidth = selectedTool === "highlighter" ? penSize * 1.5 : penSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (selectedTool === "highlighter") {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = selectedColor;
      } else {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = selectedColor;
      }
    }

    setIsDrawing(true);
  };

  const onMoveDraw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    event.preventDefault();

    const cursor = point(event);

    if (selectedTool === "eraser") {
      ctx.clearRect(cursor.x - penSize / 2, cursor.y - penSize / 2, penSize, penSize);
    } else {
      ctx.lineTo(cursor.x, cursor.y);
      ctx.stroke();
    }
  };

  const onStopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save current canvas state to pages array
    const updatedPages = [...pages];
    updatedPages[currentPageIndex].imageData = canvas.toDataURL("image/png");
    setPages(updatedPages);
  };

  const clearCurrentPage = () => {
    if (window.confirm("Hapus semua coretan di halaman ini?")) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const updatedPages = [...pages];
      updatedPages[currentPageIndex].imageData = canvas.toDataURL("image/png");
      setPages(updatedPages);
    }
  };

  const addNewPage = () => {
    const newPages = [...pages, createNewPage()];
    setPages(newPages);
    setCurrentPageIndex(newPages.length - 1);
  };

  const deletePage = (index: number) => {
    if (pages.length === 1) {
      alert("Anda harus memiliki setidaknya satu halaman");
      return;
    }
    if (window.confirm("Hapus halaman ini?")) {
      const newPages = pages.filter((_, i) => i !== index);
      setPages(newPages);
      setCurrentPageIndex(Math.min(currentPageIndex, newPages.length - 1));
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1200, 900],
      });

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        const img = new Image();
        img.src = pages[i].imageData;

        await new Promise((resolve) => {
          img.onload = () => {
            pdf.addImage(img, "PNG", 0, 0, 1200, 900);
            resolve(null);
          };
        });
      }

      pdf.save(`coretan-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Gagal mengekspor PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportCurrentPageAsPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `halaman-${currentPageIndex + 1}-${new Date().toISOString().split("T")[0]}.png`;
    link.click();
  };

  const handleFullScreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    if (!isFullScreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {
          // Fallback: show modal-like fullscreen
          setIsFullScreen(true);
        });
      } else {
        setIsFullScreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsFullScreen(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 rounded">
        <p>Loading drawing canvas...</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`drawing-container ${
        isFullScreen
          ? "fixed inset-0 z-50 bg-white"
          : "w-full border border-gray-300 rounded-lg overflow-hidden"
      }`}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div className="drawing-toolbar bg-gray-100 border-b border-gray-300 p-3 sticky top-0 z-40">
          <div className="max-w-full overflow-x-auto">
            <div className="flex flex-wrap gap-3 items-center min-w-max">
              {/* Tool Selection */}
              <div className="flex gap-2 items-center">
                <label className="text-sm font-semibold">Alat:</label>
                {(["pen", "highlighter", "eraser"] as const).map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setSelectedTool(tool)}
                    title={`${tool === "pen" ? "Pena" : tool === "highlighter" ? "Spidol" : "Penghapus"} - Stylus/Pencil supported`}
                    className={`px-3 py-2 rounded text-sm font-medium transition ${
                      selectedTool === tool
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {tool === "pen" && "✏️ Pena"}
                    {tool === "highlighter" && "🎨 Spidol"}
                    {tool === "eraser" && "🗑️ Penghapus"}
                  </button>
                ))}
              </div>

              {/* Pen Size */}
              <div className="flex gap-2 items-center">
                <label className="text-sm font-semibold">Ukuran:</label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={penSize}
                  onChange={(e) => setPenSize(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm w-12">{penSize}px</span>
              </div>

              {/* Color Selection */}
              {selectedTool !== "eraser" && (
                <div className="flex gap-2 items-center">
                  <label className="text-sm font-semibold">
                    {selectedTool === "highlighter" ? "Warna Spidol:" : "Warna Pena:"}
                  </label>
                  <div className="flex gap-1">
                    {(selectedTool === "highlighter" ? highlighterColors : penColors).map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded border-2 transition ${
                          selectedColor === color ? "border-gray-800 scale-110" : "border-gray-400"
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Pilih ${color}`}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-gray-400"
                  />
                </div>
              )}

              {/* Canvas Mode */}
              <div className="flex gap-2 items-center">
                <label className="text-sm font-semibold">Mode:</label>
                {(["pages", "endless"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setCanvasMode(mode)}
                    className={`px-3 py-2 rounded text-sm font-medium transition ${
                      canvasMode === mode
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {mode === "pages" ? "📄 Halaman" : "📜 Endless"}
                  </button>
                ))}
              </div>

              {/* Page Management */}
              {canvasMode === "pages" && (
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-semibold">
                    Hal {currentPageIndex + 1}/{pages.length}
                  </span>
                  <button
                    onClick={addNewPage}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition"
                  >
                    ➕ Halaman
                  </button>
                </div>
              )}

              {/* Last Saved Indicator */}
              {lastSavedTime && (
                <div className="text-xs text-gray-600 px-2 py-1 bg-gray-200 rounded">
                  💾 Saved: {lastSavedTime.toLocaleTimeString("id-ID")}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={clearCurrentPage}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition"
                  title="Hapus semua coretan di halaman ini"
                >
                  🗑️ Hapus
                </button>
                <button
                  onClick={exportCurrentPageAsPNG}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition"
                  title="Export halaman saat ini sebagai PNG"
                >
                  📥 PNG
                </button>
                <button
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export semua halaman sebagai PDF"
                >
                  {isExporting ? "⏳ Export..." : "📄 PDF"}
                </button>
                <button
                  onClick={handleFullScreen}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition"
                  title="Full screen mode"
                >
                  {isFullScreen ? "🔽 Exit FS" : "⛶ Full Screen"}
                </button>
                {isFullScreen && (
                  <button
                    onClick={() => setShowToolbar(!showToolbar)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium"
                  >
                    {showToolbar ? "🔼 Sembunyikan" : "🔽 Tampilkan"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div
        ref={scrollContainerRef}
        className={`drawing-area ${isFullScreen ? "flex-1 overflow-auto" : "overflow-x-auto bg-gray-50"}`}
      >
        {canvasMode === "endless" ? (
          <div className="p-4 flex flex-col gap-4 min-h-screen">
            <canvas
              ref={canvasRef}
              onPointerDown={onStartDraw}
              onPointerMove={onMoveDraw}
              onPointerUp={onStopDraw}
              onPointerLeave={onStopDraw}
              onPointerCancel={onStopDraw}
              style={{ touchAction: "none" }}
              className="drawing-canvas w-full border-2 border-gray-300 rounded cursor-crosshair bg-white shadow-lg"
            />
          </div>
        ) : (
          <div className="p-4">
            <canvas
              ref={canvasRef}
              onPointerDown={onStartDraw}
              onPointerMove={onMoveDraw}
              onPointerUp={onStopDraw}
              onPointerLeave={onStopDraw}
              onPointerCancel={onStopDraw}
              style={{ touchAction: "none" }}
              className="drawing-canvas w-full border-2 border-gray-300 rounded cursor-crosshair bg-white shadow-lg"
            />

            {/* Page Navigation */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {pages.map((page, index) => (
                <div key={page.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPageIndex(index)}
                    className={`px-4 py-2 rounded transition text-sm font-medium ${
                      currentPageIndex === index
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  >
                    Hal {index + 1}
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={() => deletePage(index)}
                      className="px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition"
                      title="Hapus halaman"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exit Full Screen - Always visible in fullscreen mode */}
      {isFullScreen && (
        <button
          onClick={() => handleFullScreen()}
          className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition font-semibold"
          title="Exit full screen"
        >
          ⛶ Exit Full Screen
        </button>
      )}

      {!showToolbar && isFullScreen && (
        <button
          onClick={() => setShowToolbar(true)}
          className="fixed bottom-4 right-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg z-40"
          title="Show toolbar"
        >
          🔽 Toolbar
        </button>
      )}
    </div>
  );
}
