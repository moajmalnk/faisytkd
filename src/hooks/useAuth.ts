import { useState, useEffect, useCallback } from 'react';
import { safeSessionStorage, isIOS } from '@/lib/ios-utils';

const AUTO_LOCK_TIME = 2 * 60 * 1000; // 2 minute in milliseconds

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [pinAttempts, setPinAttempts] = useState(0);
  const [showPatternScreen, setShowPatternScreen] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const sessionAuth = safeSessionStorage.getItem('bookkeeping-auth');
    const savedActivity = safeSessionStorage.getItem('bookkeeping-activity');
    const savedPinAttempts = safeSessionStorage.getItem('bookkeeping-pin-attempts');
    
    if (savedPinAttempts) {
      const attempts = parseInt(savedPinAttempts);
      setPinAttempts(attempts);
      if (attempts >= 3) {
        setShowPatternScreen(true);
      }
    }
    
    if (sessionAuth === 'authenticated' && savedActivity) {
      const timeSinceActivity = Date.now() - parseInt(savedActivity);
      if (timeSinceActivity < AUTO_LOCK_TIME) {
        setIsAuthenticated(true);
        setLastActivity(parseInt(savedActivity));
      } else {
        // Session expired, clear it
        safeSessionStorage.removeItem('bookkeeping-auth');
        safeSessionStorage.removeItem('bookkeeping-activity');
      }
    }
  }, []);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    safeSessionStorage.setItem('bookkeeping-activity', now.toString());
  }, []);

  // Set up activity listeners
  useEffect(() => {
    if (isAuthenticated) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      const handleActivity = () => {
        updateActivity();
      };

      events.forEach(event => {
        document.addEventListener(event, handleActivity);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [isAuthenticated, updateActivity]);

  // Auto-lock timer
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        const timeSinceActivity = Date.now() - lastActivity;
        if (timeSinceActivity >= AUTO_LOCK_TIME) {
          logout();
        }
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, lastActivity]);

  const login = () => {
    setIsAuthenticated(true);
    safeSessionStorage.setItem('bookkeeping-auth', 'authenticated');
    updateActivity();
  };

  const logout = () => {
    setIsAuthenticated(false);
    safeSessionStorage.removeItem('bookkeeping-auth');
    safeSessionStorage.removeItem('bookkeeping-activity');
  };

  // Check if Face ID authentication is available
  const isFaceIDAvailable = () => {
    const isWebAuthnSupported = typeof window !== 'undefined' && 
      'navigator' in window && 
      'credentials' in navigator && 
      'create' in navigator.credentials;
    
    // Face ID uses WebAuthn which is supported on iOS Safari 14+ and modern browsers
    return isWebAuthnSupported;
  };

  const incrementPinAttempts = () => {
    const newAttempts = pinAttempts + 1;
    setPinAttempts(newAttempts);
    safeSessionStorage.setItem('bookkeeping-pin-attempts', newAttempts.toString());
    
    if (newAttempts >= 3) {
      setShowPatternScreen(true);
    }
  };

  const resetPinAttempts = () => {
    setPinAttempts(0);
    setShowPatternScreen(false);
    safeSessionStorage.removeItem('bookkeeping-pin-attempts');
  };

  const handlePatternCorrect = () => {
    resetPinAttempts();
  };

  return {
    isAuthenticated,
    login,
    logout,
    updateActivity,
    pinAttempts,
    showPatternScreen,
    incrementPinAttempts,
    handlePatternCorrect,
    isFaceIDAvailable,
  };
};