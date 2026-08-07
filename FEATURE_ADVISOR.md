# Feature-Advisor Raporu — PVC Pencere SaaS

Tarih: 2026-08-07

## Kapsam
13 kaynak dosya. Saf motor (`pencereEngine.ts`), ayarlar/yapılandırma, canvas + 5 modal, tek dashboard sayfası. Backend yok, veritabanı yok, test yok, veri katmanı yok.

## Önerilen özellikler (öncelik sırasıyla)

| # | Özellik | Efor | Durum |
|---|---------|------|-------|
| P1 | Sipariş + müşteri kalıcılığı (localStorage) | S (~1 saat) | 🔲 |
| P2 | CNC dışa aktarma UI'ı (exportToCNCData çıktısını arayüze bağla) | S–M | 🔲 |
| P3 | Sipariş/teklif geçmişi (çoklu sipariş) | M | 🔲 |
| P4 | CutList tekrar eden kesimleri grupla | M | 🔲 |
| P5 | Motor test paketi (vitest) | L | 🔲 |
| P6 | `as any` tip dönüşüm denetimi | S–M | 🔲 |

## Detaylar

### P1 — Sipariş durumunu kalıcı yap
`items`, `customers`, `activeCustomer` yalnızca React state'inde — sayfa yenilenince siparişin tamamı kayboluyor. Ayarlar `app_factory_settings` ile kalıcı; sipariş de kalıcı olmalı.
- `handleSaveSettings` desenini izleyerek `items` + `customers` için `localStorage` okuma/yazma.
- Sayfa yüklemede mevcut `useEffect` içinde oku, değişimde yaz.

### P2 — CNC ihracatını arayüze bağla
`exportToCNCData(items, machineBrand)` motor içinde mevcut ama hiçbir UI'a bağlı değil. CutList modal → makine markası seçici (KABAN/MURAT/YILMAZ/GENERIC_NC) → panoya kopyala / dosya indir.

### P3 — Sipariş geçmişi
`Order`/`OrderCalculationResult` tipleri mevcut ama kayıtlı sipariş listesi ya da eski sipariş yükleme yok. P1'in devamı: hafif sipariş geçmişi.

### P4 — CutList gruplama
`optimizeCutList` her kesime barkod atıyor (özdeş boylar dahil). Özdeş kesimleri tek satırda tek barkod altında toplamak imalat-standardı bir iyileştirme.

### P5 — Motor testleri
`calculateWindowDimensions`, kayıt konum çözümleme, 1D ambalajlama aritmetik-ağırlıklı ve test edilmemiş. Regresyonlar sessiz kalıyor.

### P6 — `as any` tip güvenliği
`DivisionType`/`SystemType`/tool mode birleşimlerini atlayan `as any` dönüşümleri enum kaymalarını yakalamaz.

## Riskler

- **Motor test yokluğu** — hesaplama regresyonları sessiz. En büyük mühendislik riski.
- **`Date.now()` id çakışması** — hızlı poz eklemede çakışabilir; sayaç/uuid kullan.
- **Kalıcılık eksiği** — tarayıcı kapanınca sipariş gider (P1 ile ilişkili).
- **`as any` tip dönüşümleri** — ideal enum kayımları yakalanmaz.
- **Canvas ölçeklendirme** — 400mm altı genişlikte `scale` matematiği dengesiz olabilir (belirtilen min sınırında kabul).

## Efor tahmini
- P1: <1 gün · P2: <1 gün · P3: 1-3 gün · P4: 1-3 gün · P5: >3 gün · P6: 1-3 gün

## Sonraki adım
Önce **P1** (en küçük düzeltmeyle en büyük kullanıcı kaybını — sipariş kaybını — çözer). Sonra **P2** (yazılmış motor kodunu paralar).