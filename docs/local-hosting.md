# AutoKey 本機託管

2026-09-30 安裝完成。網址：https://autokey.desktoppetstudio.com/ 。A 紀錄由使用者管理，當次為 `122.116.101.243`。

## 運行方式

| 項目 | 設定 |
| --- | --- |
| HTTPS 入口 | 既有 `D:\台股AI\caddy\Caddyfile`；僅新增 `BEGIN AUTOKEY SITE` 區段 |
| 本機 origin | `http://127.0.0.1:18181`，僅 loopback |
| 正式目錄 | `C:\ProgramData\AutoKeySite`；app、bin、releases 由管理員維護 |
| Windows 任務 | `AutoKey Site Monitor`，LOCAL SERVICE，不需登入 |
| 觸發 | BootTrigger 延遲 30 秒、TimeTrigger 每小時（PT1H、無到期日）、錯過可用時補執行 |
| 復原 | 三次健康取樣失敗，最多啟動三次；比對 Node 路徑、server/config 命令及程序建立時間後才終止程序 |
| 執行限制 | 任務不重疊、檔案鎖、最長 5 分鐘、允許電池供電執行；不變更電腦睡眠設定 |
| 共用 Caddy | 原有 SYSTEM 開機任務及每 5 分鐘監控；本站排程不直接終止共用入口 |
| 記錄 | `run\monitor.log`（超過 1 MB 輪替）、`run\status.json`、`run\process.json`；stdout/stderr 保留上一份 |

`/healthz` 檢查主頁、樣式、腳本、翻譯包與圖示是否存在且非空，回傳本站 ID、PID 及 URL。正常检查不會重啟 origin；未知程序佔用埠時失敗並保留它。公開 HTTPS 不通但 origin 健康時記錄失敗（exit 2），由共用入口監控及下一次檢查處理；DNS 或上游網路需恢復連線後才可正常服務。

## 更新與驗證

在 `D:\AutoKey_Site` 執行：

```powershell
npm.cmd run check
npm.cmd run test:localization
npm.cmd run test:boundaries
npm.cmd run test:hosting
npm.cmd run test:hosting:monitor
npm.cmd run build:hosting
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\hosting\install.ps1 -NodeExe (Get-Command node.exe).Source -GatewayRoot 'D:\台股AI' -DryRun
```

`build:hosting` 將完整 public 複製至全新 `output\hosting-builds\release-*\site`，以 `output\hosting-build.json` 記錄路徑；不刪除先前建置。安裝器再複製至受保護的 releases。程式、腳本及設定只允許管理員／SYSTEM 寫入，LOCAL SERVICE 只可修改 run 目錄。

檢查 dry-run 後，在系統管理員 PowerShell 執行：

```powershell
Set-Location D:\AutoKey_Site
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\hosting\install.ps1 -NodeExe (Get-Command node.exe).Source -GatewayRoot 'D:\台股AI'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\tools\hosting\verify.ps1
```

需實際演練中斷時，給 verify 加上 `-ExerciseRecovery`：它會短暫停止本站 origin，啟動同一排程 action，確認新 PID 健康、HTTPS 成功及正常檢查不重啟。一般健康查看不加此參數。

```powershell
Invoke-RestMethod https://autokey.desktoppetstudio.com/healthz
Get-Content C:\ProgramData\AutoKeySite\run\status.json
```

一般權限可能看不到服務帳號的排程；檢視／手動啟動任務需管理員 PowerShell。安裝結果、XML 及驗證結果分別為 `install-result.json`、`installed-task.xml`、`verification.json`。

## 停止與復原

管理員 PowerShell 停止本站：

```powershell
Disable-ScheduledTask -TaskName 'AutoKey Site Monitor'
Stop-ScheduledTask -TaskName 'AutoKey Site Monitor'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\ProgramData\AutoKeySite\app\monitor.ps1 -Config C:\ProgramData\AutoKeySite\config.json -Stop
```

恢復執行：

```powershell
Enable-ScheduledTask -TaskName 'AutoKey Site Monitor'
Start-ScheduledTask -TaskName 'AutoKey Site Monitor'
```

安裝前保存 Caddyfile 至 backups；候選驗證與併發修改檢查通過後才 reload，reload 失敗自動回復原設定。若之後需要撤銷本站公開入口，只移除 `BEGIN/END AUTOKEY SITE` 區段並 validate/reload，不可用舊完整備份覆蓋後來新增的其他站台。保留 releases 與 config 備份；版本回復應在停止本站後選取對應快照，再重啟驗證。安裝未完成時先查看 `install-result.json`，修正原因後重新執行，不盲目重試。

