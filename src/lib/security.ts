/**
 * Security utilities to protect the application from various attacks
 */

// Disable console in production
const disableConsole = () => {
  if (import.meta.env.PROD) {
    // Override console methods
    const noop = () => {};
    const methods = ['log', 'debug', 'info', 'warn', 'error', 'trace', 'group', 'groupEnd', 'time', 'timeEnd', 'profile', 'profileEnd'];
    
    methods.forEach(method => {
      (console as any)[method] = noop;
    });
    
    // Disable console object
    Object.defineProperty(window, 'console', {
      value: {},
      writable: false,
      configurable: false
    });
  }
};

// Prevent right-click context menu (only in production)
const disableRightClick = () => {
  if (!import.meta.env.PROD) return; // Skip in development
  
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
};

// Disable common developer shortcuts (only in production)
const disableDevTools = () => {
  if (!import.meta.env.PROD) return; // Skip in development
  
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

// Detect and prevent DevTools opening (only in production)
const detectDevTools = () => {
  if (!import.meta.env.PROD) return; // Skip in development
  
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

// Prevent text selection (only in production)
const disableTextSelection = () => {
  if (!import.meta.env.PROD) return; // Skip in development
  
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
  if (import.meta.env.PROD) {
    disableConsole();
    disableRightClick();
    disableDevTools();
    detectDevTools();
    disableTextSelection();
    preventIframeEmbedding();
    detectSuspiciousActivity();
    
    // Clear sensitive data on page unload
    window.addEventListener('beforeunload', clearSensitiveData);
    window.addEventListener('unload', clearSensitiveData);
  }
};

// Export utility functions
export {
  obfuscateData,
  deobfuscateData,
  clearSensitiveData
};
