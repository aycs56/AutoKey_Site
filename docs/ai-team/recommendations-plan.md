# 推薦工具：Header 與頁底輪播

2026-11-13，P1／RT1；`D:\AutoKey_Site`，既有main，基線 `ae4d77a`，起始工作目錄乾淨。分類 web／low／Header導覽、頁底推薦、三語／quick。沿用前文「請直接開發」的授權及已確認石墨黑／薄荷綠版型，不重開視覺方向或確認問卷；先同步並渲染相關HTML，再整合。公開託管與GitHub未在本次要求內。

## 角色與維護決策

PM、Designer、Frontend、QA／Writer在同一代理依序執行，沒有宣稱獨立子代理。模型配置為gpt-6-astra／xhigh，未修改。

- PM Top5：project-work-governance、requirements-format、pm-expert、brainstorming、speak-human-tw；使用治理與條件式需求，沿用已有規劃結構與直接開發決策。
- Designer Top5：html-mockup-sketcher、ui-component-demo、speak-human-tw、taste-skill、impeccable；用於範圍HTML、元件決策、文字、渲染與成品對照。
- Frontend：ponytail；動態參考gsap-core的中斷／reduced-motion契約，原生scroll-snap已足夠，不新增GSAP依賴。
- QA：playwright、verification-before-completion；真實選單、輪播、語系、鍵盤、無JS、手機與建置驗收。
- 不需Backend／新影片／部署角色：無API、帳號、資料寫入或影片變更。

CEO／PM沿用 `ceo-strategy-risk-report.md` R1＋2026-11-13補充：Windows工具受眾、靜態維護與真實產品描述策略仍適用。本次推薦來源由使用者明確指定，沒有付費／人氣／官方遊戲背書宣稱；只採網站自身圖示與短描述。實際查核四站HTTP200，名稱與icon來自各站HTML（`output/recommendation-sites/discovery.json`）。R6首頁會導向/en/，保留使用者提供的根網址。選原生details＋水平scroll-snap與少量JS，較新增輪播套件或遠端即時抓取少一組依賴／服務維護；4站內容靜態維護，圖示在本站保存，訪客載入不連第三方。

## 使用者故事與條件式需求

US-T1：訪客能從Header辨識四個推薦工具並開啟網站。US-T2：讀到頁底的訪客能輪流查看推薦工具與用途。

- FR-T1：點擊／鍵盤啟用「推薦工具」時，展開四個網站名稱＋實際icon；不顯示網址文字。選取使用原生連結，同分頁開啟使用者指定網址。Escape關閉並回到觸發器，點外側／移出焦點關閉。
- FR-T2：到頁底（Steam下載區後、footer前）時，呈現四站輪播卡，每張有icon、名稱、簡短用途及連結。桌面兩張、窄版一張；上一個／下一個可循環、手機可橫向滑動，位置指示可辨識。
- FR-T3：輪播在可見且無互動時每3秒前進一張（2026-11-13依使用者追加指示由6秒調整）；2026-11-13依使用者要求移除播放／暫停按鈕。hover、鍵盤焦點、頁籤隱藏時暫停；手動切換／觸碰後停止自動輪播，重新載入時依動態偏好初始化。prefers-reduced-motion預設停止且切換無平滑動畫。

- FR-T4：切三語與縮至320px時文字可讀、不溢出，所有控制至少44px、焦點完整。選單以網站原名稱識別，說明／控制文案三語。無JS時details仍可展開，底部4張卡可原生滑動且全部連結可用，不顯示無效控制。
- FR-T5：首頁只新增語意區塊與真實可索引連結；canonical、下載入口、影片與示範保留。圖片本地化、沒有追蹤或跨站API。

2026-11-13追加正式發布已完成：設計／正式腳本同步3000ms，公開網站實測3006ms；hover、手動停止及reduced-motion仍通過。下方初次RT1驗收保留6秒歷史，最新證據見[正式發布紀錄](release-20261113.md)。

