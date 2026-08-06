"use client";

import React, { useState, useMemo } from "react";
import {
  PROFILE_COLORS,
  WindowItem,
  calculateWindowDimensions,
  optimizeCutList,
} from "@/lib/pencereEngine";
import { WindowCanvas } from "@/components/WindowCanvas";
import { CutListModal } from "@/components/CutListModal";
import { QuoteModal } from "@/components/QuoteModal";

export default function SaaSWindowDashboard() {
  // Seçili / Aktif Doğrama State
  const [item, setItem] = useState<WindowItem>({
    id: "pencere-1",
    name: "Örnek Çift Açılım Pencere Pozu",
    width: 1400,
    height: 1400,
    color: PROFILE_COLORS[0], // Standart Beyaz
    mullionsCount: 1, // 2 Bölmeli
    divisions: [
      { id: "div-1", type: "sabit", ratio: 0.5 },
      { id: "div-2", type: "cift-acilim", ratio: 0.5 },
    ],
  });

  // Modal Durumları
  const [isCutModalOpen, setIsCutModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Anlık Hesaplama Motoru Çıktısı
  const calcResult = useMemo(() => {
    return calculateWindowDimensions(item);
  }, [item]);

  // 1D Profil Kesim Optimizasyonu Çıktısı
  const optimizedBars = useMemo(() => {
    return optimizeCutList(calcResult.cutPieces, 6000, 5);
  }, [calcResult]);

  // Bölme Sayısı (Orta Kayıt) Güncelleme
  const handleMullionChange = (count: number) => {
    const newDivCount = count + 1;
    const newDivisions = Array.from({ length: newDivCount }).map((_, idx) => ({
      id: `div-${idx + 1}`,
      type: (item.divisions[idx]?.type || "sabit") as any,
      ratio: 1 / newDivCount,
    }));

    setItem({
      ...item,
      mullionsCount: count,
      divisions: newDivisions,
    });
  };

  // Bölme Tipi Güncelleme (Sabit / Tek Açılım / Çift Açılım / Vasistas)
  const handleUpdateDivisionType = (
    index: number,
    type: "sabit" | "tek-acilim" | "cift-acilim" | "vasistas"
  ) => {
    const updated = [...item.divisions];
    if (updated[index]) {
      updated[index].type = type;
      setItem({ ...item, divisions: updated });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* SaaS Header / Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
            E2
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              ERCOM SaaS <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Cloud V1.0</span>
            </h1>
            <p className="text-xs text-slate-400">PVC & Alüminyum Bulut Tabanlı Çizim ve İmalat Otomasyonu</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCutModalOpen(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg text-sm font-semibold transition flex items-center gap-2"
          >
            ✂️ 1D Kesim Listesi & Optimizasyon
          </button>
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-sm font-semibold transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
          >
            📄 Teklif Formu & Fiyat
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1600px] w-full mx-auto">
        {/* Sol Kontrol & Parametre Paneli */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-6 shadow-xl backdrop-blur-sm">
          <div>
            <h2 className="text-md font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              ⚙️ Poz ve Geometri Parametreleri
            </h2>

            <div className="space-y-4 mt-4">
              {/* Poz Adı */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Poz / Pencere Tanımı</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => setItem({ ...item, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Genişlik & Yükseklik */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Dış Genişlik (mm)</label>
                  <input
                    type="number"
                    min={400}
                    max={3500}
                    step={10}
                    value={item.width}
                    onChange={(e) => setItem({ ...item, width: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Dış Yükseklik (mm)</label>
                  <input
                    type="number"
                    min={400}
                    max={3000}
                    step={10}
                    value={item.height}
                    onChange={(e) => setItem({ ...item, height: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Profil Lamine Rengi */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Profil ve Kaplama Rengi</label>
                <div className="grid grid-cols-1 gap-2">
                  {PROFILE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setItem({ ...item, color: c })}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition ${
                        item.color.id === c.id
                          ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-sm"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-600 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </div>
                      {c.priceMultiplier > 1 && (
                        <span className="text-[10px] text-amber-400 font-mono">
                          +{Math.round((c.priceMultiplier - 1) * 100)}% Lamine
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orta Kayıt / Bölme Sayısı */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Düşey Orta Kayıt (Mullion) Sayısı
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleMullionChange(num)}
                      className={`py-2 rounded-lg text-xs font-bold transition border ${
                        item.mullionsCount === num
                          ? "bg-cyan-600 text-white border-cyan-500"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {num === 0 ? "Tek Göz" : `${num + 1} Bölme`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Anlık Hesaplanan Özet Metraj Kartı */}
          <div className="mt-auto bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              📊 Anlık Poz Hesap Özeti
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Profil Metrajı</span>
                <span className="font-bold text-white text-sm">{calcResult.totalProfileMeters} m</span>
              </div>
              <div>
                <span className="text-slate-500 block">Destek Sacı</span>
                <span className="font-bold text-white text-sm">{calcResult.totalSteelMeters} m</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cam Alanı</span>
                <span className="font-bold text-white text-sm">{calcResult.totalGlassSqM} m²</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tahmini Fiyat</span>
                <span className="font-bold text-cyan-400 text-sm">
                  {calcResult.estimatedPriceTL.toLocaleString("tr-TR")} ₺
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ İnteraktif Tuval & İmalat Listeleri */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Çizim Tuval Alanı */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[440px] shadow-xl relative backdrop-blur-sm">
            <div className="absolute top-4 left-4 text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              İnteraktif 2D CAD Tuvali (Açılımları Tıklayarak Değiştirin)
            </div>

            <WindowCanvas item={item} onUpdateDivisionType={handleUpdateDivisionType} />
          </div>

          {/* İmalat & Kesim Tablosu Önizlemesi */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                📋 İmalat Kesim Ölçüleri (Düşümler Yapılmış)
              </h3>
              <button
                onClick={() => setIsCutModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline"
              >
                Optimizasyon Raporunu Göster →
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono">
                  <tr>
                    <th className="px-3 py-2.5">Eleman Adı</th>
                    <th className="px-3 py-2.5">Tip</th>
                    <th className="px-3 py-2.5">Kesim Ölçüsü</th>
                    <th className="px-3 py-2.5">Adet</th>
                    <th className="px-3 py-2.5">Açı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {calcResult.cutPieces.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-2 font-medium text-white">{p.label}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-semibold">
                          {p.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-cyan-400">{p.length} mm</td>
                      <td className="px-3 py-2 font-bold">{p.quantity}</td>
                      <td className="px-3 py-2 font-mono text-slate-400">{p.angle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Dialoglar */}
      <CutListModal
        isOpen={isCutModalOpen}
        onClose={() => setIsCutModalOpen(false)}
        cutPieces={calcResult.cutPieces}
        optimizedBars={optimizedBars}
      />

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        item={item}
        calcResult={calcResult}
      />
    </div>
  );
}
