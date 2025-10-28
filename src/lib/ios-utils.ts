/**
 * iOS-specific utilities and compatibility fixes
 */

// Detect iOS devices
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

// Detect iOS Safari version
export const getIOSVersion = (): number | null => {
  if (!isIOS()) return null;
  
  const match = navigator.userAgent.match(/OS (\d+)_/);
  return match ? parseInt(match[1], 10) : null;
};

// Check if iOS version supports specific features
export const supportsIntersectionObserver = (): boolean => {
  return 'IntersectionObserver' in window;
};

export const supportsServiceWorker = (): boolean => {
  return 'serviceWorker' in navigator;
};

export const supportsWebAuthn = (): boolean => {
  return 'navigator' in window && 
         'credentials' in navigator && 
         'create' in navigator.credentials;
};

// iOS-specific storage utilities
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
      return false;
    }
  }
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn('sessionStorage.getItem failed:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('sessionStorage.setItem failed:', error);
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('sessionStorage.removeItem failed:', error);
      return false;
    }
  }
};

// iOS-specific camera utilities
export const requestCameraPermission = async (): Promise<boolean> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return false;
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }, 
      audio: false 
    });
    
    // Stop the stream immediately - we just wanted to check permissions
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.warn('Camera permission denied or not available:', error);
    return false;
  }
};

// iOS-specific PWA utilities
export const isPWAInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Check for iOS web app mode
  const isInWebAppiOS = (window.navigator as any).standalone === true;
  
  return isStandalone || isInWebAppiOS;
};

// iOS-specific touch utilities
export const addTouchEvents = (element: HTMLElement, callbacks: {
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  onTouchMove?: () => void;
}) => {
  if (!element) return;
  
  if (callbacks.onTouchStart) {
    element.addEventListener('touchstart', callbacks.onTouchStart, { passive: true });
  }
  
  if (callbacks.onTouchEnd) {
    element.addEventListener('touchend', callbacks.onTouchEnd, { passive: true });
  }
  
  if (callbacks.onTouchMove) {
    element.addEventListener('touchmove', callbacks.onTouchMove, { passive: true });
  }
};

// iOS-specific scroll utilities
export const preventIOSBounce = (): void => {
  if (!isIOS()) return;
  
  document.addEventListener('touchmove', (e) => {
    const target = e.target as HTMLElement;
    const scrollableParent = target.closest('[data-scrollable]');
    
    if (!scrollableParent) {
      e.preventDefault();
    }
  }, { passive: false });
};

// Initialize iOS-specific fixes
export const initializeIOSFixes = (): void => {
  if (!isIOS()) return;
  
  // Prevent iOS bounce scrolling
  preventIOSBounce();
  
  // Add iOS-specific meta tags if not present
  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    const meta = document.createElement('meta');
    meta.name = 'apple-mobile-web-app-capable';
    meta.content = 'yes';
    document.head.appendChild(meta);
  }
  
  // Add iOS-specific viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute('content', 
      'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }
  
  console.log('iOS fixes initialized for iOS version:', getIOSVersion());
};
