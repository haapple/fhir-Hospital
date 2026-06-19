# API 完整指南

## 認證端點

### 1. 用戶註冊

```http
POST /api/person/register
Content-Type: application/json
```

**請求體：**
```json
{
  "name": "張醫生",
  "loginId": "dr_zhang",
  "email": "dr.zhang@hospital.com",
  "phone": "0912345678",
  "birthday": "1990-01-15",
  "password": "SecurePass123!"
}
```

**成功回應 (200)：**
```json
{
  "success": true,
  "message": "註冊成功",
  "personId": "Person/12345"
}
```

**錯誤回應 (400)：**
```json
{
  "success": false,
  "error": "此帳號已存在"
}
```

---

### 2. 用戶登入

```http
POST /api/login
Content-Type: application/json
```

**請求體：**
```json
{
  "loginId": "dr_zhang",
  "password": "SecurePass123!"
}
```

**成功回應 (200)：**
```json
{
  "success": true,
  "message": "登入成功",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**錯誤回應 (401)：**
```json
{
  "success": false,
  "error": "帳號或密碼錯誤"
}
```

---

### 3. 忘記密碼

```http
POST /api/forgot-password
Content-Type: application/json
```

**請求體：**
```json
{
  "email": "dr.zhang@hospital.com"
}
```

**成功回應 (200)：**
```json
{
  "success": true,
  "message": "重設密碼連結已發送至您的郵箱"
}
```

---

### 4. 重設密碼

```http
POST /api/reset-password
Content-Type: application/json
```

**請求體：**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass456!"
}
```

---

## 醫護端點

### 5. 獲取用戶角色

```http
GET /api/practitioner/roles
Authorization: Bearer {JWT_TOKEN}
```

**成功回應 (200)：**
```json
[
  {
    "practitionerRoleId": "PractitionerRole/001",
    "practitionerId": "Practitioner/001",
    "organizationId": "Organization/001",
    "organizationName": "台大醫院",
    "jobTitle": "內科醫師",
    "roleType": "doctor"
  },
  {
    "practitionerRoleId": "PractitionerRole/002",
    "practitionerId": "Practitioner/001",
    "organizationId": "Organization/002",
    "organizationName": "新竹分院",
    "jobTitle": "主任",
    "roleType": "doctor"
  }
]
```

---

### 6. 選擇角色

```http
POST /api/practitioner/select-role
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**請求體：**
```json
{
  "organizationId": "Organization/001",
  "practitionerRoleId": "PractitionerRole/001",
  "practitionerId": "Practitioner/001",
  "roleType": "doctor"
}
```

---

## 處方端點

### 7. 創建處方請求（醫師）

```http
POST /api/medication-request
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/fhir+json
```

**請求體（FHIR MedicationRequest）：**
```json
{
  "resourceType": "MedicationRequest",
  "status": "active",
  "intent": "order",
  "subject": {"reference": "Patient/12345"},
  "medication": {"display": "阿司匹林 100mg"},
  "authoredOn": "2024-01-15",
  "requester": {"reference": "Practitioner/001"},
  "dosageInstruction": [
    {
      "text": "每日一次，飯後服用"
    }
  ]
}
```

---

### 8. 查詢處方列表

```http
GET /api/medication-requests?status=active&organization=Organization/001
Authorization: Bearer {JWT_TOKEN}
```

---

## 通知端點

### 9. 獲取通知

```http
GET /api/communications?recipient=Practitioner/001
Authorization: Bearer {JWT_TOKEN}
```

---

### 10. 標記通知為已讀

```http
POST /api/communications/{id}/read
Authorization: Bearer {JWT_TOKEN}
```

---

## 組織端點

### 11. 獲取所有組織

```http
GET /api/organizations
Authorization: Bearer {JWT_TOKEN}
```

**回應：**
```json
[
  {
    "id": "Organization/001",
    "name": "台大醫院",
    "type": "Hospital",
    "partOf": null
  },
  {
    "id": "Organization/002",
    "name": "新竹分院",
    "type": "Hospital",
    "partOf": "Organization/001"
  }
]
```

---

## 錯誤代碼

| 代碼 | 描述 |
|------|------|
| 400 | 請求參數無效 |
| 401 | 未授權（缺少或無效的令牌） |
| 403 | 禁止訪問（無權限） |
| 404 | 資源未找到 |
| 500 | 服務器內部錯誤 |

---

## 身份驗證

所有需要授權的端點都需要在請求頭中提供 JWT 令牌：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

令牌有效期：8 小時

---

## 數據格式

### FHIR 資源

本 API 使用 FHIR R4 標準資源：
- Organization - 組織
- Practitioner - 醫護人員
- Patient - 患者
- MedicationRequest - 處方請求
- Communication - 通知消息

詳見 [FHIR_RESOURCES.md](FHIR_RESOURCES.md)

---

## 分頁

查詢端點支持分頁（如適用）：

```
GET /api/medication-requests?_page=1&_limit=20
```

---

## 常見問題

### Q: 如何刷新令牌？
A: 當令牌即將過期時，重新登入獲取新令牌。

### Q: 如何取消已發送的處方？
A: 使用 `PATCH /api/medication-requests/{id}` 更新狀態為 "cancelled"。

---

最後更新：2024年1月
