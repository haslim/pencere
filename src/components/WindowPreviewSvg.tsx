"use client";

import React from "react";
import { WindowItem, resolveMullionPositions } from "@/lib/pencereEngine";

interface WindowPreviewSvgProps {
  item: WindowItem;
  maxW?: number;
  maxH?: number;
}

export const WindowPreviewSvg: React.FC<WindowPreviewSvgProps> = ({
  item,
  maxW = 160,
  maxH = 140,
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
  } = item;

  // Scale computation
  const scale = Math.min(maxW / width, maxH / height);
  const canvasW = Math.round(width * scale);
  const canvasH = Math.round(height * scale);
  const profileThick = Math.max(3, Math.round(8 * (scale > 0.1 ? scale * 3 : 1)));

  const innerW = canvasW - profileThick * 2;
  const innerH = canvasH - profileThick * 2;

  const vPositions = resolveMullionPositions(width, verticalMullionsCount, customVerticalMullions);
  const hPositions = resolveMullionPositions(height, horizontalMullionsCount, customHorizontalMullions);

  const colCount = verticalMullionsCount + 1;
  const rowCount = horizontalMullionsCount + 1;

  // Grid bounds computation
  const xBounds = [0, ...vPositions.map((p) => Math.round(p * scale)), canvasW];
  const yBounds = [0, ...hPositions.map((p) => Math.round(p * scale)), canvasH];

  const profileColor = color?.hex || "#334155";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        style={{ width: canvasW, height: canvasH }}
        className="relative bg-sky-100/60 border border-slate-300 rounded shadow-xs overflow-hidden flex-shrink-0"
      >
        <svg width={canvasW} height={canvasH} className="w-full h-full">
          {/* Dış Kasa Çerçevesi */}
          <rect
            x="0"
            y="0"
            width={canvasW}
            height={canvasH}
            fill="none"
            stroke={profileColor}
            strokeWidth={profileThick * 2}
          />

          {/* Dikey Kayıtlar */}
          {vPositions.map((posMM, idx) => {
            const xPos = Math.round(posMM * scale);
            return (
              <line
                key={`v-${idx}`}
                x1={xPos}
                y1={0}
                x2={xPos}
                y2={canvasH}
                stroke={profileColor}
                strokeWidth={profileThick}
              />
            );
          })}

          {/* Yatay Kayıtlar */}
          {hPositions.map((posMM, idx) => {
            const yPos = Math.round(posMM * scale);
            return (
              <line
                key={`h-${idx}`}
                x1={0}
                y1={yPos}
                x2={canvasW}
                y2={yPos}
                stroke={profileColor}
                strokeWidth={profileThick}
              />
            );
          })}

          {/* Bölmeler (Kanatlar & Açılım Çizgileri) */}
          {Array.from({ length: rowCount }).map((_, rIdx) =>
            Array.from({ length: colCount }).map((_, cIdx) => {
              const divIdx = rIdx * colCount + cIdx;
              const div = divisions[divIdx] || { type: "sabit" };

              const startX = xBounds[cIdx];
              const endX = xBounds[cIdx + 1];
              const startY = yBounds[rIdx];
              const endY = yBounds[rIdx + 1];

              const cellW = endX - startX;
              const cellH = endY - startY;

              const inset = Math.max(2, Math.round(profileThick * 0.8));
              const sashX = startX + inset;
              const sashY = startY + inset;
              const sashW = cellW - inset * 2;
              const sashH = cellH - inset * 2;

              if (sashW <= 0 || sashH <= 0) return null;

              const isAcilir =
                div.type === "tek-acilim" ||
                div.type === "cift-acilim" ||
                div.type === "kapi-ic" ||
                div.type === "vasistas" ||
                div.type?.startsWith("surme");

              return (
                <g key={`cell-${divIdx}`}>
                  {/* Glass background fill */}
                  <rect
                    x={startX}
                    y={startY}
                    width={cellW}
                    height={cellH}
                    fill="#e0f2fe"
                    opacity="0.7"
                  />

                  {/* Kanat Çerçevesi */}
                  {isAcilir && (
                    <rect
                      x={sashX}
                      y={sashY}
                      width={sashW}
                      height={sashH}
                      fill="none"
                      stroke={profileColor}
                      strokeWidth={inset}
                    />
                  )}

                  {/* Kanat İçi Dikey Kayıtlar */}
                  {isAcilir && div.sashVerticalMullions && div.sashVerticalMullions > 0 ? (
                    Array.from({ length: div.sashVerticalMullions }).map((_, svIdx) => {
                      const stepX = sashW / (div.sashVerticalMullions + 1);
                      const svPos = sashX + stepX * (svIdx + 1);
                      return (
                        <line
                          key={`sv-${svIdx}`}
                          x1={svPos}
                          y1={sashY}
                          x2={svPos}
                          y2={sashY + sashH}
                          stroke={profileColor}
                          strokeWidth={Math.max(1.5, inset * 0.8)}
                        />
                      );
                    })
                  ) : null}

                  {/* Kanat İçi Yatay Kayıtlar */}
                  {isAcilir && div.sashHorizontalMullions && div.sashHorizontalMullions > 0 ? (
                    Array.from({ length: div.sashHorizontalMullions }).map((_, shIdx) => {
                      const stepY = sashH / (div.sashHorizontalMullions + 1);
                      const shPos = sashY + stepY * (shIdx + 1);
                      return (
                        <line
                          key={`sh-${shIdx}`}
                          x1={sashX}
                          y1={shPos}
                          x2={sashX + sashW}
                          y2={shPos}
                          stroke={profileColor}
                          strokeWidth={Math.max(1.5, inset * 0.8)}
                        />
                      );
                    })
                  ) : null}

                  {/* Açılım Kesikli Çizgileri (DIN Sağ / Sol Açılım) */}
                  {(div.type === "tek-acilim" || div.type === "cift-acilim") && (
                    <g stroke="#2563eb" strokeWidth="1" strokeDasharray="3,3" opacity="0.8">
                      {/* Sol Menteşe Sol Yan Çizgiler */}
                      <line x1={sashX} y1={sashY} x2={sashX + sashW} y2={sashY + sashH / 2} />
                      <line x1={sashX} y1={sashY + sashH} x2={sashX + sashW} y2={sashY + sashH / 2} />

                      {/* Çift Açılım ise Vasistas Üst Çizgiler */}
                      {div.type === "cift-acilim" && (
                        <>
                          <line x1={sashX} y1={sashY + sashH} x2={sashX + sashW / 2} y2={sashY} />
                          <line x1={sashX + sashW} y1={sashY + sashH} x2={sashX + sashW / 2} y2={sashY} />
                        </>
                      )}
                    </g>
                  )}

                  {div.type === "vasistas" && (
                    <g stroke="#2563eb" strokeWidth="1" strokeDasharray="3,3" opacity="0.8">
                      <line x1={sashX} y1={sashY + sashH} x2={sashX + sashW / 2} y2={sashY} />
                      <line x1={sashX + sashW} y1={sashY + sashH} x2={sashX + sashW / 2} y2={sashY} />
                    </g>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>
      <span className="text-[10px] font-mono text-slate-500 font-bold">
        {width} x {height} mm
      </span>
    </div>
  );
};
