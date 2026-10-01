export enum ScreenState {
  SPLASH_MIDO = 'SPLASH_MIDO',
  SPLASH_GAME = 'SPLASH_GAME',
  CINEMATIC_INTRO = 'CINEMATIC_INTRO',
  MAIN_MENU = 'MAIN_MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum MenuModal {
  NONE = 'NONE',
  SHOP = 'SHOP',
  GARAGE = 'GARAGE',
  SHOWROOM = 'SHOWROOM',
  MAPS = 'MAPS',
  SETTINGS = 'SETTINGS',
  EXPORT_HTML = 'EXPORT_HTML',
}

export type GraphicsQuality = 'Low' | 'Medium' | 'High' | 'Ultra';
export type FpsLimit = 30 | 60 | 90 | 120 | 144;

export interface GameSettings {
  masterVolume: number; // 0 to 100
  natureVolume: number; // 0 to 100 (Coin pickup, Rain ambient, Thunder & Lightning)
  sfxVolume: number; // 0 to 100 (Car engine sounds & Exhaust backfire / pop shots)
  musicEnabled: boolean;
  muted: boolean;
  quality: GraphicsQuality;
  fpsLimit: FpsLimit;
  showFpsCounter: boolean;
  cameraShake: boolean;
}

export interface UpgradeLevels {
  engine: number; // 0 to 100 (ترقية المكينة - Engine Power)
  armor: number; // 0 to 100 (ترقية قوة وتحمل السيارة - Vehicle Armor / Durability)
  exhaustSound: number; // 0 to 100 (ترقية صوت المحرك وطلاق الشكمان - Engine Sound & Exhaust Pops)
  suspension: number; // legacy compatibility
  tires: number; // legacy compatibility
  fuel: number; // legacy compatibility
}

export interface CustomCarColor {
  bodyColor: string;
  secondaryColor: string;
  accentColor: string;
}

export const CAR_COLOR_PRICE = 500;
export const STARRY_CAR_COLOR_PRICE = 8000;
export const NEON_CAR_COLOR_PRICE = 8000;

export interface DualNeonInfo {
  id: string;
  name: string;
  englishName: string;
  colorA: string;
  colorB: string;
  midColor: string;
  coreColor: string;
  rgbA: [number, number, number];
  rgbB: [number, number, number];
  rgbMid: [number, number, number];
}

export interface StarryGalaxyInfo {
  id: string;
  name: string;
  englishName: string;
  baseColor: string;
  deepColor: string;
  nebulaColor: string;
  starColor: string;
  deepSpaceColor: string;
  nebulaHighlight: string;
  starCoreColor: string;
  starGlowColor: string;
  rgbBase: [number, number, number];
  rgbNebula: [number, number, number];
}

function parseHexToRgbTuple(hex: string): [number, number, number] {
  const clean = (hex || '#E60026').replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return [230, 0, 38];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbTupleToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    clamp(r).toString(16).padStart(2, '0') +
    clamp(g).toString(16).padStart(2, '0') +
    clamp(b).toString(16).padStart(2, '0')
  );
}

const CUSTOM_PAINT_META_STORAGE_KEY = 'mido_nx_apex_custom_paint_meta_v2';
const customDualNeonRegistry = new Map<string, { colorA: string; colorB: string }>();
const customStarryRegistry = new Set<string>();

const RESERVED_STANDARD_HEXES = new Set<string>([
  '#ff001e',
  '#e60026',
  '#0284c7',
  '#10b981',
  '#f59e0b',
  '#7c3aed',
  '#0f172a',
  '#d35400',
  '#d97706',
  '#059669',
  '#1e293b',
]);

function loadCustomPaintMeta(): void {
  try {
    const raw = localStorage.getItem(CUSTOM_PAINT_META_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.neon && typeof parsed.neon === 'object') {
      Object.entries(parsed.neon).forEach(([k, val]) => {
        const normKey = k.toLowerCase();
        if (RESERVED_STANDARD_HEXES.has(normKey)) return;
        const v = val as { colorA?: string; colorB?: string };
        if (v?.colorA && v?.colorB) {
          customDualNeonRegistry.set(normKey, {
            colorA: v.colorA,
            colorB: v.colorB,
          });
        }
      });
    }
    if (Array.isArray(parsed?.starry)) {
      parsed.starry.forEach((k: unknown) => {
        if (typeof k === 'string') {
          const normKey = k.toLowerCase();
          if (!RESERVED_STANDARD_HEXES.has(normKey)) {
            customStarryRegistry.add(normKey);
          }
        }
      });
    }
  } catch {
    // Ignore storage errors
  }
}

function persistCustomPaintMeta(): void {
  try {
    const neonObj: Record<string, { colorA: string; colorB: string }> = {};
    customDualNeonRegistry.forEach((v, k) => {
      neonObj[k] = v;
    });
    localStorage.setItem(
      CUSTOM_PAINT_META_STORAGE_KEY,
      JSON.stringify({
        neon: neonObj,
        starry: Array.from(customStarryRegistry),
      })
    );
  } catch {
    // Ignore storage errors
  }
}

