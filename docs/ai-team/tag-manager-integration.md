# 使用者指定 GTM 程式碼

2026-11-13，基線 `a6ab09a`，既有main。推薦工具已完成，此為使用者追加的獨立非視覺變更。依原指示保留 `gtm.js?id=GTM-NC3J5WLL` async標籤，以及dataLayer／gtag／`gtag('js', new Date())`三行初始化；只去除聊天內容中的反斜線與HTML實體轉義。未另加GA4設定、gtm事件、noscript iframe或修改GTM帳戶。

使用者明確授權新增第三方腳本，覆蓋先前治理文件的不追蹤限制。正式HTML新增外部請求；UI設計歷史、推薦網站icon與影片仍為本站副本。本次沒有新畫面，沿用既有視覺驗收；正式公開託管仍需既有部署流程。

## 實作

- `public/index.html`：head頂部、charset之後插入指定程式碼；inline加穩定ID `tag-manager-init` 供檢查。
- `tools/hosting/server.mjs`：export共用CSP，script-src允許self、指定inline的SHA-256、`https://www.googletagmanager.com`；img-src加GTM與實際使用的`https://www.google-analytics.com`，connect-src加GTM、`https://www.google.com`及`https://www.google-analytics.com`。其餘限制保留。
- `tools/serve.mjs`：使用相同CSP，確保本機驗收與正式hosting一致。獨立hosting安裝仍只需要原server.mjs，沒有新增漏包的runtime helper。
- inline SHA-256：`jYHg7tXSuuVUqjy+JeRT8vyG97+Spkw5IFHdQEBbmrw=`。HTML換行正規化後計算，避免Windows CRLF影響；修改inline時需同步hash及測試。
- 不使用unsafe-inline／unsafe-eval、萬用網域或strict-dynamic。容器內現有GA4曾被connect-src阻擋，根據實測補上該精確來源後成功；後續容器新增其他服務需依實際來源評估CSP，未預先放行所有廣告與分析服務。

依據：Google官方[CSP指南](https://developers.google.com/tag-platform/security/guides/csp)，2026-11-13查核，支援nonce或hash授權inline。使用者提供的程式碼不是完整的官方GTM安裝範本；本次照提供內容插入，不把「腳本已載入」宣稱為已驗證所有容器標籤或資料報表。

## 驗證

`tests/tag-manager.mjs`先確認未插入時失敗（0個容器），插入後通過：容器唯一、初始化內容、實際HTTP CSP與inline hash一致，保留object／frame限制。新增GA4來源條件也先失敗再通過。

Chromium實測10項通過，證據 `output/gtm-browser-results.json`：GTM腳本HTTP200、容器全域存在、使用者初始化已執行、GA4 `/g/collect`實際HTTP204且CSP無阻擋；推薦選單、輪播與影片正常。另模擬GTM網路失敗，原有選單及單次示範仍可操作。不以接收端204宣稱GA4後台報表已完成驗收。

第一次瀏覽器檢查太早於GTM容器初始化結束，隨後主控台證明GA4資料傳送被舊CSP擋住；修正範圍限精確Google Analytics來源，改以等待實際collect回應再判定。保留原失敗／修正歷史，未修改使用者提供的程式碼。外部腳本未被複製或改寫。

check、29項語系、13項MP4、4項建置邊界、4項hosting HTTP、新快照逐檔比對及GTM專用測試通過。正式來源預覽4188已重啟採用新政策；公開官網、GTM帳戶／容器設定及GitHub未更新。任務檔案本地提交，測試瀏覽器關閉，交付預覽及證據保留；程序與commit見 `output/preview-process.json`。
