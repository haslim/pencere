"use client";

import React from "react";
import { WindowItem } from "@/lib/pencereEngine";

interface WindowCanvasProps {
  item: WindowItem;
  onUpdateDivisionType?: (
    index: number,
    type: "sabit" | "tek-acilim" | "cift-acilim" | "vasistas"
  ) => void;
  onUpdateSashMullions?: (
    index: number,
    vMullions: number,
    hMullions: number
  ) => void;
  isDark?: boolean;
}

export const WindowCanvas: React.FC<WindowCanvasProps> = ({
  item,
  onUpdateDivisionType,
  onUpdateSashMullions,
  isDark = false,
}) => {
  const {
    width,
    height,
    color,
    verticalMullionsCount,
    horizontalMullionsCount,
    divisions,
  } = item;

  const [maxCanvasW, setMaxCanvasW] = React.useState<number>(540);
  const [maxCanvasH, setMaxCanvasH] = React.useState<number>(400);

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

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all select-none relative w-full ${
        isDark
          ? "bg-slate-950 border-slate-800 shadow-2xl"
          : "bg-slate-50/90 border-slate-200/80 shadow-md"
      }`}
    >
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
            {/* Dış Kasa Çerçevesi */}
            <rect
              x={0}
              y={0}
              width={canvasW}
              height={canvasH}
              fill={color.hex}
              stroke={isDark ? "#000" : "#475569"}
              strokeWidth="2"
            />
            {/* Kasa İç Boşluğu (Cam Arkası Fon Rengi) */}
            <rect
              x={PROFILE_THICKNESS}
              y={PROFILE_THICKNESS}
              width={innerCanvasW}
              height={innerCanvasH}
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
                  sashVerticalMullions: 0,
                  sashHorizontalMullions: 0,
                };
                const divType = div.type;

                const startX =
                  PROFILE_THICKNESS + cIdx * (sectionW + PROFILE_THICKNESS);
                const startY =
                  PROFILE_THICKNESS + rIdx * (sectionH + PROFILE_THICKNESS);

                const SASH_MARGIN = divType === "sabit" ? 4 : 12;

                const sVert = div.sashVerticalMullions || 0;
                const sHoriz = div.sashHorizontalMullions || 0;

                const glassBoxW = sectionW - SASH_MARGIN * 2;
                const glassBoxH = sectionH - SASH_MARGIN * 2;

                return (
                  <g key={`div-${divIdx}`}>
                    {/* Kanat Çerçevesi (Açılırsa) */}
                    {divType !== "sabit" && (
                      <rect
                        x={startX + 4}
                        y={startY + 4}
                        width={sectionW - 8}
                        height={sectionH - 8}
                        fill={color.hex}
                        stroke={isDark ? "#0f172a" : "#334155"}
                        strokeWidth="1.5"
                        rx="2"
                      />
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
                    {divType === "tek-acilim" && (
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
                  sashVerticalMullions: 0,
                  sashHorizontalMullions: 0,
                };
                const divType = div.type;

                return (
                  <div
                    key={`ctrl-${divIdx}`}
                    className="pointer-events-auto flex flex-col items-center justify-center gap-1.5 p-1"
                  >
                    <select
                      value={divType}
                      onChange={(e) =>
                        onUpdateDivisionType &&
                        onUpdateDivisionType(divIdx, e.target.value as any)
                      }
                      className={`text-[11px] font-semibold border rounded px-1.5 py-0.5 shadow-md focus:outline-none transition ${
                        isDark
                          ? "bg-slate-900/90 text-slate-200 border-slate-700 hover:border-cyan-500"
                          : "bg-white/95 text-slate-800 border-slate-300 hover:border-blue-500 shadow-slate-300/50"
                      }`}
                    >
                      <option value="sabit">🔒 Sabit</option>
                      <option value="tek-acilim">🪟 Tek Açılım</option>
                      <option value="cift-acilim">🔄 Çift Açılım</option>
                      <option value="vasistas">⬆️ Vasistas</option>
                    </select>

                    {/* Kanat İçi Orta Kayıt Ekleme Butonları */}
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
                          onClick={() =>
                            onUpdateSashMullions &&
                            onUpdateSashMullions(
                              divIdx,
                              (div.sashVerticalMullions || 0) + 1,
                              div.sashHorizontalMullions || 0
                            )
                          }
                          className="hover:text-blue-600 font-bold"
                        >
                          +D ({div.sashVerticalMullions || 0})
                        </button>
                        <span>|</span>
                        <button
                          title="Kanat İçi Yatay Kayıt Arttır"
                          onClick={() =>
                            onUpdateSashMullions &&
                            onUpdateSashMullions(
                              divIdx,
                              div.sashVerticalMullions || 0,
                              (div.sashHorizontalMullions || 0) + 1
                            )
                          }
                          className="hover:text-blue-600 font-bold"
                        >
                          +Y ({div.sashHorizontalMullions || 0})
                        </button>
                        {(div.sashVerticalMullions > 0 ||
                          div.sashHorizontalMullions > 0) && (
                          <button
                            title="Sıfırla"
                            onClick={() =>
                              onUpdateSashMullions &&
                              onUpdateSashMullions(divIdx, 0, 0)
                            }
                            className="text-amber-600 font-bold ml-0.5"
                          >
                            ✕
                          </button>
                        )}
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