loadCustomPaintMeta();

/**
 * Normalizes a standard 500-coin custom hex so its blue LSB is 00 (never collides with Starry or Neon).
 */
export function encodeStandardCustomHex(rawHex: string): string {
  const [r, g, b] = parseHexToRgbTuple(rawHex);
  return rgbTupleToHex(r, g, b & 0xfc);
}

/**
 * Encodes a Custom Starry Galaxy color (8,000 coins) without mutating storage, or registers it when requested.
 */
export function encodeCustomStarryHex(rawHex: string): string {
  const [r, g, b] = parseHexToRgbTuple(rawHex);
  let encoded = rgbTupleToHex(r, g, (b & 0xfc) | 0x01).toLowerCase();
  if (RESERVED_STANDARD_HEXES.has(encoded)) {
    encoded = rgbTupleToHex(r, g, ((b + 4) & 0xfc) | 0x01).toLowerCase();
  }
  return encoded;
}

export function registerCustomStarryColor(
  rawHex: string,
  persist: boolean = true
): StarryGalaxyInfo {
  const [r, g, b] = parseHexToRgbTuple(rawHex);
  const encoded = encodeCustomStarryHex(rawHex);
  customStarryRegistry.add(encoded);
  if (persist) {
    persistCustomPaintMeta();
  }
  return (
    getStarryGalaxyInfo(encoded) || {
      id: 'custom_starry',
      name: 'لون النجوم المخصص (Custom Starry Galaxy)',
      englishName: 'Custom Starry Galaxy',
      baseColor: encoded,
      deepColor: '#150329',
      nebulaColor: '#C77DFF',
      starColor: '#FFFFFF',
      deepSpaceColor: '#150329',
      nebulaHighlight: '#C77DFF',
      starCoreColor: '#FFFFFF',
      starGlowColor: '#F3E8FF',
      rgbBase: [r, g, b],
      rgbNebula: [199, 125, 255],
    }
  );
}

/**
 * Encodes and registers a Custom Dual Neon color pair (8,000 coins).
 */
export function registerCustomDualNeonColor(
  rawColorA: string,
  rawColorB: string,
  persist: boolean = true
): DualNeonInfo {
  const [rA, gA, bA] = parseHexToRgbTuple(rawColorA);
  const [rB, gB, bB] = parseHexToRgbTuple(rawColorB);
  const hashMix = (rB * 3 + gB * 5 + bB * 7) & 0x0c;
  let encoded = rgbTupleToHex(
    rA,
    gA,
    ((bA & 0xf0) | hashMix | 0x02) & 0xff
  ).toLowerCase();
  if (RESERVED_STANDARD_HEXES.has(encoded)) {
    encoded = rgbTupleToHex(
      rA,
      gA,
      (((bA + 16) & 0xf0) | hashMix | 0x02) & 0xff
    ).toLowerCase();
  }
  const cleanB = rgbTupleToHex(rB, gB, bB);
  customDualNeonRegistry.set(encoded, { colorA: encoded, colorB: cleanB });
  if (persist) {
    persistCustomPaintMeta();
  }
  return (
    getDualNeonInfo(encoded) || {
      id: 'custom_dual_neon',
      name: 'نيون مخصص مزدوج (Custom Dual Neon)',
      englishName: 'Custom Dual Neon',
      colorA: encoded,
      colorB: cleanB,
      midColor: cleanB,
      coreColor: '#FFFFFF',
      rgbA: [rA, gA, bA],
      rgbB: [rB, gB, bB],
      rgbMid: [
        Math.round((rA + rB) * 0.5),
        Math.round((gA + gB) * 0.5),
        Math.round((bA + bB) * 0.5),
      ],
    }
  );
}

