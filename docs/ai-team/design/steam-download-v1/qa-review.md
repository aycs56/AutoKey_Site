# SD1 預覽驗證

2026-11-13（台灣），Windows／Node24／Playwright Chromium headless、DPR1。此為設計預覽驗證，正式UI落地及公開部署尚未完成。原始輸出／截圖放在Git忽略的 `output/`。

## 版本與完整性

- `index.html` SHA256：BAC0B38399148A3EB8560C9F9694E8A89E227AD84F093F1EE56FD252EE79A4DD。
- `styles.css` SHA256：D4D514B77BDE37661A150510F1BD315038AFEE5F9716733E6DCAD9FD3863F2D2。
- 指定影片與設計副本SHA256一致，未重編碼；ffprobe：H.264／AAC、1280×720、24fps、15.072秒。
- 159則既有文案逐項審閱；18則改寫及11則新增；三語170則各自涵蓋相同keys，所有HTML可見文字／輔助標籤／metadata均在catalog。

## 已執行檢查

| 檢查／需求 | 結果與證據 |
| --- | --- |
| 原有 `npm.cmd run check` | pass；JS語法，另驗design-preview語法 |
| `npm.cmd run test:localization` | 29 pass；正式來源仍是159則，不冒稱已整合設計字串 |
| 同一語系測試套用SD1資料與template | 29 pass；170則／語，`output/check-sd1-localization.mjs` |
| `npm.cmd run test:media` | 13 pass（12情境＋父測試）；先記錄原伺服器404的失敗，再補MP4與Range；完整／指定／尾段／open-end／越界／HEAD／If-Range |
| `npm.cmd run test:hosting` | 4 HTTP測試＋新快照逐檔比對pass |
| `npm.cmd run test:boundaries` | 4 pass；junction／來源／輸出邊界保留 |
| `npm.cmd run build:hosting` | pass；使用既有獨立快照建置；未以本次測試聲稱已修好歷史一般build的EBUSY |
| FR-S1／S2，首頁→下載→Steam→返回 | pass；真實導航到5331510的AutoKey商店，FAQ也有商店連結 |
| FR-S3／S5，3語×320/375/768/1024/1440 | 15格pass；無水平overflow、CTA未裁切且≥44px；320px允許文字換行 |
| FR-S5，鍵盤／無JS／原有示範 | pass；Tab焦點可見；停用JS仍有商店連結及原生video控制；原有長壓一次示範可完成 |
| FR-S6，影片操作 | pass；原生play／pause按鈕、seek11秒、行動尺寸解碼、調音量、自然結束、重播、原生fullscreen進入VIDEO並退出 |
| FR-S4，SEO與HTTP | pass；title／description／canonical／OG圖片／單一h1；robots／sitemap／資產200、未知及私有路徑404、預覽HTTP noindex；正式外網更新未執行 |
| 網路與例外 | pass；播放前沒有MP4下載，頁面資源皆同源，無pageerror；影片error=null |

`output/verify-sd1.cjs`共37項檢查通過；補充結果存於 `output/sd1-extra-results.json`、`output/sd1-final-results.json`。影片聽覺品質未審，測試以靜音執行，不改原始音訊。實機手機瀏覽器未測，僅Chromium響應式與播放驗證。

## 設計師視覺與元件檢查

已開啟檢視 desktop-home、desktop-download、video-section、英文mobile-download及mobile-video圖；卡片與影片沿用品牌、比例正確、沒有溢出。Taste計數沿用 `../../visual-review.md`；本輪無額外打磨。

真實瀏覽器開啟Atlas [Link](https://huangchiyu.com/Vibe-UI-Atlas/components/link/)、[Card](https://huangchiyu.com/Vibe-UI-Atlas/components/card/)、[Video Player](https://huangchiyu.com/Vibe-UI-Atlas/components/video-player/)，均HTTP200、標題正確；catalog精確對應link/action-feedback、card與video-player/data-and-media。共享HTML已透過只提供該檔的本機輔助伺服器渲染與檢視。初次file協定被CLI封鎖，改用loopback後成功；不把此限制說成來源無法驗證。

對比實測：按鈕字#11261e／#9aefcc為11.81:1；卡片次要字#a9b9bd／#131c20為8.53:1；影片說明#a9b9bd／#0b1012為9.44:1；下載說明#bbcfc1／漸層較亮背景#1c3426為8.16:1；focus薄荷綠／卡片背景12.83:1。均超過本次文字4.5與focus3門檻；hover填色變亮且文字色固定。

測試腳本修正紀錄：第一次以程式focus測focus-visible，並非鍵盤輸入；改成Tab旅程後通過。第一次native播放座標落在seekbar，依實際截圖改點play。fullscreen初次尚未載入metadata，改先播放後點native按鈕即通過。均為測試操作問題，無產品外觀修補、無不明失敗或回歸。

## 尚待完成

使用者確認SD1；正式UI／根語系及資產整合；正式成品與SD1配對視覺／旅程；之後如要求發布，再驗證公開網域與快取。本預覽不代表已發布、已收錄或排名改善。
