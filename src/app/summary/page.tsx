"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import {
  WindowItem,
  calculateOrderSummary,
  PROFILE_COLORS,
  Customer,
} from "@/lib/pencereEngine";
import { WindowPreviewSvg } from "@/components/WindowPreviewSvg";
import { DEFAULT_SETTINGS, AppSettings } from "@/components/SettingsModal";
import { DEFAULT_CUSTOMERS } from "@/components/CustomerModal";
import { Printer, ArrowLeft, TrendingUp, Filter, CheckSquare, Square } from "lucide-react";

export default function OrderSummaryPage() {
  const [items, setItems] = useState<WindowItem[]>([]);
  const [customer, setCustomer] = useState<Customer>(DEFAULT_CUSTOMERS[0]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currency, setCurrency] = useState<"TRY" | "EUR" | "USD">("TRY");
  const [exchangeRateEUR, setExchangeRateEUR] = useState<number>(38.5);
  const [exchangeRateUSD, setExchangeRateUSD] = useState<number>(35.2);
  const [selectedPosIds, setSelectedPosIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedItems = localStorage.getItem("app_order_items");
      let currentItems: WindowItem[] = [];
      if (savedItems) {
        try {
          const parsed = JSON.parse(savedItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentItems = parsed;
          } else {
            currentItems = getDefaultItems();
          }
        } catch (e) {
          currentItems = getDefaultItems();
        }
      } else {
        currentItems = getDefaultItems();
      }

      setItems(currentItems);
      setSelectedPosIds(currentItems.map((it) => it.id));


      const savedCust = localStorage.getItem("app_active_customer");
      if (savedCust) {
        try {
          setCustomer(JSON.parse(savedCust));
        } catch (e) {}
      }

      const savedSet = localStorage.getItem("app_factory_settings");
      if (savedSet) {
        try {
          setSettings(JSON.parse(savedSet));
        } catch (e) {}
      }

      setIsLoaded(true);
    }
  }, []);

  function getDefaultItems(): WindowItem[] {
    return [
      {
        id: "pencere-1",
        name: "Poz 1: Salon Çift Açılım Pencere",
        width: 1500,
        height: 1400,
        color: PROFILE_COLORS[0],
        verticalMullionsCount: 1,
        horizontalMullionsCount: 0,
        divisions: [
          { id: "div-1", type: "sabit", sashVerticalMullions: 0, sashHorizontalMullions: 0 },
          { id: "div-2", type: "cift-acilim", sashVerticalMullions: 0, sashHorizontalMullions: 0 },
        ],
      },
    ];
  }

  // Seçilen pozlara göre filtrelenmiş item'lar
  const activeFilteredItems = useMemo(() => {
    return items.filter((it) => selectedPosIds.includes(it.id));
  }, [items, selectedPosIds]);

  const orderSummary = useMemo(() => {
    return calculateOrderSummary(activeFilteredItems, settings);
  }, [activeFilteredItems, settings]);


  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse font-mono text-sm">Yükleniyor...</p>
      </div>
    );
  }

  const companyInfo = settings.company;
  const today = new Date().toLocaleDateString("tr-TR");

  const getSymbol = () => (currency === "TRY" ? "₺" : currency === "EUR" ? "€" : "$");
  const convertPrice = (priceTL: number) => {
    if (currency === "EUR") return Math.round(priceTL / exchangeRateEUR);
    if (currency === "USD") return Math.round(priceTL / exchangeRateUSD);
    return priceTL;
  };

  const totalPriceConverted = convertPrice(orderSummary.totalPriceTL);
  const costPriceConverted = convertPrice(orderSummary.costPriceTL);
  const profitConverted = convertPrice(orderSummary.profitTL);
  const profitMargin = orderSummary.costPriceTL > 0
    ? ((orderSummary.profitTL / orderSummary.costPriceTL) * 100).toFixed(1)
    : "0";

  const toggleSelectPos = (id: string) => {
    if (selectedPosIds.includes(id)) {
      if (selectedPosIds.length <= 1) return; // En az 1 poz seçili kalmalı
      setSelectedPosIds(selectedPosIds.filter((pId) => pId !== id));
    } else {
      setSelectedPosIds([...selectedPosIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPosIds.length === items.length) {
      setSelectedPosIds([items[0].id]);
    } else {
      setSelectedPosIds(items.map((it) => it.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="no-print">
        <HeaderNav />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Banner / Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl no-print">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
              title="CAD Çizime Dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                📊 Toplam Sipariş Maliyet & Satış Özeti Repo
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                  Finansal Analiz
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Seçilen {selectedPosIds.length} / {items.length} poz için maliyet ve satış raporu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs shadow-inner">
              <button
                onClick={() => setCurrency("TRY")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  currency === "TRY" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                ₺ TRY
              </button>
              <button
                onClick={() => setCurrency("EUR")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  currency === "EUR" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                € EUR
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  currency === "USD" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                $ USD
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Seçilen Pozları Yazdır / PDF
            </button>
          </div>
        </div>

        {/* Poz Seçim Kontrol Filtresi */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-lg no-print space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              Çıktı Alınacak Pozları Seçin ({selectedPosIds.length} Poz Seçili)
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              {selectedPosIds.length === items.length ? "Seçimi Temizle" : "Tümünü Seç"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((item, idx) => {
              const isSelected = selectedPosIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleSelectPos(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-2 ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-400" /> : <Square className="w-3.5 h-3.5" />}
                  <span>{idx + 1}. {item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Analytics Key Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Seçili İmalat Maliyeti</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-400 font-mono">
                {costPriceConverted.toLocaleString("tr-TR")} {getSymbol()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                Maliyet
              </span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Seçili Satış Fiyatı</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {totalPriceConverted.toLocaleString("tr-TR")} {getSymbol()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Satış
              </span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Net Kâr Tutarı</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                +{profitConverted.toLocaleString("tr-TR")} {getSymbol()}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> %{profitMargin}
              </span>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Metraj Özeti</span>
            <div className="mt-2 text-xs space-y-1 font-mono text-slate-300">
              <div className="flex justify-between">
                <span>Profil:</span>
                <span className="font-bold text-white">{orderSummary.totalProfileMeters} m</span>
              </div>
              <div className="flex justify-between">
                <span>Cam Alanı:</span>
                <span className="font-bold text-cyan-400">{orderSummary.totalGlassSqM} m²</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detaylı Rapor Kartı (Yazdırılabilir Alan) */}
        <div id="summary-print-area" className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 shadow-2xl space-y-6">
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
                <h2 className="text-2xl font-extrabold text-blue-700 uppercase tracking-tight">
                  {companyInfo?.name || "SİSTEM YAPI ELEMANLARI"}
                </h2>
                <p className="text-sm text-slate-600 font-medium mt-0.5">
                  {companyInfo?.subtitle || "PVC Kapı & Pencere Doğrama Sistemleri"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tel: {companyInfo?.phone || "+90 332 812 39 95"} | Web: {companyInfo?.website || "www.aslimlarpencere.com"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 font-mono font-bold">
                RAPOR NO: #MAL-{Date.now().toString().slice(-6)}
              </span>
              <p className="text-xs text-slate-500 mt-2 font-medium">Tarih: {today}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Cari Unvanı / Müşteri</span>
              <span className="font-bold text-slate-900 text-sm">{customer.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Cari Kodu / Telefon</span>
              <span className="font-mono text-slate-900 font-bold text-sm">
                {customer.code} | {customer.phone}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block font-medium">Teslimat Adresi</span>
              <span className="text-xs font-medium text-slate-700">{customer.address || "-"}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>📋 Poz Bazlı Detaylı Maliyet & Satış Dağılımı ({orderSummary.itemResults.length} Poz Seçili)</span>
              <span className="text-xs text-slate-500 font-normal">Para Birimi: {currency}</span>
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-mono border-b border-slate-200">
                  <tr>
                    <th className="p-3">Çizim</th>
                    <th className="p-3">#</th>
                    <th className="p-3">Poz Adı</th>
                    <th className="p-3">Ölçü (WxH mm)</th>
                    <th className="p-3">Adet</th>
                    <th className="p-3">Profil (m)</th>
                    <th className="p-3">Cam (m²)</th>
                    <th className="p-3 text-right">Birim Maliyet ({getSymbol()})</th>
                    <th className="p-3 text-right">Satış Fiyatı ({getSymbol()})</th>
                    <th className="p-3 text-right">Kâr ({getSymbol()})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {orderSummary.itemResults.map(({ item, calc }, idx) => {
                    const qty = item.quantity || 1;
                    const itemCost = convertPrice(calc.costPriceTL * qty);
                    const itemSale = convertPrice(calc.estimatedPriceTL * qty);
                    const itemProfit = Math.max(0, itemSale - itemCost);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <WindowPreviewSvg item={item} maxW={90} maxH={70} />
                        </td>
                        <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900">{item.name}</td>
                        <td className="p-3 font-mono text-blue-600 font-bold">
                          {item.width} x {item.height} mm
                        </td>
                        <td className="p-3 font-bold">{qty}</td>
                        <td className="p-3 font-mono">{(calc.totalProfileMeters * qty).toFixed(2)} m</td>
                        <td className="p-3 font-mono">{(calc.totalGlassSqM * qty).toFixed(2)} m²</td>
                        <td className="p-3 font-mono text-right text-rose-600 font-semibold">
                          {itemCost.toLocaleString("tr-TR")} {getSymbol()}
                        </td>
                        <td className="p-3 font-mono text-right text-slate-900 font-bold">
                          {itemSale.toLocaleString("tr-TR")} {getSymbol()}
                        </td>
                        <td className="p-3 font-mono text-right text-emerald-600 font-bold">
                          +{itemProfit.toLocaleString("tr-TR")} {getSymbol()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-200 text-slate-900">
                  <tr>
                    <td colSpan={5} className="p-3 text-right">GENEL TOPLAM:</td>
                    <td className="p-3 font-mono">{orderSummary.totalProfileMeters} m</td>
                    <td className="p-3 font-mono">{orderSummary.totalGlassSqM} m²</td>
                    <td className="p-3 font-mono text-right text-rose-700">
                      {costPriceConverted.toLocaleString("tr-TR")} {getSymbol()}
                    </td>
                    <td className="p-3 font-mono text-right text-blue-700 text-sm">
                      {totalPriceConverted.toLocaleString("tr-TR")} {getSymbol()}
                    </td>
                    <td className="p-3 font-mono text-right text-emerald-700">
                      +{profitConverted.toLocaleString("tr-TR")} {getSymbol()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
