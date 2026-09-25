# 官網驗收紀錄

2026-09-25。設計基線：ui-ux-spec.md「按鍵節奏台」。範圍是官方介紹網站，不代表桌面產品新增連招或相容性能力。

## QA 計畫

| 旅程／需求 | 實際操作 | 要觀察的結果 |
| --- | --- | --- |
| S1／FR-S1 了解產品 | 首頁→體驗按鍵節奏 | 品牌、Windows 用途、hero 圖示、完整標題、目的錨點正確 |
| S2／FR-S2 選擇情境 | 工作→遊戲→格鬥，用滑鼠與左右／Home／End | 三面板與 active 語義一致；遊戲範圍、格鬥未支援限制可見 |
| S3／FR-S3 模擬 | 工作單次與循環→停止；遊戲長壓→釋放；切情境／離開頁籤 | 單次完成、循環可停、無殘留 timer、無全域按鍵 |
| S1／FR-S4 閱讀與導覽 | FAQ 展開、鍵盤導覽、desktop/tablet/390/320、200%字級、reduced motion | 不溢出、不截字、焦點及可觸範圍、停用動畫保留文字狀態 |
| S2／FR-S5 真實範圍 | 檢查相容性、下載、Cloud、31語系相關文案與連結 | 前景／背景都依目標接受程度；無假下載與未驗證大多數宣稱 |
| S4／FR-S6 維護 | check/build/preview；比對Git、資產hash、來源範圍 | dist 自足；origin 只指 AutoKey_Site；不包含AutoKey程式／設定 |

## 參考與環境

Edge headless，Playwright CLI 0.1.21，Node.js 24.19.0；Windows。同機 CLI 的更新通知與 Node 結束流程發生 UV_HANDLE_CLOSING；設定 `NO_UPDATE_NOTIFIER=1` 後 CLI 正常，未改全域套件或系統執行原則。

已從僅本機的參考伺服器開啟共享 component-pattern-library，操作 Activity／Members tabs 與 reporting rules disclosure；snapshot `.playwright-cli/page-2026-09-25T11-01-19-975Z.yml`。遠端 Atlas demo 存取限制見設計規格。參考頁 favicon 404 與官網無關，不列為官網通過或失敗證據。

## 結果

正式網頁正在實作；下方完成後補入實際旅程結果與截圖。單純語法或建置成功不代替 UI 驗收。
