import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories | Caught Online',
  description: 'Browse our seafood categories including fresh fish, shellfish, and prepared seafood.',
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}