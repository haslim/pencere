"use client";

import React, { useState } from "react";
import {
  WindowItem,
  DivisionType,
  SashProfileType,
  KasaProfileType,
} from "@/lib/pencereEngine";

export type ErcomToolMode =
  | "select"
  | "v_mullion"
  | "h_mullion"
  | "tek_acilim"
  | "cift_acilim"
  | "kapi_kanadi"
  | "surme_kanat"
  | "vasistas"
  | "sabit";

interface WindowCanvasProps {
  item: WindowItem;
  onUpdateDivisionType?: (
    index: number,
    type: DivisionType,
    sashProfileType?: SashProfileType
  ) => void;
  onUpdateSashMullions?: (
    index: number,
    vMullions: number,
    hMullions: number
  ) => void;
  onAddMullion?: (direction: "v" | "h") => void;
  isDark?: boolean;
}

export const WindowCanvas: React.FC<WindowCanvasProps> = ({
  item,
  onUpdateDivisionType,
  onUpdateSashMullions,
  onAddMullion,
  isDark = false,
}) => {
  const {
    width,
    height,
    color,
    verticalMullionsCount,
    horizontalMullionsCount,
    divisions,
    systemType = "STANDART_DOGRAMA",
    kasaProfileType = "L_KASA",
  } = item;

  // Active ERCOM Tool Mode
  const [activeTool, setActiveTool] = useState<ErcomToolMode>("select");
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);

  const [maxCanvasW, setMaxCanvasW] = useState<number>(540);
  const [maxCanvasH, setMaxCanvasH] = useState<number>(400);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setMaxCanvasW(Math.min(330, window.innerWidth - 64));
        setMaxCanvasH(300);
      } else if (window.innerWidth < 1024) {
        setMaxCanvasW(440);
        setMaxCanvasH(360);
      } else {
        setMaxCanvasW(540);
        setMaxCanvasH(400);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scale = Math.min(maxCanvasW / width, maxCanvasH / height);
  const canvasW = Math.round(width * scale);
  const canvasH = Math.round(height * scale);

  const PROFILE_THICKNESS = Math.max(14, Math.round(18 * scale * 4));

  const colCount = verticalMullionsCount + 1;
  const rowCount = horizontalMullionsCount + 1;

  const innerCanvasW = canvasW - PROFILE_THICKNESS * 2;
  const innerCanvasH = canvasH - PROFILE_THICKNESS * 2;

  const sectionW =
    (innerCanvasW - verticalMullionsCount * PROFILE_THICKNESS) / colCount;
  const sectionH =
    (innerCanvasH - horizontalMullionsCount * PROFILE_THICKNESS) / rowCount;

  // Cell Click Handler (ERCOM Style Tıklayıp Ekleme / Uygulama)
  const handleCellClick = (divIdx: number) => {
    setSelectedCellIndex(divIdx);

    if (activeTool === "tek_acilim" && onUpdateDivisionType) {
      onUpdateDivisionType(divIdx, "tek-acilim", "PENCERE_KANADI");
    } else if (activeTool === "cift_acilim" && onUpdateDivisionType) {
      onUpdateDivisionType(divIdx, "cift-acilim", "PENCERE_KANADI");
    } else if (activeTool === "kapi_kanadi" && onUpdateDivisionType) {
      onUpdateDivisionType(divIdx, "kapi-ic", "KAPI_KANADI");
    } else if (activeTool === "surme_kanat" && onUpdateDivisionType) {
      onUpdateDivisionType(divIdx, "surme-sol", "SURME_KANAD");
    } else if (activeTool === "vasistas" && onUpdateDivisionType) {
      onUpdateDivisionType(divIdx, "vasistas", "VASISTAS");
    } else if (activeTool === "sabit" && onUpdateDivisionType) {
      onUpdateDivisionType(divIdx, "sabit", "PENCERE_KANADI");
    } else if (activeTool === "v_mullion" && onAddMullion) {
      onAddMullion("v");
    } else if (activeTool === "h_mullion" && onAddMullion) {
      onAddMullion("h");
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border transition-all select-none relative w-full ${
        isDark
          ? "bg-slate-950 border-slate-800 shadow-2xl"
          : "bg-slate-50/90 border-slate-200/80 shadow-md"
      }`}
    >
      {/* 🛠️ ERCOM CAD ÇİZİM ARAÇ ÇUBUĞU (MODE RIBBON TOOLBAR) */}
      <div
        className={`w-full mb-4 p-2 rounded-xl border flex items-center justify-between gap-2 overflow-x-auto ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-200"
            : "bg-white border-slate-200 shadow-sm text-slate-800"
        }`}
      >
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 px-2 whitespace-nowrap">
            🛠️ ERCOM Çizim Araçları:
          </span>

          <button
            onClick={() => setActiveTool("select")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
              activeTool === "select"
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : isDark
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
          >
            🎯 Seç & Düzenle
          </button>

          <button
            onClick={() => {
              setActiveTool("v_mullion");
              if (onAddMullion) onAddMullion("v");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
              activeTool === "v_mullion"
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : isDark
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-cyan-400"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-blue-700"
            }`}
          >
            ╍ +Dikey Kayıt
          </button>

          <button
            onClick={() => {
              setActiveTool("h_mullion");
              if (onAddMullion) onAddMullion("h");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
              activeTool === "h_mullion"
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : isDark
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-cyan-400"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-blue-700"
            }`}
          >
            ➖ +Yatay Kayıt
          </button>

          <button
            onClick={() => setActiveTool("tek_acilim")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
              activeTool === "tek_acilim"
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : isDark
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
          >
            🪟 Pencere Kanadı
          </button>

          <button
            onClick={() => setActiveTool("cift_acilim")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
              activeTool === "cift_acilim"
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : isDark
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
          >
            🔄 Çift Açılım
          </button>

          <button
            onClick={() => setActiveTool("kapi_kanadi")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
              activeTool === "kapi_kanadi"
                ? "bg-emerald-600 text-white border-emerald-600 shadow"
                : isDark
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-emerald-400"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-emerald-700"
            }`}
          >
            🚪 Kapı Kanadı
          </button>

          <button
            onClick={() => setActiveTool("surme_kanat")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
              activeTool === "surme_kanat"
                ? "bg-indigo-600 text-white border-indigo-600 shadow"
                : isDark
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-indigo-400"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-indigo-700"
            }`}
          >
            ↔️ Sürme Kanat
          </button>

          <button
            onClick={() => setActiveTool("sabit")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
              activeTool === "sabit"
                ? "bg-slate-700 text-white border-slate-700 shadow"
                : isDark
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
          >
            🔒 Sabit Cam
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] bg-blue-500/10 text-blue-600 font-mono font-bold px-2 py-0.5 rounded border border-blue-200">
            Kasa: {kasaProfileType.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Üst Ölçü Ok Çizgisi (Genişlik) */}
      <div
        className={`w-full flex items-center justify-between text-xs font-mono mb-2 px-2 ${
          isDark ? "text-cyan-400" : "text-blue-600"
        }`}
      >
        <div className={`h-2 w-px ${isDark ? "bg-cyan-500" : "bg-blue-500"}`} />
        <div
          className={`flex-1 h-px flex items-center justify-center ${
            isDark ? "bg-cyan-500/50" : "bg-blue-500/40"
          }`}
        >
          <span
            className={`px-2 py-0.5 rounded border text-xs font-bold shadow-sm ${
              isDark
                ? "bg-slate-900 border-cyan-500/30 text-cyan-300"
                : "bg-white border-blue-200 text-blue-800 font-bold"
            }`}
          >
            W: {width} mm
          </span>
        </div>
        <div className={`h-2 w-px ${isDark ? "bg-cyan-500" : "bg-blue-500"}`} />
      </div>

      <div className="flex items-center">
        {/* Sol Ölçü Ok Çizgisi (Yükseklik) */}
        <div
          className={`h-full flex flex-col items-center justify-between text-xs font-mono mr-2 py-2 ${
            isDark ? "text-cyan-400" : "text-blue-600"
          }`}
        >
          <div className={`w-2 h-px ${isDark ? "bg-cyan-500" : "bg-blue-500"}`} />
          <div
            className={`flex-1 w-px flex items-center justify-center ${
              isDark ? "bg-cyan-500/50" : "bg-blue-500/40"
            }`}
          >
            <span
              className={`px-1.5 py-1 rounded border text-xs font-bold -rotate-90 whitespace-nowrap shadow-sm ${
                isDark
                  ? "bg-slate-900 border-cyan-500/30 text-cyan-300"
                  : "bg-white border-blue-200 text-blue-800 font-bold"
              }`}
            >
              H: {height} mm
            </span>
          </div>
          <div className={`w-2 h-px ${isDark ? "bg-cyan-500" : "bg-blue-500"}`} />
        </div>

        {/* Dynamic SVG Window Canvas */}
        <div
          style={{ width: canvasW, height: canvasH }}
          className={`relative rounded-lg overflow-hidden border shadow-lg transition-all ${
            isDark ? "border-slate-700/60 shadow-slate-950/80" : "border-slate-300 shadow-slate-300/40"
          }`}
        >
          <svg width={canvasW} height={canvasH} className="w-full h-full">
            {/* Dış Kasa Çerçevesi (L / T / Z / Sürme Kasa Görünümü) */}
            <rect
              x={0}
              y={0}
              width={canvasW}
              height={canvasH}
              fill={color.hex}
              stroke={isDark ? "#000" : "#334155"}
              strokeWidth={kasaProfileType === "Z_KASA" ? "4" : "2"}
            />

            {/* Alüminyum Eşikli Kapı Kasası ise Alt Eşik Çizimi */}
            {kasaProfileType === "ESIKLI_KASA" && (
              <rect
                x={0}
                y={canvasH - PROFILE_THICKNESS}
                width={canvasW}
                height={PROFILE_THICKNESS}
                fill="#94a3b8"
                stroke="#475569"
                strokeWidth="1.5"
              />
            )}

            {/* Sürme Kasa Ray Çizgileri */}
            {(kasaProfileType === "SURME_KASA_2" || kasaProfileType === "SURME_KASA_3") && (
              <>
                <line
                  x1={0}
                  y1={PROFILE_THICKNESS / 2}
                  x2={canvasW}
                  y2={PROFILE_THICKNESS / 2}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <line
                  x1={0}
                  y1={canvasH - PROFILE_THICKNESS / 2}
                  x2={canvasW}
                  y2={canvasH - PROFILE_THICKNESS / 2}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </>
            )}

            {/* Kasa İç Boşluğu (Cam Arkası Fon Rengi) */}
            <rect
              x={PROFILE_THICKNESS}
              y={PROFILE_THICKNESS}
              width={innerCanvasW}
              height={innerCanvasH - (kasaProfileType === "ESIKLI_KASA" ? 4 : 0)}
              fill={isDark ? "#061826" : "#e0f2fe"}
            />

            {/* Kasa Geneli Dikey Orta Kayıtlar */}
            {Array.from({ length: verticalMullionsCount }).map((_, vIdx) => {
              const xPos =
                PROFILE_THICKNESS + (vIdx + 1) * sectionW + vIdx * PROFILE_THICKNESS;
              return (
                <rect
                  key={`v-mullion-${vIdx}`}
                  x={xPos}
                  y={PROFILE_THICKNESS}
                  width={PROFILE_THICKNESS}
                  height={innerCanvasH}
                  fill={color.hex}
                  stroke={isDark ? "#1e293b" : "#475569"}
                  strokeWidth="1"
                />
              );
            })}

            {/* Kasa Geneli Yatay Orta Kayıtlar */}
            {Array.from({ length: horizontalMullionsCount }).map((_, hIdx) => {
              const yPos =
                PROFILE_THICKNESS + (hIdx + 1) * sectionH + hIdx * PROFILE_THICKNESS;
              return (
                <rect
                  key={`h-mullion-${hIdx}`}
                  x={PROFILE_THICKNESS}
                  y={yPos}
                  width={innerCanvasW}
                  height={PROFILE_THICKNESS}
                  fill={color.hex}
                  stroke={isDark ? "#1e293b" : "#475569"}
                  strokeWidth="1"
                />
              );
            })}

            {/* Bölme Detayları, Kanat İçi Orta Kayıtlar ve Camlar */}
            {Array.from({ length: rowCount }).map((_, rIdx) =>
              Array.from({ length: colCount }).map((_, cIdx) => {
                const divIdx = rIdx * colCount + cIdx;
                const div = divisions[divIdx] || {
                  type: "sabit",
                  sashProfileType: "PENCERE_KANADI",
                  sashVerticalMullions: 0,
                  sashHorizontalMullions: 0,
                };
                const divType = div.type;
                const sashProf = div.sashProfileType || (divType.includes("kapi") ? "KAPI_KANADI" : divType.includes("surme") ? "SURME_KANAD" : "PENCERE_KANADI");

                const startX =
                  PROFILE_THICKNESS + cIdx * (sectionW + PROFILE_THICKNESS);
                const startY =
                  PROFILE_THICKNESS + rIdx * (sectionH + PROFILE_THICKNESS);

                const isDoor = sashProf === "KAPI_KANADI" || divType.includes("kapi");
                const isSliding = sashProf === "SURME_KANAD" || divType.includes("surme");

                const SASH_MARGIN = divType === "sabit" ? 4 : isDoor ? 14 : 10;

                const sVert = div.sashVerticalMullions || 0;
                const sHoriz = div.sashHorizontalMullions || 0;

                const glassBoxW = sectionW - SASH_MARGIN * 2;
                const glassBoxH = sectionH - SASH_MARGIN * 2;

                return (
                  <g key={`div-${divIdx}`} onClick={() => handleCellClick(divIdx)} className="cursor-pointer">
                    {/* Kanat Çerçevesi (Açılırsa) */}
                    {divType !== "sabit" && (
                      <rect
                        x={startX + (isDoor ? 3 : 4)}
                        y={startY + (isDoor ? 3 : 4)}
                        width={sectionW - (isDoor ? 6 : 8)}
                        height={sectionH - (isDoor ? 6 : 8)}
                        fill={color.hex}
                        stroke={isDoor ? "#0f172a" : isDark ? "#0f172a" : "#334155"}
                        strokeWidth={isDoor ? "3" : "1.5"}
                        rx="2"
                      />
                    )}

                    {/* Kapı Kolu / Kilit Simgesi Görseli (Kapı Kanatlarında) */}
                    {isDoor && (
                      <g transform={`translate(${startX + sectionW - 20}, ${startY + sectionH / 2 - 10})`}>
                        <rect x={0} y={0} width={8} height={20} fill="#64748b" rx="2" />
                        <circle cx={4} cy={5} r={2} fill="#e2e8f0" />
                        <line x1={4} y1={5} x2={-8} y2={5} stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                      </g>
                    )}

                    {/* Isıcam Cam Alanı */}
                    <rect
                      x={startX + SASH_MARGIN}
                      y={startY + SASH_MARGIN}
                      width={glassBoxW}
                      height={glassBoxH}
                      fill="url(#glassGradient)"
                      stroke={isDark ? "#38bdf8" : "#0284c7"}
                      strokeWidth="1"
                      opacity={isDark ? "0.85" : "0.9"}
                    />

                    {/* 🪟 Kanat İçi Dikey Kayıtlar */}
                    {Array.from({ length: sVert }).map((_, svIdx) => {
                      const vStep = glassBoxW / (sVert + 1);
                      return (
                        <rect
                          key={`sv-${divIdx}-${svIdx}`}
                          x={startX + SASH_MARGIN + (svIdx + 1) * vStep - 4}
                          y={startY + SASH_MARGIN}
                          width={8}
                          height={glassBoxH}
                          fill={color.hex}
                          stroke={isDark ? "#1e293b" : "#475569"}
                          strokeWidth="0.5"
                        />
                      );
                    })}

                    {/* 🪟 Kanat İçi Yatay Kayıtlar */}
                    {Array.from({ length: sHoriz }).map((_, shIdx) => {
                      const hStep = glassBoxH / (sHoriz + 1);
                      return (
                        <rect
                          key={`sh-${divIdx}-${shIdx}`}
                          x={startX + SASH_MARGIN}
                          y={startY + SASH_MARGIN + (shIdx + 1) * hStep - 4}
                          width={glassBoxW}
                          height={8}
                          fill={color.hex}
                          stroke={isDark ? "#1e293b" : "#475569"}
                          strokeWidth="0.5"
                        />
                      );
                    })}

                    {/* Açılım Yönü Çizgileri */}
                    {(divType === "tek-acilim" || divType === "kapi-ic" || divType === "kapi-dis") && (
                      <path
                        d={`M ${startX + SASH_MARGIN} ${startY + SASH_MARGIN} L ${
                          startX + sectionW - SASH_MARGIN
                        } ${startY + sectionH / 2} L ${startX + SASH_MARGIN} ${
                          startY + sectionH - SASH_MARGIN
                        }`}
                        fill="none"
                        stroke={isDoor ? "#10b981" : "#f59e0b"}
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                    )}

                    {divType === "cift-acilim" && (
                      <>
                        <path
                          d={`M ${startX + SASH_MARGIN} ${startY + SASH_MARGIN} L ${
                            startX + sectionW - SASH_MARGIN
                          } ${startY + sectionH / 2} L ${startX + SASH_MARGIN} ${
                            startY + sectionH - SASH_MARGIN
                          }`}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                        <path
                          d={`M ${startX + SASH_MARGIN} ${startY + sectionH - SASH_MARGIN} L ${
                            startX + sectionW / 2
                          } ${startY + SASH_MARGIN} L ${
                            startX + sectionW - SASH_MARGIN
                          } ${startY + sectionH - SASH_MARGIN}`}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                      </>
                    )}

                    {divType === "vasistas" && (
                      <path
                        d={`M ${startX + SASH_MARGIN} ${startY + SASH_MARGIN} L ${
                          startX + sectionW / 2
                        } ${startY + sectionH - SASH_MARGIN} L ${
                          startX + sectionW - SASH_MARGIN
                        } ${startY + SASH_MARGIN}`}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                    )}

                    {/* Sürme Kayma Ok Çizgisi */}
                    {(isSliding || divType.includes("surme")) && (
                      <g transform={`translate(${startX + sectionW / 2 - 16}, ${startY + sectionH / 2 - 8})`}>
                        <rect x={0} y={0} width={32} height={16} rx={8} fill="#6366f1" opacity="0.9" />
                        <path d="M 6 8 L 12 4 L 12 12 Z" fill="#ffffff" />
                        <line x1="12" y1="8" x2="26" y2="8" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    )}
                  </g>
                );
              })
            )}

            {/* Isıcam Yansıma Gradyanı */}
            <defs>
              <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={isDark ? "#38bdf8" : "#bae6fd"}
                  stopOpacity={isDark ? "0.4" : "0.7"}
                />
                <stop
                  offset="50%"
                  stopColor={isDark ? "#0284c7" : "#7dd3fc"}
                  stopOpacity={isDark ? "0.2" : "0.5"}
                />
                <stop
                  offset="100%"
                  stopColor={isDark ? "#0369a1" : "#38bdf8"}
                  stopOpacity={isDark ? "0.5" : "0.8"}
                />
              </linearGradient>
            </defs>
          </svg>

          {/* İnteraktif Bölme ve Kanat İçi Kayıt Kontrol Panelleri */}
          <div
            className="absolute inset-0 grid pointer-events-none p-4"
            style={{
              gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
              gap: `${PROFILE_THICKNESS}px`,
            }}
          >
            {Array.from({ length: rowCount }).map((_, rIdx) =>
              Array.from({ length: colCount }).map((_, cIdx) => {
                const divIdx = rIdx * colCount + cIdx;
                const div = divisions[divIdx] || {
                  type: "sabit",
                  sashProfileType: "PENCERE_KANADI",
                  sashVerticalMullions: 0,
                  sashHorizontalMullions: 0,
                };
                const divType = div.type;

                return (
                  <div
                    key={`ctrl-${divIdx}`}
                    onClick={() => handleCellClick(divIdx)}
                    className={`pointer-events-auto flex flex-col items-center justify-center gap-1.5 p-1 transition rounded-lg ${
                      selectedCellIndex === divIdx ? "ring-2 ring-blue-500 bg-blue-500/10" : ""
                    }`}
                  >
                    <select
                      value={divType}
                      onChange={(e) =>
                        onUpdateDivisionType &&
                        onUpdateDivisionType(divIdx, e.target.value as any, div.sashProfileType)
                      }
                      className={`text-[10px] sm:text-[11px] font-semibold border rounded px-1.5 py-0.5 shadow-md focus:outline-none transition ${
                        isDark
                          ? "bg-slate-900/95 text-slate-200 border-slate-700 hover:border-cyan-500"
                          : "bg-white/95 text-slate-800 border-slate-300 hover:border-blue-500 shadow-slate-300/50"
                      }`}
                    >
                      <option value="sabit">🔒 Sabit</option>
                      <option value="tek-acilim">🪟 Pencere Tek Açılım</option>
                      <option value="cift-acilim">🔄 Pencere Çift Açılım</option>
                      <option value="vasistas">⬆️ Vasistas</option>
                      <option value="kapi-ic">🚪 Kapı (İçe Açılır)</option>
                      <option value="kapi-dis">🚪 Kapı (Dışa Açılır)</option>
                      <option value="surme-sol">↔️ Sürme (Sol Açılır)</option>
                      <option value="surme-sag">↔️ Sürme (Sağ Açılır)</option>
                    </select>

                    {/* Kanat İçi Orta Kayıt Butonları */}
                    {divType !== "sabit" && (
                      <div
                        className={`flex items-center gap-1 border rounded px-1 py-0.5 text-[9px] font-mono shadow ${
                          isDark
                            ? "bg-slate-900/90 border-slate-800 text-slate-300"
                            : "bg-white/95 border-slate-300 text-slate-800 shadow-slate-200"
                        }`}
                      >
                        <button
                          title="Kanat İçi Dikey Kayıt Arttır"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateSashMullions &&
                              onUpdateSashMullions(
                                divIdx,
                                (div.sashVerticalMullions || 0) + 1,
                                div.sashHorizontalMullions || 0
                              );
                          }}
                          className="hover:text-blue-600 font-bold"
                        >
                          +D ({div.sashVerticalMullions || 0})
                        </button>
                        <span>|</span>
                        <button
                          title="Kanat İçi Yatay Kayıt Arttır"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateSashMullions &&
                              onUpdateSashMullions(
                                divIdx,
                                div.sashVerticalMullions || 0,
                                (div.sashHorizontalMullions || 0) + 1
                              );
                          }}
                          className="hover:text-blue-600 font-bold"
                        >
                          +Y ({div.sashHorizontalMullions || 0})
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