export function getStarryGalaxyInfo(hexColor?: string): StarryGalaxyInfo | null {
  if (!hexColor) return null;
  const norm = hexColor.trim().toLowerCase();
  if (RESERVED_STANDARD_HEXES.has(norm)) return null;
  if (norm === '#d90429' || norm === '#b80028' || norm === 'starry_candy_red') {
    return {
      id: 'starry_candy_red',
      name: 'أحمر مجري كاندي (Starry Candy Red)',
      englishName: 'Starry Candy Red',
      baseColor: '#D90429',
      deepColor: '#2B0008',
      nebulaColor: '#FF4D6D',
      starColor: '#FFB3C1',
      deepSpaceColor: '#2B0008',
      nebulaHighlight: '#FF4D6D',
      starCoreColor: '#FFFFFF',
      starGlowColor: '#FFB3C1',
      rgbBase: [217, 4, 41],
      rgbNebula: [255, 77, 109],
    };
  }
  if (norm === '#1d4ed8' || norm === '#0038a8' || norm === 'cosmic_starry_blue') {
    return {
      id: 'cosmic_starry_blue',
      name: 'أزرق كوني (Cosmic Starry Blue)',
      englishName: 'Cosmic Starry Blue',
      baseColor: '#1D4ED8',
      deepColor: '#060B26',
      nebulaColor: '#38BDF8',
      starColor: '#BAE6FD',
      deepSpaceColor: '#060B26',
      nebulaHighlight: '#38BDF8',
      starCoreColor: '#FFFFFF',
      starGlowColor: '#BAE6FD',
      rgbBase: [29, 78, 216],
      rgbNebula: [56, 189, 248],
    };
  }
  if (norm === '#6d28d9' || norm === '#5a189a' || norm === 'galaxy_purple') {
    return {
      id: 'galaxy_purple',
      name: 'أرجواني مجري (Galaxy Purple)',
      englishName: 'Galaxy Purple',
      baseColor: '#6D28D9',
      deepColor: '#16042E',
      nebulaColor: '#E879F9',
      starColor: '#F5D0FE',
      deepSpaceColor: '#16042E',
      nebulaHighlight: '#E879F9',
      starCoreColor: '#FFFFFF',
      starGlowColor: '#F5D0FE',
      rgbBase: [109, 40, 217],
      rgbNebula: [232, 121, 249],
    };
  }

  if (customStarryRegistry.has(norm)) {
    const [r, g, b] = parseHexToRgbTuple(norm);
    const deepR = Math.max(4, Math.round(r * 0.22));
    const deepG = Math.max(4, Math.round(g * 0.22));
    const deepB = Math.max(12, Math.round(b * 0.26));
    const nebR = Math.min(255, Math.round(r + (255 - r) * 0.48));
    const nebG = Math.min(255, Math.round(g + (255 - g) * 0.48));
    const nebB = Math.min(255, Math.round(b + (255 - b) * 0.48));
    const deepHex = rgbTupleToHex(deepR, deepG, deepB);
    const nebHex = rgbTupleToHex(nebR, nebG, nebB);
    const starGlowHex = rgbTupleToHex(
      Math.min(255, nebR + 35),
      Math.min(255, nebG + 35),
      Math.min(255, nebB + 35)
    );
    return {
      id: 'custom_starry',
      name: 'لون النجوم المخصص (Custom Starry Galaxy)',
      englishName: 'Custom Starry Galaxy',
      baseColor: rgbTupleToHex(r, g, b),
      deepColor: deepHex,
      nebulaColor: nebHex,
      starColor: starGlowHex,
      deepSpaceColor: deepHex,
      nebulaHighlight: nebHex,
      starCoreColor: '#FFFFFF',
      starGlowColor: starGlowHex,
      rgbBase: [r, g, b],
      rgbNebula: [nebR, nebG, nebB],
    };
  }
  return null;
}

export function getDualNeonInfo(hexColor?: string): DualNeonInfo | null {
  if (!hexColor) return null;
  const norm = hexColor.trim().toLowerCase();
  if (RESERVED_STANDARD_HEXES.has(norm)) return null;
  if (norm === '#ff0022' || norm === 'cyber_fire_neon') {
    return {
      id: 'cyber_fire_neon',
      name: 'نيون ناري (أحمر + أصفر)',
      englishName: 'Cyber Fire Neon',
      colorA: '#FF001E',
      colorB: '#FFE600',
      midColor: '#FF5E00',
      coreColor: '#FFFBEB',
      rgbA: [255, 0, 30],
      rgbB: [255, 230, 0],
      rgbMid: [255, 94, 0],
    };
  }
  if (norm === '#00ff66' || norm === 'bio_hazard_neon') {
    return {
      id: 'bio_hazard_neon',
      name: 'نيون ليزري (أخضر + أزرق)',
      englishName: 'Bio Hazard Neon',
      colorA: '#00FF66',
      colorB: '#00B8FF',
      midColor: '#00F5D4',
      coreColor: '#ECFEFF',
      rgbA: [0, 255, 102],
      rgbB: [0, 184, 255],
      rgbMid: [0, 245, 212],
    };
  }
  if (norm === '#00f0ff' || norm === '#00f5ff' || norm === 'cyberpunk_cyan_magenta') {
    return {
      id: 'cyberpunk_cyan_magenta',
      name: 'نيون سايبربانك (سيان + ماجنتا)',
      englishName: 'Cyberpunk Cyan & Magenta',
      colorA: '#00F0FF',
      colorB: '#FF00A0',
      midColor: '#8B5CF6',
      coreColor: '#FDF4FF',
      rgbA: [0, 240, 255],
      rgbB: [255, 0, 160],
      rgbMid: [139, 92, 246],
    };
  }
  if (norm === '#9d00ff' || norm === '#ffbe0b' || norm === 'plasma_purple_gold') {
    return {
      id: 'plasma_purple_gold',
      name: 'نيون بلازما (بنفسجي + ذهبي)',
      englishName: 'Plasma Purple & Gold',
      colorA: '#9D00FF',
      colorB: '#FFD600',
      midColor: '#F43F5E',
      coreColor: '#FEFCE8',
      rgbA: [157, 0, 255],
      rgbB: [255, 214, 0],
      rgbMid: [244, 63, 94],
    };
  }
  if (norm === '#ff5500' || norm === 'hyper_orange_blue') {
    return {
      id: 'hyper_orange_blue',
      name: 'نيون فائق (برتقالي + أزرق)',
      englishName: 'Hyper Orange & Electric Blue',
      colorA: '#FF5500',
      colorB: '#0066FF',
      midColor: '#00E5FF',
      coreColor: '#F0F9FF',
      rgbA: [255, 85, 0],
      rgbB: [0, 102, 255],
      rgbMid: [0, 229, 255],
    };
  }

  const customPair = customDualNeonRegistry.get(norm);
  if (customPair) {
    const colA = customPair.colorA;
    const colB = customPair.colorB;
    const rgbA = parseHexToRgbTuple(colA);
    const rgbB = parseHexToRgbTuple(colB);
    const rgbMid: [number, number, number] = [
      Math.round((rgbA[0] + rgbB[0]) * 0.5),
      Math.round((rgbA[1] + rgbB[1]) * 0.5),
      Math.round((rgbA[2] + rgbB[2]) * 0.5),
    ];
    return {
      id: 'custom_dual_neon',
      name: 'نيون مخصص مزدوج (Custom Dual Neon)',
      englishName: 'Custom Dual Neon',
      colorA: colA,
      colorB: colB,
      midColor: rgbTupleToHex(rgbMid[0], rgbMid[1], rgbMid[2]),
      coreColor: '#FFFFFF',
      rgbA,
      rgbB,
      rgbMid,
    };
  }

  return null;
}

