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

// Initialize iOS-specific fixes
export const initializeIOSFixes = (): void => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!isIOS()) return;
    
    // Use setTimeout to defer initialization after React renders
    setTimeout(() => {
      try {
        // Prevent iOS bounce scrolling - but make it safe
        preventIOSBounce();
      } catch (error) {
        console.warn('Failed to initialize iOS bounce prevention:', error);
      }
    }, 500); // Wait 500ms after initial render
    
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
          'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }
    } catch (error) {
      // Silently fail - viewport is already set in HTML
    }
    
    // Log success in development only
    if (process.env.NODE_ENV !== 'production') {
      console.log('iOS fixes initialized for iOS version:', getIOSVersion());
    }
  } catch (error) {
    console.error('Failed to initialize iOS fixes:', error);
    // Don't throw - let the app continue
  }
};
