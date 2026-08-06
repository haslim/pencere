export interface ProfileColor {
  id: string;
  name: string;
  hex: string;
  priceMultiplier: number;
}

export const PROFILE_COLORS: ProfileColor[] = [
  { id: "beyaz", name: "Standart Beyaz", hex: "#FFFFFF", priceMultiplier: 1.0 },
  { id: "antrasit", name: "Antrasit Gri", hex: "#374151", priceMultiplier: 1.3 },
  { id: "koyu-mese", name: "Koyu Meşe Lamine", hex: "#4A2E16", priceMultiplier: 1.35 },
  { id: "altin-mese", name: "Altın Meşe Lamine", hex: "#8B5A2B", priceMultiplier: 1.35 },
  { id: "winchester", name: "Winchester Lamine", hex: "#6F432A", priceMultiplier: 1.4 },
];

export interface WindowDivision {
  id: string;
  type: "sabit" | "tek-acilim" | "cift-acilim" | "vasistas" | "surme";
  ratio: number; // 0..1 (e.g. 0.5 for equal split)
}

export interface WindowItem {
  id: string;
  name: string;
  width: number; // mm (dış kasa eni)
  height: number; // mm (dış kasa boyu)
  color: ProfileColor;
  divisions: WindowDivision[];
  mullionsCount: number; // Orta kayıt sayısı (0: tek göz, 1: 2 bölme, 2: 3 bölme)
}

export interface CutPiece {
  id: string;
  label: string;
  type: "KASA" | "KANAT" | "ORTA_KAYIT" | "DESTEK_SACI" | "CITA";
  length: number; // mm
  quantity: number;
  angle: "45-45" | "90-90" | "45-90";
  colorName: string;
}

export interface GlassCut {
  width: number;
  height: number;
  areaSqM: number;
  quantity: number;
  type: string;
}

export interface CalculationResult {
  cutPieces: CutPiece[];
  glasses: GlassCut[];
  totalProfileMeters: number;
  totalSteelMeters: number;
  totalGlassSqM: number;
  estimatedPriceTL: number;
}

export interface OptimizationStock {
  barLength: number; // mm (e.g., 6000mm)
  usedLength: number;
  cuts: { pieceLabel: string; length: number }[];
  wasteLength: number;
}