export function getCarColorPrice(hexColor?: string): number {
  if (hexColor && hexColor.trim().toLowerCase() === '#ff001e') {
    return 0;
  }
  if (getDualNeonInfo(hexColor) || getStarryGalaxyInfo(hexColor)) {
    return NEON_CAR_COLOR_PRICE;
  }
  return CAR_COLOR_PRICE;
}

export const CAR_COLOR_PRESETS: {
  id: string;
  name: string;
  bodyColor: string;
  secondaryColor: string;
  accentColor: string;
  price: number;
  category?: 'standard' | 'starry' | 'neon';
  isDefaultFree?: boolean;
  isStarry?: boolean;
  isStarryGalaxy?: boolean;
  isDualNeon?: boolean;
  neonColors?: [string, string];
}[] = [
  // 1. STANDARD METALLIC & CANDY PAINTS (500 COINS EACH)
  {
    id: 'candy_red',
    name: 'أحمر كاندي (Candy Red)',
    bodyColor: '#E60026',
    secondaryColor: '#E60026',
    accentColor: '#E60026',
    price: CAR_COLOR_PRICE,
    category: 'standard',
  },
  {
    id: 'royal_blue',
    name: 'أزرق ملكي (Royal Blue)',
    bodyColor: '#0284C7',
    secondaryColor: '#0C4A6E',
    accentColor: '#0284C7',
    price: CAR_COLOR_PRICE,
    category: 'standard',
  },
  {
    id: 'emerald_green',
    name: 'أخضر زمردي (Emerald)',
    bodyColor: '#10B981',
    secondaryColor: '#064E3B',
    accentColor: '#10B981',
    price: CAR_COLOR_PRICE,
    category: 'standard',
  },
  {
    id: 'sunset_gold',
    name: 'ذهبي برتقالي (Gold)',
    bodyColor: '#F59E0B',
    secondaryColor: '#78350F',
    accentColor: '#F59E0B',
    price: CAR_COLOR_PRICE,
    category: 'standard',
  },
  {
    id: 'cyber_purple',
    name: 'بنفسجي ملكي (Purple)',
    bodyColor: '#7C3AED',
    secondaryColor: '#3B0764',
    accentColor: '#7C3AED',
    price: CAR_COLOR_PRICE,
    category: 'standard',
  },
  {
    id: 'rose_magenta',
    name: 'وردي نيون (Magenta)',
    bodyColor: '#E11D48',
    secondaryColor: '#881337',
    accentColor: '#E11D48',
    price: CAR_COLOR_PRICE,
    category: 'standard',
  },
  {
    id: 'lava_orange',
    name: 'برتقالي بركاني (Orange)',
    bodyColor: '#EA580C',
    secondaryColor: '#7C2D12',
    accentColor: '#EA580C',
    price: CAR_COLOR_PRICE,
    category: 'standard',
  },
  {
    id: 'stealth_black',
    name: 'أسود كربوني (Carbon Black)',
    bodyColor: '#1E293B',
    secondaryColor: '#020617',
    accentColor: '#1E293B',
    price: CAR_COLOR_PRICE,
    category: 'standard',
  },
  {
    id: 'pearl_white',
    name: 'أبيض لؤلؤي (Pearl White)',
    bodyColor: '#F1F5F9',
    secondaryColor: '#475569',
    accentColor: '#F1F5F9',
    price: CAR_COLOR_PRICE,
    category: 'standard',
  },

  // 2. STARRY GALAXY PAINTS (ألوان النجوم والفضائي — 8,000 COINS EACH)
  {
    id: 'starry_candy_red',
    name: 'أحمر مجري كاندي (Starry Candy Red)',
    bodyColor: '#D90429',
    secondaryColor: '#2B0008',
    accentColor: '#D90429',
    price: STARRY_CAR_COLOR_PRICE,
    category: 'starry',
    isStarry: true,
    isStarryGalaxy: true,
  },
  {
    id: 'cosmic_starry_blue',
    name: 'أزرق كوني (Cosmic Starry Blue)',
    bodyColor: '#1D4ED8',
    secondaryColor: '#060B26',
    accentColor: '#1D4ED8',
    price: STARRY_CAR_COLOR_PRICE,
    category: 'starry',
    isStarry: true,
    isStarryGalaxy: true,
  },
  {
    id: 'galaxy_purple',
    name: 'أرجواني مجري (Galaxy Purple)',
    bodyColor: '#6D28D9',
    secondaryColor: '#16042E',
    accentColor: '#6D28D9',
    price: STARRY_CAR_COLOR_PRICE,
    category: 'starry',
    isStarry: true,
    isStarryGalaxy: true,
  },

  // 3. EXPANDED ANIMATED DUAL NEON PAINTS (ألوان النيون المزدوجة المتحركة — 8,000 COINS EACH)
  {
    id: 'cyber_fire_neon',
    name: 'نيون ناري (أحمر + أصفر)',
    bodyColor: '#FF0022',
    secondaryColor: '#FFE600',
    accentColor: '#FF0022',
    price: NEON_CAR_COLOR_PRICE,
    category: 'neon',
    isDualNeon: true,
    neonColors: ['#FF001E', '#FFE600'],
  },
  {
    id: 'bio_hazard_neon',
    name: 'نيون ليزري (أخضر + أزرق)',
    bodyColor: '#00FF66',
    secondaryColor: '#00B8FF',
    accentColor: '#00FF66',
    price: NEON_CAR_COLOR_PRICE,
    category: 'neon',
    isDualNeon: true,
    neonColors: ['#00FF66', '#00B8FF'],
  },
  {
    id: 'cyberpunk_cyan_magenta',
    name: 'نيون سايبربانك (سيان + ماجنتا)',
    bodyColor: '#00F0FF',
    secondaryColor: '#FF00A0',
    accentColor: '#00F0FF',
    price: NEON_CAR_COLOR_PRICE,
    category: 'neon',
    isDualNeon: true,
    neonColors: ['#00F0FF', '#FF00A0'],
  },
  {
    id: 'plasma_purple_gold',
    name: 'نيون بلازما (بنفسجي + ذهبي)',
    bodyColor: '#9D00FF',
    secondaryColor: '#FFD600',
    accentColor: '#9D00FF',
    price: NEON_CAR_COLOR_PRICE,
    category: 'neon',
    isDualNeon: true,
    neonColors: ['#9D00FF', '#FFD600'],
  },
  {
    id: 'hyper_orange_blue',
    name: 'نيون فائق (برتقالي + أزرق)',
    bodyColor: '#FF5500',
    secondaryColor: '#0066FF',
    accentColor: '#FF5500',
    price: NEON_CAR_COLOR_PRICE,
    category: 'neon',
    isDualNeon: true,
    neonColors: ['#FF5500', '#0066FF'],
  },
];

