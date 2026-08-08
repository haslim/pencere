"use client";

import React, { useState } from "react";

export interface CompanyInfo {
  name: string;
  subtitle: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  logoUrl?: string;
}

export interface AppSettings {
  company: CompanyInfo;
  weldAllowance: number; // Kaynak eritme payı (mm)
  sashOverlap: number; // Kanat binme / çalışması payı (mm)
  glassTolerance: number; // Cam genleşme/takoz boşluğu düşümü (mm)
  steelShortage: number; // Destek sacı kısa kesim payı (mm)
  // Maliyet Birim Fiyatları (TL)
  profilePricePerMeter: number; // Profil Maliyet TL/m
  steelPricePerMeter: number; // Sac Maliyet TL/m
  glassPricePerSqM: number; // Cam Maliyet TL/m²
  fittingSetPrice: number; // Aksesuar Maliyet TL/Set
  // Satış Birim Fiyatları & Kar Marjı
  profileSalePricePerMeter?: number; // Profil Satış TL/m
  steelSalePricePerMeter?: number; // Sac Satış TL/m
  glassSalePricePerSqM?: number; // Cam Satış TL/m²
  fittingSalePrice?: number; // Aksesuar Satış TL/Set
  profitMarginPercent?: number; // Genel Kar Marjı (%)
  stockBarLength: number; // mm (6000mm)
  sawKerf: number; // Testere bıçağı payı (mm)
  // Varsayılan Aksesuar ve Donanım Tercihleri
  defaultHardwareBrand?: "SIEGENIA" | "VORNE" | "ROTO" | "GU" | "STANDART";
  defaultHandleType?: "STANDART" | "RIMINI" | "KILITLI" | "AKUSTIK_SURME";
  defaultHandleColor?: "BEYAZ" | "KAHVERENGI" | "SIYAH" | "TITANYUM";
  defaultGlassThickness?: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  company: {
    name: "SİSTEM YAPI ELEMANLARI",
    subtitle: "PVC Kapı & Pencere Doğrama Sistemleri",
    phone: "+90 332 812 39 95",
    email: "info@aslimlarpencere.com",
    website: "www.aslimlarpencere.com",
    address: "Organize Sanayi Bölgesi 4. Cadde No: 12, Konya",
    logoUrl: "",
  },
  weldAllowance: 3,
  sashOverlap: 12,
  glassTolerance: 22.5,
  steelShortage: 12,
  profilePricePerMeter: 180,
  steelPricePerMeter: 65,
  glassPricePerSqM: 950,
  fittingSetPrice: 450,
  profileSalePricePerMeter: 240,
  steelSalePricePerMeter: 90,
  glassSalePricePerSqM: 1300,
  fittingSalePrice: 650,
  profitMarginPercent: 25,
  stockBarLength: 6000,
  sawKerf: 5,
  defaultHardwareBrand: "VORNE",
  defaultHandleType: "STANDART",
  defaultHandleColor: "BEYAZ",
  defaultGlassThickness: 28,
};


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<"company" | "production" | "prices">("prices");

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Bilgisayardan Logo Görseli Yükleme (Base64)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Logo görsel boyutu en fazla 3MB olabilir.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          company: {
            ...formData.company,
            logoUrl: reader.result as string,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              ⚙️ Fabrika & Üretim Parametre Ayarları
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Satış ve maliyet birim fiyatlarınızı, kar marjınızı ve firma bilgilerinizi özelleştirin
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("prices")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition border-t border-x ${
              activeTab === "prices"
                ? "bg-white text-blue-700 border-slate-200 shadow-sm"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            💰 Satış & Maliyet Fiyatları
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("company")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition border-t border-x ${
              activeTab === "company"
                ? "bg-white text-blue-700 border-slate-200 shadow-sm"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            🏢 Firma Profil & Logo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("accessories" as any)}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition border-t border-x ${
              activeTab === ("accessories" as any)
                ? "bg-white text-blue-700 border-slate-200 shadow-sm"
                : "text-slate-500 border-transparent hover:text-slate-800"
            }`}
          >
            🔧 Varsayılan Aksesuarlar
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 4: 🔧 Varsayılan Aksesuarlar */}
          {activeTab === ("accessories" as any) && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                📌 Fabrika Varsayılan Aksesuar ve Donanım Seçenekleri
              </h3>
              <p className="text-xs text-slate-500">
                Yeni çizim eklerken otomatik olarak seçilecek varsayılan donanım markası, kol ve cam kalınlığı tercihlerini belirleyin.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Varsayılan İspanyolet / Donanım Markası
                  </label>
                  <select
                    value={formData.defaultHardwareBrand || "VORNE"}
                    onChange={(e) => setFormData({ ...formData, defaultHardwareBrand: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="VORNE">Vorne Donanım Sistemleri</option>
                    <option value="SIEGENIA">Siegenia Favorit / Titan</option>
                    <option value="ROTO">Roto NT / NX Seti</option>
                    <option value="GU">G-U (Gretsch-Unitas)</option>
                    <option value="STANDART">Egepen Standart İspanyolet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Varsayılan Kol Tipi
                  </label>
                  <select
                    value={formData.defaultHandleType || "STANDART"}
                    onChange={(e) => setFormData({ ...formData, defaultHandleType: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="STANDART">Standart Alüminyum Pencere Kolu</option>
                    <option value="RIMINI">Rimini Lüks Tasarım Kol</option>
                    <option value="KILITLI">Kilitli Emniyetli Kol</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Varsayılan Kol Rengi
                  </label>
                  <select
                    value={formData.defaultHandleColor || "BEYAZ"}
                    onChange={(e) => setFormData({ ...formData, defaultHandleColor: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="BEYAZ">⚪ Beyaz</option>
                    <option value="KAHVERENGI">🟤 Kahverengi / Meşe</option>
                    <option value="SIYAH">⚫ Siyah (Mat / Antrasit)</option>
                    <option value="TITANYUM">🔘 Titanyum / Metalik</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Varsayılan Cam Kalınlığı & Çıta
                  </label>
                  <select
                    value={formData.defaultGlassThickness || 28}
                    onChange={(e) => setFormData({ ...formData, defaultGlassThickness: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value={20}>20 mm Tek Cam (Dekoratif Çıta)</option>
                    <option value={28}>28 mm Çift Cam (Isıcam Standart Çıta)</option>
                    <option value={32}>32 mm Üçlü Cam (Triple Glass Çıta)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: 💰 Satış & Maliyet Fiyatları */}
          {activeTab === "prices" && (

            <div className="space-y-6">
              {/* Kar Marjı Ayarı */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-blue-950">📈 Genel Satış Kar Marjı (%)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Otomatik maliyet üzerine eklenecek genel kar oranı.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    max={300}
                    value={formData.profitMarginPercent ?? 25}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitMarginPercent: Number(e.target.value),
                      })
                    }
                    className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-blue-700 text-center focus:border-blue-500 focus:outline-none shadow-sm"
                  />
                  <span className="text-xs font-bold text-blue-900">% Kar</span>
                </div>
              </div>

              {/* 🏭 Maliyet Birim Fiyatları (Fabrika Alış) */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span>🏭 Alış / Fabrika Birim Maliyet Fiyatları (KDV Hariç)</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">
                      Profil Metre Maliyeti (TL/m)
                    </label>
                    <input
                      type="number"
                      value={formData.profilePricePerMeter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profilePricePerMeter: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">
                      Destek Sacı Maliyeti (TL/m)
                    </label>
                    <input
                      type="number"
                      value={formData.steelPricePerMeter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          steelPricePerMeter: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">
                      Isıcam m² Maliyeti (TL/m²)
                    </label>
                    <input
                      type="number"
                      value={formData.glassPricePerSqM}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          glassPricePerSqM: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">
                      Mekanizma Set Maliyeti (TL/Set)
                    </label>
                    <input
                      type="number"
                      value={formData.fittingSetPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fittingSetPrice: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 🏷️ Müşteri Satış Birim Fiyatları */}
              <div>
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span>🏷️ Müşteri Birim Satış Fiyatları (Liste Fiyatları)</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">
                      Profil Birim Satış (TL/m)
                    </label>
                    <input
                      type="number"
                      value={formData.profileSalePricePerMeter ?? 240}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profileSalePricePerMeter: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">
                      Destek Sacı Satış (TL/m)
                    </label>
                    <input
                      type="number"
                      value={formData.steelSalePricePerMeter ?? 90}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          steelSalePricePerMeter: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">
                      Isıcam m² Satış (TL/m²)
                    </label>
                    <input
                      type="number"
                      value={formData.glassSalePricePerSqM ?? 1300}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          glassSalePricePerSqM: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-medium block mb-1">
                      Mekanizma Set Satış (TL/Set)
                    </label>
                    <input
                      type="number"
                      value={formData.fittingSalePrice ?? 650}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fittingSalePrice: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-blue-700 focus:bg-white focus:border-blue-500 focus:outline-none transition font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 🏢 Firma Bilgileri & Logo Yükleme */}
          {activeTab === "company" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                🏢 Firma Kurumsal Bilgileri (Teklif ve Antette Görünür)
              </h3>

              {/* Logo Yükleme Alanı */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {formData.company.logoUrl ? (
                    <div className="relative group">
                      <img
                        src={formData.company.logoUrl}
                        alt="Firma Logosu"
                        className="w-16 h-16 object-contain rounded-lg border bg-white p-1 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            company: { ...formData.company, logoUrl: "" },
                          })
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow"
                        title="Logoyu Kaldır"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                      <span>🖼️</span>
                      <span>Logo Yok</span>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Firma Logosu</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      PNG, JPG, SVG veya WebP formatı (Max 3MB)
                    </p>
                  </div>
                </div>

                <label className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-sm transition">
                  📁 Logo Yükle
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Firma Unvanı / Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company: { ...formData.company, name: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Alt Başlık / Slogan
                  </label>
                  <input
                    type="text"
                    value={formData.company.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company: { ...formData.company, subtitle: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.company.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company: { ...formData.company, phone: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    E-Posta Adresi
                  </label>
                  <input
                    type="email"
                    value={formData.company.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company: { ...formData.company, email: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Web Sitesi
                  </label>
                  <input
                    type="text"
                    value={formData.company.website}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company: { ...formData.company, website: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Firma Adresi
                  </label>
                  <input
                    type="text"
                    value={formData.company.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        company: { ...formData.company, address: e.target.value },
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 📐 İmalat Düşüm Toleransları */}
          {activeTab === "production" && (
            <div>
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">
                📐 İmalat & Kesim Toleransları (mm)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Kaynak Eritme Payı (Köşe Başı mm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.weldAllowance}
                    onChange={(e) =>
                      setFormData({ ...formData, weldAllowance: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Kanat Binme / Çalışma Düşümü (mm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.sashOverlap}
                    onChange={(e) =>
                      setFormData({ ...formData, sashOverlap: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Isıcam Genleşme Boşluk Düşümü (mm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.glassTolerance}
                    onChange={(e) =>
                      setFormData({ ...formData, glassTolerance: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">
                    Destek Sacı Kısa Kesim Payı (mm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.steelShortage}
                    onChange={(e) =>
                      setFormData({ ...formData, steelShortage: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setFormData(DEFAULT_SETTINGS)}
              className="text-xs text-amber-600 font-semibold hover:underline"
            >
              Varsayılan Ayarlara Dön
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm transition"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition shadow-md shadow-blue-500/20"
              >
                💾 Ayarları Kaydet
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
