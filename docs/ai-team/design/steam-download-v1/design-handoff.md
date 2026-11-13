# SD1.1：Steam、文案／SEO 與介紹影片

日期：2026-11-13（台灣）；需求 P4：`../../steam-seo-plan.md`；狀態：`implemented-and-verified-locally`。
基線為正式 `public/` 的 D1，保留原深色石墨／薄荷綠、三語、原創場景與原生互動。使用者提供首屏截圖並要求「這裡也要新增下載的按鈕，請直接開發」，本輪將首屏下載入口與 SD1 全部內容整合到正式 UI。

## PM 設計覆蓋審閱

審閱：Codex 的 PM／Designer／QA 角色依序檢視實際瀏覽器；未使用子代理。本次 PM 結果：**passed（含使用者追加的首屏下載入口；直接開發已授權）**。目前版本以包含此文件的本地提交識別，圖檔及 HTML hash 記在 QA 證據。

| 功能／故事／需求 | 預期結果 | HTML／證據 | 覆蓋結果 |
| --- | --- | --- | --- |
| US-S1／FR-S1 | 首頁找到下載與 Steam | `index.html` header、`[data-component=steam-hero]`、`[data-component=download-nav]`；desktop-home、三語 mobile-download | pass；桌面按鈕、手機導覽均可用 |
| US-S1／FR-S2 | 下載卡、FAQ 導向指定商店 | `#release`、`.faq-store-link`；實際點擊到 Steam 的 AutoKey 頁並返回 | pass；購買後安裝的文字清楚 |
| US-S2／FR-S3 | 全站三語具體、無過時發布文案 | S1–S6 原有 159 則全部審閱，18 則改寫＋12 則新增，3 語共 171 則／語 | pass；其他 141 則原文保留；數字、快捷鍵、限制不改 |
| US-S3／FR-S4 | 搜尋與分享資訊準確 | title、description、canonical、OG／Twitter、robots、sitemap；`review.html` 搜尋摘要示意 | pass；預覽 HTTP noindex，正式來源已整合，部署另循既有流程 |
| US-S1–S4／FR-S5 | 語系、窄版、鍵盤、無 JS 可用 | 3 語×5 尺寸；focus、no-JS、原有一次示範 | pass；320px CTA 可自然換行，無裁切 |
| US-S4／FR-S6 | 指定原檔在頁內播放 | S7 `#introduction`、`#intro-video`、MP4 備援連結；desktop/mobile-video、播放測試 | pass；播放／暫停／seek／結束／重播；無 autoplay |

流程：審閱頁 `#flow` 的可點選 S1 → S7 → S6；首頁導覽下載可直達 S6，首屏「前往 Steam 下載」直達指定商店。首屏另保留試跑與影片入口，主要 Steam 按鈕用薄荷綠、試跑用既有 secondary 邊框；自然換行，不固定高度。Steam 同分頁導航、瀏覽器返回；影片失敗可點 MP4，不偽造播放成功狀態。

## 元件與狀態

- 導覽／商店 CTA 採 **Link**，實際 `a href`，資料為使用者指定完整 URL。休止、hover、鍵盤 focus、窄版、無 JS 均保留目的地名稱；無表單、儲存、loading 或虛構完成提示。
- 商店呈現採 **Card**，圖片、名稱、平台與一個主要連結；圖片失敗時名稱和連結仍存在。只有單一產品，沒有搜尋、篩選或多選需求。
- 影片採原生 **video controls**，有 poster、preload=none、playsinline；paused／playing／seeking／ended／replay 由瀏覽器控制；常駐 MP4 連結提供備援。固定英文原片與旁邊三語說明分開。無影片重製或機器轉錄。
- Atlas catalog 精確條目：`link`（https://huangchiyu.com/Vibe-UI-Atlas/components/link/），2026-11-13 以真實瀏覽器開啟並讀取。Card／Video 後續來源檢查見 QA 附錄。
- 共享 HTML：`ui-component-demo/references/component-pattern-library.html#action-feedback`／`#data-and-media`。沿用本站品牌，只借用連結與媒體責任、必要狀態；不宣稱與參考視覺相同。
- 導覽圖示為 inline SVG external-link/down-arrow，24×24 viewBox、20px 顯示、1.8 stroke，aria-hidden；沒有以文字冒充新增 icon。焦點環由 anchor 自身繪製，卡內 18–20px padding 保留 5px outline-offset 空間。

