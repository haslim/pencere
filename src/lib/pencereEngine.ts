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

export type SystemType =
  | "STANDART_DOGRAMA"
  | "KAPI_SISTEMI"
  | "SURME_SISTEM"
  | "HEBESCHIEBE";

export type KasaProfileType =
  | "L_KASA" // Standart L Kasa (Dış Kasa)
  | "T_KASA" // T Kasa (Kayıtlı Kasa)
  | "Z_KASA" // Z Kasa (Pervazlı / İçe Açılır Kasa)
  | "ESIKLI_KASA" // Alüminyum Eşikli Kapı Kasa
  | "SURME_KASA_2" // 2'li Sürme Kasa (2 Raylı)
  | "SURME_KASA_3"; // 3'lü Sürme Kasa (3 Raylı)

export type SashProfileType =
  | "PENCERE_KANADI" // Standart Pencere Kanadı
  | "KAPI_KANADI" // Ağır Seri Dışa/İçe Açılır Kapı Kanadı
  | "SURME_KANAD" // Sürme Seri Kanat
  | "VASISTAS"; // Vasistas Kanat

export type DivisionType =
  | "sabit"
  | "tek-acilim"
  | "cift-acilim"
  | "vasistas"
  | "kapi-ic"
  | "kapi-dis"
  | "surme-sol"
  | "surme-sag"
  | "surme-cift";

export interface DivisionItem {
  id: string;
  type: DivisionType;
  sashProfileType?: SashProfileType;
  sashVerticalMullions: number; // Kanat içi dikey kayıt
  sashHorizontalMullions: number; // Kanat içi yatay kayıt
}

export interface WindowItem {
  id: string;
  name: string;
  width: number; // mm (dış kasa eni)
  height: number; // mm (dış kasa boyu)
  color: ProfileColor;
  systemType?: SystemType;
  kasaProfileType?: KasaProfileType;
  // Özel Konumlandırılmış Kayıtlar (Offset mm: Pozitif soldan/üstten, Negatif sağdan/alttan)
  customVerticalMullions?: number[];
  customHorizontalMullions?: number[];
  verticalMullionsCount: number; // Kasa geneli Dikey Orta Kayıt sayısı
  horizontalMullionsCount: number; // Kasa geneli Yatay Orta Kayıt sayısı
  divisions: DivisionItem[];
}

export interface CutPiece {
  id: string;
  label: string;
  type: "KASA" | "KANAT" | "KAPI_KANADI" | "ORTA_KAYIT" | "DESTEK_SACI" | "CITA" | "ALUMINYUM_ESIK";
  length: number; // mm
  quantity: number;
  angle: "45-45" | "90-90" | "45-90" | "90-45";
  leftAngle?: number; // deg e.g. 45 or 90
  rightAngle?: number; // deg e.g. 45 or 90
  cncOperations?: string[]; // CNC freze/delik işleme parametreleri
  colorName: string;
}

