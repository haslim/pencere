"use client";

import React from "react";
import { WindowItem } from "@/lib/pencereEngine";

interface WindowCanvasProps {
  item: WindowItem;
  onUpdateDivisionType?: (index: number, type: "sabit" | "tek-acilim" | "cift-acilim" | "vasistas") => void;
}

export const WindowCanvas: React.FC<WindowCanvasProps> = ({ item, onUpdateDivisionType }) => {
  const { width, height, color, mullionsCount, divisions } = item;

  // Tuval Canvas ölçekleme (Gen: 500px maks, Boy: 400px maks)
  const maxCanvasW = 500;
  const maxCanvasH = 380;

  const scale = Math.min(maxCanvasW / width, maxCanvasH / height);
  const canvasW = Math.round(width * scale);
  const canvasH = Math.round(height * scale);

  const PROFILE_THICKNESS = Math.max(14, Math.round(18 * scale * 4));
  const divisionCount = mullionsCount + 1;
  const sectionW = (canvasW - PROFILE_THICKNESS * 2 - (mullionsCount * PROFILE_THICKNESS)) / divisionCount;
  const innerH = canvasH - PROFILE_THICKNESS * 2;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl relative select-none">
      {/* Üst Ölçü Ok Çizgisi (Genişlik) */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-cyan-400 mb-2 px-2">
        <div className="h-2 w-px bg-cyan-500" />
        <div className="flex-1 h-px bg-cyan-500/50 flex items-center justify-center">
          <span className="bg-slate-900 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-bold">
            W: {width} mm
          </span>
        </div>
        <div className="h-2 w-px bg-cyan-500" />
      </div>

      <div className="flex items-center">
        {/* Sol Ölçü Ok Çizgisi (Yükseklik) */}
        <div className="h-full flex flex-col items-center justify-between text-xs font-mono text-cyan-400 mr-2 py-2">
          <div className="w-2 h-px bg-cyan-500" />
          <div className="flex-1 w-px bg-cyan-500/50 flex items-center justify-center">
            <span className="bg-slate-900 px-1 py-1 rounded border border-cyan-500/30 text-cyan-300 font-bold -rotate-90 whitespace-nowrap">
              H: {height} mm
            </span>
          </div>
          <div className="w-2 h-px bg-cyan-500" />
        </div>

        {/* Dynamic SVG Window Canvas */}
        <div
          style={{ width: canvasW, height: canvasH }}
          className="relative rounded shadow-inner overflow-hidden border border-slate-700/60"
        >
          <svg width={canvasW} height={canvasH} className="w-full h-full">
            {/* Dış Kasa Çerçevesi */}
            <rect
              x={0}
              y={0}
              width={canvasW}
              height={canvasH}
              fill={color.hex}
              stroke="#000"
              strokeWidth="2"
            />
            {/* Kasa İç Boşluğu */}
            <rect
              x={PROFILE_THICKNESS}
              y={PROFILE_THICKNESS}
              width={canvasW - PROFILE_THICKNESS * 2}
              height={canvasH - PROFILE_THICKNESS * 2}
              fill="#061826"
            />

            {/* Orta Kayıtlar */}
            {Array.from({ length: mullionsCount }).map((_, idx) => {
              const xPos = PROFILE_THICKNESS + (idx + 1) * sectionW + idx * PROFILE_THICKNESS;
              return (
                <rect
                  key={`mullion-${idx}`}
                  x={xPos}
                  y={PROFILE_THICKNESS}
                  width={PROFILE_THICKNESS}
                  height={innerH}
                  fill={color.hex}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              );
            })}

            {/* Bölme Detayları & Camlar */}
            {Array.from({ length: divisionCount }).map((_, idx) => {
              const divType = divisions[idx]?.type || "sabit";
              const startX = PROFILE_THICKNESS + idx * (sectionW + PROFILE_THICKNESS);
              const SASH_MARGIN = divType === "sabit" ? 4 : 12;

              return (
                <g key={`division-${idx}`}>
                  {/* Kanat Çerçevesi (Açılırsa) */}
                  {divType !== "sabit" && (
                    <rect
                      x={startX + 4}
                      y={PROFILE_THICKNESS + 4}
                      width={sectionW - 8}
                      height={innerH - 8}
                      fill={color.hex}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                      rx="2"
                    />
                  )}

                  {/* Isıcam Cam Alanı */}
                  <rect
                    x={startX + SASH_MARGIN}
                    y={PROFILE_THICKNESS + SASH_MARGIN}
                    width={sectionW - SASH_MARGIN * 2}
                    height={innerH - SASH_MARGIN * 2}
                    fill="url(#glassGradient)"
                    stroke="#38bdf8"
                    strokeWidth="1"
                    opacity="0.85"
                  />

                  {/* Açılım Yönü Çizgileri (Kesikli Çizgiler) */}
                  {divType === "tek-acilim" && (
                    <path
                      d={`M ${startX + SASH_MARGIN} ${PROFILE_THICKNESS + SASH_MARGIN} L ${
                        startX + sectionW - SASH_MARGIN
                      } ${PROFILE_THICKNESS + innerH / 2} L ${startX + SASH_MARGIN} ${
                        PROFILE_THICKNESS + innerH - SASH_MARGIN
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
                        d={`M ${startX + SASH_MARGIN} ${PROFILE_THICKNESS + SASH_MARGIN} L ${
                          startX + sectionW - SASH_MARGIN
                        } ${PROFILE_THICKNESS + innerH / 2} L ${startX + SASH_MARGIN} ${
                          PROFILE_THICKNESS + innerH - SASH_MARGIN
                        }`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                      <path
                        d={`M ${startX + SASH_MARGIN} ${PROFILE_THICKNESS + innerH - SASH_MARGIN} L ${
                          startX + sectionW / 2
                        } ${PROFILE_THICKNESS + SASH_MARGIN} L ${
                          startX + sectionW - SASH_MARGIN
                        } ${PROFILE_THICKNESS + innerH - SASH_MARGIN}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                    </>
                  )}

                  {divType === "vasistas" && (
                    <path
                      d={`M ${startX + SASH_MARGIN} ${PROFILE_THICKNESS + SASH_MARGIN} L ${
                        startX + sectionW / 2
                      } ${PROFILE_THICKNESS + innerH - SASH_MARGIN} L ${
                        startX + sectionW - SASH_MARGIN
                      } ${PROFILE_THICKNESS + SASH_MARGIN}`}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                  )}
                </g>
              );
            })}

            {/* Isıcam Yansıma Gradyanı */}
            <defs>
              <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Bölme Tipi Değiştirme Butonları (İnteraktif Kontrol) */}
          <div className="absolute inset-0 flex items-center justify-around pointer-events-none px-4">
            {Array.from({ length: divisionCount }).map((_, idx) => {
              const divType = divisions[idx]?.type || "sabit";
              return (
                <div key={`btn-div-${idx}`} className="pointer-events-auto flex flex-col items-center gap-1">
                  <select
                    value={divType}
                    onChange={(e) =>
                      onUpdateDivisionType &&
                      onUpdateDivisionType(idx, e.target.value as any)
                    }
                    className="bg-slate-900/90 text-xs font-semibold text-slate-200 border border-slate-700 rounded-md px-2 py-1 shadow-lg hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="sabit">🔒 Sabit</option>
                    <option value="tek-acilim">🪟 Tek Açılım</option>
                    <option value="cift-acilim">🔄 Çift Açılım</option>
                    <option value="vasistas">⬆️ Vasistas</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
