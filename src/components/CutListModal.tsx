"use client";

import React, { useState, useMemo } from "react";
import { CutPiece, OptimizationStock, optimizeCutList } from "@/lib/pencereEngine";

interface CutListModalProps {
  isOpen: boolean;
  onClose: () => void;
  cutPieces: CutPiece[];
  optimizedBars: OptimizationStock[];
  sawKerf?: number;
}

export const CutListModal: React.FC<CutListModalProps> = ({
  isOpen,
  onClose,
  cutPieces,
  optimizedBars: initialOptimizedBars,
  sawKerf = 5,
}) => {
  // Varsayılan / Seçili Stok Boyları State (6000mm standart)
  const [stockMode, setStockMode] = useState<"standard" | "custom_list">("standard");
  const [standardBarLength, setStandardBarLength] = useState<number>(6000);

  // Atölyedeki Eldeki Özel Stok / Parça Boylar Listesi (mm)
  const [customStockList, setCustomStockList] = useState<number[]>([6000, 6500, 4500, 3200]);
  const [newStockInput, setNewStockInput] = useState<string>("");

  // Dinamik Olarak Re-Optimize Edilen Bars
  const optimizedBars = useMemo(() => {
    if (stockMode === "standard") {
      return optimizeCutList(cutPieces, standardBarLength, sawKerf);
    } else {
      return optimizeCutList(cutPieces, customStockList, sawKerf);
    }
  }, [cutPieces, stockMode, standardBarLength, customStockList, sawKerf]);

  if (!isOpen) return null;

  const totalWaste = optimizedBars.reduce((sum, b) => sum + b.wasteLength, 0);
  const totalBarCount = optimizedBars.length;
  const totalStockLengthSum = optimizedBars.reduce((sum, b) => sum + b.barLength, 0);
  const wastePercentage = Number(
    totalStockLengthSum > 0 ? ((totalWaste / totalStockLengthSum) * 100).toFixed(1) : 0
  );

  const handleAddCustomStock = () => {
    const val = Number(newStockInput);
    if (val > 100 && val <= 10000) {
      setCustomStockList([...customStockList, val].sort((a, b) => b - a));
      setNewStockInput("");
    }
  };

  const handleRemoveCustomStock = (index: number) => {
    if (customStockList.length <= 1) return;
    setCustomStockList(customStockList.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              ✂️ 1D Kesim & Profil Optimizasyon Raporu
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Farklı profil stok boyları ve atölye parça boylarına göre canlı optimizasyon
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
          {/* Stok Profil Boyu Ayarları / Özelleştirme Alanı */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                ⚙️ Stok Profil Uzunluk Ayarı & Optimizasyon Modu
              </h3>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setStockMode("standard")}
                  className={`px-3 py-1 rounded-lg font-bold transition border ${
                    stockMode === "standard"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Tekli Standart Boy
                </button>
                <button
                  onClick={() => setStockMode("custom_list")}
                  className={`px-3 py-1 rounded-lg font-bold transition border ${
                    stockMode === "custom_list"
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Atölye Parça/Karma Boylar Listesi
                </button>
              </div>
            </div>

            {/* Standart Boy Seçici */}
            {stockMode === "standard" ? (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-600 font-semibold">Profil Standart Boyu:</span>
                {[6000, 6500, 5800, 4500, 3000].map((len) => (
                  <button
                    key={len}
                    onClick={() => setStandardBarLength(len)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition border ${
                      standardBarLength === len
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {len} mm
                  </button>
                ))}
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-xs text-slate-500 font-medium">Özel Boy:</span>
                  <input
                    type="number"
                    step={100}
                    min={1000}
                    max={10000}
                    value={standardBarLength}
                    onChange={(e) => setStandardBarLength(Number(e.target.value))}
                    className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs font-mono text-slate-500">mm</span>
                </div>
              </div>
            ) : (
              /* Karma / Atölye Parça Boylar Listesi */
              <div className="space-y-2 pt-1">
                <span className="text-xs text-slate-600 font-medium block">
                  Atölyedeki Kullanılabilir Stok Profil Boyları (Optimizasyon en uygun olanı seçecektir):
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {customStockList.map((len, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-blue-900 font-mono font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <span>{len} mm</span>
                      {customStockList.length > 1 && (
                        <button
                          onClick={() => handleRemoveCustomStock(idx)}
                          className="text-slate-400 hover:text-red-500 transition"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  ))}

                  {/* Yeni Stok Boy Ekleme Formu */}
                  <div className="flex items-center gap-1.5 ml-2">
                    <input
                      type="number"
                      placeholder="ör. 4200"
                      value={newStockInput}
                      onChange={(e) => setNewStockInput(e.target.value)}
                      className="w-24 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleAddCustomStock}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      + Boy Ekle (mm)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block font-medium">
                Gerekli Profil Çubuk Sayısı
              </span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block">
                {totalBarCount} Adet Çubuk ({(totalStockLengthSum / 1000).toFixed(2)}m)
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
            <h3 className="text-md font-semibold text-slate-900 mb-3 flex items-center justify-between">
              <span>📊 Profil Kesim Dizilim Görseli</span>
              <span className="text-xs font-mono text-slate-500 font-normal">
                Testere Bıçağı Payı: {sawKerf} mm
              </span>
            </h3>
            <div className="space-y-4">
              {optimizedBars.map((bar, barIdx) => (
                <div
                  key={`bar-${barIdx}`}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                    <span className="font-bold text-slate-900">
                      ÇUBUK #{barIdx + 1} (Boy: {bar.barLength} mm)
                    </span>
                    <span className="text-emerald-600 font-bold">
                      Kullanılan: {bar.usedLength} mm | Fire: {bar.wasteLength} mm
                    </span>
                  </div>

                  {/* Görsel Bar */}
                  <div className="h-8 w-full bg-slate-200 rounded-lg overflow-hidden flex border border-slate-300 p-0.5 shadow-inner">
                    {bar.cuts.map((cut, cutIdx) => {
                      const widthPercent = (cut.length / bar.barLength) * 100;
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
                        style={{ width: `${(bar.wasteLength / bar.barLength) * 100}%` }}
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
