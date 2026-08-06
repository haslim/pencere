"use client";

import React, { useState, useMemo } from "react";
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

export default function SaaSWindowDashboard() {
  // Fabrika Parametre Ayarları State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/60 via-slate-50 to-slate-100">
      {/* SaaS Header / Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white shadow-md shadow-blue-500/20 text-sm">
            SS
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              Sistem SaaS <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">Cloud V1.2</span>
            </h1>
            <p className="text-xs text-slate-500">PVC & Alüminyum Çizim ve İmalat Otomasyonu</p>
          </div>
        </div>

        {/* Cari Kart / Müşteri Seçici Butonu */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <span>👤 Cari: {activeCustomer.name}</span>
            <span className="text-[10px] bg-blue-200 text-blue-800 font-mono px-1.5 py-0.5 rounded">
              {activeCustomer.code}
            </span>
            <span className="text-blue-500">▼</span>
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
          >
            ⚙️ Ayarlar
          </button>
          <button
            onClick={() => setIsCutModalOpen(true)}
            className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
          >
            ✂️ 1D Kesim & Optimizasyon ({items.length} Poz)
          </button>
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            📄 Müşteri Teklif Formu ({orderSummary.totalPriceTL.toLocaleString("tr-TR")} ₺)
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1600px] w-full mx-auto">
        {/* Sol Kontrol & Parametre Paneli */}
        <div className="lg:col-span-4 bg-white/90 border border-slate-200/80 rounded-2xl p-6 flex flex-col gap-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
          <div>
            <h2 className="text-md font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              ⚙️ Poz ve Geometri Parametreleri
            </h2>

            <div className="space-y-4 mt-4">
              {/* Poz Adı */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Poz / Pencere Tanımı</label>
                <input
                  type="text"
                  value={activeItem.name}
                  onChange={(e) => updateActiveItem({ ...activeItem, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                />
              </div>

              {/* Genişlik & Yükseklik */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Dış Genişlik (mm)</label>
                  <input
                    type="number"
                    min={400}
                    max={3500}
                    step={10}
                    value={activeItem.width}
                    onChange={(e) => updateActiveItem({ ...activeItem, width: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-blue-700 font-bold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Dış Yükseklik (mm)</label>
                  <input
                    type="number"
                    min={400}
                    max={3000}
                    step={10}
                    value={activeItem.height}
                    onChange={(e) => updateActiveItem({ ...activeItem, height: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-blue-700 font-bold focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Kasa Geneli Dikey & Yatay Orta Kayıtlar */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  🪟 Kasa Geneli Orta Kayıt Düzeni
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1 font-medium">Dikey Kayıt Sayısı</label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((v) => (
                        <button
                          key={`v-${v}`}
                          onClick={() => handleGridMullionsChange(v, activeItem.horizontalMullionsCount)}
                          className={`flex-1 py-1 rounded text-xs font-bold transition border ${
                            activeItem.verticalMullionsCount === v
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1 font-medium">Yatay Kayıt Sayısı</label>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((h) => (
                        <button
                          key={`h-${h}`}
                          onClick={() => handleGridMullionsChange(activeItem.verticalMullionsCount, h)}
                          className={`flex-1 py-1 rounded text-xs font-bold transition border ${
                            activeItem.horizontalMullionsCount === h
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Profil ve Kaplama Rengi</label>
                <div className="grid grid-cols-1 gap-2">
                  {PROFILE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateActiveItem({ ...activeItem, color: c })}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition ${
                        activeItem.color.id === c.id
                          ? "bg-blue-50/80 border-blue-500 text-blue-900 shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.name}</span>
                      </div>
                      {c.priceMultiplier > 1 && (
                        <span className="text-[10px] text-amber-600 font-mono font-semibold">
                          +{Math.round((c.priceMultiplier - 1) * 100)}% Lamine
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Anlık Hesaplanan Sipariş Geneli Özet Kartı */}
          <div className="mt-auto bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 rounded-xl border border-slate-800 space-y-3 text-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                📊 Toplam Sipariş Özeti
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
                <span className="text-slate-400 block">Sipariş Toplamı</span>
                <span className="font-bold text-cyan-300 text-sm">
                  {orderSummary.totalPriceTL.toLocaleString("tr-TR")} ₺
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ İnteraktif Tuval & Çoklu Poz Sekmeleri */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Poz Sekmeleri (Poz 1, Poz 2, ...) */}
          <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-3 shadow-md shadow-slate-200/50 backdrop-blur-sm flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 px-2 flex items-center gap-1">
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
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.name}</span>
                  <span className={`text-[10px] font-mono opacity-80 ${isActive ? "text-blue-100" : "text-slate-400"}`}>
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
          <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[460px] shadow-xl shadow-slate-200/50 backdrop-blur-sm relative">
            <div className="absolute top-4 left-4 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Aktif Çizim: <span className="font-bold text-slate-900">{activeItem.name}</span>
            </div>

            <WindowCanvas
              item={activeItem}
              onUpdateDivisionType={handleUpdateDivisionType}
              onUpdateSashMullions={handleUpdateSashMullions}
            />
          </div>

          {/* İmalat & Kesim Tablosu Önizlemesi */}
          <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  📋 Aktif Poz Kesim Ölçüleri ({calcResult.cutPieces.length} Parça)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Düşümler ve 45°/90° köşe açıları otomatik hesaplanmıştır.
                </p>
              </div>
              <button
                onClick={() => setIsCutModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline flex items-center gap-1"
              >
                Tüm Pozların 1D Optimizasyon Raporunu Göster →
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-mono border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Eleman Adı</th>
                    <th className="px-3 py-2.5">Tip</th>
                    <th className="px-3 py-2.5">Kesim Ölçüsü</th>
                    <th className="px-3 py-2.5">Adet</th>
                    <th className="px-3 py-2.5">Açı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {calcResult.cutPieces.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-3 py-2 font-medium text-slate-900">{p.label}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-semibold border border-slate-200">
                          {p.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-blue-600">{p.length} mm</td>
                      <td className="px-3 py-2 font-bold">{p.quantity}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">{p.angle}</td>
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
        onSave={(newSet) => setSettings(newSet)}
      />

      <CutListModal
        isOpen={isCutModalOpen}
        onClose={() => setIsCutModalOpen(false)}
        cutPieces={orderSummary.allCutPieces}
        optimizedBars={optimizedBars}
      />

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        customer={activeCustomer}
        items={items}
        orderSummary={orderSummary}
      />
    </div>
  );
}
