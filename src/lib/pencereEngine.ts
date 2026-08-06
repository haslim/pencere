import { AppSettings, DEFAULT_SETTINGS } from "@/components/SettingsModal";

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

export interface DivisionItem {
  id: string;
  type: "sabit" | "tek-acilim" | "cift-acilim" | "vasistas" | "surme";
  // Kanat içi orta kayıt sayıları
  sashVerticalMullions: number; // Kanat içi dikey kayıt
  sashHorizontalMullions: number; // Kanat içi yatay kayıt
}

export interface WindowItem {
  id: string;
  name: string;
  width: number; // mm (dış kasa eni)
  height: number; // mm (dış kasa boyu)
  color: ProfileColor;
  verticalMullionsCount: number; // Kasa geneli Dikey Orta Kayıt sayısı
  horizontalMullionsCount: number; // Kasa geneli Yatay Orta Kayıt sayısı
  divisions: DivisionItem[];
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
  barLength: number; // mm (6000mm)
  usedLength: number;
  cuts: { pieceLabel: string; length: number }[];
  wasteLength: number;
}

// Ercom Gelişmiş İmalat & Düşüm Hesaplama Motoru (Ayarlar destekli)
export function calculateWindowDimensions(
  item: WindowItem,
  settings: AppSettings = DEFAULT_SETTINGS
): CalculationResult {
  const {
    width,
    height,
    color,
    verticalMullionsCount,
    horizontalMullionsCount,
    divisions,
  } = item;

  const {
    weldAllowance,
    sashOverlap,
    glassTolerance,
    steelShortage,
    profilePricePerMeter,
    steelPricePerMeter,
    glassPricePerSqM,
    fittingSetPrice,
  } = settings;

  const cutPieces: CutPiece[] = [];
  const glasses: GlassCut[] = [];

  // 1. Kasa Profil Kesimleri (45° / 45°)
  const kasaEnLength = width + weldAllowance * 2;
  const kasaBoyLength = height + weldAllowance * 2;

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

  // Kasa Destek Sacları
  cutPieces.push({
    id: "kasa-en-sac",
    label: "Kasa En Destek Sacı",
    type: "DESTEK_SACI",
    length: Math.round(width - steelShortage),
    quantity: 2,
    angle: "90-90",
    colorName: "Galvaniz Sac",
  });
  cutPieces.push({
    id: "kasa-boy-sac",
    label: "Kasa Boy Destek Sacı",
    type: "DESTEK_SACI",
    length: Math.round(height - steelShortage),
    quantity: 2,
    angle: "90-90",
    colorName: "Galvaniz Sac",
  });

  // 2. Kasa Geneli Dikey & Yatay Orta Kayıtlar (90° / 90°)
  const KASA_GENISLIGI = 60;
  const ORTA_KAYIT_GENISLIGI = 60;

  const netInternalW = width - KASA_GENISLIGI * 2;
  const netInternalH = height - KASA_GENISLIGI * 2;

  // Dikey Orta Kayıtlar
  if (verticalMullionsCount > 0) {
    const dikeyBoy = netInternalH + 4;
    cutPieces.push({
      id: "dikey-orta-kayit",
      label: "Kasa Dikey Orta Kayıt",
      type: "ORTA_KAYIT",
      length: Math.round(dikeyBoy),
      quantity: verticalMullionsCount,
      angle: "90-90",
      colorName: color.name,
    });
    cutPieces.push({
      id: "dikey-orta-kayit-sac",
      label: "Dikey Kayıt Destek Sacı",
      type: "DESTEK_SACI",
      length: Math.round(dikeyBoy - steelShortage),
      quantity: verticalMullionsCount,
      angle: "90-90",
      colorName: "Galvaniz Sac",
    });
  }

  // Yatay Orta Kayıtlar
  if (horizontalMullionsCount > 0) {
    const usableWPerCol =
      (netInternalW - verticalMullionsCount * ORTA_KAYIT_GENISLIGI) /
      (verticalMullionsCount + 1);
    const yatayEn = usableWPerCol + 4;
    const totalYatayAdet = horizontalMullionsCount * (verticalMullionsCount + 1);

    cutPieces.push({
      id: "yatay-orta-kayit",
      label: "Kasa Yatay Orta Kayıt",
      type: "ORTA_KAYIT",
      length: Math.round(yatayEn),
      quantity: totalYatayAdet,
      angle: "90-90",
      colorName: color.name,
    });
    cutPieces.push({
      id: "yatay-orta-kayit-sac",
      label: "Yatay Kayıt Destek Sacı",
      type: "DESTEK_SACI",
      length: Math.round(yatayEn - steelShortage),
      quantity: totalYatayAdet,
      angle: "90-90",
      colorName: "Galvaniz Sac",
    });
  }

  // 3. Bölme ve Kanat İçi Hesaplamalar
  const colCount = verticalMullionsCount + 1;
  const rowCount = horizontalMullionsCount + 1;
  const totalDivisions = colCount * rowCount;

  const sectionW =
    (netInternalW - verticalMullionsCount * ORTA_KAYIT_GENISLIGI) / colCount;
  const sectionH =
    (netInternalH - horizontalMullionsCount * ORTA_KAYIT_GENISLIGI) / rowCount;

  for (let i = 0; i < totalDivisions; i++) {
    const div = divisions[i] || {
      id: `div-${i}`,
      type: "sabit",
      sashVerticalMullions: 0,
      sashHorizontalMullions: 0,
    };

    if (div.type === "sabit") {
      const gW = sectionW + 12 - glassTolerance;
      const gH = sectionH + 12 - glassTolerance;
      const sqM = (gW * gH) / 1000000;
      glasses.push({
        width: Math.round(gW),
        height: Math.round(gH),
        areaSqM: Number(sqM.toFixed(3)),
        quantity: 1,
        type: "4+16+4 Isıcam Çift Cam (Sabit)",
      });
    } else {
      // Açılır Kanat
      const kanatEn = sectionW + sashOverlap + weldAllowance * 2;
      const kanatBoy = sectionH + sashOverlap + weldAllowance * 2;

      cutPieces.push({
        id: `kanat-en-${i}`,
        label: `Bölme ${i + 1} Kanat En Profili (${div.type})`,
        type: "KANAT",
        length: Math.round(kanatEn),
        quantity: 2,
        angle: "45-45",
        colorName: color.name,
      });

      cutPieces.push({
        id: `kanat-boy-${i}`,
        label: `Bölme ${i + 1} Kanat Boy Profili (${div.type})`,
        type: "KANAT",
        length: Math.round(kanatBoy),
        quantity: 2,
        angle: "45-45",
        colorName: color.name,
      });

      // 🪟 Kanat İçi Özel Orta Kayıtlar
      const sashInnerW = sectionW - sashOverlap;
      const sashInnerH = sectionH - sashOverlap;

      const sVert = div.sashVerticalMullions || 0;
      const sHoriz = div.sashHorizontalMullions || 0;

      if (sVert > 0) {
        cutPieces.push({
          id: `kanat-ici-dikey-${i}`,
          label: `Bölme ${i + 1} Kanat İçi Dikey Kayıt`,
          type: "ORTA_KAYIT",
          length: Math.round(sashInnerH + 4),
          quantity: sVert,
          angle: "90-90",
          colorName: color.name,
        });
      }

      if (sHoriz > 0) {
        const kanatYatayBoy =
          (sashInnerW - sVert * ORTA_KAYIT_GENISLIGI) / (sVert + 1) + 4;
        cutPieces.push({
          id: `kanat-ici-yatay-${i}`,
          label: `Bölme ${i + 1} Kanat İçi Yatay Kayıt`,
          type: "ORTA_KAYIT",
          length: Math.round(kanatYatayBoy),
          quantity: sHoriz * (sVert + 1),
          angle: "90-90",
          colorName: color.name,
        });
      }

      // Kanat İçi Bölünmüş Camlar
      const gCols = sVert + 1;
      const gRows = sHoriz + 1;
      const glassW =
        (sashInnerW - sVert * ORTA_KAYIT_GENISLIGI) / gCols - glassTolerance;
      const glassH =
        (sashInnerH - sHoriz * ORTA_KAYIT_GENISLIGI) / gRows - glassTolerance;
      const sqM = (glassW * glassH) / 1000000;

      glasses.push({
        width: Math.round(glassW),
        height: Math.round(glassH),
        areaSqM: Number(sqM.toFixed(3)),
        quantity: gCols * gRows,
        type: "4+16+4 Isıcam Çift Cam (Kanat İçi)",
      });
    }
  }

  // Toplam Metrajlar
  const totalProfileMeters = Number(
    cutPieces
      .filter((p) => p.type !== "DESTEK_SACI")
      .reduce((sum, p) => sum + (p.length * p.quantity) / 1000, 0)
      .toFixed(2)
  );

  const totalSteelMeters = Number(
    cutPieces
      .filter((p) => p.type === "DESTEK_SACI")
      .reduce((sum, p) => sum + (p.length * p.quantity) / 1000, 0)
      .toFixed(2)
  );

  const totalGlassSqM = Number(
    glasses.reduce((sum, g) => sum + g.areaSqM * g.quantity, 0).toFixed(2)
  );

  const acilirSayisi = divisions.filter((d) => d.type !== "sabit").length;

  const estimatedPriceTL = Math.round(
    totalProfileMeters * (profilePricePerMeter * color.priceMultiplier) +
      totalSteelMeters * steelPricePerMeter +
      totalGlassSqM * glassPricePerSqM +
      acilirSayisi * fittingSetPrice
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
  sawKerf = 5
): OptimizationStock[] {
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
