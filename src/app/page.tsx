"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  PROFILE_COLORS,
  EGEPEN_SERIES,
  WindowItem,

  Customer,
  DivisionType,
  SashProfileType,
  calculateWindowDimensions,
  calculateOrderSummary,
  optimizeCutList,
} from "@/lib/pencereEngine";
import { DEFAULT_SETTINGS, AppSettings, SettingsModal } from "@/components/SettingsModal";
import { WindowCanvas } from "@/components/WindowCanvas";
import { CutListModal } from "@/components/CutListModal";
import { GlassOrderModal } from "@/components/GlassOrderModal";
import { QuoteModal } from "@/components/QuoteModal";
import { CustomerModal, DEFAULT_CUSTOMERS } from "@/components/CustomerModal";

export type ThemeMode = "light" | "dark" | "system";

export default function SaaSWindowDashboard() {
  // Müşteri / Cari Kartlar State (En üstte olmalı - Hoisting engelleme)
  const [customers, setCustomers] = useState<Customer[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_customers");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return DEFAULT_CUSTOMERS;
  });

  const [activeCustomer, setActiveCustomer] = useState<Customer>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_active_customer");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_CUSTOMERS[0];
  });

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Siparişteki Doğrama Pozları (Çoklu Poz Mimarisi)
  const [items, setItems] = useState<WindowItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_order_items");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return [
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
    ];
  });

  // Tema Modu State ("light" | "dark" | "system")
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_theme");
      if (saved) return saved as ThemeMode;
    }
    return "light";
  });
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Fabrika Parametre Ayarları State (Kalıcı LocalStorage)
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_factory_settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Şu An Aktif Düzenlenen Poz İndeksi
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  // Güvenli Aktif Poz Referansı
  const activeItem = items[activeItemIndex] || items[0];

  // Modal Durumları
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCutModalOpen, setIsCutModalOpen] = useState(false);
  const [isGlassModalOpen, setIsGlassModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Sayfa yüklendiğinde ayarları ve temayı yükle
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem("app_factory_settings", JSON.stringify(newSettings));
  };

  // Sipariş pozlarını güncelleyip kalıcılaştıran yardımcı (Kalıcı Sipariş)
  const updateItems = (next: WindowItem[] | ((prev: WindowItem[]) => WindowItem[])) => {
    setItems((prev) => {
      const resolved = typeof next === "function" ? (next as (p: WindowItem[]) => WindowItem[])(prev) : next;
      localStorage.setItem("app_order_items", JSON.stringify(resolved));
      return resolved;
    });
  };

  // Müşterileri güncelleyip kalıcılaştıran yardımcı (Kalıcı Cari Kartlar)
  const updateCustomers = (next: Customer[]) => {
    setCustomers(next);
    localStorage.setItem("app_customers", JSON.stringify(next));
  };

  // Aktif müşteriyi güncelleyip kalıcılaştıran yardımcı
  const selectCustomer = (next: Customer) => {
    setActiveCustomer(next);
    localStorage.setItem("app_active_customer", JSON.stringify(next));
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

  // Aktif Pozun Sürme Serisi Olup Olmadığı
  const isSurmeSelected = useMemo(() => {
    const seri = EGEPEN_SERIES.find((s) => s.id === activeItem.systemType);
    return seri ? seri.isSliding : false;
  }, [activeItem.systemType]);



  // Aktif Düzenlenen Poz Hesaplaması

  const calcResult = useMemo(() => {
    return calculateWindowDimensions(activeItem, settings);
  }, [activeItem, settings]);

  // Tüm Sipariş (Tüm Pozlar) Toplam Hesap Çıktısı
  const orderSummary = useMemo(() => {
    return calculateOrderSummary(items, settings);
  }, [items, settings]);

  // Siparişteki Tüm Pozların Harmanlanmış 1D Profil Kesim Optimizasyonu

  const optimizedBars = useMemo(() => {
    return optimizeCutList(orderSummary.allCutPieces, settings.stockBarLength, settings.sawKerf);
  }, [orderSummary, settings]);

  // Aktif Pozu Güncelleme Yardımcısı
  const updateActiveItem = (updated: WindowItem) => {
    const copy = [...items];
    copy[activeItemIndex] = updated;
    updateItems(copy);
  };

  // Genişlik Input Ref
  const widthInputRef = React.useRef<HTMLInputElement>(null);

  // Yeni Poz Ekleme (Önceki Pozun Seri, Kasa Tipi ve Rengini Miras Alır)
  const handleAddNewPoz = useCallback(() => {
    const lastItem = items[items.length - 1] || activeItem;
    const newPozNum = items.length + 1;
    const newPoz: WindowItem = {
      id: `pencere-${crypto.randomUUID()}`,
      name: `Poz ${newPozNum}: Yeni Pencere Pozu`,
      width: 1200,
      height: 1200,
      quantity: 1,
      color: lastItem?.color || PROFILE_COLORS[0],
      systemType: lastItem?.systemType || "EGEPEN_ZENDOW",
      kasaProfileType: lastItem?.kasaProfileType || "L_KASA",
      verticalMullionsCount: 0,
      horizontalMullionsCount: 0,
      divisions: [
        { id: "div-1", type: "sabit", sashVerticalMullions: 0, sashHorizontalMullions: 0 },
      ],
    };
    updateItems((prev) => [...prev, newPoz]);
    setActiveItemIndex(items.length);

    // Otomatik olarak Genişlik alanına odaklan ve metni seç
    setTimeout(() => {
      if (widthInputRef.current) {
        widthInputRef.current.focus();
        widthInputRef.current.select();
      }
    }, 50);
  }, [items, activeItem]);

  // Global (") Çift Tırnak Tuşu Kısayolu Entegrasyonu
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Çift tırnak tuşu: '"' veya Quote (e.key === '"' veya e.code === 'Quote')
      if (e.key === '"' || (e.code === 'Quote' && e.shiftKey)) {
        // Input içerisinde dahi olsa " tuşu basıldığında yeni poz aç ve genişliğe odaklan
        e.preventDefault();
        handleAddNewPoz();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleAddNewPoz]);


  // Poz Çoğaltma / Kopyalama
  const handleDuplicatePoz = (indexToDup: number) => {
    const target = items[indexToDup];
    if (!target) return;
    const duplicated: WindowItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `pencere-${crypto.randomUUID()}`,
      name: `${target.name} (Kopya)`,
    };
    const copy = [...items];
    copy.splice(indexToDup + 1, 0, duplicated);
    updateItems(copy);
    setActiveItemIndex(indexToDup + 1);
  };

  // Poz Silme
  const handleDeletePoz = (indexToDelete: number) => {
    if (items.length <= 1) return; // En az 1 poz kalmalı
    const copy = items.filter((_, idx) => idx !== indexToDelete);
    updateItems(copy);
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
      customVerticalMullions: undefined,
      customHorizontalMullions: undefined,
      divisions: newDivisions,
    });
  };

  // Özel Konumlu Kayıt Ekleme (Offset mm: + Soldan/Üstten, - Sağdan/Alttan)
  const handleAddCustomMullion = (direction: "v" | "h", offset: number) => {
    if (direction === "v") {
      const vCount = activeItem.verticalMullionsCount + 1;
      const currentCustom = activeItem.customVerticalMullions || [];
      const newCustom = [...currentCustom, offset];

      const totalDivs = (vCount + 1) * (activeItem.horizontalMullionsCount + 1);
      const newDivisions = Array.from({ length: totalDivs }).map((_, idx) => ({
        id: `div-${idx + 1}`,
        type: (activeItem.divisions[idx]?.type || "sabit") as any,
        sashVerticalMullions: activeItem.divisions[idx]?.sashVerticalMullions || 0,
        sashHorizontalMullions: activeItem.divisions[idx]?.sashHorizontalMullions || 0,
      }));

      updateActiveItem({
        ...activeItem,
        verticalMullionsCount: vCount,
        customVerticalMullions: newCustom,
        divisions: newDivisions,
      });
    } else {
      const hCount = activeItem.horizontalMullionsCount + 1;
      const currentCustom = activeItem.customHorizontalMullions || [];
      const newCustom = [...currentCustom, offset];

      const totalDivs = (activeItem.verticalMullionsCount + 1) * (hCount + 1);
      const newDivisions = Array.from({ length: totalDivs }).map((_, idx) => ({
        id: `div-${idx + 1}`,
        type: (activeItem.divisions[idx]?.type || "sabit") as any,
        sashVerticalMullions: activeItem.divisions[idx]?.sashVerticalMullions || 0,
        sashHorizontalMullions: activeItem.divisions[idx]?.sashHorizontalMullions || 0,
      }));

      updateActiveItem({
        ...activeItem,
        horizontalMullionsCount: hCount,
        customHorizontalMullions: newCustom,
        divisions: newDivisions,
      });
    }
  };

  // Eşit Dağıt (Sıfırla & Eşit Böl)
  const handleEqualDistributeMullions = (direction: "v" | "h" | "both") => {
    updateActiveItem({
      ...activeItem,
      customVerticalMullions: direction === "h" ? activeItem.customVerticalMullions : undefined,
      customHorizontalMullions: direction === "v" ? activeItem.customHorizontalMullions : undefined,
    });
  };

  // Bölme Tipi & Kanat Profili Güncelleme
  const handleUpdateDivisionType = (
    index: number,
    type: DivisionType,
    sashProfileType?: SashProfileType
  ) => {
    const updated = [...activeItem.divisions];
    if (updated[index]) {
      updated[index].type = type;
      if (sashProfileType) {
        updated[index].sashProfileType = sashProfileType;
      }
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
                Pencere CAD & İmalat
              </span>
            </h1>

            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {settings.company.subtitle || "PVC & Alüminyum Çizim ve İmalat Otomasyonu"}
            </p>
          </div>
        </div>

        {/* Orta & Sağ Aksiyon Butonları */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Tema Değiştirici */}
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
            ✂️ 1D Kesim & CNC ({items.length})
          </button>
          <button
            onClick={() => setIsGlassModalOpen(true)}
            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-1.5 ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-blue-300 border-blue-500/30"
                : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
            }`}
          >
            🪟 Cam Sipariş ({orderSummary.totalGlassSqM} m²)
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
        {/* Sol Kontrol Paneli */}
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

              {/* Form Alanlarında Enter ile İlerleme Fonksiyonu */}
              <div
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const focusables = Array.from(
                      form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select, button")
                    );
                    const currentIndex = focusables.indexOf(e.target as any);
                    if (currentIndex >= 0 && currentIndex < focusables.length - 1) {
                      focusables[currentIndex + 1].focus();
                    } else if (currentIndex === focusables.length - 1) {
                      handleAddNewPoz();
                    }
                  }
                }}
                className="space-y-4 mt-4"
              >


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

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label
                      className={`text-[11px] font-semibold block mb-1 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Genişlik (mm)
                    </label>
                    <input
                      ref={widthInputRef}
                      type="number"
                      min={400}
                      max={3500}
                      step={10}
                      value={activeItem.width}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        updateActiveItem({ ...activeItem, width: Number(e.target.value) })
                      }
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none transition ${
                        isDark
                          ? "bg-slate-950 border-slate-800 text-cyan-300 focus:border-cyan-500"
                          : "bg-slate-50 border-slate-200 text-blue-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-[11px] font-semibold block mb-1 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Yükseklik (mm)
                    </label>
                    <input
                      type="number"
                      min={400}
                      max={3000}
                      step={10}
                      value={activeItem.height}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        updateActiveItem({ ...activeItem, height: Number(e.target.value) })
                      }
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none transition ${
                        isDark
                          ? "bg-slate-950 border-slate-800 text-cyan-300 focus:border-cyan-500"
                          : "bg-slate-50 border-slate-200 text-blue-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-[11px] font-semibold block mb-1 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Poz Adedi
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={activeItem.quantity || 1}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        updateActiveItem({ ...activeItem, quantity: Math.max(1, Number(e.target.value)) })
                      }
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none transition ${
                        isDark
                          ? "bg-slate-950 border-slate-800 text-amber-300 focus:border-cyan-500"
                          : "bg-slate-50 border-slate-200 text-amber-700 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      }`}
                    />
                  </div>
                </div>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`text-xs font-semibold block mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Profil Serisi (Egepen Deceuninck)
                  </label>
                  <select
                    value={activeItem.systemType || "EGEPEN_ZENDOW"}
                    onChange={(e) =>
                      updateActiveItem({ ...activeItem, systemType: e.target.value as any })
                    }
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none transition ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    {EGEPEN_SERIES.map((seri) => (
                      <option key={seri.id} value={seri.id}>
                        {seri.isSliding ? "↔️ " : "🪟 "}
                        {seri.name}
                      </option>
                    ))}
                  </select>

                </div>


                <div>
                  <label
                    className={`text-xs font-semibold block mb-1 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Kasa Profil Kesiti
                  </label>
                  <select
                    value={activeItem.kasaProfileType || (isSurmeSelected ? "SURME_KASA_2" : "L_KASA")}
                    onChange={(e) =>
                      updateActiveItem({ ...activeItem, kasaProfileType: e.target.value as any })
                    }
                    className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none transition ${
                      isDark
                        ? "bg-slate-950 border-slate-800 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  >
                    {!isSurmeSelected && (
                      <>
                        <option value="L_KASA">🧱 L Kasa (Dış Kasa)</option>
                        <option value="T_KASA">🧱 T Kasa (Kayıtlı Kasa)</option>
                        <option value="Z_KASA">🧱 Z Kasa (Pervazlı Kasa)</option>
                        <option value="ESIKLI_KASA">🚪 Alüminyum Eşikli Kasa</option>
                      </>
                    )}
                    {isSurmeSelected && (
                      <>
                        <option value="SURME_KASA_2">↔️ 2 Raylı Sürme Kasa</option>
                        <option value="SURME_KASA_3">↔️ 3 Raylı Sürme Kasa</option>
                      </>
                    )}
                  </select>

                </div>
              </div>



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

        {/* Sağ Çizim ve Poz Sekmeleri */}
        <div className="lg:col-span-8 flex flex-col gap-6">
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

          <div
            className={`border rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[460px] shadow-xl relative backdrop-blur-sm transition-colors ${
              isDark
                ? "bg-slate-900/80 border-slate-800 shadow-slate-950/50"
                : "bg-white/90 border-slate-200/80 shadow-slate-200/50"
            }`}
          >
            <div className="w-full flex items-center justify-between mb-3 pb-2.5 border-b border-slate-200/60">
              <div
                className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Aktif Çizim:{" "}
                <span className={`font-extrabold ${isDark ? "text-cyan-400" : "text-blue-700"}`}>
                  {activeItem.name}
                </span>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                  isDark ? "bg-slate-950 text-cyan-400 border-slate-800" : "bg-blue-50 text-blue-800 border-blue-200"
                }`}
              >
                {activeItem.width} x {activeItem.height} mm
              </span>
            </div>

            <WindowCanvas
              item={activeItem}
              onUpdateDivisionType={handleUpdateDivisionType}
              onUpdateSashMullions={handleUpdateSashMullions}
              onAddCustomMullion={handleAddCustomMullion}
              onEqualDistributeMullions={handleEqualDistributeMullions}
              isDark={isDark}
            />
          </div>

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
        onSelectCustomer={(cust) => selectCustomer(cust)}
        onAddCustomer={(newCust) => updateCustomers([...customers, newCust])}
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
        items={items}
        sawKerf={settings.sawKerf}
      />

      <GlassOrderModal
        isOpen={isGlassModalOpen}
        onClose={() => setIsGlassModalOpen(false)}
        items={items}
        settings={settings}
        orderTitle={items[0]?.name || "İmalat Siparişi"}
        customerName={activeCustomer.name}
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

