export const SPECIES_ORDER = ["JAMBU", "KUNYIT", "PAKU", "SINGKONG", "SIRIH"] as const;

export type SpeciesCode = (typeof SPECIES_ORDER)[number];

export const SPECIES_INFO: Record<SpeciesCode, { common: string; scientific: string; local: string }> = {
  JAMBU: { common: "Guava", scientific: "Psidium guajava", local: "Jambu Biji" },
  KUNYIT: { common: "Turmeric", scientific: "Curcuma longa", local: "Kunyit" },
  PAKU: { common: "Fern", scientific: "Pteridophyta", local: "Paku" },
  SINGKONG: { common: "Cassava", scientific: "Manihot esculenta", local: "Singkong" },
  SIRIH: { common: "Betel", scientific: "Piper betle", local: "Sirih" },
};