## 設計與素材契約

canonical：`design/recommendations-v1/` RT1。實際元件來源（2026-11-13）：[Navigation Menu](https://huangchiyu.com/Vibe-UI-Atlas/components/navigation-menu/) →共享library的 `#navigation-disclosure`，用原生details／summary及一般anchor，而非桌面應用程式command menu；[Carousel](https://huangchiyu.com/Vibe-UI-Atlas/components/carousel/) → `#data-and-media`，本次使用者明確要求輪播，Header另提供完整四站清單。

官網名稱／icon映射（產品目的地 `public/assets/recommendations/`；設計同相對路徑）：

| 名稱 | 使用者指定網站 | 官方icon來源 | 本地檔案 |
| --- | --- | --- | --- |
| DesktopPetStudio | https://www.desktoppetstudio.com/ | /assets/images/app-icon.png | desktop-pet.png |
| R6 REROLL | https://r6.desktoppetstudio.com/ | /favicon.svg | r6.svg |
| REROLL Overwatch 2 | https://ow2.desktoppetstudio.com/ | /favicon.svg | ow2.svg |
| Game Translation | https://gametranslation.desktoppetstudio.com/ | /assets/app-icon.png | game-translation.png |

Header icon28px、選項最小56px，浮層約300px寬且高度受視窗限制，可捲動；手機沿用雙列Header，選單不得超出視窗。頁底icon52px、兩欄卡片、間距20px，700px以下單卡；沿用字體與顏色，outline保留外距。圖示使用contain、不改色。原生水平scroll切換、瀏覽器平滑時間與緩動，不加無關進場特效。

流程：S1 Header → 展開推薦工具 → 四站之一 → 瀏覽器返回；S8 頁底推薦 → 自動／手動換卡 → 開啟網站 → 返回。狀態：closed/open、idle/rotating/paused、hover/focus、窄版、reduced-motion、無JS。圖片無法顯示時文字仍完整。初次RT1為新增元件範圍，不重置既有S1美術修訂記錄；後續美術修改共用最多3次。

## 工作順序與驗收

1. 查核來源與下載圖示，製作RT1實際HTML／狀態／可見流程，speak-human-tw檢查新增三語；PM按FR-T1–5審閱覆蓋後保存設計階段本地commit。
2. 將同一HTML、CSS、JS、圖示與catalog整合public／locales，沿用既有runtime、建置與預覽4188；完成實際操作與impeccable比對。
3. check、localization、託管快照與瀏覽器相關旅程通過，更新本紀錄與README、工作規範，提交main。保留4188，清理本輪測試程序；不新建worktree。

驗收與修訂紀錄如下，正式整合已完成。

### RT1 設計覆蓋與交接

PM按FR-T1–5完成覆蓋審閱：S1展開清單列出4個正確網址／官方圖示；S8有4張卡、播放／暫停、前後循環、位置提示；手機、鍵盤、reduced-motion與無JS狀態在HTML／腳本中均有對應。speak-human-tw已檢查新增14組字串與所有控制名稱；產品名稱保留原名。Header英文採短標籤「Tools」，完整清單輔助名稱仍為「Recommended tools」。設計文件與前文直接開發授權共同作為落地依據。

已實際檢視1440繁中與320英文的選單、輪播截圖；三語×5尺寸的30項排版檢查、11項互動／參考模式檢查通過。證據：`output/rt1-design-results.json`、`rt1-design-interactions.json`、`output/playwright/rt1-design-*`。Atlas兩個canonical頁均經Chromium開啟；共享library的tab切換、disclosure展開及媒體卡片已實看。未改品牌或增加美術修訂，RT1新增元件首次製作0次。

工程使用同一 `index.html`、`recommendations.css`、`recommendations.js`、三語catalog與四個圖示；`styles.css`為既有SD1.1基線。圖示來源／檔案大小／SHA256保存在設計 `assets/sources.json`。預覽命令 `node tools/design-preview.mjs --recommendations`，loopback4192、HTTP noindex；review頁僅交接使用，不加入public。

### 正式整合與驗收：通過

設計階段本地提交 `f249c57`；正式來源已整合public與根locales，三語各185則。沒有新增runtime套件，既有app.js／語系runtime／影片與Steam來源保持原狀。

| 需求／使用者旅程 | 正式來源驗收證據與結果 |
| --- | --- |
| FR-T1：Header辨識與開站 | 四站名稱＋icon，無網址文字；實際逐一點擊四站並返回，標題正確。R6與Game Translation依語言導向各站語系首頁，根網址保留使用者指定值。Enter／Tab／Escape、焦點還原、點外側與focus移出皆通過。 |
| FR-T2：底部卡片輪播 | 前後切換、末張／首張循環、方向鍵、位置指示、卡片開啟真實網站通過；Chromium手機觸控事件實際滑動可換卡。 |
| FR-T3：播放與暫停 | 真實等待6秒週期，確認自動前進、hover停住、鍵盤focus停住、明確暫停及重新播放；手動切換／觸控後停止，reduced-motion預設手動，通過。 |
| FR-T4：三語／響應／無JS | 三語×320／375／768／1024／1440的30項排版檢查通過，互動目標至少44px，無溢出。375×300短視窗下拉清單在視窗內捲動；185則catalog完整。無JS仍能展開選單、使用4張卡片連結，控制列隱藏。 |
| FR-T5：鄰近內容與SEO | 首屏Steam網址、canonical、原有單次示範通過；新增圖示及全部首頁資產只向本站請求。四圖同源副本可解碼，沒有遠端iframe／追蹤／網域文字。 |

命令：`npm.cmd run check`、`npm.cmd run test:localization`（29項）、`npm.cmd run test:hosting`（4項HTTP＋全新快照逐檔比對）均通過。最終快照 `output/hosting-builds/release-ShnxZL/site`，指標 `output/hosting-build.json`；7個設計／正式檔案SHA256相同，見 `output/rt1-integrity.json`。輪播使用有名稱的group語意，最終HTML同步後快照再比對通過。本次沒有改動媒體服務或建置邊界，沿用既有測試，不重跑無關監控／部署流程。

瀏覽器證據共64項：`output/rt1-product-results.json`（29）、`rt1-product-layout-results.json`（30）、`rt1-touch-pair-results.json`（5）。Windows／Chromium headless、DPR1；手機為瀏覽器觸控模擬，未宣稱實體手機驗收。參考頁與測試資料存於output，不納入公開成品。

impeccable與Taste成品複核：1440×960繁中與320×812英文，Header展開／頁底輪播共4組design-product PNG逐位元相同，見 `output/rt1-pixel-results.json` 與 `output/playwright/rt1-pair-*`。已實際開圖確認主次、文字換行、52px圖示、卡片與外框；沿用既有表面與字色，正文對比至少8.53:1、薄荷綠焦點12.83:1。所需操作完整，沒有待修矯正項；新增RT1元件維持初次製作0次美術修訂。

測試工具調整：共享library有兩個summary，改用第一個明確操作；窄版開啟浮層時會遮住hero文字，外側點擊驗收改點可見的Header品牌，而非被遮擋標題。沒有因此改動產品。官方原始SVG與PNG保留來源和hash；圖示失敗時連結名稱仍在。

結案：正式來源在現有main本地提交，保留4188預覽及驗收證據；本輪4190參考、4192設計與headless瀏覽器在結案時關閉。未建立worktree／暫存分支，沒有push或公開部署。程序及最終commit寫入 `output/preview-process.json`。


2026-11-13後續局部修訂 RT1.1：移除播放／暫停切換控制，canonical HTML／CSS／JS同步；原驗收段落保留為歷史。現行需求、發布與驗收見 [按鈕移除紀錄](remove-carousel-control-20261113.md)。
