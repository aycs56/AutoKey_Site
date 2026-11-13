# 移除推薦工具播放按鈕

2026-11-13；專案 `D:\AutoKey_Site`，main 基線 `691fb3e`，工作目錄乾淨。使用者明確要求移除「播放輪播」按鈕，完成後直接更新正式站並推送 GitHub。這是同一播放／暫停控制，兩種狀態一併移除。

PM、UI/UX、Frontend、QA、Release 在同一代理依序執行。分類 web／high（正式部署）／局部控制移除與發布；沿用既有完整發布檢查與回復流程。模型設定 gpt-6-astra／xhigh，未修改。使用 ai-dev-team-orchestrator、project-work-governance、ponytail、playwright、verification-before-completion；UI 檢視用 taste-skill／impeccable，紀錄文字用 speak-human-tw 校對。角色 Top5 沿用 recommendations-plan.md；沒有 API、新依賴或產品方向決策，不需 Backend 或新的 CEO 報告。

## 需求與交接

- US-T2／FR-T3 修訂：訪客瀏覽 S8 推薦工具時，不顯示播放或暫停切換按鈕；仍每 3 秒自動換卡。
- FR-T2／FR-T4：前後箭頭、鍵盤、手機滑動、位置指示與四站連結保留。hover／焦點暫停；手動操作後持續停止自動輪播，重新載入才依動態偏好初始化。減少動態偏好預設不自動播放。
- 成功條件：三語桌面／手機均無該按鈕；無 JavaScript 錯誤、控制失效或水平溢出；正式站一般快取路徑可取得新版，GitHub main 與本機 SHA 相同。

沿用 RT1／S8、`design/recommendations-v1/` 與 `public/` 既有品牌、圖示和卡片尺寸，只移除指定控制及其樣式／事件。使用者已指定確切刪除範圍並要求直接發布，直接執行此局部修改，不另開視覺選型或確認。元件來源沿用 [Carousel](https://huangchiyu.com/Vibe-UI-Atlas/components/carousel/) 與共享 library `#data-and-media`，無新元件或新美術方向。PM 已按上述需求檢查同步設計的控制、狀態與流程：S8 → 自動／箭頭／方向鍵／滑動換卡 → 開啟工具網站。UI 文案只刪除指定控制，其餘沿用既有三語。

## 執行與發布

1. 更新並渲染 canonical RT1，檢查桌面／手機，再同步正式 HTML／JS／CSS。
2. 真實瀏覽器驗證上述旅程；執行 check、localization、boundaries、hosting、monitor、media、tag-manager，產生全新託管快照。通過後提交本機 main。
3. 沿用工作規範已確認 install／verify 與既有備份／回復包裝腳本；本次證據置於 `output/remove-carousel-20261113/`。部署前保存舊 release、runtime、config、排程。失敗依既有回復程序停止並還原，保留日誌。
4. HTML 維持 no-cache，變更的 recommendations.css／recommendations.js 使用固定版本 `20261113-2`，避開 300 秒舊資產快取；正式站無 CDN cache／service worker。驗證發布前已開啟的 warm client 普通 reload 與 fresh client、公開檔案 hash、health／排程及其他路由未變。
5. `git fetch origin` 已確認遠端 main 與基線相同；以既有 `git push --dry-run origin main`、`git push -u origin main` 發布並比對遠端 SHA。不 force、不帶入 output 或桌面程式檔案。

無新 worktree；QA 證據保存在 output。原 4188 預覽已停止，本次使用受控前景程序 4193，驗收後關閉，另關閉本次 4192 設計預覽與瀏覽器。

## 發布前驗證

- check、29 項語系、4 項目錄邊界、4 項 hosting HTTP／21 檔快照逐檔比對、34 項監控、13 項影片、1 項 GTM 檢查通過。沿用專案已確認全新快照方式，未執行歷史有 EBUSY 的一般 dist 建置。
- Chromium 實際產品旅程 30 項通過：三語 × 1440／320 寬度無播放按鈕、兩個箭頭可用且至少 44px、無溢出；方向鍵前後切換、手機觸控滑動、hover 暫停、手動操作後停止及 reduced-motion 通過。自動輪播實測 3006ms。Header 四站、Escape、Steam 入口及 canonical 保留，無 JS 錯誤。證據 `output/remove-carousel-20261113/local-browser.txt`。
- UI/UX 以 taste-skill／impeccable 實看設計與產品的 1440 繁中／320 英文截圖：卡片、圖示、間距、可讀性與兩箭頭位置一致；產品截圖多了操作後箭頭 hover 的既有薄荷色，非版型差異。沒有需要修正的發現，未做額外美術調整。證據 `output/playwright/remove-carousel-{design,product}-{1440,320}.png`。手機為 Chromium 模擬，未宣稱實體裝置驗收。
- install 與原備份／回復包裝腳本 dry-run 通過，目標 `release-SEMi6f/site`；正式套用前核對來源、快照、既有 config 與部署工具 SHA256。產品變更只有移除控制與資產版本，沒有新增套件或更動伺服器。

功能追溯：US-T2／FR-T3 對應移除控制、3 秒與停止行為；FR-T2 對應箭頭、方向鍵及觸控；FR-T4 對應三語／尺寸／reduced-motion；FR-T1／FR-T5 以 Header 與 SEO／Steam 鄰近檢查覆蓋。

## 正式發布結果

2026-11-13 17:59（台灣時間）發布完成，產品 commit `e1d9f4e`，正式 release `20261113-175929-117`。保留前版 `20261113-140708-765`；runtime／config／排程備份為 `C:\ProgramData\AutoKeySite\backups\release-20261113-69d503768c284e4da001459de0aef355`。install／verify 成功，local/public healthy、LOCAL SERVICE、BootTrigger／PT1H、LastTaskResult=0；驗證期間 PID 48952 穩定。其他站台路由比較一致。

- 21 個正式安裝檔及公開 HTTPS 檔案 SHA256 均符合快照，證據 `deploy-result.json`、`public-integrity.json`。
- 6 項正常快取路徑檢查通過：發布前已開啟的 warm client 普通 reload、新開手機訪客，都沒有播放／暫停按鈕、箭頭可用。HTML no-cache 與新 CSS／JS 固定版本正常，沒有停用快取、強制重新整理或隨機 query；證據 `cache-browser.txt`。
- 正式站重跑同一組 30 項產品旅程全部通過，自動輪播實測 3000ms；無 JS 錯誤。已實看手機發布截圖。證據 `public-browser.txt`、`output/playwright/remove-carousel-public-*`。
- 本次沒有重啟整台電腦或額外演練正式服務中斷；既有監控恢復情境由 34 項隔離測試驗證。一般 dist 的歷史 EBUSY 限制不影響本次全新快照發布。
- GitHub dry-run 已通過；交付紀錄提交後依既有流程推送 main，最終遠端 SHA 另以工具輸出及交付回覆核對。沒有 worktree、暫存分支或未整合素材；本次 4193／4192 驗證服務已關閉，output 證據保留且不提交 Git。
