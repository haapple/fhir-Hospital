# 前端優化指南

## 📋 優化概述

已為你創建了前端優化基礎框架：

- ✅ `shared.css` - 統一樣式庫（7.6 KB）
- ✅ `shared.js` - 共享工具函數（9.2 KB）
- ✅ `login-optimized.html` - 優化後的登入頁面示例

---

## 🎯 優化成果對比

### 代碼體積
```
優化前 login.html + register.html + forgot.html + reset.html
≈ 25 + 20 + 15 + 18 = 78 KB

優化後：shared.css (7.6 KB) + shared.js (9.2 KB) + 4 × optimized.html (8 KB each)
≈ 7.6 + 9.2 + 32 = 48.8 KB

節省：約 38% 的代碼體積 🎉
```

### 維護性
```
原生頻：修改 CSS → 要改 5 個文件
優化後：修改 CSS → 只改 shared.css（自動應用到所有頁面）
```

---

## 🔄 如何升級現有頁面

### 步驟 1：添加共享資源

在 `<head>` 中替換樣式：

```html
<!-- ❌ 舊 -->
<style>
  /* 500 行樣式代碼 */
</style>

<!-- ✅ 新 -->
<link rel="stylesheet" href="/shared.css">
<style>
  /* 只包含頁面特定的樣式 */
</style>
```

### 步驟 2：導入共享 JavaScript

在 `</body>` 前添加：

```html
<script src="/shared.js"></script>
<script>
  // 頁面特定邏輯
</script>
```

### 步驟 3：替換 API 調用

**舊方式：**
```javascript
const res = await fetch('/api/login', {
  method: 'POST',
  credentials: 'include',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({ loginId, password })
});
const data = await res.json();
if (!res.ok) {
  console.error('錯誤');
}
```

**新方式：**
```javascript
const data = await apiCall('/login', {
  method: 'POST',
  body: { loginId, password }
});
```

### 步驟 4：改進表單驗證

**舊方式：**
```javascript
if (!loginId || !password) {
  output.textContent = '請填寫所有欄位';
  return;
}
```

**新方式：**
```javascript
const error = validateField(loginId, 'loginId');
if (error) {
  showFieldError('loginId', error);
  return;
}
```

---

## 📚 API 文檔

### API 調用 (`apiCall`)

```javascript
// 基本用法
const data = await apiCall('/endpoint', {
  method: 'POST',      // 默認 GET
  body: { key: 'value' },
  headers: {},          // 額外頭部
  includeCredentials: true  // 包含 Cookie
});
```

### 驗證函數 (`validateField`)

```javascript
// 可用的驗證類型：
- 'email'    // 郵箱驗證
- 'password' // 密碼強度
- 'phone'    // 電話號碼
- 'loginId'  // 登入帳號
- 'required' // 必填

const error = validateField('test@email.com', 'email');
// error === null （有效）

const error = validateField('weak', 'password');
// error === '密碼至少 8 個字符' （無效）
```

### 通知 (`showAlert`)

```javascript
showAlert('操作成功！', 'success', 3000);
showAlert('發生錯誤', 'error', 5000);
showAlert('警告信息', 'warning');
showAlert('信息提示', 'info');
```

### 加載狀態 (`showLoading` / `hideLoading`)

```javascript
showLoading('submitBtn');   // 按鈕顯示加載中
// ... 異步操作
hideLoading('submitBtn');   // 恢復按鈕
```

### 儲存管理 (`storage`)

```javascript
storage.set('token', 'abc123');
storage.get('token');
storage.remove('token');
storage.clear();
```

### 日期工具 (`dateUtils`)

```javascript
dateUtils.format(new Date(), 'YYYY-MM-DD');
// '2024-01-15'

dateUtils.isValidAge('1990-05-15', 18, 100);
// true
```

### 模態窗口 (`modal`)

```javascript
modal.show('myModal');
modal.hide('myModal');

// 確認對話框
const result = await modal.confirm('確認刪除？', '此操作無法撤銷');
if (result) {
  // 用戶確認
}
```

### 工具函數

