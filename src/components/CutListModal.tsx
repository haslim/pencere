"use client";

import React from "react";
import { CutPiece, OptimizationStock } from "@/lib/pencereEngine";

interface CutListModalProps {
  isOpen: boolean;
  onClose: () => void;
  cutPieces: CutPiece[];
  optimizedBars: OptimizationStock[];
}

export const CutListModal: React.FC<CutListModalProps> = ({
  isOpen,
  onClose,
  cutPieces,
  optimizedBars,
}) => {
  if (!isOpen) return null;

  const totalWaste = optimizedBars.reduce((sum, b) => sum + b.wasteLength, 0);
  const totalBarCount = optimizedBars.length;
  const wastePercentage = Number(
    ((totalWaste / (totalBarCount * 6000)) * 100).toFixed(1)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              ✂️ 1D Kesim & Optimizasyon Raporu
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sistem SaaS 1D Optimizasyon Algoritması ile Minimum Fire Hesaplaması
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block font-medium">
                Gerekli 6 Metre Boy Sayısı
              </span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block">
                {totalBarCount} Adet Boy ({(totalBarCount * 6).toFixed(0)}m)
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block font-medium">
                Toplam Fire Miktarı
              </span>
              <span className="text-2xl font-bold text-amber-600 mt-1 block">
                {(totalWaste / 1000).toFixed(2)} Metre
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block font-medium">
                Verimlilik / Fire Oranı
              </span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                %{100 - wastePercentage} Verim (%{wastePercentage} Fire)
              </span>
            </div>
          </div>

          {/* 1D Profil Çubuk Kesim Şeması */}
          <div>
            <h3 className="text-md font-semibold text-slate-900 mb-3 flex items-center gap-2">
              📊 6 Metre Profil Kesim Dizilim Görseli
            </h3>
            <div className="space-y-4">
              {optimizedBars.map((bar, barIdx) => (
                <div
                  key={`bar-${barIdx}`}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span>
                      PROFİL BOYU #{barIdx + 1} (6000 mm)
                    </span>
                    <span className="text-emerald-600 font-bold">
                      Kullanılan: {bar.usedLength} mm | Fire: {bar.wasteLength} mm
                    </span>
                  </div>

                  {/* Görsel Bar */}
                  <div className="h-8 w-full bg-slate-200 rounded-lg overflow-hidden flex border border-slate-300 p-0.5">
                    {bar.cuts.map((cut, cutIdx) => {
                      const widthPercent = (cut.length / 6000) * 100;
                      return (
                        <div
                          key={`cut-${barIdx}-${cutIdx}`}
                          style={{ width: `${widthPercent}%` }}
                          className="h-full bg-blue-600 border-r border-white flex items-center justify-center text-[10px] font-mono text-white font-bold truncate px-1"
                          title={`${cut.pieceLabel}: ${cut.length}mm`}
                        >
                          {cut.length}mm
                        </div>
                      );
                    })}
                    {/* Fire Kısmı */}
                    {bar.wasteLength > 0 && (
                      <div
                        style={{ width: `${(bar.wasteLength / 6000) * 100}%` }}
                        className="h-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px] font-mono border-l border-amber-300"
                        title={`Fire: ${bar.wasteLength}mm`}
                      >
                        Fire
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parça Detay Tablosu */}
          <div>
            <h3 className="text-md font-semibold text-slate-900 mb-3">
              📋 Net İmalat Kesim Listesi (Atölye)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-xs text-slate-600 uppercase font-mono border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Parça Adı</th>
                    <th className="px-4 py-3">Tip</th>
                    <th className="px-4 py-3">Kesim Boyu (mm)</th>
                    <th className="px-4 py-3">Adet</th>
                    <th className="px-4 py-3">Köşe Açısı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {cutPieces.map((piece) => (
                    <tr key={piece.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {piece.label}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {piece.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600">
                        {piece.length} mm
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{piece.quantity}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {piece.angle}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-md shadow-blue-500/20"
          >
            🖨️ Atölye Kesim Çıktısı Al
          </button>
        </div>
      </div>
    </div>
  );
};
