# AutoKey 改版團隊進度

2026-10-22｜web＋docs／medium／standard｜PM 主代理

- R1：使用者已確認；不可重問同一範圍。
- CEO R1：PM 已讀並採用，四項涵蓋 usable，細節見 `redesign-plan.md`。
- P1：完整要求、設計範圍、階段與驗收已記錄；本階段是可操作 HTML 設計，正式 UI 需後續版本確認。
- D1：完整HTML／原創互動場景／三語159則已完成，canonical `design/redesign-v1/`。PM功能覆蓋通過，兩個觸控尺寸缺陷已修正；45格三語／寬度／情境複驗通過。只一個方向；沒有使用者視覺批准。
- 本輪允許本機設計、驗證與 Git 提交；外部發布未包含。
- 調查提交 `dc91d38`；規劃提交 `d0341b3`；D1設計階段commit由Git與交付紀錄追蹤。
- 保留先前任務與既有服務；本次設計預覽 4187，參考庫暫時 4188，驗收後關閉參考庫；設計預覽可保留供使用者確認。
- DoR：R1、事實、CEO、品牌、framework、screen/state、owner 與驗證可用。工程 DoR 尚缺使用者 D1 確認。
- DoD：設計交付需全範圍渲染／操作、PM coverage、來源與尺寸註記、本機 commit；正式產品 DoD 待工程與正式旅程／設計對照驗收。
- D1驗證限制：真實分頁隱藏在headless環境無法觸發；取消邊界注入及真實pagehide通過。200%以640px等效viewport驗證，未操作原生瀏覽器zoom；這兩項不可宣稱完整端到端通過。詳見 `design/redesign-v1/qa-review.md`。
- 本階段沒有修改正式 `public/`、根`locales/`，沒有推送或替換正式託管快照。設計預覽保留4187供檢視，程序資訊在忽略的 `output/preview-process.json`。