// Ercom Hesaplama Standartları & Düşüm Algoritması
export function calculateWindowDimensions(item: WindowItem): CalculationResult {
  const { width, height, color, mullionsCount, divisions } = item;
  
  // Parametre Standartları (mm)
  const WELD_ALLOWANCE = 3; // Her kaynak köşesinden 3mm erime payı (Kasa ve Kanat +6mm kesim boyu)
  const SASH_OVERLAP = 12; // Kanat binme & çalışması payı (Kasa iç ölçüsünden kanata düşüm)
  const GLASS_TOLERANCE = 22.5; // Isıcam genleşme ve takoz boşluğu düşümü
  const STEEL_SHORTAGE = 12; // Destek sacının profilden daha kısa kesilme payı

  const cutPieces: CutPiece[] = [];
  const glasses: GlassCut[] = [];

  // 1. Kasa Profil Kesimleri (45° / 45°)
  const kasaEnLength = width + (WELD_ALLOWANCE * 2);
  const kasaBoyLength = height + (WELD_ALLOWANCE * 2);

  cutPieces.push({
    id: "kasa-en",
    label: "Kasa En Profili",
    type: "KASA",
    length: Math.round(kasaEnLength),
    quantity: 2,
    angle: "45-45",
    colorName: color.name,
  });

  cutPieces.push({
    id: "kasa-boy",
    label: "Kasa Boy Profili",
    type: "KASA",
    length: Math.round(kasaBoyLength),
    quantity: 2,
    angle: "45-45",
    colorName: color.name,
  });

  // Kasa Destek Sacları (90° / 90°)
  cutPieces.push({
    id: "kasa-en-sac",
    label: "Kasa En Destek Sacı",
    type: "DESTEK_SACI",
    length: Math.round(width - STEEL_SHORTAGE),
    quantity: 2,
    angle: "90-90",
    colorName: "Galvaniz Sac",
  });
  cutPieces.push({
    id: "kasa-boy-sac",
    label: "Kasa Boy Destek Sacı",
    type: "DESTEK_SACI",
    length: Math.round(height - STEEL_SHORTAGE),
    quantity: 2,
    angle: "90-90",
    colorName: "Galvaniz Sac",
  });

  // Bölme Alanları Hesaplama (Orta Kayıt Varsa)
  const divisionCount = mullionsCount + 1;
  const KASA_PROFIL_GENISLIGI = 60; // 60mm profil
  const ORTA_KAYIT_GENISLIGI = 60;

  // Net İç Genişlik ve Boy
  const netInternalWidth = width - (KASA_PROFIL_GENISLIGI * 2);
  const netInternalHeight = height - (KASA_PROFIL_GENISLIGI * 2);

  // Orta Kayıt Profilleri (90° / 90°)
  if (mullionsCount > 0) {
    const ortaKayitBoy = netInternalHeight + 4; // Takoz zımba geçme payı
    cutPieces.push({
      id: "orta-kayit",
      label: "Orta Kayıt (Mullion) Profili",
      type: "ORTA_KAYIT",
      length: Math.round(ortaKayitBoy),
      quantity: mullionsCount,
      angle: "90-90",
      colorName: color.name,
    });

    cutPieces.push({
      id: "orta-kayit-sac",
      label: "Orta Kayıt Destek Sacı",
      type: "DESTEK_SACI",
      length: Math.round(ortaKayitBoy - STEEL_SHORTAGE),
      quantity: mullionsCount,
      angle: "90-90",
      colorName: "Galvaniz Sac",
    });
  }

  // Bölme başı net genişlik
  const usableWidth = netInternalWidth - (mullionsCount * ORTA_KAYIT_GENISLIGI);
  const sectionWidth = usableWidth / divisionCount;

  // Her Bölme İçin Kanat / Sabit ve Cam Hesaplama
  for (let i = 0; i < divisionCount; i++) {
    const divType = divisions[i]?.type || "sabit";

    if (divType === "sabit") {
      // Sabit Cam Ölçüsü
      const gWidth = sectionWidth + 12 - GLASS_TOLERANCE;
      const gHeight = netInternalHeight + 12 - GLASS_TOLERANCE;
      const sqM = (gWidth * gHeight) / 1000000;

      glasses.push({
        width: Math.round(gWidth),
        height: Math.round(gHeight),
        areaSqM: Number(sqM.toFixed(3)),
        quantity: 1,
        type: "4+16+4 Isıcam Çift Cam",
      });
    } else {
      // Açılır Kanat Var (Kanat Kesimleri 45°/45°)
      const kanatEn = sectionWidth + SASH_OVERLAP + (WELD_ALLOWANCE * 2);
      const kanatBoy = netInternalHeight + SASH_OVERLAP + (WELD_ALLOWANCE * 2);

      cutPieces.push({
        id: `kanat-en-${i}`,
        label: `Bölme ${i + 1} Kanat En Profili (${divType})`,
        type: "KANAT",
        length: Math.round(kanatEn),
        quantity: 2,
        angle: "45-45",
        colorName: color.name,
      });

      cutPieces.push({
        id: `kanat-boy-${i}`,
        label: `Bölme ${i + 1} Kanat Boy Profili (${divType})`,
        type: "KANAT",
        length: Math.round(kanatBoy),
        quantity: 2,
        angle: "45-45",
        colorName: color.name,
      });

      // Kanat İçi Cam Ölçüsü
      const gWidth = sectionWidth - SASH_OVERLAP - GLASS_TOLERANCE;
      const gHeight = netInternalHeight - SASH_OVERLAP - GLASS_TOLERANCE;
      const sqM = (gWidth * gHeight) / 1000000;

      glasses.push({
        width: Math.round(gWidth),
        height: Math.round(gHeight),
        areaSqM: Number(sqM.toFixed(3)),
        quantity: 1,
        type: "4+16+4 Isıcam Çift Cam (Açılır)",
      });
    }
  }

  // Toplam Metrajlar
  const totalProfileMeters = Number(
    (
      cutPieces
        .filter((p) => p.type !== "DESTEK_SACI")
        .reduce((sum, p) => sum + (p.length * p.quantity) / 1000, 0)
    ).toFixed(2)
  );

  const totalSteelMeters = Number(
    (
      cutPieces
        .filter((p) => p.type === "DESTEK_SACI")
        .reduce((sum, p) => sum + (p.length * p.quantity) / 1000, 0)
    ).toFixed(2)
  );

  const totalGlassSqM = Number(
    glasses.reduce((sum, g) => sum + g.areaSqM * g.quantity, 0).toFixed(2)
  );

  // Birim Fiyat Tahmini (TL)
  const PROFILE_PRICE_PER_METER = 180 * color.priceMultiplier; // TL/m
  const STEEL_PRICE_PER_METER = 65; // TL/m
  const GLASS_PRICE_PER_SQM = 950; // TL/m²
  const FITTING_SET_PRICE = 450; // İspanyolet mekanizma set fiyatı

  const acilirSayisi = divisions.filter((d) => d.type !== "sabit").length;

  const estimatedPriceTL = Math.round(
    totalProfileMeters * PROFILE_PRICE_PER_METER +
      totalSteelMeters * STEEL_PRICE_PER_METER +
      totalGlassSqM * GLASS_PRICE_PER_SQM +
      acilirSayisi * FITTING_SET_PRICE
  );

  return {
    cutPieces,
    glasses,
    totalProfileMeters,
    totalSteelMeters,
    totalGlassSqM,
    estimatedPriceTL,
  };
}

// 1D Optimizasyon Algoritması (First Fit Decreasing / FFD)
export function optimizeCutList(
  pieces: CutPiece[],
  stockBarLength = 6000,
  sawKerf = 5 // Testere bıçak kalınlığı fire payı (5mm)
): OptimizationStock[] {
  // Tüm parçaları tekil listeye aç ve uzundan kısaya sırala
  const allPieces: { label: string; length: number }[] = [];
  pieces.forEach((p) => {
    for (let i = 0; i < p.quantity; i++) {
      allPieces.push({ label: `${p.label} #${i + 1}`, length: p.length });
    }
  });

  allPieces.sort((a, b) => b.length - a.length);

  const stockBars: OptimizationStock[] = [];

  for (const piece of allPieces) {
    let placed = false;

    for (const bar of stockBars) {
      if (bar.barLength - bar.usedLength >= piece.length + sawKerf) {
        bar.cuts.push({ pieceLabel: piece.label, length: piece.length });
        bar.usedLength += piece.length + sawKerf;
        bar.wasteLength = bar.barLength - bar.usedLength;
        placed = true;
        break;
      }
    }

    if (!placed) {
      // Yeni 6m profil boyu aç
      stockBars.push({
        barLength: stockBarLength,
        usedLength: piece.length + sawKerf,
        cuts: [{ pieceLabel: piece.label, length: piece.length }],
        wasteLength: stockBarLength - (piece.length + sawKerf),
      });
    }
  }

  return stockBars;
}
