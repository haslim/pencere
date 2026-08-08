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

          {/* Cam Tablosu (Görsel Fabrika Standartı) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-white text-slate-900 font-serif">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-900">
                <tr>
                  <th className="py-2 px-3 text-left">Açıklama</th>
                  <th className="py-2 px-3 text-center">Adet</th>
                  <th className="py-2 px-3 text-center">Gen</th>
                  <th className="py-2 px-3 text-center">Yük</th>
                  <th className="py-2 px-3 text-right">B m²</th>
                  <th className="py-2 px-3 text-right">T m²</th>
                  <th className="py-2 px-3 text-center">Poz No</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredGlasses.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 font-medium">
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {g.type || "4+16+4 Çift Cam Konfor"}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-slate-900">{g.quantity}</td>
                    <td className="py-2 px-3 text-center font-mono">{g.width}</td>
                    <td className="py-2 px-3 text-center font-mono">{(g.height / 1000).toFixed(3).replace(".", ",")}</td>
                    <td className="py-2 px-3 text-right font-mono">{g.areaSqM.toFixed(3).replace(".", ",")}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {(g.areaSqM * g.quantity).toFixed(3).replace(".", ",")}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold">{idx + 1}</td>
                  </tr>
                ))}
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