## 尺寸與視覺契約

1440px：內容 1280px；沿用 Segoe UI／Microsoft JhengHei／PingFang TC。新增下載區 grid：1fr／最多420px，padding48px、gap56px；卡片外框1px、radius8px；圖片460:215、完整顯示；內距20px，CTA滿寬且至少52px高。960以下雙欄各1fr／gap30px，700以下單欄／padding28px。CTA與文字隨內容增高，不固定裁切。

影片維持16:9與原始1280×720比例，滿容器寬、無裁切，radius10px、1px控制邊框；手機隨容器縮放。字幕為影片原有英文字，不聲稱可切換影片語言。影片旁文字與備援連結在窄版堆疊。

顏色沿用 `--bg #0b1012`、`--surface #131c20`、`--text #f1f5f2`、`--muted #a9b9bd`、`--mint #9aefcc`、`--ink #11261e`；下載說明 #bbcfc1（實際 rgb187,207,193）。正常文字門檻4.5:1，焦點3:1；量測結果見 QA。

正式為同一原生HTML/CSS環境，本輪已使用相同來源／資產及尺寸；配對截圖採相同viewport、DPR1、語言／狀態；幾何不接受新增差異，僅允許平台字型反鋸齒差異。

## 素材與正式目標

| ID | 設計來源／授權 | 正式目的地與使用 | 驗證 |
| --- | --- | --- | --- |
| brand-mark、mining-scene | 既有 public/assets 品牌／原創場景；預覽 alias 直接使用 | 原路徑不動，header／互動示範 | 未複製其他桌面資產 |
| steam-header | `assets/autokey-steam-header.jpg`，本產品 Steam 官方公開 header，來源 https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/5331510/3a6464cc16fe8c0c241d45ec0cb681fc4aed6e8b/header.jpg?t=1794531898 | integrated `public/assets/autokey-steam-header.jpg`，下載卡及社群分享 | 460×215；SHA256 A4E267AD572A0472E0688E832242BAE8B2ED1188CDA3D43EF186E0AF6C006F98 |
| intro-video | 使用者指定 `D:\AutoKey\steam\4f3ebd323fbe7b89.mp4`，獨立完整副本 `media/autokey-introduction.mp4` | integrated `public/media/autokey-introduction.mp4`，S7播放器與MP4連結 | 兩份 SHA256 同為037A2A978EF2D065C50E8B7559D711089D8ABFBE64BA5E79B017266B83024349；15.072秒、7,380,282 bytes |
| intro-poster | `assets/autokey-video-poster.jpg`，原影片8秒處的單張影格；FFmpeg擷取，未改影片 | integrated `public/assets/autokey-video-poster.jpg`，影片未播放時顯示 | 1280×720；同原片內容 |

`styles.css` 是可整合正式來源；`locales/*.json`／`locales.js` 為171則三語設計字串，已轉到根locales並用既有build-locales產生正式bundle。`review.html`／`review.css` 僅審閱用途，不發布。

## 交接限制

- 公開官網當次 HEAD 200，但尚未套用SD1；搜尋與分享正式URL資產已在正式來源，尚待部署。來源已檢查不等於搜尋收錄或排名提升。
- 單URL的三語切換維持既有行為；沒有各語獨立可索引路徑，故不宣稱完成多語SEO架構。
- 自動化使用靜音驗證解碼／播放與音量狀態；沒有聽覺審片，也沒有改寫原片英文字幕或取得真實手機硬體測試。瀏覽器原生全螢幕按鈕存在；實際全螢幕驗證見 QA。
- 使用者已明確要求直接開發；正式實作後的設計對照／旅程驗收見 `../../steam-seo-validation.md`。本文件不能作為已發布證明。
