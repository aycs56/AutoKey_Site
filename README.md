# AutoKey 官方介紹網站

此儲存庫只包含官網，與 [AutoKey Windows 程式](https://github.com/aycs56/AutoKey) 分開維護。

| 用途 | 本機目錄 | Git 遠端 |
| --- | --- | --- |
| 官方介紹網站（本專案） | `D:\AutoKey_Site` | `https://github.com/aycs56/AutoKey_Site.git` |
| Windows 桌面程式 | `D:\AutoKey` | `https://github.com/aycs56/AutoKey.git` |

官網提供 English、繁體中文、简体中文：Steam 下載入口、15 秒介紹影片、產品介紹、遊戲採集長壓、滑鼠連點、定時翻頁三種互動示範，以及設定步驟、相容性與常見問題。首屏採集動畫可播放6秒、停止或重播；情境可執行一次或循環。頁內示範不會控制作業系統或遊戲，也不代表特定遊戲已通過相容性測試。

Header「推薦工具」以名稱與官方圖示列出 DesktopPetStudio、R6 REROLL、REROLL Overwatch 2、Game Translation；頁底另有用途說明與輪播。輪播可手動切換、暫停及手機滑動，停留或鍵盤操作時暫停，減少動態偏好預設手動瀏覽。圖示由本站提供，載入首頁不請求這些外部網站。新增功能、素材來源及驗收見 [RT1 紀錄](docs/ai-team/recommendations-plan.md)。

首次依瀏覽器語言順序匹配，無對應使用英文；頂部語言選單立即切換，手選保存於本站 localStorage。切換保留情境與 FAQ 展開，會重設示範並停止播放。瀏覽器禁止儲存時，當次選擇仍有效並顯示提示。JavaScript 停用時保留繁中靜態全文，不顯示無效切換或示範控制。

## 本機使用

需要 Node.js 22 或更新版本，不需要安裝 runtime 套件。在此資料夾開啟終端機：

```powershell
npm.cmd run dev
```

瀏覽 `http://127.0.0.1:4173`。按 Ctrl+C 結束伺服器。Windows 若限制 PowerShell `.ps1`，使用上述 `npm.cmd` 即可，不必修改系統執行原則；其他平台可用 `npm`。

```powershell
npm.cmd run check
npm.cmd run test:localization
npm.cmd run test:boundaries
npm.cmd run build
npm.cmd run preview
```

`build` 只將本站 `public/` 複製至固定 `dist/`，不讀桌面程式目錄。`preview` 以相同位址提供建置成果。可用環境變數 `PORT` 改連接埠。介面、圖示與影片資產由本站提供；另依使用者指定載入Google Tag Manager。可直接開 `public/index.html` 檢視基本內容與互動；GTM與安全政策驗收請用HTTP預覽。

2026-10-22整站改版依使用者確認的[D1設計](docs/ai-team/design/redesign-v1/design-handoff.md)整合。新版結果與環境限制見[改版驗證紀錄](docs/ai-team/redesign-validation.md)；[原版驗收紀錄](docs/ai-team/validation.md)保留歷史，不代表新版驗收。D1 當時每語159則文案，沿用原有29項語系及4項目錄隔離檢查。

若Windows占用`dist/assets`，一般建置可能回報`EBUSY`。本機可繼續預覽`public/`，需要獨立成品時執行`npm.cmd run build:hosting`；它會產生新的快照，實際路徑記在`output/hosting-build.json`。這個命令只建置，不安裝或更新正在運行的網站。

## 結構與維護

- `public/index.html`、`styles.css`、`app.js`：正式頁面、樣式及互動。
- `public/recommendations.css`、`recommendations.js`：推薦工具選單與輪播；四站連結、名稱與用途在HTML，圖片在 `public/assets/recommendations/`。更新時同步根locales的三語說明與控制文字（目前185則／語言）。
- `locales/en.json`、`zh-Hant.json`、`zh-Hans.json`：以繁中來源字串作 msgid 的完整翻譯；更新後執行 `npm.cmd run locales`。dev／build 也會自動更新本機翻譯包 `public/locales.js`。
- `public/i18n-core.js`、`i18n.js`：語言匹配、安全讀寫偏好及全文／輔助標籤切換；只寫入文字，不插入翻譯 HTML。
- `public/assets/`：沿用桌面品牌圖示的獨立副本，以及原創採集場景`mining-scene.svg`；不使用跨專案junction。
- `tools/`：零套件建置／本機伺服器。
- `docs/ai-team/`：需求、UI/UX、資產對照及驗收。
- `output/playwright/`：本機 QA 證據（Git 忽略）。

網站沒有資料提交表單、帳戶或外部字型；本站localStorage只保存語言偏好。2026-11-13依使用者指定加入Google Tag Manager容器 `GTM-NC3J5WLL`，實際標籤與其資料處理由GTM端設定；不再宣稱網站完全無追蹤或cookies。初始化與CSP說明見 [GTM整合紀錄](docs/ai-team/tag-manager-integration.md)，修改後執行 `npm.cmd run test:tag-manager`。桌面31語系與網站3語系分開維護；產品文案仍須核對桌面README的相容性、Steam Cloud與連招狀態。

## GitHub 與網站部署

2026-11-13已部署至 [AutoKey正式網站](https://autokey.desktoppetstudio.com/)，包含Steam入口、介紹影片、三語文案SEO、推薦工具與GTM；推薦輪播每3秒切換。正式發布與快取驗證見[本次發布紀錄](docs/ai-team/release-20261113.md)。

官網的獨立來源儲存庫為 [aycs56/AutoKey_Site](https://github.com/aycs56/AutoKey_Site)。2026-09-26 使用者已授權首次推送官網；後續同步依 [工作規範](工作規範.md) 的已確認流程與當次授權執行，先核對遠端、待送內容與建置結果：

```powershell
git remote -v
git push -u origin main
```

正式網站自 2026-09-30 在這台 Windows 電腦運行：[autokey.desktoppetstudio.com](https://autokey.desktoppetstudio.com/)。Caddy 處理 HTTPS，AutoKey origin 綁定 `127.0.0.1:18181`；正式快照與 Node 安裝在 `C:\ProgramData\AutoKeySite`，不依賴使用者登入或開著終端機。

`AutoKey Site Monitor` 排程在開機後延遲 30 秒啟動，並每小時檢查網站。本站連續三次檢查失敗時，最多嘗試啟動三次；正常時保留原程序。共享 Caddy 保留既有每 5 分鐘復原排程。DNS／網際網路斷線會記錄錯誤並於下次檢查再試，不會無限重啟健康的網站。

更新正式網站先執行 `npm.cmd run build:hosting`，再以管理員執行安裝腳本。完整指令、停止與復原方式見 [本機託管維運](docs/local-hosting.md)。Git 提交、GitHub 推送與本機正式快照部署分開處理；修改原始檔不會直接改動正在運行的正式網站。

AutoKey 的 [Steam 商店](https://store.steampowered.com/app/5331510) 已公開，2026-11-13 查核可購買。首屏、頁首、下載區及 FAQ 的 Steam 入口、指定介紹影片、三語文案與 SEO 已依「請直接開發」整合至正式來源；SD1.1 當時每語171則，加入推薦工具後目前185則。設計與來源對照見 [SD1.1 交接](docs/ai-team/design/steam-download-v1/design-handoff.md)，實測見 [驗收紀錄](docs/ai-team/steam-seo-validation.md)。本次預覽使用 `PORT=4188` 的 `tools/serve.mjs`，網址 `http://127.0.0.1:4188/`；原設計可用 `node tools/design-preview.mjs --steam` 在 4189 重開。

本機與正式伺服器來源已補上 MP4 分段讀取；`npm.cmd run test:media` 驗證一般、區間、尾段、HEAD、非法 Range 與 If-Range 回退。這不會更新正在運行的正式託管快照。網站影片為使用者指定原檔的完整副本，播放前不下載影片內容；不新增外部播放器或追蹤。
