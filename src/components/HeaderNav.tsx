"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_SETTINGS, AppSettings } from "@/components/SettingsModal";
import { CustomerModal, DEFAULT_CUSTOMERS } from "@/components/CustomerModal";
import { Customer } from "@/lib/pencereEngine";

export type ThemeMode = "light" | "dark" | "system";

export function HeaderNav() {
  const pathname = usePathname();

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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const isDark = themeMode === "dark" || (themeMode === "system" && systemIsDark);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("app_theme", mode);
    if (mode === "dark" || (mode === "system" && systemIsDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <>
      <header
        className={`border-b p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 backdrop-blur-md sticky top-0 z-40 transition-colors ${
          isDark
            ? "bg-slate-950/90 border-slate-800/80 text-white shadow-lg shadow-slate-950/50"
            : "bg-white/90 border-slate-200/80 text-slate-900 shadow-sm"
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

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              pathname === "/"
                ? "bg-blue-600 text-white shadow-sm"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📐 CAD Çizim
          </Link>
          <Link
            href="/drawings"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              pathname === "/drawings"
                ? "bg-blue-600 text-white shadow-sm"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🎨 Grafik & Çizim Kataloğu
          </Link>
          <Link
            href="/summary"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              pathname === "/summary"
                ? "bg-blue-600 text-white shadow-sm"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📊 Maliyet & Satış Özeti
          </Link>
          <Link
            href="/cut-list"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              pathname === "/cut-list"
                ? "bg-blue-600 text-white shadow-sm"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ✂️ 1D Kesim & CNC
          </Link>
          <Link
            href="/glass-order"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              pathname === "/glass-order"
                ? "bg-blue-600 text-white shadow-sm"
                : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🪟 Cam Sipariş
          </Link>
        </nav>

        {/* Sağ Aksiyon Butonları */}
        <div className="flex items-center gap-2">
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
          </button>
        </div>
      </header>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        activeCustomer={activeCustomer}
        onSelectCustomer={(cust) => {
          setActiveCustomer(cust);
          localStorage.setItem("app_active_customer", JSON.stringify(cust));
          setIsCustomerModalOpen(false);
        }}
        onAddCustomer={(newCust) => {
          const updated = [...customers, newCust];
          setCustomers(updated);
          localStorage.setItem("app_customers", JSON.stringify(updated));
        }}
      />
    </>
  );
}
