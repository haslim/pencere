"use client";

import React from "react";

export interface AppSettings {
  weldAllowance: number; // Kaynak eritme payı (mm)
  sashOverlap: number; // Kanat binme / çalışması payı (mm)
  glassTolerance: number; // Cam genleşme/takoz boşluğu düşümü (mm)
  steelShortage: number; // Destek sacı kısa kesim payı (mm)
  profilePricePerMeter: number; // TL/m
  steelPricePerMeter: number; // TL/m
  glassPricePerSqM: number; // TL/m²
  fittingSetPrice: number; // TL/Set (Aksesuar)
  stockBarLength: number; // mm (6000mm)
  sawKerf: number; // Testere bıçağı payı (mm)
}

export const DEFAULT_SETTINGS: AppSettings = {
  weldAllowance: 3,
  sashOverlap: 12,
  glassTolerance: 22.5,
  steelShortage: 12,
  profilePricePerMeter: 180,
  steelPricePerMeter: 65,
  glassPricePerSqM: 950,
  fittingSetPrice: 450,
  stockBarLength: 6000,
  sawKerf: 5,
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
  const [formData, setFormData] = React.useState<AppSettings>(settings);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              ⚙️ Fabrika & Üretim Parametre Ayarları
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              İmalat düşüm toleranslarını ve birim maliyet fiyatlarını özelleştirin
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 🛠️ İmalat Düşüm Toleransları */}
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">
              📐 İmalat & Kesim Toleransları (mm)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Kaynak Eritme Payı (Köşe Başı mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.weldAllowance}
                  onChange={(e) =>
                    setFormData({ ...formData, weldAllowance: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Kanat Binme / Çalışma Düşümü (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.sashOverlap}
                  onChange={(e) =>
                    setFormData({ ...formData, sashOverlap: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Isıcam Genleşme Boşluk Düşümü (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.glassTolerance}
                  onChange={(e) =>
                    setFormData({ ...formData, glassTolerance: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Destek Sacı Kısa Kesim Payı (mm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.steelShortage}
                  onChange={(e) =>
                    setFormData({ ...formData, steelShortage: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 💰 Birim Fiyatlar */}
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">
              💰 Birim Maliyet Fiyatları
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Profil Metre Fiyatı (TL/m)
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Destek Sacı Fiyatı (TL/m)
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Isıcam m² Fiyatı (TL/m²)
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Açılım Mekanizma Set Fiyatı (TL/Set)
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setFormData(DEFAULT_SETTINGS)}
              className="text-xs text-amber-400 hover:underline"
            >
              Varsayılan Ayarlara Dön
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-sm transition shadow-lg shadow-cyan-500/25"
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
