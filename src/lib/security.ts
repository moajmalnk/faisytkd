/**
 * Security utilities to protect the application from various attacks
 */

import { getSecurityConfig, shouldEnableSecurity } from './security-config';

// Disable console in production (but keep essential methods)
const disableConsole = () => {
  if (import.meta.env.PROD) {
    // Override only non-essential console methods
    const noop = () => {};
    const methods = ['log', 'debug', 'info', 'trace', 'group', 'groupEnd', 'time', 'timeEnd', 'profile', 'profileEnd'];
    
    methods.forEach(method => {
      (console as any)[method] = noop;
    });
    
    // Keep warn and error methods but make them silent
    (console as any).warn = noop;
    (console as any).error = noop;
  }
};

// Prevent right-click context menu
const disableRightClick = () => {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
};

// Disable common developer shortcuts
const disableDevTools = () => {
  
  // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+C (Element Inspector)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    
    // Ctrl+Shift+K (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
      e.preventDefault();
      return false;
    }
  });
};

// Detect and prevent DevTools opening
const detectDevTools = () => {
  
  let devtools = {
    open: false,
    orientation: null as string | null
  };
  
  const threshold = 160;
  
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          // Redirect to a warning page or close the app
          window.location.href = 'about:blank' as any;
        }
    } else {
      devtools.open = false;
    }
  }, 500);
};

// Prevent text selection
const disableTextSelection = () => {
  
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });
  
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });
};

// Obfuscate sensitive data
const obfuscateData = (data: any) => {
  if (typeof data === 'string') {
    // Simple XOR obfuscation
    const key = 'NKBOOK_SECRET_KEY_2024';
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }
  return data;
};

// Deobfuscate data
const deobfuscateData = (data: string) => {
  try {
    const decoded = atob(data);
    const key = 'NKBOOK_SECRET_KEY_2024';
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return data;
  }
};

// Protect against iframe embedding
const preventIframeEmbedding = () => {
  if (window.top !== window.self) {
    window.top!.location.href = window.self.location.href;
  }
};

// Clear sensitive data from memory
const clearSensitiveData = () => {
  // Clear localStorage of sensitive data
  const sensitiveKeys = ['webauthn-credential-id', 'user-data', 'financial-data'];
  sensitiveKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage
  sessionStorage.clear();
};

// Detect suspicious activity
const detectSuspiciousActivity = () => {
  let mouseMovements = 0;
  let keystrokes = 0;
  
  document.addEventListener('mousemove', () => {
    mouseMovements++;
    if (mouseMovements > 10000) {
      // Suspicious: too many mouse movements (possible bot)
      clearSensitiveData();
    }
  });
  
  document.addEventListener('keydown', () => {
    keystrokes++;
    if (keystrokes > 1000) {
      // Suspicious: too many keystrokes
      clearSensitiveData();
    }
  });
};

// Initialize all security measures
export const initializeSecurity = () => {
  if (shouldEnableSecurity()) {
    const config = getSecurityConfig();
    
    // Always enable these basic security measures
    if (config.disableConsole) disableConsole();
    if (config.preventIframeEmbedding) preventIframeEmbedding();
    if (config.detectSuspiciousActivity) detectSuspiciousActivity();
    if (config.clearSensitiveData) {
      window.addEventListener('beforeunload', clearSensitiveData);
      window.addEventListener('unload', clearSensitiveData);
    }
    
    // Enable optional measures based on configuration
    if (config.disableRightClick) disableRightClick();
    if (config.disableDevTools) disableDevTools();
    if (config.detectDevTools) detectDevTools();
    if (config.disableTextSelection) disableTextSelection();
  }
};

// Export utility functions
export {
  obfuscateData,
  deobfuscateData,
  clearSensitiveData
};
