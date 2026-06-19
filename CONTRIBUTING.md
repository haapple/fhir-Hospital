# 貢獻指南

感謝你對 FHIR Hospital Management System 的興趣！我們歡迎各種貢獻。

## 行為準則

本項目遵守 [貢獻者行為準則](CODE_OF_CONDUCT.md)。參與本項目即表示你同意遵守此準則。

## 如何貢獻

### 報告錯誤

發現 Bug 嗎？請通過 GitHub Issues 報告，包含：

1. **描述** - 清楚描述 Bug
2. **重現步驟** - 如何重現該問題
3. **預期行為** - 應該發生什麼
4. **實際行為** - 實際發生了什麼
5. **環境信息**
   - Node.js 版本
   - FHIR 服務器版本
   - 操作系統
6. **日誌或堆棧跟蹤**

### 提議功能

想要新功能？請提交 GitHub Issue，說明：

1. **用例** - 為什麼需要此功能
2. **建議方案** - 如何實現
3. **替代方案** - 已考慮的其他方案
4. **相關背景** - 任何相關信息或上下文

### Pull Request 流程

1. **Fork 項目**
   ```bash
   git clone https://github.com/yourusername/fhir-Hospital-main.git
   ```

2. **創建特性分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或錯誤修復
   git checkout -b fix/bug-description
   ```

3. **提交更改**
   ```bash
   git commit -m "簡短清晰的提交消息"
   # 遵循習慣：
   # feat: 新功能
   # fix: 錯誤修復
   # docs: 文檔更新
   # style: 代碼樣式
   # refactor: 代碼重構
   # test: 測試
   # chore: 構建或依賴項更新
   ```

4. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **開啟 Pull Request**
   - 清楚描述更改
   - 連接相關 Issue
   - 提供測試說明
   - 更新相關文檔

### Pull Request 檢查清單

- [ ] 我的代碼遵循項目風格指南
- [ ] 我已更新相關文檔
- [ ] 我已添加測試來覆蓋我的更改
- [ ] 所有新的和現有測試都通過了
- [ ] 我的更改沒有添加新的警告或錯誤

## 代碼風格

### JavaScript/Node.js

```javascript
// ✅ 推薦
async function handleUserRegistration(req, res) {
  const { name, email } = req.body;
  
  try {
    const user = await registerUser(name, email);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

// ❌ 不推薦
function HandleUserRegistration(req,res){
var name=req.body.name;var email=req.body.email;
registerUser(name,email).then(user=>{res.json(user)});
}
```

遵循規則：
- 使用 `const` 和 `let`，避免 `var`
- 使用 async/await 而非回調
- 添加錯誤處理（try/catch）
- 添加註釋解釋複雜邏輯
- 行最大長度：100 字符

### HTML/CSS

```html
<!-- ✅ 推薦 -->
<button class="btn btn-primary" aria-label="登入系統">
  登入
</button>

<!-- ❌ 不推薦 -->
<button onclick="login()" style="background: blue; color: white;">
  登入
</button>
```

### 文檔

- 使用 Markdown 格式
- 保持簡短和清晰
- 為複雜概念提供示例
- 更新相應的 README

## 開發設置

### 本地環境

1. **克隆並安裝**
   ```bash
   git clone https://github.com/yourusername/fhir-Hospital-main.git
   cd fhir-Hospital-main
   npm install
   ```

2. **配置環境**
   ```bash
   cp .env.example .env
   # 編輯 .env 設置本地 FHIR 服務器
   ```

3. **運行開發服務器**
   ```bash
   npm run dev
   ```

4. **進行更改並測試**
   ```bash
   # 修改代碼...
   # 手動測試 API
   curl http://localhost:3000/api/login
   ```

## 測試

```bash
# 運行測試（計劃中）
npm test

# 檢查代碼覆蓋率
npm run coverage
```

## 文檔

- 更新 README.md 如果更改了用戶功能
- 更新 API 文檔如果更改了 API
- 添加代碼註釋以解釋為什麼（而非什麼）
- 為新功能添加示例用法

## 發布流程

1. 更新 `package.json` 中的版本號
2. 更新 `CHANGELOG.md`
3. 創建 GitHub Release
4. 發佈到 npm（如適用）

## 獲取幫助

- **GitHub Issues** - 錯誤報告和功能請求
- **GitHub Discussions** - 一般問題和討論
- **Email** - 發送到 [maintainers email]

## 許可證

通過貢獻，你同意將代碼在 MIT License 下許可。

---

**感謝你的貢獻！** 🙏
