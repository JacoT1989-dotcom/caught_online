'use client';

import { cn } from '@/lib/utils';
import { Container } from '@/components/ui/container';

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function SectionWrapper({ 
  children,
  className,
  ...props 
}: SectionWrapperProps) {
  return (
    <section className={cn("py-8", className)} {...props}>
      <Container>
        {children}
      </Container>
    </section>
  );
}