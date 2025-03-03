import { MobileCategories } from '@/components/categories/mobile-categories';
import { DesktopCategories } from '@/components/categories/desktop-categories';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Categories */}
      <div className="md:hidden">
        <MobileCategories />
      </div>

      {/* Desktop Categories */}
      <div className="hidden md:block">
        <DesktopCategories />
      </div>
    </div>
  );
}