# AutoKey 官網設計資產對照

2026-09-25。正式設計為 `ui-ux-spec.md`「按鍵節奏台」。品牌延續桌面版本，不另創 logo。

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
