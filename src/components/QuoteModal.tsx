"use client";

import React from "react";
import { Customer, OrderCalculationResult, WindowItem } from "@/lib/pencereEngine";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  items: WindowItem[];
  orderSummary: OrderCalculationResult;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  customer,
  items,
  orderSummary,
}) => {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString("tr-TR");

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              📄 Müşteri Teklif Formu & Fiyat Özeti ({items.length} Poz)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Sistem SaaS Otomasyon Sistemi Tarafından Oluşturuldu
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Printable Area */}
        <div id="quote-print-area" className="p-8 space-y-6 overflow-y-auto bg-white text-slate-800">
          {/* Antet & Müşteri Bilgisi */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-blue-700">
                SİSTEM YAPI ELEMANLARI
              </h1>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                PVC Kapı & Pencere Doğrama Sistemleri
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Tel: +90 332 812 39 95 | Web: www.aslimlarpencere.com
              </p>
            </div>
            <div className="text-right">
              <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 font-mono font-bold">
                TEKLİF NO: #TK-2026-08
              </span>
              <p className="text-xs text-slate-500 mt-2 font-medium">Tarih: {today}</p>
            </div>
          </div>

          {/* Cari / Müşteri Bilgileri Kartı */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Cari Unvanı / Müşteri</span>
              <span className="font-bold text-blue-950 text-sm">{customer.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Cari Kodu / Telefon</span>
              <span className="font-mono text-slate-900 font-bold text-sm">
                {customer.code} | {customer.phone}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Teslimat / Adres</span>
              <span className="text-xs font-medium text-slate-700">{customer.address || "-"}</span>
            </div>
          </div>

          {/* Siparişteki Pozların Kalem Detayı Tablosu */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-slate-900 flex items-center justify-between">
              <span>📋 Sipariş Poz Kalemleri ({items.length} Poz)</span>
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-mono border-b border-slate-200">
                  <tr>
                    <th className="p-3">Poz Adı</th>
                    <th className="p-3">Dış Ölçü (WxH mm)</th>
                    <th className="p-3">Renk</th>
                    <th className="p-3">Profil (m)</th>
                    <th className="p-3">Cam (m²)</th>
                    <th className="p-3 text-right">Poz Fiyatı (TL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {orderSummary.itemResults.map(({ item, calc }, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">
                        {idx + 1}. {item.name}
                      </td>
                      <td className="p-3 font-mono text-blue-600 font-bold">
                        {item.width} x {item.height} mm
                      </td>
                      <td className="p-3 font-medium text-slate-700">{item.color.name}</td>
                      <td className="p-3 font-mono">{calc.totalProfileMeters} m</td>
                      <td className="p-3 font-mono">{calc.totalGlassSqM} m²</td>
                      <td className="p-3 font-bold text-slate-900 text-right font-mono">
                        {calc.estimatedPriceTL.toLocaleString("tr-TR")} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Toplam İmalat Metraj Özeti */}
          <div className="space-y-3">
            <h3 className="text-md font-semibold text-slate-900">
              📊 Toplam İmalat ve Malzeme Metrajları
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block font-medium">Toplam Profil Metrajı</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {orderSummary.totalProfileMeters} Metre
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block font-medium">Toplam Destek Sacı</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {orderSummary.totalSteelMeters} Metre
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block font-medium">Toplam Cam Alanı</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">
                  {orderSummary.totalGlassSqM} m²
                </span>
              </div>
            </div>
          </div>

          {/* Genel Fiyat Toplamı */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-100 font-semibold uppercase tracking-wider block">
                GENEL SİPARİŞ TOPLAMI (KDV Hariç)
              </span>
              <p className="text-xs text-blue-100/80 mt-1">
                Tüm Pozlar, Aksesuarlar, Isıcam ve İşçilik Dahildir
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-white">
                {orderSummary.totalPriceTL.toLocaleString("tr-TR")} ₺
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold rounded-lg transition"
          >
            Kapat
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 shadow-md shadow-blue-500/20"
          >
            🖨️ PDF YAZDIR / İNDİR
          </button>
        </div>
      </div>
    </div>
  );
};
