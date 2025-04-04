export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string; // Added optional description property
  subcollections?: Collection[];
}

export const collections: Collection[] = [
  {
    id: "fish",
    title: "Fish",
    handle: "fish",
    description: "Fresh fish from sustainable sources",
    subcollections: [
      { id: "hake", title: "Hake", handle: "hake" },
      { id: "kingklip", title: "Kingklip", handle: "kingklip" },
      { id: "salmon", title: "Salmon", handle: "salmon" },
      { id: "sole", title: "Sole", handle: "sole" },
      { id: "trout", title: "Trout", handle: "trout" },
      { id: "tuna", title: "Tuna", handle: "tuna" },
      { id: "yellowtail", title: "Yellowtail", handle: "yellowtail" },
    ],
  },
  {
    id: "shellfish",
    title: "Shellfish",
    handle: "shellfish",
    description: "Premium shellfish selection",
    subcollections: [
      { id: "calamari", title: "Calamari", handle: "calamari" },
      { id: "prawns", title: "Prawns", handle: "prawns" },
      { id: "mussels", title: "Mussels", handle: "mussels" },
      { id: "oysters", title: "Oysters", handle: "oysters" },
      { id: "lobster", title: "Lobster", handle: "lobster" },
      { id: "crab", title: "Crab", handle: "crab" },
    ],
  },
  {
    id: "wild-caught",
    title: "Wild Caught",
    handle: "wild-caught",
    description: "Sustainably wild-caught seafood",
    subcollections: [
      { id: "wild-fish", title: "Fish", handle: "fish-wild-caught" },
      {
        id: "wild-shellfish",
        title: "Shellfish",
        handle: "shellfish-wild-caught",
      },
    ],
  },
  {
    id: "fresh",
    title: "Fresh",
    handle: "fresh-fish",
    description: "Freshly caught daily",
    subcollections: [
      { id: "fresh-salmon", title: "Salmon", handle: "salmon" },
      { id: "fresh-tuna", title: "Tuna", handle: "tuna" },
      { id: "fresh-oysters", title: "Oysters", handle: "oysters" },
      { id: "fresh-mussels", title: "Mussels", handle: "mussels" },
    ],
  },
  {
    id: "crumbed",
    title: "Crumbed",
    handle: "crumbed-coated-seafood",
    description: "Deliciously crumbed seafood options",
    subcollections: [
      {
        id: "fishcakes",
        title: "Fishcakes",
        handle: "fishcakes-crumbed-coated",
      },
      { id: "panko", title: "Panko", handle: "panko" },
      { id: "tempura", title: "Tempura", handle: "tempura" },
    ],
  },
  {
    id: "smoked",
    title: "Smoked",
    handle: "smoked-salmon-trout",
    description: "Traditionally smoked and cured seafood",
    subcollections: [
      { id: "cured-fish", title: "Cured", handle: "cured" },
      { id: "smoked-salmon", title: "Salmon", handle: "salmon-cured" },
      { id: "smoked-trout", title: "Trout", handle: "trout-cured" },
    ],
  },
  {
    id: "caviar",
    title: "Caviar",
    handle: "caviar",
    description: "Luxury premium caviar selections",
    subcollections: [
      { id: "caviar", title: "Caviar", handle: "caviar" },
    ],
  },
];

export function getCollectionByHandle(handle: string): Collection | undefined {
  // Check main collections
  const mainCollection = collections.find((c) => c.handle === handle);
  if (mainCollection) return mainCollection;

  // Check subcollections
  for (const collection of collections) {
    const subcollection = collection.subcollections?.find(
      (sub) => sub.handle === handle
    );
    if (subcollection) return subcollection;
  }
}

export function getAllCollectionHandles(): string[] {
  const handles: string[] = [];

  collections.forEach((collection) => {
    handles.push(collection.handle);
    collection.subcollections?.forEach((sub) => {
      handles.push(sub.handle);
    });
  });

  return handles;
}