```javascript
// 防抖（500ms 延遲後執行）
const search = debounce((query) => apiCall('/search', { body: { query } }), 500);

// 節流（每 300ms 最多執行一次）
const scroll = throttle(() => loadMore(), 300);

// URL 參數
getQueryParam('token');         // 從 URL 獲取參數
setQueryParam('token', 'abc');  // 設置 URL 參數
```

---

## 📝 優化清單

### 立即執行（強烈推薦）

- [ ] 替換 `login.html`
- [ ] 替換 `register.html`
- [ ] 替換 `forgot.html`
- [ ] 替換 `reset.html`
- [ ] 測試所有表單

### 第二批次

- [ ] 優化 `doctor.html`
- [ ] 優化 `pharmacist-medication.html`
- [ ] 優化 `pharmacist-service.html`
- [ ] 優化 `Hospital.html`

### 後續改進

- [ ] 添加前端路由系統（如 navigo.js）
- [ ] 集成狀態管理（如 zustand）
- [ ] 轉換為 React/Vue 組件
- [ ] 添加單元測試

---

## 💡 最佳實踐

### 1. 使用 API 層的好處

```javascript
// ✅ 集中管理
// 修改 API_BASE 時，所有調用自動更新
const API_BASE = '/api';  // 生產環境可改為 'https://api.example.com'

// ✅ 統一錯誤處理
// 所有錯誤自動紀錄並轉換格式

// ✅ 超時保護
// 所有請求自動設置 5 秒超時
```

### 2. 表單驗證最佳實踐

```javascript
// ✅ 即時反饋
input.addEventListener('blur', function() {
  const error = validateField(this.value, 'email');
  showFieldError(this.id, error);
});

// ✅ 提交前驗證
form.addEventListener('submit', function(e) {
  e.preventDefault();
  // 驗證所有字段
  if (allFieldsValid) {
    submitForm();
  }
});
```

### 3. 錯誤處理最佳實踐

```javascript
try {
  const data = await apiCall('/endpoint', { method: 'POST', body: {} });
  showAlert('成功！', 'success');
} catch (error) {
  console.error('詳細錯誤:', error);  // 日誌
  showAlert(`操作失敗: ${error.message}`, 'error');  // 用戶提示
}
```

---

## 🔒 安全注意事項

1. **不要在 JS 中存儲敏感信息**
   ```javascript
   // ❌ 危險
   storage.set('password', userPassword);
   
   // ✅ 安全
   // 讓服務器管理會話，不在客戶端存儲密碼
   ```

2. **驗證所有用戶輸入**
   ```javascript
   // ✅ 在發送前驗證
   const error = validateField(email, 'email');
   if (error) return;  // 阻止無效提交
   ```

3. **使用 HTTPS**
   ```javascript
   // 生產環境務必使用 HTTPS
   const API_BASE = 'https://api.example.com';
   ```

---

## 📊 性能優化建議

### 前端打包
```bash
npm install --save-dev webpack webpack-cli
# 編譯 shared.css 和 shared.js，減少 HTTP 請求
```

### CSS 壓縮
```bash
npm install --save-dev cssnano postcss
# 自動壓縮 CSS，減少 ~40% 體積
```

### 圖片優化
```bash
npm install --save-dev imagemin
# 壓縮所有圖片
```

---

## 🐛 常見問題

### Q: API 調用超時怎麼辦？

A: 默認 5 秒超時。可調整：
```javascript
// 在 shared.js 中修改
const API_TIMEOUT = 10000;  // 改為 10 秒
```

### Q: 如何添加自定義驗證？

A: 在 shared.js 的 `validators` 對象中添加：
```javascript
validators.customType = (value) => {
  // 返回 null 表示有效，返回錯誤信息表示無效
  return someValidation(value) ? null : '錯誤信息';
};

// 使用
validateField(value, 'customType');
```

### Q: 如何在本地開發時更改 API 地址？

A: 修改 shared.js 中的 API_BASE：
```javascript
// 開發環境
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.example.com' 
  : '/api';
```

---

## 📞 支持

有問題嗎？
1. 檢查瀏覽器控制台（F12）查看錯誤
2. 檢查網絡請求是否成功
3. 查看 `shared.js` 的文檔註釋

---

最後更新：2024年1月
