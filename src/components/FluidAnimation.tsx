import React, { ReactNode } from 'react';
import { useFluidAnimation, FluidAnimationOptions } from '@/hooks/useFluidAnimation';

interface FluidAnimationProps extends FluidAnimationOptions {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

export const FluidAnimation: React.FC<FluidAnimationProps> = ({
  children,
  className = '',
  style = {},
  as: Component = 'div',
  ...animationOptions
}) => {
  const { ref, isVisible } = useFluidAnimation(animationOptions);

  const combinedClassName = [
    className,
    'fluid-animation',
    isVisible ? 'fluid-visible' : 'fluid-hidden'
  ].filter(Boolean).join(' ');

  return (
    <Component
      ref={ref}
      className={combinedClassName}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'
      }}
    >
      {children}
    </Component>
  );
};

// Predefined fluid animation components
export const FluidFadeIn: React.FC<Omit<FluidAnimationProps, 'trigger'>> = (props) => (
  <FluidAnimation {...props} trigger="mount" />
);

export const FluidHover: React.FC<Omit<FluidAnimationProps, 'trigger'>> = (props) => (
  <FluidAnimation {...props} trigger="hover" duration={300} />
);

export const FluidScroll: React.FC<Omit<FluidAnimationProps, 'trigger'>> = (props) => (
  <FluidAnimation {...props} trigger="scroll" />
);

export const FluidClick: React.FC<Omit<FluidAnimationProps, 'trigger'>> = (props) => (
  <FluidAnimation {...props} trigger="click" duration={200} />
);

export const FluidFocus: React.FC<Omit<FluidAnimationProps, 'trigger'>> = (props) => (
  <FluidAnimation {...props} trigger="focus" duration={200} />
);

// Fluid stagger component for animating multiple children with delays
interface FluidStaggerProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const FluidStagger: React.FC<FluidStaggerProps> = ({
  children,
  staggerDelay = 100,
  className = '',
  as: Component = 'div'
}) => {
  return (
    <Component className={className}>
      {children.map((child, index) => (
        <FluidFadeIn
          key={index}
          delay={index * staggerDelay}
          as="div"
        >
          {child}
        </FluidFadeIn>
      ))}
    </Component>
  );
};

// Fluid list component for animating list items
interface FluidListProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
}

export const FluidList: React.FC<FluidListProps> = ({
  children,
  staggerDelay = 50,
  className = '',
  itemClassName = 'fluid-list-item'
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FluidFadeIn
          key={index}
          delay={index * staggerDelay}
          as="div"
          className={itemClassName}
        >
          {child}
        </FluidFadeIn>
      ))}
    </div>
  );
};

// Fluid grid component for animating grid items
interface FluidGridProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
  columns?: number;
}

export const FluidGrid: React.FC<FluidGridProps> = ({
  children,
  staggerDelay = 100,
  className = '',
  itemClassName = 'fluid-grid-item',
  columns
}) => {
  const gridStyle = columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : {};

  return (
    <div className={className} style={gridStyle}>
      {children.map((child, index) => (
        <FluidFadeIn
          key={index}
          delay={index * staggerDelay}
          as="div"
          className={itemClassName}
        >
          {child}
        </FluidFadeIn>
      ))}
    </div>
  );
};
