"use client";

import React, { useState } from "react";
import { WindowItem, calculateOrderSummary, GlassCut } from "@/lib/pencereEngine";
import { AppSettings, DEFAULT_SETTINGS } from "@/components/SettingsModal";
import { X, Printer, Download, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";

interface GlassOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WindowItem[];
  settings?: AppSettings;
  orderTitle?: string;
  customerName?: string;
}

export const GlassOrderModal: React.FC<GlassOrderModalProps> = ({
  isOpen,
  onClose,
  items,
  settings = DEFAULT_SETTINGS,
  orderTitle = "İmalat Siparişi",
  customerName = "Müşteri Belirtilmedi",
}) => {
  const [selectedGlassType, setSelectedGlassType] = useState<string>("TÜMÜ");
  const summary = calculateOrderSummary(items, settings);

  if (!isOpen) return null;

  // Cam Türüne Göre Filtreleme
  const allGlasses = summary.allGlasses;
  const filteredGlasses =
    selectedGlassType === "TÜMÜ"
      ? allGlasses
      : allGlasses.filter((g) => g.type.includes(selectedGlassType));

  // Toplam m² ve Adet
  const totalM2 = filteredGlasses
    .reduce((acc, g) => acc + g.areaSqM * g.quantity, 0)
    .toFixed(2);
  const totalPieces = filteredGlasses.reduce((acc, g) => acc + g.quantity, 0);

  // CNC/Sipariş Text İhracatı
  const handleExportGlassList = () => {
    const textLines = [
      `==========================================`,
      `      CAM & ISICAM İMALAT SİPARİŞİ        `,
      `==========================================`,
      `Proje / Başlık: ${orderTitle}`,
      `Müşteri / Cari: ${customerName}`,
      `Tarih: ${new Date().toLocaleDateString("tr-TR")}`,
      `------------------------------------------`,
      `POZ / GENİŞLİK(mm) / YÜKSEKLİK(mm) / ADET / m² / CAM TİPİ`,
      ...filteredGlasses.map(
        (g, idx) =>
          `${idx + 1}. [${g.posName || "Poz"}] ${g.width} x ${g.height} mm - ${
            g.quantity
          } Adet (${(g.areaSqM * g.quantity).toFixed(2)} m²) - ${g.type}`
      ),
      `------------------------------------------`,
      `TOPLAM ADET: ${totalPieces}`,
      `TOPLAM ALAN: ${totalM2} m²`,
    ];

    const blob = new Blob([textLines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cam_Siparis_Listesi_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Isıcam & Cam Sipariş Listesi
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Fabrika Sipariş Modülü
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Üretim ve Cam Tedarikçisi İçin Otomatik Net Ölçü Formu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Sipariş ve Tedarikçi Özeti Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 font-medium">Müşteri / Proje</span>
              <p className="text-sm font-semibold text-white mt-1">{customerName}</p>
              <p className="text-xs text-blue-400 mt-0.5">{orderTitle}</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 font-medium">Toplam Metrekare</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">{totalM2} m²</p>
              <p className="text-xs text-slate-400 mt-0.5">{totalPieces} Parça Cam</p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400 font-medium">Standart Tolerans</span>
              <p className="text-sm font-semibold text-amber-400 mt-1">
                -{settings.glassTolerance || 4} mm Düşüm Uygulandı
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Cam Çıta Payları Dahil</p>
            </div>
          </div>

          {/* Cam Türü Filtreleme Butonları */}
          <div className="flex flex-wrap gap-2 items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cam Türü Filtresi:
            </span>
            <div className="flex gap-2">
              {["TÜMÜ", "4+16+4", "Kapı Kanadı", "Sabit"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedGlassType(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedGlassType === filter
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Cam Tablosu */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Pencere / Poz Name</th>
                  <th className="py-3 px-4 text-center">Genişlik (W)</th>
                  <th className="py-3 px-4 text-center">Yükseklik (H)</th>
                  <th className="py-3 px-4 text-center">Adet</th>
                  <th className="py-3 px-4 text-right">Tekil m²</th>
                  <th className="py-3 px-4 text-right">Toplam m²</th>
                  <th className="py-3 px-4">Cam Tipi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredGlasses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Bu kriterlere uygun cam parçası bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredGlasses.map((glass, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-white">
                        {glass.posName || `Poz #${idx + 1}`}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-blue-300">
                        {glass.width} mm
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-blue-300">
                        {glass.height} mm
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                          {glass.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {glass.areaSqM} m²
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {(glass.areaSqM * glass.quantity).toFixed(2)} m²
                      </td>
                      <td className="py-3 px-4 text-slate-400">{glass.type}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tedarikçi Sipariş Formatı Hazır</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportGlassList}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-blue-400" />
              Tedarikçi TXT İndir
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition"
            >
              <Printer className="w-4 h-4" />
              Sipariş Formu Yazdır
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