export interface GlassCut {
  width: number;
  height: number;
  areaSqM: number;
  quantity: number;
  type: string;
  posName?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Order {
  id: string;
  customerId: string;
  orderNo: string;
  title: string;
  items: WindowItem[];
  createdAt: string;
}

export interface OrderCalculationResult {
  itemResults: { item: WindowItem; calc: CalculationResult }[];
  allCutPieces: CutPiece[];
  allGlasses: GlassCut[];
  totalProfileMeters: number;
  totalSteelMeters: number;
  totalGlassSqM: number;
  costPriceTL: number;
  totalPriceTL: number;
  profitTL: number;
}

export interface CalculationResult {
  cutPieces: CutPiece[];
  glasses: GlassCut[];
  totalProfileMeters: number;
  totalSteelMeters: number;
  totalGlassSqM: number;
  costPriceTL: number;
  estimatedPriceTL: number;
  profitTL: number;
}

export interface OptimizationStock {
  barLength: number; // mm (6000mm)
  usedLength: number;
  cuts: { pieceLabel: string; length: number; leftAngle?: number; rightAngle?: number; barcode?: string }[];
  wasteLength: number;
  wastePercentage: number;
}

// Kayıtların Mutlak mm Konumlarını Hesaplama (Offset + Soldan, - Sağdan/Alttan)
export function resolveMullionPositions(
  totalLength: number,
  count: number,
  customOffsets?: number[]
): number[] {
  if (count <= 0) return [];

  if (customOffsets && customOffsets.length === count) {
    const resolved = customOffsets.map((offset) => {
      if (offset < 0) {
        return Math.max(80, totalLength + offset); // Negatif ise sağdan/alttan
      }
      return Math.min(totalLength - 80, offset); // Pozitif ise soldan/üstten
    });
    return resolved.sort((a, b) => a - b);
  }

  // Varsayılan Eşit Dağıtım
  const step = totalLength / (count + 1);
  return Array.from({ length: count }).map((_, i) => Math.round(step * (i + 1)));
}

// Sistem SaaS Gelişmiş İmalat & Düşüm Hesaplama Motoru
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
    customVerticalMullions,
    customHorizontalMullions,
    divisions,
    systemType = "STANDART_DOGRAMA",
    kasaProfileType = "L_KASA",
  } = item;

  const {
    weldAllowance,
    sashOverlap,
    glassTolerance,
    steelShortage,
  } = settings;

  const cutPieces: CutPiece[] = [];
  const glasses: GlassCut[] = [];

  // 1. Kasa Profil Kesimleri
  const isEsikli = kasaProfileType === "ESIKLI_KASA";
  const isSurme = systemType === "SURME_SISTEM" || systemType === "HEBESCHIEBE";

  let kasaLabel = "L Kasa Dış Profili";
  if (kasaProfileType === "T_KASA") kasaLabel = "T Kasa (Kayıtlı Kasa) Profili";
  if (kasaProfileType === "Z_KASA") kasaLabel = "Z Kasa (Pervazlı Kasa) Profili";
  if (kasaProfileType === "SURME_KASA_2") kasaLabel = "2 Raylı Sürme Kasa Profili";
  if (kasaProfileType === "SURME_KASA_3") kasaLabel = "3 Raylı Sürme Kasa Profili";

  const kasaEnLength = width + weldAllowance * 2;
  const kasaBoyLength = height + weldAllowance * 2;

  if (isEsikli) {
    cutPieces.push({
      id: "kasa-ust",
      label: "Kasa Üst Profili (L Kasa)",
      type: "KASA",
      length: Math.round(kasaEnLength),
      quantity: 1,
      angle: "45-45",
      leftAngle: 45,
      rightAngle: 45,
      cncOperations: ["KABA_SU_TAHLIYE_1", "CORNER_WELD_NOTCH"],
      colorName: color.name,
    });
    cutPieces.push({
      id: "kasa-yan",
      label: "Kasa Yan Profilleri (L Kasa)",
      type: "KASA",
      length: Math.round(kasaBoyLength),
      quantity: 2,
      angle: "45-90",
      leftAngle: 45,
      rightAngle: 90,
      cncOperations: ["HINGE_DRILL_LEFT", "LOCK_STRIKER_MILL"],
      colorName: color.name,
    });
    cutPieces.push({
      id: "kasa-alt-esik",
      label: "Alt Alüminyum Kapı Eşiği",
      type: "ALUMINYUM_ESIK",
      length: Math.round(width - 12),
      quantity: 1,
      angle: "90-90",
      leftAngle: 90,
      rightAngle: 90,
      cncOperations: [],
      colorName: "Eloksal Alüminyum",
    });
  } else {
    cutPieces.push({
      id: "kasa-en",
      label: `${kasaLabel} (En)`,
      type: "KASA",
      length: Math.round(kasaEnLength),
      quantity: 2,
      angle: "45-45",
      leftAngle: 45,
      rightAngle: 45,
      cncOperations: ["DRAINAGE_SLOT_CENTER", "CORNER_WELD_NOTCH"],
      colorName: color.name,
    });
    cutPieces.push({
      id: "kasa-boy",
      label: `${kasaLabel} (Boy)`,
      type: "KASA",
      length: Math.round(kasaBoyLength),
      quantity: 2,
      angle: "45-45",
      leftAngle: 45,
      rightAngle: 45,
      cncOperations: ["CORNER_WELD_NOTCH"],
      colorName: color.name,
    });
  }

  // Kasa Destek Sacları
  cutPieces.push({
    id: "kasa-en-sac",
    label: "Kasa En Destek Sacı",
    type: "DESTEK_SACI",
    length: Math.round(width - steelShortage),
    quantity: isEsikli ? 1 : 2,
    angle: "90-90",
    leftAngle: 90,
    rightAngle: 90,
    colorName: "Galvaniz Sac",
  });
  cutPieces.push({
    id: "kasa-boy-sac",
    label: "Kasa Boy Destek Sacı",
    type: "DESTEK_SACI",
    length: Math.round(height - steelShortage),
    quantity: 2,
    angle: "90-90",
    leftAngle: 90,
    rightAngle: 90,
    colorName: "Galvaniz Sac",
  });

  // 2. Kasa Geneli Dikey & Yatay Orta Kayıtlar
  const KASA_GENISLIGI = isSurme ? 75 : 60;
  const ORTA_KAYIT_GENISLIGI = 60;

  const netInternalW = width - KASA_GENISLIGI * 2;
  const netInternalH = height - KASA_GENISLIGI * 2;

  // Dikey Ve Yatay Kayıt Konumlarının Hesaplanması (Offset + / - Destekli)
  const vPositions = resolveMullionPositions(width, verticalMullionsCount, customVerticalMullions);
  const hPositions = resolveMullionPositions(height, horizontalMullionsCount, customHorizontalMullions);

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
      leftAngle: 90,
      rightAngle: 90,
      cncOperations: ["MULLION_END_MILLING", "SCREW_HOLE_DRILL"],
      colorName: color.name,
    });
    cutPieces.push({
      id: "dikey-orta-kayit-sac",
      label: "Dikey Kayıt Destek Sacı",
      type: "DESTEK_SACI",
      length: Math.round(dikeyBoy - steelShortage),
      quantity: verticalMullionsCount,
      angle: "90-90",
      leftAngle: 90,
      rightAngle: 90,
      colorName: "Galvaniz Sac",
    });
  }

  // Yatay Orta Kayıtlar
  if (horizontalMullionsCount > 0) {
    const colCount = verticalMullionsCount + 1;

    for (let c = 0; c < colCount; c++) {
      const colLeft = c === 0 ? KASA_GENISLIGI : vPositions[c - 1] + ORTA_KAYIT_GENISLIGI / 2;
      const colRight = c === verticalMullionsCount ? width - KASA_GENISLIGI : vPositions[c] - ORTA_KAYIT_GENISLIGI / 2;
      const colW = colRight - colLeft;

      cutPieces.push({
        id: `yatay-orta-kayit-col-${c}`,
        label: `Kasa Yatay Orta Kayıt (Bölüm ${c + 1})`,
        type: "ORTA_KAYIT",
        length: Math.round(colW + 4),
        quantity: horizontalMullionsCount,
        angle: "90-90",
        leftAngle: 90,
        rightAngle: 90,
        cncOperations: ["MULLION_END_MILLING"],
        colorName: color.name,
      });

      cutPieces.push({
        id: `yatay-orta-kayit-sac-col-${c}`,
        label: `Yatay Kayıt Destek Sacı (Bölüm ${c + 1})`,
        type: "DESTEK_SACI",
        length: Math.round(colW + 4 - steelShortage),
        quantity: horizontalMullionsCount,
        angle: "90-90",
        leftAngle: 90,
        rightAngle: 90,
        colorName: "Galvaniz Sac",
      });
    }
  }

  // 3. Bölme ve Kanat İçi Hesaplamalar
  const colCount = verticalMullionsCount + 1;
  const rowCount = horizontalMullionsCount + 1;

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const divIdx = r * colCount + c;
      const div = divisions[divIdx] || {
        type: "sabit",
        sashProfileType: "PENCERE_KANADI",
        sashVerticalMullions: 0,
        sashHorizontalMullions: 0,
      };
      const divType = div.type;
      const sashProf = div.sashProfileType || (divType.includes("kapi") ? "KAPI_KANADI" : divType.includes("surme") ? "SURME_KANAD" : "PENCERE_KANADI");

      const colLeft = c === 0 ? KASA_GENISLIGI : vPositions[c - 1] + ORTA_KAYIT_GENISLIGI / 2;
      const colRight = c === verticalMullionsCount ? width - KASA_GENISLIGI : vPositions[c] - ORTA_KAYIT_GENISLIGI / 2;
      const sectionW = colRight - colLeft;

      const rowTop = r === 0 ? KASA_GENISLIGI : hPositions[r - 1] + ORTA_KAYIT_GENISLIGI / 2;
      const rowBottom = r === horizontalMullionsCount ? height - KASA_GENISLIGI : hPositions[r] - ORTA_KAYIT_GENISLIGI / 2;
      const sectionH = rowBottom - rowTop;

      if (divType === "sabit") {
        const glassW = sectionW - glassTolerance;
        const glassH = sectionH - glassTolerance;
        const sqM = (glassW * glassH) / 1000000;

        glasses.push({
          width: Math.round(glassW),
          height: Math.round(glassH),
          areaSqM: Number(sqM.toFixed(3)),
          quantity: 1,
          type: "4+16+4 Isıcam Çift Cam (Kasa İçi Sabit)",
          posName: item.name,
        });

        cutPieces.push({
          id: `cita-en-${divIdx}`,
          label: `Bölme ${divIdx + 1} Sabit Çıta (En)`,
          type: "CITA",
          length: Math.round(glassW + 10),
          quantity: 2,
          angle: "45-45",
          leftAngle: 45,
          rightAngle: 45,
          colorName: color.name,
        });
        cutPieces.push({
          id: `cita-boy-${divIdx}`,
          label: `Bölme ${divIdx + 1} Sabit Çıta (Boy)`,
          type: "CITA",
          length: Math.round(glassH + 10),
          quantity: 2,
          angle: "45-45",
          leftAngle: 45,
          rightAngle: 45,
          colorName: color.name,
        });
      } else {
        const isDoorSash = sashProf === "KAPI_KANADI" || divType.includes("kapi");
        const isSlidingSash = sashProf === "SURME_KANAD" || divType.includes("surme");

        const kanatOverlap = isDoorSash ? sashOverlap + 6 : sashOverlap;
        const kanatEn = sectionW + kanatOverlap + weldAllowance * 2;
        const kanatBoy = sectionH + kanatOverlap + weldAllowance * 2;

        const kanatLabel = isDoorSash
          ? "Geniş Kapı Kanadı Profili (Ağır Seri)"
          : isSlidingSash
          ? "Sürme Seri Kanat Profili"
          : "Standart Pencere Kanadı Profili";

        cutPieces.push({
          id: `kanat-en-${divIdx}`,
          label: `Bölme ${divIdx + 1} ${kanatLabel} (En)`,
          type: isDoorSash ? "KAPI_KANADI" : "KANAT",
          length: Math.round(kanatEn),
          quantity: 2,
          angle: "45-45",
          leftAngle: 45,
          rightAngle: 45,
          cncOperations: ["HANDLE_LOCK_ROD_MILLING", "ESPAGNOLETTE_NOTCH"],
          colorName: color.name,
        });

        cutPieces.push({
          id: `kanat-boy-${divIdx}`,
          label: `Bölme ${divIdx + 1} ${kanatLabel} (Boy)`,
          type: isDoorSash ? "KAPI_KANADI" : "KANAT",
          length: Math.round(kanatBoy),
          quantity: 2,
          angle: "45-45",
          leftAngle: 45,
          rightAngle: 45,
          cncOperations: ["HINGE_DRILL_SASH", "CORNER_WELD_NOTCH"],
          colorName: color.name,
        });

        const sashInnerW = sectionW - sashOverlap;
        const sashInnerH = sectionH - sashOverlap;

        const sVert = div.sashVerticalMullions || 0;
        const sHoriz = div.sashHorizontalMullions || 0;

        if (sVert > 0) {
          cutPieces.push({
            id: `kanat-ici-dikey-${divIdx}`,
            label: `Bölme ${divIdx + 1} Kanat İçi Dikey Kayıt`,
            type: "ORTA_KAYIT",
            length: Math.round(sashInnerH + 4),
            quantity: sVert,
            angle: "90-90",
            leftAngle: 90,
            rightAngle: 90,
            colorName: color.name,
          });
        }

        if (sHoriz > 0) {
          const kanatYatayBoy =
            (sashInnerW - sVert * ORTA_KAYIT_GENISLIGI) / (sVert + 1) + 4;
          cutPieces.push({
            id: `kanat-ici-yatay-${divIdx}`,
            label: `Bölme ${divIdx + 1} Kanat İçi Yatay Kayıt`,
            type: "ORTA_KAYIT",
            length: Math.round(kanatYatayBoy),
            quantity: sHoriz * (sVert + 1),
            angle: "90-90",
            leftAngle: 90,
            rightAngle: 90,
            colorName: color.name,
          });
        }

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
          type: `4+16+4 Isıcam Çift Cam (${isDoorSash ? "Kapı Kanadı İçi" : isSlidingSash ? "Sürme Kanat İçi" : "Pencere Kanat İçi"})`,
          posName: item.name,
        });
      }
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

  const {
    profilePricePerMeter = 180,
    steelPricePerMeter = 65,
    glassPricePerSqM = 950,
    fittingSetPrice = 450,
    profileSalePricePerMeter,
    steelSalePricePerMeter,
    glassSalePricePerSqM,
    fittingSalePrice,
    profitMarginPercent = 0,
  } = settings;

  const costPriceTL = Math.round(
    totalProfileMeters * (profilePricePerMeter * color.priceMultiplier) +
      totalSteelMeters * steelPricePerMeter +
      totalGlassSqM * glassPricePerSqM +
      acilirSayisi * fittingSetPrice
  );

  const baseSalesPrice = Math.round(
    totalProfileMeters * ((profileSalePricePerMeter || profilePricePerMeter * 1.3) * color.priceMultiplier) +
      totalSteelMeters * (steelSalePricePerMeter || steelPricePerMeter * 1.3) +
      totalGlassSqM * (glassSalePricePerSqM || glassPricePerSqM * 1.3) +
      acilirSayisi * (fittingSalePrice || fittingSetPrice * 1.3)
  );

  const estimatedPriceTL = Math.round(
    profitMarginPercent > 0 ? costPriceTL * (1 + profitMarginPercent / 100) : baseSalesPrice
  );

  const profitTL = Math.max(0, estimatedPriceTL - costPriceTL);

  return {
    cutPieces,
    glasses,
    totalProfileMeters,
    totalSteelMeters,
    totalGlassSqM,
    costPriceTL,
    estimatedPriceTL,
    profitTL,
  };
}

