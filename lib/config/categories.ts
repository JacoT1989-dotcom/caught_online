// Categories configuration
export const categories = [
  {
    title: 'Salmon',
    description: 'Premium Norwegian and local salmon',
    collection: 'salmon',
    href: '/products?collection=salmon',
  },
  {
    title: 'Kingklip',
    description: 'Fresh local kingklip',
    collection: 'kingklip',
    href: '/products?collection=kingklip',
  },
  {
    title: 'Tuna',
    description: 'Fresh and frozen tuna steaks',
    collection: 'tuna',
    href: '/products?collection=tuna',
  },
  {
    title: 'Prawns',
    description: 'Wild-caught and farmed prawns',
    collection: 'prawns',
    href: '/products?collection=prawns',
  },
  {
    title: 'Lobster',
    description: 'Rock and spiny lobster tails',
    collection: 'lobster',
    href: '/products?collection=lobster',
  },
  {
    title: 'Hake',
    description: 'Local and imported hake fillets',
    collection: 'hake',
    href: '/products?collection=hake',
  },
  {
    title: 'Calamari',
    description: 'Tubes, heads, and tentacles',
    collection: 'calamari',
    href: '/products?collection=calamari',
  },
  {
    title: 'Crumbed & Coated',
    description: 'Ready to cook favorites',
    collection: 'crumbed-coated',
    href: '/products?collection=crumbed-coated',
  },
] as const;

export type CategoryCollection = typeof categories[number]['collection'];