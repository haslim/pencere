"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import {
  CutPiece,
  OptimizationStock,
  optimizeCutList,
  exportToCNCData,
  WindowItem,
  PROFILE_COLORS,
  calculateOrderSummary,
} from "@/lib/pencereEngine";
import { DEFAULT_SETTINGS, AppSettings } from "@/components/SettingsModal";
import { ArrowLeft, Cpu, Download, Printer, QrCode, Scissors, Layers, CheckCircle2 } from "lucide-react";

export default function CutListPage() {
  const [items, setItems] = useState<WindowItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [stockMode, setStockMode] = useState<"standard" | "custom_list">("standard");
  const [standardBarLength, setStandardBarLength] = useState<number>(6000);
  const [customStockList, setCustomStockList] = useState<number[]>([6000, 6500, 4500, 3200]);
  const [newStockInput, setNewStockInput] = useState<string>("");
  const [cncBrand, setCncBrand] = useState<"KABAN" | "MURAT" | "YILMAZ" | "GENERIC_NC">("KABAN");
  const [activeTab, setActiveTab] = useState<"optimization" | "cnc" | "labels">("optimization");
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
  const cutPieces = orderSummary.allCutPieces;
  const sawKerf = settings.sawKerf || 5;

  const optimizedBars = useMemo(() => {
    if (stockMode === "standard") {
      return optimizeCutList(cutPieces, standardBarLength, sawKerf);
    } else {
      return optimizeCutList(cutPieces, customStockList, sawKerf);
    }
  }, [cutPieces, stockMode, standardBarLength, customStockList, sawKerf]);

  const groupedCutPieces = useMemo(() => {
    const groups: { [key: string]: CutPiece } = {};
    cutPieces.forEach((piece) => {
      const cleanLabel = piece.label.replace(/\s*\([^)]*\)\s*$/, "").trim();
      const key = `${cleanLabel}_${piece.type}_${piece.length}_${piece.leftAngle || 90}_${piece.rightAngle || 90}_${piece.colorName}`;
      if (groups[key]) {
        groups[key].quantity += piece.quantity;
      } else {
        groups[key] = {
          ...piece,
          label: cleanLabel,
        };
      }
    });
    return Object.values(groups).sort((a, b) => b.length - a.length);
  }, [cutPieces]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse font-mono text-sm">Yükleniyor...</p>
      </div>
    );
  }

  const totalWaste = optimizedBars.reduce((sum, b) => sum + b.wasteLength, 0);
  const totalBarCount = optimizedBars.length;
  const totalStockLengthSum = optimizedBars.reduce((sum, b) => sum + b.barLength, 0);
  const wastePercentage = Number(
    totalStockLengthSum > 0 ? ((totalWaste / totalStockLengthSum) * 100).toFixed(1) : 0
  );

  const handleDownloadCNC = () => {
    const cncContent = exportToCNCData(items, cncBrand);
    const blob = new Blob([cncContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CNC_${cncBrand}_Data_${Date.now()}.nc`;
    link.click();
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
                ✂️ 1D Kesim Optimizasyonu & CNC İhracatı
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold">
                  Atölye Üretim
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Minimum fire oranı ile 6 Metrelik profil çubuk optimizasyonu ve CNC Freze verisi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Kesim Listesi Yazdır
            </button>
            <button
              onClick={handleDownloadCNC}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CNC Verisi İndir (.NC)
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-4 no-print">
          <button
            onClick={() => setActiveTab("optimization")}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === "optimization"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scissors className="w-4 h-4" />
            1D Kesim Şeması ({totalBarCount} Çubuk)
          </button>
          <button
            onClick={() => setActiveTab("cnc")}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === "cnc"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            CNC Otomasyon Kodu ({cncBrand})
          </button>
          <button
            onClick={() => setActiveTab("labels")}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === "labels"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <QrCode className="w-4 h-4" />
            Barkodlu Ürün Etiketleri
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "optimization" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 no-print">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Kullanılan Toplam Çubuk</span>
                <p className="text-xl font-bold text-white font-mono mt-1">{totalBarCount} Boy</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Toplam Profil Metrajı</span>
                <p className="text-xl font-bold text-cyan-400 font-mono mt-1">{(totalStockLengthSum / 1000).toFixed(2)} Metre</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Toplam Fire Uzunluğu</span>
                <p className="text-xl font-bold text-rose-400 font-mono mt-1">{(totalWaste / 1000).toFixed(2)} Metre</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Genel Fire Oranı</span>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-1">%{wastePercentage}</p>
              </div>
            </div>

            {/* Cut Bars Visualization */}
            <div className="space-y-4">
              {optimizedBars.map((bar, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-blue-400">
                      Çubuk #{idx + 1} - Stok: {bar.barLength} mm
                    </span>
                    <span className="text-slate-400">
                      Kullanılan: {bar.usedLength} mm | Fire: {bar.wasteLength} mm (%{bar.wastePercentage})
                    </span>
                  </div>

                  <div className="h-9 w-full bg-slate-900 rounded-lg overflow-hidden flex border border-slate-800 p-0.5 gap-0.5">
                    {bar.cuts.map((cut, cIdx) => {
                      const widthPercent = (cut.length / bar.barLength) * 100;
                      return (
                        <div
                          key={cIdx}
                          style={{ width: `${widthPercent}%` }}
                          className="bg-blue-600/30 border border-blue-500/50 rounded flex items-center justify-center text-[10px] font-mono text-blue-200 font-bold px-1 truncate"
                          title={`${cut.pieceLabel}: ${cut.length}mm (${cut.leftAngle}°/${cut.rightAngle}°)`}
                        >
                          {cut.length}mm
                        </div>
                      );
                    })}
                    {bar.wasteLength > 0 && (
                      <div
                        style={{ width: `${(bar.wasteLength / bar.barLength) * 100}%` }}
                        className="bg-rose-950/40 border border-rose-800/40 rounded flex items-center justify-center text-[10px] font-mono text-rose-400"
                        title={`Fire: ${bar.wasteLength}mm`}
                      >
                        Fire
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "cnc" && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">CNC Otomasyon Kodu Output</h3>
                <p className="text-slate-400 font-sans text-xs">Kaban / Murat / Yılmaz CNC Kesim ve Çap Delik Kodları</p>
              </div>
              <div className="flex gap-2">
                {(["KABAN", "MURAT", "YILMAZ", "GENERIC_NC"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setCncBrand(b)}
                    className={`px-3 py-1 rounded-lg font-bold ${
                      cncBrand === b ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <pre className="bg-slate-900 p-4 rounded-xl text-cyan-300 overflow-x-auto max-h-96">
              {exportToCNCData(items, cncBrand)}
            </pre>
          </div>
        )}

        {activeTab === "labels" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedCutPieces.map((piece, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs text-slate-300">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="text-[10px] text-blue-400 font-bold block">[{piece.code || "10000"}]</span>
                    <span className="font-bold text-white">{piece.label}</span>
                  </div>
                  <span className="text-cyan-400 font-bold text-sm">{piece.length} mm</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Tip: {piece.type}</span>
                  <span>Açı: {piece.leftAngle || 45}° / {piece.rightAngle || 45}°</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Adet: {piece.quantity}</span>
                  <span>Renk: {piece.colorName}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
