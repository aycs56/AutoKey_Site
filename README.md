# AutoKey 官方介紹網站

此儲存庫只包含官網，與 [AutoKey Windows 程式](https://github.com/aycs56/AutoKey) 分開維護。

| 用途 | 本機目錄 | Git 遠端 |
| --- | --- | --- |
| 官方介紹網站（本專案） | `D:\AutoKey_Site` | `https://github.com/aycs56/AutoKey_Site.git` |
| Windows 桌面程式 | `D:\AutoKey` | `https://github.com/aycs56/AutoKey.git` |

首版為繁體中文靜態網站：產品介紹、頁內按鍵節奏示範、日常工作／遊戲重複操作／格鬥指令拆解、設定步驟與常見問題。頁內示範不會控制作業系統或遊戲。格鬥序列屬解說，桌面程式目前尚未支援依序連招。

## 本機使用

需要 Node.js 22 或更新版本，不需要安裝 runtime 套件。在此資料夾開啟終端機：

```powershell
npm.cmd run dev
```

瀏覽 `http://127.0.0.1:4173`。按 Ctrl+C 結束伺服器。Windows 若限制 PowerShell `.ps1`，使用上述 `npm.cmd` 即可，不必修改系統執行原則；其他平台可用 `npm`。

```powershell
npm.cmd run check
npm.cmd run build
npm.cmd run preview
```

`build` 只將本站 `public/` 複製至固定 `dist/`，不讀桌面程式目錄。`preview` 以相同位址提供建置成果。可用環境變數 `PORT` 改連接埠。所有資產本機自足，可直接開 `public/index.html` 檢視基本內容與互動；正式部署請用靜態 HTTP 主機。

## 結構與維護

- `public/index.html`、`styles.css`、`app.js`：正式頁面、樣式及互動。
- `public/assets/`：沿用桌面品牌圖示的獨立副本；不使用跨專案 junction。
- `tools/`：零套件建置／本機伺服器。
- `docs/ai-team/`：需求、UI/UX、資產對照及驗收。
- `output/playwright/`：本機 QA 證據（Git 忽略）。

網站首版不含追蹤、cookies、表單、帳戶或外部字型。桌面 31 語系不等同於網站已翻譯 31 種語言。發布文案前需同步核對桌面 README，尤其前景／背景相容性、Steam Cloud 與連招序列的實際狀態。

## 未來 GitHub 與網站部署

本輪只建立本機 Git、設定 origin 與提交，未推送網站或發布公開網址。未來先確認遠端為 `https://github.com/aycs56/AutoKey_Site.git`，核對儲存庫權限與內容，再執行：

```powershell
git remote -v
git push -u origin main
```

網站發布可將 `dist/` 交給任意靜態主機；若選 GitHub Pages，需另設定 Pages 部署來源與可見性。所有資源採相對 URL，可放子目錄。GitHub repository 上傳與公開網站是兩個步驟，尚未建立自動公開部署。

Steam 尚未公開商店 URL／下載管道，網站因此不放假商店或下載連結。確定上架後再於取得區塊加入已驗證的商店連結及對應文案。
