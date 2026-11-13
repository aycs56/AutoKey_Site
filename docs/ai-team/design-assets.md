# AutoKey 官網設計資產對照

2026-11-13 SD1：新增本產品Steam header、使用者指定MP4原檔副本與原片poster。唯一新增素材對照及SHA256見[SD1素材交接](design/steam-download-v1/design-handoff.md#素材與正式目標)。現存於該設計目錄，正式目標為 `public/assets/`、`public/media/`；狀態 planned／待SD1確認，不宣稱已進正式UI。既有品牌及原創mining-scene直接沿用public的canonical來源。

2026-10-22 更新。正式原始碼已依使用者確認的 `design/redesign-v1/` D1整合；公開託管快照尚未替換。`ui-ux-spec.md`「按鍵節奏台」保留作舊版溯源。品牌延續桌面版本，不另創logo。

## D1 改版資產交接

| 資產／canonical source | 正式目標 | 用途與目前狀態 |
| --- | --- | --- |
| `public/assets/autokey.svg/.ico` | 原路徑 | D1 預覽直接沿用已核對品牌與 favicon；不改色、不變形 |
| `design/redesign-v1/assets/mining-scene.svg` | `public/assets/mining-scene.svg` | 原創探勘浮島，首屏及長壓案例共用；800×520、透明、不裁切，光束起訖334,275→510,242；SHA256 `81e02032d2b44ed476fb62754c3786f0e36ec0dcd61b9fadd1a2c42c5977b792`。沒有商用遊戲素材或外部資源。已整合正式來源，hash一致 |
| `design/redesign-v1/index.html/styles.css/app.js` | `public/index.html/styles.css/app.js` | 同一套版面、滑鼠／閱讀場景及動態契約；已原樣整合，三檔逐位元一致 |
| `design/redesign-v1/locales/*.json` | 根 `locales/*.json` | 每語159則，繁中、英文、簡中；內容一致，正式bundle以既有工具產生 |
| `public/i18n-core.js/i18n.js` | 原路徑 | 預覽直接使用現行語言判斷、翻譯及儲存；不複製改寫 |
| `design/redesign-v1/review.html/review.css` | 不進正式產品 | 完整設計審閱入口、畫面與操作流程圖 |

尺寸、裁切、元件來源、動態與狀態在 `design/redesign-v1/design-handoff.md`；渲染證據和視覺修訂次數見 `visual-review.md`。D1 圖像為原生 SVG 幾何場景，沒有點陣素材需求，故未使用 imagegen；互動動畫已能說明按鍵與結果，未另製不可操作的影片。

## 既有正式版本資產（保留溯源）

| 資產／canonical source | 本站目標 | 生產用途／狀態 | 規則與驗證 |
| --- | --- | --- | --- |
| `D:/AutoKey/assets/autokey.svg` | `public/assets/autokey.svg` | Header／footer 品牌；已複製並核對 SHA256 一致 | 讀原檔確認石墨鍵帽、Shift 與回轉箭頭。固定 viewBox 比例，不改色或形變；與 AutoKey 文字相鄰時 alt 空，獨立時 alt="AutoKey"。 |
| `D:/AutoKey/assets/autokey.png` | `public/assets/autokey.png` | 分享／fallback 圖示（若首版需要）；已複製並核對 SHA256 一致 | 不假造網站 screenshot；設定 width/height 保留位置。来源 hash 與副本一致。 |
| `D:/AutoKey/assets/autokey.ico` | `public/assets/autokey.ico` | 瀏覽器 favicon；已複製並核對 SHA256 一致 | `<link rel="icon">` 指向本地資產，無桌面相對路徑依賴。 |
| `ui-ux-spec.md` hero 定義 | 正式 CSS／HTML hero 組件 | 原生 F12 鍵帽與節奏線、功能縮图；工程依規格實作 | 鍵帽不是可按控制；附快捷鍵可自訂。缩图明標「功能示意」；字詞源於現有能力；mobile 不縮字至不可讀。 |
| `ui-ux-spec.md` 三情境契約 | 正式情境面板／DOM／CSS | 文件、遊戲互動儀表、格鬥拆解示意 | 使用抽象自製圖形與 semantic HTML；不使用第三方遊戲商標、截图或偽相容性背書。格鬥不得假裝序列功能已存在。 |
| `ui-ux-spec.md` tokens | 正式 CSS variables | 色彩、字型、間距、focus、motion | 一套 tokens；不另生「官網特別版」logo／主題。僅 hero 鍵帽使用實體陰影，其餘安靜排版。 |
| 共享 component library | 不複製進本站 | 僅作 Button／Link／Tabs／Disclosure／Status 行為來源 | 日期與 canonical inaccessible 限制見 spec。工程與 QA 檢查實際網站責任／狀態，不聲稱來源像素一致。 |

不存在需要 AI 生成的照片／點陣主視覺。可縮放鍵帽與品牌 SVG 可直接以正式程式表達，避免不必要的 imagegen 風格分裂。所有正式圖示採現有品牌或少量一致線條 SVG（decorative 使用 aria-hidden），不採 emoji。

驗收證據由 QA 存到 `output/playwright/`，列出 viewport／互動狀態／檢查日期；不作公開產品資產。品牌更新時需明確從桌面 canonical 檔複製到本站，檢查 hash／顯示後分別提交正確 repository，不使用 junction 或跨專案動態引用。
