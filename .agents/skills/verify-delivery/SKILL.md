---
name: verify-delivery
description: >-
  改動範圍檢驗與防迴歸守衛。在每次交付或準備 commit/push 前，比對需求確認修改範疇無外溢、稽核核心環境變數與安全契約無單點故障、驗證 TypeScript 型別與建置完整性，並執行五大核心旅程冒煙檢查。
---

# 小組手帳交付驗證與防迴歸守衛 Skill (Delivery Guard)

本技能用於**每次程式碼改動完成、向使用者提出 commit / push 之前**的自動化把關，確保改動嚴格限制在需求範圍內，並杜絕關鍵功能因非預期副作用而默默癱瘓。

---

## 執行流程 (SOP)

### 步驟 1：執行自動化交付驗證腳本
在終端機執行：
```powershell
node scripts/verify-delivery.mjs
```
此腳本會自動完成：
1. **Git 狀態與改動清單盤點**：列出所有 modified / added 檔案。
2. **TypeScript 嚴格型別檢查與生產打包**：執行 `npm.cmd run build`，確保 0 錯誤。
3. **打包產物常數合約稽核**：檢查 `dist/assets` 中的主 JS 檔案，確保管理員身分判定具備兜底保障（Fallback）、無空字串癱瘓風險，且無私鑰洩漏。

---

### 步驟 2：改動範圍審核 (Scope Containment)
手動比對使用者本次明確同意的範圍與 `git diff`：
1. **確認檔案無外溢**：確認動到的檔案皆為本次需求所必需，絕無偷渡無關改動。
2. **保護敏感檔案**：確認未產生 `.env`、`firestore.rules` 等應被 `.gitignore` 排除之檔案的未追蹤變更。

---

### 步驟 3：五大核心功能冒煙檢查清單 (Smoke Test Matrix)
依本次改動所牽涉的模組，快速進行心理演練或畫面確認：

| 核心模組 | 關鍵驗證項目 |
|---|---|
| **1. 提案板 (Proposals)** | 卡片列表正常渲染、協同編輯彈窗可存檔、愛心計票即時更新 |
| **2. 活動紀錄 (Records)** | 拍立得照片牆載入、Storage 圖檔直傳、共用素材外部連結 |
| **3. 日常動態 (Updates)** | 動態時間流呈現、文字與附圖發佈 |
| **4. 功能許願池 (Wishes)** | 願望卡片列表、+1 集氣按鈕、管理員狀態更新彈窗（狀態/備註/版本號） |
| **5. 門禁與管理 (Gatekeeper & Admin)** | Google 登入狀態辨識、**「成員審核」按鈕正常顯示**、申請者核准/拒絕操作正常、Firestore Rules 權限無阻擋 |

---

### 步驟 4：產出交付驗證報告並暫停請示
完成以上步驟後，在聊天室向使用者彙報改動摘要（Diff）與檢驗結果，並依據 [GEMINI.md](file:///d:/projects/river_tree_web/GEMINI.md) 核心紀律：
> **主動暫停動作，獲得使用者明確同意後，才執行 `git commit` 與 `git push`**。

