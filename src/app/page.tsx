"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PROFILE_COLORS,
  WindowItem,
  Customer,
  calculateWindowDimensions,
  calculateOrderSummary,
  optimizeCutList,
} from "@/lib/pencereEngine";
import { DEFAULT_SETTINGS, AppSettings, SettingsModal } from "@/components/SettingsModal";
import { WindowCanvas } from "@/components/WindowCanvas";
import { CutListModal } from "@/components/CutListModal";
import { QuoteModal } from "@/components/QuoteModal";
import { CustomerModal, DEFAULT_CUSTOMERS } from "@/components/CustomerModal";

export type ThemeMode = "light" | "dark" | "system";

export default function SaaSWindowDashboard() {
  // Tema Modu State ("light" | "dark" | "system")
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [systemIsDark, setSystemIsDark] = useState<boolean>(false);

  // Fabrika Parametre Ayarları State (Kalıcı LocalStorage)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Sayfa yüklendiğinde ayarları ve temayı yükle
  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme") as ThemeMode | null;
    if (savedTheme) {
      setThemeMode(savedTheme);
    }

    const savedSettings = localStorage.getItem("app_factory_settings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {}
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemIsDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem("app_factory_settings", JSON.stringify(newSettings));
  };

  // Aktif Koyu/Açık Durumu Hesabı
  const isDark = useMemo(() => {
    if (themeMode === "dark") return true;
    if (themeMode === "light") return false;
    return systemIsDark;
  }, [themeMode, systemIsDark]);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("app_theme", mode);
  };

  // Müşteri / Cari Kartlar State
  const [customers, setCustomers] = useState<Customer[]>(DEFAULT_CUSTOMERS);
  const [activeCustomer, setActiveCustomer] = useState<Customer>(DEFAULT_CUSTOMERS[0]);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Siparişteki Doğrama Pozları (Çoklu Poz Mimarisi)
  const [items, setItems] = useState<WindowItem[]>([
    {
      id: "pencere-1",
      name: "Poz 1: Salon Çift Açılım Pencere",
      width: 1500,
      height: 1400,
      color: PROFILE_COLORS[0], // Standart Beyaz
      verticalMullionsCount: 1,
      horizontalMullionsCount: 0,
      divisions: [
        { id: "div-1", type: "sabit", sashVerticalMullions: 0, sashHorizontalMullions: 0 },
        { id: "div-2", type: "cift-acilim", sashVerticalMullions: 0, sashHorizontalMullions: 0 },
      ],
    },
  ]);

  // Şu An Aktif Düzenlenen Poz İndeksi
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  // Güvenli Aktif Poz Referansı
  const activeItem = items[activeItemIndex] || items[0];

  // Modal Durumları
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCutModalOpen, setIsCutModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Tüm Sipariş (Tüm Pozlar) Toplam Hesap Çıktısı
  const orderSummary = useMemo(() => {
    return calculateOrderSummary(items, settings);
  }, [items, settings]);

  // Aktif Düzenlenen Poz Hesaplaması
  const calcResult = useMemo(() => {
    return calculateWindowDimensions(activeItem, settings);
  }, [activeItem, settings]);

  // Siparişteki Tüm Pozların Harmanlanmış 1D Profil Kesim Optimizasyonu
  const optimizedBars = useMemo(() => {
    return optimizeCutList(orderSummary.allCutPieces, settings.stockBarLength, settings.sawKerf);
  }, [orderSummary, settings]);

  // Aktif Pozu Güncelleme Yardımcısı
  const updateActiveItem = (updated: WindowItem) => {
    const copy = [...items];
    copy[activeItemIndex] = updated;
    setItems(copy);
  };

  // Yeni Poz Ekleme
  const handleAddNewPoz = () => {
    const newPozNum = items.length + 1;
    const newPoz: WindowItem = {
      id: `pencere-${Date.now()}`,
      name: `Poz ${newPozNum}: Yeni Pencere Pozu`,
      width: 1200,
      height: 1200,
      color: PROFILE_COLORS[0],
      verticalMullionsCount: 0,
      horizontalMullionsCount: 0,
      divisions: [
        { id: "div-1", type: "sabit", sashVerticalMullions: 0, sashHorizontalMullions: 0 },
      ],
    };
    setItems([...items, newPoz]);
    setActiveItemIndex(items.length);
  };

  // Poz Çoğaltma / Kopyalama
  const handleDuplicatePoz = (indexToDup: number) => {
    const target = items[indexToDup];
    if (!target) return;
    const duplicated: WindowItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `pencere-${Date.now()}`,
      name: `${target.name} (Kopya)`,
    };
    const copy = [...items];
    copy.splice(indexToDup + 1, 0, duplicated);
    setItems(copy);
    setActiveItemIndex(indexToDup + 1);
  };

  // Poz Silme
  const handleDeletePoz = (indexToDelete: number) => {
    if (items.length <= 1) return; // En az 1 poz kalmalı
    const copy = items.filter((_, idx) => idx !== indexToDelete);
    setItems(copy);
    if (activeItemIndex >= copy.length) {
      setActiveItemIndex(copy.length - 1);
    }
  };

  // Kasa Geneli Dikey & Yatay Orta Kayıt Güncelleme
  const handleGridMullionsChange = (vCount: number, hCount: number) => {
    const totalDivs = (vCount + 1) * (hCount + 1);
    const newDivisions = Array.from({ length: totalDivs }).map((_, idx) => ({
      id: `div-${idx + 1}`,
      type: (activeItem.divisions[idx]?.type || "sabit") as any,
      sashVerticalMullions: activeItem.divisions[idx]?.sashVerticalMullions || 0,
      sashHorizontalMullions: activeItem.divisions[idx]?.sashHorizontalMullions || 0,
    }));

    updateActiveItem({
      ...activeItem,
      verticalMullionsCount: vCount,
      horizontalMullionsCount: hCount,
      divisions: newDivisions,
    });
  };

  // Bölme Tipi Güncelleme
  const handleUpdateDivisionType = (
    index: number,
    type: "sabit" | "tek-acilim" | "cift-acilim" | "vasistas"
  ) => {
    const updated = [...activeItem.divisions];
    if (updated[index]) {
      updated[index].type = type;
      updateActiveItem({ ...activeItem, divisions: updated });
    }
  };

  // Kanat İçi Özel Dikey/Yatay Orta Kayıt Güncelleme
  const handleUpdateSashMullions = (
    index: number,
    vMullions: number,
    hMullions: number
  ) => {
    const updated = [...activeItem.divisions];
    if (updated[index]) {
      updated[index].sashVerticalMullions = vMullions;
      updated[index].sashHorizontalMullions = hMullions;
      updateActiveItem({ ...activeItem, divisions: updated });
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-800 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/60 via-slate-50 to-slate-100"
      }`}
    >
      {/* SaaS Header / Navbar */}
      <header
        className={`border-b sticky top-0 z-40 px-6 py-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md transition-colors ${
          isDark
            ? "border-slate-800 bg-slate-900/80 text-white"
            : "border-slate-200/80 bg-white/80 text-slate-900 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          {settings.company.logoUrl ? (
            <img
              src={settings.company.logoUrl}
              alt={settings.company.name}
              className="h-9 max-w-[120px] object-contain rounded-lg border bg-white p-0.5 shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20 text-sm">
              SS
            </div>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
              {settings.company.name || "Sistem SaaS"}{" "}
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  isDark
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : "bg-blue-50 text-blue-700 border-blue-200/80"
                }`}
              >
                Cloud V1.2
              </span>
            </h1>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {settings.company.subtitle || "PVC & Alüminyum Çizim ve İmalat Otomasyonu"}
            </p>
          </div>
        </div>

        {/* Orta & Sağ Aksiyon Butonları */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Tema Değiştirici (Light / Dark / System) */}
          <div
            className={`flex items-center p-0.5 rounded-xl border text-xs font-medium ${
              isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              onClick={() => handleThemeChange("light")}
              title="Açık Tema"
              className={`px-2 py-1 rounded-lg transition ${
                themeMode === "light"
                  ? "bg-white text-blue-700 font-bold shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ☀️
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              title="Koyu Tema"
              className={`px-2 py-1 rounded-lg transition ${
                themeMode === "dark"
                  ? "bg-slate-800 text-cyan-400 font-bold shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🌙
            </button>
            <button
              onClick={() => handleThemeChange("system")}
              title="Sistem Teması"
              className={`px-2 py-1 rounded-lg transition ${
                themeMode === "system"
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              💻
            </button>
          </div>

          {/* Cari Kart / Müşteri Seçici Butonu */}
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              isDark
                ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
                : "bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200"
            }`}
          >
            <span>👤 Cari: {activeCustomer.name}</span>
            <span className={isDark ? "text-cyan-400" : "text-blue-500"}>▼</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-1.5 ${
              isDark
                ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
                : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            ⚙️ Ayarlar
          </button>
          <button
            onClick={() => setIsCutModalOpen(true)}
            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-1.5 ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/30"
                : "bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-200/80"
            }`}
          >
            ✂️ 1D Kesim ({items.length})
          </button>
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            📄 Teklif Formu ({orderSummary.totalPriceTL.toLocaleString("tr-TR")} ₺)
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
        {/* Sol Kontrol & Parametre Paneli */}
        <div
          className={`lg:col-span-4 border rounded-2xl p-5 sm:p-6 flex flex-col gap-6 shadow-xl backdrop-blur-sm transition-colors ${
            isDark
              ? "bg-slate-900/80 border-slate-800 text-slate-100 shadow-slate-950/50"
              : "bg-white/90 border-slate-200/80 text-slate-900 shadow-slate-200/50"
          }`}
        >
          <div>
            <h2
              className={`text-md font-bold flex items-center gap-2 pb-3 border-b ${
                isDark ? "text-white border-slate-800" : "text-slate-900 border-slate-100"
              }`}
            >
              ⚙️ Poz ve Geometri Parametreleri
            </h2>

            <div className="space-y-4 mt-4">
              {/* Poz Adı */}
              <div>
                <label
                  className={`text-xs font-semibold block mb-1 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Poz / Pencere Tanımı
                </label>
                <input
                  type="text"
                  value={activeItem.name}
                  onChange={(e) => updateActiveItem({ ...activeItem, name: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none transition ${
                    isDark
                      ? "bg-slate-950 border-slate-800 text-white focus:border-cyan-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                />
              </div>

              {/* Genişlik & Yükseklik */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`text-xs font-semibold block mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Dış Genişlik (mm)
                  </label>
                  <input
                    type="number"
                    min={400}
                    max={3500}
                    step={10}
                    value={activeItem.width}
                    onChange={(e) =>
                      updateActiveItem({ ...activeItem, width: Number(e.target.value) })
                    }
                    className={`w-full border rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none transition ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-cyan-300 focus:border-cyan-500"
                        : "bg-slate-50 border-slate-200 text-blue-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`text-xs font-semibold block mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Dış Yükseklik (mm)
                  </label>
                  <input
                    type="number"
                    min={400}
                    max={3000}
                    step={10}
                    value={activeItem.height}
                    onChange={(e) =>
                      updateActiveItem({ ...activeItem, height: Number(e.target.value) })
                    }
                    className={`w-full border rounded-lg px-3 py-2 text-sm font-mono font-bold focus:outline-none transition ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-cyan-300 focus:border-cyan-500"
                        : "bg-slate-50 border-slate-200 text-blue-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    }`}
                  />
                </div>
              </div>

              {/* Kasa Geneli Dikey & Yatay Orta Kayıtlar */}
              <div
                className={`p-3.5 rounded-xl border space-y-3 ${
                  isDark
                    ? "bg-slate-950/60 border-slate-800/80"
                    : "bg-slate-50/80 border-slate-200/80"
                }`}
              >
                <span
                  className={`text-xs font-bold block ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  🪟 Kasa Geneli Orta Kayıt Düzeni
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className={`text-[11px] block mb-1 font-medium ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Dikey Kayıt Sayısı
                    </label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((v) => (
                        <button
                          key={`v-${v}`}
                          onClick={() =>
                            handleGridMullionsChange(v, activeItem.horizontalMullionsCount)
                          }
                          className={`flex-1 py-1 rounded text-xs font-bold transition border ${
                            activeItem.verticalMullionsCount === v
                              ? isDark
                                ? "bg-cyan-600 text-white border-cyan-500"
                                : "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : isDark
                              ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className={`text-[11px] block mb-1 font-medium ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Yatay Kayıt Sayısı
                    </label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((h) => (
                        <button
                          key={`h-${h}`}
                          onClick={() =>
                            handleGridMullionsChange(activeItem.verticalMullionsCount, h)
                          }
                          className={`flex-1 py-1 rounded text-xs font-bold transition border ${
                            activeItem.horizontalMullionsCount === h
                              ? isDark
                                ? "bg-cyan-600 text-white border-cyan-500"
                                : "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : isDark
                              ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profil Lamine Rengi */}
              <div>
                <label
                  className={`text-xs font-semibold block mb-1.5 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Profil ve Kaplama Rengi
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {PROFILE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateActiveItem({ ...activeItem, color: c })}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition ${
                        activeItem.color.id === c.id
                          ? isDark
                            ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-sm"
                            : "bg-blue-50/80 border-blue-500 text-blue-900 shadow-sm"
                          : isDark
                          ? "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-4 h-4 rounded-full border shadow-inner ${
                            isDark ? "border-slate-600" : "border-slate-300"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </div>
                      {c.priceMultiplier > 1 && (
                        <span
                          className={`text-[10px] font-mono font-semibold ${
                            isDark ? "text-amber-400" : "text-amber-600"
                          }`}
                        >
                          +{Math.round((c.priceMultiplier - 1) * 100)}% Lamine
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Anlık Hesaplanan Sipariş Geneli Maliyet, Satış & Kar Özeti */}
          <div className="mt-auto bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 rounded-xl border border-slate-800 space-y-3 text-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                📊 Toplam Sipariş Maliyet & Satış Özeti
              </h3>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                {items.length} Poz Kalemi
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Toplam Profil</span>
                <span className="font-bold text-white text-sm">{orderSummary.totalProfileMeters} m</span>
              </div>
              <div>
                <span className="text-slate-400 block">Destek Sacı</span>
                <span className="font-bold text-white text-sm">{orderSummary.totalSteelMeters} m</span>
              </div>
              <div>
                <span className="text-slate-400 block">Toplam Cam Alanı</span>
                <span className="font-bold text-white text-sm">{orderSummary.totalGlassSqM} m²</span>
              </div>
              <div>
                <span className="text-slate-400 block">Fabrika Maliyeti</span>
                <span className="font-bold text-amber-300 text-sm">
                  {orderSummary.costPriceTL.toLocaleString("tr-TR")} ₺
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Tahmini Net Kar</span>
                <span className="font-extrabold text-emerald-400 text-sm font-mono">
                  +{orderSummary.profitTL.toLocaleString("tr-TR")} ₺
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[11px] block">Müşteri Satış Toplamı</span>
                <span className="font-extrabold text-cyan-300 text-base font-mono">
                  {orderSummary.totalPriceTL.toLocaleString("tr-TR")} ₺
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ İnteraktif Tuval & Çoklu Poz Sekmeleri */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Poz Sekmeleri (Poz 1, Poz 2, ...) */}
          <div
            className={`border rounded-2xl p-3 shadow-md backdrop-blur-sm flex items-center gap-2 overflow-x-auto transition-colors ${
              isDark
                ? "bg-slate-900/80 border-slate-800 text-slate-200"
                : "bg-white/90 border-slate-200/80 text-slate-800 shadow-slate-200/50"
            }`}
          >
            <span
              className={`text-xs font-bold px-2 flex items-center gap-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              🪟 Pozlar:
            </span>

            {items.map((item, idx) => {
              const isActive = idx === activeItemIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItemIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? isDark
                        ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-500/20"
                        : "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                      : isDark
                      ? "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.name}</span>
                  <span
                    className={`text-[10px] font-mono opacity-80 ${
                      isActive ? "text-white" : isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    ({item.width}x{item.height})
                  </span>

                  {/* Kopyala & Sil Butonları */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicatePoz(idx);
                    }}
                    title="Pozu Kopyala"
                    className="hover:scale-125 transition ml-1 text-slate-400 hover:text-white"
                  >
                    📋
                  </button>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePoz(idx);
                      }}
                      title="Pozu Sil"
                      className="hover:scale-125 transition text-slate-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}

            <button
              onClick={handleAddNewPoz}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1 whitespace-nowrap ml-auto"
            >
              + Yeni Poz Ekle
            </button>
          </div>

          {/* Çizim Tuval Alanı */}
          <div
            className={`border rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[440px] shadow-xl relative backdrop-blur-sm transition-colors ${
              isDark
                ? "bg-slate-900/80 border-slate-800 shadow-slate-950/50"
                : "bg-white/90 border-slate-200/80 shadow-slate-200/50"
            }`}
          >
            <div
              className={`absolute top-4 left-4 text-xs font-semibold flex items-center gap-1.5 ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Aktif Çizim:{" "}
              <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                {activeItem.name}
              </span>
            </div>

            <WindowCanvas
              item={activeItem}
              onUpdateDivisionType={handleUpdateDivisionType}
              onUpdateSashMullions={handleUpdateSashMullions}
              isDark={isDark}
            />
          </div>

          {/* İmalat & Kesim Tablosu Önizlemesi */}
          <div
            className={`border rounded-2xl p-6 shadow-xl backdrop-blur-sm transition-colors ${
              isDark
                ? "bg-slate-900/80 border-slate-800 text-slate-100 shadow-slate-950/50"
                : "bg-white/90 border-slate-200/80 text-slate-900 shadow-slate-200/50"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className={`text-sm font-bold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  📋 Aktif Poz Kesim Ölçüleri ({calcResult.cutPieces.length} Parça)
                </h3>
                <p
                  className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Düşümler ve 45°/90° köşe açıları otomatik hesaplanmıştır.
                </p>
              </div>
              <button
                onClick={() => setIsCutModalOpen(true)}
                className={`text-xs font-semibold underline flex items-center gap-1 ${
                  isDark ? "text-cyan-400 hover:text-cyan-300" : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Tüm Pozların 1D Optimizasyon Raporunu Göster →
              </button>
            </div>

            <div
              className={`overflow-x-auto rounded-xl border ${
                isDark ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <table
                className={`w-full text-left text-xs ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                <thead
                  className={`font-mono border-b ${
                    isDark
                      ? "bg-slate-950 text-slate-400 border-slate-800"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  <tr>
                    <th className="px-3 py-2.5">Eleman Adı</th>
                    <th className="px-3 py-2.5">Tip</th>
                    <th className="px-3 py-2.5">Kesim Ölçüsü</th>
                    <th className="px-3 py-2.5">Adet</th>
                    <th className="px-3 py-2.5">Açı</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark
                      ? "divide-slate-800 bg-slate-950/40"
                      : "divide-slate-100 bg-white"
                  }`}
                >
                  {calcResult.cutPieces.map((p) => (
                    <tr
                      key={p.id}
                      className={isDark ? "hover:bg-slate-800/50 transition" : "hover:bg-slate-50/80 transition"}
                    >
                      <td
                        className={`px-3 py-2 font-medium ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {p.label}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                            isDark
                              ? "bg-slate-800 text-slate-300 border-slate-700"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {p.type}
                        </span>
                      </td>
                      <td
                        className={`px-3 py-2 font-mono font-bold ${
                          isDark ? "text-cyan-400" : "text-blue-600"
                        }`}
                      >
                        {p.length} mm
                      </td>
                      <td className="px-3 py-2 font-bold">{p.quantity}</td>
                      <td
                        className={`px-3 py-2 font-mono ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {p.angle}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Dialoglar */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        activeCustomer={activeCustomer}
        onSelectCustomer={(cust) => setActiveCustomer(cust)}
        onAddCustomer={(newCust) => setCustomers([...customers, newCust])}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <CutListModal
        isOpen={isCutModalOpen}
        onClose={() => setIsCutModalOpen(false)}
        cutPieces={orderSummary.allCutPieces}
        optimizedBars={optimizedBars}
        sawKerf={settings.sawKerf}
      />

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        customer={activeCustomer}
        items={items}
        orderSummary={orderSummary}
        companyInfo={settings.company}
      />
    </div>
  );
}
