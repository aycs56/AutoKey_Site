# 官網驗收紀錄

此檔保留2026-09原版證據；2026-10-22 D1整站改版請看[改版驗證紀錄](redesign-validation.md)，不可沿用下列舊版通過數字宣稱新版驗收。

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

| 項目 | 實際結果／證據 |
| --- | --- |
| 正式頁面互動 | `output/playwright/journeys-final.log`：27 PASS。實際 click/keyboard 驗證單次、2秒循環、1秒長壓／休息、停止與切情境、tab Home/End/左右、FAQ、相容性／發售文案、錨點與無外部依賴 |
| 追加旅程 | `output/playwright/final-checks.log`：9 PASS。skip link 到主內容、焦點環、長壓提前停止與再次啟動、禁用 JS 時三情境仍可讀且不顯示失效按鈕 |
| 響應式 | `responsive-final.log`：1440×1000、1280×800、768×1024、390×844、320×740，每尺寸3情境，全部無水平溢出／文字裁切／小於44px的互動目標；修正原導覽 28/42px 寬問題 |
| 放大與減少動態 | 1280 viewport 的 200% CSS zoom 無溢出；reduced motion 得到 scroll:auto、transition:0s、animation:none。此為 CSS zoom 模擬，非所有 OS 輔助科技認證 |
| 視覺 | Root 檢查 hero-desktop.png、hero-mobile.png、features-mobile.png 與完整頁面；獨立 UI/UX 檢查兩桌面＋390遊戲截圖通過。手機功能與相容性標題保留語意換行，避免單字尾行 |
| 內容／功能邊界 | 前景與背景均依目標接受訊息；無『大部分相容已驗證』。遊戲自動化條件展開可見，格鬥有『複雜連招尚未支援』且無假執行控制；Steam／Cloud 未宣称上線 |
| 瀏覽器錯誤／依賴 | 官網 session console errors 0、warnings 0；只請求同來源 HTML/CSS/JS/icon，沒有外部字型／追蹤或使用者資料請求 |
| 建置與路徑 | npm check/build 通過；test:boundaries 4 個隔離旅程通過。拒 public根／巢狀／dist junction，且拒絕前不改既有包或目標fixture。獨立review P2 已修正並關閉 |
| Git 分離與品牌 | 網站 origin=AutoKey_Site，本機初始 commit 2673bd9；desktop origin=AutoKey、遠端 47dd8b1 且 [CI成功](https://github.com/aycs56/AutoKey/actions/runs/36126794420)。三品牌資產 hash 與桌面來源相同 |

補充限制：visibilitychange 測試以 headless 頁面受控注入 hidden 狀態觸發正式 listener，確認可見狀態與後續排程取消；沒有把它宣稱為人工切換實體瀏覽器頁籤的證據。F12 檢查為頁內鍵盤事件未取消，測試未按全域系統鍵。瀏覽器驗收以 Edge 為主，尚未做 Safari/Firefox 全矩陣或真人螢幕閱讀器驗收。

QA 程式與截圖保留在 output 供重現，不納入網站或 Git。沒有未關閉的網站阻擋缺陷；公開網站部署與 Steam 後台驗收仍未執行，屬另行流程。

## 三語官網追加驗收（2026-09-25）

對照 `plan.md` US-S5／FR-S7～FR-S10 與 `ui-ux-spec.md` 原生語言選單狀態。使用同一 Edge／Playwright 本機環境；每種語言 152 則翻譯，無外部翻譯請求。

| 需求與操作 | 實際結果／證據 |
| --- | --- |
| FR-S7 完整文案、metadata、動態示範 | 英文／繁中／簡中全部涵蓋來源字串、輔助標籤、頁面標題及說明；三語單次完成與長壓狀態正確，英文無殘留中文正文；`language-journeys.log` |
| FR-S8 首訪、手選與保存例外 | en-US、zh-TW、zh-HK、zh-CN、zh-SG、fr-FR 的首訪匹配正確；手選跨重新載入保存；注入禁止 localStorage 時仍可切換並顯示提示；`language-journeys.log` |
| FR-S9 保留使用情境及停止播放 | 語言切換保留目前情境與 FAQ 展開，停止鍵帽與後續排程，以新語言顯示原因；切換不重建 DOM 控制；鍵盤焦點保留；`language-journeys.log` 與 `language-final.log` |
| FR-S10 無 JS 與資料邊界 | 停用 JS 時三情境繁中全文可讀、失效語言／示範控制隱藏；只存語言代碼、不讀桌面設定；`language-final.log` 及獨立程式審查 |
| 鍵盤與錯誤回饋 | 原生選單 ArrowDown／Home 可切換、焦點框可見；禁止保存的英文提示在 320px 無溢出；新頁面執行無 console warning／error；追加 12 項 PASS |
| 正式網站旅程 | `output/playwright/language-journeys.log` 40 項 PASS，`language-final.log` 12 項 PASS；包含自動選擇、三語互動、重載保存、受限儲存、鍵盤及無 JS |
| 響應式與視覺 | `language-layout.log` 三語 × 1440／768／390／320 × 三情境，共 36 組；無水平溢出、文字裁切或小於 44px 的互動目標。Root 檢視英文桌面／手機、簡中手機及英文相容性區截图，長文正常換行，沿用石墨／薄荷綠 |
| 開發與建置 | `npm.cmd run check`、`test:localization`（29 項）、`build`、`test:boundaries`（4 個隔離旅程）全部通過；來源 public、產出 dist 皆包含完整翻譯包 |
| 獨立審查與修正 | 翻譯角色唯讀審查未見重大缺失；修正英文相容性句間空格與單次計數的複數用字，已重建並在正式瀏覽器複核 |

來源限制：Atlas select 來源頁於 2026-09-25 無法存取；採既有本機元件契約與瀏覽器原生控制並實測，未宣稱遠端視覺一致。瀏覽器仍限 Edge，本輪沒有完整 Firefox／Safari 或真人螢幕閱讀器認證。網站保持本機交付，無遠端 push／公開部署。
