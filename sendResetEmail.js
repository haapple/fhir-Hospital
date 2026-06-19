const nodemailer = require('nodemailer');

// 驗證環境變量
const validateEmailConfig = () => {
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ 缺少郵件配置環境變量: ${missingVars.join(', ')}`);
    console.warn('將使用開發模式（控制台輸出）發送郵件');
    return false;
  }
  
  return true;
};

// 郵件配置
const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
};

// 創建郵件傳輸器
let transporter = null;
let emailConfigured = false;

// 初始化郵件配置
const initEmailTransporter = () => {
  if (validateEmailConfig()) {
    try {
      transporter = nodemailer.createTransport(emailConfig);
      emailConfigured = true;
      
      // 測試連接
      transporter.verify(function (error, success) {
        if (error) {
          console.error('❌ 郵件伺服器連接失敗:', error.message);
          emailConfigured = false;
        } else {
          console.log('✅ 郵件伺服器已就緒，可以發送郵件');
        }
      });
    } catch (error) {
      console.error('❌ 創建郵件傳輸器失敗:', error.message);
      emailConfigured = false;
    }
  }
};

// 立即初始化
initEmailTransporter();

module.exports = async function sendResetEmail(to, resetToken, additionalInfo = {}) {
  const { personName = '', requestIp = '', userAgent = '' } = additionalInfo;
  
  // 生成重置連結
  const frontendBase = process.env.FRONTEND_BASE_URL || 'http://203.64.84.209:3000';
  const resetLink = `${frontendBase}/reset-password.html?token=${resetToken}`;
  
  // 令牌有效期（5分鐘）
  const tokenExpiryMinutes = 5;
  
  // 開發模式：直接輸出到控制台
  if (!emailConfigured) {
    const logInfo = {
      timestamp: new Date().toISOString(),
      to,
      resetLink,
      tokenExpiry: `${tokenExpiryMinutes}分鐘`,
      personName,
      requestIp,
      simulated: true
    };
    
    console.log('═══════════════════════════════════════════════════');
    console.log('📧 [開發模式] 密碼重設郵件模擬');
    console.log('📭 收件人:', to);
    if (personName) console.log('👤 用戶姓名:', personName);
    console.log('🔗 重設連結:', resetLink);
    console.log('⏰ 有效期限:', `${tokenExpiryMinutes} 分鐘`);
    console.log('📱 用戶代理:', userAgent || '未知');
    console.log('🌐 請求IP:', requestIp || '未知');
    console.log('═══════════════════════════════════════════════════');
    
    return { 
      success: true, 
      developmentMode: true, 
      resetLink,
      info: logInfo
    };
  }

  try {
    // 解析 SMTP_FROM 格式
    let fromAddress = process.env.SMTP_USER;
    let fromName = '醫療系統';
    
    if (process.env.SMTP_FROM) {
      if (process.env.SMTP_FROM.includes('<') && process.env.SMTP_FROM.includes('>')) {
        // 格式："名字 <email@example.com>"
        const match = process.env.SMTP_FROM.match(/(.*)<(.*)>/);
        if (match) {
          fromName = match[1].trim();
          fromAddress = match[2].trim();
        }
      } else {
        fromAddress = process.env.SMTP_FROM;
      }
    }

    // 郵件內容
    const mailOptions = {
      from: {
        name: fromName,
        address: fromAddress
      },
      to,
      subject: '密碼重設請求 - 醫療系統',
      html: generateResetEmailHtml(resetLink, tokenExpiryMinutes, personName),
      text: generateResetEmailText(resetLink, tokenExpiryMinutes, personName),
      headers: {
        'X-Reset-Token-ID': resetToken.substring(0, 8)
      }
    };

    // 嘗試發送郵件
    const info = await transporter.sendMail(mailOptions);
    
    // 記錄發送日誌
    const logEntry = {
      timestamp: new Date().toISOString(),
      to,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      personName,
      requestIp
    };
    
    console.log(`✅ 密碼重設郵件已發送到: ${to}`);
    console.log(`📧 訊息ID: ${info.messageId}`);
    console.log(`📊 狀態: ${info.response || '已發送'}`);
    
    return { 
      success: true, 
      messageId: info.messageId, 
      to,
      info: logEntry
    };
    
  } catch (error) {
    console.error('❌ 發送重設郵件失敗:', error.message);
    
    // 記錄錯誤日誌
    const errorLog = {
      timestamp: new Date().toISOString(),
      to,
      error: error.message,
      resetLink // 在錯誤情況下仍然提供連結以便測試
    };
    
    // 如果是開發環境，也輸出連結
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔗 重設連結: ${resetLink}`);
    }
    
    return { 
      success: false, 
      error: error.message, 
      resetLink,
      errorDetails: errorLog,
      developmentMode: true // 確保返回開發模式標記
    };
  }
};

