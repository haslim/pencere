"use client";

import React from "react";
import { CalculationResult, WindowItem } from "@/lib/pencereEngine";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WindowItem;
  calcResult: CalculationResult;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  item,
  calcResult,
}) => {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString("tr-TR");

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📄 Müşteri Teklif Formu & Fiyat Özeti
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Ercom SaaS Otomasyon Sistemi Tarafından Oluşturuldu
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Printable Area */}
        <div id="quote-print-area" className="p-8 space-y-6 overflow-y-auto bg-slate-900 text-slate-200">
          {/* Antet & Müşteri Bilgisi */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-cyan-400">
                SİSTEM YAPI ELEMANLARI
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                PVC Kapı & Pencere Doğrama Sistemleri
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tel: +90 332 812 39 95 | Web: www.aslimlarpencere.com
              </p>
            </div>
            <div className="text-right">
              <span className="bg-cyan-500/10 text-cyan-400 text-xs px-3 py-1 rounded-full border border-cyan-500/30 font-mono">
                TEKLİF NO: #TK-2026-08
              </span>
              <p className="text-xs text-slate-400 mt-2">Tarih: {today}</p>
            </div>
          </div>

          {/* Doğrama Bilgileri */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs text-slate-500 block">Doğrama Adı</span>
              <span className="font-semibold text-white">{item.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Dış Ölçüler (GxY)</span>
              <span className="font-mono text-cyan-300 font-bold">
                {item.width} x {item.height} mm
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Profil Rengi</span>
              <span className="font-semibold text-white">{item.color.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Bölme Sayısı</span>
              <span className="font-semibold text-white">
                {item.divisions.length} Bölme
              </span>
            </div>
          </div>

          {/* İmalat Metraj Özeti */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-slate-300">
              📊 İmalat ve Malzeme Metrajları
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Profil Metrajı</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {calcResult.totalProfileMeters} Metre
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Destek Sacı</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {calcResult.totalSteelMeters} Metre
                </span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Toplam Cam Alanı</span>
                <span className="text-lg font-bold text-white mt-0.5 block">
                  {calcResult.totalGlassSqM} m²
                </span>
              </div>
            </div>
          </div>

          {/* Cam Listesi */}
          <div>
            <h3 className="text-md font-semibold text-slate-300 mb-2">
              🪟 Cam Detayları
            </h3>
            <div className="rounded-lg border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono">
                  <tr>
                    <th className="p-2.5">Cam Tipi</th>
                    <th className="p-2.5">Ölçü (WxH mm)</th>
                    <th className="p-2.5">Alan (m²)</th>
                    <th className="p-2.5">Adet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/40">
                  {calcResult.glasses.map((g, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-white">{g.type}</td>
                      <td className="p-2.5 font-mono text-cyan-400">
                        {g.width} x {g.height} mm
                      </td>
                      <td className="p-2.5">{g.areaSqM} m²</td>
                      <td className="p-2.5 font-bold">{g.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fiyat Toplamı */}
          <div className="bg-gradient-to-r from-cyan-950/40 to-slate-950 p-6 rounded-2xl border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider block">
                Tahmini Toplam Fiyat (KDV Hariç)
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Profil, Aksesuar, Isıcam ve İmalat İşçilik Dahil
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-cyan-300">
                {calcResult.estimatedPriceTL.toLocaleString("tr-TR")} ₺
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition"
          >
            Kapat
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 shadow-lg"
          >
            🖨️ PDF YAZDIR / İNDİR
          </button>
        </div>
      </div>
    </div>
  );
};