export interface CarConfig {
  id: string;
  name: string;
  arabicName: string;
  subtitle: string;
  engineTypeLabel: string;
  price: number;
  bodyColor: string;
  secondaryColor: string;
  accentColor: string;
  wheelRadius: number;
  wheelBase: number;
  chassisWidth: number;
  chassisHeight: number;
  baseSpeed: number;
  baseAccel: number;
  baseGrip: number;
  baseFuelCapacity: number;
  cogOffset: number;
  mass: number;
  enginePitch: number;
  engineTimbre:
    | 'v8_4x4'
    | 'diesel_truck'
    | 'v6_sports'
    | 'w16_hyper'
    | 'v6_offroad'
    | 'v8_baja'
    | 'turbo_rally';
  style: 'offroad' | 'buggy' | 'rally' | 'bugatti';
}

export interface MapConfig {
  id: string;
  name: string;
  arabicName: string;
  environmentType: 'forest' | 'desert' | 'snow' | 'mountain_neon';
  environmentBadge: string;
  subtitle: string;
  price: number;
  gravity: number;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  groundTop: string;
  groundFill: string;
  groundStroke: string;
  accentGlow: string;
  hillAmplitude: number;
  hillRoughness: number;
  coinMultiplier: number;
  isNeon?: boolean;
}

export interface ShopInventory {
  nitroPacks: number;
  repairKits: number;
  flightWings: number;
}

