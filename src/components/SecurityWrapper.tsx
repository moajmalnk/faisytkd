import React, { useEffect, useState } from 'react';
import { initializeSecurity } from '@/lib/security';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

export const SecurityWrapper: React.FC<SecurityWrapperProps> = ({ children }) => {
  // Start with true for mobile/iOS to prevent blocking during initialization
  const [isSecure, setIsSecure] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');
  const [isBackground, setIsBackground] = useState(false);

  useEffect(() => {
    // Initialize security measures with error handling
    try {
      initializeSecurity();
    } catch (error) {
      console.warn('Security initialization failed:', error);
      // Continue anyway - don't block app
    }
    
    // Check for suspicious browser environments (only basic checks)
    const checkEnvironment = () => {
      // Check if it's a mobile device (including iOS)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                       window.innerWidth <= 768 ||
                       ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
      
      // Skip automation checks on mobile devices to avoid false positives
      if (isMobile) {
        return true;
      }
      
      // Only check for obvious automation tools on desktop
      const automationSigns = [
        'webdriver' in window && navigator.webdriver,
        'selenium' in window,
        'phantom' in window,
        'nightmare' in window
      ];
      
      if (automationSigns.some(sign => sign)) {
        setWarningMessage('Automation tools detected. Access denied.');
        return false;
      }
      
      // Check for obvious headless browser (only on desktop)
      if (navigator.webdriver && window.outerHeight === 0 && window.outerWidth === 0) {
        setWarningMessage('Headless browser detected. Access denied.');
        return false;
      }
      
      // Skip debugging tool detection to avoid false positives
      return true;
    };
    
    // Check environment and set security status
    const secure = checkEnvironment();
    setIsSecure(secure);
    
    // Add additional protection layers
    const addProtectionLayers = () => {
      // Override common debugging methods
      (window as any).eval = () => {
        throw new Error('Eval is disabled for security reasons');
      };
      
      // Protect against source code inspection
      const originalToString = Function.prototype.toString;
      Function.prototype.toString = function() {
        if (this === addProtectionLayers || this === checkEnvironment) {
          return 'function() { [native code] }';
        }
        return originalToString.call(this);
      };
      
      // Disable common debugging properties
      Object.defineProperty(window, 'debugger', {
        value: undefined,
        writable: false,
        configurable: false
      });
      
      // Skip aggressive DevTools monitoring to avoid false positives
    };
    
    addProtectionLayers();
    
    // Blur sensitive areas when app loses focus or page is hidden
    const handleVisibility = () => {
      const hidden = document.hidden || document.visibilityState !== 'visible';
      setIsBackground(hidden);
      document.documentElement.classList.toggle('sensitive-blur-active', hidden);
    };

    const handleFocus = () => {
      setIsBackground(false);
      document.documentElement.classList.remove('sensitive-blur-active');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleVisibility);
    window.addEventListener('focus', handleFocus);

    // Clear sensitive data periodically
    const clearDataInterval = setInterval(() => {
      // Clear any sensitive data that might be in memory
      if (typeof window !== 'undefined') {
        // Force garbage collection if available
        if ((window as any).gc) {
          (window as any).gc();
        }
      }
    }, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(clearDataInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Show warning if security check fails
  if (!isSecure && warningMessage) {
    return (
      <div className="min-h-screen bg-red-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Security Alert</h1>
          <p className="text-lg mb-4">{warningMessage}</p>
          <p className="text-sm opacity-75">This application is protected against unauthorized access.</p>
        </div>
      </div>
    );
  }

  // Render children if security checks pass
  return <>{children}</>;
};
