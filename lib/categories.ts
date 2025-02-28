interface CategoryGroup {
  id: string;
  label: string;
  types: string[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    id: 'fish',
    label: 'Fish',
    types: [] // Will be populated dynamically
  },
  {
    id: 'shellfish',
    label: 'Shellfish',
    types: [] // Will be populated dynamically
  },
  {
    id: 'prepared',
    label: 'Prepared',
    types: [] // Will be populated dynamically
  }
];

// Helper function to determine which group a product type belongs to
function getCategoryGroup(productType: string): string {
  const lowerType = productType.toLowerCase();
  
  // Shellfish types
  if (
    lowerType.includes('prawn') ||
    lowerType.includes('crab') ||
    lowerType.includes('lobster') ||
    lowerType.includes('mussel') ||
    lowerType.includes('oyster') ||
    lowerType.includes('calamari') ||
    lowerType.includes('octopus') ||
    lowerType.includes('scallop')
  ) {
    return 'shellfish';
  }
  
  // Prepared types
  if (
    lowerType.includes('crumbed') ||
    lowerType.includes('smoked') ||
    lowerType.includes('cured') ||
    lowerType.includes('prepared')
  ) {
    return 'prepared';
  }
  
  // Default to fish for all other types
  return 'fish';
}

export function initializeCategories(productTypes: string[]) {
  // Reset the types arrays
  categoryGroups.forEach(group => {
    group.types = [];
  });

  // Sort product types into their respective groups
  productTypes.forEach(type => {
    const groupId = getCategoryGroup(type);
    const group = categoryGroups.find(g => g.id === groupId);
    if (group && !group.types.includes(type)) {
      group.types.push(type);
    }
  });

  // Sort types within each group
  categoryGroups.forEach(group => {
    group.types.sort();
  });

  return categoryGroups;
}