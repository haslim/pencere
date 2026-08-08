"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import {
  WindowItem,
  calculateOrderSummary,
  PROFILE_COLORS,
  GlassCut,
  Customer,
} from "@/lib/pencereEngine";
import { DEFAULT_SETTINGS, AppSettings } from "@/components/SettingsModal";
import { DEFAULT_CUSTOMERS } from "@/components/CustomerModal";
import { ArrowLeft, Download, Printer } from "lucide-react";

export default function GlassOrderPage() {
  const [items, setItems] = useState<WindowItem[]>([]);
  const [customer, setCustomer] = useState<Customer>(DEFAULT_CUSTOMERS[0]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
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

  // Camları gruplama & hesaplama
  const allGlasses = orderSummary.allGlasses;

  // Toplam m² ve Adet
  const totalM2 = allGlasses
    .reduce((acc, g) => acc + g.areaSqM * g.quantity, 0)
    .toFixed(3);
  const totalPieces = allGlasses.reduce((acc, g) => acc + g.quantity, 0);

  // Cam Tipi Bazlı Gruplama İcmali (Alt Toplamlar)
  const glassGroups = allGlasses.reduce((acc, g) => {
    const type = g.type || "4+16+4 Çift Cam Konfor";
    if (!acc[type]) {
      acc[type] = { items: [], totalPieces: 0, totalArea: 0 };
    }
    acc[type].items.push(g);
    acc[type].totalPieces += g.quantity;
    acc[type].totalArea += g.areaSqM * g.quantity;
    return acc;
  }, {} as Record<string, { items: GlassCut[]; totalPieces: number; totalArea: number }>);

  const handleExportGlassList = () => {
    const textLines = [
      `Açıklama\tAdet\tGen\tYük\tB m²\tT m²\tPoz No`,
      ...allGlasses.map(
        (g, idx) =>
          `${g.type}\t${g.quantity}\t${g.width}\t${(g.height / 1000).toFixed(3)}\t${g.areaSqM.toFixed(3)}\t${(g.areaSqM * g.quantity).toFixed(3)}\t${idx + 1}`
      ),
      `------------------------------------------`,
      `TOPLAM: ${totalPieces} Adet - ${totalM2} m²`,
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
                🪟 Cam Sipariş Raporu (Resmi Fabrika Formatı)
              </h1>
              <p className="text-xs text-slate-400">
                Resmi cam fabrikası sipariş föyü ve metraj listesi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Yazdır / PDF İndir
            </button>
            <button
              onClick={handleExportGlassList}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Metin İndir (.TXT)
            </button>
          </div>
        </div>

        {/* Printable Area - Factory Order Form Layout matching User Image */}
        <div id="glass-print-area" className="bg-white text-slate-900 border border-slate-300 rounded-xl p-8 shadow-2xl space-y-6 font-serif">
          {/* Header Info */}
          <div className="flex justify-between items-start border-b border-slate-900 pb-4">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans uppercase">
                CAM SİPARİŞ RAPORU
              </h2>
              <p className="text-xs text-slate-700 font-serif mt-1">
                Firma / Cari: <span className="font-bold">{customer.name}</span> | Tel: {customer.phone}
              </p>
            </div>
            <div className="text-right text-xs font-mono">
              <p className="font-bold text-slate-900">Tarih: {new Date().toLocaleDateString("tr-TR")}</p>
              <p className="text-slate-600">Sipariş No: #CAM-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>

          {/* Table Matching Reference Image (Açıklama | Adet | Gen | Yük | B m² | T m² | Poz No) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-serif border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 font-bold">
                  <th className="py-2 px-3 text-left">Açıklama</th>
                  <th className="py-2 px-3 text-center">Adet</th>
                  <th className="py-2 px-3 text-center">Gen</th>
                  <th className="py-2 px-3 text-center">Yük</th>
                  <th className="py-2 px-3 text-right">B m²</th>
                  <th className="py-2 px-3 text-right">T m²</th>
                  <th className="py-2 px-3 text-center">Poz No</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {allGlasses.map((g, idx) => {
                  const bM2 = g.areaSqM.toFixed(3);
                  const tM2 = (g.areaSqM * g.quantity).toFixed(3);
                  // Yükseklik metre cinsinden virgüllü (örn: 1,252) veya mm
                  const yukStr = (g.height / 1000).toFixed(3).replace(".", ",");
                  const bM2Str = bM2.replace(".", ",");
                  const tM2Str = tM2.replace(".", ",");

                  return (
                    <tr key={idx} className="hover:bg-slate-50 font-medium text-slate-800">
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {g.type || "4+16+4 Çift Cam Konfor"}
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-slate-900">{g.quantity}</td>
                      <td className="py-2 px-3 text-center font-mono">{g.width}</td>
                      <td className="py-2 px-3 text-center font-mono">{yukStr}</td>
                      <td className="py-2 px-3 text-right font-mono">{bM2Str}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{tM2Str}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold">{idx + 1}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Group Summaries & Total Footer Lines matching image style */}
          <div className="border-t-2 border-slate-900 pt-4 space-y-2">
            {Object.entries(glassGroups).map(([type, data]) => (
              <div
                key={type}
                className="flex justify-between items-center text-xs font-serif font-bold text-slate-900 border-b border-slate-300 pb-1.5"
              >
                <span>{type}</span>
                <div className="flex gap-12 font-mono">
                  <span>{data.totalPieces} Adet</span>
                  <span>{data.totalArea.toFixed(3).replace(".", ",")} m²</span>
                </div>
              </div>
            ))}

            {/* Overall Grand Total */}
            <div className="flex justify-between items-center text-sm font-serif font-black text-slate-950 pt-2 border-t-2 border-slate-900">
              <span>GENEL SİPARİŞ TOPLAMI</span>
              <div className="flex gap-12 font-mono">
                <span>{totalPieces} Adet</span>
                <span className="underline decoration-double">{totalM2.replace(".", ",")} m²</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
