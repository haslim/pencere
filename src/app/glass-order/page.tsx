"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import {
  WindowItem,
  calculateOrderSummary,
  PROFILE_COLORS,
} from "@/lib/pencereEngine";
import { DEFAULT_SETTINGS, AppSettings } from "@/components/SettingsModal";
import { DEFAULT_CUSTOMERS } from "@/components/CustomerModal";
import { Customer } from "@/lib/pencereEngine";
import { ArrowLeft, Download, Printer, Layers, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function GlassOrderPage() {
  const [items, setItems] = useState<WindowItem[]>([]);
  const [customer, setCustomer] = useState<Customer>(DEFAULT_CUSTOMERS[0]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [selectedGlassType, setSelectedGlassType] = useState<string>("TÜMÜ");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedItems = localStorage.getItem("app_order_items");
      if (savedItems) {
        try {
          const parsed = JSON.parse(savedItems);
          if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
          else setItems(getDefaultItems());
        } catch (e) {
          setItems(getDefaultItems());
        }
      } else {
        setItems(getDefaultItems());
      }

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

  const orderSummary = useMemo(() => calculateOrderSummary(items, settings), [items, settings]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse font-mono text-sm">Yükleniyor...</p>
      </div>
    );
  }

  const allGlasses = orderSummary.allGlasses;
  const filteredGlasses =
    selectedGlassType === "TÜMÜ"
      ? allGlasses
      : allGlasses.filter((g) => g.type.includes(selectedGlassType));

  const totalM2 = filteredGlasses
    .reduce((acc, g) => acc + g.areaSqM * g.quantity, 0)
    .toFixed(2);
  const totalPieces = filteredGlasses.reduce((acc, g) => acc + g.quantity, 0);

  const handleExportGlassList = () => {
    const textLines = [
      `==========================================`,
      `      CAM & ISICAM İMALAT SİPARİŞİ        `,
      `==========================================`,
      `Müşteri / Cari: ${customer.name}`,
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
      `TOPLAM CAM ALANI: ${totalM2} m² (${totalPieces} Cam Plaka)`,
      `==========================================`,
    ];

    const blob = new Blob([textLines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cam_Siparis_Listesi_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="no-print">
        <HeaderNav />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Page Top Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl no-print">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                🪟 Cam Sipariş & Isıcam Metraj Raporu
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                  Tesis Siparişi
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Doğrama ölçülerine göre hesaplanan cam imalat metrajları ve cam tesisi sipariş formu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Yazdır / PDF
            </button>
            <button
              onClick={handleExportGlassList}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Sipariş Metni İndir (.TXT)
            </button>
          </div>
        </div>

        {/* Glass Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Toplam Cam Alanı</span>
            <p className="text-xl font-bold text-cyan-400 font-mono mt-1">{totalM2} m²</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Toplam Cam Adedi</span>
            <p className="text-xl font-bold text-white font-mono mt-1">{totalPieces} Plaka</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Cari / Müşteri</span>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1 truncate">{customer.name}</p>
          </div>
        </div>

        {/* Printable Area */}
        <div id="glass-print-area" className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-blue-700 uppercase tracking-tight">
                CAM & ISICAM İMALAT SİPARİŞİ
              </h2>
              <p className="text-xs text-slate-500 mt-1">Cari: {customer.name} | Tel: {customer.phone}</p>
            </div>
            <div className="text-right">
              <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 font-mono font-bold">
                CAM NO: #CAM-{Date.now().toString().slice(-6)}
              </span>
              <p className="text-xs text-slate-500 mt-2 font-medium">Tarih: {new Date().toLocaleDateString("tr-TR")}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-mono border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Poz İsmi</th>
                  <th className="p-3">Cam Ölçüsü (En x Boy mm)</th>
                  <th className="p-3">Adet</th>
                  <th className="p-3">Birim m²</th>
                  <th className="p-3">Toplam m²</th>
                  <th className="p-3">Cam Tipi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredGlasses.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{g.posName || "Poz"}</td>
                    <td className="p-3 font-mono text-blue-600 font-bold">
                      {g.width} x {g.height} mm
                    </td>
                    <td className="p-3 font-bold">{g.quantity}</td>
                    <td className="p-3 font-mono">{g.areaSqM.toFixed(2)} m²</td>
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {(g.areaSqM * g.quantity).toFixed(2)} m²
                    </td>
                    <td className="p-3 font-medium text-slate-700">{g.type}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t border-slate-200 text-slate-900">
                <tr>
                  <td colSpan={3} className="p-3 text-right">TOPLAM:</td>
                  <td className="p-3 font-bold">{totalPieces} Plaka</td>
                  <td className="p-3"></td>
                  <td className="p-3 font-mono text-blue-700 text-sm">{totalM2} m²</td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
