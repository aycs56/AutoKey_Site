# D1 共用視覺審查紀錄

2026-10-22；Taste／impeccable 共用。初次製作不計修訂；同位置含手機及後續正式實作最多3次。每次改前預留，改後附實際渲染證據；不因換角色重置。

| Location | 需求／版本 | 次數 | 發現／變更／結果 | 狀態 |
| --- | --- | --- | --- | --- |
| S1-header-hero | R1,R2,R7／D1 | 2 | 第1次壓低場景前景晶體，1440實際播放光束對齊。第2次依 DQA-01／02 補齊桌面導覽44px最小寬度、平板播放鈕44px高度；45格矩陣及7個鄰近尺寸複驗通過 | 本次修訂通過 |
| S2-features | R6,R9／D1 | 1 | 手機英文渲染發現錄製限制註記12px，低於交接的次要正文14px；統一14px，三語複驗無overflow，實測對比9.44 | 本次修訂通過 |
| S3-studio | R3–R5／D1 | 2 | 第1次共用場景光束通道修正。第2次必要示範限制與相容性註記統一14px；390英文實看可讀，45格無overflow；1440/390光束圖層尺寸一致，按下1／放開0透明度正確 | 本次修訂通過 |
| S4-setup | R6／D1 | 0 | 1440全頁與390英文實看、三語矩陣已查；三步順序與說明完整 | 初次製作通過 |
| S5-compatibility | R6／D1 | 0 | 全頁與三語窄版實看，三條必要限制與同時起算圖完整 | 初次製作通過 |
| S6-faq-release | R6／D1 | 1 | 發布狀態手機11px改14px；實測14px、45格複驗無overflow，六項FAQ可獨立操作 | 本次修訂通過 |
| R0-review | R10／D1 | 0 | 1440全頁與320流程實看、320無overflow；6個節點分別連至S1–S6 | 初次製作通過 |

實際截圖見 `design/redesign-v1/pm-design-review.md`，獨立結果與限制見 `design/redesign-v1/qa-review.md`。以上為設計階段審查；使用者確認與正式網站實作／驗收尚未完成。這些次數會沿用到後續正式實作，不重置。

## D1 正式落地設計師複核（2026-10-22）

使用者已批准`bd7fa98` D1。正式HTML／CSS／app／場景SVG逐位元沿用；沒有新增美術修訂，以上次數不變。UI/UX依Taste與impeccable檢視正式全頁、層次、文字、資產位置與必要內容，與批准稿沒有差異，無新增矯正清單。

在相同DPR1、reduced-motion（固定截圖時間，不取代一般動畫測試）、locale與viewport下，1440×1000繁中及390×844英文兩組全頁PNG逐位元相同。證據：`output/playwright/redesign-production-{design|product}-{1440|390}.png`。實際動畫及各情境由正式旅程驗證另查，結果在`redesign-validation.md`；不只憑來源檔案相同宣稱呈現一致。

## SD1 指定新增與文案調整（2026-11-13）

使用者新增下載入口、全站文案與介紹影片。SD1初稿已以Taste檢視桌面及手機實際圖；沒有額外美術打磨。保留原同位置歷史：S1-header-hero 2→3（本批新增下載／影片入口與文案），S2-features 1→2（功能標題具體化），S3-studio 2→3（示範說明），S6-faq-release 1→2（取得資訊／卡片），S4／S5保持0。S1／S3已到上限，不再追加風格修改。S7-introduction為使用者明確新增的影片區，初次製作0；SD1審閱頁初次製作0。未發現必修視覺缺陷。

證據：`output/playwright/sd1-desktop-home.png`、`sd1-download-section.png`、`sd1-video-section.png`、`sd1-en-mobile-download.png`、`sd1-mobile-video.png`。原生影片按鈕位置測試與程式化focus方式曾調整測試操作，未修改產品外觀，不計美術修訂。正式SD1落地與impeccable對照仍待使用者確認。
