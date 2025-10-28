import { useEffect, useRef, useState } from 'react';

export interface FluidAnimationOptions {
  delay?: number;
  duration?: number;
  easing?: string;
  trigger?: 'hover' | 'focus' | 'click' | 'scroll' | 'mount' | 'manual';
  threshold?: number; // for scroll trigger
}

export const useFluidAnimation = (options: FluidAnimationOptions = {}) => {
  const {
    delay = 0,
    duration = 600,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    trigger = 'mount',
    threshold = 0.1
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const animate = () => {
      setIsAnimating(true);
      element.style.transition = `all ${duration}ms ${easing}`;
      
      setTimeout(() => {
        setIsVisible(true);
        element.classList.add('fluid-visible');
        
        setTimeout(() => {
          setIsAnimating(false);
        }, duration);
      }, delay);
    };

    const reset = () => {
      setIsVisible(false);
      setIsAnimating(false);
      element.classList.remove('fluid-visible');
    };

    switch (trigger) {
      case 'mount':
        animate();
        break;
      
      case 'hover':
        // Add both mouse and touch events for iOS compatibility
        element.addEventListener('mouseenter', animate);
        element.addEventListener('mouseleave', reset);
        element.addEventListener('touchstart', animate);
        element.addEventListener('touchend', reset);
        break;
      
      case 'focus':
        element.addEventListener('focus', animate);
        element.addEventListener('blur', reset);
        break;
      
      case 'click':
        element.addEventListener('click', animate);
        break;
      
      case 'scroll':
        // Check if IntersectionObserver is supported (iOS Safari < 12.2)
        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                animate();
              }
            },
            { threshold }
          );
          observer.observe(element);
          
          return () => observer.disconnect();
        } else {
          // Fallback for older iOS versions - just animate immediately
          animate();
        }
        break;
    }

    return () => {
      element.removeEventListener('mouseenter', animate);
      element.removeEventListener('mouseleave', reset);
      element.removeEventListener('touchstart', animate);
      element.removeEventListener('touchend', reset);
      element.removeEventListener('focus', animate);
      element.removeEventListener('blur', reset);
      element.removeEventListener('click', animate);
    };
  }, [delay, duration, easing, trigger, threshold]);

  return {
    ref: elementRef,
    isVisible,
    isAnimating,
    triggerAnimation: () => {
      const element = elementRef.current;
      if (element && trigger === 'manual') {
        setIsAnimating(true);
        element.style.transition = `all ${duration}ms ${easing}`;
        setTimeout(() => {
          setIsVisible(true);
          element.classList.add('fluid-visible');
          setTimeout(() => setIsAnimating(false), duration);
        }, delay);
      }
    }
  };
};

// Predefined fluid animation hooks for common use cases
export const useFluidFadeIn = (delay = 0) => 
  useFluidAnimation({ trigger: 'mount', delay });

export const useFluidHover = () => 
  useFluidAnimation({ trigger: 'hover', duration: 300 });

export const useFluidScroll = (threshold = 0.1) => 
  useFluidAnimation({ trigger: 'scroll', threshold });

export const useFluidClick = () => 
  useFluidAnimation({ trigger: 'click', duration: 200 });

export const useFluidFocus = () => 
  useFluidAnimation({ trigger: 'focus', duration: 200 });
