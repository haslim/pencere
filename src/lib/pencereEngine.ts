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
  | "EGEPEN_LEGEND" // Egepen Legend 80mm Seri (Orta Contalı)
  | "EGEPEN_LEGEND_ART" // Egepen Legend Art Sistemi (Tasarım Ödüllü Minimal Seri)
  | "EGEPEN_LEGEND_CROWN" // Egepen Legend Crown / Crown-76
  | "EGEPEN_ZENDOW" // Egepen Zendow 70mm Seri
  | "EGEPEN_ZENDOW_DELUXE" // Egepen Zendow Deluxe Seri
  | "EGEPEN_SURME" // Egepen Standart Sürme Sistemi (2 & 3 Raylı)
  | "EGEPEN_LEGEND_PLUS_SLIDE" // Egepen Legend Plus / Slide Sürme
  | "EGEPEN_HS76"; // Egepen HS 76 Hebeschiebe (Kaldırmalı Sürme)

export interface EgepenSeriesInfo {
  id: SystemType;
  name: string;
  depthMm: number;
  chamberCount: number;
  description: string;
  pricePerMeter: number;
  isSliding: boolean;
}

export const EGEPEN_SERIES: EgepenSeriesInfo[] = [
  {
    id: "EGEPEN_LEGEND",
    name: "Egepen Legend (80 mm)",
    depthMm: 80,
    chamberCount: 6,
    description: "80 mm Genişlik, 6 Odacıklı & 3 Contalı Üst Isı Yalıtım Serisi",
    pricePerMeter: 322.51,
    isSliding: false,
  },
  {
    id: "EGEPEN_LEGEND_ART",
    name: "Egepen Legend Art (Tasarım Seri)",
    depthMm: 80,
    chamberCount: 6,
    description: "İnce Kesitli Özel Tasarım Pembe/Yalıtımlı Çıtalar",
    pricePerMeter: 265.66,
    isSliding: false,
  },
  {
    id: "EGEPEN_LEGEND_CROWN",
    name: "Egepen Legend Crown (76 mm)",
    depthMm: 76,
    chamberCount: 5,
    description: "76 mm Özel Kanat ve Kasa Profili Sistemleri",
    pricePerMeter: 313.39,
    isSliding: false,
  },
  {
    id: "EGEPEN_ZENDOW",
    name: "Egepen Zendow (70 mm)",
    depthMm: 70,
    chamberCount: 5,
    description: "70 mm Genişlik, 5 Odacıklı Klasik Seri",
    pricePerMeter: 308.65,
    isSliding: false,
  },
  {
    id: "EGEPEN_ZENDOW_DELUXE",
    name: "Egepen Zendow Deluxe",
    depthMm: 70,
    chamberCount: 5,
    description: "70 mm L-44 ve Pervazlı Kasa Seçenekli Lüks Seri",
    pricePerMeter: 327.84,
    isSliding: false,
  },
  {
    id: "EGEPEN_SURME",
    name: "Egepen Sürme Sistemi",
    depthMm: 110,
    chamberCount: 3,
    description: "Ekonomik ve Pratik Sürme Pencere/Kapı Sistemleri",
    pricePerMeter: 268.37,
    isSliding: true,
  },
  {
    id: "EGEPEN_LEGEND_PLUS_SLIDE",
    name: "Egepen Legend Plus / Slide Sürme",
    depthMm: 140,
    chamberCount: 5,
    description: "Legend Seri Sızdırmaz Contalı Özel Sürme",
    pricePerMeter: 466.59,
    isSliding: true,
  },
  {
    id: "EGEPEN_HS76",
    name: "Egepen HS 76 Hebeschiebe",
    depthMm: 175,
    chamberCount: 5,
    description: "76 mm Kaldırmalı Ağır Sürme Kapı Serisi (Hebeschiebe)",
    pricePerMeter: 746.30,
    isSliding: true,
  },
];


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
  | "surme-sol" // Sol Hareketli Sürme
  | "surme-sag" // Sağ Hareketli Sürme
  | "surme-sabit" // Sabit Sürme Kanadı (Fix Sliding)
  | "surme-cift"; // Çift Hareketli Sürme Kanatlar


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
  quantity?: number; // Poz Adedi (Varsayılan: 1)
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
  code: string; // Egepen / E2000 Stok Kodu (örn. 11400, 11760, 12660, 13060)
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

