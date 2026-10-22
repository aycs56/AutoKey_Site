# D1 設計完成檢查

2026-10-22｜PM／UI/UX：主代理｜需求 R1、規劃 P1｜範圍：HTML 設計，非正式網站驗收。

## PM 功能覆蓋

| 需求／Story | 設計位置與預期結果 | 檢查結論 |
| --- | --- | --- |
| FR-R1／US-R1 | S1–S6，全站產品、功能、情境、步驟、相容性、FAQ、取得狀態 | 完整桌面渲染已見全部章節；手機保留同樣資訊 |
| FR-R2／US-R2 | S1 首屏採集場景，按1秒／休1秒共6秒、停止、重播 | 原創場景與E鍵同步；QA時序及手動中止通過 |
| FR-R3／US-R2 | S3 game／mouse／work 三頁籤，各自按鍵、時序、限制與結果 | 3情境與規格相符；游標固定，文件按次切換 |
| FR-R4／US-R2 | 一次、循環、停止、完成、重開及互斥播放 | QA19項首批旅程斷言通過，停止後無次數增加 |
| FR-R5／US-R4 | 情境／語言切換、分頁隱藏、離頁中止 | 切情境／語言及真實pagehide通過；visibility邊界注入取消通過。真實hidden狀態在無頭環境無法觸發，保留後續驗證限制 |
| FR-R6／US-R1,R3 | S2/S4/S5/S6，滑鼠、錄製、群組同時起算、本機保存、31語、Cloud與取得狀態 | 內容角色對照桌面事實，三語語意已覆核；FAQ可各自開合，必要限制另在正文常駐 |
| FR-R7／US-R4 | 三語全文、metadata、輔助標籤與狀態；既有resolver／storage | 每語159則，缺漏0；實際語言切換及瀏覽器語言、自訂保存、受限提示通過 |
| FR-R8／US-R4 | 320–1440px、44px目標、鍵盤、放大、reduced motion與無JS | 兩個觸控缺陷一次修正；45格複驗無overflow且目標合格。640px等效200%版面9格通過；非真實瀏覽器縮放操作，方法限制已保留 |
| FR-R9／US-R2,R4 | 首屏、章節單次進場、鍵帽、光束、頁籤、FAQ與捲動回饋 | 動態不遮正文，不持續自動播放，reduced motion保留離散狀態；未加入全域按鍵或系統輸入 |
| FR-R10／US-R5 | review.html流程、handoff、素材映射、QA與階段提交 | 設計交付資料齊全；本次只確認設計覆蓋。使用者D1確認、正式整合與正式驗收尚未完成 |

PM 結論：D1 的畫面、操作、狀態及必要內容完整覆蓋 R1／P1，可交使用者檢視。這是設計覆蓋通過，不等同正式網站 DoD；真實分頁隱藏與瀏覽器縮放尚有環境驗證限制。工程需取得這份 D1 的視覺確認才可更新 `public/`。

## UI/UX 渲染完成審查

- 主代理實際查看1440×1000首屏播放、1440全頁、390英文首屏／情境／步驟、1440與320審閱流程；獨立QA查看三語768／320、三情境與光束按下／放開狀態。完整證據清單見 `qa-review.md`。
- 石墨底、薄荷綠操作色與既有logo一致。主標與原創採集場景形成明確首屏重心；功能、互動、設定、相容性及FAQ以不同構圖區分。手機改為直排及重新分配欄位，未將整頁等比例縮小。
- 文案直接說明操作及限制；沒有虛構使用者數字、好評、下載、相容性背書或發售承諾。原創場景明示網頁動畫，不稱實機畫面。
- DQA-01／02修正導覽與平板播放鈕觸控區；必要說明字級統一至少14px。共用修訂帳本在 `../../visual-review.md`，最高為S1/S3各2次，未超過3次上限。
- 對比、focus、FAQ、三語排版、取消排程及降級狀態由獨立QA查核。沒有新增第二個視覺候選或框架依賴。

## 可重現證據

- `output/playwright/redesign-v1-desktop-playing.png`：1440px，繁中，首屏按下／光束。
- `output/playwright/redesign-v1-desktop-final.png`：1440px，繁中，整頁。
- `output/playwright/redesign-v1-mobile-en-top.png`、`redesign-v1-mobile-en-setup.png`：390px英文首屏與設定（觸控／正文修正前的未受影響位置）。
- `output/playwright/redesign-v1-mobile-studio-final.png`：390px英文情境，14px限制正文。
- `output/playwright/redesign-v1-review-desktop.png`、`redesign-v1-review-flow-mobile.png`：完整審閱與320px流程。
- QA原始、修復後矩陣、邊界與旅程結果：`output/playwright/redesign-v1-qa-*`；忽略於Git，交接報告保留方法、結果與限制。

## 交付界線

`npm.cmd run check`、`npm.cmd run test:localization`（既有29項／每語152則）通過；D1的app.js、locales.js及預覽工具Node語法通過。設計預覽11項HTTP／存取邊界檢查通過。正式 `public/`、根`locales/`未改；本階段沒有建置、部署或推送新版，正式build及boundary回歸在D1確認後的落地階段執行。
