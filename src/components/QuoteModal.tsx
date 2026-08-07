"use client";

import React, { useState } from "react";
import { Customer, OrderCalculationResult, WindowItem } from "@/lib/pencereEngine";
import { CompanyInfo } from "@/components/SettingsModal";
import { Printer, Globe, DollarSign, Euro, FileText, CheckCircle2 } from "lucide-react";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  items: WindowItem[];
  orderSummary: OrderCalculationResult;
  companyInfo?: CompanyInfo;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  customer,
  items,
  orderSummary,
  companyInfo,
}) => {
  const [currency, setCurrency] = useState<"TRY" | "EUR" | "USD">("TRY");
  const [exchangeRateEUR, setExchangeRateEUR] = useState<number>(38.5);
  const [exchangeRateUSD, setExchangeRateUSD] = useState<number>(35.2);

  if (!isOpen) return null;

  const today = new Date().toLocaleDateString("tr-TR");

  // Para birimi dönüştürme yardımcısı
  const getSymbol = () => (currency === "TRY" ? "₺" : currency === "EUR" ? "€" : "$");
  const convertPrice = (priceTL: number) => {
    if (currency === "EUR") return Math.round(priceTL / exchangeRateEUR);
    if (currency === "USD") return Math.round(priceTL / exchangeRateUSD);
    return priceTL;
  };

  const totalPriceConverted = convertPrice(orderSummary.totalPriceTL);
  const costPriceConverted = convertPrice(orderSummary.costPriceTL);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 text-blue-600 rounded-lg border border-blue-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Resmi Müşteri Teklif Formu & Maliyet Analizi
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                  Ercom Smart Enterprise
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Özelleştirilebilir Kurumsal Teklif ve Çoklu Para Birimi Desteği
              </p>
            </div>
          </div>

          {/* Para Birimi & Kur Seçeneği */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-sm">
              <button
                onClick={() => setCurrency("TRY")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  currency === "TRY" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                ₺ TRY
              </button>
              <button
                onClick={() => setCurrency("EUR")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  currency === "EUR" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                € EUR
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  currency === "USD" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                $ USD
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="quote-print-area" className="p-8 space-y-6 overflow-y-auto bg-white text-slate-800 flex-1">
          {/* Antet & Firma Bilgisi */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div className="flex items-center gap-4">
              {companyInfo?.logoUrl && (
                <img
                  src={companyInfo.logoUrl}
                  alt={companyInfo.name}
                  className="max-h-16 max-w-[140px] object-contain rounded-lg border bg-white p-1 shadow-sm"
                />
              )}
              <div>
                <h1 className="text-2xl font-extrabold text-blue-700 uppercase tracking-tight">
                  {companyInfo?.name || "SİSTEM YAPI ELEMANLARI"}
                </h1>
                <p className="text-sm text-slate-600 font-medium mt-0.5">
                  {companyInfo?.subtitle || "PVC Kapı & Pencere Doğrama Sistemleri"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tel: {companyInfo?.phone || "+90 332 812 39 95"} | Web: {companyInfo?.website || "www.aslimlarpencere.com"}
                  {companyInfo?.email ? ` | E-Posta: ${companyInfo.email}` : ""}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 font-mono font-bold">
                TEKLİF NO: #TK-{Date.now().toString().slice(-6)}
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
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
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
                    <th className="p-3 text-right">Poz Fiyatı ({getSymbol()})</th>
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
                        {convertPrice(calc.estimatedPriceTL).toLocaleString("tr-TR")} {getSymbol()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Toplam İmalat Metraj Özeti */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              📊 Toplam İmalat ve Malzeme Metrajları
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block font-medium">Toplam Profil Metrajı</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block font-mono">
                  {orderSummary.totalProfileMeters} Metre
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block font-medium">Toplam Destek Sacı</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block font-mono">
                  {orderSummary.totalSteelMeters} Metre
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block font-medium">Toplam Cam Alanı</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block font-mono">
                  {orderSummary.totalGlassSqM} m²
                </span>
              </div>
            </div>
          </div>

          {/* Genel Fiyat Toplamı */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-6 rounded-2xl text-white shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-100 font-bold uppercase tracking-wider block">
                GENEL SİPARİŞ TEKLİF TOPLAMI
              </span>
              <p className="text-xs text-blue-100/80 mt-1">
                Tüm Pozlar, Çift Cam, Aksesuar Montajı ve İmalat Dahildir
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-white font-mono">
                {totalPriceConverted.toLocaleString("tr-TR")} {getSymbol()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Ercom Smart Parametrik Hesaplama Doğrulandı</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition"
            >
              Kapat
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition"
            >
              <Printer className="w-4 h-4" />
              Teklif Yazdır / PDF Al
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

