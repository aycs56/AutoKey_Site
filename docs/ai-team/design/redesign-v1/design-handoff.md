# D1 設計與交接規格

日期 2026-10-22｜需求 R1／規劃 P1｜狀態 rendered，PM-coverage-pass，awaiting-user-confirmation｜Framework HTML/CSS/JavaScript。

## 構圖與素材

以「操作有具體結果」為視覺中心。石墨背景、薄荷操作色、大字與細線格點；原創立體幾何礦石／探勘裝置場景呈現長壓互動，不臨摹任何既有遊戲。字體使用 Segoe UI／Microsoft JhengHei／PingFang TC 等系統字，程式鍵值使用 Consolas。Guizang 僅採用網格、留白與敘事層次原則，不複製模板／程式。

| Screen／位置 ID | 功能／狀態 | anchor／正式目標 |
| --- | --- | --- |
| S1 header／hero | R1,R2,R7；導覽／語言、首屏 6 秒播放、停止、重播 | index.html#home → public/index.html#home |
| S2 features | R6,R9；連點／長壓、滑鼠、群組快捷鍵與錄製、31 語／保存 | #features → 同名正式章節 |
| S3 studio | R3–R5；3 情境、idle/once/loop/stopped/completed/hidden/language change | #scenarios；3 tabs/panels |
| S4 setup | R6；選視窗→錄製按鍵與時間→快捷鍵啟停 | #setup；有序步驟 |
| S5 compatibility | R6；前景／背景、游標位置及群組同時起算限制常駐可讀 | #compatibility |
| S6 faq／release／footer | R6；獨立開合、首發無 Cloud、發布資訊待公告 | #faq、#release |
| R0 review | R10；設計概念、可見流程圖、來源與版本 | review.html，僅設計審閱，不進產品 |

| Asset ID | 來源／canonical | 使用／規則／正式目的地 |
| --- | --- | --- |
| brand-mark | public/assets/autokey.svg | header/footer 不變形、不改色；現有品牌來源 |
| mining-scene | assets/mining-scene.svg，原創 SVG | hero 與長壓情境共用；viewBox 800×520，透明、不裁切，文字置於 HTML；光束 (334,275)→(510,242) 由等比例 overlay 呈現；正式目標 public/assets/mining-scene.svg |
| mouse-target | index.html 的滑鼠場景原創幾何 | 左鍵重複點按、固定游標、無移動路徑；正式情境 |
| reading-sheet | index.html 的文件場景 HTML | 真實標題「專案摘要／操作步驟／檢查項目／參考資料」，不是行銷口號 |
| tokens／motion | styles.css／app.js | 設計後沿用到 public，無新增框架／服務；未實作正式產品 |

## 尺寸、色彩與響應

- 參考 viewport 1440×1000，DPR1，CSS px；最大內容1280px（1440px時左右80px）、一般桌面最小左右48px／平板32px／手機20px（320px時16px）。寬版 hero 欄比1:1.13；≤960px縮小欄距與標題，≤700px垂直堆疊。PM依768px渲染確認維持雙欄，不另加平板版構圖。
- Header 桌面約83px；主標題桌面 clamp 48–70px、1440px時69.12px／手機38–54px，line-height 1.2或1.22；H2桌面34–50px／手機30–34px；正文14–17px/1.8–1.95，必要說明及限制至少14px。刻度、分類、圖內示意標籤9–13px，相關操作與限制在圖外正文完整說明；不靠圖內小字取得必要資訊。
- 背景 #0b1012，表面 #131c20／#1b292e；文字 #f1f5f2、次要 #a9b9bd；薄荷 #9aefcc、薄荷上深字 #11261e；功能必要邊界 #6c858b；提示暖色 #efc38b。裝飾線可較淡，不作控制唯一邊界。
- 操作目標至少44×44px，主要按鈕52px；內容可換行不截斷。頁籤在窄版三欄等寬、必要時兩行，頁面無橫向滾動。
- 三語版保留同一結構，較長英文允許增加區塊高度。縮放不以 transform 縮小文字。
- 對比目標：一般文字≥4.5、重要控制線≥3；動態背景文字置穩定深色背板。渲染 QA 記實測值，不以 token 名稱代替結果。

## 動態與狀態契約

