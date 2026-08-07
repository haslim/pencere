"use client";

import React, { useState, useMemo } from "react";
import { CutPiece, OptimizationStock, optimizeCutList, exportToCNCData, WindowItem } from "@/lib/pencereEngine";
import { Cpu, Download, Printer, QrCode, Scissors, Layers, CheckCircle2 } from "lucide-react";

interface CutListModalProps {
  isOpen: boolean;
  onClose: () => void;
  cutPieces: CutPiece[];
  optimizedBars: OptimizationStock[];
  items?: WindowItem[];
  sawKerf?: number;
}

export const CutListModal: React.FC<CutListModalProps> = ({
  isOpen,
  onClose,
  cutPieces,
  optimizedBars: initialOptimizedBars,
  items = [],
  sawKerf = 5,
}) => {
  const [stockMode, setStockMode] = useState<"standard" | "custom_list">("standard");
  const [standardBarLength, setStandardBarLength] = useState<number>(6000);
  const [customStockList, setCustomStockList] = useState<number[]>([6000, 6500, 4500, 3200]);
  const [newStockInput, setNewStockInput] = useState<string>("");
  const [cncBrand, setCncBrand] = useState<"KABAN" | "MURAT" | "YILMAZ" | "GENERIC_NC">("KABAN");
  const [activeTab, setActiveTab] = useState<"optimization" | "cnc" | "labels">("optimization");

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

  const handleDownloadCNC = () => {
    const cncContent = exportToCNCData(items, cncBrand);
    const blob = new Blob([cncContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Ercom_CNC_${cncBrand}_Data_${Date.now()}.nc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                1D Profil Kesim Optimizasyonu & CNC Veri Aktarımı
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Ercom Smart Enterprise
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Parametrik Kesim Dizilimi, Fire Haritası ve Makine Otomasyonu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Selector */}
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveTab("optimization")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === "optimization"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Optimizasyon & Kesim
              </button>
              <button
                onClick={() => setActiveTab("cnc")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === "cnc"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                CNC Aktarımı
              </button>
              <button
                onClick={() => setActiveTab("labels")}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === "labels"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                Barkod Etiketleri
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-lg flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900/60">
          {activeTab === "optimization" && (
            <>
              {/* Stok Profil Boyu Ayarları */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Stok Profil Uzunluk Modu & Boy Seçimi
                  </span>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => setStockMode("standard")}
                      className={`px-3 py-1 rounded-lg font-medium transition border ${
                        stockMode === "standard"
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      Tekli Standart Boy
                    </button>
                    <button
                      onClick={() => setStockMode("custom_list")}
                      className={`px-3 py-1 rounded-lg font-medium transition border ${
                        stockMode === "custom_list"
                          ? "bg-blue-600 text-white border-blue-500"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      Atölye Parça/Karma Boylar
                    </button>
                  </div>
                </div>

                {stockMode === "standard" ? (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="text-xs text-slate-400">Standart Boy:</span>
                    {[6000, 6500, 5800, 4500, 3000].map((len) => (
                      <button
                        key={len}
                        onClick={() => setStandardBarLength(len)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                          standardBarLength === len
                            ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {len} mm
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <span className="text-xs text-slate-400">Özel Boy:</span>
                      <input
                        type="number"
                        step={100}
                        min={1000}
                        max={10000}
                        value={standardBarLength}
                        onChange={(e) => setStandardBarLength(Number(e.target.value))}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-xs font-mono text-slate-500">mm</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs text-slate-400 block">
                      Atölyedeki Stok Boyları (Optimizasyon en düşük fire veren boyu seçer):
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {customStockList.map((len, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-800 border border-slate-700 text-blue-300 font-mono font-bold text-xs rounded-lg flex items-center gap-1.5"
                        >
                          <span>{len} mm</span>
                          {customStockList.length > 1 && (
                            <button
                              onClick={() => handleRemoveCustomStock(idx)}
                              className="text-slate-500 hover:text-red-400 transition"
                            >
                              ✕
                            </button>
                          )}
                        </span>
                      ))}

                      <div className="flex items-center gap-1.5 ml-2">
                        <input
                          type="number"
                          placeholder="ör. 4200"
                          value={newStockInput}
                          onChange={(e) => setNewStockInput(e.target.value)}
                          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={handleAddCustomStock}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          + Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Özet Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">
                    Gerekli Profil Çubuk Sayısı
                  </span>
                  <span className="text-xl font-bold text-blue-400 mt-1 block font-mono">
                    {totalBarCount} Çubuk ({(totalStockLengthSum / 1000).toFixed(2)}m)
                  </span>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">
                    Toplam Fire Miktarı
                  </span>
                  <span className="text-xl font-bold text-amber-400 mt-1 block font-mono">
                    {(totalWaste / 1000).toFixed(2)} Metre
                  </span>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">
                    Verimlilik / Fire Oranı
                  </span>
                  <span className="text-xl font-bold text-emerald-400 mt-1 block font-mono">
                    %{100 - wastePercentage} Verim (%{wastePercentage} Fire)
                  </span>
                </div>
              </div>

              {/* Görsel Bar Kesim Şeması */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                  <span>📊 Profil Kesim Dizilim Görseli</span>
                  <span className="text-xs font-mono text-slate-500">
                    Testere Bıçağı Payı: {sawKerf} mm
                  </span>
                </h3>
                <div className="space-y-4">
                  {optimizedBars.map((bar, barIdx) => (
                    <div
                      key={`bar-${barIdx}`}
                      className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-slate-200">
                          ÇUBUK #{barIdx + 1} (Stok: {bar.barLength} mm)
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          Kullanılan: {bar.usedLength} mm | Fire: {bar.wasteLength} mm (%{bar.wastePercentage})
                        </span>
                      </div>

                      {/* Bar Visualizer */}
                      <div className="h-8 w-full bg-slate-800 rounded-lg overflow-hidden flex border border-slate-700 p-0.5 shadow-inner">
                        {bar.cuts.map((cut, cutIdx) => {
                          const widthPercent = (cut.length / bar.barLength) * 100;
                          return (
                            <div
                              key={`cut-${barIdx}-${cutIdx}`}
                              style={{ width: `${widthPercent}%` }}
                              className="h-full bg-blue-600/90 border-r border-slate-900 flex items-center justify-center text-[10px] font-mono text-white font-bold truncate px-1"
                              title={`${cut.pieceLabel}: ${cut.length}mm [Açı: ${cut.leftAngle}°/${cut.rightAngle}°] Barkod: ${cut.barcode}`}
                            >
                              {cut.length}mm ({cut.leftAngle}°/{cut.rightAngle}°)
                            </div>
                          );
                        })}
                        {bar.wasteLength > 0 && (
                          <div
                            style={{ width: `${(bar.wasteLength / bar.barLength) * 100}%` }}
                            className="h-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px] font-mono border-l border-amber-500/30"
                            title={`Fire: ${bar.wasteLength}mm`}
                          >
                            Fire {bar.wasteLength}mm
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Net İmalat Tablosu */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  📋 Atölye Profil Kesim Detayları
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 uppercase tracking-wider font-mono border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-3">Parça Açıklaması</th>
                        <th className="px-4 py-3">Tip</th>
                        <th className="px-4 py-3">Kesim Boyu</th>
                        <th className="px-4 py-3">Adet</th>
                        <th className="px-4 py-3">Sol/Sağ Açı</th>
                        <th className="px-4 py-3">Renk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {cutPieces.map((piece) => (
                        <tr key={piece.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-medium text-white">
                            {piece.label}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-blue-300 border border-slate-700">
                              {piece.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-blue-400">
                            {piece.length} mm
                          </td>
                          <td className="px-4 py-3 font-bold text-white">{piece.quantity}</td>
                          <td className="px-4 py-3 font-mono text-slate-400">
                            {piece.leftAngle || (piece.angle.startsWith("45") ? 45 : 90)}° / {piece.rightAngle || (piece.angle.endsWith("45") ? 45 : 90)}°
                          </td>
                          <td className="px-4 py-3 text-slate-400">{piece.colorName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === "cnc" && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-400" />
                      CNC & Makine Otomasyon Veri Formatı Seçimi
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Kesim, frezeleme ve delme parametrelerini otomatik makine formatında dışa aktarın
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadCNC}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    CNC Dosyasını İndir (.NC / .CSV)
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  {[
                    { id: "KABAN", name: "Kaban CNC Kesim", desc: "Kaban Profil İşleme & Kesim Merkezi" },
                    { id: "MURAT", name: "Murat Makina NC", desc: "Murat PLC & CNC Otomasyon Formatı" },
                    { id: "YILMAZ", name: "Yılmaz Makine", desc: "Yılmaz Otomatik Kesim & Freze" },
                    { id: "GENERIC_NC", name: "Generic NC / CSV", desc: "Standart G-Code / CSV Formatı" },
                  ].map((mach) => (
                    <button
                      key={mach.id}
                      onClick={() => setCncBrand(mach.id as any)}
                      className={`p-3 rounded-xl text-left transition border ${
                        cncBrand === mach.id
                          ? "bg-blue-600/15 border-blue-500 text-white shadow-lg"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <span className="text-xs font-bold block text-white">{mach.name}</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">{mach.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Önizleme Kodu */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  CNC Veri Dosyası Önizleme Output:
                </span>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-blue-300 overflow-x-auto max-h-60">
                  {exportToCNCData(items, cncBrand)}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "labels" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    Atölye Barkod & QR Kod Etiket Çıktısı
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kesilecek her profil çubuğu üzerine yapıştırılacak teknik imalat etiketleri
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-emerald-600/25 transition"
                >
                  <Printer className="w-4 h-4" />
                  Etiketleri Yazdır
                </button>
              </div>

              {/* Barkod Kartları Izgarası */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {optimizedBars.flatMap((b, bIdx) =>
                  b.cuts.map((c, cIdx) => (
                    <div
                      key={`lbl-${bIdx}-${cIdx}`}
                      className="bg-white text-slate-900 p-4 rounded-xl border border-slate-300 shadow-md space-y-2"
                    >
                      <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                        <div>
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                            ERCOM SMART ENTERPRISE
                          </span>
                          <span className="text-xs font-bold block mt-0.5">{c.pieceLabel}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono text-[10px] font-bold rounded border border-slate-300">
                          {c.barcode || `BAR-${bIdx}-${cIdx}`}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                        <div>
                          <span className="text-[10px] text-slate-500 block">KESİM BOYU:</span>
                          <span className="font-bold text-blue-900 text-sm">{c.length} mm</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">KÖŞE AÇILARI:</span>
                          <span className="font-bold text-slate-800">
                            {c.leftAngle}° / {c.rightAngle}°
                          </span>
                        </div>
                      </div>

                      {/* Fake Barcode Visualizer */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div className="h-6 w-32 bg-slate-900 flex items-center justify-around px-1 rounded">
                          <div className="w-1 h-full bg-white"></div>
                          <div className="w-0.5 h-full bg-white"></div>
                          <div className="w-1.5 h-full bg-white"></div>
                          <div className="w-0.5 h-full bg-white"></div>
                          <div className="w-2 h-full bg-white"></div>
                          <div className="w-1 h-full bg-white"></div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500">
                          PARÇA #{bIdx + 1}.{cIdx + 1}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Otomatik 1D Fire Optimizasyonu Aktif
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition"
          >
            <Printer className="w-4 h-4" />
            Atölye Raporunu Yazdır
          </button>
        </div>
      </div>
    </div>
  );
};

