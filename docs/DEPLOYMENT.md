# 部署指南

本指南涵蓋將 FHIR Hospital Management System 部署到各種環境的步驟。

## 目錄
- [本地開發](#本地開發)
- [Docker 部署](#docker-部署)
- [Heroku 部署](#heroku-部署)
- [生產環境配置](#生產環境配置)
- [故障排除](#故障排除)

---

## 本地開發

### 快速開始

```bash
# 1. 克隆項目
git clone https://github.com/yourusername/fhir-Hospital-main.git
cd fhir-Hospital-main

# 2. 安裝依賴
npm install

# 3. 配置環境
cp .env.example .env
# 編輯 .env 文件

# 4. 啟動開發服務器
npm run dev
```

### 預期輸出

```
✅ 服務器運行於 http://localhost:3000
✅ FHIR 連接已測試
✅ 郵件服務已初始化
```

---

## Docker 部署

### 1. 創建 Dockerfile

在項目根目錄創建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 複製 package 文件
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製應用代碼
COPY . .

# 暴露端口
EXPOSE 3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 啟動應用
CMD ["npm", "start"]
```

### 2. 創建 .dockerignore

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.production
README.md
docs
```

### 3. 構建和運行

```bash
# 構建鏡像
docker build -t fhir-hospital:latest .

# 運行容器
docker run -d \
  --name fhir-hospital \
  -p 3000:3000 \
  --env-file .env \
  fhir-hospital:latest

# 查看日誌
docker logs -f fhir-hospital
```

### 4. Docker Compose

創建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FHIR_BASE=${FHIR_BASE}
      - JWT_SECRET=${JWT_SECRET}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${SMTP_PASS}
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  fhir:
    image: hapiproject/hapi:latest
    ports:
      - "8080:8080"
    environment:
      - server.port=8080
    restart: always
```

運行：
```bash
docker-compose up -d
```

---

## Heroku 部署

### 1. 準備 Heroku CLI

```bash
# 安裝 Heroku CLI
# macOS: brew tap heroku/brew && brew install heroku
# Windows: choco install heroku-cli
# Linux: snap install heroku --classic

# 登入
heroku login
```

### 2. 創建 Heroku 應用

```bash
heroku create fhir-hospital-app
```

### 3. 設置環境變量

```bash
heroku config:set FHIR_BASE=http://your-fhir-server:8080/fhir
heroku config:set JWT_SECRET=your_secure_secret
heroku config:set NODE_ENV=production
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
# ... 設置其他變量
```

### 4. 部署

```bash
# 使用 Git 部署
git push heroku main

# 查看日誌
heroku logs --tail
```

---

## AWS 部署

### 1. 使用 Elastic Beanstalk

```bash
# 安裝 EB CLI
pip install awsebcli

# 初始化
eb init -p node.js-18 fhir-hospital

# 創建環境
eb create fhir-hospital-env

# 部署
eb deploy

# 查看狀態
eb status
```

### 2. 設置環境變量

```bash
eb setenv FHIR_BASE=... JWT_SECRET=... ...
```

---

## Google Cloud Platform

### 1. 使用 Cloud Run

```bash
# 構建鏡像
gcloud builds submit --tag gcr.io/PROJECT_ID/fhir-hospital

# 部署到 Cloud Run
gcloud run deploy fhir-hospital \
  --image gcr.io/PROJECT_ID/fhir-hospital \
  --platform managed \
  --region us-central1 \
  --set-env-vars FHIR_BASE=...
```

---

## 生產環境配置

### 性能優化

1. **啟用 gzip 壓縮**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **使用 Redis 做緩存**
   ```javascript
   const redis = require('redis');
   const client = redis.createClient();
   ```

3. **CDN 配置**
   - 使用 Cloudflare 或 AWS CloudFront
   - 為靜態文件設置緩存頭

### 安全加固

1. **HTTPS 強制**
   ```javascript
   app.use((req, res, next) => {
     if (req.header('x-forwarded-proto') !== 'https') {
       res.redirect(`https://${req.header('host')}${req.url}`);
     } else {
       next();
     }
   });
   ```

2. **安全頭**
   ```bash
   npm install helmet
   ```
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

3. **速率限制**
   ```bash
   npm install express-rate-limit
   ```

### 監控和日誌

1. **應用監控**
   - New Relic
   - Datadog
   - CloudWatch

2. **日誌收集**
   - ELK Stack
   - CloudWatch Logs
   - Papertrail

### 數據庫備份

```bash
# 定期備份 FHIR 服務器
0 2 * * * /scripts/backup-fhir.sh
```

---

## 故障排除

### 問題：連接到 FHIR 服務器失敗

**解決方案：**
1. 檢查 `FHIR_BASE` 環境變量
2. 驗證 FHIR 服務器是否在線
3. 檢查防火牆設置
4. 查看日誌文件

```bash
curl -v http://your-fhir-server:8080/fhir/metadata
```

### 問題：郵件無法發送

**解決方案：**
1. 驗證 SMTP 配置
2. 檢查防火牆是否允許 SMTP 端口
3. 檢查應用密碼設置（如使用 Gmail）
4. 查看 `sendResetEmail.js` 日誌

### 問題：內存泄漏

**檢查方法：**
```bash
# 監控內存使用
ps aux | grep node

# 使用 clinic.js 診斷
npm install -g clinic
clinic doctor -- npm start
```

---

## 檢查清單

- [ ] `.env` 文件已配置
- [ ] FHIR 服務器已就緒
- [ ] SMTP 配置已驗證
- [ ] SSL 證書已安裝
- [ ] 備份策略已制定
- [ ] 監控系統已配置
- [ ] 日誌收集已啟用
- [ ] 負載測試已執行

---

## 聯繫支持

如有部署問題，請：
1. 檢查日誌文件
2. 查看文檔
3. 提交 GitHub Issue

---

最後更新：2024年1月
