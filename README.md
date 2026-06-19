# FHIR Hospital Management System (FMMS)

> **一個開源的 FHIR 標準醫療管理平台，為現代醫療機構提供高效的遠距醫療解決方案**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![FHIR](https://img.shields.io/badge/FHIR-R4-blue.svg)](http://hl7.org/fhir/)

## 📖 簡介

FMMS 是一個基於 **FHIR (Fast Healthcare Interoperability Resources)** 標準的醫療管理解決方案。本項目旨在解決醫療機構內部的資源調度與自動化管理問題，特別優化了遠距醫療開藥與配送的數位化流程。

### 🎯 核心功能

#### 醫療資源管理
- ✅ **FHIR 組織架構** - 支援分級醫院體系（總院/分院），利用 OrganizationAffiliation 資源管理機構關聯
- ✅ **醫護人員管理** - 完整的醫師、藥師、病患權限分離流程，通過 PractitionerRole 確保數據安全
- ✅ **患者管理** - 安全的患者檔案和醫療歷史記錄

#### 臨床工作流
- ✅ **遠距開藥系統** - 醫師在線處方開具與患者配對
- ✅ **藥師審核** - 實時處方審查與驗證機制
- ✅ **配送管理** - 醫藥配送流程追蹤
- ✅ **實時通知** - 基於 FHIR Communication 的消息系統

#### 用戶管理
- ✅ **智能認證** - JWT 令牌與會話管理
- ✅ **角色控制** - 基於 PractitionerRole 的權限分級
- ✅ **組織切換** - 多機構場景下的靈活切換

## 🛠️ 技術棧

### 後端
- **Node.js** + **Express** - 輕量級 RESTful API 框架
- **JWT** - 無狀態認證
- **bcryptjs** - 安全密碼管理
- **Nodemailer** - 郵件服務

### 前端
- **HTML5 + Vanilla JavaScript** - 輕量級響應式界面
- **玻璃態 UI** - 現代化漸變設計
- **Fetch API** - 異步請求

### 數據層
- **HAPI FHIR Server** - FHIR 標準醫療數據存儲
- **FHIR R4 Resources** - Organization, Practitioner, Patient, MedicationRequest 等

## 📋 快速開始

### 前置要求
- **Node.js** >= 14.0.0 及 npm
- **HAPI FHIR Server** 或其他 FHIR 兼容服務器
- **SMTP 服務器**（可選，用於郵件重置）

### 安裝步驟

1. **克隆項目**
   ```bash
   git clone https://github.com/yourusername/fhir-Hospital-main.git
   cd fhir-Hospital-main
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **配置環境**
   ```bash
   cp .env.example .env
   # 編輯 .env 文件，設置 FHIR 服務器和 SMTP 配置
   ```

4. **啟動服務器**
   ```bash
   npm start
   # 開發模式：npm run dev
   ```

5. **訪問應用**
   ```
   http://localhost:3000/login.html
   ```

## 📚 API 文檔

### 認證
- `POST /api/login` - 用戶登入
- `POST /api/person/register` - 新用戶註冊
- `POST /api/forgot-password` - 密碼重置

### 醫護
- `GET /api/practitioner/roles` - 獲取用戶角色
- `POST /api/practitioner/select-role` - 選擇角色

### 處方
- `POST /api/medication-request` - 創建處方
- `GET /api/medication-requests` - 查詢處方列表

完整 API 文檔見 [docs/API_GUIDE.md](docs/API_GUIDE.md)

## 🏗️ 項目結構

```
fhir-Hospital-main/
├── app.js                          # 主應用（路由 & 認證）
├── sendResetEmail.js               # 郵件服務
├── package.json                    # NPM 依賴
├── .env.example                    # 環境配置模板
├── LICENSE                         # MIT 許可證
├── README.md                       # 本文件
├── CONTRIBUTING.md                 # 貢獻指南
│
├── public/                         # 前端文件
│   ├── login.html                  # 登入頁面
│   ├── register.html               # 註冊頁面
│   ├── doctor.html                 # 醫師工作台
│   ├── pharmacist-medication.html  # 藥師審核
│   ├── pharmacist-service.html     # 配送管理
│   ├── Hospital.html               # 管理員後台
│   └── ...                         # 其他頁面
│
└── docs/                           # 文檔
    ├── API_GUIDE.md
    ├── FHIR_RESOURCES.md
    └── DEPLOYMENT.md
```

## 🔐 安全特性

- ✅ JWT 認證 - 無狀態會話管理
- ✅ 密碼加密 - bcryptjs 密鑰推導
- ✅ 一次性令牌 - 密碼重置令牌 5 分鐘失效
- ✅ CORS 保護 - 智能來源檢查
- ✅ HttpOnly Cookie - 防止 XSS 攻擊
- ✅ HTTPS 支持 - 生產環境強制加密

## 🚀 部署

### Docker
```bash
docker build -t fhir-hospital .
docker run -p 3000:3000 --env-file .env fhir-hospital
```

### Heroku
```bash
git push heroku main
```

### 其他平台
見 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🤝 貢獻

歡迎提交 Pull Request！請閱讀 [CONTRIBUTING.md](CONTRIBUTING.md) 了解詳情。

## 📄 許可證

本項目採用 **MIT License** - 詳見 [LICENSE](LICENSE) 文件

## 📧 聯繫方式

- 📬 GitHub Issues - 錯誤報告和功能請求
- 💬 GitHub Discussions - 一般問題
- 📧 Email - [your-email@hospital.com]

## 🙏 致謝

- [FHIR 標準](http://hl7.org/fhir/)
- [HAPI FHIR](https://hapifhir.io/)
- [Express.js 社區](https://expressjs.com/)

---

**⭐ 如果這個項目有幫助，請給我們一個 Star！**

版本：0.1.0 (Beta) | 最後更新：2024年1月
