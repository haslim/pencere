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

  const [activeReportView, setActiveReportView] = useState<"official" | "dashboard">("official");

  // Seçilen pozlara göre filtrelenmiş item'lar
  const activeFilteredItems = useMemo(() => {
    return items.filter((it) => selectedPosIds.includes(it.id));
  }, [items, selectedPosIds]);

  const orderSummary = useMemo(() => {
    return calculateOrderSummary(activeFilteredItems, settings);
  }, [activeFilteredItems, settings]);

  const categorizedCostData = useMemo(() => {

    const rawCutPieces = orderSummary.allCutPieces;
    const rawAccs = orderSummary.allAccessories;

    // 1. Ana Profiller
    const anaProfiller = rawCutPieces
      .filter((p) => p.type === "KASA" || p.type === "KANAT" || p.type === "KAPI_KANADI" || p.type === "ORTA_KAYIT")
      .map((p) => ({
        stokkodu: p.code || "11400",
        aciklama: `${p.label} (${p.colorName || "Beyaz"})`,
        miktar: Number(((p.length * p.quantity) / 1000).toFixed(2)),
        birim: "mtül" as const,
        birimFiyat: 245.12,
        toplamFiyat: Number((((p.length * p.quantity) / 1000) * 245.12).toFixed(2)),
      }));

    // 2. Çıtalar
    const citalar = rawCutPieces
      .filter((p) => p.type === "CITA")
      .map((p) => ({
        stokkodu: p.code || "12648",
        aciklama: p.label,
        miktar: Number(((p.length * p.quantity) / 1000).toFixed(2)),
        birim: "mtül" as const,
        birimFiyat: 63.66,
        toplamFiyat: Number((((p.length * p.quantity) / 1000) * 63.66).toFixed(2)),
      }));

    // 3. Yardımcı Pls Profiller
    const yardimciProfiller = rawCutPieces
      .filter((p) => p.type === "ALUMINYUM_ESIK")
      .map((p) => ({
        stokkodu: p.code || "12425",
        aciklama: p.label,
        miktar: Number(((p.length * p.quantity) / 1000).toFixed(2)),
        birim: "mtül" as const,
        birimFiyat: 98.85,
        toplamFiyat: Number((((p.length * p.quantity) / 1000) * 98.85).toFixed(2)),
      }));

    // 4. Destek Sacı
    const destekSaclari = rawCutPieces
      .filter((p) => p.type === "DESTEK_SACI")
      .map((p) => ({
        stokkodu: p.code || "13060",
        aciklama: p.label,
        miktar: Number(((p.length * p.quantity) / 1000).toFixed(2)),
        birim: "mtül" as const,
        birimFiyat: 60.11,
        toplamFiyat: Number((((p.length * p.quantity) / 1000) * 60.11).toFixed(2)),
      }));

    // 5. Contalar
    const contalar = rawAccs
      .filter((a) => a.category === "CONTA_FITIL")
      .map((a) => ({
        stokkodu: a.code || "10578",
        aciklama: a.name,
        miktar: a.quantity,
        birim: "mtül" as const,
        birimFiyat: a.unitPriceTL,
        toplamFiyat: a.totalPriceTL,
      }));

    // 6. Vidalar
    const vidalar = rawAccs
      .filter((a) => a.code === "13190" || a.name.includes("Vida"))
      .map((a) => ({
        stokkodu: a.code || "13000",
        aciklama: a.name,
        miktar: a.quantity,
        birim: "adet" as const,
        birimFiyat: a.unitPriceTL,
        toplamFiyat: a.totalPriceTL,
      }));

    // 7. Yardımcı Malzemeler
    const yardimciMalzemeler = rawAccs
      .filter((a) => a.category === "TAKAZ_BAGLANTI")
      .map((a) => ({
        stokkodu: a.code || "13135",
        aciklama: a.name,
        miktar: a.quantity,
        birim: "adet" as const,
        birimFiyat: a.unitPriceTL,
        toplamFiyat: a.totalPriceTL,
      }));

    // 8. Aksesuarlar
    const aksesuarlar = rawAccs
      .filter((a) => a.category === "DONANIM" || a.category === "MENTESE")
      .map((a) => ({
        stokkodu: a.code || "13185",
        aciklama: a.name,
        miktar: a.quantity,
        birim: (a.unit === "TAKIM" ? "takım" : "adet") as "takım" | "adet",
        birimFiyat: a.unitPriceTL,
        toplamFiyat: a.totalPriceTL,
      }));

    // 9. Montaj ve İzolasyon Malzemeleri
    const montajIzolasyon = rawAccs
      .filter((a) => a.category === "SARF_MALZEME" && a.code !== "13190" && !a.name.includes("Vida"))
      .map((a) => ({
        stokkodu: a.code || "13514",
        aciklama: a.name,
        miktar: a.quantity,
        birim: "adet" as const,
        birimFiyat: a.unitPriceTL,
        toplamFiyat: a.totalPriceTL,
      }));

    const buildGroup = (name: string, list: any[]) => ({
      categoryName: name,
      items: list,
      totalAmount: list.reduce((sum, item) => sum + item.toplamFiyat, 0),
    });

    return [
      buildGroup("Ana Profiller", anaProfiller),
      buildGroup("Çıtalar", citalar),
      buildGroup("Yardımcı Pls Profiller", yardimciProfiller),
      buildGroup("Yardımcı Malzemeler", yardimciMalzemeler),
      buildGroup("Destek Sacı", destekSaclari),
      buildGroup("Contalar", contalar),
      buildGroup("Vidalar", vidalar),
      buildGroup("Aksesuarlar", aksesuarlar),
      buildGroup("Montaj ve İzolasyon Malzemeleri", montajIzolasyon),
    ].filter((g) => g.items.length > 0);
  }, [orderSummary]);



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

        {/* Tab Selection for Report View */}
        <div className="flex border-b border-slate-800 gap-4 no-print">
          <button
            onClick={() => setActiveReportView("official")}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeReportView === "official"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            📄 Resmi Fabrika Maliyet Analiz Raporu (M A L İ Y E T   A N A L İ Z İ)
          </button>
          <button
            onClick={() => setActiveReportView("dashboard")}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeReportView === "dashboard"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            📊 İnteraktif Poz & Maliyet Dashboard'u
          </button>
        </div>

        {/* 📄 RESMİ EGEPEN M A L İ Y E T   A N A L İ Z İ FABRİKA MATBU RAPORU */}
        {activeReportView === "official" && (
          <div id="official-cost-analysis-report" className="bg-white text-slate-900 border border-slate-300 rounded-xl p-8 shadow-2xl space-y-6 font-mono text-xs">
            {/* Header Block */}
            <div className="flex justify-between items-start text-[11px] border-b border-slate-300 pb-4 leading-tight">
              <div>
                <p><span className="font-bold">Cari Unvanı :</span> {customer.name || "TAYYAR YÖRÜK"}</p>
                <p><span className="font-bold">Müşterisi   :</span> -</p>
                <p><span className="font-bold">Liste       :</span> TL_Liste No 17 - Aks 516</p>
              </div>
              <div className="text-center">
                <p><span className="font-bold">Sipariş No :</span> S{Date.now().toString().slice(-6)}</p>
                <p><span className="font-bold">Adet       :</span> {activeFilteredItems.length}</p>
                <p><span className="font-bold">Seçenek    :</span> Alış Fiyatı Peşin</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold">Tarih:</span> {today} - 3.07 - E</p>
                <p><span className="font-bold">Sayfa:</span> 1 / 1</p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center py-2">
              <h1 className="text-xl font-black uppercase tracking-[0.4em] text-slate-900 border-b-2 border-t-2 border-slate-900 py-1 inline-block px-12">
                M A L İ Y E T   A N A L İ Z İ
              </h1>
            </div>

            {/* Categorized Detailed Item Tables */}
            <div className="space-y-6">
              {categorizedCostData.map((catGroup) => (
                <div key={catGroup.categoryName} className="space-y-1">
                  <div className="rounded border border-slate-300 overflow-hidden">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold">
                        <tr>
                          <th className="p-1.5 w-24">Stokkodu</th>
                          <th className="p-1.5">Açıklama</th>
                          <th className="p-1.5 text-right w-20">Miktar</th>
                          <th className="p-1.5 text-center w-16">Birim</th>
                          <th className="p-1.5 text-center w-4">x</th>
                          <th className="p-1.5 text-right w-24">Birim Fiyat</th>
                          <th className="p-1.5 text-center w-4">=</th>
                          <th className="p-1.5 text-right w-28">Toplam Fiyat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {catGroup.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-1.5 font-bold text-slate-900">{it.stokkodu}</td>
                            <td className="p-1.5 font-sans font-medium text-slate-800">{it.aciklama}</td>
                            <td className="p-1.5 text-right font-bold">{it.miktar.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</td>
                            <td className="p-1.5 text-center text-slate-600">{it.birim}</td>
                            <td className="p-1.5 text-center text-slate-400">x</td>
                            <td className="p-1.5 text-right">{it.birimFiyat.toFixed(2)} TL</td>
                            <td className="p-1.5 text-center text-slate-400">=</td>
                            <td className="p-1.5 text-right font-bold text-slate-900">{it.toplamFiyat.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center bg-slate-100 px-3 py-1.5 rounded border border-slate-300 font-bold text-xs text-slate-900">
                    <span>{catGroup.categoryName} Toplamı</span>
                    <span>{catGroup.totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Official Report Bottom Financial Summary Grid */}
            <div className="border-t-2 border-slate-900 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
              {/* Left Metric Calculations */}
              <div className="space-y-1 bg-slate-50 p-4 rounded border border-slate-300">
                <div className="flex justify-between"><span>Profil m/tül :</span><span className="font-bold">{orderSummary.totalProfileMeters.toLocaleString("tr-TR")}</span></div>
                <div className="flex justify-between"><span>Profil kg.   :</span><span className="font-bold">{(orderSummary.totalProfileMeters * 2.35).toFixed(3)}</span></div>
                <div className="flex justify-between"><span>Toplam kg.   :</span><span className="font-bold">{(orderSummary.totalProfileMeters * 2.35 + orderSummary.totalSteelMeters * 1.2).toFixed(3)}</span></div>
                <div className="flex justify-between border-t border-slate-300 pt-1"><span>Profil Tutarı:</span><span className="font-bold">{orderSummary.breakdown.profileCostTL.toLocaleString("tr-TR")} TL</span></div>
                <div className="flex justify-between"><span>M/tül Maliyeti:</span><span className="font-bold">{(orderSummary.costPriceTL / (orderSummary.totalProfileMeters || 1)).toFixed(2)} TL</span></div>
                <div className="flex justify-between"><span>Kg. Maliyeti :</span><span className="font-bold">{(orderSummary.costPriceTL / ((orderSummary.totalProfileMeters * 2.35) || 1)).toFixed(2)} TL</span></div>
                <div className="flex justify-between border-t border-slate-300 pt-1"><span>Ortalama m/tül Mal.:</span><span className="font-bold">{(orderSummary.totalPriceTL / (orderSummary.totalProfileMeters || 1)).toFixed(2)} TL</span></div>
                <div className="flex justify-between"><span>Ortalama Kg. Mal.  :</span><span className="font-bold">{(orderSummary.totalPriceTL / ((orderSummary.totalProfileMeters * 2.35) || 1)).toFixed(2)} TL</span></div>
                <div className="flex justify-between"><span>Profil m/tül / Kg. :</span><span className="font-bold">0,43</span></div>
              </div>

              {/* Right Grand Financial Calculation Box */}
              <div className="space-y-2 bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-lg font-mono">
                <div className="flex justify-between text-sm">
                  <span>Toplam (Malzeme Gideri) :</span>
                  <span className="font-bold text-rose-300">{orderSummary.costPriceTL.toLocaleString("tr-TR")} TL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>İşçilik % 25 :</span>
                  <span className="font-bold text-purple-300">{orderSummary.breakdown.laborCostTL.toLocaleString("tr-TR")} TL</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-700 pt-2">
                  <span>Ara Toplam :</span>
                  <span className="font-bold text-cyan-300">{(orderSummary.costPriceTL + orderSummary.breakdown.laborCostTL).toLocaleString("tr-TR")} TL</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>K.D.V. % 20 :</span>
                  <span className="font-bold text-amber-300">{Math.round((orderSummary.costPriceTL + orderSummary.breakdown.laborCostTL) * 0.20).toLocaleString("tr-TR")} TL</span>
                </div>
                <div className="flex justify-between text-base font-black border-t-2 border-emerald-500 pt-2 text-emerald-400">
                  <span>GENEL TOPLAM :</span>
                  <span>{Math.round((orderSummary.costPriceTL + orderSummary.breakdown.laborCostTL) * 1.20).toLocaleString("tr-TR")} TL</span>
                </div>
                <div className="pt-2 text-[10px] text-slate-400 flex justify-between border-t border-slate-800">
                  <span>USD Kur : 50,00</span>
                  <span>EUR Kur : 60,00</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📊 İNTERAKTİF DASHBOARD VIEW */}
        {activeReportView === "dashboard" && (
          <div id="summary-dashboard-area" className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 shadow-2xl space-y-6">
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

            {/* 🧩 MALİYET VE MALZEME KIRILIM KARTLARI */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
              <div className="p-3 bg-white border rounded-lg shadow-sm">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">PVC Profil Maliyeti</span>
                <span className="text-sm font-bold text-slate-900 block">
                  {convertPrice(orderSummary.breakdown?.profileCostTL || 0).toLocaleString("tr-TR")} {getSymbol()}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">{orderSummary.totalProfileMeters} Metre Tül</span>
              </div>
              <div className="p-3 bg-white border rounded-lg shadow-sm">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Galvaniz Sac Maliyeti</span>
                <span className="text-sm font-bold text-slate-900 block">
                  {convertPrice(orderSummary.breakdown?.steelCostTL || 0).toLocaleString("tr-TR")} {getSymbol()}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">{orderSummary.totalSteelMeters} Metre Sac</span>
              </div>
              <div className="p-3 bg-white border rounded-lg shadow-sm">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Isıcam Maliyeti</span>
                <span className="text-sm font-bold text-cyan-700 block">
                  {convertPrice(orderSummary.breakdown?.glassCostTL || 0).toLocaleString("tr-TR")} {getSymbol()}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">{orderSummary.totalGlassSqM} m² Cam</span>
              </div>
              <div className="p-3 bg-white border rounded-lg shadow-sm">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Aksesuar & Donanım</span>
                <span className="text-sm font-bold text-blue-700 block">
                  {convertPrice(orderSummary.breakdown?.accessoryCostTL || 0).toLocaleString("tr-TR")} {getSymbol()}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">{orderSummary.allAccessories.length} Kalem Malzeme</span>
              </div>
              <div className="p-3 bg-white border rounded-lg shadow-sm">
                <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">İşçilik & Fabrika Payı</span>
                <span className="text-sm font-bold text-purple-700 block">
                  {convertPrice(orderSummary.breakdown?.laborCostTL || 0).toLocaleString("tr-TR")} {getSymbol()}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">%15 Fabrika Amortisman</span>
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

          {/* 📦 AKSESUAR VE SARF MALZEME REÇETESİ (BOM TABLE) */}


          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>🔩 Aksesuar ve Sarf Malzeme İmalat Reçetesi (BOM Listesi)</span>
              <span className="text-xs text-blue-600 font-semibold font-mono">
                {orderSummary.allAccessories.length} Çeşit Aksesuar
              </span>
            </h3>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700 font-sans">
                <thead className="bg-slate-100 text-slate-600 font-mono border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Stok Kodu</th>
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5">Malzeme & Aksesuar Tanımı</th>
                    <th className="p-2.5 text-center">Birim</th>
                    <th className="p-2.5 text-center">Miktar</th>
                    <th className="p-2.5 text-right">Birim Fiyat ({getSymbol()})</th>
                    <th className="p-2.5 text-right">Toplam Tutar ({getSymbol()})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-mono">
                  {orderSummary.allAccessories.map((acc, aIdx) => {
                    const priceConv = convertPrice(acc.unitPriceTL);
                    const totalConv = convertPrice(acc.totalPriceTL);
                    return (
                      <tr key={acc.id + aIdx} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-400 font-mono">{aIdx + 1}</td>
                        <td className="p-2.5 font-bold text-blue-700 font-mono">
                          [{acc.code || "10000"}]
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {acc.category}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold text-slate-900 font-sans">{acc.name}</td>
                        <td className="p-2.5 text-center font-bold text-slate-500">{acc.unit}</td>
                        <td className="p-2.5 text-center font-bold text-blue-800 text-sm">
                          {acc.quantity % 1 === 0 ? acc.quantity : acc.quantity.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-right text-slate-600">
                          {priceConv.toLocaleString("tr-TR")} {getSymbol()}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          {totalConv.toLocaleString("tr-TR")} {getSymbol()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-200 text-slate-900 font-mono">
                  <tr>
                    <td colSpan={7} className="p-2.5 text-right font-sans">TOPLAM AKSESUAR TUTARI:</td>
                    <td className="p-2.5 text-right text-blue-700 text-sm">
                      {convertPrice(orderSummary.totalAccessoryCostTL).toLocaleString("tr-TR")} {getSymbol()}
                    </td>
                  </tr>
                </tfoot>

              </table>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}



