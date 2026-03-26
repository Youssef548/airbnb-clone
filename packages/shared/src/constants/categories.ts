export const CATEGORY_LABELS = [
  { id: "1", label: "Homes" },
  { id: "2", label: "Experiences" },
  { id: "3", label: "Drinks" },
  { id: "4", label: "Travel" },
  { id: "5", label: "Music" },
  { id: "7", label: "Sports" },
  { id: "8", label: "Fashion" },
  { id: "9", label: "Books" },
  { id: "10", label: "Wellness" },
] as const;

export type CategoryLabel = (typeof CATEGORY_LABELS)[number]["label"];