// 1D Optimizasyon Algoritması (First Fit Decreasing / FFD) - Çoklu / Özel Stok Boyu Destekli
export function optimizeCutList(
  pieces: CutPiece[],
  stockBarLength: number | number[] = 6000,
  sawKerf = 5
): OptimizationStock[] {
  const allPieces: { label: string; length: number; leftAngle?: number; rightAngle?: number; barcode: string }[] = [];
  let indexCounter = 1;

  pieces.forEach((p) => {
    for (let i = 0; i < p.quantity; i++) {
      const barcode = `PR-${String(indexCounter).padStart(5, "0")}`;
      allPieces.push({
        label: `${p.label} #${i + 1}`,
        length: p.length,
        leftAngle: p.leftAngle || (p.angle.startsWith("45") ? 45 : 90),
        rightAngle: p.rightAngle || (p.angle.endsWith("45") ? 45 : 90),
        barcode,
      });
      indexCounter++;
    }
  });

  allPieces.sort((a, b) => b.length - a.length);

  const stockBars: OptimizationStock[] = [];
  const availableLengths = Array.isArray(stockBarLength)
    ? stockBarLength.length > 0
      ? stockBarLength
      : [6000]
    : [stockBarLength];

  for (const piece of allPieces) {
    let placed = false;

    for (const bar of stockBars) {
      if (bar.barLength - bar.usedLength >= piece.length + sawKerf) {
        bar.cuts.push({
          pieceLabel: piece.label,
          length: piece.length,
          leftAngle: piece.leftAngle,
          rightAngle: piece.rightAngle,
          barcode: piece.barcode,
        });
        bar.usedLength += piece.length + sawKerf;
        bar.wasteLength = bar.barLength - bar.usedLength;
        bar.wastePercentage = Number(((bar.wasteLength / bar.barLength) * 100).toFixed(1));
        placed = true;
        break;
      }
    }

    if (!placed) {
      const suitableLengths = availableLengths.filter(
        (l) => l >= piece.length + sawKerf
      );
      const chosenLength =
        suitableLengths.length > 0
          ? Math.min(...suitableLengths)
          : Math.max(...availableLengths, piece.length + sawKerf + 100);

      const used = piece.length + sawKerf;
      const waste = chosenLength - used;
      stockBars.push({
        barLength: chosenLength,
        usedLength: used,
        cuts: [
          {
            pieceLabel: piece.label,
            length: piece.length,
            leftAngle: piece.leftAngle,
            rightAngle: piece.rightAngle,
            barcode: piece.barcode,
          },
        ],
        wasteLength: waste,
        wastePercentage: Number(((waste / chosenLength) * 100).toFixed(1)),
      });
    }
  }

  return stockBars;
}

