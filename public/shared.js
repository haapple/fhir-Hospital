/* ============================================
   FHIR Hospital - 共享 JavaScript 工具函數
   ============================================ */

// --- API 基礎配置 ---
const API_BASE = '/api';
const API_TIMEOUT = 5000;

// --- API 統一調用函數 ---
async function apiCall(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    includeCredentials = true
  } = options;

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (includeCredentials) {
    config.credentials = 'include';
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...config,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API 錯誤 [${method} ${endpoint}]:`, error);
    throw error;
  }
}

// --- 表單驗證 ---
const validators = {
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : '無效的郵箱地址';
  },

  password: (value) => {
    if (value.length < 8) return '密碼至少 8 個字符';
    if (!/[A-Z]/.test(value)) return '需包含大寫字母';
    if (!/[0-9]/.test(value)) return '需包含數字';
    return null;
  },

  phone: (value) => {
    const regex = /^[\d\s\-\+\(\)]{10,}$/;
    return regex.test(value) ? null : '無效的電話號碼';
  },

  loginId: (value) => {
    if (value.length < 3) return '帳號至少 3 個字符';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return '只能包含字母、數字和下劃線';
    return null;
  },

  required: (value) => {
    return value && value.trim() ? null : '此欄位必填';
  }
};

function validateField(value, validationType) {
  if (!validators[validationType]) {
    console.warn(`未知的驗證類型: ${validationType}`);
    return null;
  }
  return validators[validationType](value);
}

function showFieldError(fieldId, error) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  const errorEl = document.querySelector(`#${fieldId}-error`);
  if (error) {
    field.classList.add('is-invalid');
    if (errorEl) {
      errorEl.textContent = error;
      errorEl.style.display = 'block';
    }
  } else {
    field.classList.remove('is-invalid');
    if (errorEl) {
      errorEl.style.display = 'none';
    }
  }
}

// --- 通知管理 ---
function showAlert(message, type = 'info', duration = 3000) {
  const alertId = `alert-${Date.now()}`;
  const alertElement = document.createElement('div');
  alertElement.id = alertId;
  alertElement.className = `alert alert-${type}`;
  alertElement.textContent = message;
  alertElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 400px;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(alertElement);

  if (duration > 0) {
    setTimeout(() => {
      alertElement.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => alertElement.remove(), 300);
    }, duration);
  }

  return alertId;
}

function showLoading(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.disabled = true;
  btn.dataset.originalText = btn.innerHTML;
  btn.innerHTML = '<span class="loading-spinner"></span> 加載中...';
}

function hideLoading(buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.disabled = false;
  btn.innerHTML = btn.dataset.originalText || '提交';
}

// --- 儲存和獲取 LocalStorage ---
const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('儲存失敗:', error);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('讀取失敗:', error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('清空失敗:', error);
    }
  }
};

// --- URL 參數解析 ---
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function setQueryParam(name, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

// --- 日期處理 ---
const dateUtils = {
  format: (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  },

  isValidAge: (birthday, minAge = 18, maxAge = 100) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge && age <= maxAge;
  }
};

// --- 模態窗口 ---
const modal = {
  show: (modalId) => {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('show');
  },

  hide: (modalId) => {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('show');
  },

  confirm: (title, message) => {
    return new Promise((resolve) => {
      const modalId = `confirm-${Date.now()}`;
      const modalHTML = `
        <div id="${modalId}" class="modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>${title}</h2>
              <button class="modal-close">&times;</button>
            </div>
            <p>${message}</p>
            <div style="text-align: right; margin-top: 1.5rem;">
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('${modalId}').remove(); arguments[0].resolve(false)">取消</button>
              <button class="btn btn-primary btn-sm" onclick="document.getElementById('${modalId}').remove(); arguments[0].resolve(true)">確認</button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
      const confirmModal = document.getElementById(modalId);
      confirmModal.show = () => confirmModal.classList.add('show');
      confirmModal.resolve = resolve;
      confirmModal.show();

      confirmModal.querySelector('.modal-close').addEventListener('click', () => {
        confirmModal.remove();
        resolve(false);
      });
    });
  }
};

// --- 檢查認證狀態 ---
async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE}/auth/status`, {
      credentials: 'include'
    });

    if (!response.ok) {
      window.location.href = '/login.html';
      return false;
    }

    return true;
  } catch (error) {
    console.error('認證檢查失敗:', error);
    return false;
  }
}

// --- 登出 ---
async function logout() {
  try {
    await apiCall('/logout', { method: 'POST' });
    storage.clear();
    window.location.href = '/login.html';
  } catch (error) {
    console.error('登出失敗:', error);
    window.location.href = '/login.html';
  }
}

// --- 防抖函數 ---
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// --- 節流函數 ---
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// --- 深度合併對象 ---
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

console.log('✅ shared.js 已加載');
