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
- FR-T3：輪播在可見且無互動時每6秒前進一張；提供暫停／播放。hover、鍵盤焦點、頁籤隱藏時暫停；手動切換／觸碰後停止自動輪播，直到使用者選擇播放。prefers-reduced-motion預設停止且切換無平滑動畫。
- FR-T4：切三語與縮至320px時文字可讀、不溢出，所有控制至少44px、焦點完整。選單以網站原名稱識別，說明／控制文案三語。無JS時details仍可展開，底部4張卡可原生滑動且全部連結可用，不顯示無效控制。
- FR-T5：首頁只新增語意區塊與真實可索引連結；canonical、下載入口、影片與示範保留。圖片本地化、沒有追蹤或跨站API。

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

驗收與修訂紀錄待執行後附於本文件。

### RT1 設計覆蓋與交接

PM按FR-T1–5完成覆蓋審閱：S1展開清單列出4個正確網址／官方圖示；S8有4張卡、播放／暫停、前後循環、位置提示；手機、鍵盤、reduced-motion與無JS狀態在HTML／腳本中均有對應。speak-human-tw已檢查新增14組字串與所有控制名稱；產品名稱保留原名。Header英文採短標籤「Tools」，完整清單輔助名稱仍為「Recommended tools」。設計文件與前文直接開發授權共同作為落地依據。

已實際檢視1440繁中與320英文的選單、輪播截圖；三語×5尺寸的30項排版檢查、11項互動／參考模式檢查通過。證據：`output/rt1-design-results.json`、`rt1-design-interactions.json`、`output/playwright/rt1-design-*`。Atlas兩個canonical頁均經Chromium開啟；共享library的tab切換、disclosure展開及媒體卡片已實看。未改品牌或增加美術修訂，RT1新增元件首次製作0次。

工程使用同一 `index.html`、`recommendations.css`、`recommendations.js`、三語catalog與四個圖示；`styles.css`為既有SD1.1基線。圖示來源／檔案大小／SHA256保存在設計 `assets/sources.json`。預覽命令 `node tools/design-preview.mjs --recommendations`，loopback4192、HTTP noindex；review頁僅交接使用，不加入public。