// Ercom Smart CNC Veri İhracatı (Kaban, Murat, Yılmaz, Biesse CNC Otomasyon Formatı)
export function exportToCNCData(
  items: WindowItem[],
  machineBrand: "KABAN" | "MURAT" | "YILMAZ" | "GENERIC_NC" = "KABAN"
): string {
  const lines: string[] = [];
  const timestamp = new Date().toISOString();

  lines.push(`; ERCOM SMART ENTERPRISE CNC AUTOMATION FILE`);
  lines.push(`; MACHINE: ${machineBrand}`);
  lines.push(`; GENERATED: ${timestamp}`);
  lines.push(`; HEADER: POS_NO;PROFILE_TYPE;COLOR;LENGTH_MM;ANGLE_L;ANGLE_R;BARCODE;OPS`);
  lines.push(``);

  let posCounter = 1;
  items.forEach((item) => {
    const calc = calculateWindowDimensions(item);
    calc.cutPieces.forEach((piece) => {
      for (let q = 1; q <= piece.quantity; q++) {
        const barcode = `BAR-${posCounter}-${q}`;
        const ops = (piece.cncOperations || []).join("|") || "NONE";
        const lAngle = piece.leftAngle || 45;
        const rAngle = piece.rightAngle || 45;

        if (machineBrand === "KABAN") {
          lines.push(`KABAN_CUT,${posCounter},${piece.type},${piece.colorName},${piece.length},${lAngle},${rAngle},${barcode},[${ops}]`);
        } else if (machineBrand === "MURAT") {
          lines.push(`MURAT_NC;${posCounter};${piece.type};${piece.length};${lAngle};${rAngle};${barcode}`);
        } else {
          lines.push(`${posCounter},${piece.type},${piece.length},${lAngle},${rAngle},${barcode}`);
        }
        posCounter++;
      }
    });
  });

  return lines.join("\n");
}