// HTML 郵件模板生成函數
function generateResetEmailHtml(resetLink, expiryMinutes, personName = '') {
  const greeting = personName ? `親愛的 ${personName} 用戶，` : '親愛的用戶，';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .button { width: 100% !important; }
    }
    
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      font-family: 'Microsoft JhengHei', 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333;
    }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
      border-radius: 10px 10px 0 0;
    }
    .content { 
      padding: 30px; 
      background: #ffffff; 
      border-left: 1px solid #e5e7eb;
      border-right: 1px solid #e5e7eb;
    }
    .button { 
      display: inline-block; 
      padding: 14px 28px; 
      background: linear-gradient(135deg, #ff8a65 0%, #ff5252 100%); 
      color: white; 
      text-decoration: none; 
      border-radius: 8px; 
      margin: 20px 0; 
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    .footer { 
      padding: 20px; 
      text-align: center; 
      color: #6b7280; 
      font-size: 14px; 
      background: #f8fafc;
      border-radius: 0 0 10px 10px;
      border-top: 1px solid #e5e7eb;
    }
    .link-box {
      word-break: break-all; 
      color: #2563eb; 
      background: #f1f5f9; 
      padding: 15px; 
      border-radius: 8px;
      font-size: 14px;
      border: 1px dashed #cbd5e1;
      margin: 15px 0;
    }
    .warning {
      color: #dc2626;
      background: #fef2f2;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #dc2626;
      margin: 20px 0;
    }
    .info-box {
      background: #eff6ff;
      border: 1px solid #dbeafe;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏥 醫療系統</div>
      <h1>密碼重設請求</h1>
    </div>
    <div class="content">
      <p>${greeting}</p>
      <p>我們收到您重設密碼的請求。請點擊下面的按鈕來重設您的密碼：</p>
      
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">立即重設密碼</a>
      </div>
      
      <p>如果按鈕無法點擊，請複製以下連結到瀏覽器：</p>
      <div class="link-box">${resetLink}</div>
      
      <div class="warning">
        <p><strong>⚠️ 重要安全提示：</strong></p>
        <ul>
          <li>此連結將在 <strong>${expiryMinutes} 分鐘</strong>後失效</li>
          <li>此連結僅能使用 <strong>一次</strong>，重設後將立即失效</li>
          <li>請勿將此連結分享給任何人</li>
          <li>如果您沒有請求重設密碼，請立即忽略此郵件</li>
        </ul>
      </div>
      
      <div class="info-box">
        <p><strong>💡 安全建議：</strong></p>
        <ul>
          <li>請使用複雜的密碼，包含大小寫字母、數字和特殊符號</li>
          <li>請勿在多個網站使用相同密碼</li>
          <li>定期更換您的密碼以確保帳戶安全</li>
        </ul>
      </div>
      
      <p>如有任何問題，請聯繫系統管理員或客服人員。</p>
    </div>
    <div class="footer">
      <p>此為系統自動發送郵件，請勿直接回覆</p>
      <p>🏥 醫療系統 - 保障您的醫療信息安全</p>
      <p>&copy; ${new Date().getFullYear()} 醫療系統. 版權所有.</p>
      <p style="font-size: 12px; color: #9ca3af;">
        此郵件發送時間: ${new Date().toLocaleString('zh-TW')}
      </p>
    </div>
  </div>
</body>
</html>`;
}

// 純文本郵件生成函數
function generateResetEmailText(resetLink, expiryMinutes, personName = '') {
  const greeting = personName ? `親愛的 ${personName} 用戶：` : '親愛的用戶：';
  
  return `${greeting}

我們收到您重設密碼的請求。請使用以下連結重設您的密碼：

${resetLink}

重要安全提示：
- 此連結將在 ${expiryMinutes} 分鐘後失效
- 此連結僅能使用一次，重設後將立即失效
- 請勿將此連結分享給任何人
- 如果您沒有請求重設密碼，請立即忽略此郵件

安全建議：
- 請使用複雜的密碼，包含大小寫字母、數字和特殊符號
- 請勿在多個網站使用相同密碼
- 定期更換您的密碼以確保帳戶安全

如有任何問題，請聯繫系統管理員或客服人員。

此為系統自動發送郵件，請勿直接回覆

🏥 醫療系統 - 保障您的醫療信息安全
© ${new Date().getFullYear()} 醫療系統. 版權所有.
郵件發送時間: ${new Date().toLocaleString('zh-TW')}`;
}