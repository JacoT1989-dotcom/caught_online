'use client';

import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: 'default' | 'full';
}

export function Container({ 
  children, 
  className,
  size = 'default',
  ...props 
}: ContainerProps) {
  return (
    <div 
      className={cn(
        "px-4 md:px-8",
        size === 'default' && "max-w-[1440px] mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}