# AutoKey 改版團隊進度

2026-10-22｜web＋docs／medium／standard｜PM 主代理

- R1：使用者已確認；不可重問同一範圍。
- CEO R1：PM 已讀並採用，四項涵蓋 usable，細節見 `redesign-plan.md`。
- P1：完整要求、設計範圍、階段與驗收已記錄；本階段是可操作 HTML 設計，正式 UI 需後續版本確認。
- D1：完整HTML／原創互動場景／三語159則已完成，canonical `design/redesign-v1/`。PM功能覆蓋通過，兩個觸控尺寸缺陷已修正；45格三語／寬度／情境複驗通過。使用者於2026-10-22回覆「確認 D1，依此落地」，批准 `bd7fa98` 的完整畫面與範圍。
- 本輪允許本機設計、驗證與 Git 提交；外部發布未包含。
- 調查提交 `dc91d38`；規劃提交 `d0341b3`；D1設計階段提交 `bd7fa98`。目前進入正式來源整合、設計對照與產品旅程驗證。
- 保留先前任務與既有服務；本次設計預覽 4187，參考庫暫時 4188，驗收後關閉參考庫；設計預覽可保留供使用者確認。
- DoR：R1、事實、CEO、品牌、framework、screen/state、owner 與驗證可用；PM覆蓋與使用者D1確認皆具備，工程DoR通過。
- DoD：設計交付需全範圍渲染／操作、PM coverage、來源與尺寸註記、本機 commit；正式產品 DoD 待工程與正式旅程／設計對照驗收。
- D1驗證限制：真實分頁隱藏在headless環境無法觸發；取消邊界注入及真實pagehide通過。200%以640px等效viewport驗證，未操作原生瀏覽器zoom；這兩項不可宣稱完整端到端通過。詳見 `design/redesign-v1/qa-review.md`。
- 設計階段未修改正式來源；D1批准後已原樣整合`public/`與根`locales/`，沒有推送或替換正式託管快照。正式來源預覽4188、設計4187供檢視，程序資訊在忽略的`output/preview-process.json`。
- 工程：無新框架或依賴；HTML/CSS/app/SVG與D1逐位元一致，三語JSON內容一致。設計師以相同viewport／locale的兩組全頁PNG對照，結果逐位元一致；原視覺修改次數不增加。
- 程式碼獨立審查：product_audit檢查取消／互斥／語言／頁籤／CSP與正式來源，無已證實P1/P2；22個資源／錨點、26個唯一ID、10個輔助標籤目標通過。
- 建置：check、29語系、4boundary、4HTTP與快照逐檔驗證通過；`npm run build`重現既有Windows EBUSY，P1.1決定沿用無新依賴的快照流程。最新成品由`output/hosting-build.json`追蹤；沒有操作安裝腳本或正式服務。
- QA：正式產品旅程及限制保存在`redesign-validation.md`。來源整合與可執行驗證已完成；真實hidden及原生200%仍待可用環境補驗，不能宣稱完整端到端DoD。
