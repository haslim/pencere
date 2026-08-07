"use client";

import React, { useState } from "react";
import {
  WindowItem,
  DivisionType,
  SashProfileType,
  resolveMullionPositions,
} from "@/lib/pencereEngine";

export type WindowToolMode =
  | "select"
  | "v_mullion"
  | "h_mullion"
  | "tek_acilim"
  | "cift_acilim"
  | "kapi_kanadi"
  | "surme_kanat"
  | "surme_sabit"
  | "surme_cift"
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
  onAddCustomMullion?: (direction: "v" | "h", offset: number) => void;
  onEqualDistributeMullions?: (direction: "v" | "h" | "both") => void;
  onUpdateMullionPosition?: (direction: "v" | "h", index: number, newOffset: number) => void;
  onRemoveMullion?: (direction: "v" | "h", index: number) => void;
  isDark?: boolean;
}

export const WindowCanvas: React.FC<WindowCanvasProps> = ({
  item,
  onUpdateDivisionType,
  onUpdateSashMullions,
  onAddCustomMullion,
  onEqualDistributeMullions,
  onUpdateMullionPosition,
  onRemoveMullion,
  isDark = false,
}) => {

  const {
    width,
    height,
    color,
    verticalMullionsCount,
    horizontalMullionsCount,
    customVerticalMullions,
    customHorizontalMullions,
    divisions,
    systemType = "EGEPEN_ZENDOW" as any,
    kasaProfileType = "L_KASA",
  } = item;

  const isSurme = systemType === "EGEPEN_LEGEND_SLIDE" || systemType === "EGEPEN_HS76" || systemType === "SURME_SISTEM" || systemType === "HEBESCHIEBE";


  // Active Tool Mode & Modal States
  const [activeTool, setActiveTool] = useState<WindowToolMode>("select");

  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);

  // Kayıt Ekleme Modal State
  const [isAddMullionModalOpen, setIsAddMullionModalOpen] = useState<boolean>(false);
  const [mullionDirection, setMullionDirection] = useState<"v" | "h">("v");
  const [mullionOffsetInput, setMullionOffsetInput] = useState<string>("750");

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

  // Mutlak mm Konumları (Kasa Dışından)
  const vPositions = resolveMullionPositions(width, verticalMullionsCount, customVerticalMullions);
  const hPositions = resolveMullionPositions(height, horizontalMullionsCount, customHorizontalMullions);

  // SVG Tuvalindeki Ölçekli Konumlar
  const vPosCanvas = vPositions.map((p) => Math.round(p * scale));
  const hPosCanvas = hPositions.map((p) => Math.round(p * scale));

  // Kayıt Ekleme Butonuna Tıklandığında Modal Aç
  const handleOpenAddMullionModal = (direction: "v" | "h") => {
    setMullionDirection(direction);
    if (direction === "v") {
      setMullionOffsetInput(String(Math.round(width / 2)));
    } else {
      setMullionOffsetInput(String(Math.round(height / 2)));
    }
    setIsAddMullionModalOpen(true);
  };

  const handleConfirmAddMullion = () => {
    const offset = Number(mullionOffsetInput);
    if (!isNaN(offset) && offset !== 0) {
      if (onAddCustomMullion) {
        onAddCustomMullion(mullionDirection, offset);
      }
    }
    setIsAddMullionModalOpen(false);
  };

  // Cell Click Handler
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
    } else if ((activeTool as any) === "surme_sabit" && onUpdateDivisionType) {
      onUpdateDivisionType(divIdx, "surme-sabit", "SURME_KANAD");
    } else if ((activeTool as any) === "surme_cift" && onUpdateDivisionType) {
      onUpdateDivisionType(divIdx, "surme-cift", "SURME_KANAD");
    } else if (activeTool === "vasistas" && onUpdateDivisionType) {
      onUpdateDivisionType(divIdx, "vasistas", "VASISTAS");
    } else if (activeTool === "sabit" && onUpdateDivisionType) {
      onUpdateDivisionType(divIdx, "sabit", "PENCERE_KANADI");
    } else if (activeTool === "v_mullion") {
      handleOpenAddMullionModal("v");
    } else if (activeTool === "h_mullion") {
      handleOpenAddMullionModal("h");
    }
  };


  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* 🛠️ CAD ÇİZİM ARAÇ ÇUBUĞU (MODE RIBBON TOOLBAR) */}
      <div
        className={`w-full p-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 shadow-sm transition-colors ${
          isDark
            ? "bg-slate-950/80 border-slate-800 text-slate-200"
            : "bg-slate-50 border-slate-200/90 text-slate-800"
        }`}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-xs font-bold px-2 flex items-center gap-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            🛠️ Çizim Araçları:
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
            onClick={() => setActiveTool(activeTool === "v_mullion" ? "select" : "v_mullion")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
              activeTool === "v_mullion"
                ? "bg-cyan-600 text-white border-cyan-600 shadow"
                : isDark
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-cyan-400"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-blue-700"
            }`}
          >
            ╍ +Dikey Kayıt (Tıkla & Konumlandır)
          </button>

          <button
            onClick={() => setActiveTool(activeTool === "h_mullion" ? "select" : "h_mullion")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
              activeTool === "h_mullion"
                ? "bg-cyan-600 text-white border-cyan-600 shadow"
                : isDark
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-cyan-400"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-blue-700"
            }`}
          >
            ➖ +Yatay Kayıt (Tıkla & Konumlandır)
          </button>


          <button
            onClick={() => onEqualDistributeMullions && onEqualDistributeMullions("both")}
            className="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800"
          >
            ⚖️ Eşit Dağıt
          </button>

          {/* Standart Doğrama Serileri İçin Pencere & Kapı Kanat Araçları */}
          {!isSurme && (
            <>
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
            </>
          )}

          {/* Yalnızca Sürme Serilerinde (Egepen Legend Slide / HS 76) Görünen Sürme Araçları */}
          {isSurme && (
            <>
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
                ↔️ Hareketli Sürme
              </button>

              <button
                onClick={() => setActiveTool("surme_sabit" as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
                  (activeTool as any) === "surme_sabit"
                    ? "bg-cyan-600 text-white border-cyan-600 shadow"
                    : isDark
                    ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-cyan-400"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-cyan-700"
                }`}
              >
                🔒 Sabit Sürme (Fix)
              </button>

              <button
                onClick={() => setActiveTool("surme_cift" as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap border ${
                  (activeTool as any) === "surme_cift"
                    ? "bg-purple-600 text-white border-purple-600 shadow"
                    : isDark
                    ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-purple-400"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-purple-700"
                }`}
              >
                ↔️↔️ Çiftli Sürme
              </button>
            </>
          )}



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
          <svg
            width={canvasW}
            height={canvasH}
            className="w-full h-full"
            onClick={(e) => {
              if (activeTool === "v_mullion" || activeTool === "h_mullion") {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                if (activeTool === "v_mullion") {
                  const clickedMM = Math.round(clickX / scale);
                  if (clickedMM > 60 && clickedMM < width - 60) {
                    onAddCustomMullion?.("v", clickedMM);
                  }
                } else if (activeTool === "h_mullion") {
                  const clickedMM = Math.round(clickY / scale);
                  if (clickedMM > 60 && clickedMM < height - 60) {
                    onAddCustomMullion?.("h", clickedMM);
                  }
                }
              }
            }}
          >

            {/* Dış Kasa Çerçevesi */}
            <rect
              x={0}
              y={0}
              width={canvasW}
              height={canvasH}
              fill={color.hex}
              stroke={isDark ? "#000" : "#334155"}
              strokeWidth={kasaProfileType === "Z_KASA" ? "4" : "2"}
            />

            {/* Alüminyum Eşikli Kapı Kasası */}
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

            {/* Kasa İç Boşluğu */}
            <rect
              x={PROFILE_THICKNESS}
              y={PROFILE_THICKNESS}
              width={innerCanvasW}
              height={innerCanvasH - (kasaProfileType === "ESIKLI_KASA" ? 4 : 0)}
              fill={isDark ? "#061826" : "#e0f2fe"}
            />

            {/* 📏 Hassas Konumlandırılmış Dikey Orta Kayıtlar */}
            {vPositions.map((vPosMM, vIdx) => {
              const xPosCanvas = Math.round(vPosMM * scale) - PROFILE_THICKNESS / 2;
              return (
                <g key={`v-mullion-${vIdx}`}>
                  <rect
                    x={xPosCanvas}
                    y={PROFILE_THICKNESS}
                    width={PROFILE_THICKNESS}
                    height={innerCanvasH}
                    fill={color.hex}
                    stroke={isDark ? "#38bdf8" : "#2563eb"}
                    strokeWidth="1.5"
                  />
                  {/* Düzenlenebilir Mesafe Etiketi (Soldan mm) */}
                  <g
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      const val = prompt(`Dikey Kayıt ${vIdx + 1} İçin Soldan Yeni MM Mesafesini Girin:`, String(vPosMM));
                      if (val) {
                        const num = Number(val);
                        if (!isNaN(num) && num > 50 && num < width - 50) {
                          onUpdateMullionPosition?.("v", vIdx, num);
                        }
                      }
                    }}
                  >
                    <rect
                      x={xPosCanvas - 20}
                      y={PROFILE_THICKNESS + 4}
                      width={PROFILE_THICKNESS + 40}
                      height={18}
                      rx="4"
                      fill={isDark ? "#0f172a" : "#ffffff"}
                      stroke={isDark ? "#38bdf8" : "#2563eb"}
                      strokeWidth="1"
                    />
                    <text
                      x={xPosCanvas + PROFILE_THICKNESS / 2}
                      y={PROFILE_THICKNESS + 16}
                      textAnchor="middle"
                      fill={isDark ? "#38bdf8" : "#1e40af"}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ✏️ {vPosMM}mm
                    </text>
                  </g>
                </g>
              );
            })}

            {/* 📏 Hassas Konumlandırılmış Yatay Orta Kayıtlar */}
            {hPositions.map((hPosMM, hIdx) => {
              const yPosCanvas = Math.round(hPosMM * scale) - PROFILE_THICKNESS / 2;
              return (
                <g key={`h-mullion-${hIdx}`}>
                  <rect
                    x={PROFILE_THICKNESS}
                    y={yPosCanvas}
                    width={innerCanvasW}
                    height={PROFILE_THICKNESS}
                    fill={color.hex}
                    stroke={isDark ? "#38bdf8" : "#2563eb"}
                    strokeWidth="1.5"
                  />
                  {/* Düzenlenebilir Mesafe Etiketi (Üstten mm) */}
                  <g
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      const val = prompt(`Yatay Kayıt ${hIdx + 1} İçin Üstten Yeni MM Mesafesini Girin:`, String(hPosMM));
                      if (val) {
                        const num = Number(val);
                        if (!isNaN(num) && num > 50 && num < height - 50) {
                          onUpdateMullionPosition?.("h", hIdx, num);
                        }
                      }
                    }}
                  >
                    <rect
                      x={PROFILE_THICKNESS + 4}
                      y={yPosCanvas - 9}
                      width={55}
                      height={18}
                      rx="4"
                      fill={isDark ? "#0f172a" : "#ffffff"}
                      stroke={isDark ? "#38bdf8" : "#2563eb"}
                      strokeWidth="1"
                    />
                    <text
                      x={PROFILE_THICKNESS + 31}
                      y={yPosCanvas + 3}
                      textAnchor="middle"
                      fill={isDark ? "#38bdf8" : "#1e40af"}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ✏️ {hPosMM}mm
                    </text>
                  </g>
                </g>
              );
            })}


            {/* Bölme Detayları ve Camlar (Hassas Konumlu) */}
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

                const colLeftMM = cIdx === 0 ? 60 : vPositions[cIdx - 1] + 30;
                const colRightMM = cIdx === verticalMullionsCount ? width - 60 : vPositions[cIdx] - 30;
                const secWMM = colRightMM - colLeftMM;

                const rowTopMM = rIdx === 0 ? 60 : hPositions[rIdx - 1] + 30;
                const rowBottomMM = rIdx === horizontalMullionsCount ? height - 60 : hPositions[rIdx] - 30;
                const secHMM = rowBottomMM - rowTopMM;

                const startX = Math.round(colLeftMM * scale);
                const startY = Math.round(rowTopMM * scale);
                const sectionW = Math.round(secWMM * scale);
                const sectionH = Math.round(secHMM * scale);

                const isDoor = sashProf === "KAPI_KANADI" || divType.includes("kapi");
                const isSliding = sashProf === "SURME_KANAD" || divType.includes("surme");

                const SASH_MARGIN = divType === "sabit" ? 4 : isDoor ? 12 : 8;

                const sVert = div.sashVerticalMullions || 0;
                const sHoriz = div.sashHorizontalMullions || 0;

                const glassBoxW = Math.max(10, sectionW - SASH_MARGIN * 2);
                const glassBoxH = Math.max(10, sectionH - SASH_MARGIN * 2);

                return (
                  <g key={`div-${divIdx}`} onClick={() => handleCellClick(divIdx)} className="cursor-pointer">
                    {/* Kanat Çerçevesi */}
                    {divType !== "sabit" && (
                      <rect
                        x={startX + 3}
                        y={startY + 3}
                        width={Math.max(10, sectionW - 6)}
                        height={Math.max(10, sectionH - 6)}
                        fill={color.hex}
                        stroke={isDoor ? "#0f172a" : isDark ? "#0f172a" : "#334155"}
                        strokeWidth={isDoor ? "3" : "1.5"}
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

                    {/* Cam Üzerinde Net En x Boy Etiketi */}
                    <text
                      x={startX + sectionW / 2}
                      y={startY + sectionH / 2}
                      textAnchor="middle"
                      fill={isDark ? "#ffffff" : "#0f172a"}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {Math.round(secWMM)}x{Math.round(secHMM)}
                    </text>

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

                    {/* Sürme Görsel Çizgileri & Simgeleri */}

                    {(divType === "surme-sol" || divType === "surme-sag") && (
                      <path
                        d={`M ${startX + 12} ${startY + sectionH / 2} L ${startX + sectionW - 12} ${startY + sectionH / 2} M ${startX + (divType === "surme-sol" ? 20 : sectionW - 20)} ${startY + sectionH / 2 - 5} L ${startX + (divType === "surme-sol" ? 12 : sectionW - 12)} ${startY + sectionH / 2} L ${startX + (divType === "surme-sol" ? 20 : sectionW - 20)} ${startY + sectionH / 2 + 5}`}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                      />
                    )}

                    {divType === "surme-sabit" && (
                      <text
                        x={startX + sectionW / 2}
                        y={startY + 22}
                        textAnchor="middle"
                        fill={isDark ? "#38bdf8" : "#0284c7"}
                        fontSize="11"
                        fontWeight="bold"
                      >
                        🔒 SABİT SÜRME (FIX)
                      </text>
                    )}

                    {divType === "surme-cift" && (
                      <g>
                        <path
                          d={`M ${startX + 12} ${startY + sectionH / 2 - 4} L ${startX + sectionW - 12} ${startY + sectionH / 2 - 4} M ${startX + 20} ${startY + sectionH / 2 - 9} L ${startX + 12} ${startY + sectionH / 2 - 4} L ${startX + 20} ${startY + sectionH / 2 + 1}`}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="2"
                        />
                        <path
                          d={`M ${startX + 12} ${startY + sectionH / 2 + 6} L ${startX + sectionW - 12} ${startY + sectionH / 2 + 6} M ${startX + sectionW - 20} ${startY + sectionH / 2 + 1} L ${startX + sectionW - 12} ${startY + sectionH / 2 + 6} L ${startX + sectionW - 20} ${startY + sectionH / 2 + 11}`}
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="2"
                        />
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
            className="absolute inset-0 pointer-events-none"
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

                const colLeftMM = cIdx === 0 ? 60 : vPositions[cIdx - 1] + 30;
                const rowTopMM = rIdx === 0 ? 60 : hPositions[rIdx - 1] + 30;
                const colRightMM = cIdx === verticalMullionsCount ? width - 60 : vPositions[cIdx] - 30;
                const rowBottomMM = rIdx === horizontalMullionsCount ? height - 60 : hPositions[rIdx] - 30;

                const startX = Math.round(colLeftMM * scale);
                const startY = Math.round(rowTopMM * scale);
                const sectionW = Math.round((colRightMM - colLeftMM) * scale);
                const sectionH = Math.round((rowBottomMM - rowTopMM) * scale);

                return (
                  <div
                    key={`ctrl-${divIdx}`}
                    onClick={() => handleCellClick(divIdx)}
                    style={{
                      position: "absolute",
                      left: `${startX}px`,
                      top: `${startY}px`,
                      width: `${sectionW}px`,
                      height: `${sectionH}px`,
                    }}
                    className={`pointer-events-auto flex flex-col items-center justify-center gap-1 p-1 transition rounded-lg ${
                      selectedCellIndex === divIdx ? "ring-2 ring-blue-500 bg-blue-500/10" : ""
                    }`}
                  >
                    <select
                      value={divType}
                      onChange={(e) =>
                        onUpdateDivisionType &&
                        onUpdateDivisionType(divIdx, e.target.value as any, div.sashProfileType)
                      }
                      className={`text-[10px] font-semibold border rounded px-1 py-0.5 shadow-md focus:outline-none transition ${
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

      {/* 📍 KAYIT EKLEME & KONUMLANDIRMA DİALOGU */}
      {isAddMullionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                📏 {mullionDirection === "v" ? "Dikey Kayıt Konumu" : "Yatay Kayıt Konumu"} Ekle
              </h3>
              <button
                onClick={() => setIsAddMullionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full w-7 h-7 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                {mullionDirection === "v" ? "Soldan veya Sağdan Mesafe (mm)" : "Üstten veya Alttan Mesafe (mm)"}
              </label>
              <input
                type="number"
                value={mullionOffsetInput}
                onChange={(e) => setMullionOffsetInput(e.target.value)}
                placeholder={mullionDirection === "v" ? "ör. 750 veya -450" : "ör. 450 veya -500"}
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-base font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-500 shadow-sm"
              />

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-1">
                <p className="font-bold">💡 ERCOM Konumlandırma Kuralları:</p>
                <p>• <b>Pozitif Değer (örn: 750)</b>: {mullionDirection === "v" ? "SOLDAN" : "ÜSTTEN"} olan mesafedir.</p>
                <p>• <b>Negatif Değer (örn: -450)</b>: {mullionDirection === "v" ? "SAĞDAN" : "ALTTAN"} olan mesafedir.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onEqualDistributeMullions) {
                    onEqualDistributeMullions(mullionDirection);
                  }
                  setIsAddMullionModalOpen(false);
                }}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                ⚖️ Eşit Dağıt
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMullionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddMullion}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20"
                >
                  ➕ Konuma Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