| 位置 | 觸發／時間 | 結束／中止／替代 |
| --- | --- | --- |
| S1 入口構圖 | 首次載入，≤800ms，cubic-bezier(.2,.8,.2,1)，圖片12px進場；文字不淡到不可讀 | 單次完成，reduced motion 無位移 |
| S1 首屏場景 | 明確按播放，E 按1s／休1s×3（6s） | 可停止／重播；與主示範互斥；切語言／隱藏中止 |
| S2/S4/S5 章節 | 可見時單次18px平移，500ms；小型裝飾線/鍵帽≤800ms | 無無限循環；文字全程可讀；reduced motion 靜態 |
| S3 長壓 | E down→1000ms進度→up→1000ms等待 | 單次完成／循環可停；停止釋放，計時取消 |
| S3 滑鼠／閱讀 | 左鍵每500ms、PageDown每2000ms，按下回饋100ms | 單次一次／循環持續；游標固定、文件段落切換；reduced motion 只切狀態 |
| 控制項 | hover/focus 160–180ms，鍵帽down 90ms，FAQ指示120ms | 觸控不用hover依賴；焦點明確；reduced motion 無位移 |

## 元件選擇與來源

2026-10-22 已讀 Atlas catalog 與 deep playbook，以下 canonical 頁面皆嘗試開啟但工具無法存取；使用本機 component-pattern-library.html 的行為契約作 fallback，不聲稱遠端像素等同。共享庫經本機 4188 渲染並操作 Processing 及 Activity tab；favicon 404 為參考庫非產品資產缺件。

| 元件 | canonical URL（基底 https://huangchiyu.com/Vibe-UI-Atlas/components/）／local pattern | 本站責任及必要狀態 |
| --- | --- | --- |
| Link | link/；action-feedback | 章節導航，focus／hover；不作播放命令 |
| Button | button/；action-feedback | 一次、循環、停止、重播；ready/running/disabled-with-reason/completed |
| Select | select/；input-and-choice | 固定三語、立即作用與可選值；native keyboard、storage受限提示 |
| Tabs | tabs/；navigation-disclosure | 3個對等案例；active/inactive、左右/Home/End、選取後停止前一示範 |
| Disclosure | disclosure/；navigation-disclosure | FAQ 各自開合，原生 details；必要相容性在外部可見 |
| Progress | progress-bar/；feedback-and-recovery | 真實的本地長壓計時比例，不虛構下載進度 |
| Status | status-indicator/；identity-status | 文字＋色點，不只靠色彩；狀態用 polite，次數不連續播報 |

都是短靜態內容，無 operational list、搜尋、多選或多欄設定需求；不加無意義搜尋／modal。語言保留既有 resolver 與 i18n runtime，設計翻譯包獨立，不覆蓋正式版本。

## PM 與工程交接

已完成渲染及PM功能覆蓋，見 `pm-design-review.md`；獨立檢查與環境限制見 `qa-review.md`。兩個操作目標缺陷已修正並重測；三語×五寬度×三情境共45格無水平溢出且目標≥44px。真實hidden分頁及原生200%縮放未在無頭環境執行，已以邊界注入取消與640px等效viewport作支持，不能視為該兩項完整端到端證據。

| D1 canonical file | SHA256 |
| --- | --- |
| index.html | `918256594f5f1d6d07d7a0cbbc403c0c11df9049ccd884c9875f7715d77b6fe8` |
| styles.css | `d0e4fe59aa26a05725b04ea82556fca78aefff44d659df81bc6a5fa361b14f69` |
| app.js | `f7bbf9b8636f0de24eaff7c09e1dacee442d4ca19918b717ae2f1acf03a832a8` |
| locales.js | `c1929171ad9139be569d697f07b2279d1134347c712bfaf8cf42ba7d20e0a5b0` |
| assets/mining-scene.svg | `81e02032d2b44ed476fb62754c3786f0e36ec0dcd61b9fadd1a2c42c5977b792` |

本機審閱 `http://127.0.0.1:4187/`，完整網站設計 `/index.html`。重啟 `node tools/design-preview.mjs`；僅loopback，正式網站未替換。

確認前工程狀態 blocked-by-design-approval；不是產品故障。使用者批准該版本後，記錄訊息／日期／hash／資產版本，正式產品以相同viewport、locale、狀態比較；主要布局與控制尺寸容許±2 CSS px，字體抗鋸齒差異可接受，不可用模糊相似度掩蓋裁切或內容差異。