## 只修復監控程式

2026-10-24 的 502 來自 origin 未啟動，且 `run/process.json` 的 76 個位元組全部為零值，讓每次監控都在 JSON 解析時退出。記錄自 10 月 2 日起出現此錯誤；檔案損毀本身的原因無法由現有證據判定。

`tools/hosting/monitor.ps1` 現在驗證 PID 與程序建立時間。若狀態檔不是有效記錄，將原檔移至 `process.json.invalid-<唯一識別碼>` 保存，且不以該記錄終止程序。只有連接埠沒有其他 listener 才可繼續啟動；健康 origin、其他 Node 程序及佔用埠的服務均保留。34 項實際監控測試涵蓋零值、空檔、截斷 JSON、缺少／無效時間與外部程序保護。

這類維運只替換已驗證的 monitor，不執行完整安裝器，也不更新網頁快照。管理員操作前先保留 `run/process.json`、`status.json` 與 `monitor.log`，確認安裝標記為 `autokey-site`、正式 config 與來源 hash 正確、排程為 LOCAL SERVICE 且未執行中。鎖住 `run/monitor.lock`，備份正式 monitor 至 `backups`，複製並比對修正檔，再釋放鎖並啟動原排程：

```powershell
Start-ScheduledTask -TaskName 'AutoKey Site Monitor'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File D:\AutoKey_Site\tools\hosting\verify.ps1
```

確認 BootTrigger、PT1H、LastTaskResult=0、local/public health、健康 PID 保持及公開首頁／資產內容。失敗則回復剛備份的 monitor，啟動原排程並保留錯誤；不覆寫其他站台、正式 config 或版本內容。當次執行檔及驗證證據存於 `output/hosting-repair-20261024/`，透過 `repair.ps1 -DryRun` 可檢視固定路徑與 hash，實際套用需 Windows UAC。

2026-10-24 05:28（台灣時間）已完成正式修復：原損毀檔隔離保留，排程首次嘗試即啟動 PID 30064，local/public health 均成功；後續檢查保留同一 PID，LastTaskResult=0，開機與每小時觸發設定讀回正確。安裝監控與修正來源 SHA256 相同，config、server、正式首頁、Caddyfile 與排程 XML 皆維持原值。公開首頁及 8 個資產皆為 HTTP 200 且逐檔符合正式快照；headless 瀏覽器載入首頁、執行「試跑一次」顯示「已完成一次示範」，console 無錯誤或警告。截圖為 `output/playwright/hosting-repair-20261024.png`；測試 origin 與本次瀏覽器均已關閉。這次未進行整機重開測試。

## 本次驗證與限制

- 29 項語系、4 項建置邊界、4 項正式 HTTP、快照逐檔內容比對與 12 項實際監控測試通過。
- LOCAL SERVICE 任務執行成功（LastTaskResult=0）；BootTrigger、PT1H、主機端正常 DNS/HTTPS 與憑證驗證通過。
- 正式復原演練：PID 25696 停止後，排程啟動 PID 39212 並恢復 HTTPS；後續正常檢查保留 39212。主頁下載後 SHA256 與 public/index.html 相同。
- AI 站台健康檢查通過；Game Translation 經本機 SNI/HTTPS 及原 route 檢查通過，其一般 DNS 在當次主機查詢失敗，本站操作沒有變更其 DNS。
- 本次沒有真的重新啟動電腦；以排程讀回與同一 action 的實際執行驗證。電腦關機、睡眠或上游網路中斷期間無法提供外部服務。
- 原 `npm.cmd run build` 當次在刪除 `dist/assets` 時發生 Windows EBUSY；額外清除動作遭自動審核拒絕，沒有重試刪除。改採全新正式快照並逐檔驗證；舊預覽中被失敗建置移除的 app.js 已從 public 補回，其他原檔保留。
- QA 輸出與快照保留在 Git 忽略的 output 作為本機證據；測試程序皆已停止。未建立 worktree，未推送 GitHub。

官方參考：[Windows 排程觸發器](https://learn.microsoft.com/en-us/powershell/module/scheduledtasks/new-scheduledtasktrigger)、[Caddy reload/validate](https://caddyserver.com/docs/command-line)。