export interface SaveData {
  coins: number;
  unlockedCars: string[];
  selectedCar: string;
  unlockedMaps: string[];
  selectedMap: string;
  upgrades: Record<string, UpgradeLevels>;
  carColors?: Record<string, CustomCarColor>;
  unlockedCarColors?: Record<string, string[]>;
  inventory: ShopInventory;
  bestDistanceByMap: Record<string, number>;
  totalCoinsEarned: number;
  settings: GameSettings;
}

export const CARS_CATALOG: CarConfig[] = [
  {
    id: 'apex_4x4',
    name: 'Apex Red Trailblazer HD',
    arabicName: 'Apex Red Trailblazer Ultra HD (دفع رباعي كلاسيكي V8)',
    subtitle: 'هيكل دفع رباعي كلاسيكي أحمر ناري بلمعان فلزي وانعكاسات ضوئية، محرك V8 مخصص للـ 4x4، طلاء موحد ومساعدين رياضية بارزة',
    engineTypeLabel: '4.8L Cross-Plane V8 (4x4)',
    price: 0,
    bodyColor: '#FF001E',
    secondaryColor: '#FF001E',
    accentColor: '#FF001E',
    wheelRadius: 27,
    wheelBase: 86,
    chassisWidth: 130,
    chassisHeight: 45,
    baseSpeed: 23,
    baseAccel: 22,
    baseGrip: 1.26,
    baseFuelCapacity: 100,
    cogOffset: 18,
    mass: 0.85,
    enginePitch: 46,
    engineTimbre: 'v8_4x4',
    style: 'offroad',
  },
  {
    id: 'dune_raptor',
    name: 'Ford Raptor Heavy Truck',
    arabicName: 'Ford Raptor Turbo-Diesel Truck (شاحنة ديزل ثقيلة Ultra HD)',
    subtitle: 'شاحنة صحراوية ثقيلة بلمعان فلزي برتقالي-ذهبي، قفص فولاذي مقوى، محرك ديزل تيربو ثقيل بعزم جبار وجنوط خضراء',
    engineTypeLabel: '6.7L Heavy Turbo-Diesel (Truck)',
    price: 15000,
    bodyColor: '#F59E0B',
    secondaryColor: '#92400E',
    accentColor: '#10B981',
    wheelRadius: 25,
    wheelBase: 94,
    chassisWidth: 134,
    chassisHeight: 37,
    baseSpeed: 26,
    baseAccel: 25,
    baseGrip: 1.34,
    baseFuelCapacity: 115,
    cogOffset: 20,
    mass: 0.9,
    enginePitch: 36,
    engineTimbre: 'diesel_truck',
    style: 'buggy',
  },
  {
    id: 'cyber_rally',
    name: 'Porsche 911 Dakar V6 Sports',
    arabicName: 'Porsche 911 Dakar V6 Sports (سيارة رياضية تيربو V6)',
    subtitle: 'سيارة رالي رياضية بطلاء زمردي فلزي، صوت محرك V6 رياضي عالي الدوران، سلة سقف بكشافات LED، جناح كربوني مزدوج',
    engineTypeLabel: '3.8L High-Rev V6 (Sports)',
    price: 45000,
    bodyColor: '#10B981',
    secondaryColor: '#064E3B',
    accentColor: '#38BDF8',
    wheelRadius: 22,
    wheelBase: 96,
    chassisWidth: 138,
    chassisHeight: 35,
    baseSpeed: 29,
    baseAccel: 28,
    baseGrip: 1.44,
    baseFuelCapacity: 130,
    cogOffset: 22,
    mass: 0.78,
    enginePitch: 66,
    engineTimbre: 'v6_sports',
    style: 'rally',
  },
  {
    id: 'bugatti_ultra',
    name: 'Bugatti Chiron Ultra W16',
    arabicName: 'Bugatti Chiron Ultra W16 (بوجاتي شيرون ألترا HD)',
    subtitle: 'أسطورة السرعة الخارقة بطلاء أزرق فلزي وكربون فايبر، قوس C-Line المضيء، محرك W16 رباعي التوربو وجنوط سيان متوهجة',
    engineTypeLabel: '8.0L Quad-Turbo W16',
    price: 100000,
    bodyColor: '#0284C7',
    secondaryColor: '#0F172A',
    accentColor: '#00F0FF',
    wheelRadius: 22,
    wheelBase: 104,
    chassisWidth: 150,
    chassisHeight: 32,
    baseSpeed: 36,
    baseAccel: 34,
    baseGrip: 1.62,
    baseFuelCapacity: 165,
    cogOffset: 26,
    mass: 0.82,
    enginePitch: 76,
    engineTimbre: 'w16_hyper',
    style: 'bugatti',
  },
];