// Sipariş Geneli (Çoklu Poz) Toplam Hesaplama
export function calculateOrderSummary(
  items: WindowItem[],
  settings: AppSettings = DEFAULT_SETTINGS
): OrderCalculationResult {
  const itemResults = items.map((item) => ({
    item,
    calc: calculateWindowDimensions(item, settings),
  }));

  const allCutPieces: CutPiece[] = [];
  itemResults.forEach(({ item, calc }) => {
    calc.cutPieces.forEach((piece) => {
      allCutPieces.push({
        ...piece,
        label: `${piece.label} (${item.name})`,
      });
    });
  });

  const allGlasses: GlassCut[] = [];
  itemResults.forEach(({ calc }) => {
    allGlasses.push(...calc.glasses);
  });

  const totalProfileMeters = Number(
    itemResults.reduce((acc, curr) => acc + curr.calc.totalProfileMeters, 0).toFixed(2)
  );
  const totalSteelMeters = Number(
    itemResults.reduce((acc, curr) => acc + curr.calc.totalSteelMeters, 0).toFixed(2)
  );
  const totalGlassSqM = Number(
    itemResults.reduce((acc, curr) => acc + curr.calc.totalGlassSqM, 0).toFixed(2)
  );

  const costPriceTL = Math.round(
    itemResults.reduce((acc, curr) => acc + curr.calc.costPriceTL, 0)
  );
  const totalPriceTL = Math.round(
    itemResults.reduce((acc, curr) => acc + curr.calc.estimatedPriceTL, 0)
  );
  const profitTL = Math.max(0, totalPriceTL - costPriceTL);

  return {
    itemResults,
    allCutPieces,
    allGlasses,
    totalProfileMeters,
    totalSteelMeters,
    totalGlassSqM,
    costPriceTL,
    totalPriceTL,
    profitTL,
  };
}

