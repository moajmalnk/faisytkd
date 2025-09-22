import React, { useEffect, useState } from 'react';
import { initializeSecurity } from '@/lib/security';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

export const SecurityWrapper: React.FC<SecurityWrapperProps> = ({ children }) => {
  const [isSecure, setIsSecure] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    // Initialize security measures
    initializeSecurity();
    
    // Check for suspicious browser environments
    const checkEnvironment = () => {
      // Check for automation tools
      const automationSigns = [
        'webdriver' in window,
        'selenium' in window,
        'phantom' in window,
        'nightmare' in window,
        'cypress' in window,
        'playwright' in window
      ];
      
      if (automationSigns.some(sign => sign)) {
        setWarningMessage('Automation tools detected. Access denied.');
        return false;
      }
      
      // Check for headless browser
      if (navigator.webdriver || 
          (navigator as any).webdriver === undefined && 
          window.outerHeight === 0 && 
          window.outerWidth === 0) {
        setWarningMessage('Headless browser detected. Access denied.');
        return false;
      }
      
      // Check for debugging tools (only in production)
      if (import.meta.env.PROD) {
        const start = Date.now();
        debugger;
        const end = Date.now();
        if (end - start > 100) {
          setWarningMessage('Debugging tools detected. Access denied.');
          return false;
        }
      }
      
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
      
      // Monitor for DevTools (only in production)
      if (import.meta.env.PROD) {
        let devtools = false;
        const checkDevTools = () => {
          const widthThreshold = window.outerWidth - window.innerWidth > 160;
          const heightThreshold = window.outerHeight - window.innerHeight > 160;
          
          if (widthThreshold || heightThreshold) {
            if (!devtools) {
              devtools = true;
              setWarningMessage('Developer tools detected. Access denied.');
              window.location.href = 'about:blank';
            }
          } else {
            devtools = false;
          }
        };
        
        setInterval(checkDevTools, 1000);
      }
    };
    
    addProtectionLayers();
    
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
