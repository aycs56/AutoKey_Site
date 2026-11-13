# Steam 下載入口、全站文案與 SEO

版本 P3／2026-11-13（台灣）；profile：web；risk：low；depth：quick。

## 範圍與依據

使用者要求新增下載位置、Steam 按鈕與預覽，網址為 https://store.steampowered.com/app/5331510；後續追加重新檢視全站文案、去 AI 味及 SEO 優化。本站只有一個正式 HTML 頁面，涵蓋首頁、功能、三個示範、設定、相容性、FAQ、取得區及頁尾；三語一起檢查。沿用 D1 的石墨黑／薄荷綠、原生靜態架構及既有示範。

CEO 報告沿用 `ceo-strategy-risk-report.md` R1 的市場、策略、平台及權利界線，新增本次查核補充：Steam 官方 appdetails 與實際商店頁均顯示 AutoKey、Windows、2026-11-12 發售；頁面已有購買區。舊「發布資訊待公告」已不適用。證據：`output/steam-appdetails.json`、Playwright 商店頁 snapshot（2026-11-13）；公開來源 https://store.steampowered.com/api/appdetails?appids=5331510&l=tchinese 及使用者指定網址。

未新增定價／銷量／評分／遊戲相容承諾。下載動作在 Steam 端完成，本站提供商店入口。商店圖片取自本產品公開 Steam header 原檔，保留來源與 hash；不使用第三方遊戲畫面。採本地圖片及一般連結，無 iframe、自動請求 Steam、追蹤或新增 runtime 套件。

SEO 依 Google Search Central 的 [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) 與 [canonical 說明](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)，於 2026-11-13 查核。以清楚標題、可讀內容、真實連結、canonical、分享資訊、robots 及 sitemap 改善技術與內容基礎；不承諾排名。三語使用同一 URL 的現有切換機制，不杜撰 hreflang 語言頁。

## 角色與取捨

- PM：整合兩次要求、功能追溯與設計覆蓋。Top 5：project-work-governance、requirements-format、pm-expert、brainstorming、speak-human-tw；沿用既有計畫格式，縮小為本紀錄。
- UI/UX：Top 5：html-mockup-sketcher、ui-component-demo、speak-human-tw、taste-skill、impeccable；本階段使用前四項，實作後才做 impeccable 對照。
- Frontend：ponytail，沿用原生連結、語系與樣式。正式 UI 待 SD1 視覺確認。
- QA：playwright、verification-before-completion；先驗預覽，再於確認後驗正式成品。
- Writer／SEO：全站三語文案與搜尋／分享文字；保留數字、按鍵、限制及真實行為。
- 不另開 Backend、Video 或 Steam 發布流程：本次沒有 API、影片或商店發布工作。角色在同一代理內依序執行，未宣稱獨立代理審查。
- 有效全域模型設定為 gpt-6-astra、xhigh；未變更設定。

一年維護比較：本地商店圖片＋靜態連結只需隨品牌變更同步圖片；Steam iframe 會增加第三方請求、CSP 與窄螢幕處理；API 即時卡片增加失敗狀態與外部依賴。本次採第一項，不顯示易過期價格。SEO 保持單頁與既有語系，沒有足以支持新多頁架構的需求。

## 使用者故事與條件式需求

US-S1：準備取得 AutoKey 的訪客能從官網找到正確的 Steam 商店。
US-S2：評估產品的訪客能直接理解功能、操作與限制，不必解讀空泛口號。
US-S3：搜尋與分享官網的人能看到準確的名稱、用途、摘要及圖片。
US-S4：訪客能直接播放使用者指定的 AutoKey 介紹影片。

* **條件 FR-S1**：訪客瀏覽桌面或手機首頁。
  * **行為**：導覽提供「下載」入口，連到 `#release`；桌面頁首提供 Steam 商店連結，原試跑入口仍在首屏。
* **條件 FR-S2**：訪客到達下載區或展開下載 FAQ。
  * **行為**：呈現 Windows 平台、產品商店圖片及真實 Steam 按鈕；一般同頁導向使用者指定 URL，瀏覽器返回可回官網。文字說明購買後透過 Steam 安裝，不冒充直接安裝檔、不寫免費。
* **條件 FR-S3**：訪客閱讀任一區塊、標籤或示範狀態。
  * **行為**：檢查全部三語字串；改寫空泛標題、冗餘轉折及過時狀態，保留正確且清楚的文字。維持 31 種桌面語言、無順序連招、錄製單鍵、無 Cloud、游標不移動與相容性限制。
* **條件 FR-S4**：搜尋引擎或分享服務讀取正式來源。
  * **行為**：提供清楚 title／description、唯一 canonical、Open Graph／Twitter 資訊、本地分享圖片、robots 與僅含真實首頁的 sitemap；不加入假評分／價格結構化資料。預覽以 HTTP noindex 保護。
* **條件 FR-S5**：切語言、縮窄視窗、使用鍵盤或停用 JavaScript。
  * **行為**：下載連結可操作，關鍵資訊不依賴圖片／JS；三語不漏譯，不水平溢出；焦點可見，CTA 至少 44px；原有示範與 FAQ 可操作。
* **條件 FR-S6**：訪客選擇觀看介紹影片。
  * **行為**：使用原檔 `D:\AutoKey\steam\4f3ebd323fbe7b89.mp4` 的獨立副本（15.072 秒、1280×720、H.264／AAC、7,380,282 bytes），不修改來源、不重新剪輯。原生播放器提供播放／暫停／進度／音量／全螢幕，無 autoplay，preload=none；可用 MP4 連結備援。預覽與正式伺服器支援 byte range。影片的英文畫面文字保留，旁邊三語說明標示情境示意與相容性界線。

第三次追加需求已整合到 P3：使用者明確指定影片路徑與網站播放用途，允許讀取並複製到本專案。影片素材由使用者提供，沿用完整原檔；此情境有遊戲畫面，不把它描述成已通過相容性測試。影片檢查使用 video-use 的 probe／影格驗證流程，不需要新製作、外部轉錄或 Video Maker。範圍為本單頁的三項清楚調整，合併到同一 SD1 視覺確認，不新增重複需求問卷。

## 工作順序與門檻

1. PM／Writer：核實商店、盤點全部字串及 SEO 缺口，維護此 P2。
2. Designer：以 D1 正式來源為基線，完成 `design/steam-download-v1/` SD1，涵蓋整頁文案與新增下載區；附審閱頁、流程與 SEO 範例。
3. QA／PM：實際渲染、三語響應式、連結及鄰近示範驗證；檢視全部需求映射；驗證後本地 commit。
4. 使用者確認 SD1 後，Frontend 整合到 `public/`、根 `locales/`；Writer 同步 README／舊狀態；執行語系、建置、HTTP／SEO、完整相關旅程與設計對照後 commit。

SD1 的可見版本需依使用者指定團隊 Skill 確認；準備完整可檢視成品後才提出確認。無本次 GitHub 推送或正式託管替換要求。正式來源與部署驗收不能以預覽測試替代。
