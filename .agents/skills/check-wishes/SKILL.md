---
name: check-wishes
description: >-
  檢索小組手帳功能許願池的即時資料，分析組員提出的需求、熱門集氣程度與技術實現難度，並引導願望生命週期（待評估 -> 實現中 -> 已實現）。
---

# 小組手帳功能許願池檢索與生命週期管理 Skill

當使用者詢問「檢查許願池」、「看大家許了什麼願」、「有沒有新功能需求」或執行相關指令時，啟動此技能。

## 執行流程 (SOP)

### 步驟 1：檢索最新願望資料
執行本地端查詢腳本：
```powershell
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User"); node scripts/check-wishes.mjs
```

### 步驟 2：產出需求分析報告
依檢索結果向使用者彙報，格式包含：
1. **願望清單總覽**：標題、提案人、集氣票數 (Likes)、當前狀態 (`pending` / `in_progress` / `completed`)。
2. **需求剖析**：組員的核心痛點與預期使用情境。
3. **技術複雜度評級**：
   - **S (小)**：單純前端 UI 微調、CSS 樣式改進。
   - **M (中)**：涉及 React 組件狀態重構、Firestore 欄位新增或資料結構調整。
   - **L (大)**：涉及後端服務、全新驗證邏輯或第三方外部 API 串接。
4. **版本規劃 (Semantic Versioning)**：建議對應的發佈版本號（如 `v1.1.0`）。

### 步驟 3：狀態流轉與發布追蹤 (Wish Lifecycle)
當與使用者決策推進某個願望時，遵循以下生命週期：
1. **決定開發**：將狀態標記為 `in_progress`（實現中），向小組透明化正在排入開發。
2. **實作與驗證**：編寫代碼，執行 `npm run build` 嚴格通過型別檢查。
3. **發布交付 (`completed`)**：
   - 在專案 `package.json` 更新版本號（如從 `1.0.0` 升級至 `1.1.0`）。
   - 記錄此願望對應的 **功能改動摘要 (Change Summary / Release Notes)** 與 **版本標籤 (Version Tag)**。
   - 保留該願望的留言討論區，讓組員在功能上線後持續反饋使用體驗。
