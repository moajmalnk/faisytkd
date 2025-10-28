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

// iOS-specific storage utilities with fallback
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      // Try localStorage first
      const value = localStorage.getItem(key);
      if (value !== null) return value;
      
      // Fallback to sessionStorage on iOS if localStorage fails
      if (isIOS()) {
        try {
          return sessionStorage.getItem(key);
        } catch {
          return null;
        }
      }
      return null;
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      // Try sessionStorage as fallback on iOS
      if (isIOS()) {
        try {
          return sessionStorage.getItem(key);
        } catch {
          return null;
        }
      }
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
      // Fallback to sessionStorage on iOS private mode
      if (isIOS()) {
        try {
          sessionStorage.setItem(key, value);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      // Also remove from sessionStorage if it exists there
      if (isIOS()) {
        try {
          sessionStorage.removeItem(key);
        } catch {
          // Ignore
        }
      }
      return true;
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
      if (isIOS()) {
        try {
          sessionStorage.removeItem(key);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }
};

// Fallback storage for iOS when both localStorage and sessionStorage fail
const memoryStorage: Record<string, string> = {};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      const value = sessionStorage.getItem(key);
      if (value !== null) return value;
      
      // Fallback to memory storage
      if (isIOS() && memoryStorage[key]) {
        return memoryStorage[key];
      }
      return null;
    } catch (error) {
      console.warn('sessionStorage.getItem failed:', error);
      // Fallback to memory storage
      if (isIOS() && memoryStorage[key]) {
        return memoryStorage[key];
      }
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      sessionStorage.setItem(key, value);
      // Also store in memory as backup on iOS
      if (isIOS()) {
        memoryStorage[key] = value;
      }
      return true;
    } catch (error) {
      console.warn('sessionStorage.setItem failed:', error);
      // Fallback to memory storage on iOS
      if (isIOS()) {
        memoryStorage[key] = value;
        return true;
      }
      return false;
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      // Also remove from memory storage
      if (isIOS() && memoryStorage[key]) {
        delete memoryStorage[key];
      }
      return true;
    } catch (error) {
      console.warn('sessionStorage.removeItem failed:', error);
      // Still try to remove from memory
      if (isIOS() && memoryStorage[key]) {
        delete memoryStorage[key];
        return true;
      }
      return false;
    }
  }
};

// iOS-specific camera utilities (disabled - no camera access)
export const requestCameraPermission = async (): Promise<boolean> => {
  // Camera access is disabled - always return false
  return false;
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
  
  // Wait for document body to be ready
  if (!document.body) {
    setTimeout(preventIOSBounce, 100);
    return;
  }
  
  // Make this less aggressive - only prevent on body, not all elements
  let lastTouchY = 0;
  let touchStartY = 0;
  
  document.body.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
    lastTouchY = touchStartY;
  }, { passive: true });
  
  document.body.addEventListener('touchmove', (e) => {
    if (!e.touches || !e.touches[0]) return;
    
    const touchY = e.touches[0].clientY;
    const target = e.target as HTMLElement;
    
    // Allow scrolling on scrollable elements
    const scrollableParent = target.closest('[data-scrollable], .overflow-auto, .overflow-y-auto, .overflow-scroll, [role="dialog"], [role="alertdialog"]');
    
    if (scrollableParent) {
      return;
    }
    
    // Only prevent if at top or bottom of page
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    
    // Calculate scroll direction
    const scrollDirection = touchY - touchStartY;
    
    // Only prevent if trying to overscroll at boundaries
    if ((isAtTop && scrollDirection > 0) || (isAtBottom && scrollDirection < 0)) {
      e.preventDefault();
    }
    
    lastTouchY = touchY;
  }, { passive: false });
};

// Fix iOS button click issues by ensuring buttons work with touch
const fixButtonClicks = (): void => {
  if (typeof document === 'undefined') return;
  
  // Add touch event handlers to all buttons to ensure they work on iOS
  const handleButtonTouch = (button: HTMLElement) => {
    if (button.dataset.iosTouchFixed) return;
    button.dataset.iosTouchFixed = 'true';
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    button.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
    
    // Ensure click events fire on iOS
    button.addEventListener('touchstart', (e) => {
      // Don't interfere, just ensure the element can receive touch
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.getAttribute('role') === 'button') {
        target.style.cursor = 'pointer';
      }
    }, { passive: true });
  };
  
  // Fix existing buttons
  document.querySelectorAll('button, a[role="button"], [role="button"]').forEach(handleButtonTouch);
  
  // Watch for dynamically added buttons
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const element = node as HTMLElement;
          if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
            handleButtonTouch(element);
          }
          // Check child elements
          element.querySelectorAll?.('button, [role="button"]').forEach(handleButtonTouch);
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// Fix iOS Safari 100vh issue
const fixIOSViewportHeight = (): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  // Set CSS custom property for actual viewport height
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => {
    setTimeout(setVH, 100);
  });
};

// Initialize iOS-specific fixes
export const initializeIOSFixes = (): void => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!isIOS()) return;
    
    // Fix viewport height immediately
    try {
      fixIOSViewportHeight();
    } catch (error) {
      console.warn('Failed to fix iOS viewport height:', error);
    }
    
    // Add iOS-specific meta tags if not present (this is safe to do immediately)
    try {
      if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
        const meta = document.createElement('meta');
        meta.name = 'apple-mobile-web-app-capable';
        meta.content = 'yes';
        document.head.appendChild(meta);
      }
    } catch (error) {
        // Silently fail - meta tags are already set in HTML
      }
    
    // Add iOS-specific viewport meta tag (safe to do immediately)
    try {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }
    } catch (error) {
      // Silently fail - viewport is already set in HTML
    }
    
    // Wait for DOM to be ready before fixing buttons
    const initButtonFixes = () => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          try {
            fixButtonClicks();
          } catch (error) {
            console.warn('Failed to fix button clicks:', error);
          }
        });
      } else {
        try {
          fixButtonClicks();
        } catch (error) {
          console.warn('Failed to fix button clicks:', error);
        }
      }
    };
    
    // Fix button clicks when DOM is ready
    initButtonFixes();
    
    // Use setTimeout to defer other initialization after React renders
    setTimeout(() => {
      try {
        // Prevent iOS bounce scrolling - but make it safe
        preventIOSBounce();
        
        // Fix button clicks again after React renders
        fixButtonClicks();
        
        // Re-fix viewport height after render
        fixIOSViewportHeight();
      } catch (error) {
        console.warn('Failed to initialize iOS bounce prevention:', error);
      }
    }, 500); // Wait 500ms after initial render
    
    // Add another delay to ensure all React components are rendered
    setTimeout(() => {
      try {
        fixButtonClicks();
        fixIOSViewportHeight();
      } catch (error) {
        // Ignore
      }
    }, 1000);
    
    // Log success in development only
    if (process.env.NODE_ENV !== 'production') {
      console.log('iOS fixes initialized for iOS version:', getIOSVersion());
    }
  } catch (error) {
    console.error('Failed to initialize iOS fixes:', error);
    // Don't throw - let the app continue
  }
};