export const MAPS_CATALOG: MapConfig[] = [
  {
    id: 'emerald_hills',
    name: 'Sunny Mountain Valley',
    arabicName: 'وادي الجبال المشمس 2K (Mountain Valley)',
    environmentType: 'forest',
    environmentBadge: '⛰️ وادي الجبال 2K HD',
    subtitle: 'أسفلت مصقول بتشققات طبيعية وحواجز حماية معدنية أمام قمم الجبال الشاهقة والغيوم الثابتة وانعكاسات الضوء والماء',
    price: 0,
    gravity: 9.4,
    skyTop: '#0284C7',
    skyMid: '#38BDF8',
    skyBottom: '#E0F2FE',
    groundTop: '#16A34A',
    groundFill: '#452714',
    groundStroke: '#86EFAC',
    accentGlow: '#22C55E',
    hillAmplitude: 84,
    hillRoughness: 1.05,
    coinMultiplier: 1,
    isNeon: false,
  },
  {
    id: 'crimson_canyon',
    name: 'Golden Desert Dunes',
    arabicName: 'صحراء الكثبان الذهبية 2K (Desert Dunes)',
    environmentType: 'desert',
    environmentBadge: '🌵 صحراء ذهبية 2K HD',
    subtitle: 'طريق أسفلت صحراوي بتشققات حرارية طبيعية وحواجز فولاذية مصقولة وسط الكثبان الذهبية والصبار',
    price: 15000,
    gravity: 9.4,
    skyTop: '#0369A1',
    skyMid: '#7DD3FC',
    skyBottom: '#FEF3C7',
    groundTop: '#D97706',
    groundFill: '#78350F',
    groundStroke: '#FDE047',
    accentGlow: '#F59E0B',
    hillAmplitude: 108,
    hillRoughness: 1.22,
    coinMultiplier: 1.25,
    isNeon: false,
  },
  {
    id: 'arctic_peaks',
    name: 'Snowy Alpine Peaks',
    arabicName: 'الجبال الثلجية القطبية 2K (Snowy Mountains)',
    environmentType: 'snow',
    environmentBadge: '❄️ جبال ثلجية 2K HD',
    subtitle: 'مسار أسفلت جبلي متجمد بانعكاسات جليدية وحواجز حماية معدنية مصقولة تحت قمم الألب الثلجية',
    price: 40000,
    gravity: 9.0,
    skyTop: '#0369A1',
    skyMid: '#38BDF8',
    skyBottom: '#F0F9FF',
    groundTop: '#E2E8F0',
    groundFill: '#1E3A8A',
    groundStroke: '#FFFFFF',
    accentGlow: '#38BDF8',
    hillAmplitude: 122,
    hillRoughness: 1.32,
    coinMultiplier: 1.5,
    isNeon: false,
  },
  {
    id: 'neon_horizon',
    name: 'Volcanic & Neon Cyber Peaks',
    arabicName: 'المسارات البركانية وجبال النيون 2K (Volcanic & Neon)',
    environmentType: 'mountain_neon',
    environmentBadge: '🌋⚡ مسارات بركانية ونيون ×2',
    subtitle: 'أسفلت بازلتي بركاني بتشققات حمم متوهجة وأشعة نيون منعكسة مع حواجز مضيئة ومضاعف كوينز ×2',
    price: 100000,
    gravity: 8.4,
    skyTop: '#090418',
    skyMid: '#1E1B4B',
    skyBottom: '#450A0A',
    groundTop: '#00F0FF',
    groundFill: '#18061C',
    groundStroke: '#FF007F',
    accentGlow: '#F97316',
    hillAmplitude: 118,
    hillRoughness: 1.25,
    coinMultiplier: 2.0,
    isNeon: true,
  },
];

export const STORAGE_KEY = 'mido_nx_apex_hill_racing_zero_v5';
export const SETTINGS_STORAGE_KEY = 'mido_nx_apex_settings_v1';

export const DEFAULT_UPGRADES: Record<string, UpgradeLevels> = {
  apex_4x4: { engine: 0, armor: 0, exhaustSound: 0, suspension: 0, tires: 0, fuel: 0 },
  dune_raptor: { engine: 0, armor: 0, exhaustSound: 0, suspension: 0, tires: 0, fuel: 0 },
  cyber_rally: { engine: 0, armor: 0, exhaustSound: 0, suspension: 0, tires: 0, fuel: 0 },
  bugatti_ultra: { engine: 0, armor: 0, exhaustSound: 0, suspension: 0, tires: 0, fuel: 0 },
};

let coins = 0;

export const DEFAULT_SAVE_DATA: SaveData = {
  coins,
  unlockedCars: ['apex_4x4'],
  selectedCar: 'apex_4x4',
  unlockedMaps: ['emerald_hills'],
  selectedMap: 'emerald_hills',
  upgrades: DEFAULT_UPGRADES,
  carColors: {},
  unlockedCarColors: {
    apex_4x4: ['#ff001e'],
    dune_raptor: ['#ff001e', '#f59e0b'],
    cyber_rally: ['#ff001e', '#10b981'],
    bugatti_ultra: ['#ff001e', '#0284c7'],
  },
  inventory: {
    nitroPacks: 2,
    repairKits: 2,
    flightWings: 2,
  },
  bestDistanceByMap: {
    emerald_hills: 0,
    crimson_canyon: 0,
    arctic_peaks: 0,
    neon_horizon: 0,
  },
  totalCoinsEarned: 0,
  settings: {
    masterVolume: 100,
    natureVolume: 100,
    sfxVolume: 100,
    musicEnabled: true,
    muted: false,
    quality: 'Ultra',
    fpsLimit: 60,
    showFpsCounter: true,
    cameraShake: false,
  },
};

