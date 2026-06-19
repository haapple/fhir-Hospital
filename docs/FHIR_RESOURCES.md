# FHIR 資源說明

本項目使用以下 FHIR R4 資源来管理醫療數據：

## 1. Organization (組織)

表示醫療機構（醫院、診所等）

### 主要字段
- `id` - 資源唯一標識
- `name` - 組織名稱（如：台大醫院）
- `type` - 組織類型（Hospital, Clinic 等）
- `partOf` - 父組織引用（用於分院結構）

### 示例
```json
{
  "resourceType": "Organization",
  "id": "Organization/001",
  "name": "台大醫院",
  "type": "Hospital",
  "partOf": null,
  "telecom": [
    {
      "system": "phone",
      "value": "02-23123456"
    }
  ]
}
```

---

## 2. Practitioner (醫護人員)

表示醫生、護士、藥師等醫療專業人員

### 主要字段
- `id` - 資源唯一標識
- `name` - 人員名稱
- `telecom` - 聯繫方式
- `identifier` - 身份標識（如執業執照號）

### 示例
```json
{
  "resourceType": "Practitioner",
  "id": "Practitioner/001",
  "name": [
    {
      "text": "張醫生"
    }
  ],
  "telecom": [
    {
      "system": "email",
      "value": "dr.zhang@hospital.com"
    }
  ]
}
```

---

## 3. PractitionerRole (醫護角色)

連接 Practitioner 與 Organization，定義其工作角色和權限

### 主要字段
- `id` - 資源唯一標識
- `practitioner` - 引用 Practitioner
- `organization` - 引用 Organization
- `code` - 角色代碼（doctor, nurse, pharmacist 等）
- `specialty` - 專科（內科、外科等）

### 示例
```json
{
  "resourceType": "PractitionerRole",
  "id": "PractitionerRole/001",
  "practitioner": {
    "reference": "Practitioner/001"
  },
  "organization": {
    "reference": "Organization/001"
  },
  "code": [
    {
      "coding": [
        {
          "system": "http://snomed.info/sct",
          "code": "17561000",
          "display": "Cardiologist"
        }
      ]
    }
  ],
  "specialty": [
    {
      "text": "心臟科"
    }
  ]
}
```

---

## 4. Patient (患者)

表示患者基本信息

### 主要字段
- `id` - 資源唯一標識
- `name` - 患者名稱
- `birthDate` - 出生日期
- `telecom` - 聯繫方式
- `identifier` - 身份證號等標識

### 示例
```json
{
  "resourceType": "Patient",
  "id": "Patient/001",
  "name": [
    {
      "text": "王患者"
    }
  ],
  "birthDate": "1980-05-15",
  "telecom": [
    {
      "system": "phone",
      "value": "0912345678"
    }
  ],
  "identifier": [
    {
      "system": "http://example.org/fhir/patient-id",
      "value": "12345678"
    }
  ]
}
```

---

## 5. MedicationRequest (處方請求)

表示醫生開具的藥物處方

### 主要字段
- `id` - 資源唯一標識
- `status` - 狀態（active, cancelled, completed）
- `intent` - 意圖（order, proposal）
- `subject` - 患者引用
- `medication` - 藥物信息
- `requester` - 開具醫生引用
- `authoredOn` - 開具日期
- `dosageInstruction` - 用法用量

### 示例
```json
{
  "resourceType": "MedicationRequest",
  "id": "MedicationRequest/001",
  "status": "active",
  "intent": "order",
  "subject": {
    "reference": "Patient/001",
    "display": "王患者"
  },
  "medication": {
    "display": "阿司匹林 100mg"
  },
  "requester": {
    "reference": "Practitioner/001",
    "display": "張醫生"
  },
  "authoredOn": "2024-01-15",
  "dosageInstruction": [
    {
      "text": "每日一次，飯後服用",
      "timing": {
        "repeat": {
          "frequency": 1,
          "period": 1,
          "periodUnit": "d"
        }
      },
      "doseAndRate": [
        {
          "doseQuantity": {
            "value": 1,
            "unit": "tablet"
          }
        }
      ]
    }
  ]
}
```

---

## 6. Communication (通知)

表示系統內的消息和通知

### 主要字段
- `id` - 資源唯一標識
- `status` - 狀態（preparation, in-progress, completed）
- `subject` - 關聯主題
- `sent` - 發送時間
- `sender` - 發送者
- `recipient` - 接收者
- `payload` - 消息內容

### 示例
```json
{
  "resourceType": "Communication",
  "id": "Communication/001",
  "status": "completed",
  "subject": {
    "reference": "MedicationRequest/001"
  },
  "sent": "2024-01-15T10:30:00Z",
  "sender": {
    "reference": "Practitioner/001",
    "display": "張醫生"
  },
  "recipient": [
    {
      "reference": "Practitioner/002",
      "display": "李藥師"
    }
  ],
  "payload": [
    {
      "contentString": "處方 MedicationRequest/001 已準備審核"
    }
  ]
}
```

---

## 7. ServiceRequest (服務請求)

表示配送、檢驗等服務請求

### 主要字段
- `id` - 資源唯一標識
- `status` - 狀態
- `code` - 服務代碼
- `subject` - 服務對象
- `requester` - 請求者

### 示例
```json
{
  "resourceType": "ServiceRequest",
  "id": "ServiceRequest/001",
  "status": "in-progress",
  "code": {
    "text": "藥物配送"
  },
  "subject": {
    "reference": "Patient/001"
  },
  "requester": {
    "reference": "Organization/001"
  }
}
```

---

## 資源關係圖

```
Organization
    ├── Practitioner
    │   └── PractitionerRole
    │
    └── Patient
        ├── MedicationRequest (由 Practitioner 開具)
        │   └── Communication (通知 Practitioner)
        │
        └── ServiceRequest (配送請求)
```

---

## 代碼系統

本項目使用以下代碼系統：

### 角色代碼
- `doctor` - 醫生
- `pharmacist` - 藥師
- `nurse` - 護士
- `admin` - 管理員

### 處方狀態
- `active` - 有效
- `on-hold` - 暫停
- `cancelled` - 取消
- `completed` - 完成
- `entered-in-error` - 錯誤

---

## 參考資源

- [FHIR R4 官方文檔](http://hl7.org/fhir/)
- [HAPI FHIR 實現指南](https://hapifhir.io/hapi-fhir/)

---

最後更新：2024年1月
