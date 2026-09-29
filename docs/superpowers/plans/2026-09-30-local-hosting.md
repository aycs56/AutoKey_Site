# AutoKey 本機正式託管實作計畫

**Goal:** 在本機提供 https://autokey.desktoppetstudio.com，開機即啟動，每小時檢查，本站失效時最多嘗試重啟三次。

**Architecture:** 沿用共用 Caddy 的 80/443 與自動 TLS，僅增加 AutoKey 到 127.0.0.1:18181 的 route。Node 靜態 origin、監控腳本及網站快照獨立安裝在 C:\ProgramData\AutoKeySite；LOCAL SERVICE 排程有 BootTrigger 與無期限 PT1H。既有共用入口由原有開機與監控排程復原，本站不重啟其他應用。

**Tech Stack:** Node.js 22+、Windows PowerShell 5.1、Task Scheduler、現有 Caddy。

**Spec:** 使用者 2026-09-30 指令及根目錄工作規範.md；A 紀錄 122.116.101.243。

**Design and asset baseline:** 非視覺維運範圍，原 dist 與 public/assets 原樣部署。

**Acceptance and closeout:** 真實 HTTP/HTTPS、排程 XML、正常檢查不換 PID、停止本站 origin 後監控復原、非本站佔用 port 不誤殺。無重開機授權，不實際重開電腦；透過同一 BootTrigger action 手動執行驗收，保留此限制。本機 main 提交，不 push，無 worktree。

## 限制與方案

- 採現有 Caddy 入口；新 Tunnel 需要額外帳戶與 DNS 調整，另開 80/443 會衝突，故不採用。
- 本機非管理員，先完成可審查腳本與 dry-run，安裝時才由 UAC 執行提權。
- 安裝程式不得整份覆蓋其他站台設定；須驗證 candidate、保存 backup、檢查併發變更後 reload，失敗回復。
- 執行檔與腳本唯管理員可寫，LOCAL SERVICE 僅 run 目錄可寫；PID 終止必須核對 executable、server/config 完整路徑與建立時間。
- HTTP 健康檢查需核對服務 ID、必要靜態檔案與 PID；DNS／路由器故障記錄失敗，由下一小時重試，不無限重啟健康 origin。
- 每次檢查與最多三次復原受超時限制，使用檔案鎖避免並行；保留 log 與 status JSON。

## 工作項目

- [x] 寫 `tests/hosting.mjs` 真實 HTTP 測試，確認缺少正式 server 時失敗；實作 `tools/hosting/server.mjs`，驗證內容、HEAD、405、健康狀態與路徑邊界。
- [x] 建立 `tools/hosting/monitor.ps1` 及 `tests/hosting-monitor.ps1`，實測啟動、重入、不誤殺、停止後復原；借用已存在 Game Translation 的監控設計，複製為本站獨立版本，不引用另一專案 runtime。
- [x] 建立 `tools/hosting/install.ps1`，dry-run 顯示固定安裝目錄、埠、任務、最小權限及新增 route。正式安裝確認既有 gateway 開機任務及每 5 分鐘監控（比每小時更頻繁，保留原設定）。
- [x] check、test:localization、test:boundaries、test:hosting、test:hosting:monitor、PowerShell parse 與 Caddy candidate 通過。原 build 遇 EBUSY，改用 build:hosting 新快照並加入逐檔比對測試，原 dist 不刪除。
- [x] 已確認流程及 UAC 安裝完成；本機與網域 HTTPS 成功，LOCAL SERVICE 執行成功，正式停止後恢復到新 PID。另兩站原 route 保留且 HTTPS 可回應；Game Translation 的主機端一般 DNS 失敗另記錄，沒有修改該網域。
- [x] README、維運文件與證據已同步；本機 main 上檢查 diff 並提交本輪指定檔案，未 push。

## 交付證據

- 開始基準：main `171c49d`，原工作樹乾淨；全程在原目錄實作，沒有 worktree。
- `C:\ProgramData\AutoKeySite\verification.json`：LOCAL SERVICE、BootTrigger/PT1H、LastTaskResult=0、publicHealthy=true；實際復原 PID 25696→39212，健康檢查保留 PID。
- `C:\ProgramData\AutoKeySite\run\status.json`：00:20:21 的排程自動觸發已再度成功，距初始安裝一分鐘，之後每小時重複。
- 原預覽因失敗 build 移除的 app.js 已從 public 補回；未刪除原 dist/assets。測試程序均結束，output 留作本機 QA／建置證據。
- 未實際重開電腦；以同一排程 action 及設定讀回驗證。更多限制見 `docs/local-hosting.md`。