export function saveSettingsToLocalStorage(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...parsed,
          settings,
        })
      );
    }
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function loadSaveData(): SaveData {
  try {
    // Clear any pre-saved legacy or debug local storage coin/color values
    const legacyKeys = [
      'mido_nx_apex_hill_racing_save_v1',
      'mido_nx_apex_hill_racing_save_v2',
      'mido_nx_apex_hill_racing_release_v1',
      'mido_nx_apex_hill_racing_release_v2',
      'mido_nx_apex_hill_racing_release_v3',
      'mido_nx_apex_hill_racing_zero_coins_v1',
      'mido_nx_apex_racing_v6',
      'mido_nx_apex_custom_paint_meta_v1',
      'mido_nx_coins',
      'coins',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));

    const raw = localStorage.getItem(STORAGE_KEY);
    const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const parsedDedicatedSettings = rawSettings ? JSON.parse(rawSettings) : {};
    const mergedSettings = {
      ...DEFAULT_SAVE_DATA.settings,
      ...(parsed.settings || {}),
      ...parsedDedicatedSettings,
    };

    const validQualities: GraphicsQuality[] = ['Low', 'Medium', 'High', 'Ultra'];
    const validFpsLimits: FpsLimit[] = [30, 60, 90, 120, 144];

    const normalizedUpgrades: Record<string, UpgradeLevels> = {};
    for (const car of CARS_CATALOG) {
      const u = parsed.upgrades?.[car.id] || {};
      const clampLvl = (val: unknown) =>
        typeof val === 'number' && Number.isFinite(val)
          ? Math.max(0, Math.min(100, Math.floor(val)))
          : 0;
      normalizedUpgrades[car.id] = {
        engine: clampLvl(u.engine),
        armor: clampLvl(u.armor),
        exhaustSound: clampLvl(u.exhaustSound),
        suspension: clampLvl(u.suspension),
        tires: clampLvl(u.tires),
        fuel: clampLvl(u.fuel),
      };
    }

    return {
      ...DEFAULT_SAVE_DATA,
      ...parsed,
      coins:
        typeof parsed.coins === 'number' && Number.isFinite(parsed.coins) && parsed.coins >= 0
          ? Math.floor(parsed.coins)
          : 0,
      upgrades: normalizedUpgrades,
      carColors: parsed.carColors && typeof parsed.carColors === 'object' ? parsed.carColors : {},
      inventory: {
        ...DEFAULT_SAVE_DATA.inventory,
        ...(parsed.inventory || {}),
      },
      bestDistanceByMap: {
        ...DEFAULT_SAVE_DATA.bestDistanceByMap,
        ...(parsed.bestDistanceByMap || {}),
      },
      settings: {
        ...mergedSettings,
        masterVolume:
          typeof mergedSettings.masterVolume === 'number'
            ? Math.max(0, Math.min(100, mergedSettings.masterVolume))
            : 100,
        natureVolume:
          typeof mergedSettings.natureVolume === 'number'
            ? Math.max(0, Math.min(100, mergedSettings.natureVolume))
            : 100,
        sfxVolume:
          typeof mergedSettings.sfxVolume === 'number'
            ? Math.max(0, Math.min(100, mergedSettings.sfxVolume))
            : 100,
        muted: Boolean(mergedSettings.muted),
        quality: validQualities.includes(mergedSettings.quality)
          ? mergedSettings.quality
          : 'Ultra',
        fpsLimit: validFpsLimits.includes(mergedSettings.fpsLimit)
          ? mergedSettings.fpsLimit
          : 60,
        showFpsCounter:
          typeof mergedSettings.showFpsCounter === 'boolean'
            ? mergedSettings.showFpsCounter
            : true,
        cameraShake: false,
      },
    };
  } catch {
    return structuredClone(DEFAULT_SAVE_DATA);
  }
}

export function persistSaveData(data: SaveData): void {
  try {
    const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const committedSettings = rawSettings
      ? JSON.parse(rawSettings)
      : DEFAULT_SAVE_DATA.settings;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...data,
        settings: committedSettings,
      })
    );
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

/**
 * Upgrade Pricing & Progression (Levels 0 -> 100 Max):
 * - Starting price for Level 1 (when currentLevel is 0) is 10,000 coins.
 * - Price increases by +10,000 coins for every subsequent level:
 *   Lvl 1 = 10,000, Lvl 2 = 20,000, Lvl 3 = 30,000 ... Lvl 100 = 1,000,000.
 */
export function getUpgradeCost(currentLevel: number): number {
  const safeLevel = Math.max(0, Math.min(99, Math.floor(currentLevel || 0)));
  return (safeLevel + 1) * 10000;
}
