# AutoKey 改版正式產品驗證

日期：2026-10-22｜獨立 QA：Codex QA 角色｜需求 R1／規劃 P1.1（設計及功能仍為P1範圍）／已確認 D1 `bd7fa98ae2e23ebc64863c19f996607374b8563e`。
使用者已確認「確認 D1，依此落地」。本輪操作的是 `public/` 正式來源在 `http://127.0.0.1:4188/` 的產品預覽；設計對照為4187，並非將設計稿QA當成產品驗收。

已執行的產品旅程與版面檢查通過，未發現新的阻塞缺陷。真實分頁隱藏及瀏覽器原生200%縮放仍有環境驗證缺口，因此不宣稱完整端到端驗收通過；本輪也未驗證線上正式部署。

## 環境與方法

- Windows、Playwright CLI獨立headless Chromium `155.0.8059.85`，session `autokey-production-qa`，DPR1。一般矩陣高度1000px；無JS／儲存受限／觸控為390×844px。沒有切換使用者前景。
- 沿用D1旅程片段，全部改向4188，證據另存 `output/playwright/redesign-production-*`；未覆蓋原設計證據，未新增測試套件、未改程式或提交Git。
- 讀取R1/P1、工作規範、D1交接及PM覆蓋文件後，依實際DOM操作。以下每組結果保留命令片段 `.js` 與CLI讀回 `.txt`，名稱可直接對應重現。

## 已執行結果

| 檢查組／證據檔尾名 | 實際覆蓋及結果 |
| --- | --- |
| `journeys` | 19項通過：hero按下／放開、手動停止、6.2秒後已結束、重播；3情境各自單次停用與完成、循環至少兩次、停止後等待不增數；播放中切情境／語言取消 |
| `mutual` | 5項通過：情境→hero及hero→情境互斥、3次快速開始／停止後等待無殘留、hero播放中切語言及切情境停止 |
| `timing-touch` | hero實測3次長壓：0／2002／4003ms按下，1002／3003／5001ms放開，6.2秒時顯示完成；觸控context以tap執行長壓單次後completed、1次、down=0。12個頁內連結的目標均存在 |
| `matrix` | 繁中／英文／簡中×1440／1280／768／390／320px×game／mouse／work，共45格全數無水平溢出，可見操作目標皆≥44×44px；每格檢查24或25個控制 |
| `access` | 10項通過：Enter開FAQ、語言切換保留select焦點及FAQ展開、重載保留手選英文、4種頁籤方向／Home／End、reduced motion、無JS、storage blocked |
| `boundaries` | 640×500等效縮放空間下，3語×3情境9格無溢出；明示注入hidden狀態的visibilitychange取消通過且等待2.2秒不增數；真實導航觸發pagehide後stopped、down=0 |
| `final-checks` | 英文640／701／767／769／959／960／961px共7個補充寬度均無溢出且控制≥44px；6個FAQ均可開啟；4種瀏覽器語言解析正確；兩尺寸場景相位與overlay外框對齊 |
| `contrast`、`boundaries` | 一般文字、提示、按鈕、狀態及FAQ代表色對≥4.5；必要控制邊界≥3；見下表。鍵盤Tab所得焦點為薄荷色2px solid框 |

這些計數分組呈現，不把同一個旅程的多項斷言重算成不同使用者旅程。D1曾修正的DQA-01／02在正式45格矩陣及鄰近斷點未回歸；本輪沒有新修復循環。

## J1–J6與需求對照

| 旅程／需求 | 操作、觀察與判定 |
| --- | --- |
| J1／FR-R1,R2,R9；S1 | 從首頁閱讀產品用途→播放→中停→重播→自然完成；3段1秒長壓與1秒等待可觀察，沒有自動無限播放。已執行項目pass |
| J2／FR-R3,R4；S3 | 三頁籤各執行一次、循環、停止、等待；單次完成與停止可再啟動，按鍵釋放且次數不增。追加互斥及快速操作pass |
| J3／FR-R5,R7；S1/S3 | 情境／語言切換、hero互斥及真正離頁均取消；hidden事件邊界注入pass。真實背景分頁未能在本環境驗證，保持partial |
| J4／FR-R6；S2/S4–S6 | 閱讀步驟與相容性，實際開啟6FAQ；錄製不是序列、群組同時起算、滑鼠不移游標、首發無Cloud、發布資訊待公告均可讀；沒有假下載。pass |
| J5／FR-R7；S1/S3/S6 | 三語正文、title、description、輔助屬性切換；手選保存、受限提示、焦點與FAQ保留；159則／語無缺值。pass，翻譯語意沿用D1內容角色覆核 |
| J6／FR-R8,R9 | 鍵盤、觸控tap、44px目標、三語尺寸、noJS、減少動態通過；640px等效空間通過。真實原生200%縮放與實體裝置未驗證，保持partial |
| FR-R10／US-R5 | 正式來源與已確認D1檔案、渲染證據對照通過；本報告記錄產品QA，建置／交付由主代理記錄。未因本機預覽推論已部署 |

## 三語與降級

- 三份正式catalog各159鍵，缺值0；英文全文文字節點與aria-label／alt／title掃描未發現中文殘留，語言選項保留原語名稱。三語title與description均實際切換，沒有把結構化CSS／viewport資料當翻譯內容。
- 4個獨立context：en-US→en、zh-TW→zh-Hant、zh-CN→zh-Hans、fr-FR→en。手選英文重載後仍為英文；localStorage getter拋SecurityError時當次切換仍成功且顯示不能保存偏好的英文提示。
- 無JS保留繁中全文及3情境，語言／播放無效控制隱藏，390px無溢出。reduced motion下hero有離散按下狀態，執行中的動畫數為0。
- 證據：`redesign-production-matrix.txt`、`access.txt`、`final-checks.txt`，以及`nojs.png`、`storage-blocked.png`。語言切換不要求不同文字高度保持完全相同scrollY，不以文字重排位移判成跳頁。

