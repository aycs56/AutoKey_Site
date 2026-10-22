# D1 獨立設計 QA 與 PM 覆蓋檢查

日期：2026-10-22｜基準：R1／P1／D1 draft｜範圍：`http://127.0.0.1:4187/index.html` 設計稿；不是正式產品驗收，尚未取得 D1 使用者確認。
環境：Windows、獨立 Playwright CLI headless Chromium session `autokey-design-qa`、DPR 1、一般檢查 zoom 100%。基礎 Git `d0341b329a065e840f012decc87eece06fa33fde`；設計未提交檔案以最終 SHA256 紀錄為準。
結論：可供 PM 進行 D1 設計覆蓋檢查與使用者視覺確認。兩項實測缺陷已由主代理修正，QA 重驗通過；真實隱藏分頁與瀏覽器原生200%縮放保留環境限制，不能宣稱完整正式驗收。QA 僅寫本報告及指定證據，不修改實作。

## 缺陷紀錄

| ID／嚴重度／需求 | 重現、預期與實際 | 證據、原因與修復契約 |
| --- | --- | --- |
| DQA-01／中／FR-R8／resolved | 三語各於 1440、1280、768px 開啟頁面；量測 `.site-header nav a`。預期每個操作目標至少 44×44 CSS px。繁中／簡中「功能」初測28×44，英文「FAQ」25.609×44。三情境均重現 | 初測 `output/playwright/redesign-v1-qa-matrix.txt`、`redesign-v1-qa-zh-Hant-768.png`、`redesign-v1-qa-en-768.png`。原因為 >700px 未保證最小寬度；主代理第1次修復加入44px。完整45格與701／767／769／959／960／961鄰近寬度重驗通過，見 matrix-retest／final-checks；未觀察到回歸 |
| DQA-02／中／FR-R8／resolved | 768px 三語開啟首頁，量測 `#hero-play`。預期高度至少44px；初測41.390625px，寬318px。390／320px同控制符合44px | 初測同一matrix與768px截圖。原因為960px規則設40px，≤700px才覆寫44px；主代理第1次修復改44px。完整45格及上述鄰近寬度通過，對應retest截圖已另存，保留初始證據 |

## 已完成的檢查

- J1–J3 首批19項斷言全部通過：hero按下／放開、手動停止、6.2秒後停止、重播；三情境單次完成、執行時停用單次、循環至少兩次、停止後等待不增數；執行中切案例／語言停止。證據：`output/playwright/redesign-v1-qa-journeys.js`、`.txt`。
- 三語×5寬度×3情境共45格：初測45格無頁面水平溢出、27格目標尺寸不符；修復後45格均無溢出且全部可見目標≥44px。每格檢查24或25個可見控制。初測 `.txt` 保留；重驗為 `output/playwright/redesign-v1-qa-matrix-retest.txt`，截圖為 `redesign-v1-qa-retest-{語言}-{768或320}.png`。英文701／767／769／959／960／961共6個鄰近斷點亦通過；新增14px限制正文未造成矩陣溢出。
- 三語 document title、description meta 均切換；英文文字節點與 aria-label／alt／title 未發現殘留中文（語言選項依規格保留原語）。這不等於全部翻譯語意已人工驗證。
- 6個FAQ均實際開啟，內容包含錄製／群組、游標、Cloud、31語及取得狀態；鍵盤Enter可開合。頁籤ArrowRight／ArrowLeft／Home／End共4項選取與焦點通過；Tab至單次按鈕有薄荷色2px solid焦點框，見 `redesign-v1-qa-keyboard-focus-control.png`。
- 語言切換保留目前情境、FAQ開啟與select焦點；重載保留手選英文。en-US／zh-TW／zh-CN／fr-FR四個獨立context分別選en／zh-Hant／zh-Hans／en。三份catalog各159鍵、無缺值。儲存受限context切英文仍成功且顯示不能保存提示。證據：access／final-checks。
- reduced motion下hero仍有離散按下狀態、執行中的動畫數為0；390px無JS保留繁中全文及3案例、無效控制全部隱藏、無水平溢出。證據：access及nojs／storage-blocked截圖。
- 本輪獨立瀏覽器console讀回0 errors／0 warnings；final-checks涵蓋重新載入、頁面操作與審閱入口的22筆response，0失敗請求、0 HTTP≥400、0站外資源。僅代表本輪已走過資源與旅程。

## 素材與動態相位

已實看hero播放、1440px與390px採集場景的down／up畫面。光束從裝置發射端接到晶體表面，沒有穿過前景碎石；放開後光束消失，鍵帽及文字改為等待。原創場景實際載入 `/assets/mining-scene.svg`，不是設計說明中的假路徑。兩尺寸的image與overlay實測外框差異均<1 CSS px，down opacity=1、up opacity=0；手機保持相同縮放與平移。證據：`redesign-v1-qa-beam-{1440或390}-{down或up}.png`、final-checks。

## 對比實測

採WCAG相對亮度公式，以瀏覽器computed color與背景alpha合成；漸層另取兩端，不沿用透明底錯誤估值。

