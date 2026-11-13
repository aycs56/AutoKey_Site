# SD1.1 正式來源驗收

2026-11-13（台灣）。需求：`steam-seo-plan.md` P4；canonical 設計：`design/steam-download-v1/`。使用者在 SD1 預覽後提供首屏截圖，要求「這裡也要新增下載的按鈕，請直接開發」，因此完成首屏追加及整份來源整合，不再重問確認。基線 `ab359b7`，沿用現有 `main`；本次為本地開發交付，未推送或替換公開託管快照。

## 交付與需求覆蓋

| 需求 | 成品與結果 |
| --- | --- |
| FR-S1 首頁下載 | 首屏「前往 Steam 下載」為主要 CTA，另保留試跑與影片入口；桌面頁首、手機導覽均可使用。首屏及下載卡實際點擊開啟 Steam 的 AutoKey 頁面，再以瀏覽器返回。 |
| FR-S2 下載區／FAQ | 本地 Steam 商店圖片、Windows 平台及商店入口；購買後透過 Steam 安裝的文字保留。全站 4 個外部連結均為指定的 app/5331510。 |
| FR-S3 文案 | 原有159則全部審閱，18則改寫、12則新增，繁中／英文／簡中各171則。沒有省略桌面功能、31語言、相容性與現有限制。 |
| FR-S4 SEO | title／description、canonical、Open Graph、Twitter、robots.txt、sitemap.xml 與本地分享圖已進正式來源。建置版無 noindex；審閱伺服器保持 noindex。 |
| FR-S5 響應式／可用性 | 三語 × 320／375／768／1024／1440 共15組排版通過；新增下載 CTA 目標至少44px、無水平溢出或裁切。鍵盤焦點可見；無 JS 仍有真實下載連結與原生影片。 |
| FR-S6 影片 | 指定原檔完整副本，15.072秒、1280×720、H.264／AAC、7,380,282 bytes。桌面及手機播放／暫停、進度跳轉、結束／重播、音量狀態、原生全螢幕均通過；無 autoplay，preload=none；MP4 備援及 HTTP 206 正常。 |
| 既有鄰近流程 | 首屏示意可開始／停止；長壓、滑鼠連點、翻頁均可單次完成、循環至第二次並停止；下載 FAQ 可展開；沒有頁面例外。 |

## 實測證據

環境：Windows、Node 24、Playwright Chromium headless，DPR1。來源預覽 `127.0.0.1:4188`；建置快照驗收使用 `127.0.0.1:4191` 與正式 hosting/server.mjs 的 CSP。驗收工具與截圖保存在 Git 忽略的 `output/`。

- `npm.cmd run check`、29項 localization、13項 media、4項 boundaries 通過。
- `npm.cmd run test:hosting`：4項HTTP及全新快照逐檔比對通過；縮限動態CSS後再次建置及比對通過。最終快照為 `output/hosting-builds/release-iKFx5S/site`，最新指標為 `output/hosting-build.json`。
- `output/sd11-browser-results.json`：41項正式快照瀏覽器檢查通過；`sd11-extra-results.json`：18項原有示範、鍵盤、手機、全螢幕、Range等檢查通過。
- `output/sd11-reduced-motion-results.json`：最終來源4項檢查通過，網站動畫停止、原生影片可播放／暫停，未按播放前不下載影片。
- `output/sd11-integrity.json`：設計／正式 HTML、CSS、兩張圖片、MP4、robots、sitemap 共7檔完全相同。正式MP4亦與使用者原檔SHA256相同：`037A2A978EF2D065C50E8B7559D711089D8ABFBE64BA5E79B017266B83024349`。

## UI／UX 與 impeccable 複核

以相同語言、viewport、DPR及停止示範狀態，對照設計4189與正式來源4188。桌面1440×960繁中、手機375×812英文的首屏及下載區PNG逐位元相同；全頁尺寸分別為1440×6962與375×8443。影片區只出現瀏覽器原生控制項／動畫的時間差，位置、比例、poster、文字及其餘頁面沒有差異，不將原生控制項動畫當成網站版型差異。證據：`sd11-pair-{design|product}-*`、`sd11-pixel-details.json`。已實際開圖檢查首屏、英文窄版、影片與商店卡。

首屏下載為薄荷綠主按鈕、試跑為既有邊框次按鈕，影片為文字連結；延續D1字體、間距及品牌。兩個首屏按鈕採相同SVG尺寸，桌面52px高、窄版50px高；文案較長時自然換行。沿用已量測對比：CTA文字11.81:1、次要文字至少8.16:1、焦點12.83:1。

修正 UI-SD11-01：檢查 reduced-motion 時，發現既有全域 animation:none 也會影響原生媒體呈現。以瀏覽器CSSOM移除該規則、切換動態偏好定位，再把禁用動畫／轉場縮到網站自身元件，設計與正式CSS同步。原生控制項保留瀏覽器處理；已確認網站動畫仍停止、未播放影片不載入，且播放／暫停正常。一次產品修正，無功能回歸；沒有未完成的必要矯正項。

## 測試調整與限制

- 首次額外檢查使用 CSS zoom=2，造成1024px媒體查詢與實際可用寬度不一致，不能作為瀏覽器200%縮放的結論。保留診斷輸出，改驗512 CSS px；本次沒有宣稱實測瀏覽器原生縮放。
- 配對工具最初 `.brand` 命中頁首與頁尾，改為頁首明確選擇器；等待全部圖片decode則會等待尚未進入視窗的lazy圖片，改為只等已載入圖片。這兩項為測試工具修正，沒有變更產品流程。
- 音訊採靜音自動化，只驗解碼及音量狀態；未做聽覺審片或實體手機驗收。影片內英文文字沿用原片；相鄰說明有三語。
- 三語仍共用同一URL，未建立各語獨立索引頁。來源SEO改善不等於搜尋引擎已收錄；公開站尚未部署此次改動。
- 沿用既有獨立 hosting 快照流程，沒有重試或宣稱修好歷史 `dist/assets` EBUSY。

交付保留4188來源預覽及驗收證據，測試用4191、設計4189與本輪headless瀏覽器在結案時關閉；程序與本地提交記錄在 `output/preview-process.json`。本輪無新增worktree或暫存分支。
