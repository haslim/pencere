"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HeaderNav } from "@/components/HeaderNav";
import { WindowItem, PROFILE_COLORS } from "@/lib/pencereEngine";
import { WindowPreviewSvg } from "@/components/WindowPreviewSvg";
import { ArrowLeft, Printer, LayoutGrid, Maximize2, FileText, Sliders } from "lucide-react";

export default function DrawingsGalleryPage() {
  const [items, setItems] = useState<WindowItem[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState<number>(4); // Sayfa başına poz sayısı (1, 2, 4, 6, 9)
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1); // 0.8x, 1x, 1.2x, 1.5x, 2x
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(true);
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="animate-pulse font-mono text-sm">Yükleniyor...</p>
      </div>
    );
  }

  // Calculate SVG Base Size depending on layout items per page
  const getCanvasDimensions = () => {
    let baseW = 280;
    let baseH = 220;

    if (itemsPerPage === 1) {
      baseW = 560;
      baseH = 440;
    } else if (itemsPerPage === 2) {
      baseW = 420;
      baseH = 320;
    } else if (itemsPerPage === 4) {
      baseW = 300;
      baseH = 240;
    } else if (itemsPerPage === 6) {
      baseW = 240;
      baseH = 190;
    } else if (itemsPerPage === 9) {
      baseW = 190;
      baseH = 150;
    }

    return {
      w: Math.round(baseW * scaleMultiplier),
      h: Math.round(baseH * scaleMultiplier),
    };
  };

  const canvasDim = getCanvasDimensions();

  // Dynamic Grid Class depending on itemsPerPage
  const getGridClass = () => {
    if (itemsPerPage === 1) return "grid-cols-1";
    if (itemsPerPage === 2) return "grid-cols-1 sm:grid-cols-2";
    if (itemsPerPage === 4) return "grid-cols-1 sm:grid-cols-2";
    if (itemsPerPage === 6) return "grid-cols-2 sm:grid-cols-3";
    if (itemsPerPage === 9) return "grid-cols-3 sm:grid-cols-3";
    return "grid-cols-2";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="no-print">
        <HeaderNav />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Kontrol Paneli Banner */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-xl no-print">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                🎨 Sadece Doğrama Çizim & Grafik Listesi Repo
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold">
                  Ölçekli Grafik Kataloğu
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Siparişteki {items.length} adet poz çizimini ölçeklendirip sayfa başına sığdırma ayarlarıyla yazdırın
              </p>
            </div>
          </div>

          {/* Ayar Araç Çubuğu */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Sayfa Başına Poz Sığdırma */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
              <LayoutGrid className="w-4 h-4 text-indigo-400 ml-1" />
              <span className="text-slate-400 font-semibold">Sayfaya Sığdır:</span>
              {[1, 2, 4, 6, 9].map((count) => (
                <button
                  key={count}
                  onClick={() => setItemsPerPage(count)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    itemsPerPage === count
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {count} Poz
                </button>
              ))}
            </div>

            {/* Çizim Ölçeklendirme Katsayısı */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
              <Maximize2 className="w-4 h-4 text-cyan-400 ml-1" />
              <span className="text-slate-400 font-semibold">Ölçek:</span>
              {[0.8, 1, 1.2, 1.5, 2].map((scale) => (
                <button
                  key={scale}
                  onClick={() => setScaleMultiplier(scale)}
                  className={`px-2 py-1 rounded-lg font-bold transition ${
                    scaleMultiplier === scale
                      ? "bg-cyan-600 text-white shadow-md"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {scale}x
                </button>
              ))}
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Katalog Yazdır / PDF
            </button>
          </div>
        </div>

        {/* Kataloğun Görünüm & Gösterim Seçenekleri */}
        <div className="flex items-center gap-4 text-xs font-medium bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl no-print text-slate-300">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Gösterim Seçenekleri:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>Dış Ölçü Etiketleri (WxH mm)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <span>Profil ve Renk Detayları</span>
          </label>
        </div>

        {/* Sadece Doğrama Çizimleri Yazdırılabilir Katalog Alanı */}
        <div id="drawings-print-area" className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-blue-700 uppercase tracking-tight">
                DOĞRAMA ÇİZİM & GRAFİK KATALOĞU
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toplam {items.length} Poz | Sayfa Başına Düzen: {itemsPerPage} Poz | Çizim Ölçeği: {scaleMultiplier}x
              </p>
            </div>
            <div className="text-right">
              <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200 font-mono font-bold">
                KATALOG NO: #GRF-{Date.now().toString().slice(-6)}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-medium">Tarih: {new Date().toLocaleDateString("tr-TR")}</p>
            </div>
          </div>

          {/* Dinamik Ölçekli Çizim Grid Tablosu */}
          <div className={`grid ${getGridClass()} gap-6`}>
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-between gap-3 shadow-xs hover:border-blue-300 transition page-break-inside-avoid"
              >
                <div className="w-full flex justify-between items-center border-b border-slate-200/80 pb-2">
                  <span className="font-extrabold text-xs text-slate-900">
                    {idx + 1}. {item.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                    Adet: {item.quantity || 1}
                  </span>
                </div>

                {/* Vektörel SVG Çizim */}
                <div className="p-2 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-xs">
                  <WindowPreviewSvg item={item} maxW={canvasDim.w} maxH={canvasDim.h} />
                </div>

                {/* Detaylar */}
                {showDetails && (
                  <div className="w-full text-[11px] font-mono text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 space-y-1">
                    <div className="flex justify-between">
                      <span>Dış Ölçü:</span>
                      <span className="font-bold text-blue-700">{item.width} x {item.height} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profil Rengi:</span>
                      <span className="font-bold text-slate-800">{item.color?.name || "Beyaz"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kayıt Sayısı:</span>
                      <span>{item.verticalMullionsCount} Dikey / {item.horizontalMullionsCount} Yatay</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
