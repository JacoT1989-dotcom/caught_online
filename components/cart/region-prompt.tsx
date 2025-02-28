'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RegionSelector } from '@/components/region/region-selector';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface RegionPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RegionPrompt({ open, onOpenChange }: RegionPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden>Select Your Delivery Area</VisuallyHidden>
          </DialogTitle>
        </DialogHeader>
        <RegionSelector forceOpen showPostalCheck />
      </DialogContent>
    </Dialog>
  );
}