## D1對照與素材實看

主代理以reduced motion固定狀態，提供1440×1000繁中及390×844英文的D1／正式版全頁PNG。本QA另行讀取SHA256確認兩組各自byte hash相同，並實看正式全頁構圖、手機排列及獨立採集down／up截圖。這是已渲染畫面的比較，並非只比較檔名。

| 尺寸／語言 | 圖片對／本QA獨立讀回 | 結果 |
| --- | --- | --- |
| 1440×1000／zh-Hant | `redesign-production-design-1440.png`／`product-1440.png`；SHA256 `2C6FE51F6C58EAF4623512FE2FFE44FF4238658EF00F7B776B4146381254CA5D` | 相同 |
| 390×844／en | `redesign-production-design-390.png`／`product-390.png`；SHA256 `0C3BDDA60AF1CF7A66392A66AA14AF0DC2CAF49521651089CD6F0C0A01132133` | 相同 |

獨立比對記錄為 `redesign-production-visual-hash-comparison.json`。整頁檢視確認章節順序、石墨／薄荷品牌、手機單欄與限制文案保留；細部光束另有本QA原尺寸截圖。

採集SVG實際來源為 `http://127.0.0.1:4188/assets/mining-scene.svg`。1440與390px的image／overlay外框差異均<1px；down光束opacity=1、up=0，端點接在裝置與晶體表面，放開時鍵帽與文字同步回到等待。實看證據：`redesign-production-beam-{1440或390}-{down或up}.png`，沒有臨時設計目錄的runtime路徑。

## 對比與CSP

| 對象 | 前景／背景 | 最低比值／門檻 |
| --- | --- | --- |
| 正文／small-note | #a9b9bd／#0b1012 | 9.44／4.5 |
| demo-disclaimer／scenario-limit | #a9b9bd、#b4c4c5／#10181c | 8.86、9.96／4.5 |
| release-note漸層 | #c0d4c5／#1c3427與#12241b | 8.58（兩端較低）／4.5 |
| 主要按鈕／播放按鈕 | #11261e／#9aefcc；#9aefcc／#12201c | 11.81、12.48／4.5 |
| demo-status／FAQ | #a9b9bd／#131f23；#f1f5f2／#0b1012 | 8.30、17.39／4.5 |
| 必要控制邊界 | #6c858b／#131c20 | 4.42／3 |

4188實際HTTP header保留 `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`，以及nosniff；沒有為設計放寬CSP。CLI完整console讀回0 errors／0 warnings；final-checks觀察26筆response，0失敗請求、0 HTTP≥400、0站外資源，未見CSP封鎖。

證據：`redesign-production-headers-sources.json`、`console.txt`、`final-checks.txt`、`contrast.txt`。對比是代表狀態檢查，不是全站WCAG認證；網路數字僅代表本輪實際走過的資源。

## 來源指紋與其他角色證據

本QA以SHA256獨立讀回正式檔案與D1，以下4檔完全一致：

| 檔案 | SHA256 |
| --- | --- |
| public/index.html | `918256594F5F1D6D07D7A0CBBC403C0C11DF9049CCD884C9875F7715D77B6FE8` |
| public/styles.css | `D0E4FE59AA26A05725B04EA82556FCA78AEFFF44D659DF81BC6A5FA361B14F69` |
| public/app.js | `F7BBF9B8636F0DE24EAFF7C09E1DACEE442D4CA19918B717AE2F1ACF03A832A8` |
| public/assets/mining-scene.svg | `81E02032D2B44ED476FB62754C3786F0E36EC0DCD61B9FADD1A2C42C5977B792` |

以下是主代理提供的交付證據，不冒稱由本QA重跑：`check`、29項localization、4項boundaries通過；`test:hosting`的4項HTTP及快照逐檔比對通過；獨立code reviewer無P1/P2。一般`build`遇既有`dist/assets` EBUSY，PM採既有`build:hosting`新快照途徑，沒有把該失敗改寫為通過。本QA讀回 `output/hosting-build.json` 指向 `output/hosting-builds/release-7qtePb/site`；未自行修基建或操作正式服務。

BLD-01（主代理證據）：失敗build造成的dist缺檔已先經`validateSourceTree`檢查，再以不刪目錄的複製方式回填；主代理確認10檔與public逐位元一致。此復原不代表一般build的EBUSY限制已解決。

## 剩餘限制與交付邊界

- 真實瀏覽器分頁切到背景未在headless環境取得hidden狀態。此次沒有重試已知失敗環境方法；注入getter／visibilitychange只是controller邊界證據，不能替代真實分頁驗證。真實pagehide則已實際導航驗證。
- 640×500是1280×1000在200%時的CSS可用空間檢查，不是操作瀏覽器原生縮放。未使用root CSS zoom假裝原生縮放，也未宣稱實體手機／其他瀏覽器均已驗證。
- 兩項限制對應J3／J6，仍須在可取得實際狀態的環境補驗；完整e2e驗收保持未完成。公開網域、Steam公開取得及桌面程式相容性都不在此次本機網站QA證明範圍。
- QA完成後關閉自己的`autokey-production-qa`瀏覽器session；保留4187設計與4188產品預覽，未提交、推送或部署。
