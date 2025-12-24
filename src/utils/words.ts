/**
 * Theme packs for the imposter game
 * Each pack is a category of themes that can be combined or used separately
 */

export interface ThemePack {
  id: string;
  name: string;
  themes: string[];
}

// === THEME PACKS ===

export const PACK_GENERAL: ThemePack = {
  id: 'general',
  name: 'General',
  themes: [
    'beach', 'hospital', 'airport', 'school', 'gym',
    'cinema', 'restaurant', 'supermarket', 'zoo', 'museum',
    'nightclub', 'prison', 'casino', 'library', 'farm',
  ],
};

export const PACK_EVENTS: ThemePack = {
  id: 'events',
  name: 'Events & Celebrations',
  themes: [
    'wedding', 'birthday', 'funeral', 'graduation', 'job interview',
    'first date', 'house party', 'baby shower', 'stag do', 'hen party',
  ],
};

export const PACK_ACTIVITIES: ThemePack = {
  id: 'activities',
  name: 'Activities',
  themes: [
    'camping', 'fishing', 'cooking', 'gardening', 'skiing',
    'surfing', 'yoga', 'poker night', 'karaoke', 'barbecue',
    'road trip', 'moving house', 'dentist visit', 'haircut', 'hangover',
  ],
};

export const PACK_CHRISTMAS: ThemePack = {
  id: 'christmas',
  name: 'Christmas',
  themes: [
    'christmas morning', 'nativity', 'carol singing', 'midnight mass',
    'boxing day', 'christmas dinner', 'secret santa', 'advent calendar',
    'christmas market', 'pantomime', 'office christmas party', 'the grinch',
    'home alone', 'elf on the shelf', 'christmas jumper day',
  ],
};

export const PACK_CHRISTIAN: ThemePack = {
  id: 'christian',
  name: 'Christianity & Faith',
  themes: [
    'baptism', 'communion', 'confession', 'sunday service', 'bible study',
    'easter sunday', 'good friday', 'palm sunday', 'the last supper',
    'garden of eden', 'noahs ark', 'the exodus', 'david and goliath',
    'the prodigal son', 'the good samaritan', 'the resurrection',
  ],
};

export const PACK_QUIRKY: ThemePack = {
  id: 'quirky',
  name: 'Quirky & Unusual',
  themes: [
    'alien invasion', 'zombie apocalypse', 'time travel', 'haunted house',
    'desert island', 'witness protection', 'undercover spy', 'escape room',
    'blind date disaster', 'awkward silence', 'food poisoning', 'lost luggage',
    'flat tyre', 'wrong funeral', 'wardrobe malfunction', 'photobomb',
  ],
};

// === ALL PACKS ===

export const ALL_PACKS: ThemePack[] = [
  PACK_GENERAL,
  PACK_EVENTS,
  PACK_ACTIVITIES,
  PACK_CHRISTMAS,
  PACK_CHRISTIAN,
  PACK_QUIRKY,
];

// === HELPER FUNCTIONS ===

/**
 * Gets all themes from specified packs (or all packs if none specified)
 */
export function getThemesFromPacks(packIds?: string[]): string[] {
  const packs = packIds
    ? ALL_PACKS.filter(p => packIds.includes(p.id))
    : ALL_PACKS;

  return packs.flatMap(p => p.themes);
}

/**
 * Gets a random theme from specified packs (or all packs if none specified)
 * @param packIds - Optional array of pack IDs to select from
 * @param randomFn - Injectable random function for testing
 */
export function getRandomTheme(
  packIds?: string[],
  randomFn: () => number = Math.random
): string {
  const themes = getThemesFromPacks(packIds);
  const index = Math.floor(randomFn() * themes.length);
  return themes[index];
}

/**
 * Creates a custom theme pack (for user-generated or AI-generated themes)
 */
export function createThemePack(id: string, name: string, themes: string[]): ThemePack {
  return { id, name, themes };
}
