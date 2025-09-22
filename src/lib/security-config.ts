/**
 * Security configuration for different environments
 */

export interface SecurityConfig {
  disableConsole: boolean;
  disableRightClick: boolean;
  disableDevTools: boolean;
  disableTextSelection: boolean;
  detectDevTools: boolean;
  preventIframeEmbedding: boolean;
  detectSuspiciousActivity: boolean;
  clearSensitiveData: boolean;
  aggressiveMode: boolean;
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  disableConsole: true,
  disableRightClick: false, // Disabled by default to avoid UX issues
  disableDevTools: false, // Disabled by default to avoid false positives
  disableTextSelection: false, // Disabled by default to avoid UX issues
  detectDevTools: false, // Disabled by default to avoid false positives
  preventIframeEmbedding: true,
  detectSuspiciousActivity: true,
  clearSensitiveData: true,
  aggressiveMode: false // Set to true for maximum security
};

// Aggressive security configuration (use with caution)
export const AGGRESSIVE_SECURITY_CONFIG: SecurityConfig = {
  disableConsole: true,
  disableRightClick: true,
  disableDevTools: true,
  disableTextSelection: true,
  detectDevTools: true,
  preventIframeEmbedding: true,
  detectSuspiciousActivity: true,
  clearSensitiveData: true,
  aggressiveMode: true
};

// Get current security configuration
export const getSecurityConfig = (): SecurityConfig => {
  // Check for environment variable or URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const aggressiveMode = urlParams.get('security') === 'aggressive' || 
                        localStorage.getItem('security-mode') === 'aggressive';
  
  return aggressiveMode ? AGGRESSIVE_SECURITY_CONFIG : DEFAULT_SECURITY_CONFIG;
};

// Check if we should enable security features
export const shouldEnableSecurity = (): boolean => {
  return import.meta.env.PROD;
};

// Security warning for users
export const showSecurityWarning = () => {
  if (import.meta.env.PROD && window.location.search.includes('security=aggressive')) {
    console.warn('🔒 Aggressive security mode enabled. Some features may be restricted.');
  }
};