| 內容／狀態 | 前景／有效背景 | 比值／門檻 | 結果 |
| --- | --- | --- | --- |
| hero正文／small-note | #a9b9bd／#0b1012 | 9.44／4.5 | pass |
| demo-disclaimer | #a9b9bd／#10181c | 8.86／4.5 | pass |
| scenario-limit | #b4c4c5／#10181c | 9.96／4.5 | pass |
| release-note漸層兩端 | #c0d4c5／#1c3427、#12241b | 8.58、10.41／4.5 | 取較低8.58，pass |
| 主要按鈕 | #11261e／#9aefcc | 11.81／4.5 | pass |
| hero播放按鈕 | #9aefcc／#12201c | 12.48／4.5 | pass |
| demo-status | #a9b9bd／#131f23 | 8.30／4.5 | pass |
| FAQ文字 | #f1f5f2／#0b1012 | 17.39／4.5 | pass |
| 必要控制邊界 | #6c858b／#131c20 | 4.42／3 | pass |

證據：`output/playwright/redesign-v1-qa-boundaries.txt`、`redesign-v1-qa-contrast.txt`。這是代表狀態的對比檢查，不是全站無障礙認證。

## PM 可用覆蓋表

| 旅程／對應需求 | 實際結果與證據 | 設計階段判定 |
| --- | --- | --- |
| J1／FR-R1,R2,R9；S1 | 首頁有Windows、鍵盤／左右滑鼠、快捷鍵；hero down/up、停止、6秒結束、重播5項通過；已實看原創場景 | pass |
| J2／FR-R3,R4；S3 | 3案例×4項單次／停用／循環／停止後等待，共12項通過；停止釋放鍵帽，次數不再增加 | pass |
| J3／FR-R5；S1/S3 | 切情境／語言停止2項通過；注入hidden事件邊界停止且等待2.2秒不增數；實際導航pagehide停止且down=0 | supported，真實hidden待正式環境補驗 |
| J4／FR-R6；S2/S4–S6 | 操作／限制常駐內容可讀；6FAQ實際開啟、保留首發無Cloud／非序列／游標與取得界線；無假下載 | pass |
| J5／FR-R7；S1/S3/S6 | 三語正文／title／meta／輔助屬性、159鍵完整、4種瀏覽器語言、保存與受限提示通過；焦點／FAQ保留 | pass；語意品質由內容角色覆核 |
| J6／FR-R8,R9 | 45格+6鄰近寬度、4頁籤鍵盤、reduced motion、noJS通過；640×500縮放等效矩陣3語×3案例共9格無溢出；9類對比達門檻 | supported，原生縮放待正式環境補驗 |
| 交接／FR-R10；R0 | 已讀R1/P1/D1、審閱入口11個真實頁面／anchor連結；有流程圖及來源紀錄；設計hash如下 | 可送PM設計覆蓋評閱；使用者D1確認與正式產品仍pending |

## 方法限制與非缺陷紀錄

- Headless新tab／bringToFront、視窗minimized、lifecycle、停用focus emulation均未讓 `document.hidden=true`。access／hidden檔中的false是測試前提未成立，不是產品取消失敗。後續boundaries使用明示注入的hidden getter＋visibilitychange驗證controller，以及真正導航觸發pagehide；兩者不能冒稱真實切分頁完整通過。
- `documentElement.style.zoom='2'` 初測在1280英文有水平溢出；CSS zoom不會依原生瀏覽器縮放方式改變media query，經PM判讀不列產品缺陷。改用640×500代表1280×1000在200%縮放的CSS可用空間，三語三案例9格通過。實際瀏覽器縮放、實體手機及其他瀏覽器未在此headless環境驗證。
- 語言切換原先以scrollY差<2px斷言過嚴：2352→2384、焦點仍site-language且FAQ仍開啟，為32px文字重排位移；沒有重置回頁首。記為方法限制，不要求三語不同高度保持完全相同scrollY。
- Handoff原稱≤960px首屏堆疊，實際≤700px；PM已決定保留實際設計並同步交接文件。這是文件同步項，不是新增產品缺陷。

## 最終檔案指紋與交付

SHA256：index.html `918256594F5F1D6D07D7A0CBBC403C0C11DF9049CCD884C9875F7715D77B6FE8`；styles.css `D0E4FE59AA26A05725B04EA82556FCA78AEFFF44D659DF81BC6A5FA361B14F69`；app.js `F7BBF9B8636F0DE24EAFF7C09E1DACEE442D4CA19918B717AE2F1ACF03A832A8`；mining-scene.svg `81E02032D2B44ED476FB62754C3786F0E36EC0DCD61B9FADD1A2C42C5977B792`。

所有實際操作程式片段與結果保存在 `output/playwright/redesign-v1-qa-*.js/.txt`，不是新增Playwright test suite。未提交Git、未修改正式網站、未停止4187。QA完成後關閉獨立 `autokey-design-qa` 瀏覽器session。
