'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RegionSelector } from '@/components/region/region-selector';

interface CartRegionPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartRegionPrompt({ open, onOpenChange }: CartRegionPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <RegionSelector forceOpen showPostalCheck />
      </DialogContent>
    </Dialog>
  );
}