export interface AccessoryItem {
  id: string;
  code: string; // Egepen / Donanım Stok Kodu (örn. 13185, 13186, 10578, 12082)
  name: string;
  category: "DONANIM" | "MENTESE" | "CONTA_FITIL" | "TAKAZ_BAGLANTI" | "SARF_MALZEME";
  unit: "ADET" | "TAKIM" | "METRE";
  quantity: number;
  unitPriceTL: number;
  totalPriceTL: number;
}

export interface ItemCatalogEntry {
  code: string;
  name: string;
  category: "PROFIL" | "DESTEK_SACI" | "CITA" | "DONANIM" | "MENTESE" | "CONTA_FITIL" | "AKSESUAR";
  unit: "METRE" | "ADET" | "TAKIM" | "KG";
  unitPriceTL: number;
}

export const DEFAULT_ITEM_PRICE_CATALOG: Record<string, ItemCatalogEntry> = {
  // --- ZENDOW 70mm PROFİLLER ---
  "11400": { code: "11400", name: "Zendow 70mm L Kasa Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 308.65 },
  "11402": { code: "11402", name: "Zendow 70mm Z Kasa Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 327.84 },
  "11405": { code: "11405", name: "Zendow 70mm Pencere Kanadı Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 318.50 },
  "11412": { code: "11412", name: "Zendow 70mm Kapı Kanadı Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 420.00 },
  "11409": { code: "11409", name: "Zendow 70mm T Orta Kayıt Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 312.00 },

  // --- LEGEND 80mm & LEGEND ART PROFİLLER ---
  "11760": { code: "11760", name: "Legend 80mm L Kasa Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 322.51 },
  "11762": { code: "11762", name: "Legend Art 80mm L Kasa Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 265.66 },
  "11765": { code: "11765", name: "Legend 80mm Pencere Kanadı Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 335.00 },
  "11770": { code: "11770", name: "Legend 80mm Kapı Kanadı Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 445.00 },
  "11768": { code: "11768", name: "Legend 80mm T Orta Kayıt Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 330.00 },

  // --- SÜRME PROFİLLERİ ---
  "12660": { code: "12660", name: "Sürme 2 Raylı Kasa Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 268.37 },
  "12662": { code: "12662", name: "Sürme 3 Raylı Kasa Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 310.00 },
  "12661": { code: "12661", name: "Sürme Seri Kanat Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 285.00 },
  "12663": { code: "12663", name: "Sürme Seri Orta Kayıt Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 275.00 },
  "11460": { code: "11460", name: "Legend Plus / Slide Sürme Kasa Profili", category: "PROFIL", unit: "METRE", unitPriceTL: 466.59 },

  // --- CAM ÇITALARI ---
  "12641": { code: "12641", name: "Dekoratif Cam Çıtası 20mm", category: "CITA", unit: "METRE", unitPriceTL: 45.00 },
  "12648": { code: "12648", name: "Çift Cam Çıtası 28mm", category: "CITA", unit: "METRE", unitPriceTL: 48.00 },
  "12650": { code: "12650", name: "Üçlü Cam Çıtası 32mm", category: "CITA", unit: "METRE", unitPriceTL: 52.00 },

  // --- DESTEK SACLARI ---
  "13060": { code: "13060", name: "Kasa Galvaniz Destek Sacı (1.2mm)", category: "DESTEK_SACI", unit: "METRE", unitPriceTL: 65.00 },
  "13061": { code: "13061", name: "Kanat Galvaniz Destek Sacı (1.5mm)", category: "DESTEK_SACI", unit: "METRE", unitPriceTL: 78.00 },
  "13066": { code: "13066", name: "Orta Kayıt Galvaniz Destek Sacı (1.5mm)", category: "DESTEK_SACI", unit: "METRE", unitPriceTL: 78.00 },
  "13064": { code: "13064", name: "Ağır Kapı Galvaniz Sacı (2.0mm)", category: "DESTEK_SACI", unit: "METRE", unitPriceTL: 105.00 },

  // --- DONANIM & AKSESUARLAR ---
  "13185": { code: "13185", name: "Tek Açılım İspanyolet & Karşılık Seti", category: "DONANIM", unit: "TAKIM", unitPriceTL: 280.00 },
  "13186": { code: "13186", name: "Egepen Çift Açılım İspanyolet, Makas Seti", category: "DONANIM", unit: "TAKIM", unitPriceTL: 550.00 },
  "13187": { code: "13187", name: "Vasistas Makas & Çarpma Kilit Seti", category: "DONANIM", unit: "TAKIM", unitPriceTL: 280.00 },
  "13162": { code: "13162", name: "Egepen Kilitli Kapı İspanyoleti & Kol Seti", category: "DONANIM", unit: "TAKIM", unitPriceTL: 850.00 },
  "13163": { code: "13163", name: "Sürme Seri Ayarlı Rulman Takımı", category: "DONANIM", unit: "TAKIM", unitPriceTL: 420.00 },
  "13110": { code: "13110", name: "Sürme Kanat Stoper & Kenet Takozu", category: "DONANIM", unit: "ADET", unitPriceTL: 45.00 },
  "12082": { code: "12082", name: "Pencere / Kapı Menteşesi (75-90mm)", category: "MENTESE", unit: "ADET", unitPriceTL: 35.00 },
  "10578": { code: "10578", name: "EPDM Kauçuk Kasa/Kanat Contası / Kıl Fitil", category: "CONTA_FITIL", unit: "METRE", unitPriceTL: 12.00 },
  "13135": { code: "13135", name: "Orta Kayıt Bağlantı Takozu & Vidası", category: "AKSESUAR", unit: "ADET", unitPriceTL: 18.00 },
  "13165": { code: "13165", name: "Cam Ayar Takozu Seti", category: "AKSESUAR", unit: "ADET", unitPriceTL: 6.00 },
  "13514": { code: "13514", name: "Dış Kasa Su Tahliye Slot Kapağı", category: "AKSESUAR", unit: "ADET", unitPriceTL: 8.00 },
};


export interface CostBreakdown {
  profileCostTL: number;
  steelCostTL: number;
  glassCostTL: number;
  accessoryCostTL: number;
  laborCostTL: number;
}

export interface OrderCalculationResult {
  itemResults: { item: WindowItem; calc: CalculationResult }[];
  allCutPieces: CutPiece[];
  allGlasses: GlassCut[];
  allAccessories: AccessoryItem[];
  totalProfileMeters: number;
  totalSteelMeters: number;
  totalGlassSqM: number;
  totalAccessoryCostTL: number;
  totalLaborCostTL: number;
  costPriceTL: number;
  totalPriceTL: number;
  profitTL: number;
  breakdown: CostBreakdown;
}

export interface CalculationResult {
  cutPieces: CutPiece[];
  glasses: GlassCut[];
  accessories: AccessoryItem[];
  totalProfileMeters: number;
  totalSteelMeters: number;
  totalGlassSqM: number;
  totalAccessoryCostTL: number;
  totalLaborCostTL: number;
  costPriceTL: number;
  estimatedPriceTL: number;
  profitTL: number;
  breakdown: CostBreakdown;
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

  const seriesInfo = EGEPEN_SERIES.find((s) => s.id === systemType) || EGEPEN_SERIES[3];
  const isSurme = seriesInfo.isSliding;
  const isEsikli = kasaProfileType === "ESIKLI_KASA";


  let kasaLabel = `${seriesInfo.name} L Kasa Profili`;
  if (kasaProfileType === "T_KASA") kasaLabel = `${seriesInfo.name} T Kasa (Orta Kayıtlı Kasa)`;
  if (kasaProfileType === "Z_KASA") kasaLabel = `${seriesInfo.name} Z Kasa (Pervazlı Kasa)`;
  if (kasaProfileType === "SURME_KASA_2") kasaLabel = `${seriesInfo.name} 2 Raylı Sürme Kasa`;
  if (kasaProfileType === "SURME_KASA_3") kasaLabel = `${seriesInfo.name} 3 Raylı Sürme Kasa`;

  const kasaEnLength = width + weldAllowance * 2;
  const kasaBoyLength = height + weldAllowance * 2;

  const cutPieces: CutPiece[] = [];
  const glasses: GlassCut[] = [];


  const kasaCode = isSurme ? "12660" : systemType === "EGEPEN_ZENDOW" ? "11400" : "11760";
  const mullionCode = isSurme ? "12663" : systemType === "EGEPEN_ZENDOW" ? "11409" : "11768";
  const windowSashCode = systemType === "EGEPEN_ZENDOW" ? "11405" : "11765";
  const doorSashCode = systemType === "EGEPEN_ZENDOW" ? "11412" : "11770";
  const slidingSashCode = "12661";

  if (isEsikli) {
    cutPieces.push({
      id: "kasa-ust",
      code: kasaCode,
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
      code: kasaCode,
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
      code: "13514",
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
      code: kasaCode,
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
      code: kasaCode,
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
    code: "13060",
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
    code: "13060",
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
      code: mullionCode,
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
      code: "13066",
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
        code: mullionCode,
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
        code: "13066",
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
      const sashProf = isSurme
        ? "SURME_KANAD"
        : div.sashProfileType || (divType.includes("kapi") ? "KAPI_KANADI" : divType.includes("surme") ? "SURME_KANAD" : "PENCERE_KANADI");

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
          code: "12648",
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
          code: "12648",
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

        const targetSashCode = isDoorSash ? doorSashCode : isSlidingSash ? slidingSashCode : windowSashCode;

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
          code: targetSashCode,
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
          code: targetSashCode,
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
            code: mullionCode,
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
            code: mullionCode,
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

  // 4. Aksesuar ve Donanım Reçetesi (BOM)
  const accessories = calculateAccessoryList(item, settings);
  const totalAccessoryCostTL = accessories.reduce((sum, a) => sum + a.totalPriceTL, 0);

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

  const {
    profilePricePerMeter = 180,
    steelPricePerMeter = 65,
    glassPricePerSqM = 950,
    profitMarginPercent = 25,
  } = settings;

  // Maliyet Kırılımları (Cost Breakdown)
  const profileCostTL = Math.round(totalProfileMeters * (profilePricePerMeter * color.priceMultiplier));
  const steelCostTL = Math.round(totalSteelMeters * steelPricePerMeter);
  const glassCostTL = Math.round(totalGlassSqM * glassPricePerSqM);
  const accessoryCostTL = Math.round(totalAccessoryCostTL);
  
  // Fabrika İşçilik & Amortisman Gider Payı (%15)
  const laborCostTL = Math.round((profileCostTL + steelCostTL + glassCostTL + accessoryCostTL) * 0.15);

  const costPriceTL = profileCostTL + steelCostTL + glassCostTL + accessoryCostTL + laborCostTL;

  // Kar Marjlı Müşteri Satış Fiyatı
  const marginRate = (profitMarginPercent || 25) / 100;
  const estimatedPriceTL = Math.round(costPriceTL * (1 + marginRate));
  const profitTL = Math.max(0, estimatedPriceTL - costPriceTL);

  const breakdown: CostBreakdown = {
    profileCostTL,
    steelCostTL,
    glassCostTL,
    accessoryCostTL,
    laborCostTL,
  };

  return {
    cutPieces,
    glasses,
    accessories,
    totalProfileMeters,
    totalSteelMeters,
    totalGlassSqM,
    totalAccessoryCostTL,
    totalLaborCostTL: laborCostTL,
    costPriceTL,
    estimatedPriceTL,
    profitTL,
    breakdown,
  };
}

// Tam Aksesuar & Sarf Malzeme Hesaplama Motoru (BOM Engine)
export function calculateAccessoryList(
  item: WindowItem,
  settings: AppSettings = DEFAULT_SETTINGS
): AccessoryItem[] {
  const accessories: AccessoryItem[] = [];
  const { width, height, divisions, verticalMullionsCount, horizontalMullionsCount } = item;

  const singleTurnPrice = (settings as any).singleTurnFittingPrice || 280;
  const doubleTurnPrice = (settings as any).doubleTurnFittingPrice || 550;
  const doorLockPrice = (settings as any).doorLockFittingPrice || 850;
  const slidingFittingPrice = (settings as any).slidingFittingPrice || 420;
  const hingeUnitPrice = (settings as any).hingeUnitPrice || 35;
  const gasketPricePerMeter = (settings as any).gasketPricePerMeter || 12;

  let singleTurnCount = 0;
  let doubleTurnCount = 0;
  let doorCount = 0;
  let slidingCount = 0;
  let vasistasCount = 0;
  let totalHinges = 0;

  divisions.forEach((div) => {
    if (div.type === "tek-acilim") {
      singleTurnCount++;
      totalHinges += height < 1200 ? 2 : 3;
    } else if (div.type === "cift-acilim") {
      doubleTurnCount++;
      totalHinges += height < 1200 ? 2 : 3;
    } else if (div.type === "vasistas") {
      vasistasCount++;
      totalHinges += 2;
    } else if (div.type === "kapi-ic" || div.type === "kapi-dis") {
      doorCount++;
      totalHinges += height < 2000 ? 3 : 4;
    } else if (div.type.includes("surme")) {
      slidingCount++;
    }
  });

  if (singleTurnCount > 0) {
    accessories.push({
      id: "acc-tek-acilim",
      code: "13185",
      name: "Tek Açılım İspanyolet & Karşılık Seti",
      category: "DONANIM",
      unit: "TAKIM",
      quantity: singleTurnCount,
      unitPriceTL: singleTurnPrice,
      totalPriceTL: singleTurnCount * singleTurnPrice,
    });
  }

  if (doubleTurnCount > 0) {
    accessories.push({
      id: "acc-cift-acilim",
      code: "13186",
      name: "Egepen Çift Açılım İspanyolet, Makas & Eğim Seti",
      category: "DONANIM",
      unit: "TAKIM",
      quantity: doubleTurnCount,
      unitPriceTL: doubleTurnPrice,
      totalPriceTL: doubleTurnCount * doubleTurnPrice,
    });
  }

  if (vasistasCount > 0) {
    accessories.push({
      id: "acc-vasistas",
      code: "13187",
      name: "Vasistas Makas & Çarpma Kilit Seti",
      category: "DONANIM",
      unit: "TAKIM",
      quantity: vasistasCount,
      unitPriceTL: singleTurnPrice,
      totalPriceTL: vasistasCount * singleTurnPrice,
    });
  }

  if (doorCount > 0) {
    accessories.push({
      id: "acc-kapi-kilit",
      code: "13162",
      name: "Egepen Kilitli Kapı İspanyoleti, Alüminyum Kol & Barel Seti",
      category: "DONANIM",
      unit: "TAKIM",
      quantity: doorCount,
      unitPriceTL: doorLockPrice,
      totalPriceTL: doorCount * doorLockPrice,
    });
  }

  if (slidingCount > 0) {
    accessories.push({
      id: "acc-surme-tekerlek",
      code: "13163",
      name: "Sürme Seri Ayarlı Rulman & Tekerlek Takımı",
      category: "DONANIM",
      unit: "TAKIM",
      quantity: slidingCount,
      unitPriceTL: slidingFittingPrice,
      totalPriceTL: slidingCount * slidingFittingPrice,
    });
    accessories.push({
      id: "acc-surme-stoper",
      code: "13110",
      name: "Sürme Kanat Stoper & Kenet Takozu Seti",
      category: "DONANIM",
      unit: "ADET",
      quantity: slidingCount * 2,
      unitPriceTL: 45,
      totalPriceTL: slidingCount * 2 * 45,
    });
  }

  if (totalHinges > 0) {
    accessories.push({
      id: "acc-mentese",
      code: "12082",
      name: doorCount > 0 ? "Ağır Seri Kapı / Pencere Menteşesi (75mm-90mm)" : "Pencere Menteşesi (75mm)",
      category: "MENTESE",
      unit: "ADET",
      quantity: totalHinges,
      unitPriceTL: hingeUnitPrice,
      totalPriceTL: totalHinges * hingeUnitPrice,
    });
  }

  const kasaPerimeterMeters = Number((((width + height) * 2) / 1000).toFixed(2));
  const activeSashes = divisions.filter((d) => d.type !== "sabit").length;
  const gasketMeters = Number((kasaPerimeterMeters * 2 + activeSashes * 3.5).toFixed(2));

  accessories.push({
    id: "acc-epdm-gasket",
    code: "10578",
    name: item.systemType?.includes("SURME") ? "Sürme Kıl Fitili & Cam Contası" : "EPDM Kauçuk Kasa & Kanat Contası (Siyah/Gri)",
    category: "CONTA_FITIL",
    unit: "METRE",
    quantity: gasketMeters,
    unitPriceTL: gasketPricePerMeter,
    totalPriceTL: Math.round(gasketMeters * gasketPricePerMeter),
  });

  const mullionCount = verticalMullionsCount + horizontalMullionsCount;
  if (mullionCount > 0) {
    accessories.push({
      id: "acc-kayit-takozu",
      code: "13135",
      name: "Orta Kayıt Bağlantı Takozu & Vidası",
      category: "TAKAZ_BAGLANTI",
      unit: "ADET",
      quantity: mullionCount * 2,
      unitPriceTL: 18,
      totalPriceTL: mullionCount * 2 * 18,
    });
  }

  const totalGlassCount = divisions.length;
  accessories.push({
    id: "acc-cam-takozu",
    code: "13165",
    name: "Ağır Yük Cam Ayar Takozu Seti",
    category: "TAKAZ_BAGLANTI",
    unit: "ADET",
    quantity: totalGlassCount * 4,
    unitPriceTL: 6,
    totalPriceTL: totalGlassCount * 4 * 6,
  });

  accessories.push({
    id: "acc-su-kapak",
    code: "13514",
    name: "Dış Kasa Alt Su Tahliye Slot Kapağı",
    category: "SARF_MALZEME",
    unit: "ADET",
    quantity: (verticalMullionsCount + 1) * 2,
    unitPriceTL: 8,
    totalPriceTL: (verticalMullionsCount + 1) * 2 * 8,
  });

  return accessories;
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

// CNC Veri İhracatı (Kaban, Murat, Yılmaz, Biesse CNC Otomasyon Formatı)
export function exportToCNCData(
  items: WindowItem[],
  machineBrand: "KABAN" | "MURAT" | "YILMAZ" | "GENERIC_NC" = "KABAN"
): string {
  const lines: string[] = [];
  const timestamp = new Date().toISOString();

  lines.push(`; CNC PROFILE AUTOMATION FILE`);
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
    const qty = item.quantity || 1;
    calc.cutPieces.forEach((piece) => {
      allCutPieces.push({
        ...piece,
        quantity: piece.quantity * qty,
        label: `${piece.label} (${item.name})`,
      });
    });
  });

  const allGlasses: GlassCut[] = [];
  itemResults.forEach(({ item, calc }) => {
    const qty = item.quantity || 1;
    calc.glasses.forEach((glass) => {
      allGlasses.push({
        ...glass,
        quantity: glass.quantity * qty,
      });
    });
  });

  const allAccessoriesMap = new Map<string, AccessoryItem>();
  itemResults.forEach(({ item, calc }) => {
    const qty = item.quantity || 1;
    calc.accessories.forEach((acc) => {
      const existing = allAccessoriesMap.get(acc.name);
      if (existing) {
        existing.quantity += acc.quantity * qty;
        existing.totalPriceTL += acc.totalPriceTL * qty;
      } else {
        allAccessoriesMap.set(acc.name, {
          ...acc,
          quantity: acc.quantity * qty,
          totalPriceTL: acc.totalPriceTL * qty,
        });
      }
    });
  });
  const allAccessories = Array.from(allAccessoriesMap.values());

  const totalProfileMeters = Number(
    itemResults.reduce((acc, curr) => acc + curr.calc.totalProfileMeters * (curr.item.quantity || 1), 0).toFixed(2)
  );
  const totalSteelMeters = Number(
    itemResults.reduce((acc, curr) => acc + curr.calc.totalSteelMeters * (curr.item.quantity || 1), 0).toFixed(2)
  );
  const totalGlassSqM = Number(
    itemResults.reduce((acc, curr) => acc + curr.calc.totalGlassSqM * (curr.item.quantity || 1), 0).toFixed(2)
  );

  const totalAccessoryCostTL = itemResults.reduce(
    (acc, curr) => acc + curr.calc.totalAccessoryCostTL * (curr.item.quantity || 1),
    0
  );
  const totalLaborCostTL = itemResults.reduce(
    (acc, curr) => acc + curr.calc.totalLaborCostTL * (curr.item.quantity || 1),
    0
  );

  const profileCostTL = itemResults.reduce((acc, curr) => acc + curr.calc.breakdown.profileCostTL * (curr.item.quantity || 1), 0);
  const steelCostTL = itemResults.reduce((acc, curr) => acc + curr.calc.breakdown.steelCostTL * (curr.item.quantity || 1), 0);
  const glassCostTL = itemResults.reduce((acc, curr) => acc + curr.calc.breakdown.glassCostTL * (curr.item.quantity || 1), 0);

  const costPriceTL = Math.round(
    itemResults.reduce((acc, curr) => acc + curr.calc.costPriceTL * (curr.item.quantity || 1), 0)
  );
  const totalPriceTL = Math.round(
    itemResults.reduce((acc, curr) => acc + curr.calc.estimatedPriceTL * (curr.item.quantity || 1), 0)
  );
  const profitTL = Math.max(0, totalPriceTL - costPriceTL);

  const breakdown: CostBreakdown = {
    profileCostTL,
    steelCostTL,
    glassCostTL,
    accessoryCostTL: totalAccessoryCostTL,
    laborCostTL: totalLaborCostTL,
  };

  return {
    itemResults,
    allCutPieces,
    allGlasses,
    allAccessories,
    totalProfileMeters,
    totalSteelMeters,
    totalGlassSqM,
    totalAccessoryCostTL,
    totalLaborCostTL,
    costPriceTL,
    totalPriceTL,
    profitTL,
    breakdown,
  };
}



