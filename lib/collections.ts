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
      { id: "wild-fish", title: "Fish", handle: "wild-caught-fish" },
      {
        id: "wild-shellfish",
        title: "Shellfish",
        handle: "wild-caught-shellfish",
      },
    ],
  },
  {
    id: "fresh",
    title: "Fresh",
    handle: "fresh",
    description: "Freshly caught daily",
    subcollections: [
      { id: "fresh-salmon", title: "Salmon", handle: "fresh-salmon" },
      { id: "fresh-tuna", title: "Tuna", handle: "fresh-tuna" },
      { id: "fresh-oysters", title: "Oysters", handle: "fresh-oysters" },
      { id: "fresh-mussels", title: "Mussels", handle: "fresh-mussels" },
    ],
  },
  {
    id: "crumbed",
    title: "Crumbed",
    handle: "crumbed-coated",
    description: "Deliciously crumbed seafood options",
    subcollections: [
      { id: "fishcakes", title: "Fishcakes", handle: "fishcakes" },
      { id: "panko", title: "Panko", handle: "panko" },
      { id: "tempura", title: "Tempura", handle: "tempura" },
    ],
  },
  {
    id: "smoked",
    title: "Smoked",
    handle: "smoked-cured",
    description: "Traditionally smoked and cured seafood",
    subcollections: [
      { id: "smoked-fish", title: "Smoked", handle: "smoked" },
      { id: "cured-fish", title: "Cured", handle: "cured" },
      { id: "smoked-salmon", title: "Salmon", handle: "smoked-salmon" },
      { id: "smoked-trout", title: "Trout", handle: "smoked-trout" },
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
