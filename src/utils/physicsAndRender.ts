import {
  CarConfig,
  DualNeonInfo,
  GraphicsQuality,
  MapConfig,
  StarryGalaxyInfo,
  UpgradeLevels,
  getDualNeonInfo,
  getStarryGalaxyInfo,
} from '../types/game';
import bgImgGreenMountains from '../assets/images/landscape_green_mountains_1790429971198.jpg';
import bgImgAlpineValley from '../assets/images/landscape_alpine_valley_1790429984490.jpg';
import bgImgEmeraldHills from '../assets/images/landscape_emerald_hills_1790429996056.jpg';
import bgImgForestPeaks from '../assets/images/landscape_forest_peaks_1790430007672.jpg';

// ============================================================================
// STRICT STATIC MOUNTAIN & ENVIRONMENT CONSTANTS (100% FIXED BACKGROUND LAYER)
// Mountain background is rendered strictly at (0, 0) with zero update or movement variables.
// ============================================================================
const SEAMLESS_TILE_W = 1600;
const SEAMLESS_TILE_H = 900;

// ============================================================================
// REALISTIC VOLUMETRIC 3D-STYLED CLOUD ENGINE (Pre-baked Multi-Layered 3D Cumulus)
// Replaces flat 2D oval shapes with true 3D shaded volumetric clouds (Sunlit Ivory
// Upper Billows + Silver-Blue Mid Volume + Deep Slate Ambient Occlusion Underside)
// ============================================================================
const volumetricCloudCanvases: HTMLCanvasElement[] = [];
const jacarandaTreeCanvases: HTMLCanvasElement[] = [];
const sakuraTreeCanvases: HTMLCanvasElement[] = [];
const greenTreeCanvases: HTMLCanvasElement[] = [];
const orangeTreeCanvases: HTMLCanvasElement[] = [];

function buildBloomingTreeSprite(
  treeType: 'jacaranda' | 'sakura' | 'emerald_green' | 'autumn_orange',
  variant: number
): HTMLCanvasElement {
  const tw = 260;
  const th = 280;
  const c = document.createElement('canvas');
  c.width = tw;
  c.height = th;
  const g = c.getContext('2d');
  if (!g) return c;

  g.globalAlpha = 1.0;
  const cx = 130;
  const baseY = 264;
  const dir = variant % 2 === 0 ? 1 : -1;

  // 1. Solid fallen petal / leaf mound around the base of the trunk on the hill (100% Opaque)
  g.fillStyle =
    treeType === 'jacaranda'
      ? '#7C3AED'
      : treeType === 'emerald_green'
      ? '#15803D'
      : treeType === 'autumn_orange'
      ? '#C2410C'
      : '#FFE4E6';
  g.beginPath();
  g.ellipse(cx, baseY - 2, 46, 9, 0, 0, Math.PI * 2);
  g.fill();

  g.fillStyle =
    treeType === 'jacaranda'
      ? '#A78BFA'
      : treeType === 'emerald_green'
      ? '#22C55E'
      : treeType === 'autumn_orange'
      ? '#F97316'
      : '#FFFFFF';
  g.beginPath();
  g.ellipse(cx, baseY - 3, 34, 6, 0, 0, Math.PI * 2);
  g.fill();

  // 2. Sculpted organic wooden trunk & graceful spreading branches (100% Solid & Opaque)
  g.save();
  g.globalAlpha = 1.0;
  g.lineCap = 'round';
  g.lineJoin = 'round';

  const trunkGrad = g.createLinearGradient(cx - 18, 140, cx + 18, baseY);
  if (treeType === 'jacaranda') {
    trunkGrad.addColorStop(0, '#5C4033');
    trunkGrad.addColorStop(0.5, '#3E2723');
    trunkGrad.addColorStop(1, '#261612');
  } else if (treeType === 'emerald_green') {
    trunkGrad.addColorStop(0, '#5D4037');
    trunkGrad.addColorStop(0.5, '#3E2723');
    trunkGrad.addColorStop(1, '#1F110D');
  } else if (treeType === 'autumn_orange') {
    trunkGrad.addColorStop(0, '#573016');
    trunkGrad.addColorStop(0.5, '#3B1E0D');
    trunkGrad.addColorStop(1, '#1C0D06');
  } else {
    trunkGrad.addColorStop(0, '#4E342E');
    trunkGrad.addColorStop(0.5, '#351E17');
    trunkGrad.addColorStop(1, '#1F110D');
  }

  // Main trunk with flared roots
  g.fillStyle = trunkGrad;
  g.beginPath();
  g.moveTo(cx - 20, baseY);
  g.quadraticCurveTo(cx - 10 + dir * 4, 208, cx - 8 + dir * 6, 138);
  g.lineTo(cx + 8 + dir * 6, 138);
  g.quadraticCurveTo(cx + 10 + dir * 4, 208, cx + 20, baseY);
  g.closePath();
  g.fill();

  // Solid sunlit bark highlight along left side of trunk
  g.strokeStyle =
    treeType === 'jacaranda'
      ? '#8D6E63'
      : treeType === 'autumn_orange'
      ? '#9A5B32'
      : '#795548';
  g.lineWidth = 3.0;
  g.beginPath();
  g.moveTo(cx - 12, baseY - 6);
  g.quadraticCurveTo(cx - 6 + dir * 4, 205, cx - 5 + dir * 6, 142);
  g.stroke();

  g.restore();

  // 3. Smooth, Vibrant, Natural Multi-Layered Foliage Canopy (Zero black lines, zero large circular ring patterns!)
  const drawOrganicCanopyLobe = (
    lx: number,
    ly: number,
    rx: number,
    ry: number,
    rot: number = 0
  ) => {
    g.beginPath();
    g.ellipse(lx, ly, rx, ry, rot, 0, Math.PI * 2);
    g.fill();
  };

  // 3A. 100% Opaque Natural Organic Canopy Silhouette Base with Smooth Vertical Shading Gradient
  const baseCanopyGrad = g.createLinearGradient(cx, 32, cx, 168);
  if (treeType === 'jacaranda') {
    baseCanopyGrad.addColorStop(0, '#DDD6FE');
    baseCanopyGrad.addColorStop(0.35, '#A78BFA');
    baseCanopyGrad.addColorStop(0.72, '#7C3AED');
    baseCanopyGrad.addColorStop(1, '#4C1D95');
  } else if (treeType === 'emerald_green') {
    baseCanopyGrad.addColorStop(0, '#86EFAC');
    baseCanopyGrad.addColorStop(0.35, '#22C55E');
    baseCanopyGrad.addColorStop(0.72, '#15803D');
    baseCanopyGrad.addColorStop(1, '#064E3B');
  } else if (treeType === 'autumn_orange') {
    baseCanopyGrad.addColorStop(0, '#FDE047');
    baseCanopyGrad.addColorStop(0.35, '#FB923C');
    baseCanopyGrad.addColorStop(0.72, '#EA580C');
    baseCanopyGrad.addColorStop(1, '#7C2D12');
  } else {
    baseCanopyGrad.addColorStop(0, '#FFFFFF');
    baseCanopyGrad.addColorStop(0.45, '#FFF1F2');
    baseCanopyGrad.addColorStop(0.78, '#FFE4E6');
    baseCanopyGrad.addColorStop(1, '#CBD5E1');
  }

  g.fillStyle = baseCanopyGrad;
  const silhouetteLobes =
    variant % 2 === 0
      ? [
          { x: 130, y: 108, rx: 92, ry: 52, rot: 0 },
          { x: 76, y: 120, rx: 52, ry: 36, rot: -0.18 },
          { x: 184, y: 118, rx: 52, ry: 36, rot: 0.18 },
          { x: 96, y: 84, rx: 58, ry: 40, rot: -0.12 },
          { x: 164, y: 84, rx: 58, ry: 40, rot: 0.12 },
          { x: 130, y: 68, rx: 56, ry: 36, rot: 0 },
        ]
      : [
          { x: 130, y: 110, rx: 90, ry: 50, rot: 0 },
          { x: 74, y: 118, rx: 50, ry: 35, rot: -0.15 },
          { x: 186, y: 120, rx: 50, ry: 35, rot: 0.15 },
          { x: 100, y: 82, rx: 56, ry: 39, rot: -0.1 },
          { x: 162, y: 84, rx: 56, ry: 39, rot: 0.1 },
          { x: 132, y: 66, rx: 54, ry: 35, rot: 0 },
        ];
  for (const lb of silhouetteLobes) {
    drawOrganicCanopyLobe(lb.x, lb.y, lb.rx, lb.ry, lb.rot);
  }

  // 3B. Lock to 'source-atop' for Soft Feather-Blended Volumetric Highlights (100% Opaque, Zero circular edges!)
  g.save();
  g.globalCompositeOperation = 'source-atop';

  const softGlowZones = [
    { x: 128, y: 62, r: 68, tier: 'top' },
    { x: 86, y: 88, r: 58, tier: 'mid' },
    { x: 174, y: 88, r: 58, tier: 'mid' },
    { x: 130, y: 102, r: 64, tier: 'mid' },
    { x: 64, y: 118, r: 46, tier: 'side' },
    { x: 196, y: 118, r: 46, tier: 'side' },
  ];
  for (const gz of softGlowZones) {
    const rad = g.createRadialGradient(
      gz.x - gz.r * 0.18,
      gz.y - gz.r * 0.22,
      gz.r * 0.05,
      gz.x,
      gz.y,
      gz.r
    );
    if (treeType === 'jacaranda') {
      if (gz.tier === 'top') {
        rad.addColorStop(0, 'rgba(245, 243, 255, 0.92)');
        rad.addColorStop(0.5, 'rgba(196, 181, 253, 0.55)');
        rad.addColorStop(1, 'rgba(139, 92, 246, 0)');
      } else {
        rad.addColorStop(0, 'rgba(196, 181, 253, 0.72)');
        rad.addColorStop(0.55, 'rgba(139, 92, 246, 0.35)');
        rad.addColorStop(1, 'rgba(109, 40, 217, 0)');
      }
    } else if (treeType === 'emerald_green') {
      if (gz.tier === 'top') {
        rad.addColorStop(0, 'rgba(220, 252, 231, 0.9)');
        rad.addColorStop(0.5, 'rgba(74, 222, 128, 0.55)');
        rad.addColorStop(1, 'rgba(22, 163, 74, 0)');
      } else {
        rad.addColorStop(0, 'rgba(74, 222, 128, 0.7)');
        rad.addColorStop(0.55, 'rgba(34, 197, 94, 0.35)');
        rad.addColorStop(1, 'rgba(21, 128, 61, 0)');
      }
    } else if (treeType === 'autumn_orange') {
      if (gz.tier === 'top') {
        rad.addColorStop(0, 'rgba(254, 249, 195, 0.92)');
        rad.addColorStop(0.5, 'rgba(253, 186, 116, 0.55)');
        rad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      } else {
        rad.addColorStop(0, 'rgba(253, 186, 116, 0.72)');
        rad.addColorStop(0.55, 'rgba(249, 115, 22, 0.35)');
        rad.addColorStop(1, 'rgba(234, 88, 12, 0)');
      }
    } else {
      if (gz.tier === 'top') {
        rad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
        rad.addColorStop(0.55, 'rgba(255, 241, 242, 0.6)');
        rad.addColorStop(1, 'rgba(254, 205, 211, 0)');
      } else {
        rad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        rad.addColorStop(0.55, 'rgba(255, 228, 230, 0.4)');
        rad.addColorStop(1, 'rgba(254, 205, 211, 0)');
      }
    }
    g.fillStyle = rad;
    g.beginPath();
    g.arc(gz.x, gz.y, gz.r, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();

  // 4. Delicate, Natural Individual Leaf & Blossom Petals Across the Canopy (Small organic leaf shapes, zero large circles!)
  const blossomCount = 150;
  for (let i = 0; i < blossomCount; i++) {
    const angle = i * 2.39996 + variant * 1.3;
    const normR = Math.sqrt(i / blossomCount);
    const bx = cx + Math.cos(angle) * normR * 98;
    const by = 102 + Math.sin(angle) * normR * 52;
    const leafLen = 4.2 + (i % 3) * 1.3;
    const leafWid = 2.2 + (i % 2) * 0.8;
    const leafTilt = Math.sin(i * 1.7 + variant) * 0.85;

    if (treeType === 'jacaranda') {
      g.fillStyle =
        by < 88
          ? i % 2 === 0
            ? '#F5F3FF'
            : '#DDD6FE'
          : i % 3 === 0
          ? '#C4B5FD'
          : i % 2 === 0
          ? '#A78BFA'
          : '#8B5CF6';
    } else if (treeType === 'emerald_green') {
      g.fillStyle =
        by < 88
          ? i % 2 === 0
            ? '#DCFCE7'
            : '#86EFAC'
          : i % 3 === 0
          ? '#4ADE80'
          : i % 2 === 0
          ? '#22C55E'
          : '#16A34A';
    } else if (treeType === 'autumn_orange') {
      g.fillStyle =
        by < 88
          ? i % 2 === 0
            ? '#FEF9C3'
            : '#FDE047'
          : i % 3 === 0
          ? '#FDBA74'
          : i % 2 === 0
          ? '#FB923C'
          : '#F97316';
    } else {
      g.fillStyle =
        by < 88
          ? '#FFFFFF'
          : i % 3 === 0
          ? '#FFFFFF'
          : i % 2 === 0
          ? '#FFF1F2'
          : '#FECDD3';
    }
    g.beginPath();
    g.ellipse(bx, by, leafLen, leafWid, leafTilt, 0, Math.PI * 2);
    g.fill();
  }

  return c;
}

function buildVolumetric3DCloudSprite(variant: number): HTMLCanvasElement {
  const cw = 340;
  const ch = 160;
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const g = c.getContext('2d');
  if (!g) return c;

  // Define 3D puff clusters (x, y, radius, depthTier: 0=base shadow, 1=mid volume, 2=sunlit crown)
  const layouts = [
    [
      { x: 95, y: 108, r: 42, t: 0 },
      { x: 155, y: 112, r: 52, t: 0 },
      { x: 220, y: 108, r: 44, t: 0 },
      { x: 75, y: 96, r: 36, t: 1 },
      { x: 122, y: 84, r: 48, t: 1 },
      { x: 178, y: 78, r: 54, t: 1 },
      { x: 235, y: 92, r: 40, t: 1 },
      { x: 108, y: 72, r: 38, t: 2 },
      { x: 156, y: 58, r: 46, t: 2 },
      { x: 202, y: 68, r: 40, t: 2 },
      { x: 140, y: 50, r: 32, t: 2 },
    ],
    [
      { x: 85, y: 110, r: 38, t: 0 },
      { x: 145, y: 114, r: 50, t: 0 },
      { x: 210, y: 112, r: 48, t: 0 },
      { x: 258, y: 106, r: 34, t: 0 },
      { x: 98, y: 90, r: 44, t: 1 },
      { x: 152, y: 82, r: 52, t: 1 },
      { x: 208, y: 86, r: 48, t: 1 },
      { x: 128, y: 66, r: 42, t: 2 },
      { x: 182, y: 62, r: 45, t: 2 },
      { x: 226, y: 76, r: 35, t: 2 },
    ],
    [
      { x: 105, y: 110, r: 46, t: 0 },
      { x: 172, y: 112, r: 54, t: 0 },
      { x: 232, y: 108, r: 40, t: 0 },
      { x: 88, y: 92, r: 38, t: 1 },
      { x: 142, y: 76, r: 52, t: 1 },
      { x: 198, y: 80, r: 50, t: 1 },
      { x: 132, y: 58, r: 44, t: 2 },
      { x: 176, y: 54, r: 46, t: 2 },
      { x: 218, y: 72, r: 36, t: 2 },
    ],
  ];

  const puffs = layouts[variant % layouts.length];

  // Soft atmospheric horizon base cushion
  const baseGrad = g.createLinearGradient(0, 72, 0, 148);
  baseGrad.addColorStop(0, 'rgba(203, 213, 225, 0)');
  baseGrad.addColorStop(0.55, 'rgba(100, 116, 139, 0.36)');
  baseGrad.addColorStop(1, 'rgba(71, 85, 105, 0)');
  g.fillStyle = baseGrad;
  g.beginPath();
  g.roundRect(42, 78, 256, 56, 28);
  g.fill();

  for (const p of puffs) {
    // 3D off-center light source (top-left sunlit highlight -> bottom-right volumetric shadow)
    const lx = p.x - p.r * 0.28;
    const ly = p.y - p.r * 0.32;
    const rad = g.createRadialGradient(lx, ly, p.r * 0.08, p.x, p.y, p.r);

    if (p.t === 0) {
      // Deep 3D ambient-occlusion underside cloud volume
      rad.addColorStop(0, 'rgba(226, 232, 240, 0.78)');
      rad.addColorStop(0.48, 'rgba(148, 163, 184, 0.68)');
      rad.addColorStop(0.82, 'rgba(100, 116, 139, 0.42)');
      rad.addColorStop(1, 'rgba(71, 85, 105, 0)');
    } else if (p.t === 1) {
      // Mid-tier 3D billowing cloud body
      rad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
      rad.addColorStop(0.52, 'rgba(241, 245, 249, 0.82)');
      rad.addColorStop(0.84, 'rgba(186, 200, 218, 0.48)');
      rad.addColorStop(1, 'rgba(148, 163, 184, 0)');
    } else {
      // Sunlit upper cumulus crown with warm ivory rim glow
      rad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      rad.addColorStop(0.45, 'rgba(254, 252, 232, 0.9)');
      rad.addColorStop(0.78, 'rgba(226, 232, 240, 0.52)');
      rad.addColorStop(1, 'rgba(226, 232, 240, 0)');
    }

    g.fillStyle = rad;
    g.beginPath();
    g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    g.fill();
  }

  return c;
}

if (typeof window !== 'undefined') {
  for (let v = 0; v < 3; v++) {
    try {
      volumetricCloudCanvases.push(buildVolumetric3DCloudSprite(v));
    } catch {
      // ignore fallback
    }
  }
}

function ensureEnvironmentAssetsReady(): void {
  if (typeof document === 'undefined') return;
  if (volumetricCloudCanvases.length === 0) {
    for (let v = 0; v < 3; v++) {
      volumetricCloudCanvases.push(buildVolumetric3DCloudSprite(v));
    }
  }
  if (
    jacarandaTreeCanvases.length === 0 ||
    sakuraTreeCanvases.length === 0 ||
    greenTreeCanvases.length === 0 ||
    orangeTreeCanvases.length === 0
  ) {
    jacarandaTreeCanvases.length = 0;
    sakuraTreeCanvases.length = 0;
    greenTreeCanvases.length = 0;
    orangeTreeCanvases.length = 0;
    for (let v = 0; v < 2; v++) {
      jacarandaTreeCanvases.push(buildBloomingTreeSprite('jacaranda', v));
      sakuraTreeCanvases.push(buildBloomingTreeSprite('sakura', v));
      greenTreeCanvases.push(buildBloomingTreeSprite('emerald_green', v));
      orangeTreeCanvases.push(buildBloomingTreeSprite('autumn_orange', v));
    }
  }
  if (!sunWarmSpriteCanvas || !sunBrightSpriteCanvas || !moonCalmSpriteCanvas) {
    buildPrebakedCelestialSprites();
  }
  if (staticBackgroundImages.length === 0) {
    initStaticBackgroundImagesArray();
  }
}

// ============================================================================
// STATIC IMAGE CROSS-FADE BACKGROUND SYSTEM (6 Uploaded Nature Mountain Photos)
// - Old Canvas Mountain Rendering removed completely.
// - Renders 100% static full-screen background images (0, 0, canvas.width, canvas.height)
//   with zero parallax and zero movement.
// - Smoothly cross-fades between images using Opacity Interpolation (globalAlpha).
// ============================================================================
export const STATIC_BACKGROUND_IMAGE_FILES: readonly string[] = [
  bgImgGreenMountains,
  bgImgAlpineValley,
  bgImgEmeraldHills,
  bgImgForestPeaks,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
];

const STATIC_BACKGROUND_PHOTO_URLS: readonly string[] = [
  bgImgGreenMountains,
  bgImgAlpineValley,
  bgImgEmeraldHills,
  bgImgForestPeaks,
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
];

export interface StaticBackgroundEntry {
  fileName: string;
  img: HTMLImageElement;
  loaded: boolean;
  fallbackCanvas: HTMLCanvasElement;
}

export const staticBackgroundImages: StaticBackgroundEntry[] = [];
let sunWarmSpriteCanvas: HTMLCanvasElement | null = null;
let sunBrightSpriteCanvas: HTMLCanvasElement | null = null;
let moonCalmSpriteCanvas: HTMLCanvasElement | null = null;

// Dynamically lit 100% opaque tree sprite caches (synchronized with Morning/Noon, Afternoon/Sunset, Evening/Night/Dawn)
const litJacarandaTreeCanvases: HTMLCanvasElement[] = [];
const litSakuraTreeCanvases: HTMLCanvasElement[] = [];
const litGreenTreeCanvases: HTMLCanvasElement[] = [];
const litOrangeTreeCanvases: HTMLCanvasElement[] = [];
let lastLitTreeCycleBucket = -999;

interface LitTreeAtmospherePalette {
  jacarandaSprites: HTMLCanvasElement[];
  sakuraSprites: HTMLCanvasElement[];
  greenSprites: HTMLCanvasElement[];
  orangeSprites: HTMLCanvasElement[];
  jacPetal1: string;
  jacPetal2: string;
  sakPetal1: string;
  sakPetal2: string;
  greenLeaf1: string;
  greenLeaf2: string;
  orangeLeaf1: string;
  orangeLeaf2: string;
}

function getLitTreeAssets(weatherCycleSec: number): LitTreeAtmospherePalette {
  ensureEnvironmentAssetsReady();
  const cycleT =
    ((weatherCycleSec % WEATHER_CYCLE_DURATION) + WEATHER_CYCLE_DURATION) %
    WEATHER_CYCLE_DURATION;

  // Compute smooth time-of-day tree lighting factors across the 630s cycle (7 phases x 90s):
  // - Morning / Noon (90..270s): Bright and vivid (warmSunset = 0, darkShade = 0)
  // - Afternoon / Sunset (270..450s): Warm golden/amber sunset tint
  // - Evening / Night / Dawn (450..630s & 0..90s): Darker, shaded ambient tones
  let warmSunset = 0;
  let darkShade = 0;
  let dawnWarmth = 0;

  if (cycleT < 90) {
    // Phase 0 (0..90s): Dawn — transitions from shaded pre-dawn twilight into bright morning with warm sunrise rim
    const p = cycleT / 90;
    const smoothP = 0.5 - 0.5 * Math.cos(p * Math.PI);
    darkShade = (1 - smoothP) * 0.44;
    dawnWarmth = Math.sin(p * Math.PI) * 0.28;
  } else if (cycleT < 270) {
    // Phase 1 & 2 (90..270s): Morning & Noon — 100% bright and vivid!
    warmSunset = 0;
    darkShade = 0;
  } else if (cycleT < 360) {
    // Phase 3 (270..360s): Afternoon — gradual warm golden-amber tint
    const p = (cycleT - 270) / 90;
    const smoothP = 0.5 - 0.5 * Math.cos(p * Math.PI);
    warmSunset = smoothP * 0.34;
    darkShade = smoothP * 0.08;
  } else if (cycleT < 450) {
    // Phase 4 (360..450s): Sunset — rich warm sunset orange/crimson tint transitioning into dusk shade
    const p = (cycleT - 360) / 90;
    const smoothP = 0.5 - 0.5 * Math.cos(p * Math.PI);
    warmSunset = 0.34 + Math.sin(p * Math.PI) * 0.14 - smoothP * 0.18;
    darkShade = 0.08 + smoothP * 0.32;
  } else if (cycleT < 540) {
    // Phase 5 (450..540s): Evening — sunset warmth fades into darker shaded ambient evening tone
    const p = (cycleT - 450) / 90;
    const smoothP = 0.5 - 0.5 * Math.cos(p * Math.PI);
    warmSunset = (1 - smoothP) * 0.16;
    darkShade = 0.4 + smoothP * 0.18;
  } else {
    // Phase 6 (540..630s): Night — deep shaded ambient night tone
    const p = (cycleT - 540) / 90;
    const smoothP = 0.5 - 0.5 * Math.cos(p * Math.PI);
    darkShade = 0.58 - smoothP * 0.14;
  }

  const bucket = Math.round(cycleT * 2);
  if (
    bucket !== lastLitTreeCycleBucket ||
    litJacarandaTreeCanvases.length === 0 ||
    litSakuraTreeCanvases.length === 0 ||
    litGreenTreeCanvases.length === 0 ||
    litOrangeTreeCanvases.length === 0
  ) {
    lastLitTreeCycleBucket = bucket;
    const count = jacarandaTreeCanvases.length;
    for (let i = 0; i < count; i++) {
      if (!litJacarandaTreeCanvases[i]) {
        const c1 = document.createElement('canvas');
        c1.width = jacarandaTreeCanvases[i].width;
        c1.height = jacarandaTreeCanvases[i].height;
        litJacarandaTreeCanvases[i] = c1;
      }
      if (!litSakuraTreeCanvases[i]) {
        const c2 = document.createElement('canvas');
        c2.width = sakuraTreeCanvases[i].width;
        c2.height = sakuraTreeCanvases[i].height;
        litSakuraTreeCanvases[i] = c2;
      }
      if (!litGreenTreeCanvases[i]) {
        const c3 = document.createElement('canvas');
        c3.width = greenTreeCanvases[i].width;
        c3.height = greenTreeCanvases[i].height;
        litGreenTreeCanvases[i] = c3;
      }
      if (!litOrangeTreeCanvases[i]) {
        const c4 = document.createElement('canvas');
        c4.width = orangeTreeCanvases[i].width;
        c4.height = orangeTreeCanvases[i].height;
        litOrangeTreeCanvases[i] = c4;
      }

      const applyLightingToSprite = (
        src: HTMLCanvasElement,
        dst: HTMLCanvasElement
      ) => {
        const g = dst.getContext('2d');
        if (!g) return;
        g.save();
        g.clearRect(0, 0, dst.width, dst.height);
        g.globalAlpha = 1.0;
        g.globalCompositeOperation = 'source-over';
        g.drawImage(src, 0, 0);

        // Lock to 'source-atop' so every pixel of the tree stays 100% opaque (Alpha = 1.0)
        // while its RGB brightness and color shade dynamically match the time of day!
        g.globalCompositeOperation = 'source-atop';

        if (warmSunset > 0.005 || dawnWarmth > 0.005) {
          const wAmt = Math.min(0.48, warmSunset + dawnWarmth);
          const warmGrad = g.createLinearGradient(0, 0, 0, dst.height);
          warmGrad.addColorStop(0, `rgba(251, 146, 60, ${wAmt})`);
          warmGrad.addColorStop(0.6, `rgba(234, 88, 12, ${wAmt * 0.88})`);
          warmGrad.addColorStop(1, `rgba(154, 52, 18, ${wAmt * 0.72})`);
          g.fillStyle = warmGrad;
          g.fillRect(0, 0, dst.width, dst.height);
        }

        if (darkShade > 0.005) {
          const shadeGrad = g.createLinearGradient(0, 0, 0, dst.height);
          shadeGrad.addColorStop(0, `rgba(10, 22, 52, ${darkShade * 0.88})`);
          shadeGrad.addColorStop(0.55, `rgba(8, 16, 40, ${darkShade * 0.96})`);
          shadeGrad.addColorStop(1, `rgba(4, 10, 26, ${Math.min(0.68, darkShade * 1.06)})`);
          g.fillStyle = shadeGrad;
          g.fillRect(0, 0, dst.width, dst.height);
        }

        g.restore();
      };

      applyLightingToSprite(jacarandaTreeCanvases[i], litJacarandaTreeCanvases[i]);
      applyLightingToSprite(sakuraTreeCanvases[i], litSakuraTreeCanvases[i]);
      applyLightingToSprite(greenTreeCanvases[i], litGreenTreeCanvases[i]);
      applyLightingToSprite(orangeTreeCanvases[i], litOrangeTreeCanvases[i]);
    }
  }

  // Compute synchronized solid petal & leaf colors for Morning/Noon, Afternoon/Sunset, and Evening/Night/Dawn
  const totalWarm = Math.min(1, (warmSunset + dawnWarmth) * 1.6);
  const totalDark = Math.min(1, darkShade * 1.35);

  const tintRgb = (
    base: readonly [number, number, number],
    sunsetTarget: readonly [number, number, number],
    nightTarget: readonly [number, number, number]
  ): string => {
    const wR = base[0] + (sunsetTarget[0] - base[0]) * totalWarm;
    const wG = base[1] + (sunsetTarget[1] - base[1]) * totalWarm;
    const wB = base[2] + (sunsetTarget[2] - base[2]) * totalWarm;
    const fR = (wR + (nightTarget[0] - wR) * totalDark) | 0;
    const fG = (wG + (nightTarget[1] - wG) * totalDark) | 0;
    const fB = (wB + (nightTarget[2] - wB) * totalDark) | 0;
    return `rgb(${fR},${fG},${fB})`;
  };

  return {
    jacarandaSprites:
      litJacarandaTreeCanvases.length > 0
        ? litJacarandaTreeCanvases
        : jacarandaTreeCanvases,
    sakuraSprites:
      litSakuraTreeCanvases.length > 0
        ? litSakuraTreeCanvases
        : sakuraTreeCanvases,
    greenSprites:
      litGreenTreeCanvases.length > 0
        ? litGreenTreeCanvases
        : greenTreeCanvases,
    orangeSprites:
      litOrangeTreeCanvases.length > 0
        ? litOrangeTreeCanvases
        : orangeTreeCanvases,
    jacPetal1: tintRgb([196, 181, 253], [244, 162, 184], [92, 78, 148]),
    jacPetal2: tintRgb([139, 92, 246], [192, 104, 158], [62, 46, 115]),
    sakPetal1: tintRgb([255, 255, 255], [254, 215, 170], [148, 163, 196]),
    sakPetal2: tintRgb([255, 228, 230], [253, 186, 140], [126, 138, 174]),
    greenLeaf1: tintRgb([134, 239, 172], [253, 224, 71], [22, 101, 52]),
    greenLeaf2: tintRgb([34, 197, 94], [234, 179, 8], [20, 83, 45]),
    orangeLeaf1: tintRgb([253, 186, 116], [251, 146, 60], [154, 52, 18]),
    orangeLeaf2: tintRgb([249, 115, 22], [234, 88, 12], [124, 45, 18]),
  };
}

function buildPrebakedCelestialSprites(): void {
  // 1. Warm Sunrise / Sunset Sun Sprite (100% Solid Opaque Solar Core + Glowing Outer Light Aura)
  const sw = document.createElement('canvas');
  sw.width = 320;
  sw.height = 320;
  const g1 = sw.getContext('2d');
  if (g1) {
    const cx = 160;
    const cy = 160;
    const halo = g1.createRadialGradient(cx, cy, 36, cx, cy, 155);
    halo.addColorStop(0, 'rgba(255, 247, 237, 0.95)');
    halo.addColorStop(0.22, 'rgba(253, 186, 116, 0.78)');
    halo.addColorStop(0.5, 'rgba(249, 115, 22, 0.38)');
    halo.addColorStop(0.78, 'rgba(234, 88, 12, 0.14)');
    halo.addColorStop(1, 'rgba(154, 52, 18, 0)');
    g1.fillStyle = halo;
    g1.beginPath();
    g1.arc(cx, cy, 155, 0, Math.PI * 2);
    g1.fill();

    // 100% Solid Opaque Warm Solar Disc (Alpha = 1.0 across entire disc)
    g1.globalAlpha = 1.0;
    const disc = g1.createRadialGradient(cx, cy, 4, cx, cy, 40);
    disc.addColorStop(0, '#FFFFFF');
    disc.addColorStop(0.55, '#FEF08A');
    disc.addColorStop(0.85, '#FDBA74');
    disc.addColorStop(1, '#F97316');
    g1.fillStyle = disc;
    g1.beginPath();
    g1.arc(cx, cy, 40, 0, Math.PI * 2);
    g1.fill();
  }
  sunWarmSpriteCanvas = sw;

  // 2. Bright Noon / Afternoon Sun Sprite (100% Solid Opaque Solar Core + Glowing Corona Aura)
  const sb = document.createElement('canvas');
  sb.width = 360;
  sb.height = 360;
  const g2 = sb.getContext('2d');
  if (g2) {
    const cx = 180;
    const cy = 180;
    const halo = g2.createRadialGradient(cx, cy, 38, cx, cy, 175);
    halo.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
    halo.addColorStop(0.24, 'rgba(254, 249, 195, 0.82)');
    halo.addColorStop(0.54, 'rgba(253, 224, 71, 0.34)');
    halo.addColorStop(0.82, 'rgba(250, 204, 21, 0.12)');
    halo.addColorStop(1, 'rgba(250, 204, 21, 0)');
    g2.fillStyle = halo;
    g2.beginPath();
    g2.arc(cx, cy, 175, 0, Math.PI * 2);
    g2.fill();

    // 100% Solid Opaque Radiant White-Gold Solar Disc (Alpha = 1.0)
    g2.globalAlpha = 1.0;
    const disc = g2.createRadialGradient(cx, cy, 4, cx, cy, 42);
    disc.addColorStop(0, '#FFFFFF');
    disc.addColorStop(0.7, '#FFFBEB');
    disc.addColorStop(1, '#FEF08A');
    g2.fillStyle = disc;
    g2.beginPath();
    g2.arc(cx, cy, 42, 0, Math.PI * 2);
    g2.fill();
  }
  sunBrightSpriteCanvas = sb;

  // 3. Calm Silvery Night Moon Sprite (Realistic Moon disc with mare craters & soft lunar halo)
  const mc = document.createElement('canvas');
  mc.width = 280;
  mc.height = 280;
  const g3 = mc.getContext('2d');
  if (g3) {
    const cx = 140;
    const cy = 140;
    const halo = g3.createRadialGradient(cx, cy, 10, cx, cy, 130);
    halo.addColorStop(0, 'rgba(248, 250, 252, 0.92)');
    halo.addColorStop(0.25, 'rgba(224, 242, 254, 0.54)');
    halo.addColorStop(0.58, 'rgba(186, 230, 253, 0.18)');
    halo.addColorStop(1, 'rgba(56, 189, 248, 0)');
    g3.fillStyle = halo;
    g3.beginPath();
    g3.arc(cx, cy, 130, 0, Math.PI * 2);
    g3.fill();

    // Luminous Silvery-Ivory Moon Disc
    const disc = g3.createRadialGradient(cx - 6, cy - 6, 4, cx, cy, 28);
    disc.addColorStop(0, '#FFFFFF');
    disc.addColorStop(0.75, '#F1F5F9');
    disc.addColorStop(1, '#CBD5E1');
    g3.fillStyle = disc;
    g3.beginPath();
    g3.arc(cx, cy, 28, 0, Math.PI * 2);
    g3.fill();

    // Subtle realistic lunar craters (Lunar Mare)
    g3.fillStyle = 'rgba(100, 116, 139, 0.24)';
    g3.beginPath();
    g3.arc(cx - 8, cy - 5, 6.2, 0, Math.PI * 2);
    g3.arc(cx + 7, cy + 6, 7.8, 0, Math.PI * 2);
    g3.arc(cx + 5, cy - 9, 4.2, 0, Math.PI * 2);
    g3.arc(cx - 5, cy + 9, 3.8, 0, Math.PI * 2);
    g3.fill();
  }
  moonCalmSpriteCanvas = mc;
}

function buildStaticPhotoFallbackCanvas(index: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 1600;
  c.height = 900;
  const g = c.getContext('2d');
  if (!g) return c;

  // Distinct natural color palettes matching each of the 6 uploaded nature photographs
  const palettes = [
    { skyT: '#8FA3B8', skyM: '#B8C9D9', skyB: '#D9E4EC', far: '#4A6B82', mid: '#568259', near: '#1E5622' },
    { skyT: '#2563EB', skyM: '#60A5FA', skyB: '#DBEAFE', far: '#476A6F', mid: '#3B7A3E', near: '#1B4D20' },
    { skyT: '#3B82F6', skyM: '#93C5FD', skyB: '#E0F2FE', far: '#3B6E8C', mid: '#1E4D2B', near: '#4D9E2A' },
    { skyT: '#4F7CAC', skyM: '#89B0D6', skyB: '#D0E1F2', far: '#1E4631', mid: '#163826', near: '#2D6A32' },
    { skyT: '#4A7C9B', skyM: '#8BB3CC', skyB: '#DFECE6', far: '#3E6B73', mid: '#2E5A36', near: '#4E8C35' },
    { skyT: '#2B6CB0', skyM: '#63B3ED', skyB: '#EBF8FF', far: '#3D6B82', mid: '#38763D', near: '#5CA437' },
  ];
  const pal = palettes[index % palettes.length];

  const skyG = g.createLinearGradient(0, 0, 0, 520);
  skyG.addColorStop(0, pal.skyT);
  skyG.addColorStop(0.55, pal.skyM);
  skyG.addColorStop(1, pal.skyB);
  g.fillStyle = skyG;
  g.fillRect(0, 0, 1600, 900);

  // Soft natural clouds in the upper sky
  g.fillStyle = 'rgba(255, 255, 255, 0.78)';
  for (let i = 0; i < 5; i++) {
    const cx = 180 + i * 310 + (index * 53) % 90;
    const cy = 95 + ((i + index) % 3) * 42;
    g.beginPath();
    g.arc(cx, cy, 56, 0, Math.PI * 2);
    g.arc(cx + 52, cy - 14, 72, 0, Math.PI * 2);
    g.arc(cx + 110, cy, 52, 0, Math.PI * 2);
    g.fill();
  }

  // Far highland horizon (100% periodic over 1600px for seamless horizontal wrap)
  const tau = (Math.PI * 2) / 1600;
  g.fillStyle = pal.far;
  g.beginPath();
  g.moveTo(0, 900);
  for (let x = 0; x <= 1600; x += 32) {
    const y =
      360 -
      Math.sin(x * tau * 2 + index * 1.1) * 46 -
      Math.cos(x * tau * 3 + index) * 22;
    g.lineTo(x, y);
  }
  g.lineTo(1600, 900);
  g.closePath();
  g.fill();

  // Mid lush green valley slopes (100% periodic over 1600px)
  g.fillStyle = pal.mid;
  g.beginPath();
  g.moveTo(0, 900);
  for (let x = 0; x <= 1600; x += 32) {
    const y =
      450 -
      Math.cos(x * tau * 2 + index * 1.7) * 40 -
      Math.sin(x * tau * 4 + index) * 18;
    g.lineTo(x, y);
  }
  g.lineTo(1600, 900);
  g.closePath();
  g.fill();

  // Subtle mountain valley fog/mist ribbon between mid and near ridges
  const midMistGrad = g.createLinearGradient(0, 410, 0, 565);
  midMistGrad.addColorStop(0, 'rgba(241, 245, 249, 0)');
  midMistGrad.addColorStop(0.5, 'rgba(241, 245, 249, 0.34)');
  midMistGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');
  g.fillStyle = midMistGrad;
  g.fillRect(0, 410, 1600, 155);

  // Near emerald meadow & forest canopy (100% periodic over 1600px)
  g.fillStyle = pal.near;
  g.beginPath();
  g.moveTo(0, 900);
  for (let x = 0; x <= 1600; x += 32) {
    const y = 540 - Math.sin(x * tau * 2 + index * 2.3) * 26;
    g.lineTo(x, y);
  }
  g.lineTo(1600, 900);
  g.closePath();
  g.fill();

  // Lower valley mist clouds in the deep mountain gorge zone (visible under bridges)
  const lowMistGrad = g.createLinearGradient(0, 515, 0, 790);
  lowMistGrad.addColorStop(0, 'rgba(226, 232, 240, 0)');
  lowMistGrad.addColorStop(0.45, 'rgba(241, 245, 249, 0.38)');
  lowMistGrad.addColorStop(0.75, 'rgba(226, 232, 240, 0.24)');
  lowMistGrad.addColorStop(1, 'rgba(226, 232, 240, 0)');
  g.fillStyle = lowMistGrad;
  g.fillRect(0, 515, 1600, 275);

  return c;
}

function initStaticBackgroundImagesArray(): void {
  if (typeof document === 'undefined' || staticBackgroundImages.length > 0) return;

  for (let i = 0; i < STATIC_BACKGROUND_IMAGE_FILES.length; i++) {
    const fileName = STATIC_BACKGROUND_IMAGE_FILES[i];
    const remoteUrl = STATIC_BACKGROUND_PHOTO_URLS[i % STATIC_BACKGROUND_PHOTO_URLS.length];
    const fallbackCanvas = buildStaticPhotoFallbackCanvas(i);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const entry: StaticBackgroundEntry = {
      fileName,
      img,
      loaded: false,
      fallbackCanvas,
    };

    let triedRemoteFallback = false;
    img.onload = () => {
      entry.loaded = true;
    };
    img.onerror = () => {
      if (!triedRemoteFallback) {
        triedRemoteFallback = true;
        img.src = remoteUrl;
      }
    };

    // Load the attached local filename first; if not present in the directory, fallback to the matching high-res photo
    img.src = fileName;
    staticBackgroundImages.push(entry);
  }
}

if (typeof window !== 'undefined') {
  try {
    ensureEnvironmentAssetsReady();
  } catch {
    // ignore fallback
  }
}

// Pre-allocated module-level buffers & Zero-Allocation Obstacle Helpers for locked 60 FPS!
const reusableVisibleObstacles: TrackObstacle[] = [];
const reusableRoadSamples: { wx: number; gy: number; onBridge: boolean }[] = [];

function isNearBridgeFast(
  wx: number,
  pad: number,
  obstacles: TrackObstacle[]
): boolean {
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (
      o.type === 'suspension_bridge' &&
      Math.abs(wx - o.x) < o.width * 0.5 + pad
    ) {
      return true;
    }
  }
  return false;
}

function isNearBridgeOrDipFast(
  wx: number,
  pad: number,
  obstacles: TrackObstacle[]
): boolean {
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (
      (o.type === 'suspension_bridge' ||
        o.type === 'pit_small' ||
        o.type === 'pit_medium') &&
      Math.abs(wx - o.x) < o.width * 0.5 + pad
    ) {
      return true;
    }
  }
  return false;
}

function isNearAnyObstacleFast(
  wx: number,
  pad: number,
  obstacles: TrackObstacle[]
): boolean {
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (Math.abs(wx - o.x) < o.width * 0.5 + pad) {
      return true;
    }
  }
  return false;
}

export interface PickupItem {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'fuel' | 'repair';
  value: number;
  radius: number;
  collected: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  isSpark?: boolean;
  isSmoke?: boolean;
}

export interface LightningSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
}

export type ObstacleType =
  | 'rock_small'
  | 'rock_medium'
  | 'rock_large'
  | 'mud_puddle'
  | 'pit_small'
  | 'pit_medium'
  | 'gap_jump'
  | 'suspension_bridge';

export interface TrackObstacle {
  id: number;
  type: ObstacleType;
  x: number; // Center X of the obstacle
  width: number; // Span width or rock diameter
  height: number; // Rock height or pit/chasm depth
  rockFacets: number[]; // Vertex radial multipliers for distinct rock shapes
  bridgeSag: number; // Dynamic weight depression on suspension bridges
  bridgeSagVel: number;
  cleared: boolean;
}

export interface DetachedCarPart {
  id: number;
  type: 'front_bumper' | 'rear_bumper' | 'hood' | 'side_door' | 'glass_shard';
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angVel: number;
  width: number;
  height: number;
  color: string;
  accentColor: string;
  alpha: number;
}

export interface PhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  prevVx: number;
  prevVy: number;
  angle: number;
  angVel: number;
  wheelRotation: number;
  rearCompression: number;
  frontCompression: number;
  rearSpringVel: number;
  frontSpringVel: number;
  groundedRear: boolean;
  groundedFront: boolean;
  wasAirborne: boolean;
  peakAirVy: number;
  peakAirTime: number;
  wasGasPressed: boolean;
  backfireFlash: number;
  // Camera Shake permanently disabled (0) for crystal-clear vision
  shakeTrauma: number;
  shakeOffsetX: number;
  shakeOffsetY: number;
  shakeVelX: number;
  shakeVelY: number;
  shakeAngle: number;
  impactCooldown: number;
  inMud: boolean;
  inWaterPit: boolean;
  mudDirtiness: number; // 0..1 (Mud accumulated on car & wheels, washed away in water pits!)
  onBridge: boolean;
  // Driver Inertia & Chassis Weight Transfer Physics (Suspension Pitch / Squat & Dive)
  driverLean: number;
  driverLeanVel: number;
  driverBobY: number;
  driverBobVel: number;
  weightTransferPitch: number;
  weightTransferVel: number;
  // Dynamic 5-Minute Weather & Night Ambience System (Day -> Rain Clouds -> Stormy Night -> Starry Night)
  weatherCycleSec: number;
  cloudDarkness: number; // 0..1
  rainIntensity: number; // 0..1
  nightFactor: number; // 0..1 (Night Ambience + Smart Headlights/Taillights)
  headlightsOn: boolean;
  headlightsBroken: boolean; // True when strong front impact shatters headlights (won't turn on at night until repaired!)
  lightningFlash: number; // 0..1 subtle-to-medium scene & cloud illumination
  lightningBolt: LightningSegment[];
  lightningCountdown: number;
  weatherLabel: string;
  // Flying Car Transformation & 2-Minute (120s) High-Sky Flight System
  flightPhase: 'none' | 'transform_takeoff' | 'flying' | 'transform_landing';
  flightTimer: number; // 120s (02:00) countdown timer
  wingDeployProgress: number; // 0..1 mechanical wing unfolding/folding progress
  wheelRetractProgress: number; // 0..1 mechanical wheel retraction inside chassis (0 = deployed, 1 = retracted inside body)
  landingTouchedDown: boolean; // True once landing gear tires touch the asphalt during landing sequence
  cutsceneTimer: number; // Slow-mo cinematic transformation timer
  repairPickupTimer: number; // Spawns Repair Wrench pickup on road every 120s (2 minutes)
  // Progressive Vehicle Structural Health, Part Disassembly, Smoke & Explosion (Smoke/Explosion ONLY at 0% Health)
  health: number; // 0..100
  frontDamage: number; // 0..1
  rearDamage: number; // 0..1
  roofDamage: number; // 0..1
  doorDamage: number; // 0..1
  windowCracked: boolean;
  windowShattered: boolean; // True when side/windshield glass shatters & falls out completely
  frontBumperState: 'intact' | 'hanging' | 'detached';
  rearBumperState: 'intact' | 'hanging' | 'detached';
  hoodState: 'intact' | 'open' | 'detached';
  doorState: 'intact' | 'broken' | 'detached';
  detachedParts: DetachedCarPart[];
  isExploded: boolean;
  explosionTimer: number;
  explosionReason: string;
  smokeSpawnAcc: number;
  fuel: number;
  maxFuel: number;
  nitro: number;
  distance: number;
  maxDistance: number;
  sessionCoins: number;
  airTime: number;
  flipsCount: number;
  accumulatedAirAngle: number;
  upsideDownTimer: number;
  nextSpawnX: number;
  nextObstacleX: number;
  nextEntityId: number;
  obstacles: TrackObstacle[];
  pickups: PickupItem[];
  floatingTexts: FloatingText[];
  particles: Particle[];
}

// Persistent Realistic Solar & Lunar Cycle Clock across sessions:
// Each phase (Dawn, Morning, Noon, Afternoon, Sunset, Evening, Night) lasts 1.5 minutes (90 seconds)!
const WEATHER_PHASE_DURATION = 90; // 90 seconds (1.5 minutes) per phase
const WEATHER_CYCLE_DURATION = WEATHER_PHASE_DURATION * 7; // 630 seconds total across 7 phases
let persistentWeatherClockSec = 25; // Starts in warm Dawn/Sunrise transitioning smoothly into Morning

function lerpRgbTuple(
  c1: readonly [number, number, number],
  c2: readonly [number, number, number],
  t: number
): string {
  const clamped = t <= 0 ? 0 : t >= 1 ? 1 : t;
  const r = (c1[0] + (c2[0] - c1[0]) * clamped) | 0;
  const g = (c1[1] + (c2[1] - c1[1]) * clamped) | 0;
  const b = (c1[2] + (c2[2] - c1[2]) * clamped) | 0;
  return `rgb(${r},${g},${b})`;
}

// Pre-parsed RGB keyframes for Zero-Allocation, Zero-Lag Weather Transitions!
const WEATHER_KEYFRAMES = [
  {
    // 0s: الفجر / الشروق (Dawn & Sunrise — Warm Sunrise Orange Gradient + Radiant Sun rising)
    skyTop: [180, 68, 24] as const,
    skyMid: [249, 115, 22] as const,
    skyBottom: [254, 215, 102] as const,
    sunAlt: 0.68,
    sunDisc: [253, 186, 116] as const,
    sunGlow: 'rgba(251, 146, 60, 0.9)',
    night: 0.04,
    clouds: 0.0,
    rain: 0,
  },
  {
    // 20s: الصباح الذهبي المشرق (Morning — Warm Sunrise transitioning into Bright Sunny Day)
    skyTop: [14, 116, 190] as const,
    skyMid: [56, 189, 248] as const,
    skyBottom: [254, 240, 138] as const,
    sunAlt: 0.32,
    sunDisc: [254, 240, 138] as const,
    sunGlow: 'rgba(254, 240, 138, 0.94)',
    night: 0,
    clouds: 0,
    rain: 0,
  },
  {
    // 40s: النهار / الظهر الساطع (Sunny Daytime — Crisp Azure Blue Sky with Full Bright Radiant Sun)
    skyTop: [2, 132, 199] as const,
    skyMid: [56, 189, 248] as const,
    skyBottom: [224, 242, 254] as const,
    sunAlt: 0.12,
    sunDisc: [255, 255, 255] as const,
    sunGlow: 'rgba(254, 249, 195, 0.98)',
    night: 0,
    clouds: 0,
    rain: 0,
  },
  {
    // 60s: العصر الذهبي (Late Afternoon — Golden Sunlight & Warm Horizon)
    skyTop: [12, 94, 168] as const,
    skyMid: [96, 165, 250] as const,
    skyBottom: [253, 224, 112] as const,
    sunAlt: 0.28,
    sunDisc: [254, 240, 138] as const,
    sunGlow: 'rgba(251, 191, 36, 0.92)',
    night: 0.04,
    clouds: 0.04,
    rain: 0,
  },
  {
    // Phase 4 (360..450s): المساء / المغرب (Evening / Sunset — Uniform Light Rain Showers with Gentle Wind)
    skyTop: [15, 32, 72] as const,
    skyMid: [154, 58, 76] as const,
    skyBottom: [249, 115, 22] as const,
    sunAlt: 0.72,
    sunDisc: [249, 115, 22] as const,
    sunGlow: 'rgba(234, 88, 12, 0.84)',
    night: 0.44,
    clouds: 0.34,
    rain: 0.28,
  },
  {
    // Phase 5 (450..540s): الليل / العشاء (Night / Isha — Uniform Light Rain & Gentle Wind)
    skyTop: [10, 24, 58] as const,
    skyMid: [24, 44, 88] as const,
    skyBottom: [64, 62, 108] as const,
    sunAlt: 1.05,
    sunDisc: [224, 242, 254] as const,
    sunGlow: 'rgba(186, 230, 253, 0.25)',
    night: 0.8,
    clouds: 0.38,
    rain: 0.28,
  },
  {
    // Phase 6 (540..630s): منتصف الليل (Midnight — Uniform Light Rain & Gentle Wind)
    skyTop: [6, 15, 38] as const,
    skyMid: [12, 28, 64] as const,
    skyBottom: [24, 48, 94] as const,
    sunAlt: 1.35,
    sunDisc: [224, 242, 254] as const,
    sunGlow: 'rgba(186, 230, 253, 0)',
    night: 0.96,
    clouds: 0.42,
    rain: 0.28,
  },
] as const;

export function advanceWeatherPhaseManual(state?: PhysicsState | null): string {
  // Step cleanly across the 7 canonical times of day (each 90 seconds = 1.5 minutes):
  // 1) الفجر (0..90) -> 2) الصباح (90..180) -> 3) الظهر (180..270) -> 4) العصر (270..360) -> 5) المغرب (360..450) -> 6) المساء (450..540) -> 7) الليل (540..630)
  const mod =
    ((persistentWeatherClockSec % WEATHER_CYCLE_DURATION) +
      WEATHER_CYCLE_DURATION) %
    WEATHER_CYCLE_DURATION;
  const currentPhase = Math.floor(mod / WEATHER_PHASE_DURATION);
  const nextPhase = (currentPhase + 1) % 7;
  persistentWeatherClockSec = nextPhase * WEATHER_PHASE_DURATION + 20;

  const info = getWeatherPhaseInfo(persistentWeatherClockSec);
  if (state) {
    state.weatherCycleSec = persistentWeatherClockSec;
    state.cloudDarkness = info.cloudDarkness;
    state.rainIntensity = info.rainIntensity;
    state.nightFactor = info.nightFactor;
    state.headlightsOn = !state.headlightsBroken && info.headlightsOn;
    state.weatherLabel = info.label;
  }
  return info.label;
}

export function getWeatherPhaseInfo(cycleSec: number): {
  cloudDarkness: number;
  rainIntensity: number;
  nightFactor: number;
  headlightsOn: boolean;
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  sunAltitude: number;
  sunDiscColor: string;
  sunGlowColor: string;
  label: string;
} {
  const t =
    ((cycleSec % WEATHER_CYCLE_DURATION) + WEATHER_CYCLE_DURATION) %
    WEATHER_CYCLE_DURATION;

  const phaseCount = WEATHER_KEYFRAMES.length; // 7 phases, each 90s (1.5 minutes)
  const phaseIndex = Math.min(
    phaseCount - 1,
    Math.floor(t / WEATHER_PHASE_DURATION)
  );
  const nextIndex = (phaseIndex + 1) % phaseCount;
  const rawP =
    (t - phaseIndex * WEATHER_PHASE_DURATION) / WEATHER_PHASE_DURATION;
  // Smooth cosine interpolation between time-of-day phases over each 90-second (1.5-minute) interval
  const p = 0.5 - 0.5 * Math.cos(rawP * Math.PI);

  const cur = WEATHER_KEYFRAMES[phaseIndex];
  const nxt = WEATHER_KEYFRAMES[nextIndex];

  const skyTop = lerpRgbTuple(cur.skyTop, nxt.skyTop, p);
  const skyMid = lerpRgbTuple(cur.skyMid, nxt.skyMid, p);
  const skyBottom = lerpRgbTuple(cur.skyBottom, nxt.skyBottom, p);
  const sunAltitude = cur.sunAlt + (nxt.sunAlt - cur.sunAlt) * p;
  const sunDiscColor = lerpRgbTuple(cur.sunDisc, nxt.sunDisc, p);
  const nightFactor = cur.night + (nxt.night - cur.night) * p;
  const cloudDarkness = cur.clouds + (nxt.clouds - cur.clouds) * p;
  // Uniform Gentle Wet Weather Curve:
  // - Daytime (0..350s): Dry (0)
  // - Evening / Sunset (Maghrib, 360..450s), Night (Isha, 450..540s), and Midnight (540..630s):
  //   Locked to a consistent light/gentle rain intensity (0.28) and gentle wind across all three phases!
  let rainIntensity = cur.rain + (nxt.rain - cur.rain) * p;
  if (phaseIndex >= 4) {
    rainIntensity = 0.28;
  } else if (phaseIndex === 3 && rawP < 0.82) {
    rainIntensity = 0;
  } else if (phaseIndex === 3) {
    rainIntensity = ((rawP - 0.82) / 0.18) * 0.28;
  }

  // Headlights & Red Taillights turn ON automatically during Dawn/Fajr (0..90s), Sunset (360..450s), Evening (450..540s), and Night (540..630s)
  const headlightsOn = t < 90 || t >= 355;

  let label = '☀️ الصباح المشرق · الأضواء مطفأة';
  if (phaseIndex === 0) {
    label = '🌅 الفجر · تشغيل الأضواء تلقائياً';
  } else if (phaseIndex === 1) {
    label = '☀️ الصباح · أضواء مطفأة';
  } else if (phaseIndex === 2) {
    label = '🌞 الظهر الساطع · أضواء مطفأة';
  } else if (phaseIndex === 3) {
    label = '🌤️ العصر الذهبي · أضواء مطفأة';
  } else if (phaseIndex === 4) {
    label = '🌦️ المساء (المغرب) · أمطار خفيفة ورياح هادئة';
  } else if (phaseIndex === 5) {
    label = '🌧️ الليل (العشاء) · أمطار خفيفة ورياح هادئة';
  } else {
    label = '🌧️ منتصف الليل · أمطار خفيفة ورياح هادئة';
  }

  return {
    cloudDarkness,
    rainIntensity,
    nightFactor,
    headlightsOn,
    skyTop,
    skyMid,
    skyBottom,
    sunAltitude,
    sunDiscColor,
    sunGlowColor: cur.sunGlow,
    label,
  };
}

/**
 * Automated Day/Night Street & Bridge Light Control:
 * - AUTOMATIC ON: Sunset/Dusk (360..450s), Evening/Isha (450..540s), Midnight (540..630s), and Dawn/Fajr (0..90s)
 * - AUTOMATIC OFF: Morning (90..180s), Noon (180..270s), and Afternoon (270..348s)
 * - FLICKER-FREE TRANSITION: Seamless C1-continuous smoothstep fade-in as dusk approaches (348..376s)
 *   and smoothstep fade-out as the sun rises at the end of dawn (65..90s).
 */
export function getStreetLightState(weatherCycleSec: number): {
  isOn: boolean;
  intensity: number;
} {
  const cycleT =
    ((weatherCycleSec % WEATHER_CYCLE_DURATION) + WEATHER_CYCLE_DURATION) %
    WEATHER_CYCLE_DURATION;
  // AUTOMATIC OFF during daylight hours: Morning, Noon, and Afternoon (90..348s)
  if (cycleT >= 90 && cycleT < 348) {
    return { isOn: false, intensity: 0 };
  }
  // Smooth C1-continuous fade-in as Sunset/Dusk approaches (348..376s)
  if (cycleT >= 348 && cycleT < 376) {
    const u = (cycleT - 348) / 28;
    const intensity = u * u * (3 - 2 * u);
    return { isOn: intensity > 0.005, intensity };
  }
  // Smooth C1-continuous fade-out as the sun rises at the end of Dawn (65..90s)
  if (cycleT >= 65 && cycleT < 90) {
    const u = (90 - cycleT) / 25;
    const intensity = u * u * (3 - 2 * u);
    return { isOn: intensity > 0.005, intensity };
  }
  // 100% steady full illumination during Sunset/Dusk, Evening/Isha, Midnight, and Early Dawn
  return { isOn: true, intensity: 1.0 };
}

export const STREET_LIGHT_INTERVAL = 185;
export const STREET_LIGHT_START_X = 0;
export const STREET_LIGHT_POLE_HEIGHT = 196;
export const STREET_LIGHT_ARM_REACH_X = 34;

/**
 * Ensures street light poles span the entire road from start to end at moderate,
 * balanced intervals without long empty gaps, while keeping bridge spans and
 * wooden bridge pillars free of overlapping light cones.
 */
export function resolveStreetLightPoleX(
  rawPoleX: number,
  obstacles: TrackObstacle[]
): number {
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (o.type === 'suspension_bridge') {
      const halfSpan = o.width * 0.5;
      const leftClearance = halfSpan + 168;
      const rightClearance = halfSpan + 104;
      const dx = rawPoleX - o.x;
      if (dx > -leftClearance && dx < rightClearance) {
        return NaN;
      }
    }
  }
  return rawPoleX;
}

/**
 * Anchors background & roadside trees cleanly onto solid ground banks outside
 * suspension bridges so treeWorldX is never NaN (which would cause ctx.translate(NaN, NaN)
 * to be ignored by Canvas 2D and render a floating tree at y=0 in the sky!).
 */
export function resolveTreeWorldX(
  rawTreeX: number,
  obstacles: TrackObstacle[]
): number {
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (o.type === 'suspension_bridge') {
      const halfSpan = o.width * 0.5 + 28;
      if (Math.abs(rawTreeX - o.x) < halfSpan) {
        return rawTreeX < o.x ? o.x - halfSpan : o.x + halfSpan;
      }
    }
  }
  return rawTreeX;
}

/**
 * Camera Screen Shake is permanently disabled per user specification
 * to guarantee 100% steady, crystal-clear vision on landings and collisions.
 */
export function triggerCameraShake(
  _state: PhysicsState,
  _traumaAmount: number,
  _impulseX: number = 0,
  _impulseY: number = 0
): void {
  // Intentionally disabled — zero camera shake
}

export function getTerrainHeight(worldX: number, map: MapConfig): number {
  const baseGround = 430;
  if (worldX <= 220) {
    return baseGround;
  }
  const rawT = Math.max(0, Math.min(1, (worldX - 220) / 640));
  // C2-continuous Quintic Smootherstep transition (guarantees zero 1st or 2nd derivative jump at hill start)
  const transition = rawT * rawT * rawT * (rawT * (rawT * 6 - 15) + 10);
  const scale = 0.0018 * map.hillRoughness;
  const distFactor = 1 + Math.min(0.55, worldX / 48000);
  const amp = map.hillAmplitude * transition * distFactor;

  // Pure low-frequency C2-smooth sweeping hill contours (zero microscopic high-frequency ripples or vertex bumps!)
  const h1 = Math.sin(worldX * scale) * amp * 0.68;
  const h2 = Math.cos(worldX * scale * 1.65 + 1.2) * amp * 0.22;

  return baseGround - (h1 + h2);
}

export function getTerrainSlope(worldX: number, map: MapConfig): number {
  // Multi-sample Gaussian-smoothed central difference over wheelbase scale for micro-stutter-free slope angles
  const d1 = 12;
  const d2 = 24;
  const s1 = (getTerrainHeight(worldX + d1, map) - getTerrainHeight(worldX - d1, map)) / (d1 * 2);
  const s2 = (getTerrainHeight(worldX + d2, map) - getTerrainHeight(worldX - d2, map)) / (d2 * 2);
  return Math.atan(s1 * 0.65 + s2 * 0.35);
}

/**
 * Returns the visual earth/ground contour height, sculpting smooth C1-continuous
 * dips & slopes (نزلة وطلعة انسيابية ناعمة بدون حواف حادة أو جدران مستقيمة)
 * and scenic ravines beneath wooden suspension bridges.
 */
export function getEarthContourHeight(
  worldX: number,
  map: MapConfig,
  obstacles: TrackObstacle[]
): number {
  let y = getTerrainHeight(worldX, map);

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const halfW = obs.width * 0.5;
    const dx = worldX - obs.x;

    if (Math.abs(dx) > halfW) continue;

    if (
      obs.type === 'pit_small' ||
      obs.type === 'pit_medium' ||
      obs.type === 'gap_jump'
    ) {
      // Smooth Dip & Slope Pit Design (نزلة وطلعة انسيابية ناعمة بعرض يعادل ضعف حجم السيارة تقريباً):
      // Raised-Cosine C1-continuous profile guarantees 0 slope jump at entry/exit and zero vertical walls!
      const norm = dx / halfW; // -1..1
      const smoothDip = 0.5 * (1 + Math.cos(norm * Math.PI));
      y += obs.height * smoothDip;
    } else if (obs.type === 'suspension_bridge') {
      // Open Valley beneath the movable wooden suspension bridge:
      // Drop the underground polygon deep below the screen between the left & right abutment banks
      // so the natural green mountain range background passes continuously underneath the bridge,
      // while keeping the ground base solid under the wooden pillars at both ends!
      if (Math.abs(dx) < halfW - 14) {
        y += 1600;
      }
    }
  }

  return y;
}

export const ROAD_STONE_CELL_SPACING = 680;

export function getRoadStoneAtCell(
  cellIdx: number,
  obstacles: TrackObstacle[]
): {
  cellIdx: number;
  stoneX: number;
  stoneHalfW: number;
  stoneH: number;
  isMediumStone: boolean;
  h1: number;
  h2: number;
  h3: number;
} | null {
  if (cellIdx <= 0) return null;
  const h1 = Math.abs(Math.sin(cellIdx * 127.1 + 31.7));
  const h2 = Math.abs(Math.cos(cellIdx * 269.5 + 19.3));
  const h3 = Math.abs(Math.sin(cellIdx * 419.3 + 73.1));

  let stoneX =
    cellIdx * ROAD_STONE_CELL_SPACING -
    120 +
    (h1 - 0.5) * 90;
  if (stoneX < 340) return null;

  // Keep drawbridges and their pillar bases 100% clear of road stones:
  // shift any stone that lands near a bridge outside the pillar exclusion zone so 100% of cells are visible & collidable!
  for (let i = 0; i < obstacles.length; i++) {
    const o = obstacles[i];
    if (o.type === 'suspension_bridge') {
      const minSafeDist = o.width * 0.5 + 250;
      if (Math.abs(stoneX - o.x) < minSafeDist) {
        stoneX = stoneX >= o.x ? o.x + minSafeDist : o.x - minSafeDist;
      }
    }
  }
  if (stoneX < 340) return null;

  // Standardized balanced, uniform MEDIUM size for all roadside rocks/boulders with tactile height
  const isMediumStone = true;
  const stoneHalfW = 12.5;
  const stoneH = 10.5;

  return {
    cellIdx,
    stoneX,
    stoneHalfW,
    stoneH,
    isMediumStone,
    h1,
    h2,
    h3,
  };
}

/**
 * Deterministic Spaced Roadside/Track Stone Geometry & Physical Wheel-Climbing Profile:
 * Models the exact 3-lobe boulder cluster contour (left companion cobble, central main boulder crown,
 * and right companion cobble) for all visible roadside stones and track rock obstacles so each individual
 * wheel physically hits, climbs, and rolls over them while dynamically compressing its suspension coil!
 */
export function getRoadStoneBumpInfo(
  worldX: number,
  obstacles: TrackObstacle[]
): {
  bumpHeight: number;
  stoneCenterX: number;
  stoneHalfW: number;
  stoneHeight: number;
  isMediumStone: boolean;
} {
  if (worldX < 300) {
    return {
      bumpHeight: 0,
      stoneCenterX: 0,
      stoneHalfW: 0,
      stoneHeight: 0,
      isMediumStone: false,
    };
  }

  // Exact visible outer shell height of a single organic rock body above the resting outer tire tread
  const evalOrganicLobeShell = (
    sampleX: number,
    lobeCenterX: number,
    oy: number,
    rw: number,
    rh: number,
    s3: number,
    strokePad: number
  ): number => {
    const localDx = sampleX - lobeCenterX;
    const halfSpan = rw * 1.02;
    if (localDx <= -halfSpan || localDx >= halfSpan) return 0;
    const peakX = (s3 - 0.5) * rw * 0.32;
    const u =
      localDx <= peakX
        ? (peakX - localDx) / Math.max(1e-3, halfSpan + peakX)
        : (localDx - peakX) / Math.max(1e-3, halfSpan - peakX);
    if (u >= 1) return 0;
    const shellYAboveBase = rh * Math.pow(1 - u * u, 0.52) + strokePad - oy;
    // Base is drawn at surf.y + 2.5; resting outer rubber tread sits at surf.y + 1.5 (1.0px above base)
    return Math.max(0, shellYAboveBase - 0.8);
  };

  // Evaluates the 3-lobe boulder cluster visible shell height at sampleX
  const evalClusterShellAtX = (
    sampleX: number,
    cx: number,
    hw: number,
    sh: number,
    h1: number,
    h2: number,
    h3: number
  ): number => {
    const leftShell = evalOrganicLobeShell(
      sampleX,
      cx - hw * 0.68,
      0.8,
      hw * 0.48,
      sh * 0.54,
      h1,
      0.65
    );
    const mainShell = evalOrganicLobeShell(
      sampleX,
      cx,
      0,
      hw,
      sh,
      h3,
      0.8
    );
    const rightShell = evalOrganicLobeShell(
      sampleX,
      cx + hw * 0.66,
      1.2,
      hw * 0.45,
      sh * 0.48,
      h2,
      0.65
    );
    return Math.max(leftShell, mainShell, rightShell);
  };

  let bestBump = 0;
  let bestCenterX = 0;
  let bestHalfW = 0;
  let bestHeight = 0;
  let bestIsMed = false;

  // Rigid circular outer tire boundary radius (prevents any point on the circular tire tread from sinking into the rock graphic!)
  const rigidTireRadius = 18.5;
  const maxSweepDx = 16.5;

  const evalClusterRigidWheelContact = (
    cx: number,
    hw: number,
    sh: number,
    h1: number,
    h2: number,
    h3: number
  ): void => {
    if (Math.abs(worldX - cx) > hw * 1.2 + maxSweepDx + 4) return;
    let clusterRigidLift = 0;
    for (let dx = -maxSweepDx; dx <= maxSweepDx; dx += 1.5) {
      const shellH = evalClusterShellAtX(worldX + dx, cx, hw, sh, h1, h2, h3);
      if (shellH > 0) {
        const tireArcRise =
          rigidTireRadius -
          Math.sqrt(Math.max(0, rigidTireRadius * rigidTireRadius - dx * dx));
        const requiredLift = shellH - tireArcRise;
        if (requiredLift > clusterRigidLift) {
          clusterRigidLift = requiredLift;
        }
      }
    }
    if (clusterRigidLift > bestBump) {
      bestBump = clusterRigidLift;
      bestCenterX = cx;
      bestHalfW = hw;
      bestHeight = sh;
      bestIsMed = true;
    }
  };

  // 1. Check procedural roadside/road stones (100% synchronized with drawForegroundRoadStonesAndRocks)
  const approxCell = Math.max(
    1,
    Math.round((worldX + 120) / ROAD_STONE_CELL_SPACING)
  );
  for (let c = approxCell - 1; c <= approxCell + 1; c++) {
    const st = getRoadStoneAtCell(c, obstacles);
    if (!st) continue;
    evalClusterRigidWheelContact(
      st.stoneX,
      st.stoneHalfW,
      st.stoneH,
      st.h1,
      st.h2,
      st.h3
    );
  }

  // 2. Check explicit track rock obstacles in state.obstacles (100% synchronized with visible rendering)
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (
      obs.type === 'rock_small' ||
      obs.type === 'rock_medium' ||
      obs.type === 'rock_large'
    ) {
      if (Math.abs(worldX - obs.x) > 46) continue;
      if (isNearBridgeFast(obs.x, 220, obstacles)) continue;
      const f0 = (obs.rockFacets[0] ?? 0.9) * 0.5;
      const f1 = (obs.rockFacets[1] ?? 1.05) * 0.5;
      const f2 = (obs.rockFacets[2] ?? 0.95) * 0.5;
      evalClusterRigidWheelContact(obs.x, 12.5, 10.5, f0, f1, f2);
    }
  }

  return {
    bumpHeight: bestBump,
    stoneCenterX: bestCenterX,
    stoneHalfW: bestHalfW,
    stoneHeight: bestHeight,
    isMediumStone: bestIsMed,
  };
}

/**
 * Computes the physical wheel vertical climb displacement when rolling over visible roadside rocks
 * and stone obstacles (Hill Climb Racing 2 per-wheel rock climbing & suspension response).
 */
export function getWheelRockBumpAtWorldX(
  wheelWorldX: number,
  obstacles: TrackObstacle[]
): number {
  return getRoadStoneBumpInfo(wheelWorldX, obstacles).bumpHeight;
}

/**
 * Computes the physical drivable surface height and surface properties at `worldX`.
 * Every road dip (`pit_small`, `pit_medium`, `gap_jump`) uses a C1-smooth raised-cosine
 * curve (~2x car length) with zero vertical walls so the car enters and exits smoothly with speed!
 */
export function getEffectiveSurfaceInfo(
  worldX: number,
  map: MapConfig,
  state: PhysicsState,
  timeSec: number = 0
): {
  y: number;
  inMud: boolean;
  inWaterPit: boolean;
  onBridge: boolean;
  hitRock: TrackObstacle | null;
  overGap: TrackObstacle | null;
  inFatalPit: TrackObstacle | null;
} {
  let y = getTerrainHeight(worldX, map);
  let inMud = false;
  let inWaterPit = false;
  let onBridge = false;
  let hitRock: TrackObstacle | null = null;
  const overGap: TrackObstacle | null = null;
  const inFatalPit: TrackObstacle | null = null;

  // Scattered wet mirror puddles along the road also count as shallow water wash zones when wet
  if (Math.sin(worldX * 0.018 + 0.7) > 0.72) {
    inWaterPit = true;
  }

  for (let i = 0; i < state.obstacles.length; i++) {
    const obs = state.obstacles[i];
    const halfW = obs.width * 0.5;
    const dx = worldX - obs.x;

    if (Math.abs(dx) > halfW + 20) continue;

    if (obs.type === 'mud_puddle') {
      if (Math.abs(dx) <= halfW) {
        inMud = true;
        inWaterPit = false;
      }
    } else if (
      obs.type === 'pit_small' ||
      obs.type === 'pit_medium' ||
      obs.type === 'gap_jump'
    ) {
      // Wide Smooth Dip & Slope (~2x Car Size):
      // Pure C2-continuous raised-cosine curve allows smooth entry and exit with zero vertical walls!
      if (Math.abs(dx) <= halfW) {
        const norm = dx / halfW; // -1..1
        const smoothDip = 0.5 * (1 + Math.cos(norm * Math.PI));
        y += obs.height * smoothDip;
        // Mid-Wheel Water Pit: Water fills the lower basin of pit_small and pit_medium!
        if (
          (obs.type === 'pit_small' || obs.type === 'pit_medium') &&
          Math.abs(norm) < 0.74
        ) {
          inWaterPit = true;
        }
      }
    } else if (obs.type === 'suspension_bridge') {
      const leftBankX = obs.x - halfW;
      const rightBankX = obs.x + halfW;
      if (worldX >= leftBankX && worldX <= rightBankX) {
        onBridge = true;
        const t = Math.max(0, Math.min(1, (worldX - leftBankX) / obs.width)); // 0..1 across bridge
        const leftY = getTerrainHeight(leftBankX, map);
        const rightY = getTerrainHeight(rightBankX, map);
        const chordY = leftY + (rightY - leftY) * t;

        // C2-continuous quintic smootherstep ramp blend from road terrain (y) into bridge chord (chordY)
        // so both height AND slope match the road 100% seamlessly at the drawbridge entrance & exit with zero step bump!
        const edgeT = Math.min(t, 1 - t);
        const rampNorm = Math.min(1, Math.max(0, edgeT / 0.12));
        const smoothRamp =
          rampNorm * rampNorm * rampNorm * (rampNorm * (rampNorm * 6 - 15) + 10);
        const baseDeckY = y * (1 - smoothRamp) + chordY * smoothRamp;

        // C2-smooth raised-cosine arch shape (0 height & 0 derivative at t=0 and t=1)
        const archShape = 0.5 * (1 - Math.cos(t * Math.PI * 2));
        const naturalSag = archShape * 10;
        const windWave =
          Math.sin(timeSec * 2.4 + t * Math.PI * 2.0 + obs.id) *
          1.2 *
          archShape;

        const distFromCar = worldX - state.x;
        const localCarPress = Math.exp(-(distFromCar * distFromCar) / 4800);
        const safeBridgeSag = Number.isFinite(obs.bridgeSag) ? obs.bridgeSag : 0;
        const weightSag =
          archShape * safeBridgeSag * (0.45 + 0.55 * localCarPress);

        // Smoothly blended plank top surface offset (0 at bridge ends t=0 and t=1 so there is zero edge step collider!)
        const plankTopSurfaceOffset = -1.5 * smoothRamp;
        y = baseDeckY + naturalSag + windWave + weightSag + plankTopSurfaceOffset;
      }
    }
  }

  return { y, inMud, inWaterPit, onBridge, hitRock, overGap, inFatalPit };
}

export function getEffectiveSlope(
  worldX: number,
  map: MapConfig,
  state: PhysicsState,
  timeSec: number = 0
): number {
  // Multi-point Gaussian-smoothed central difference eliminates slope micro-stuttering across nodes
  const d1 = 12;
  const d2 = 24;
  const s1 =
    (getEffectiveSurfaceInfo(worldX + d1, map, state, timeSec).y -
      getEffectiveSurfaceInfo(worldX - d1, map, state, timeSec).y) /
    (d1 * 2);
  const s2 =
    (getEffectiveSurfaceInfo(worldX + d2, map, state, timeSec).y -
      getEffectiveSurfaceInfo(worldX - d2, map, state, timeSec).y) /
    (d2 * 2);
  return Math.atan(s1 * 0.65 + s2 * 0.35);
}

export function createInitialPhysicsState(
  car: CarConfig,
  map: MapConfig,
  upgrades: UpgradeLevels
): PhysicsState {
  const maxFuel =
    car.baseFuelCapacity *
    (1 +
      Math.max(0, upgrades.engine || 0) * 0.008 +
      Math.max(0, upgrades.armor || 0) * 0.008);
  const startX = 140;
  const groundY = getTerrainHeight(startX, map);
  const rideHeight = car.wheelRadius + 22;
  const initialWeather = getWeatherPhaseInfo(persistentWeatherClockSec);

  const state: PhysicsState = {
    x: startX,
    y: groundY - rideHeight,
    vx: 0,
    vy: 0,
    prevVx: 0,
    prevVy: 0,
    angle: 0,
    angVel: 0,
    wheelRotation: 0,
    rearCompression: 0,
    frontCompression: 0,
    rearSpringVel: 0,
    frontSpringVel: 0,
    groundedRear: true,
    groundedFront: true,
    wasAirborne: false,
    peakAirVy: 0,
    peakAirTime: 0,
    wasGasPressed: false,
    backfireFlash: 0,
    shakeTrauma: 0,
    shakeOffsetX: 0,
    shakeOffsetY: 0,
    shakeVelX: 0,
    shakeVelY: 0,
    shakeAngle: 0,
    impactCooldown: 0,
    inMud: false,
    inWaterPit: false,
    mudDirtiness: 0,
    onBridge: false,
    driverLean: 0,
    driverLeanVel: 0,
    driverBobY: 0,
    driverBobVel: 0,
    weightTransferPitch: 0,
    weightTransferVel: 0,
    weatherCycleSec: persistentWeatherClockSec,
    cloudDarkness: initialWeather.cloudDarkness,
    rainIntensity: initialWeather.rainIntensity,
    nightFactor: initialWeather.nightFactor,
    headlightsOn: initialWeather.headlightsOn,
    headlightsBroken: false,
    lightningFlash: 0,
    lightningBolt: [],
    lightningCountdown: 4.2,
    weatherLabel: initialWeather.label,
    flightPhase: 'none',
    flightTimer: 120,
    wingDeployProgress: 0,
    wheelRetractProgress: 0,
    landingTouchedDown: false,
    cutsceneTimer: 0,
    repairPickupTimer: 180,
    health: 100,
    frontDamage: 0,
    rearDamage: 0,
    roofDamage: 0,
    doorDamage: 0,
    windowCracked: false,
    windowShattered: false,
    frontBumperState: 'intact',
    rearBumperState: 'intact',
    hoodState: 'intact',
    doorState: 'intact',
    detachedParts: [],
    isExploded: false,
    explosionTimer: 0,
    explosionReason: '',
    smokeSpawnAcc: 0,
    fuel: maxFuel,
    maxFuel,
    nitro: 100,
    distance: 0,
    maxDistance: 0,
    sessionCoins: 0,
    airTime: 0,
    flipsCount: 0,
    accumulatedAirAngle: 0,
    upsideDownTimer: 0,
    nextSpawnX: 480,
    nextObstacleX: 460,
    nextEntityId: 1,
    obstacles: [],
    pickups: [],
    floatingTexts: [],
    particles: [],
  };

  spawnObstaclesAhead(state);
  spawnPickupsAhead(state, map);
  return state;
}

/**
 * Repairs the vehicle chassis, bumpers, hood, doors, glass, AND broken headlights back to 100%!
 * ("إعادة هيكل السيارة وكشافاتها إلى 100%")
 */
export function repairVehicleCompletely(state: PhysicsState): void {
  state.health = 100;
  state.frontDamage = 0;
  state.rearDamage = 0;
  state.roofDamage = 0;
  state.doorDamage = 0;
  state.windowCracked = false;
  state.windowShattered = false;
  state.headlightsBroken = false;
  state.frontBumperState = 'intact';
  state.rearBumperState = 'intact';
  state.hoodState = 'intact';
  state.doorState = 'intact';
  state.mudDirtiness = 0;
  const weatherInfo = getWeatherPhaseInfo(state.weatherCycleSec);
  state.headlightsOn = !state.isExploded && weatherInfo.headlightsOn;

  state.floatingTexts.push({
    id: state.nextEntityId++,
    x: state.x,
    y: state.y - 62,
    text: '🔧 تم إصلاح الهيكل والكشافات 100%!',
    color: '#10B981',
    alpha: 1,
    vy: -45,
  });

  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    state.particles.push({
      x: state.x + Math.cos(a) * 28,
      y: state.y + Math.sin(a) * 16,
      vx: Math.cos(a) * 110,
      vy: Math.sin(a) * 90 - 30,
      size: 4,
      color: i % 2 === 0 ? '#34D399' : '#38BDF8',
      alpha: 0.95,
      decay: 2.2,
      isSpark: true,
    });
  }
}

/**
 * Triggers the Cinematic Slow-Mo Flying Car Transformation (02:00 Flight Countdown Timer)
 * ("تحول السيارة إلى طائرة: مشهد سينمائي سريع ببطء تخرج فيه أجنحة بنفس لون السيارة وترتفع السيارة ببطء وتطير في السماء لمدة دقيقتين 02:00")
 */
export function activateFlightWings(state: PhysicsState): boolean {
  if (
    state.isExploded ||
    state.flightPhase === 'flying' ||
    state.flightPhase === 'transform_takeoff'
  ) {
    return false;
  }
  state.flightPhase = 'transform_takeoff';
  state.flightTimer = 120; // 02:00 (2 minutes)
  state.fuel = state.maxFuel; // Synced to 100% at start of 2-minute flight!
  state.cutsceneTimer = 3.0; // Smooth slow-mo sequence for wing deployment + slow wheel retraction + high-sky climb
  state.landingTouchedDown = false;
  // Immediately clear any exhaust smoke particles when transforming into an airplane!
  for (let i = state.particles.length - 1; i >= 0; i--) {
    if (state.particles[i].isSmoke) {
      state.particles.splice(i, 1);
    }
  }
  state.floatingTexts.push({
    id: state.nextEntityId++,
    x: state.x,
    y: state.y - 66,
    text: '✈️ فرد الأجنحة وطي العجلات داخل الهيكل للتحليق في قمم السماء! (02:00)',
    color: '#38BDF8',
    alpha: 1,
    vy: -38,
  });
  return true;
}

function generateForkedLightningBolt(centerX: number, topY: number): LightningSegment[] {
  const segments: LightningSegment[] = [];
  let curX = centerX + (Math.random() - 0.5) * 180;
  let curY = topY;
  const steps = 11;
  for (let i = 0; i < steps; i++) {
    const nextX = curX + (Math.random() - 0.5) * 74;
    const nextY = curY + 24 + Math.random() * 26;
    segments.push({
      x1: curX,
      y1: curY,
      x2: nextX,
      y2: nextY,
      width: Math.max(1.6, 5.0 - i * 0.34),
    });
    // Secondary & tertiary forked lightning branches
    if (i >= 1 && i <= 8 && Math.random() < 0.68) {
      let bx = curX;
      let by = curY;
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (let b = 0; b < 4; b++) {
        const nbx = bx + dir * (16 + Math.random() * 28);
        const nby = by + 18 + Math.random() * 20;
        segments.push({
          x1: bx,
          y1: by,
          x2: nbx,
          y2: nby,
          width: Math.max(1.0, 2.2 - b * 0.35),
        });
        bx = nbx;
        by = nby;
      }
    }
    curX = nextX;
    curY = nextY;
  }
  return segments;
}

/**
 * Triggered ONLY when Vehicle Structural Health reaches 0% (state.health <= 0)
 * after repeated violent crashes or falling into a bottomless chasm!
 */
export function triggerVehicleExplosion(
  state: PhysicsState,
  reason: string,
  onExplosion?: () => void
): void {
  if (state.isExploded) return;
  state.isExploded = true;
  state.explosionTimer = 0.001;
  state.explosionReason = reason;
  state.health = 0;
  state.frontDamage = 1;
  state.rearDamage = 1;
  state.roofDamage = 1;
  state.doorDamage = 1;
  state.windowCracked = true;
  state.windowShattered = true;
  state.frontBumperState = 'detached';
  state.rearBumperState = 'detached';
  state.hoodState = 'detached';
  state.doorState = 'detached';

  // Launch scorched wreck slightly upward with rotational tumble
  state.vy = Math.min(-185, state.vy - 165);
  state.vx *= 0.32;
  state.angVel = (Math.random() < 0.5 ? -1 : 1) * 3.2;
  state.driverLean = 0.52;
  state.driverBobY = -8;
  state.lightningFlash = Math.max(state.lightningFlash, 0.45);

  if (onExplosion) {
    onExplosion();
  }

  state.floatingTexts.push({
    id: state.nextEntityId++,
    x: state.x,
    y: state.y - 68,
    text: '💥 تلف الهيكل 0% · انفجار ودخان المحرك!',
    color: '#EF4444',
    alpha: 1,
    vy: -52,
  });

  // Spawn massive 360-degree fireball, dark engine smoke & glowing shrapnel burst (ONLY at 0% Health!)
  const fireColors = ['#FEF08A', '#F97316', '#EF4444', '#DC2626', '#1E293B', '#0F172A'];
  for (let i = 0; i < 54; i++) {
    const angle = (i / 54) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
    const isShrapnel = i % 3 === 0;
    const isSmoke = !isShrapnel && i % 2 === 0;
    const speed = isShrapnel
      ? 160 + Math.random() * 340
      : 45 + Math.random() * 190;
    state.particles.push({
      x: state.x + (Math.random() - 0.5) * 36,
      y: state.y + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isSmoke ? 75 : 35),
      size: isShrapnel ? 3.5 + Math.random() * 3 : 12 + Math.random() * 16,
      color: isShrapnel
        ? i % 2 === 0
          ? '#FEF08A'
          : '#F97316'
        : isSmoke
        ? '#1E293B'
        : fireColors[i % 4],
      alpha: 1,
      decay: isSmoke ? 0.65 + Math.random() * 0.35 : 1.35 + Math.random() * 0.7,
      isSpark: isShrapnel,
      isSmoke,
    });
  }
}

export function spawnObstaclesAhead(state: PhysicsState): void {
  const targetAheadX = state.x + 2600;
  while (state.nextObstacleX < targetAheadX) {
    const obsIdx = state.obstacles.length;
    const bridgeCenterX = obsIdx === 0 ? 540 : state.nextObstacleX + 220;
    const bridgeWidth = 230;
    const ravineDepth = 76;
    state.obstacles.push({
      id: state.nextEntityId++,
      type: 'suspension_bridge',
      x: bridgeCenterX,
      width: bridgeWidth,
      height: ravineDepth,
      rockFacets: [],
      bridgeSag: 0,
      bridgeSagVel: 0,
      cleared: false,
    });
    state.nextObstacleX = bridgeCenterX + bridgeWidth * 0.5 + 1150;
  }
}

export function spawnPickupsAhead(state: PhysicsState, map: MapConfig): void {
  const targetAheadX = state.x + 2200;

  while (state.nextSpawnX < targetAheadX) {
    const clusterCount = 5;
    const spacing = 52;
    for (let i = 0; i < clusterCount; i++) {
      const cx = state.nextSpawnX + i * spacing;
      // Never spawn coins on top of rock obstacles so hitting a rock plays ONLY the Heavy Metal Crash SFX!
      const nearRock = state.obstacles.some(
        (obs) =>
          (obs.type === 'rock_small' ||
            obs.type === 'rock_medium' ||
            obs.type === 'rock_large') &&
          Math.abs(obs.x - cx) < 78
      );
      if (nearRock) continue;
      const surf = getEffectiveSurfaceInfo(cx, map, state, 0);
      // Follow the smooth continuous road and dip contours naturally!
      const cy = surf.y - 38;
      // Strictly and exclusively 25-value collectible coins!
      state.pickups.push({
        id: state.nextEntityId++,
        x: cx,
        y: cy,
        type: 'coin',
        value: 25,
        radius: 16,
        collected: false,
      });
    }

    const clusterIndex = Math.round((state.nextSpawnX - 480) / 640);
    const fuelX = state.nextSpawnX + clusterCount * spacing + 180;
    const fuelSurf = getEffectiveSurfaceInfo(fuelX, map, state, 0);
    const fuelY =
      (fuelSurf.overGap ? getTerrainHeight(fuelX, map) - 70 : fuelSurf.y) - 38;

    // Balanced fuel canister spawn distance: spaced every 14 clusters (~8,960px / ~358m apart)
    const isFuelCluster =
      clusterIndex >= 12 && (clusterIndex - 12) % 14 === 0;
    // Balanced repair kit spawn distance: spaced every 25 clusters (~16,000px / ~640m apart)
    const isRepairCluster =
      clusterIndex >= 20 && (clusterIndex - 20) % 25 === 0;

    if (isFuelCluster) {
      state.pickups.push({
        id: state.nextEntityId++,
        x: fuelX,
        y: fuelY,
        type: 'fuel',
        value: 100,
        radius: 20,
        collected: false,
      });
    }

    if (isRepairCluster) {
      const repairX = isFuelCluster ? fuelX + 240 : fuelX;
      const repairSurf = getEffectiveSurfaceInfo(repairX, map, state, 0);
      const repairY =
        (repairSurf.overGap
          ? getTerrainHeight(repairX, map) - 70
          : repairSurf.y) - 42;
      state.pickups.push({
        id: state.nextEntityId++,
        x: repairX,
        y: repairY,
        type: 'repair',
        value: 100,
        radius: 22,
        collected: false,
      });
    }

    state.nextSpawnX += 640;
  }
}

export function stepPhysics(
  state: PhysicsState,
  car: CarConfig,
  map: MapConfig,
  upgrades: UpgradeLevels,
  controls: { gas: boolean; brake: boolean; boost: boolean },
  quality: GraphicsQuality,
  onCoinPickup: () => void,
  onFuelPickup: () => void,
  onBackfirePop?: (intensity: number) => void,
  onHeavyImpact?: (intensity: number) => void,
  onThunderclap?: (intensity: number) => void,
  onExplosion?: () => void,
  onPartBreakOrGlassShatter?: (isGlass: boolean) => void,
  onRepairPickup?: () => void,
  onWingTransform?: (isDeploying: boolean) => void,
  onDriverDoorDamage?: (stage: 'scratch' | 'break' | 'detach') => void,
  onBridgeCross?: (intensity: number) => void,
  deltaTime: number = 1 / 60
): { gameOverReason: string | null } {
  // Cinematic Slow-Mo Time-Dilation during Airplane Wing Takeoff / Landing Cutscenes!
  const isCutscene =
    state.flightPhase === 'transform_takeoff' ||
    state.flightPhase === 'transform_landing';
  const rawDt = Math.min(
    0.05,
    Math.max(0.001, Number.isFinite(deltaTime) ? deltaTime : 1 / 60)
  );
  const dt = isCutscene ? rawDt * 0.48 : rawDt;
  const dtScale = dt * 60;
  const timeSec = performance.now() * 0.001;

  // =========================================================================
  // 1. DYNAMIC DAY/NIGHT CYCLE (1.5 MINUTES / 90 SECONDS PER PHASE) + BROKEN HEADLIGHTS REALISM
  // =========================================================================
  persistentWeatherClockSec =
    (persistentWeatherClockSec + rawDt) % WEATHER_CYCLE_DURATION;
  state.weatherCycleSec = persistentWeatherClockSec;
  const weatherInfo = getWeatherPhaseInfo(state.weatherCycleSec);
  state.cloudDarkness += (weatherInfo.cloudDarkness - state.cloudDarkness) * 3.2 * rawDt;
  state.rainIntensity += (weatherInfo.rainIntensity - state.rainIntensity) * 3.2 * rawDt;
  state.nightFactor += (weatherInfo.nightFactor - state.nightFactor) * 3.2 * rawDt;
  state.headlightsOn =
    !state.isExploded && !state.headlightsBroken && weatherInfo.headlightsOn;
  state.weatherLabel = state.headlightsBroken && weatherInfo.headlightsOn
    ? `${weatherInfo.label} · ⚠️ الكشافات مكسورة`
    : weatherInfo.label;

  // Periodic On-Road Repair Wrench Pickup Generator (Strictly ONLY when driving on the ground road and spaced out!)
  if (state.flightPhase === 'none') {
    state.repairPickupTimer -= rawDt;
    if (state.repairPickupTimer <= 0) {
      state.repairPickupTimer = 180; // Reset 3-minute timer
      const hasUpcomingRepair = state.pickups.some(
        (p) => p.type === 'repair' && !p.collected && p.x > state.x - 100
      );
      if (!hasUpcomingRepair) {
        const wrenchX = state.x + 680;
        const wrenchSurf = getEffectiveSurfaceInfo(wrenchX, map, state, timeSec);
        state.pickups.push({
          id: state.nextEntityId++,
          x: wrenchX,
          y: wrenchSurf.y - 42,
          type: 'repair',
          value: 100,
          radius: 22,
          collected: false,
        });
        state.floatingTexts.push({
          id: state.nextEntityId++,
          x: state.x + 80,
          y: state.y - 68,
          text: '🔧 ظهرت أيقونة إصلاح السيارة على الطريق أمامك!',
          color: '#34D399',
          alpha: 1,
          vy: -32,
        });
      }
    }
  }

  if (state.lightningFlash > 0) {
    state.lightningFlash = Math.max(0, state.lightningFlash - dt * 2.1);
    if (state.lightningFlash <= 0.04) {
      state.lightningBolt = [];
    }
  }

  // Gentle occasional lightning during Night (Isha: 450..540s) and Midnight (540..630s) while rain & wind remain uniformly light/gentle
  const cyclePosSec =
    ((state.weatherCycleSec % WEATHER_CYCLE_DURATION) + WEATHER_CYCLE_DURATION) %
    WEATHER_CYCLE_DURATION;
  const isNightOrMidnightPhase = cyclePosSec >= 450;
  if (isNightOrMidnightPhase) {
    state.lightningCountdown -= dt;
    if (state.lightningCountdown <= 0) {
      state.lightningCountdown = 5.2 + Math.random() * 3.4;
      state.lightningFlash = 0.72 + Math.random() * 0.14;
      state.lightningBolt = generateForkedLightningBolt(
        state.x + 150 + (Math.random() - 0.5) * 360,
        state.y - 340
      );
      if (onThunderclap) {
        onThunderclap(0.82 + Math.random() * 0.16);
      }
    }
  }

  // Zero out any camera shake fields permanently
  state.shakeTrauma = 0;
  state.shakeOffsetX = 0;
  state.shakeOffsetY = 0;
  state.shakeVelX = 0;
  state.shakeVelY = 0;
  state.shakeAngle = 0;

  if (state.impactCooldown > 0) {
    state.impactCooldown = Math.max(0, state.impactCooldown - dt);
  }

  const maxParticles =
    quality === 'Ultra'
      ? 180
      : quality === 'High'
      ? 95
      : quality === 'Medium'
      ? 42
      : 0;
  if (quality === 'Low' && state.particles.length > 0) {
    state.particles.length = 0;
  }

  // =========================================================================
  // 2. HANDLE ACTIVE VEHICLE EXPLOSION SEQUENCE BEFORE STAGE RETRY
  // =========================================================================
  if (state.isExploded) {
    state.explosionTimer += dt;
    state.vy += map.gravity * 58 * dt;

    // If the car exploded inside a Fatal Pit or Chasm, lock it inside so it can never exit!
    const explodedSurf = getEffectiveSurfaceInfo(state.x, map, state, timeSec);
    const activePit = explodedSurf.inFatalPit || explodedSurf.overGap;
    if (activePit) {
      state.vx = 0;
      const clampHalfW = Math.max(12, activePit.width * 0.34);
      state.x = Math.max(
        activePit.x - clampHalfW,
        Math.min(activePit.x + clampHalfW, state.x)
      );
    } else {
      state.x += state.vx * dt;
      state.vx *= Math.pow(0.94, dtScale);
    }
    state.y += state.vy * dt;
    state.angle += state.angVel * dt;
    state.angVel *= Math.pow(0.92, dtScale);

    const groundSurfY = explodedSurf.y;
    const minWreckY = groundSurfY - (car.wheelRadius + 10);
    if (state.y > minWreckY) {
      state.y = minWreckY;
      state.vy = -Math.abs(state.vy) * 0.22;
      state.vx *= 0.65;
    }

    // Continuous thick black smoke & fire billowing from the exploded wreck
    if (state.particles.length < maxParticles && Math.random() < 0.85) {
      const isFire = Math.random() < 0.42;
      state.particles.push({
        x: state.x + (Math.random() - 0.5) * (car.chassisWidth * 0.55),
        y: state.y - 8 + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 45 - state.vx * 0.15,
        vy: -55 - Math.random() * 65,
        size: isFire ? 7 + Math.random() * 8 : 11 + Math.random() * 14,
        color: isFire
          ? Math.random() < 0.5
            ? '#F97316'
            : '#EF4444'
          : '#0F172A',
        alpha: 0.92,
        decay: isFire ? 1.8 : 0.75,
        isSmoke: !isFire,
      });
    }

    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= 1.05 * dt;
      if (ft.alpha <= 0) state.floatingTexts.splice(i, 1);
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.isSmoke) {
        p.vy -= 18 * dt;
        p.size += 12 * dt;
      } else if (p.isSpark) {
        p.vy += 240 * dt;
      }
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) state.particles.splice(i, 1);
    }

    if (state.explosionTimer >= 1.38) {
      return {
        gameOverReason:
          state.explosionReason || 'تحطمت المركبة بالكامل وانفجر المحرك!',
      };
    }
    return { gameOverReason: null };
  }

  const engineLevel = Math.max(0, Math.min(100, upgrades.engine || 0));
  const armorLevel = Math.max(0, Math.min(100, upgrades.armor || 0));
  const exhaustSoundLevel = Math.max(0, Math.min(100, upgrades.exhaustSound || 0));
  const engineMult = 1 + (engineLevel / 100) * 0.38;
  const suspMult = 1 + (armorLevel / 100) * 0.65;
  const gripMult = 1 + (engineLevel / 100) * 0.22;

  // Frame-rate independent, responsive driving speed, natural reverse force, and distinct Turbo velocity jump
  const maxSpeed = car.baseSpeed * engineMult * 21.0;
  const accelForce = car.baseAccel * engineMult * 18.5;
  const grip = car.baseGrip * gripMult;

  const hasFuel = state.fuel > 0;
  const activeBoost = controls.boost && state.nitro > 0 && hasFuel;
  const activeGas = (controls.gas || activeBoost) && hasFuel;
  const activeBrake = controls.brake && !activeBoost;

  // Update Suspension Bridge Weight Physics & Check Obstacle Clear Bonuses (Strictly ON THE GROUND ROAD ONLY — Zero Sky Auto-Coins!)
  // ("إيقاف جمع الكوينز التلقائي في السماء: إلغاء زيادة عداد الكوينز نهائياً أثناء فترة الطيران في السماء، ليكون الجمع حصرياً على الطريق الأرضي فقط")
  for (let i = 0; i < state.obstacles.length; i++) {
    const obs = state.obstacles[i];
    const halfW = obs.width * 0.5;
    if (obs.type === 'suspension_bridge') {
      const carOnSpan =
        state.flightPhase === 'none' &&
        state.x >= obs.x - halfW - 15 &&
        state.x <= obs.x + halfW + 15;
      const bridgeBaseY = getTerrainHeight(obs.x, map);
      const carNearDeck = state.y >= bridgeBaseY - 75 && state.y <= bridgeBaseY + 60;
      const carMass = Number.isFinite(car.mass) ? car.mass : 0.85;
      const targetSag =
        carOnSpan && carNearDeck ? 10 * carMass : 0;
      if (!Number.isFinite(obs.bridgeSag)) obs.bridgeSag = 0;
      obs.bridgeSagVel = 0;
      obs.bridgeSag += (targetSag - obs.bridgeSag) * Math.min(1, 14 * dt);

      if (!obs.cleared && state.x > obs.x + halfW + 24) {
        obs.cleared = true;
        if (state.flightPhase === 'none') {
          const bridgeBonus = Math.round(120 * map.coinMultiplier);
          state.sessionCoins += bridgeBonus;
          state.floatingTexts.push({
            id: state.nextEntityId++,
            x: state.x,
            y: state.y - 48,
            text: `عبور الجسر المعلق! +${bridgeBonus}`,
            color: '#34D399',
            alpha: 1,
            vy: -40,
          });
        }
      }
    } else if (obs.type === 'gap_jump' || obs.type === 'pit_medium') {
      if (!obs.cleared && state.x > obs.x + halfW + 20) {
        obs.cleared = true;
        if (state.flightPhase === 'none') {
          const dipBonus = Math.round(150 * map.coinMultiplier);
          state.sessionCoins += dipBonus;
          state.floatingTexts.push({
            id: state.nextEntityId++,
            x: state.x,
            y: state.y - 52,
            text: `عبور المنحدر بسلاسة! +${dipBonus}`,
            color: '#F59E0B',
            alpha: 1,
            vy: -42,
          });
        }
      }
    }
  }

  // Trigger Logical Exhaust Backfire Pop ("فرقعة وطلقات الشكمان") ONLY when actively driving/moving & accelerating (Muted when idle/stationary!)
  if (state.backfireFlash > 0) {
    state.backfireFlash = Math.max(0, state.backfireFlash - dt * 5.5);
  }
  const isActivelyMoving = Math.abs(state.vx) > 32;
  const speedRatio = Math.abs(state.vx) / maxSpeed;
  const justPunchedGasWhileMoving =
    isActivelyMoving &&
    state.flightPhase === 'none' &&
    !state.wasGasPressed &&
    activeGas &&
    speedRatio > 0.18;
  const justReleasedGasAtSpeed =
    isActivelyMoving &&
    state.flightPhase === 'none' &&
    state.wasGasPressed &&
    !activeGas &&
    speedRatio > 0.52;
  const exhaustUpgradeRatio = exhaustSoundLevel / 100;
  const highRpmCrackle =
    isActivelyMoving &&
    state.flightPhase === 'none' &&
    ((activeBoost && Math.random() < 0.085 + exhaustUpgradeRatio * 0.09) ||
      (activeGas &&
        speedRatio > Math.max(0.42, 0.76 - exhaustUpgradeRatio * 0.28) &&
        Math.random() < 0.042 + exhaustUpgradeRatio * 0.085));

  if (
    (justPunchedGasWhileMoving || justReleasedGasAtSpeed || highRpmCrackle) &&
    hasFuel
  ) {
    state.backfireFlash = 1.0;
    if (onBackfirePop) {
      onBackfirePop(
        (activeBoost ? 1.2 : justReleasedGasAtSpeed ? 1.05 : 0.92) *
          (1 + exhaustUpgradeRatio * 0.35)
      );
    }
    const cosA = Math.cos(state.angle);
    const sinA = Math.sin(state.angle);
    const exX = state.x - cosA * (car.chassisWidth * 0.5);
    const exY = state.y - sinA * (car.chassisWidth * 0.5) + 5;
    const popSparks = 6 + Math.round(exhaustUpgradeRatio * 8);
    for (let i = 0; i < popSparks; i++) {
      state.particles.push({
        x: exX,
        y: exY,
        vx: -cosA * (320 + Math.random() * 220) + (Math.random() - 0.5) * 90,
        vy: -sinA * 150 + (Math.random() - 0.5) * 110,
        size: 3 + Math.random() * 3.5,
        color: i % 2 === 0 ? '#FEF08A' : '#F97316',
        alpha: 1,
        decay: 3.2,
        isSpark: true,
      });
    }
  }
  if (!isActivelyMoving) {
    state.backfireFlash = 0;
  }
  state.wasGasPressed = activeGas;

  // Fuel & Nitro consumption:
  // - During flight: Fuel automatically & gradually depletes in exact sync with the 2-minute (120s) flight countdown timer!
  //   ("نظام البنزين المترابط أثناء الطيران: ينخفض عداد البنزين تلقائياً وبشكل تدريجي متناسق مع العداد التنازلي لميزة الطيران دقيقتين")
  if (state.flightPhase !== 'none') {
    const syncedFlightFuelRatio = Math.max(0.08, state.flightTimer / 120);
    state.fuel = state.maxFuel * syncedFlightFuelRatio;
  } else if (state.x > 160 && hasFuel) {
    // Steady, moderate fuel depletion rate for a smooth, fair challenge between spaced fuel canisters
    const drainRate = activeBoost
      ? 4.65
      : activeGas
      ? 3.65
      : activeBrake
      ? 1.45
      : 0.75;
    state.fuel = Math.max(0, state.fuel - drainRate * dt);
  }
  if (activeBoost) {
    state.nitro = Math.max(0, state.nitro - 24 * dt);
  } else if (state.nitro < 100) {
    state.nitro = Math.min(100, state.nitro + 8.5 * dt);
  }

  const halfWheelBase = car.wheelBase * 0.5;
  const cosA = Math.cos(state.angle);
  const sinA = Math.sin(state.angle);

  const rearWheelX = state.x - cosA * halfWheelBase;
  const frontWheelX = state.x + cosA * halfWheelBase;

  const rearSurf = getEffectiveSurfaceInfo(rearWheelX, map, state, timeSec);
  const frontSurf = getEffectiveSurfaceInfo(frontWheelX, map, state, timeSec);
  const centerSurf = getEffectiveSurfaceInfo(state.x, map, state, timeSec);

  const rearGroundY = rearSurf.y;
  const frontGroundY = frontSurf.y;
  const prevOnBridge = state.onBridge;
  state.inMud =
    state.flightPhase === 'none' &&
    (rearSurf.inMud || frontSurf.inMud || centerSurf.inMud);
  state.inWaterPit =
    state.flightPhase === 'none' &&
    (rearSurf.inWaterPit || frontSurf.inWaterPit || centerSurf.inWaterPit);
  state.onBridge =
    state.flightPhase === 'none' &&
    (rearSurf.onBridge || frontSurf.onBridge || centerSurf.onBridge);
  if (
    state.onBridge &&
    onBridgeCross &&
    (!prevOnBridge || (Math.abs(state.vx) > 35 && Math.random() < 0.045))
  ) {
    onBridgeCross(Math.min(1.2, 0.65 + Math.abs(state.vx) / 360));
  }
  const hitRock =
    state.flightPhase === 'none'
      ? frontSurf.hitRock || rearSurf.hitRock
      : null;
  const overGap = centerSurf.overGap;
  const fatalPit =
    centerSurf.inFatalPit || frontSurf.inFatalPit || rearSurf.inFatalPit;

  // =========================================================================
  // MUD ACCUMULATION & WATER PIT MUD CLEANING PHYSICS (تنظيف الطين بالماء):
  // - Driving in mud coats the car body & wheels in mud (state.mudDirtiness -> 1)
  // - Entering a Water Pit or wet mirror puddle washes & dissolves the mud cleanly!
  // =========================================================================
  if (state.inMud && Math.abs(state.vx) > 15) {
    state.mudDirtiness = Math.min(1, state.mudDirtiness + rawDt * 0.75);
  } else if (state.inWaterPit && Math.abs(state.vx) > 12) {
    const prevMud = state.mudDirtiness;
    if (state.mudDirtiness > 0) {
      state.mudDirtiness = Math.max(0, state.mudDirtiness - rawDt * 1.45);
      if (prevMud >= 0.22 && state.mudDirtiness < 0.22) {
        state.floatingTexts.push({
          id: state.nextEntityId++,
          x: state.x,
          y: state.y - 54,
          text: '💦 تم غسل وتنظيف الطين بالماء!',
          color: '#38BDF8',
          alpha: 1,
          vy: -38,
        });
      }
    }
    // Splash water droplets up to mid-wheel height when rolling through water!
    if (state.particles.length < maxParticles && Math.random() < 0.65) {
      const splashWheelX = Math.random() < 0.5 ? frontWheelX : rearWheelX;
      const splashWheelY = Math.random() < 0.5 ? frontGroundY : rearGroundY;
      state.particles.push({
        x: splashWheelX + (Math.random() - 0.5) * 18,
        y: splashWheelY - car.wheelRadius * 0.45,
        vx: -state.vx * 0.22 + (Math.random() - 0.5) * 70,
        vy: -42 - Math.random() * 55,
        size: 3.5 + Math.random() * 3,
        color:
          prevMud > 0.25 && Math.random() < 0.4
            ? '#78350F'
            : 'rgba(125, 211, 252, 0.88)',
        alpha: 0.9,
        decay: 2.2,
      });
    }
  }

  const rideHeight = car.wheelRadius + 22;

  const expectedRearY = rearGroundY - rideHeight;
  const expectedFrontY = frontGroundY - rideHeight;
  const expectedCenterY = centerSurf.y - rideHeight;
  // 3-node Simpson/Gaussian smoothed ground surface height across wheelbase (eliminates vertex/chord micro-stuttering on curved paths!)
  const isSpanningBridge =
    rearSurf.onBridge || frontSurf.onBridge || centerSurf.onBridge;
  const rawAvgChassisY = isSpanningBridge
    ? (expectedRearY + expectedFrontY) * 0.5
    : (expectedRearY + 2 * expectedCenterY + expectedFrontY) * 0.25;
  const targetChassisY = rawAvgChassisY;
  const wheelChordAngle = Math.atan2(frontGroundY - rearGroundY, car.wheelBase);
  const centerSlopeAngle = getEffectiveSlope(state.x, map, state, timeSec);
  const terrainAngle = isSpanningBridge
    ? wheelChordAngle
    : wheelChordAngle * 0.65 + centerSlopeAngle * 0.35;

  // TRUE SPRING SUSPENSION & STRICT INDEPENDENT PER-WHEEL GROUND-CHECK PHYSICS (HILL CLIMB RACING 2 MECHANICS)
  const frontRockBump = getWheelRockBumpAtWorldX(
    frontWheelX,
    state.obstacles
  );
  const rearRockBump = getWheelRockBumpAtWorldX(
    rearWheelX,
    state.obstacles
  );
  const distBelowTarget = state.y - targetChassisY;
  const rearWheelBottomY = state.y - sinA * halfWheelBase + rideHeight;
  const frontWheelBottomY = state.y + sinA * halfWheelBase + rideHeight;

  const prevGroundedRear = state.groundedRear;
  const prevGroundedFront = state.groundedFront;

  // STABLE GROUNDED TRACTION & STEADY DOWNFORCE (Eliminates uncontrollable bouncing on flat roads and slopes):
  const moveDir = state.vx >= 0 ? 1 : -1;
  const speedAbs = Math.abs(state.vx);
  const onRockObstacleNow =
    frontRockBump > 0.12 || rearRockBump > 0.12 || Boolean(hitRock);
  const trailSlope = getEffectiveSlope(
    state.x - moveDir * 36,
    map,
    state,
    timeSec
  );
  const leadSlope = getEffectiveSlope(
    state.x + moveDir * Math.max(30, Math.min(82, speedAbs * 0.11)),
    map,
    state,
    timeSec
  );
  const convexCrestDelta = (leadSlope - trailSlope) * moveDir;
  const localCrestDelta = (leadSlope - terrainAngle) * moveDir;
  const rampUpwardSlope =
    moveDir >= 0
      ? Math.min(terrainAngle, trailSlope)
      : -Math.max(terrainAngle, trailSlope);
  void onRockObstacleNow;
  void convexCrestDelta;
  void localCrestDelta;
  void rampUpwardSlope;

  // Keep vehicle planted and grounded on flat roads, mild slopes, and rock contours (zero artificial upward bounce launch!)
  const isLaunchingOffRampOrCrest = false;
  const rearContactThreshold =
    (rearSurf.onBridge ? 6.0 : 16.0) + rearRockBump * 2.2;
  const frontContactThreshold =
    (frontSurf.onBridge ? 6.0 : 16.0) + frontRockBump * 2.2;
  state.groundedRear =
    state.flightPhase === 'none' &&
    rearWheelBottomY >= rearGroundY - rearContactThreshold &&
    state.vy >= -140;
  state.groundedFront =
    state.flightPhase === 'none' &&
    frontWheelBottomY >= frontGroundY - frontContactThreshold &&
    state.vy >= -140;

  const onGround =
    state.flightPhase === 'none' &&
    (state.groundedRear || state.groundedFront) &&
    distBelowTarget >= -26 - Math.max(rearRockBump, frontRockBump) * 2.2 &&
    state.vy >= -140;

  if (activeBoost && state.particles.length < maxParticles) {
    const exhaustX = state.x - cosA * (car.chassisWidth * 0.49);
    const exhaustY = state.y - sinA * (car.chassisWidth * 0.49) + 4;
    for (let s = 0; s < 2; s++) {
      const isBlueCore = s === 0;
      const nitroColors = isBlueCore
        ? ['#00F0FF', '#38BDF8', '#E0F2FE']
        : ['#F97316', '#FB923C', '#FEF08A'];
      state.particles.push({
        x: exhaustX + (Math.random() - 0.5) * 4,
        y: exhaustY + (Math.random() - 0.5) * 4,
        vx: -cosA * (290 + Math.random() * 190) + (Math.random() - 0.5) * 45,
        vy: -sinA * 140 + (Math.random() - 0.5) * 65 - 10,
        size: isBlueCore ? 3.5 + Math.random() * 2.5 : 5 + Math.random() * 4.5,
        color: nitroColors[Math.floor(Math.random() * nitroColors.length)],
        alpha: 0.95,
        decay: 3.4 + Math.random(),
        isSpark: isBlueCore,
      });
    }
  }

  // =========================================================================
  // DYNAMIC GRADUATED EXHAUST SMOKE ON GROUND ONLY (Completely hidden during Airplane Flight!):
  // ("عند تحول السيارة إلى طائرة، يتم إخفاء دخان العادم تماماً واستبداله بلهب نفاث ذكي Jet Engine Afterburner")
  // =========================================================================
  if (
    !state.isExploded &&
    state.flightPhase === 'none' &&
    hasFuel &&
    state.particles.length < maxParticles
  ) {
    const absSpeedRatio = Math.min(1.5, Math.abs(state.vx) / maxSpeed);
    const isHardAccelerating =
      activeBoost ||
      (activeGas &&
        (absSpeedRatio > 0.32 ||
          Math.abs(state.vx - state.prevVx) / Math.max(0.008, dt) > 85));
    const isLightDriving =
      !isHardAccelerating && (activeGas || Math.abs(state.vx) > 6);

    const smokeRate = isHardAccelerating
      ? activeBoost
        ? 15
        : 10.5 + absSpeedRatio * 6
      : isLightDriving
      ? 4.2 + absSpeedRatio * 3.5
      : 1.5;

    state.smokeSpawnAcc += dt * smokeRate;
    if (state.smokeSpawnAcc >= 1) {
      state.smokeSpawnAcc -= 1;
      const exhaustX = state.x - cosA * (car.chassisWidth * 0.5);
      const exhaustY = state.y - sinA * (car.chassisWidth * 0.5) + 5;

      if (isHardAccelerating) {
        // Medium-density, larger realistic translucent exhaust smoke during acceleration & launch
        state.particles.push({
          x: exhaustX - cosA * 4 + (Math.random() - 0.5) * 4,
          y: exhaustY + (Math.random() - 0.5) * 3,
          vx: -cosA * (65 + absSpeedRatio * 55) + (Math.random() - 0.5) * 24,
          vy: -sinA * 30 - 14 - Math.random() * 18,
          size: 7.2 + absSpeedRatio * 4.2 + Math.random() * 2.8,
          color: activeBoost
            ? 'rgba(186, 230, 253, 0.78)'
            : 'rgba(148, 163, 184, 0.82)',
          alpha: Math.min(0.44, 0.28 + absSpeedRatio * 0.12),
          decay: 1.25 + Math.random() * 0.35,
          isSmoke: true,
        });
      } else {
        // Very light, highly transparent exhaust smoke wisp during gentle driving / cruising
        state.particles.push({
          x: exhaustX - cosA * 3 + (Math.random() - 0.5) * 3,
          y: exhaustY + (Math.random() - 0.5) * 2,
          vx: -cosA * (38 + absSpeedRatio * 32) + (Math.random() - 0.5) * 14,
          vy: -10 - Math.random() * 12,
          size: 4.0 + Math.random() * 2.2,
          color: 'rgba(203, 213, 225, 0.68)',
          alpha: 0.14 + Math.random() * 0.06,
          decay: 1.55 + Math.random() * 0.35,
          isSmoke: true,
        });
      }
    }
  }

  // =========================================================================
  // PROGRESSIVE VEHICLE DAMAGE & PART DISASSEMBLY SYSTEM:
  // - Light/Minor hits: Paint scratches & spiderweb glass cracks (NO smoke, NO explosion)
  // - Medium/Heavy hits: Front/Rear Bumper breaks or detaches, Hood unlatches/opens,
  //   Side Door breaks/unhinges, and Window Glass shatters & falls out completely
  // - ONLY at 0% Health (after repeated severe crashes): Engine smoke + Explosion!
  // =========================================================================
  const spawnDetachedCarPart = (
    partType: DetachedCarPart['type'],
    localOffsetX: number,
    localOffsetY: number,
    partW: number,
    partH: number,
    partColor: string,
    kickVx: number,
    kickVy: number
  ) => {
    const worldX = state.x + cosA * localOffsetX - sinA * localOffsetY;
    const worldY = state.y + sinA * localOffsetX + cosA * localOffsetY;
    state.detachedParts.push({
      id: state.nextEntityId++,
      type: partType,
      x: worldX,
      y: worldY,
      vx: state.vx * 0.45 + kickVx,
      vy: state.vy * 0.3 + kickVy,
      angle: state.angle + (Math.random() - 0.5) * 0.4,
      angVel: (Math.random() < 0.5 ? -1 : 1) * (4.5 + Math.random() * 5.5),
      width: partW,
      height: partH,
      color: partColor,
      accentColor: car.accentColor,
      alpha: 1,
    });
  };

  const applyStructuralImpactDamage = (
    dmgPoints: number,
    zone: 'front' | 'rear' | 'roof' | 'all'
  ) => {
    const armorFactor = 1 / (1 + (armorLevel / 100) * 1.8);
    // Cap single-hit damage to max 13% so it always takes multiple violent crashes to reach 0% Health
    const actualDmg = Math.min(13, dmgPoints * armorFactor);

    // REALISTIC COLLISION THRESHOLD:
    // Light impacts & normal touches (< 4.2) cause ZERO scratches and ZERO damage!
    if (actualDmg < 4.2) return;

    state.health = Math.max(0, state.health - actualDmg);
    const isVeryHeavyHit = actualDmg >= 7.8;
    const deformDelta = actualDmg / (isVeryHeavyHit ? 52 : 88);

    if (zone === 'front' || zone === 'all') {
      state.frontDamage = Math.min(1, state.frontDamage + deformDelta * 1.25);
    }
    if (zone === 'rear' || zone === 'all') {
      state.rearDamage = Math.min(1, state.rearDamage + deformDelta * 1.15);
    }
    if (zone === 'roof' || zone === 'all') {
      state.roofDamage = Math.min(1, state.roofDamage + deformDelta * 1.25);
    }
    state.doorDamage = Math.min(1, state.doorDamage + deformDelta * 0.95);

    // 1. Medium Hit (actualDmg >= 4.2): Minor paint scratches & light glass crack + Realistic Driver Door Scratch SFX!
    if ((state.health <= 85 || actualDmg >= 5.8) && !state.windowCracked) {
      state.windowCracked = true;
    }
    if (actualDmg >= 4.2 && state.doorState === 'intact' && onDriverDoorDamage) {
      onDriverDoorDamage('scratch');
    }

    // 1B. BROKEN HEADLIGHTS REALISM ("إذا تعرضت مقدمة السيارة لاصطدام قوي وأدى ذلك إلى كسر الأضواء الأمامية، فلن تشتغل الأضواء مطلقاً عند حلول الليل/المغرب ويلزم إصلاح السيارة")
    if (
      !state.headlightsBroken &&
      (zone === 'front' || zone === 'all') &&
      (state.frontDamage >= 0.32 || actualDmg >= 6.8)
    ) {
      state.headlightsBroken = true;
      state.headlightsOn = false;
      if (onPartBreakOrGlassShatter) onPartBreakOrGlassShatter(true);
      for (let g = 0; g < 6; g++) {
        spawnDetachedCarPart(
          'glass_shard',
          car.chassisWidth * 0.46,
          -car.chassisHeight * 0.32 + (Math.random() - 0.5) * 8,
          4.5,
          3.5,
          'rgba(254, 240, 138, 0.9)',
          95 + Math.random() * 110,
          -65 - Math.random() * 80
        );
      }
      state.floatingTexts.push({
        id: state.nextEntityId++,
        x: state.x + 28,
        y: state.y - 56,
        text: '💡 انكسرت الأضواء الأمامية! يلزم إصلاح السيارة',
        color: '#FBBF24',
        alpha: 1,
        vy: -42,
      });
    }

    // 2. Very Strong / Heavy Impacts ONLY (isVeryHeavyHit): Front Bumper breaks -> then detaches
    if (
      isVeryHeavyHit &&
      state.frontDamage >= 0.42 &&
      state.frontBumperState === 'intact'
    ) {
      state.frontBumperState = 'hanging';
      if (onPartBreakOrGlassShatter) onPartBreakOrGlassShatter(false);
      state.floatingTexts.push({
        id: state.nextEntityId++,
        x: state.x + 30,
        y: state.y - 42,
        text: '🔧 انكسار الصدام الأمامي!',
        color: '#FBBF24',
        alpha: 1,
        vy: -38,
      });
    } else if (
      isVeryHeavyHit &&
      state.frontDamage >= 0.76 &&
      state.frontBumperState !== 'detached'
    ) {
      state.frontBumperState = 'detached';
      if (onPartBreakOrGlassShatter) onPartBreakOrGlassShatter(false);
      spawnDetachedCarPart(
        'front_bumper',
        car.chassisWidth * 0.48,
        4,
        18,
        9,
        car.secondaryColor,
        85 + Math.random() * 90,
        -115 - Math.random() * 60
      );
      state.floatingTexts.push({
        id: state.nextEntityId++,
        x: state.x + 35,
        y: state.y - 46,
        text: '🔧 انفصال الصدام الأمامي!',
        color: '#F97316',
        alpha: 1,
        vy: -42,
      });
    }

    // 3. Very Strong / Heavy Impacts ONLY: Engine Hood unlatches & opens -> then detaches
    if (
      isVeryHeavyHit &&
      state.frontDamage >= 0.56 &&
      state.hoodState === 'intact'
    ) {
      state.hoodState = 'open';
      if (onPartBreakOrGlassShatter) onPartBreakOrGlassShatter(false);
      state.floatingTexts.push({
        id: state.nextEntityId++,
        x: state.x + 20,
        y: state.y - 52,
        text: '🔧 انفكاك كبوت المحرك (Hood)!',
        color: '#F59E0B',
        alpha: 1,
        vy: -40,
      });
    } else if (
      isVeryHeavyHit &&
      state.frontDamage >= 0.86 &&
      state.hoodState !== 'detached'
    ) {
      state.hoodState = 'detached';
      if (onPartBreakOrGlassShatter) onPartBreakOrGlassShatter(false);
      spawnDetachedCarPart(
        'hood',
        car.chassisWidth * 0.28,
        -car.chassisHeight * 0.48,
        32,
        6,
        car.bodyColor,
        -65 - Math.random() * 80,
        -145 - Math.random() * 70
      );
    }

    // 4. Very Strong / Heavy Impacts ONLY: Rear Bumper breaks -> then detaches
    if (
      isVeryHeavyHit &&
      state.rearDamage >= 0.42 &&
      state.rearBumperState === 'intact'
    ) {
      state.rearBumperState = 'hanging';
      if (onPartBreakOrGlassShatter) onPartBreakOrGlassShatter(false);
    } else if (
      isVeryHeavyHit &&
      state.rearDamage >= 0.76 &&
      state.rearBumperState !== 'detached'
    ) {
      state.rearBumperState = 'detached';
      if (onPartBreakOrGlassShatter) onPartBreakOrGlassShatter(false);
      spawnDetachedCarPart(
        'rear_bumper',
        -car.chassisWidth * 0.48,
        4,
        18,
        9,
        car.secondaryColor,
        -95 - Math.random() * 75,
        -105 - Math.random() * 50
      );
      state.floatingTexts.push({
        id: state.nextEntityId++,
        x: state.x - 30,
        y: state.y - 44,
        text: '🔧 انفصال الصدام الخلفي!',
        color: '#F97316',
        alpha: 1,
        vy: -40,
      });
    }

    // 5. Very Strong / Heavy Impacts ONLY: Window Glass Shatters & Falls Out Completely!
    if (
      isVeryHeavyHit &&
      !state.windowShattered &&
      (state.roofDamage >= 0.56 ||
        state.frontDamage >= 0.72 ||
        state.doorDamage >= 0.62 ||
        state.health <= 34)
    ) {
      state.windowShattered = true;
      if (onPartBreakOrGlassShatter) onPartBreakOrGlassShatter(true);
      for (let g = 0; g < 10; g++) {
        spawnDetachedCarPart(
          'glass_shard',
          (Math.random() - 0.3) * 28,
          -car.chassisHeight * 0.65 + (Math.random() - 0.5) * 12,
          5 + Math.random() * 4,
          4 + Math.random() * 3,
          'rgba(186, 230, 253, 0.88)',
          (Math.random() - 0.5) * 160,
          -80 - Math.random() * 110
        );
      }
      state.floatingTexts.push({
        id: state.nextEntityId++,
        x: state.x,
        y: state.y - 58,
        text: '🪟 تحطم وسقوط زجاج السيارة نهائياً!',
        color: '#38BDF8',
        alpha: 1,
        vy: -44,
      });
    }

    // 6. Very Strong / Heavy Impacts ONLY: Side Door Breaks & Unhinges -> then Detaches!
    if (
      isVeryHeavyHit &&
      state.doorState === 'intact' &&
      (state.doorDamage >= 0.56 || state.health <= 42)
    ) {
      state.doorState = 'broken';
      if (onDriverDoorDamage) onDriverDoorDamage('break');
      else if (onPartBreakOrGlassShatter) onPartBreakOrGlassShatter(false);
      state.floatingTexts.push({
        id: state.nextEntityId++,
        x: state.x,
        y: state.y - 48,
        text: '🚪 انكسار وتفكك الباب الجانبي!',
        color: '#FB923C',
        alpha: 1,
        vy: -40,
      });
    } else if (
      isVeryHeavyHit &&
      state.doorState !== 'detached' &&
      (state.doorDamage >= 0.84 || state.health <= 18)
    ) {
      state.doorState = 'detached';
      if (onDriverDoorDamage) onDriverDoorDamage('detach');
      else if (onPartBreakOrGlassShatter) onPartBreakOrGlassShatter(false);
      spawnDetachedCarPart(
        'side_door',
        4,
        -car.chassisHeight * 0.22,
        car.chassisWidth * 0.28,
        car.chassisHeight * 0.42,
        car.bodyColor,
        -75 + (Math.random() - 0.5) * 90,
        -135 - Math.random() * 65
      );
      state.floatingTexts.push({
        id: state.nextEntityId++,
        x: state.x,
        y: state.y - 54,
        text: '🚪 سقوط الباب الجانبي بالكامل!',
        color: '#EF4444',
        alpha: 1,
        vy: -44,
      });
    }

    // Throw the driver forward/downward inside the cabin on impact!
    state.driverLeanVel += Math.min(9.5, actualDmg * 0.28);
    state.driverBobVel += Math.min(65, actualDmg * 1.9);

    // 7. Smoke & Explosion ONLY when Structural Health reaches 0%!
    if (state.health <= 0) {
      triggerVehicleExplosion(
        state,
        'تدمرت سلامة الهيكل بالكامل (0% Health) بعد حوادث عنيفة متكررة وانفجر المحرك!',
        onExplosion
      );
    }
  };

  // =========================================================================
  // CINEMATIC HIGH-SKY FLYING CAR, SLOW RETRACTING WHEELS & 2-STAGE LANDING ENGINE
  // 1) Takeoff: Wings unfold slowly + 4 Wheels slowly retract & fold inside the chassis + Climb to High Sky above trees, mountains & clouds.
  // 2) High-Sky Flight: Soar in High Sky Zone (540-640px above terrain) above clouds for 02:00.
  // 3) Landing at 00:00:
  //    - Stage A: Gradual descent from High Sky; as ground approaches, wheels slowly deploy downward (Wheels Out) to prepare for asphalt contact.
  //    - Stage B: Right as tires touch the road, wings slowly fold back into the car body and return to normal car mode!
  // =========================================================================
  if (state.flightPhase !== 'none') {
    const baseTerrainY = getTerrainHeight(state.x, map);
    state.wasAirborne = false;
    state.airTime = 0;

    if (state.flightPhase === 'transform_takeoff') {
      state.cutsceneTimer -= rawDt;
      // 1. Wings slowly unfold outward (0 -> 1)
      state.wingDeployProgress = Math.min(
        1,
        state.wingDeployProgress + rawDt * 0.48
      );
      // 2. As soon as wings begin extending, the 4 wheels slowly retract & fold inward into the chassis body (0 -> 1)
      if (state.wingDeployProgress > 0.16) {
        state.wheelRetractProgress = Math.min(
          1,
          state.wheelRetractProgress + rawDt * 0.44
        );
      }
      state.rearCompression = -4.5 * (1 - state.wheelRetractProgress);
      state.frontCompression = -4.5 * (1 - state.wheelRetractProgress);

      // 3. Smooth climb up into the High Sky Zone (above all trees, mountains, and clouds!)
      const targetHighSkyY = baseTerrainY - 545;
      const liftFactor = Math.max(0, (state.wingDeployProgress - 0.15) / 0.85);
      state.vx += (310 - state.vx) * 2.4 * rawDt;
      state.vy +=
        ((targetHighSkyY - state.y) * 2.8 * liftFactor - state.vy * 4.0) *
        rawDt;
      const desiredPitch = -0.18 * liftFactor;
      state.angle += (desiredPitch - state.angle) * 4.5 * rawDt;
      state.angVel = 0;

      if (state.particles.length < maxParticles && Math.random() < 0.75) {
        state.particles.push({
          x: state.x - cosA * 38,
          y: state.y + 6,
          vx: -180 - Math.random() * 120,
          vy: 35 + Math.random() * 45,
          size: 4.5 + Math.random() * 3,
          color: Math.random() < 0.5 ? '#38BDF8' : car.accentColor,
          alpha: 0.92,
          decay: 2.4,
          isSpark: true,
        });
      }

      if (
        state.cutsceneTimer <= 0 &&
        state.wingDeployProgress >= 0.99 &&
        state.wheelRetractProgress >= 0.99
      ) {
        state.flightPhase = 'flying';
        state.wingDeployProgress = 1;
        state.wheelRetractProgress = 1;
      }
    } else if (state.flightPhase === 'flying') {
      state.wingDeployProgress = 1;
      state.wheelRetractProgress = 1;
      state.rearCompression = 0;
      state.frontCompression = 0;
      state.flightTimer = Math.max(0, state.flightTimer - rawDt);

      // High-Altitude Sky Zone (500px to 640px above terrain — completely above trees, mountains & cloud deck!)
      const targetCruisingAlt = controls.gas
        ? 635
        : controls.brake
        ? 490
        : 565;
      const targetFlyY =
        baseTerrainY -
        targetCruisingAlt +
        Math.sin(timeSec * 2.0) * 12;
      const targetAirSpeed = activeBoost
        ? maxSpeed * 1.74
        : controls.gas
        ? maxSpeed * 1.08
        : controls.brake
        ? maxSpeed * 0.65
        : maxSpeed * 0.88;

      state.vx += (targetAirSpeed - state.vx) * 3.2 * rawDt;
      state.vy += ((targetFlyY - state.y) * 4.2 - state.vy * 5.0) * rawDt;

      const targetFlightPitch = Math.max(
        -0.22,
        Math.min(0.2, state.vy * 0.0018 + (controls.gas ? -0.05 : 0))
      );
      state.angle += (targetFlightPitch - state.angle) * 6.5 * rawDt;
      state.angVel = 0;

      // Jet Engine Afterburner Sparks in High Sky (Zero Exhaust Smoke in Flight!)
      if (
        state.particles.length < maxParticles &&
        (controls.gas || activeBoost) &&
        Math.random() < 0.72
      ) {
        state.particles.push({
          x: state.x - cosA * (car.chassisWidth * 0.48),
          y: state.y - sinA * (car.chassisWidth * 0.48) + 2,
          vx: -state.vx * 0.55 - 160 - Math.random() * 90,
          vy: (Math.random() - 0.5) * 28,
          size: activeBoost ? 4.5 + Math.random() * 2.5 : 3.5 + Math.random() * 2,
          color:
            Math.random() < 0.55
              ? '#00F0FF'
              : Math.random() < 0.5
              ? '#F97316'
              : '#FEF08A',
          alpha: 0.88,
          decay: 3.0,
          isSpark: true,
        });
      }

      // When the 2-minute (02:00) timer reaches 00:00, begin gradual descent from High Sky!
      if (state.flightTimer <= 0) {
        state.flightPhase = 'transform_landing';
        state.landingTouchedDown = false;
        state.cutsceneTimer = 4.2;
        if (onWingTransform) {
          onWingTransform(false);
        }
        state.floatingTexts.push({
          id: state.nextEntityId++,
          x: state.x,
          y: state.y - 58,
          text: '🛬 انتهى الوقت (00:00)! هبوط تدريجي من قمم السماء وإنزال العجلات...',
          color: '#F59E0B',
          alpha: 1,
          vy: -36,
        });
      }
    } else if (state.flightPhase === 'transform_landing') {
      state.cutsceneTimer = Math.max(0, state.cutsceneTimer - rawDt);
      const safeGroundY = overGap
        ? baseTerrainY
        : (rearGroundY + frontGroundY) * 0.5;
      const roadLandingY = safeGroundY - rideHeight + 2;
      const heightAboveRoad = Math.max(0, roadLandingY - state.y);

      if (!state.landingTouchedDown) {
        // === STAGE A: GRADUAL DESCENT FROM HIGH SKY & DEPLOYING WHEELS BEFORE ROAD CONTACT ===
        // Keep wings fully deployed (1.0) while gliding down through the sky!
        state.wingDeployProgress = 1;

        // Controlled smooth descent velocity toward the asphalt
        const desiredDescentVy = Math.min(
          210,
          Math.max(48, heightAboveRoad * 1.35)
        );
        state.vx += (maxSpeed * 0.68 - state.vx) * 2.5 * rawDt;
        state.vy += (desiredDescentVy - state.vy) * 5.0 * rawDt;

        // As the aircraft approaches the ground (below 320px altitude), slowly deploy & unfold the 4 wheels downward!
        if (heightAboveRoad < 320) {
          const targetWheelRetract = Math.max(
            0,
            Math.min(1, (heightAboveRoad - 42) / 260)
          );
          state.wheelRetractProgress +=
            (targetWheelRetract - state.wheelRetractProgress) * 5.5 * rawDt;
          if (heightAboveRoad < 50) {
            state.wheelRetractProgress = Math.max(
              0,
              state.wheelRetractProgress - rawDt * 1.4
            );
          }
        }

        // Level out pitch to match road slope as tires prepare for touchdown
        const approachPitch =
          heightAboveRoad > 120 ? 0.06 : terrainAngle * 0.85;
        state.angle += (approachPitch - state.angle) * 5.5 * rawDt;
        state.angVel = 0;

        // Check if tires have touched the asphalt with wheels deployed!
        if (heightAboveRoad <= 5 && state.wheelRetractProgress <= 0.08) {
          state.landingTouchedDown = true;
          state.wheelRetractProgress = 0;
          state.y = roadLandingY;
          state.vy = 0;
          state.rearCompression = 6.5;
          state.frontCompression = 6.5;
          state.floatingTexts.push({
            id: state.nextEntityId++,
            x: state.x,
            y: state.y - 56,
            text: '🛞 لامست الإطارات الأسفلت! جاري طي الأجنحة ببطء...',
            color: '#38BDF8',
            alpha: 1,
            vy: -36,
          });
        }
      } else {
        // === STAGE B: TIRES ON ASPHALT -> FOLD WINGS SLOWLY INTO CHASSIS ===
        state.wheelRetractProgress = 0;
        state.y = roadLandingY;
        state.vy = 0;
        state.vx += (maxSpeed * 0.58 - state.vx) * 3.0 * rawDt;
        state.angle += (terrainAngle - state.angle) * 7.5 * rawDt;
        state.angVel = 0;
        state.rearCompression *= 0.9;
        state.frontCompression *= 0.9;

        // Slowly fold wings back into the car body (1 -> 0) now that tires are on the road
        state.wingDeployProgress = Math.max(
          0,
          state.wingDeployProgress - rawDt * 0.58
        );

        // Wing-latch folding sparks
        if (state.particles.length < maxParticles && Math.random() < 0.75) {
          state.particles.push({
            x: state.x + (Math.random() - 0.5) * 52,
            y: state.y - 10 + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 110,
            vy: -30 - Math.random() * 50,
            size: 3.5 + Math.random() * 2.2,
            color: Math.random() < 0.5 ? '#F59E0B' : '#38BDF8',
            alpha: 0.9,
            decay: 2.6,
            isSpark: true,
          });
        }

        if (state.wingDeployProgress <= 0.01) {
          state.flightPhase = 'none';
          state.wingDeployProgress = 0;
          state.wheelRetractProgress = 0;
          state.landingTouchedDown = false;
          state.cutsceneTimer = 0;
          state.floatingTexts.push({
            id: state.nextEntityId++,
            x: state.x,
            y: state.y - 54,
            text: '🚗 اكتمل طي الأجنحة والتحول إلى وضعية السيارة بنجاح!',
            color: '#10B981',
            alpha: 1,
            vy: -40,
          });
        }
      }
    }
  } else if (onGround) {
    // =========================================================================
    // STRICT INDEPENDENT SUSPENSION IMPACT PER WHEEL (Front vs Rear Ground-Check Isolation):
    // - Landing impact compression is strictly isolated to the specific wheel that touches the ground.
    // - If the front wheel lands first, ONLY the front suspension spring compresses while the rear wheel
    //   remains in its uncompressed/airborne state until it explicitly collides with the ground, and vice versa.
    // =========================================================================
    const rearJustLanded = state.groundedRear && !prevGroundedRear;
    const frontJustLanded = state.groundedFront && !prevGroundedFront;

    if (
      (rearJustLanded || frontJustLanded) &&
      (state.wasAirborne || state.airTime > 0.05 || state.vy > 28)
    ) {
      const landingVy = Math.max(state.peakAirVy, state.vy, 0);
      const flightDuration = Math.max(state.peakAirTime, state.airTime);
      const softLandingCompress = Math.min(
        10.5,
        Math.max(2.2, landingVy * 0.028 + flightDuration * 2.8)
      );

      // Isolate landing compression strictly to the Rear Wheel if the Rear Wheel just touched the ground (zero rebound bounce!)
      if (rearJustLanded) {
        state.rearCompression = Math.max(
          state.rearCompression,
          softLandingCompress * 0.42
        );
        state.rearSpringVel = 0;
      }

      // Isolate landing compression strictly to the Front Wheel if the Front Wheel just touched the ground (zero rebound bounce!)
      if (frontJustLanded) {
        state.frontCompression = Math.max(
          state.frontCompression,
          softLandingCompress * 0.42
        );
        state.frontSpringVel = 0;
      }

      state.vy = 0;
      state.angVel *= 0.15;

      if (flightDuration >= 0.28 || landingVy > 95) {
        const impactSeverity = Math.min(
          1.45,
          (landingVy / 240) * 0.6 + (flightDuration / 1.15) * 0.65
        );
        if (onHeavyImpact && impactSeverity >= 0.48) {
          onHeavyImpact(impactSeverity * 0.72);
        }
        state.driverBobVel += Math.min(20, landingVy * 0.1);

        // Inflict structural body deformation ONLY on genuinely hard/awkward landings (normal jumps cause 0 damage!)
        const pitchError = Math.abs(state.angle - terrainAngle);
        if (landingVy > 240 || (landingVy > 190 && pitchError > 0.65)) {
          const zone = frontJustLanded && !rearJustLanded
            ? 'front'
            : rearJustLanded && !frontJustLanded
            ? 'rear'
            : pitchError > 1.25
            ? 'roof'
            : 'all';
          const dmg =
            Math.max(0, (landingVy - 210) * 0.11) +
            (pitchError > 0.65 ? (pitchError - 0.5) * 13 : 0);
          if (dmg >= 4.2) {
            applyStructuralImpactDamage(dmg, zone);
          }
        }

        const burstCount =
          quality === 'Low' ? 3 : Math.min(10, Math.round(4 + impactSeverity * 5));
        for (let b = 0; b < burstCount; b++) {
          // Spawn landing dust/sparks strictly at the specific wheel(s) that impacted the ground!
          const useFrontWheel =
            frontJustLanded && (!rearJustLanded || b % 2 === 0);
          const wx = useFrontWheel ? frontWheelX : rearWheelX;
          const wy = useFrontWheel ? frontGroundY : rearGroundY;
          const isHardSpark = impactSeverity > 0.78 && b % 3 === 0;
          state.particles.push({
            x: wx + (Math.random() - 0.5) * 18,
            y: wy - 3,
            vx: (Math.random() - 0.5) * (140 + impactSeverity * 120),
            vy: -30 - Math.random() * (70 * impactSeverity),
            size: isHardSpark ? 3 : 4.2 + Math.random() * 3.5,
            color: isHardSpark
              ? '#FEF08A'
              : state.inMud
              ? '#78350F'
              : map.isNeon
              ? '#00F0FF'
              : map.groundTop,
            alpha: 0.9,
            decay: 2.2 + Math.random() * 0.8,
            isSpark: isHardSpark,
          });
        }
      }

      // Award Airtime Bonus if landing from a real jump on the ground road (never during airplane flight)!
      if (
        state.wasAirborne &&
        flightDuration >= 0.52 &&
        !state.isExploded &&
        state.flightPhase === 'none'
      ) {
        const airBonus = Math.round(flightDuration * 120 * map.coinMultiplier);
        state.sessionCoins += airBonus;
        const isMegaJump = flightDuration >= 1.05 || landingVy > 240;
        state.floatingTexts.push({
          id: state.nextEntityId++,
          x: state.x,
          y: state.y - 54,
          text: isMegaJump
            ? `هبوط ساحق! MEGA JUMP +${airBonus}`
            : `قفزة رائعة! AIRTIME +${airBonus}`,
          color: isMegaJump ? '#F97316' : '#38BDF8',
          alpha: 1,
          vy: -44,
        });
        state.wasAirborne = false;
      }
    }

    // Only clear airborne tracking once BOTH front and rear wheels have touched the ground
    if (state.groundedRear && state.groundedFront) {
      state.wasAirborne = false;
      state.peakAirVy = 0;
      state.peakAirTime = 0;
      state.airTime = 0;
      state.accumulatedAirAngle = 0;
    }

    // Critically Damped Hooke's Law Suspension Spring & Damper Simulation (Zero oscillatory bouncing on flat roads or slopes!)
    const rearPen = Math.max(0, rearWheelBottomY - rearGroundY);
    const frontPen = Math.max(0, frontWheelBottomY - frontGroundY);
    const bridgePlankRipple = 0;
    const isReversingOnGround = activeBrake && state.vx < -4;
    const isBrakingForward = activeBrake && state.vx > 8;
    const reverseEnginePulse = 0;
    void isReversingOnGround;
    const bumpWave = bridgePlankRipple + reverseEnginePulse;

    // =========================================================================
    // BALANCED CENTER OF MASS & STEADY WEIGHT TRANSFER PHYSICS:
    // - Heavily damped pitch response prevents nose-bobbing and uncontrollable bouncing
    // =========================================================================
    const onRockContact = frontRockBump > 0.12 || rearRockBump > 0.12;
    const dynamicRockPitch = Math.max(
      -0.095,
      Math.min(0.095, ((rearRockBump - frontRockBump) / car.wheelBase) * 0.44)
    );
    const dynamicBridgePitch = 0;
    const rawLongAccel = (state.vx - state.prevVx) / Math.max(0.008, dt);
    const accelBoost = Math.min(0.025, Math.max(0, rawLongAccel * 0.00008));
    const decelBoost = Math.min(0.028, Math.max(0, -rawLongAccel * 0.00008));
    const pedalWeightPitch = activeBoost
      ? -0.095 - accelBoost * 0.4
      : activeGas
      ? -0.068 - accelBoost
      : activeBrake
      ? (isBrakingForward ? 0.085 + decelBoost : 0.055 + decelBoost * 0.4)
      : 0;
    const targetWeightPitch =
      pedalWeightPitch + dynamicRockPitch + dynamicBridgePitch;

    state.weightTransferVel = 0;
    state.weightTransferPitch +=
      (targetWeightPitch - state.weightTransferPitch) * Math.min(1, 16.0 * dt);
    state.weightTransferPitch = Math.max(
      -0.14,
      Math.min(0.14, state.weightTransferPitch)
    );

    // =========================================================================
    // CRITICALLY DAMPED SUSPENSION ABSORPTION & DYNAMIC ROCK CLIMBING (HCR2 Style):
    // - Absorbs roadside rocks dynamically via per-wheel travel, coil compression, and chassis tilt!
    // =========================================================================
    const rockWeightShift = (frontRockBump - rearRockBump) * 0.22;
    const rearAccelSquatComp =
      (activeBoost
        ? 2.8
        : activeGas && state.vx >= -10
        ? 2.0
        : 0) + Math.max(0, rockWeightShift);
    const frontAccelLiftExt =
      (activeBoost
        ? 1.4
        : activeGas && state.vx >= -10
        ? 1.0
        : 0) - Math.max(0, -rockWeightShift);
    const bridgeBaseFlex = 0;

    const targetRearComp = Math.min(
      14.5,
      Math.max(
        0,
        rearRockBump + bridgeBaseFlex + bumpWave
      )
    );
    const targetFrontComp = Math.min(
      14.5,
      Math.max(
        0,
        frontRockBump + bridgeBaseFlex - bumpWave
      )
    );
    void rearAccelSquatComp;
    void frontAccelLiftExt;

    const targetAirExtension = -3.5;

    // 1) Independent Rear Wheel Suspension: 100% Flush Rock & Ground Surface Tracking (Zero Air Gap!)
    if (state.groundedRear) {
      state.rearSpringVel = 0;
      state.rearCompression = targetRearComp;
    } else {
      state.rearSpringVel = 0;
      state.rearCompression +=
        (targetAirExtension - state.rearCompression) * Math.min(1, 12.0 * dt);
    }

    // 2) Independent Front Wheel Suspension: 100% Flush Rock & Ground Surface Tracking (Zero Air Gap!)
    if (state.groundedFront) {
      state.frontSpringVel = 0;
      state.frontCompression = targetFrontComp;
    } else {
      state.frontSpringVel = 0;
      state.frontCompression +=
        (targetAirExtension - state.frontCompression) * Math.min(1, 12.0 * dt);
    }

    // Keep outer wheel reference frame locked to the road surface so tires sit 100% flush on rocks & road!
    state.y += (targetChassisY - state.y) * Math.min(1, 28.0 * dt);
    state.vy = 0;
    if (
      (state.onBridge || rearSurf.onBridge || frontSurf.onBridge) &&
      state.y > targetChassisY
    ) {
      state.y = targetChassisY;
      state.vy = 0;
    }

    // =========================================================================
    // 1. GRAVITY & SLOPE SLIDING PHYSICS (SLOPE ACCELERATION):
    //    - Time-scaled slope gravity preserves vehicle inertia when coasting!
    // =========================================================================
    const slopeSteepness = Math.abs(Math.sin(state.angle));
    const gravityFactor = (8.5 + slopeSteepness * 12.5) * (map.gravity / 9.8) * (dt * 60) * 0.48;
    if (state.angle > 0.014) {
      // Tilted forward (downhill): smooth forward velocity boost proportional to steepness
      state.vx += Math.sin(state.angle) * gravityFactor;
    } else if (state.angle < -0.014) {
      // Tilted backward (uphill/facing back): smoothly roll backward proportional to steepness
      const backwardTilt = Math.abs(state.angle);
      state.vx -= Math.sin(backwardTilt) * gravityFactor;
    }

    const rainSlipFactor = 1 - state.rainIntensity * 0.08;
    const mudGripPenalty = state.inMud
      ? Math.min(0.92, 0.68 + (engineLevel / 100) * 0.24)
      : rainSlipFactor;

    // Enhanced tire grip & climbing suspension torque when contacting rocks along the terrain
    const rockTireGripBoost = onRockContact ? 1.28 : 1.0;
    const rockClimbTorqueAssist = onRockContact ? accelForce * 0.35 : 0;

    const targetCruiseMaxSpeed = state.inMud
      ? maxSpeed * 0.80
      : maxSpeed * (state.angle > 0.08 ? 1 + Math.sin(state.angle) * 0.25 : 1);
    const boostTopSpeed = maxSpeed * 1.85;
    const maxReverseSpeed = maxSpeed * (state.inMud ? 0.34 : 0.45);

    if (activeGas) {
      const boostFactor = activeBoost ? 2.45 : 1.0;
      const jetSurge = activeBoost ? 420 : 0;
      const speedNorm = Math.min(
        1,
        Math.abs(state.vx) / Math.max(1, activeBoost ? boostTopSpeed : targetCruiseMaxSpeed)
      );
      const progressiveTorqueCurve = 1.0 - speedNorm * (activeBoost ? 0.20 : 0.25);
      const forwardPush =
        (accelForce * grip * mudGripPenalty * rockTireGripBoost * boostFactor +
          rockClimbTorqueAssist * boostFactor) *
          progressiveTorqueCurve +
        jetSurge * progressiveTorqueCurve;
      if (state.vx < 0) {
        // Smooth transition from reverse momentum into forward acceleration
        state.vx += (forwardPush * 1.35 + 140) * dt;
      } else if (activeBoost) {
        state.vx = Math.min(boostTopSpeed, state.vx + forwardPush * dt);
      } else if (state.vx < targetCruiseMaxSpeed) {
        state.vx = Math.min(targetCruiseMaxSpeed, state.vx + forwardPush * dt);
      } else {
        // Turbo 2x was released while still holding Gas: DO NOT instantly drop/reset speed!
        // Maintain forward momentum and decay gradually toward normal cruising speed:
        const overSpeed = state.vx - targetCruiseMaxSpeed;
        const gradualDecay = (32 + overSpeed * 0.55) * dt;
        state.vx = Math.max(targetCruiseMaxSpeed, state.vx - gradualDecay);
      }

      if (state.inMud && !activeBoost && state.vx > targetCruiseMaxSpeed) {
        state.vx -= 28 * dt;
      }
    } else if (activeBrake) {
      // =========================================================================
      // 2. REALISTIC SMOOTH BRAKING & NATURAL USABLE REVERSE SPEED:
      //    - Progressive linear + rolling deceleration without abrupt speed snapping
      // =========================================================================
      if (state.vx > 3.5) {
        const brakeDecel =
          (accelForce * 1.45 + 140) * grip * mudGripPenalty * rockTireGripBoost * dt;
        state.vx = Math.max(0, (state.vx - brakeDecel) * Math.pow(0.988, dt * 60));
        if (state.vx < 3.5) {
          state.vx = 0;
        }
      } else if (hasFuel) {
        // Natural, usable reverse speed when holding BRAKE/REV
        const revNorm = Math.min(1, Math.abs(state.vx) / Math.max(1, maxReverseSpeed));
        const revTorqueCurve = 1.0 - revNorm * 0.25;
        const reversePush =
          (accelForce * 0.82 + rockClimbTorqueAssist * 0.5) *
          grip *
          mudGripPenalty *
          rockTireGripBoost *
          revTorqueCurve;
        state.vx = Math.max(-maxReverseSpeed, state.vx - reversePush * dt);
      } else {
        state.vx *= Math.pow(0.96, dt * 60);
      }
    } else {
      // =========================================================================
      // 3. VEHICLE INERTIA & GRADUAL COASTING DECELERATION:
      //    - When Turbo 2x, Gas, or Reverse is released, DO NOT instantly reset or drop speed.
      //    - Maintain forward/backward momentum with realistic linear velocity decay & high inertia.
      // =========================================================================
      const rollingInertia = Math.pow(state.inMud ? 0.992 : 0.9978, dt * 60);
      state.vx *= rollingInertia;
      const linearCoastDecay = (state.inMud ? 19.0 : 9.5) * dt;
      if (state.vx > linearCoastDecay) {
        state.vx -= linearCoastDecay;
      } else if (state.vx < -linearCoastDecay) {
        state.vx += linearCoastDecay;
      } else if (Math.abs(state.angle) <= 0.02) {
        state.vx = 0;
      }
    }

    // Clamp only to physical absolute bounds [-maxReverseSpeed, boostTopSpeed] so releasing Turbo 2x NEVER snaps speed!
    state.vx = Math.max(-maxReverseSpeed, Math.min(boostTopSpeed, state.vx));

    // Smooth road surface collision without phantom slope-change impact damage or invisible tripping on curved paths!
    void frontRockBump;
    void rearRockBump;

    // Steady Downforce & Grounded Stability (Chassis tilt over rocks is applied to the car body in renderVehicle3D so tires stay 100% flush on the ground & rocks!)
    const maxSafeSlopeAngle = 0.52;
    const clampedTerrainAngle = Math.max(
      -maxSafeSlopeAngle,
      Math.min(maxSafeSlopeAngle, terrainAngle)
    );
    const desiredAngle = clampedTerrainAngle;

    // Critically damped angular alignment (eliminates pitch rocking/bouncing)
    state.angVel = 0;
    state.angle += (desiredAngle - state.angle) * Math.min(1, 22.0 * dt);
    state.angle = Math.max(-0.52, Math.min(0.52, state.angle));

    // Kick up Mud Splatter, Rain Spray, or Grass/Sand/Snow particles on ground
    if (
      state.particles.length < maxParticles &&
      Math.abs(state.vx) > 45 &&
      Math.random() < (state.inMud ? 0.78 : state.rainIntensity > 0.4 ? 0.62 : 0.42)
    ) {
      const mudColors = ['#451A03', '#78350F', '#92400E'];
      const pColor = state.inMud
        ? mudColors[Math.floor(Math.random() * mudColors.length)]
        : state.rainIntensity > 0.45 && Math.random() < 0.55
        ? 'rgba(186, 230, 253, 0.85)'
        : map.isNeon
        ? '#00F0FF'
        : map.groundTop;
      state.particles.push({
        x: rearWheelX - cosA * 14,
        y: rearGroundY - 4,
        vx: -state.vx * (state.inMud ? 0.35 : 0.25) + (Math.random() - 0.5) * 55,
        vy: -(state.inMud ? 38 : 22) - Math.random() * 48,
        size: state.inMud ? 4.5 + Math.random() * 4 : 3.5 + Math.random() * 3.5,
        color: pColor,
        alpha: 0.88,
        decay: 1.9 + Math.random(),
      });
    }
  } else {
    // AIRBORNE JUMP PHYSICS
    state.airTime += dt;
    if (state.airTime > 0.08) {
      state.wasAirborne = true;
    }
    state.peakAirTime = Math.max(state.peakAirTime, state.airTime);
    state.peakAirVy = Math.max(state.peakAirVy, state.vy);

    // Smooth Downward Suspension Spring Extension (Wheel Droop) Under Gravity in Mid-Air Jumps
    const targetAirExtension = -5.8;
    state.rearSpringVel += (targetAirExtension - state.rearCompression) * 90 * dt;
    state.rearSpringVel *= Math.pow(0.78, dtScale);
    state.rearCompression = Math.max(
      -6.5,
      Math.min(15.5, state.rearCompression + state.rearSpringVel * dt)
    );

    state.frontSpringVel += (targetAirExtension - state.frontCompression) * 90 * dt;
    state.frontSpringVel *= Math.pow(0.78, dtScale);
    state.frontCompression = Math.max(
      -6.5,
      Math.min(15.5, state.frontCompression + state.frontSpringVel * dt)
    );
    state.weightTransferPitch *= Math.pow(0.88, dtScale);
    state.weightTransferVel *= Math.pow(0.82, dtScale);

    // Hill Climb Racing 2 arc flight gravity & mid-air wheel rotational torque
    state.vy += map.gravity * 62 * dt;

    if (activeBoost) {
      state.vx += Math.cos(state.angle) * 132 * dt;
      state.vy += Math.sin(state.angle) * 48 * dt;
      const effectiveMaxSpeed = maxSpeed * 1.35;
      state.vx = Math.min(effectiveMaxSpeed, state.vx);
    }

    const airControlTorque = 4.35 * suspMult;
    if (controls.gas) {
      state.angVel -= airControlTorque * dt;
      // Grounded landing stability assist: gently damp excessive nose-up flip if near ground unless doing a full flip
      if (distBelowTarget > -52 && state.vy > 40 && Math.abs(state.angle) < 0.85) {
        state.angVel += (terrainAngle - state.angle) * 2.4 * dt;
      }
    } else if (controls.brake) {
      state.angVel += airControlTorque * dt;
      if (distBelowTarget > -52 && state.vy > 40 && Math.abs(state.angle) < 0.85) {
        state.angVel += (terrainAngle - state.angle) * 2.4 * dt;
      }
    } else {
      const selfRighting =
        -Math.sin(state.angle - terrainAngle) * 7.2 - state.angVel * 3.8;
      state.angVel += selfRighting * dt;
    }

    state.angVel *= Math.pow(0.94, dtScale);
    state.angVel = Math.max(-3.2, Math.min(3.2, state.angVel));

    const prevAngle = state.angle;
    state.angle += state.angVel * dt;
    // Prevent accidental car flipping when no pedals are pressed or before reaching the first drawbridge!
    if ((!controls.gas && !controls.brake) || state.x < 820) {
      state.angle = Math.max(-0.52, Math.min(0.52, state.angle));
    }
    state.accumulatedAirAngle += state.angle - prevAngle;

    if (
      Math.abs(state.accumulatedAirAngle) >= Math.PI * 1.85 &&
      state.flightPhase === 'none'
    ) {
      state.flipsCount += 1;
      state.accumulatedAirAngle = 0;
      const flipBonus = Math.round(150 * map.coinMultiplier);
      state.sessionCoins += flipBonus;
      state.floatingTexts.push({
        id: state.nextEntityId++,
        x: state.x,
        y: state.y - 55,
        text: `شقلبة هوائية! +${flipBonus}`,
        color: '#F59E0B',
        alpha: 1,
        vy: -45,
      });
      onCoinPickup();
    }
  }

  // Integrate position (allow smooth reversing back toward the start line)
  state.x = Math.max(60, state.x + state.vx * dt);
  if (state.x <= 60 && state.vx < 0) {
    state.vx = 0;
  }
  state.y += state.vy * dt;

  // Prevent wheels from clipping deep below effective surface (unless falling into a gap jump or fatal pit or flying)
  if (!overGap && !fatalPit && state.flightPhase === 'none') {
    const latestRearSurf = getEffectiveSurfaceInfo(
      state.x - Math.cos(state.angle) * halfWheelBase,
      map,
      state,
      timeSec
    );
    const latestFrontSurf = getEffectiveSurfaceInfo(
      state.x + Math.cos(state.angle) * halfWheelBase,
      map,
      state,
      timeSec
    );
    const latestCenterSurf = getEffectiveSurfaceInfo(
      state.x,
      map,
      state,
      timeSec
    );
    const latestRearGround = latestRearSurf.y;
    const latestFrontGround = latestFrontSurf.y;
    const latestCenterGround = latestCenterSurf.y;
    const onBridgeLatest =
      latestRearSurf.onBridge ||
      latestFrontSurf.onBridge ||
      latestCenterSurf.onBridge ||
      state.onBridge;
    const smoothedLatestGround = onBridgeLatest
      ? (latestRearGround + latestFrontGround) * 0.5
      : (latestRearGround + 2 * latestCenterGround + latestFrontGround) * 0.25;
    const cosLatest = Math.cos(state.angle);
    const sinLatest = Math.sin(state.angle);
    const latestRearRockBump = getWheelRockBumpAtWorldX(
      state.x - cosLatest * halfWheelBase - sinLatest * 22,
      state.obstacles
    );
    const latestFrontRockBump = getWheelRockBumpAtWorldX(
      state.x + cosLatest * halfWheelBase - sinLatest * 22,
      state.obstacles
    );
    if (onGround) {
      // Lock wheel compression 1:1 to the visible rock surface contour at the exact integrated wheel X
      // so tires sit 100% flush on top of rocks with zero air gap on both climb and descent!
      if (state.groundedRear) {
        state.rearCompression = Math.min(14.5, latestRearRockBump);
      }
      if (state.groundedFront) {
        state.frontCompression = Math.min(14.5, latestFrontRockBump);
      }
      const lockedGroundY = smoothedLatestGround - rideHeight;
      state.y = lockedGroundY;
      state.vy = 0;
    }
    const latestRearWheelBottomY =
      state.y -
      Math.sin(state.angle) * halfWheelBase +
      (rideHeight - Math.max(0, state.rearCompression * 0.85));
    const latestFrontWheelBottomY =
      state.y +
      Math.sin(state.angle) * halfWheelBase +
      (rideHeight - Math.max(0, state.frontCompression * 0.85));
    const rearGroundSlack = latestRearSurf.onBridge ? 0 : 4;
    const frontGroundSlack = latestFrontSurf.onBridge ? 0 : 4;
    const rearExceeded =
      latestRearWheelBottomY > latestRearGround + rearGroundSlack;
    const frontExceeded =
      latestFrontWheelBottomY > latestFrontGround + frontGroundSlack;
    const avgCompSlack = onBridgeLatest
      ? 0
      : Math.max(0, (state.rearCompression + state.frontCompression) * 0.22);
    const bridgeSlack = (onBridgeLatest ? 0 : 2) + avgCompSlack;
    const minAllowedY = smoothedLatestGround - rideHeight + bridgeSlack;
    if (state.y > minAllowedY || rearExceeded || frontExceeded) {
      if (state.vy > 110) {
        const hardLandingSeverity = Math.min(1.35, state.vy / 245);
        const targetLandingComp = Math.min(11.5, state.vy * 0.036);
        // Strictly isolate compression to the specific wheel(s) that contacted the ground
        if (rearExceeded) {
          state.rearCompression = Math.max(
            state.rearCompression,
            targetLandingComp * 0.6
          );
          state.rearSpringVel = Math.min(26, targetLandingComp * 2.2);
          state.groundedRear = true;
        }
        if (frontExceeded) {
          state.frontCompression = Math.max(
            state.frontCompression,
            targetLandingComp * 0.6
          );
          state.frontSpringVel = Math.min(26, targetLandingComp * 2.2);
          state.groundedFront = true;
        }
        if (
          onHeavyImpact &&
          state.impactCooldown <= 0 &&
          hardLandingSeverity > 0.55
        ) {
          state.impactCooldown = 0.35;
          onHeavyImpact(hardLandingSeverity * 0.72);
        }
        if (state.vy > 270) {
          applyStructuralImpactDamage((state.vy - 225) * 0.12, 'all');
        }
      }
      if (state.y > minAllowedY) {
        state.y = minAllowedY;
        if (state.vy > 0) state.vy = 0;
      }
      state.angle = Math.atan2(Math.sin(state.angle), Math.cos(state.angle));
      if (!onGround && Math.abs(state.angle) < 2.35) {
        // Smooth, critically damped pitch alignment upon airborne landing (never locks grounded pitch!)
        state.angle += (terrainAngle - state.angle) * Math.min(1, 10.5 * dt);
        state.angVel *= Math.pow(0.42, dt * 60);
      }
    }
  }

  // =========================================================================
  // 3. REALISTIC DRIVER INERTIA PHYSICS INSIDE TRANSPARENT CABIN
  //    (Reacts to longitudinal acceleration/braking G-force & vertical suspension bumps!)
  // =========================================================================
  const accelX = (state.vx - state.prevVx) / dt;
  const targetDriverLean = Math.max(
    -0.36,
    Math.min(
      0.42,
      -accelX * 0.00065 +
        (activeBoost ? -0.18 : activeGas ? -0.09 : activeBrake && state.vx > 10 ? 0.22 : 0)
    )
  );
  state.driverLeanVel += (targetDriverLean - state.driverLean) * 145 * dt;
  state.driverLeanVel *= Math.pow(0.82, dtScale);
  state.driverLean = Math.max(
    -0.44,
    Math.min(0.48, state.driverLean + state.driverLeanVel * dt)
  );

  const targetBobY =
    (state.rearCompression + state.frontCompression) * 0.18 -
    Math.max(-4, Math.min(5, state.vy * 0.015));
  state.driverBobVel += (targetBobY - state.driverBobY) * 165 * dt;
  state.driverBobVel *= Math.pow(0.8, dtScale);
  state.driverBobY = Math.max(
    -6,
    Math.min(7, state.driverBobY + state.driverBobVel * dt)
  );

  state.prevVx = state.vx;
  state.prevVy = state.vy;

  // =========================================================================
  // 4. UPDATE DETACHED CAR PARTS & SHATTERED GLASS SHARDS (Tumbling & Terrain Bounce)
  //    (Note: Engine Smoke & Explosion are strictly reserved for 0% Health!)
  // =========================================================================
  for (let i = state.detachedParts.length - 1; i >= 0; i--) {
    const part = state.detachedParts[i];
    part.vy += map.gravity * 58 * dt;
    part.x += part.vx * dt;
    part.y += part.vy * dt;
    part.angle += part.angVel * dt;

    const gy = getTerrainHeight(part.x, map);
    if (part.y >= gy - 4) {
      part.y = gy - 4;
      part.vy = -Math.abs(part.vy) * 0.42;
      part.vx *= 0.78;
      part.angVel *= 0.75;
    }

    part.alpha -= (part.type === 'glass_shard' ? 0.55 : 0.28) * dt;
    if (part.alpha <= 0 || part.x < state.x - 650) {
      state.detachedParts.splice(i, 1);
    }
  }

  // In mud puddles, wheels spin faster due to tire slip!
  const wheelSlipMult = state.inMud && activeGas ? 1.85 : 1.0;
  state.wheelRotation += ((state.vx * wheelSlipMult) * dt) / car.wheelRadius;

  state.distance = Math.max(0, Math.floor((state.x - 140) / 25));
  if (state.distance > state.maxDistance) {
    state.maxDistance = state.distance;
  }

  spawnObstaclesAhead(state);
  spawnPickupsAhead(state, map);

  // COLLECT PICKUPS ON THE GROUND ROAD ONLY!
  // ("منع ظهور أيقونات إصلاح السيارة أو الكوينز في السماء تماماً أثناء الطيران. ميزات التقاط الكوينز وإصلاح السيارة تظهر فقط على الطريق الأرضي وعند عودة السيارة إلى الأرض")
  const pickupHitRadius = car.chassisWidth * 0.55;
  for (let i = state.pickups.length - 1; i >= 0; i--) {
    const item = state.pickups[i];

    if (item.x < state.x - 520 || item.collected) {
      state.pickups.splice(i, 1);
      continue;
    }

    // Pickups can ONLY be collected when the vehicle is on the ground road (flightPhase === 'none')!
    if (state.flightPhase !== 'none') {
      continue;
    }

    const dx = item.x - state.x;
    const dy = item.y - state.y;
    const distSq = dx * dx + dy * dy;
    const threshold = pickupHitRadius + item.radius;

    if (distSq <= threshold * threshold) {
      item.collected = true;
      if (item.type === 'coin') {
        state.sessionCoins += item.value;
        state.floatingTexts.push({
          id: state.nextEntityId++,
          x: item.x,
          y: item.y - 16,
          text: `+${item.value}`,
          color: '#FBBF24',
          alpha: 1,
          vy: -38,
        });
        onCoinPickup();
      } else if (item.type === 'fuel') {
        state.fuel = state.maxFuel;
        state.nitro = Math.min(100, state.nitro + 45);
        state.floatingTexts.push({
          id: state.nextEntityId++,
          x: item.x,
          y: item.y - 20,
          text: 'وقود كامل! +FUEL',
          color: '#22C55E',
          alpha: 1,
          vy: -42,
        });
        onFuelPickup();
      } else if (item.type === 'repair') {
        repairVehicleCompletely(state);
        if (onRepairPickup) {
          onRepairPickup();
        } else {
          onFuelPickup();
        }
      }
      state.pickups.splice(i, 1);
    }
  }

  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.alpha -= 1.15 * dt;
    if (ft.alpha <= 0) {
      state.floatingTexts.splice(i, 1);
    }
  }

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.isSmoke) {
      // Rising engine smoke expands and floats upward
      p.vy -= 16 * dt;
      p.size += 11 * dt;
    } else if (p.isSpark) {
      p.vy += 240 * dt;
      const gy = getTerrainHeight(p.x, map);
      if (p.y >= gy - 2) {
        p.y = gy - 2;
        p.vy = -Math.abs(p.vy) * 0.45;
      }
    }
    p.alpha -= p.decay * dt;
    if (p.alpha <= 0) {
      state.particles.splice(i, 1);
    }
  }

  // PROGRESSIVE ROOF ROLLOVER IMPACT:
  // Inflicts progressive roof/window/door damage and bounces the car upright if health > 0,
  // so smoke & explosion ONLY happen when structural health reaches 0%!
  const normAngle = Math.atan2(Math.sin(state.angle), Math.cos(state.angle));
  if (Math.abs(normAngle) > 2.38 && onGround) {
    if (state.upsideDownTimer === 0) {
      applyStructuralImpactDamage(18, 'roof');
      if (onHeavyImpact) {
        onHeavyImpact(1.1);
      }
    }
    state.upsideDownTimer += dt;
    if (state.health <= 0) {
      triggerVehicleExplosion(
        state,
        'تدمرت سلامة الهيكل بالكامل (0% Health) بعد انقلاب وحوادث عنيفة وانفجر المحرك!',
        onExplosion
      );
      return { gameOverReason: null };
    } else if (state.upsideDownTimer > 0.52) {
      // Recover/kick upright if health > 0 so car continues with shattered glass & broken parts!
      state.upsideDownTimer = 0;
      state.vy = -155;
      state.y -= 14;
      state.angle = terrainAngle;
      state.angVel = 0;
    }
  } else {
    state.upsideDownTimer = 0;
  }

  if (state.fuel <= 0 && Math.abs(state.vx) < 8) {
    return { gameOverReason: 'نفد الوقود بالكامل!' };
  }

  return { gameOverReason: null };
}

export function renderGameCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: PhysicsState,
  car: CarConfig,
  map: MapConfig,
  quality: GraphicsQuality,
  controls: { gas: boolean; brake: boolean; boost: boolean },
  isMenuPreview: boolean,
  _cameraShakeEnabled: boolean = false,
  cinematicCamera?: {
    zoom: number;
    focusWorldX: number;
    focusWorldY: number;
    screenAnchorX?: number;
    screenAnchorY?: number;
    suppressFlightLetterbox?: boolean;
  }
): void {
  ctx.save();
  // Explicit per-frame screen clear for zero-lag 60 FPS Canvas Rendering Optimization
  ctx.clearRect(0, 0, width, height);

  // Comprehensive Vector Anti-Aliasing & Smooth Edge Rendering (Hardware-Accelerated)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const timeSec = performance.now() * 0.001;
  if (isMenuPreview) {
    persistentWeatherClockSec =
      (persistentWeatherClockSec + 1 / 60) % WEATHER_CYCLE_DURATION;
    state.weatherCycleSec = persistentWeatherClockSec;
    const menuWeather = getWeatherPhaseInfo(state.weatherCycleSec);
    state.cloudDarkness = menuWeather.cloudDarkness;
    state.rainIntensity = menuWeather.rainIntensity;
    state.nightFactor = menuWeather.nightFactor;
    state.headlightsOn = menuWeather.headlightsOn;
    state.weatherLabel = menuWeather.label;
  }
  const nightAmt = Math.max(0, Math.min(1, state.nightFactor || 0));

  // 100% Steady Camera: Lock ground camera Y to smooth terrain elevation so suspension/rock bounces NEVER jitter the scene!
  ensureEnvironmentAssetsReady();
  const refTerrainY = getTerrainHeight(state.x, map);
  const steadyGroundCarY = refTerrainY - (car.wheelRadius + 21);
  const airborneLift = Math.max(0, steadyGroundCarY - state.y);
  const rawSkyBlend =
    state.flightPhase !== 'none'
      ? 1
      : Math.min(1, Math.max(0, (airborneLift - 28) / 120));
  const highSkyBlend = rawSkyBlend * rawSkyBlend * (3 - 2 * rawSkyBlend);
  const stabilizedFocusY =
    steadyGroundCarY * (1 - highSkyBlend) + state.y * highSkyBlend;

  const highSkyHeightPx = Math.max(0, refTerrainY - state.y - 35);
  const flightCamOffset =
    !isMenuPreview && state.flightPhase !== 'none'
      ? Math.min(1, highSkyHeightPx / 380) * (height * 0.16)
      : 0;

  const camZoom = cinematicCamera ? Math.max(0.5, cinematicCamera.zoom) : 1.0;
  const anchorX = cinematicCamera?.screenAnchorX ?? width * 0.44;
  const anchorY = cinematicCamera?.screenAnchorY ?? height * 0.56;
  const camX = cinematicCamera
    ? cinematicCamera.focusWorldX - anchorX / camZoom
    : isMenuPreview
    ? state.x - width * 0.48
    : state.x - width * 0.28;
  const camY = cinematicCamera
    ? cinematicCamera.focusWorldY - anchorY / camZoom
    : isMenuPreview
    ? steadyGroundCarY - height * 0.56
    : stabilizedFocusY - height * 0.58 + flightCamOffset;
  const visibleWorldW = width / camZoom;
  const visibleWorldH = height / camZoom;

  // =========================================================================
  // 1. SMOOTH SEAMLESS BACKGROUND LAYER (Sub-pixel Jitter Removal + PLAYING Only)
  // =========================================================================
  const playerDistance = Math.max(0, (state.x - 140) / 25);
  const isPlayingGameplay = !isMenuPreview && !cinematicCamera;
  drawBackground(
    ctx,
    width,
    height,
    state.weatherCycleSec,
    nightAmt,
    state.cloudDarkness,
    state.lightningFlash,
    timeSec,
    playerDistance,
    isPlayingGameplay,
    state.vx
  );

  // Translate into World Coordinates (supports smooth In-Engine Cinematic Camera Zoom & Focus!)
  if (cinematicCamera && Math.abs(camZoom - 1) > 0.001) {
    ctx.translate(anchorX, anchorY);
    ctx.scale(camZoom, camZoom);
    ctx.translate(-cinematicCamera.focusWorldX, -cinematicCamera.focusWorldY);
  } else {
    ctx.translate(-camX, -camY);
  }

  const stepX = quality === 'Low' ? 20 : quality === 'Medium' ? 12 : 8;
  const startWorldX = Math.floor((camX - 100) / stepX) * stepX;
  const endWorldX = camX + visibleWorldW + 140;

  // Zero-Allocation 60 FPS Optimization: Reuse module-level arrays instead of allocating new arrays every frame!
  reusableVisibleObstacles.length = 0;
  for (let i = 0; i < state.obstacles.length; i++) {
    const o = state.obstacles[i];
    if (
      o.x + o.width * 0.5 + 140 >= startWorldX &&
      o.x - o.width * 0.5 - 140 <= endWorldX
    ) {
      reusableVisibleObstacles.push(o);
    }
  }
  const visibleObstacles = reusableVisibleObstacles;

  let sampleCount = 0;
  for (let wx = startWorldX; wx <= endWorldX; wx += stepX) {
    let onBridge = false;
    for (let i = 0; i < visibleObstacles.length; i++) {
      const o = visibleObstacles[i];
      if (
        o.type === 'suspension_bridge' &&
        wx > o.x - o.width * 0.5 + 14 &&
        wx < o.x + o.width * 0.5 - 14
      ) {
        onBridge = true;
        break;
      }
    }
    if (sampleCount < reusableRoadSamples.length) {
      const slot = reusableRoadSamples[sampleCount];
      slot.wx = wx;
      slot.gy = getEarthContourHeight(wx, map, visibleObstacles);
      slot.onBridge = onBridge;
    } else {
      reusableRoadSamples.push({
        wx,
        gy: getEarthContourHeight(wx, map, visibleObstacles),
        onBridge,
      });
    }
    sampleCount++;
  }
  reusableRoadSamples.length = sampleCount;
  const roadSamples = reusableRoadSamples;

  // 3B. Forked Lightning Bolt & Atmospheric Lightning Veil in the Sky during Midnight Thunderstorms
  if (state.lightningFlash > 0.04 && state.lightningBolt.length > 0) {
    ctx.save();
    const flashAlpha = Math.min(1, state.lightningFlash * 1.35);
    const boltCenterX = state.lightningBolt[0].x1;
    const boltTopY = state.lightningBolt[0].y1;

    // 1) Radiant Atmospheric Sky Veil around the Lightning Bolt
    const veilGrad = ctx.createRadialGradient(
      boltCenterX,
      boltTopY + 90,
      12,
      boltCenterX,
      boltTopY + 120,
      360
    );
    veilGrad.addColorStop(0, `rgba(224, 242, 254, ${0.58 * flashAlpha})`);
    veilGrad.addColorStop(0.45, `rgba(56, 189, 248, ${0.28 * flashAlpha})`);
    veilGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = veilGrad;
    ctx.beginPath();
    ctx.arc(boltCenterX, boltTopY + 120, 360, 0, Math.PI * 2);
    ctx.fill();

    // 2) Outer Electric Cyan-Violet Plasma Glow
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = Math.min(0.9, flashAlpha * 0.85);
    ctx.strokeStyle = '#38BDF8';
    for (const seg of state.lightningBolt) {
      ctx.lineWidth = seg.width * 3.2;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }

    // 3) Bright White-Cyan Core Forked Lightning Bolt
    ctx.globalAlpha = Math.min(1, flashAlpha * 1.15);
    ctx.strokeStyle = '#FFFFFF';
    for (const seg of state.lightningBolt) {
      ctx.lineWidth = seg.width;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3C. BLOOMING & FOLIAGE BACKGROUND & MIDGROUND TREES (100% Opaque Jacaranda Purple, Lush Green, Sakura White & Autumn Orange Trees)
  //     - Uniform Gentle Weather & Wind System:
  //       * Consistent light/gentle wind force and subtle tree movement across all time phases (Evening, Night, and Midnight)
  //       * Clean, smooth leaf cluster graphics with zero dark/black V-shaped angular lines!
  {
    const litTrees = getLitTreeAssets(state.weatherCycleSec);
    const rainAmt = Math.max(0, Math.min(0.32, state.rainIntensity || 0));
    // Uniform gentle wind force locked to a consistent light level across Evening, Night, and Midnight!
    const stormPower = 0;
    const windSpeed = 1.45;
    const windAmp = 0.85;
    const windGust = 0.82 + 0.18 * Math.sin(timeSec * 0.75);
    const stormWindLean = -0.012;

    ctx.save();
    ctx.globalAlpha = 1.0;

    // Tier A: Distant Hilltop / Background Scenery Trees (Root-Anchored Organic Wind Bending + Swaying Foliage Clusters)
    const bgTreeSpacing = 340;
    const firstBgTreeX =
      Math.floor((startWorldX - 300) / bgTreeSpacing) * bgTreeSpacing;
    let lastBgTreeX = -999999;
    for (let tx = firstBgTreeX; tx <= endWorldX + 300; tx += bgTreeSpacing) {
      const idx = Math.abs(Math.round(tx / bgTreeSpacing));
      const jitterX = Math.sin(idx * 4.17) * 42;
      const rawTreeX = tx + jitterX;
      const treeWorldX = resolveTreeWorldX(rawTreeX, visibleObstacles);
      if (!Number.isFinite(treeWorldX)) continue;
      if (Math.abs(treeWorldX - lastBgTreeX) < 65) continue;
      lastBgTreeX = treeWorldX;

      const treeVariety = idx % 4;
      const spriteList =
        treeVariety === 0
          ? litTrees.jacarandaSprites
          : treeVariety === 1
          ? litTrees.greenSprites
          : treeVariety === 2
          ? litTrees.sakuraSprites
          : litTrees.orangeSprites;
      const sprite = spriteList[idx % spriteList.length];

      const rawGroundY = getEarthContourHeight(treeWorldX, map, visibleObstacles);
      const terrainGroundY = getTerrainHeight(treeWorldX, map);
      const groundY = Math.min(terrainGroundY + 45, rawGroundY);
      if (!Number.isFinite(groundY)) continue;
      const scale = 0.68 + (idx % 3) * 0.06;
      const drawW = sprite.width * scale;
      const drawH = sprite.height * scale;

      const treePhase = timeSec * (windSpeed * 0.88) + idx * 1.93;
      const leafTurb =
        Math.sin(treePhase * 2.35 + idx) * (0.26 + rainAmt * 0.48);
      const rawSway = (Math.sin(treePhase) + leafTurb) * windAmp * windGust;
      const shearX = stormWindLean * 0.78 + rawSway * 0.021;

      ctx.save();
      ctx.translate(treeWorldX, groundY + 14);
      ctx.transform(1, 0, shearX, 1, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(sprite, -drawW * 0.5, -drawH, drawW, drawH);

      // Delicate, natural small rustling leaves on outer foliage (Zero black lines, zero large circular clusters!)
      const leafColor1 =
        treeVariety === 0
          ? litTrees.jacPetal1
          : treeVariety === 1
          ? litTrees.greenLeaf1
          : treeVariety === 2
          ? litTrees.sakPetal1
          : litTrees.orangeLeaf1;
      const leafColor2 =
        treeVariety === 0
          ? litTrees.jacPetal2
          : treeVariety === 1
          ? litTrees.greenLeaf2
          : treeVariety === 2
          ? litTrees.sakPetal2
          : litTrees.orangeLeaf2;

      for (let lf = 0; lf < 6; lf++) {
        const lAngle = -Math.PI * 0.9 + (lf / 5) * Math.PI * 0.8;
        const lPhase = timeSec * (windSpeed * 2.2) + idx * 2.3 + lf * 1.5;
        const lx =
          Math.cos(lAngle) * (drawW * 0.34) +
          Math.sin(lPhase) * (1.8 + rainAmt * 4.5) * scale;
        const ly =
          -drawH * 0.62 +
          Math.sin(lAngle) * (drawH * 0.19) +
          Math.cos(lPhase * 1.3) * (1.2 + rainAmt * 3.0) * scale;
        ctx.fillStyle = lf % 2 === 0 ? leafColor1 : leafColor2;
        ctx.beginPath();
        ctx.ellipse(
          lx,
          ly,
          3.8 * scale,
          2.1 * scale,
          lAngle + Math.sin(lPhase) * 0.35,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();

      // Random Rain Splash Particles Distributed Naturally Across Background Tree Leaf Foliage
      if (state.rainIntensity > 0.05) {
        const bgCrownOffsetX = -drawH * 0.62 * shearX;
        const bgRainAlpha = Math.min(0.88, 0.35 + state.rainIntensity * 0.48);
        ctx.save();
        ctx.strokeStyle = `rgba(224, 242, 254, ${bgRainAlpha})`;
        ctx.fillStyle = `rgba(186, 230, 253, ${bgRainAlpha})`;
        ctx.lineWidth = 1.1;
        const bgSplashCount = quality === 'Low' ? 4 : 7;
        ctx.beginPath();
        for (let bs = 0; bs < bgSplashCount; bs++) {
          const bSeed = idx * 23.1 + bs * 8.7;
          const sPhase = (timeSec * (5.4 + (bs % 3) * 1.2) + bSeed) % 1;
          const rDist = Math.sqrt(((bs * 37 + idx * 13) % 19) / 19);
          const rAng = bSeed * 2.39996;
          const sx =
            treeWorldX +
            bgCrownOffsetX +
            Math.cos(rAng) * rDist * (drawW * 0.36);
          const sy =
            groundY -
            drawH * 0.62 +
            Math.sin(rAng) * rDist * (drawH * 0.22);
          if (sPhase < 0.6) {
            const sp = sPhase / 0.6;
            const spread = 1.6 + sp * 4.2;
            const lift = (1 - sp) * 4.2;
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - spread, sy - lift);
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + spread, sy - lift);
          }
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // Tier B: Midground / Roadside Hill Slope Trees + Dynamic Wind-Animated Branches, Rustling Leaf Clusters & Falling Leaves
    const midTreeSpacing = 225;
    const firstMidTreeX =
      Math.floor((startWorldX - 280) / midTreeSpacing) * midTreeSpacing;
    let lastMidTreeX = -999999;
    for (let tx = firstMidTreeX; tx <= endWorldX + 280; tx += midTreeSpacing) {
      const idx = Math.abs(Math.round(tx / midTreeSpacing));
      const jitterX = Math.cos(idx * 3.13) * 32;
      const rawTreeX = tx + 95 + jitterX;
      const treeWorldX = resolveTreeWorldX(rawTreeX, visibleObstacles);
      if (!Number.isFinite(treeWorldX)) continue;
      if (Math.abs(treeWorldX - lastMidTreeX) < 58) continue;
      lastMidTreeX = treeWorldX;

      // Seamlessly blend Purple Jacaranda, Lush Emerald Green, White Sakura, and Warm Autumn Orange trees
      const treeVariety = (idx + 1) % 4;
      const spriteList =
        treeVariety === 0
          ? litTrees.jacarandaSprites
          : treeVariety === 1
          ? litTrees.greenSprites
          : treeVariety === 2
          ? litTrees.sakuraSprites
          : litTrees.orangeSprites;
      const sprite = spriteList[idx % spriteList.length];

      const rawGroundY = getEarthContourHeight(treeWorldX, map, visibleObstacles);
      const terrainGroundY = getTerrainHeight(treeWorldX, map);
      const groundY = Math.min(terrainGroundY + 45, rawGroundY);
      if (!Number.isFinite(groundY)) continue;
      const scale = 0.88 + (idx % 3) * 0.08;
      const drawW = sprite.width * scale;
      const drawH = sprite.height * scale;

      // Synchronized organic wind oscillation + progressive storm turbulence (gentle in Sunset -> medium in Night -> violent in Midnight!)
      const treePhase = timeSec * windSpeed + idx * 2.41;
      const highFreqFlutter =
        Math.sin(treePhase * (2.4 + stormPower * 1.8) + idx * 1.3) *
        (0.22 + rainAmt * 0.42 + stormPower * 0.65);
      const rawSway =
        (Math.sin(treePhase) + highFreqFlutter) * windAmp * windGust;
      const canopyShearX = stormWindLean + rawSway * 0.028;
      const crownSwayOffsetX = -drawH * 0.65 * canopyShearX;

      const leafColor1 =
        treeVariety === 0
          ? litTrees.jacPetal1
          : treeVariety === 1
          ? litTrees.greenLeaf1
          : treeVariety === 2
          ? litTrees.sakPetal1
          : litTrees.orangeLeaf1;
      const leafColor2 =
        treeVariety === 0
          ? litTrees.jacPetal2
          : treeVariety === 1
          ? litTrees.greenLeaf2
          : treeVariety === 2
          ? litTrees.sakPetal2
          : litTrees.orangeLeaf2;

      // 1) Root-anchored wind-sheared tree trunk & completely smooth natural leaf canopy (Zero black/dark V-shaped lines across leaf clusters!)
      ctx.save();
      ctx.translate(treeWorldX, groundY + 14);
      ctx.transform(1, 0, canopyShearX, 1, 0, 0);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(sprite, -drawW * 0.5, -drawH, drawW, drawH);

      // 2) Delicate Individual Rustling Outer Leaves around the Canopy Crown (Gentle subtle wind movement!)
      const rustleLeafCount = quality === 'Low' ? 6 : 14;
      for (let fl = 0; fl < rustleLeafCount; fl++) {
        const flAng =
          -Math.PI * 0.92 + (fl / (rustleLeafCount - 1)) * Math.PI * 0.84;
        const lPhase =
          timeSec * (windSpeed * 1.9) +
          idx * 2.7 +
          fl * 1.37;
        const radScale = 0.76 + (fl % 3) * 0.11;
        const lx =
          Math.cos(flAng) * (drawW * 0.36 * radScale) +
          Math.sin(lPhase) * 2.2 * scale;
        const ly =
          -drawH * 0.64 +
          Math.sin(flAng) * (drawH * 0.22 * radScale) +
          Math.cos(lPhase * 1.5) * 1.5 * scale;
        const leafRot =
          flAng +
          canopyShearX * 1.5 +
          Math.sin(lPhase * 1.9) * 0.22;
        ctx.fillStyle = fl % 2 === 0 ? leafColor1 : leafColor2;
        ctx.beginPath();
        ctx.ellipse(
          lx,
          ly,
          4.4 * scale,
          2.3 * scale,
          leafRot,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();

      // Dynamic Midnight Lightning Illumination on Tree Canopy
      if (state.lightningFlash > 0.05) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.65, state.lightningFlash * 0.58);
        const treeFlashGrad = ctx.createRadialGradient(
          treeWorldX + crownSwayOffsetX,
          groundY - drawH * 0.72,
          6,
          treeWorldX + crownSwayOffsetX,
          groundY - drawH * 0.55,
          drawW * 0.52
        );
        treeFlashGrad.addColorStop(0, 'rgba(224, 242, 254, 0.85)');
        treeFlashGrad.addColorStop(0.55, 'rgba(125, 211, 252, 0.38)');
        treeFlashGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = treeFlashGrad;
        ctx.beginPath();
        ctx.ellipse(
          treeWorldX + crownSwayOffsetX,
          groundY - drawH * 0.62,
          drawW * 0.46,
          drawH * 0.34,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      }

      // Random Rain Splash Particles, Bouncing Micro-Droplets & Water Drips Distributed Naturally Across Tree Leaf Foliage
      if (state.rainIntensity > 0.05) {
        ctx.save();
        const rainAlpha = Math.min(0.95, 0.42 + state.rainIntensity * 0.52);
        ctx.strokeStyle = `rgba(224, 242, 254, ${rainAlpha})`;
        ctx.fillStyle = `rgba(186, 230, 253, ${rainAlpha})`;
        ctx.lineWidth = 1.3;
        const foliageSplashCount = quality === 'Low' ? 8 : 14;
        ctx.beginPath();
        for (let fs = 0; fs < foliageSplashCount; fs++) {
          const fSeed = idx * 29.3 + fs * 11.7;
          const splashPhase = (timeSec * (5.6 + (fs % 4) * 1.15) + fSeed) % 1;
          // Pseudo-random natural 2D distribution across the entire leaf foliage volume
          const uHash = Math.abs(Math.sin(fSeed * 12.9898 + 1.7));
          const vHash = Math.abs(Math.cos(fSeed * 78.233 + 3.1));
          const rNorm = Math.sqrt(uHash) * 0.92;
          const theta = vHash * Math.PI * 2;
          const sx =
            treeWorldX +
            crownSwayOffsetX +
            Math.cos(theta) * rNorm * (drawW * 0.38);
          const sy =
            groundY -
            drawH * 0.64 +
            Math.sin(theta) * rNorm * (drawH * 0.23);

          if (splashPhase < 0.62) {
            const sp = splashPhase / 0.62;
            const spread = 2.0 + sp * 5.8;
            const lift = (1 - sp) * 5.4;
            // Upward V-splash burst on random leaf cluster
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - spread, sy - lift);
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + spread, sy - lift);
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + (uHash - 0.5) * 3.5, sy - lift * 1.25);
          } else {
            // Water droplet dripping off lower tree foliage leaves
            const dp = (splashPhase - 0.62) / 0.38;
            const dripY = sy + dp * 19;
            ctx.moveTo(sx, dripY);
            ctx.lineTo(sx - 0.8, dripY + 4.5);
          }
        }
        ctx.stroke();

        // Bouncing round water micro-droplet beads scattering across the tree foliage
        ctx.beginPath();
        for (let fs = 0; fs < foliageSplashCount; fs += 2) {
          const fSeed = idx * 29.3 + fs * 11.7;
          const splashPhase = (timeSec * (5.6 + (fs % 4) * 1.15) + fSeed) % 1;
          if (splashPhase < 0.58) {
            const sp = splashPhase / 0.58;
            const uHash = Math.abs(Math.sin(fSeed * 12.9898 + 1.7));
            const vHash = Math.abs(Math.cos(fSeed * 78.233 + 3.1));
            const rNorm = Math.sqrt(uHash) * 0.9;
            const theta = vHash * Math.PI * 2;
            const sx =
              treeWorldX +
              crownSwayOffsetX +
              Math.cos(theta) * rNorm * (drawW * 0.38);
            const sy =
              groundY -
              drawH * 0.64 +
              Math.sin(theta) * rNorm * (drawH * 0.23);
            const arcY = sy - Math.sin(sp * Math.PI) * 6.5;
            ctx.moveTo(sx - sp * 4.2 + 1.2, arcY);
            ctx.arc(sx - sp * 4.2, arcY, 1.2, 0, Math.PI * 2);
            ctx.moveTo(sx + sp * 4.2 + 1.2, arcY - 1.0);
            ctx.arc(sx + sp * 4.2, arcY - 1.0, 1.2, 0, Math.PI * 2);
          }
        }
        ctx.fill();
        ctx.restore();
      }

      // Solid Wind-Blown Falling Petals & Leaves (Speed, turbulence & horizontal drift scale up proportionally with rainIntensity!)
      const basePetalCount = quality === 'Low' ? 4 : 7;
      const rainBonusPetals =
        quality === 'Low' ? Math.round(rainAmt * 2) : Math.round(rainAmt * 5);
      const petalCount = basePetalCount + rainBonusPetals;
      const fallSpeedMult = 1.0 + rainAmt * 1.85;
      const windDriftDist = 38 + rainAmt * 95;
      const swirlTurbulence = 9 + rainAmt * 22;

      for (let p = 0; p < petalCount; p++) {
        const pSeed = idx * 17.3 + p * 6.1;
        const fallProgress =
          (timeSec * (0.28 + (p % 3) * 0.07) * fallSpeedMult + pSeed) % 1;
        const startPX =
          treeWorldX +
          crownSwayOffsetX +
          Math.sin(pSeed * 2.7) * (drawW * 0.34);
        const startPY =
          groundY - drawH * 0.68 + Math.cos(pSeed * 1.9) * (drawH * 0.16);
        const petalX =
          startPX -
          fallProgress * windDriftDist +
          Math.sin(timeSec * (2.6 + rainAmt * 4.8) + pSeed) * swirlTurbulence;
        const petalY = startPY + fallProgress * (drawH * 0.62);

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = p % 2 === 0 ? leafColor1 : leafColor2;
        ctx.beginPath();
        ctx.ellipse(
          petalX,
          petalY,
          3.5,
          2.1,
          timeSec * (1.8 + rainAmt * 4.5) + pSeed,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 4. Render Continuous Rear Polished Metallic Highway Guardrail (حواجز الحماية المعدنية المصقولة)
  {
    ctx.save();
    const postSpacing = 68;
    const firstPostX = Math.floor(startWorldX / postSpacing) * postSpacing;

    // 1) Guardrail Vertical Support Posts, Bolts & Reflector Cat-Eyes
    for (let px = firstPostX; px <= endWorldX; px += postSpacing) {
      if (isNearBridgeFast(px, 12, visibleObstacles)) continue;

      const gy = getEarthContourHeight(px, map, visibleObstacles);
      // Galvanized steel support post with 3D metallic bevel (السياج الحديدي)
      ctx.fillStyle = map.isNeon ? '#1E1B4B' : '#475569';
      ctx.strokeStyle = map.isNeon ? '#00F0FF' : '#1E293B';
      ctx.lineWidth = 1.4;
      ctx.fillRect(px - 5, gy - 35, 10, 31);
      ctx.strokeRect(px - 5, gy - 35, 10, 31);

      // Specular vertical highlight strip on post
      ctx.fillStyle = map.isNeon ? 'rgba(0, 240, 255, 0.35)' : '#94A3B8';
      ctx.fillRect(px - 2.8, gy - 34, 2.8, 29);
    }

    // 2) Continuous Polished Corrugated W-Beam Metal Guardrail Ribbon along Road Edge (Uses precomputed roadSamples!)
    const drawGuardrailPass = (
      offsetY: number,
      strokeColor: string,
      lineW: number
    ) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineW;
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let railDown = false;
      for (let i = 0; i < roadSamples.length; i++) {
        const s = roadSamples[i];
        if (s.onBridge) {
          railDown = false;
          continue;
        }
        const gy = s.gy + offsetY;
        if (!railDown) {
          ctx.moveTo(s.wx, gy);
          railDown = true;
        } else {
          ctx.lineTo(s.wx, gy);
        }
      }
      ctx.stroke();
    };

    // Lower secondary iron bar + Outer dark steel border -> Polished silver W-beam body -> Top chrome highlight
    drawGuardrailPass(-13.5, map.isNeon ? '#0F172A' : '#334155', 5.2);
    drawGuardrailPass(-13.5, map.isNeon ? '#00F0FF' : '#94A3B8', 2.4);
    drawGuardrailPass(-23, map.isNeon ? '#0F172A' : '#1E293B', 16.0);
    drawGuardrailPass(-23, map.isNeon ? '#334155' : '#CBD5E1', 12.8);
    drawGuardrailPass(-25.5, map.isNeon ? '#00F0FF' : '#F8FAFC', 3.2);
    drawGuardrailPass(-23, map.isNeon ? '#1E1B4B' : '#475569', 3.4);
    drawGuardrailPass(-19.5, map.isNeon ? '#FF007F' : '#94A3B8', 2.2);

    // 3) Guardrail Mounting Bolts & Glowing Highway Reflector Cat-Eyes (عواكس ضوئية مصقولة)
    for (let px = firstPostX; px <= endWorldX; px += postSpacing) {
      if (isNearBridgeFast(px, 12, visibleObstacles)) continue;
      const gy = getEarthContourHeight(px, map, visibleObstacles) - 23;
      // Glowing amber/red highway reflector stud on guardrail post
      const isRedReflector = Math.floor(px / postSpacing) % 2 === 0;
      ctx.fillStyle = isRedReflector ? '#EF4444' : '#F59E0B';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px - 3, gy - 2.5, 6, 5, 1.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(px - 1.2, gy - 1.2, 2.4, 2.4);
    }

    // 4) Detailed Green Grass Patches & Scattered Vibrant Flowers (Purple, Pink, Yellow, White)
    //    Along the Outer Side of the Iron Road Fence, Seamlessly Blending with the Environment Terrain!
    {
      const isNightGrass = nightAmt > 0.45;
      const isSunsetGrass =
        !isNightGrass &&
        ((state.weatherCycleSec % WEATHER_CYCLE_DURATION) < 90 ||
          ((state.weatherCycleSec % WEATHER_CYCLE_DURATION) >= 350 &&
            (state.weatherCycleSec % WEATHER_CYCLE_DURATION) < 460));

      const turfDark = isNightGrass
        ? '#062C19'
        : isSunsetGrass
        ? '#14532D'
        : '#15803D';
      const turfMid = isNightGrass
        ? '#0B4627'
        : isSunsetGrass
        ? '#166534'
        : '#16A34A';
      const turfLight = isNightGrass
        ? '#156539'
        : isSunsetGrass
        ? '#22C55E'
        : '#4ADE80';

      // Seamless grassy turf cushion blending the iron fence base into the shoulder terrain
      drawGuardrailPass(-9.5, turfDark, 7.5);
      drawGuardrailPass(-8.0, turfMid, 5.2);

      const flowerPalette = isNightGrass
        ? [
            { petal: '#9333EA', light: '#C084FC', center: '#FDE047' }, // Vibrant Purple
            { petal: '#DB2777', light: '#F472B6', center: '#FEF08A' }, // Vibrant Pink
            { petal: '#EAB308', light: '#FEF08A', center: '#D97706' }, // Vibrant Yellow
            { petal: '#E2E8F0', light: '#FFFFFF', center: '#FACC15' }, // Crisp White
          ]
        : [
            { petal: '#A855F7', light: '#D8B4FE', center: '#FACC15' }, // Vibrant Purple
            { petal: '#EC4899', light: '#F9A8D4', center: '#FEF08A' }, // Vibrant Pink
            { petal: '#FACC15', light: '#FEF9C3', center: '#EA580C' }, // Vibrant Yellow
            { petal: '#F8FAFC', light: '#FFFFFF', center: '#F59E0B' }, // Crisp White
          ];

      const patchSpacing = 34;
      const firstPatchX = Math.floor(startWorldX / patchSpacing) * patchSpacing;
      for (let gx = firstPatchX; gx <= endWorldX; gx += patchSpacing) {
        if (isNearBridgeFast(gx, 16, visibleObstacles)) continue;

        const patchIdx = Math.abs(Math.round(gx / patchSpacing));
        const seed = Math.sin(patchIdx * 12.9898 + 4.1414);
        const gy = getEarthContourHeight(gx, map, visibleObstacles);
        const baseY = gy - 7.5;
        const grassRainAmt = Math.max(0, Math.min(1, state.rainIntensity || 0));
        const breeze =
          (Math.sin(timeSec * (2.2 + grassRainAmt * 4.2) + patchIdx * 0.85) *
            (2.2 + grassRainAmt * 4.5)) -
          grassRainAmt * 2.8;

        // A) Soft layered green grass mound blending seamlessly with the road shoulder
        ctx.fillStyle = turfDark;
        ctx.beginPath();
        ctx.ellipse(gx, baseY, 15 + (patchIdx % 3) * 3, 4.5, 0, Math.PI, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = turfMid;
        ctx.beginPath();
        ctx.ellipse(gx + 2, baseY - 1, 11 + (patchIdx % 2) * 3, 3.8, 0, Math.PI, Math.PI * 2);
        ctx.fill();

        // B) Detailed Individual Swaying Green Grass Blades rising along the outer iron fence
        const bladeCount = 6;
        for (let b = 0; b < bladeCount; b++) {
          const bNorm = (b / (bladeCount - 1)) * 2 - 1; // -1..1
          const bx = gx + bNorm * 12 + Math.sin(patchIdx * 3.1 + b) * 1.8;
          const bladeH =
            9 + ((patchIdx + b * 3) % 5) * 2.4 + (1 - Math.abs(bNorm) * 0.35) * 3.5;
          const tipX = bx + bNorm * 4.5 + breeze;
          const tipY = baseY - bladeH;

          ctx.strokeStyle = b % 2 === 0 ? turfLight : turfMid;
          ctx.lineWidth = 1.7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(bx, baseY);
          ctx.quadraticCurveTo(bx + bNorm * 2, baseY - bladeH * 0.55, tipX, tipY);
          ctx.stroke();
        }

        // C) Scattered Vibrant Wildflowers (Purple, Pink, Yellow, White) blooming in the grass patch
        const flowerCount = patchIdx % 3 === 0 ? 2 : 1;
        for (let f = 0; f < flowerCount; f++) {
          const fColor = flowerPalette[(patchIdx + f * 2) % flowerPalette.length];
          const fxOffset = f === 0 ? seed * 7 : -seed * 8 + 5;
          const fx = gx + fxOffset + breeze * 0.75;
          const stemH = 10.5 + ((patchIdx + f * 5) % 4) * 2.6;
          const fy = baseY - stemH;

          // Green flower stem
          ctx.strokeStyle = turfMid;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(gx + fxOffset * 0.6, baseY);
          ctx.quadraticCurveTo(fx - breeze * 0.3, baseY - stemH * 0.5, fx, fy);
          ctx.stroke();

          // Multi-petal colorful blossom head
          const petalR = 2.2 + ((patchIdx + f) % 2) * 0.45;
          ctx.fillStyle = fColor.petal;
          ctx.beginPath();
          for (let p = 0; p < 5; p++) {
            const ang = (p / 5) * Math.PI * 2 + patchIdx * 0.5;
            const px = fx + Math.cos(ang) * (petalR * 1.05);
            const py = fy + Math.sin(ang) * (petalR * 0.95);
            ctx.moveTo(px + petalR * 0.75, py);
            ctx.arc(px, py, petalR * 0.75, 0, Math.PI * 2);
          }
          ctx.fill();

          // Upper petal highlight & golden flower center
          ctx.fillStyle = fColor.light;
          ctx.beginPath();
          ctx.arc(fx - 0.5, fy - 0.6, petalR * 0.55, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = fColor.center;
          ctx.beginPath();
          ctx.arc(fx, fy, petalR * 0.48, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  // 5. Render Rich Shaded Terrain Polygon + Geological Underground Cross-Section Details!
  const terrainBottomY = camY + visibleWorldH + 360;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(startWorldX, terrainBottomY);
  for (let i = 0; i < roadSamples.length; i++) {
    ctx.lineTo(roadSamples[i].wx, roadSamples[i].gy);
  }
  ctx.lineTo(endWorldX, terrainBottomY);
  ctx.closePath();

  const groundGrad = ctx.createLinearGradient(0, 260, 0, 720);
  groundGrad.addColorStop(0, map.groundFill);
  groundGrad.addColorStop(0.5, map.isNeon ? '#2A0818' : '#1C1917');
  groundGrad.addColorStop(1, '#090D16');
  ctx.fillStyle = groundGrad;
  ctx.fill();

  // Clip inside the underground terrain polygon to draw realistic Geological Strata & Embedded Boulders!
  ctx.clip();
  drawUndergroundCrossSection(
    ctx,
    roadSamples,
    startWorldX,
    endWorldX,
    terrainBottomY,
    map,
    visibleObstacles,
    quality
  );

  // Natural Earth/Rock Night & Sunset Shading on Terrain (Zero blue/water tint!)
  const terrainNightShade = Math.min(
    0.64,
    nightAmt * 0.56 + state.cloudDarkness * 0.14
  );
  if (terrainNightShade > 0.02) {
    ctx.save();
    ctx.fillStyle = `rgba(6, 12, 24, ${terrainNightShade})`;
    ctx.fillRect(
      startWorldX,
      refTerrainY - 120,
      endWorldX - startWorldX,
      terrainBottomY - (refTerrainY - 120)
    );
    ctx.restore();
  }
  ctx.restore();

  // 6. 2K/HD Smooth Continuous Asphalt Track Surface, Natural Cracks & Dynamic Surface Shader
  //    ("إصلاح اتصال وانسيابية الطريق: جعل المسار متصلاً وسلساً بأسلوب الانحدارات والارتفاعات التدريجية الطبيعية")
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Build 100% smooth C1/C2 continuous spline road path across all hills and smooth dips (only interrupted on wooden Suspension Bridges)
  const traceRoadPath = (yOffset: number = 0) => {
    ctx.beginPath();
    let segStart = -1;
    const flushSplineSegment = (startIdx: number, endIdx: number) => {
      if (endIdx < startIdx) return;
      const first = roadSamples[startIdx];
      ctx.moveTo(first.wx, first.gy + yOffset);
      if (endIdx === startIdx) return;
      if (endIdx === startIdx + 1) {
        const second = roadSamples[endIdx];
        ctx.lineTo(second.wx, second.gy + yOffset);
        return;
      }
      for (let j = startIdx + 1; j < endIdx; j++) {
        const curr = roadSamples[j];
        const next = roadSamples[j + 1];
        const midX = (curr.wx + next.wx) * 0.5;
        const midY = (curr.gy + next.gy) * 0.5 + yOffset;
        ctx.quadraticCurveTo(curr.wx, curr.gy + yOffset, midX, midY);
      }
      const last = roadSamples[endIdx];
      ctx.lineTo(last.wx, last.gy + yOffset);
    };

    for (let i = 0; i < roadSamples.length; i++) {
      const s = roadSamples[i];
      if (s.onBridge) {
        if (segStart !== -1) {
          flushSplineSegment(segStart, i - 1);
          segStart = -1;
        }
      } else if (segStart === -1) {
        segStart = i;
      }
    }
    if (segStart !== -1) {
      flushSplineSegment(segStart, roadSamples.length - 1);
    }
  };

  // A) Environment Shoulder Border right behind the Asphalt Curb
  traceRoadPath(-5.5);
  ctx.strokeStyle = map.isNeon
    ? '#F97316'
    : map.environmentType === 'snow'
    ? '#E2E8F0'
    : map.environmentType === 'desert'
    ? '#D97706'
    : '#16A34A';
  ctx.lineWidth = 8.5;
  ctx.stroke();

  // B) Sub-Asphalt Compacted Gravel / Basalt Foundation Base
  traceRoadPath(9.5);
  ctx.strokeStyle = map.isNeon ? '#450A0A' : '#090D16';
  ctx.lineWidth = 22;
  ctx.stroke();

  // C) Main 2K Smooth Dark-Grey Asphalt Road Deck (نسيج الأسفلت المصقول)
  traceRoadPath(4.5);
  ctx.strokeStyle = map.isNeon
    ? '#0F172A'
    : map.environmentType === 'desert'
    ? '#27272A'
    : '#1E293B';
  ctx.lineWidth = 26;
  ctx.stroke();

  // D) Deeper Charcoal Tire-Wear Lane Center Track
  traceRoadPath(6);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 16;
  ctx.stroke();

  // E) Dashed Highway Center Lane Markings (خطوط المسار الوسطية)
  ctx.save();
  ctx.setLineDash([26, 22]);
  traceRoadPath(5.2);
  ctx.strokeStyle = map.isNeon
    ? 'rgba(0, 240, 255, 0.55)'
    : 'rgba(251, 191, 36, 0.62)';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.restore();

  // F) Polished Metallic Curb & Specular Horizon Rim along the Asphalt Upper Edge
  traceRoadPath(-4.2);
  ctx.strokeStyle =
    state.lightningFlash > 0.2
      ? '#E0F2FE'
      : map.isNeon
      ? '#00F0FF'
      : map.environmentType === 'snow'
      ? '#F8FAFC'
      : '#CBD5E1';
  ctx.lineWidth = 2.8;
  ctx.stroke();

  // G) Dynamic Wet Track Gloss Reflection: Reflects Golden Sunlight by Day, Silvery Moonlight by Night & Environment Sheen!
  //    ("جعل الطريق مبللاً بالماء بلمعة وانعكاسات مائية خفيفة Wet Track Gloss Reflection تعكس ضوء السيارة والبيئة والشمس والقمر")
  const wetSheenStrength = Math.max(0.58, state.rainIntensity);
  const isNightSheen = nightAmt > 0.38;
  traceRoadPath(1.6);
  ctx.strokeStyle = map.isNeon
    ? `rgba(249, 115, 22, ${0.34 + wetSheenStrength * 0.34})`
    : isNightSheen
    ? `rgba(224, 242, 254, ${0.34 + wetSheenStrength * 0.32})` // Silvery Moonlight Sheen on wet asphalt
    : `rgba(254, 240, 138, ${0.32 + wetSheenStrength * 0.28})`; // Warm Golden Sunlight Sheen on wet asphalt
  ctx.lineWidth = 4.8;
  ctx.stroke();

  // Environmental Forest/Sky Wet Mirror Ribbon along the Lower Track Lane
  traceRoadPath(8.2);
  ctx.strokeStyle = map.isNeon
    ? `rgba(0, 240, 255, ${0.22 + wetSheenStrength * 0.28})`
    : isNightSheen
    ? `rgba(186, 230, 253, ${0.28 + wetSheenStrength * 0.26})`
    : map.environmentType === 'forest'
    ? `rgba(134, 239, 172, ${0.22 + wetSheenStrength * 0.24})`
    : `rgba(186, 230, 253, ${0.24 + wetSheenStrength * 0.26})`;
  ctx.lineWidth = 3.6;
  ctx.stroke();

  // H) Scattered Wet Mirror Surface Puddles on the Road (Optimized spacing for zero-lag 60 FPS)
  const puddleSpacing = 185;
  const firstPuddleX = Math.floor(startWorldX / puddleSpacing) * puddleSpacing;
  for (let px = firstPuddleX; px <= endWorldX; px += puddleSpacing) {
    const pSeed = Math.sin(px * 0.018 + 0.7);
    if (pSeed <= -0.12) continue;
    if (isNearBridgeOrDipFast(px, 35, visibleObstacles)) continue;

    const puddleW = 52 + (pSeed + 0.15) * 58;
    const gy = getEarthContourHeight(px, map, visibleObstacles) + 5.2;
    const slope = getTerrainSlope(px, map);

    ctx.save();
    ctx.translate(px, gy);
    ctx.rotate(slope);

    // 1. Mirror Puddle Base (Reflects Sky Gradient & Sun/Moon Tint)
    ctx.fillStyle = isNightSheen
      ? 'rgba(56, 189, 248, 0.34)'
      : 'rgba(125, 211, 252, 0.42)';
    ctx.strokeStyle = isNightSheen
      ? 'rgba(224, 242, 254, 0.55)'
      : 'rgba(255, 255, 255, 0.62)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, puddleW * 0.5, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 2. Specular Sun / Moon Mirror Streak across Puddle
    ctx.strokeStyle = isNightSheen
      ? 'rgba(224, 242, 254, 0.78)'
      : 'rgba(254, 249, 195, 0.82)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-puddleW * 0.32, -0.6);
    ctx.lineTo(puddleW * 0.32, -0.6);
    ctx.stroke();

    ctx.restore();
  }

  // H1B) Automated Modern Street Light Poles Along the Complete Road Length (Start to End):
  //      - Noticeably taller height (196px shaft + 16px arched cantilever arm = 212px total height)
  //        properly proportioned relative to the player's car and blooming trees
  //      - Spans the entire road from the very start (including behind x=0) to the end of the track
  //      - AUTOMATIC ON during Night, Sunset, Evening, and Dawn/Fajr
  //      - AUTOMATIC OFF during Morning, Noon, and Afternoon
  //      - Casts a dynamic downward light cone/glow onto the road surface when active
  {
    const streetLightState = getStreetLightState(state.weatherCycleSec);
    const firstPoleIdx = Math.floor(
      (startWorldX - STREET_LIGHT_START_X - 140) / STREET_LIGHT_INTERVAL
    );
    const lastPoleIdx = Math.ceil(
      (endWorldX - STREET_LIGHT_START_X + 140) / STREET_LIGHT_INTERVAL
    );

    let lastDrawnPoleX = -999999;
    for (let pIdx = firstPoleIdx; pIdx <= lastPoleIdx; pIdx++) {
      const rawPoleX = STREET_LIGHT_START_X + pIdx * STREET_LIGHT_INTERVAL;
      const poleX = resolveStreetLightPoleX(rawPoleX, state.obstacles);
      if (!Number.isFinite(poleX)) continue;
      if (Math.abs(poleX - lastDrawnPoleX) < 42) continue;
      lastDrawnPoleX = poleX;

      const roadY = getEarthContourHeight(poleX, map, visibleObstacles);
      const roadSlope = getTerrainSlope(poleX, map);
      const baseY = roadY - 4;
      const poleHeight = STREET_LIGHT_POLE_HEIGHT; // 196px tall shaft — noticeably taller and properly proportioned relative to car & trees
      const topY = baseY - poleHeight;
      const armReachX = STREET_LIGHT_ARM_REACH_X;
      const lampX = poleX + armReachX;
      const lampY = topY - 16;

      ctx.save();

      // 1. Heavy Metallic Pedestal Base anchored on the back road shoulder
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(poleX - 7.5, baseY - 16, 15, 18, 2.5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(poleX - 10, baseY - 4, 20, 5.5, 2);
      ctx.fill();

      // 2. Tall Tapered Modern Steel Pole Shaft
      const poleGrad = ctx.createLinearGradient(poleX - 5, topY, poleX + 5, topY);
      poleGrad.addColorStop(0, '#0F172A');
      poleGrad.addColorStop(0.45, '#64748B');
      poleGrad.addColorStop(1, '#1E293B');
      ctx.fillStyle = poleGrad;
      ctx.beginPath();
      ctx.moveTo(poleX - 4.6, baseY - 15);
      ctx.lineTo(poleX - 2.6, topY);
      ctx.lineTo(poleX + 2.6, topY);
      ctx.lineTo(poleX + 4.6, baseY - 15);
      ctx.closePath();
      ctx.fill();

      // Decorative mid-shaft structural collar ring
      ctx.fillStyle = '#475569';
      ctx.fillRect(poleX - 4.2, baseY - poleHeight * 0.45, 8.4, 3.5);

      // Subtle warm golden rim highlight along the inner pole edge when active
      if (streetLightState.isOn) {
        ctx.strokeStyle = `rgba(254, 240, 138, ${0.46 * streetLightState.intensity})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(poleX + 2.6, topY + 2);
        ctx.lineTo(poleX + 4.2, baseY - 16);
        ctx.stroke();
      }

      // 3. High Curved Cantilever Overhang Bracket Arm + Support Strut
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(poleX, topY + 2);
      ctx.quadraticCurveTo(poleX + 6, lampY, lampX - 8, lampY);
      ctx.stroke();

      // Diagonal under-brace support gusset on the cantilever arm
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(poleX + 1.5, topY + 18);
      ctx.lineTo(poleX + armReachX * 0.48, lampY + 3);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(poleX + 0.5, topY + 1);
      ctx.quadraticCurveTo(poleX + 6, lampY - 1.2, lampX - 8, lampY - 1.2);
      ctx.stroke();

      // 4. Modern Aerodynamic Cobra-Head LED Luminaire Housing
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(lampX - 13, lampY - 4.5, 28, 8, 4);
      ctx.fill();
      ctx.stroke();

      // 5. LED Lens & Dynamic Downward Light Cone + Road Surface Reflection (When AUTOMATIC ON)
      if (streetLightState.isOn && streetLightState.intensity > 0.01) {
        const inten = streetLightState.intensity;
        const coneSpread = 122;
        const coneBottomY = roadY + 6;

        if (quality === 'Ultra' || quality === 'High') {
          // 5A. Tall Volumetric Downward Light Cone onto the Road Surface
          const coneGrad = ctx.createLinearGradient(
            lampX,
            lampY + 3.5,
            lampX,
            coneBottomY
          );
          coneGrad.addColorStop(0, `rgba(255, 253, 230, ${(quality === 'Ultra' ? 0.74 : 0.62) * inten})`);
          coneGrad.addColorStop(0.35, `rgba(253, 224, 71, ${(quality === 'Ultra' ? 0.42 : 0.34) * inten})`);
          coneGrad.addColorStop(0.78, `rgba(251, 191, 36, ${0.18 * inten})`);
          coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(lampX - 10.5, lampY + 3.5);
          ctx.lineTo(lampX + 10.5, lampY + 3.5);
          ctx.lineTo(lampX + coneSpread, coneBottomY);
          ctx.lineTo(lampX - coneSpread, coneBottomY);
          ctx.closePath();
          ctx.fill();

          // 5B. Elliptical Road Surface Light Pool & Wet Asphalt Reflection
          ctx.save();
          const lampRoadY = getEarthContourHeight(lampX, map, visibleObstacles) + 2.5;
          ctx.translate(lampX, lampRoadY);
          ctx.rotate(roadSlope);

          const poolGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, coneSpread * (quality === 'Ultra' ? 1.15 : 0.98));
          poolGrad.addColorStop(0, `rgba(255, 253, 230, ${(quality === 'Ultra' ? 0.82 : 0.68) * inten})`);
          poolGrad.addColorStop(0.45, `rgba(251, 191, 36, ${0.42 * inten})`);
          poolGrad.addColorStop(0.8, `rgba(245, 158, 11, ${0.18 * inten})`);
          poolGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = poolGrad;
          ctx.beginPath();
          ctx.ellipse(0, 0, coneSpread * (quality === 'Ultra' ? 1.15 : 0.98), 12, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bright central asphalt reflection hotspot
          ctx.fillStyle = `rgba(255, 255, 255, ${0.56 * inten})`;
          ctx.beginPath();
          ctx.ellipse(0, -0.5, 38, 4.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 5C. Glowing LED Emitter Halo & Solid Bright Bulb Core
          const haloR = quality === 'Ultra' ? 48 : 38;
          const bulbHalo = ctx.createRadialGradient(
            lampX + 1,
            lampY + 3.5,
            2,
            lampX + 1,
            lampY + 3.5,
            haloR
          );
          bulbHalo.addColorStop(0, `rgba(255, 255, 255, ${0.98 * inten})`);
          bulbHalo.addColorStop(0.42, `rgba(254, 240, 138, ${0.76 * inten})`);
          bulbHalo.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = bulbHalo;
          ctx.beginPath();
          ctx.arc(lampX + 1, lampY + 3.5, haloR, 0, Math.PI * 2);
          ctx.fill();
        } else if (quality === 'Medium') {
          // Simplified medium-quality street light cone without radial gradient passes
          ctx.fillStyle = `rgba(253, 224, 71, ${0.18 * inten})`;
          ctx.beginPath();
          ctx.moveTo(lampX - 9, lampY + 3.5);
          ctx.lineTo(lampX + 9, lampY + 3.5);
          ctx.lineTo(lampX + 85, coneBottomY);
          ctx.lineTo(lampX - 85, coneBottomY);
          ctx.closePath();
          ctx.fill();
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(lampX + 1, lampY + 3, 10.2, 3.0, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Unlit daytime LED glass lens (Morning, Noon, Afternoon)
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.ellipse(lampX + 1, lampY + 2.5, 9.0, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Dynamic Midnight Lightning Reflection & Raindrop Impacts/Splashes on Street Light Pole & Lamp Head
      if (state.lightningFlash > 0.05) {
        ctx.strokeStyle = `rgba(224, 242, 254, ${Math.min(0.88, state.lightningFlash * 0.78)})`;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(poleX - 2.6, topY);
        ctx.lineTo(poleX - 4.4, baseY - 15);
        ctx.moveTo(lampX - 12, lampY - 4.5);
        ctx.lineTo(lampX + 14, lampY - 4.5);
        ctx.stroke();
      }
      if (state.rainIntensity > 0.05) {
        const poleRainAlpha = Math.min(0.95, 0.45 + state.rainIntensity * 0.48);
        ctx.strokeStyle = `rgba(224, 242, 254, ${poleRainAlpha})`;
        ctx.fillStyle = `rgba(186, 230, 253, ${poleRainAlpha})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        // Comprehensive Raindrop Collisions, V-Splashes & Running Water Drops Across the Entire Street Light Post From Top to Bottom!
        const poleSplashPoints = [
          // Top luminaire housing & cantilever bracket arm
          { x: lampX - 9, y: lampY - 4.5, seed: 0.7 },
          { x: lampX + 1, y: lampY - 4.5, seed: 1.5 },
          { x: lampX + 10, y: lampY - 4.5, seed: 2.3 },
          { x: poleX + armReachX * 0.68, y: lampY - 1.0, seed: 3.1 },
          { x: poleX + armReachX * 0.34, y: topY - 8, seed: 3.9 },
          // Entire vertical tapered pole shaft from top (topY) down to bottom pedestal (baseY)
          { x: poleX, y: topY, seed: 4.7 },
          { x: poleX - 2.8, y: topY + poleHeight * 0.12, seed: 5.4 },
          { x: poleX + 2.9, y: topY + poleHeight * 0.24, seed: 6.2 },
          { x: poleX - 3.2, y: topY + poleHeight * 0.36, seed: 7.0 },
          { x: poleX + 3.6, y: topY + poleHeight * 0.48, seed: 7.8 },
          { x: poleX - 4.0, y: baseY - poleHeight * 0.45, seed: 8.5 }, // Mid-shaft collar ring
          { x: poleX + 3.8, y: topY + poleHeight * 0.64, seed: 9.3 },
          { x: poleX - 4.1, y: topY + poleHeight * 0.76, seed: 10.1 },
          { x: poleX + 4.3, y: topY + poleHeight * 0.88, seed: 10.9 },
          // Pedestal base & lower foundation flange
          { x: poleX - 6.0, y: baseY - 16, seed: 11.7 },
          { x: poleX + 6.0, y: baseY - 16, seed: 12.5 },
          { x: poleX - 8.5, y: baseY - 4, seed: 13.3 },
          { x: poleX + 8.5, y: baseY - 4, seed: 14.1 },
        ];
        for (let ps = 0; ps < poleSplashPoints.length; ps++) {
          const pt = poleSplashPoints[ps];
          const phase = (timeSec * 6.9 + pIdx * 3.7 + pt.seed) % 1;
          if (phase < 0.64) {
            const pNorm = phase / 0.64;
            const sx = 1.8 + pNorm * 5.2;
            const sy = (1 - pNorm) * 5.2;
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x - sx, pt.y - sy);
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x + sx, pt.y - sy);
          } else {
            // Water droplet sliding/dripping down the vertical street light pole shaft
            const dNorm = (phase - 0.64) / 0.36;
            const dripY = pt.y + dNorm * 14;
            ctx.moveTo(pt.x, dripY);
            ctx.lineTo(pt.x, dripY + 4.5);
          }
        }
        ctx.stroke();

        // Bouncing micro-droplet beads along the pole shaft & lamp head from top to bottom
        ctx.beginPath();
        for (let ps = 0; ps < poleSplashPoints.length; ps += 2) {
          const pt = poleSplashPoints[ps];
          const phase = (timeSec * 6.9 + pIdx * 3.7 + pt.seed) % 1;
          if (phase < 0.56) {
            const pNorm = phase / 0.56;
            const bx = pt.x + (ps % 4 === 0 ? -1 : 1) * (2.0 + pNorm * 4.2);
            const by = pt.y - Math.sin(pNorm * Math.PI) * 5.0;
            ctx.moveTo(bx + 1.15, by);
            ctx.arc(bx, by, 1.15, 0, Math.PI * 2);
          }
        }
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // H2) Natural Procedural Asphalt Cracks, Wet Puddle Glints & Varied Small Roadside Stones (Optimized for locked 60 FPS)
  const crackSpacing = quality === 'Low' ? 140 : quality === 'Medium' ? 105 : 74;
  const firstCrackX = Math.floor(startWorldX / crackSpacing) * crackSpacing;
  for (let cx = firstCrackX; cx <= endWorldX; cx += crackSpacing) {
    if (isNearBridgeFast(cx, 8, visibleObstacles)) continue;

    const gy = getEarthContourHeight(cx, map, visibleObstacles) + 4;
    const slope = getTerrainSlope(cx, map);
    const seed = Math.abs(Math.sin(cx * 0.173));
    const shimmer = 0.28 + 0.22 * Math.sin(timeSec * 3.2 + cx * 0.07);

    ctx.save();
    ctx.translate(cx, gy);
    ctx.rotate(slope);

    // 1. Natural branched asphalt stress crack (تشققات الأسفلت الطبيعية)
    if (seed > 0.22) {
      ctx.strokeStyle = map.isNeon
        ? 'rgba(249, 115, 22, 0.78)'
        : 'rgba(2, 6, 23, 0.78)';
      ctx.lineWidth = map.isNeon ? 1.7 : 1.35;
      ctx.beginPath();
      ctx.moveTo(-10, -2 + seed * 3);
      ctx.lineTo(-3, 2 - seed * 2);
      ctx.lineTo(5, -1 + seed * 2.5);
      ctx.lineTo(12, 3 - seed * 2);
      ctx.moveTo(-3, 2 - seed * 2);
      ctx.lineTo(1, 6);
      ctx.stroke();

      ctx.strokeStyle = map.isNeon
        ? 'rgba(254, 240, 138, 0.45)'
        : 'rgba(148, 163, 184, 0.28)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(-10, -1 + seed * 3);
      ctx.lineTo(5, 0 + seed * 2.5);
      ctx.stroke();
    }

    // 2. Dynamic Sun/Moon Wet Puddle Specular Glint Streak
    ctx.strokeStyle =
      cx % (crackSpacing * 2) === 0
        ? map.isNeon
          ? `rgba(0, 240, 255, ${shimmer * 1.1})`
          : isNightSheen
          ? `rgba(224, 242, 254, ${shimmer * 1.15})`
          : `rgba(254, 240, 138, ${shimmer * 1.1})`
        : map.isNeon
        ? `rgba(249, 115, 22, ${shimmer})`
        : `rgba(125, 211, 252, ${shimmer * 0.95})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-16, -1.5);
    ctx.lineTo(16, -1.5);
    ctx.stroke();

    ctx.restore();
  }

  // (Road surface stones H2B are rendered in step 10C on top/outside of the drawbridge structure!)

  // Dynamic Midnight Lightning Illumination along Wet Asphalt Road Surface
  if (state.lightningFlash > 0.04) {
    ctx.save();
    traceRoadPath(1.5);
    ctx.strokeStyle = `rgba(224, 242, 254, ${Math.min(0.75, state.lightningFlash * 0.62)})`;
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.restore();
  }

  // Comprehensive Raindrop Splash Crowns, Bouncing Micro-Droplets & Expanding Puddle Ripples on the Wet Asphalt Road Surface
  if (state.rainIntensity > 0.05 && quality !== 'Low') {
    const sampleStride = quality === 'Medium' ? 3 : 1;
    const splashAlpha = Math.min(0.94, 0.44 + state.rainIntensity * 0.48);
    ctx.strokeStyle = `rgba(224, 242, 254, ${splashAlpha})`;
    ctx.fillStyle = `rgba(186, 230, 253, ${splashAlpha * 0.85})`;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    for (let i = 0; i < roadSamples.length; i += sampleStride) {
      const s = roadSamples[i];
      const phase = (timeSec * 6.8 + s.wx * 0.13) % 1;
      const gy = s.gy - 0.5 + Math.sin(s.wx * 0.37) * 2.5;
      if (phase < 0.62) {
        const pNorm = phase / 0.62;
        const rW = 2.2 + pNorm * 8.5;
        const crownH = (1 - pNorm) * 6.5;
        // Upward V-splash crown on road impact
        ctx.moveTo(s.wx - rW, gy);
        ctx.lineTo(s.wx - rW * 0.38, gy - crownH);
        ctx.moveTo(s.wx + rW, gy);
        ctx.lineTo(s.wx + rW * 0.38, gy - crownH);
      } else {
        // Expanding elliptical water ripple ring on wet road
        const rNorm = (phase - 0.62) / 0.38;
        const rx = 4 + rNorm * 10;
        ctx.moveTo(s.wx - rx, gy + 1.5);
        ctx.lineTo(s.wx + rx, gy + 1.5);
      }
    }
    ctx.stroke();
  }
  ctx.restore();

  // 6B. Render Movable Wooden / Suspension Drawbridges over Track Gaps & 3D Track Rock Bumps
  drawTrackRockBumps(ctx, state, startWorldX, endWorldX, map, timeSec);

  // Distance Signposts every 100m (2500px)
  const signInterval = 2500;
  const firstSign = Math.max(
    signInterval,
    Math.floor(startWorldX / signInterval) * signInterval
  );
  for (let sx = firstSign; sx <= endWorldX; sx += signInterval) {
    const sy = getTerrainHeight(sx, map);
    const meters = Math.round((sx - 140) / 25);
    ctx.save();
    ctx.fillStyle = '#334155';
    ctx.fillRect(sx - 3, sy - 62, 6, 62);
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = map.groundTop;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sx - 36, sy - 88, 72, 28, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${meters}m`, sx, sy - 70);
    ctx.restore();
  }

  // 7. Render Active Pickups ON THE GROUND ROAD ONLY (Never in the sky during flight!)
  //    ("منع ظهور أيقونات إصلاح السيارة أو الكوينز في السماء تماماً أثناء الطيران — تظهر فقط على الطريق الأرضي وعند عودة السيارة إلى الأرض")
  if (!isMenuPreview && state.flightPhase === 'none') {
    for (const item of state.pickups) {
      if (
        item.collected ||
        item.x < startWorldX - 40 ||
        item.x > endWorldX + 40
      )
        continue;

      ctx.save();
      ctx.translate(item.x, item.y + Math.sin(timeSec * 4 + item.id) * 3);

      if (item.type === 'coin') {
        const coinR = item.radius;
        const coinDepth = 4.6; // Distinct 3D extruded bevel thickness

        // 1. Soft Golden Ambient Glow Halo
        ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, coinR * 1.32, 0, Math.PI * 2);
        ctx.fill();

        // 2. 3D Extruded Side Cylinder / Milled Rim Depth (Right-Bottom 3D Extrusion)
        const rimSideGrad = ctx.createLinearGradient(
          -coinR,
          -coinR,
          coinR + coinDepth,
          coinR + coinDepth
        );
        rimSideGrad.addColorStop(0, '#92400E');
        rimSideGrad.addColorStop(0.5, '#78350F');
        rimSideGrad.addColorStop(1, '#451A03');
        ctx.fillStyle = rimSideGrad;
        ctx.strokeStyle = '#451A03';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(coinDepth * 0.72, coinDepth * 0.48, coinR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Crisp 3D Milled Coin Edge Ridges (Reeding Lines along the 3D Rim)
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        for (let m = -3; m <= 3; m++) {
          const ma = m * 0.35 + 0.45;
          const mx1 = Math.cos(ma) * (coinR - 0.5);
          const my1 = Math.sin(ma) * (coinR - 0.5);
          ctx.moveTo(mx1, my1);
          ctx.lineTo(mx1 + coinDepth * 0.7, my1 + coinDepth * 0.46);
        }
        ctx.stroke();

        // 3. Outer 3D Beveled Metallic Gold Face
        const bevelGrad = ctx.createLinearGradient(-coinR, -coinR, coinR, coinR);
        bevelGrad.addColorStop(0, '#FEF08A');
        bevelGrad.addColorStop(0.35, '#FACC15');
        bevelGrad.addColorStop(0.75, '#D97706');
        bevelGrad.addColorStop(1, '#92400E');
        ctx.fillStyle = bevelGrad;
        ctx.strokeStyle = '#78350F';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(0, 0, coinR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Upper-Left 3D Specular Bevel Chamfer Highlight Arc
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, coinR - 1.1, -Math.PI * 0.88, -Math.PI * 0.12);
        ctx.stroke();

        // 4. Recessed Inner 3D Coin Dish & Inner Bevel Shadow Ring
        const innerR = coinR * 0.76;
        const dishGrad = ctx.createRadialGradient(
          -innerR * 0.3,
          -innerR * 0.3,
          1,
          0,
          0,
          innerR
        );
        dishGrad.addColorStop(0, '#FEF9C3');
        dishGrad.addColorStop(0.55, '#FDE047');
        dishGrad.addColorStop(1, '#CA8A04');
        ctx.fillStyle = dishGrad;
        ctx.beginPath();
        ctx.arc(0, 0, innerR, 0, Math.PI * 2);
        ctx.fill();

        // Recessed inner bevel rim shadow (top-left dark, bottom-right bright)
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, innerR, Math.PI * 0.75, Math.PI * 1.85);
        ctx.stroke();
        ctx.strokeStyle = '#FEF9C3';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, 0, innerR, -Math.PI * 0.15, Math.PI * 0.75);
        ctx.stroke();

        // 5. Embossed 3D "25" Value Numeral (Strictly & Exclusively 25!)
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 3D extruded text shadow
        ctx.fillStyle = '#78350F';
        ctx.fillText('25', 1.1, 1.8);
        // Main embossed dark-gold numeral
        ctx.fillStyle = '#92400E';
        ctx.fillText('25', 0, 0.8);

        // 6. Visible Raindrop Impacts, Upward V-Splashes, Bouncing Droplets & Water Drips on the 3D Coin Surface!
        if (state.rainIntensity > 0.05) {
          const cRainAlpha = Math.min(0.96, 0.5 + state.rainIntensity * 0.46);
          ctx.strokeStyle = `rgba(224, 242, 254, ${cRainAlpha})`;
          ctx.fillStyle = `rgba(186, 230, 253, ${cRainAlpha})`;
          ctx.lineWidth = 1.3;

          // Wet water sheen along top 3D beveled coin rim
          ctx.beginPath();
          ctx.arc(0, 0, coinR + 0.4, -Math.PI * 0.82, -Math.PI * 0.18);
          ctx.stroke();

          const coinSplashPts = [
            { x: 0, y: -coinR, s: 0.2 }, // Top 3D bevel crown
            { x: -coinR * 0.62, y: -coinR * 0.74, s: 1.5 }, // Upper-left bevel shoulder
            { x: coinR * 0.62, y: -coinR * 0.74, s: 2.8 }, // Upper-right bevel shoulder
            { x: 0, y: -2, s: 4.1 }, // Center embossed 3D dish face
          ];
          ctx.beginPath();
          for (let cs = 0; cs < coinSplashPts.length; cs++) {
            const pt = coinSplashPts[cs];
            const ph = (timeSec * 7.8 + item.id * 2.3 + pt.s) % 1;
            if (ph < 0.66) {
              const pNorm = ph / 0.66;
              const spX = 1.8 + pNorm * 4.8;
              const spY = (1 - pNorm) * 5.2;
              ctx.moveTo(pt.x, pt.y);
              ctx.lineTo(pt.x - spX, pt.y - spY);
              ctx.moveTo(pt.x, pt.y);
              ctx.lineTo(pt.x + spX, pt.y - spY);
            } else {
              // Water droplet trickling down the 3D coin face & dripping off the bottom bevel
              const dNorm = (ph - 0.66) / 0.34;
              const ty = pt.y + dNorm * (coinR * 0.85);
              ctx.moveTo(pt.x, ty);
              ctx.lineTo(pt.x - 0.5, ty + 3.4);
            }
          }
          ctx.stroke();

          // Bouncing micro-droplet beads off the 3D coin bevel & face
          ctx.beginPath();
          for (let cs = 0; cs < coinSplashPts.length; cs++) {
            const pt = coinSplashPts[cs];
            const ph = (timeSec * 7.8 + item.id * 2.3 + pt.s) % 1;
            if (ph < 0.58) {
              const pNorm = ph / 0.58;
              const bx = pt.x + (cs % 2 === 0 ? -1 : 1) * (1.5 + pNorm * 3.8);
              const by = pt.y - Math.sin(pNorm * Math.PI) * 4.8;
              ctx.moveTo(bx + 1.1, by);
              ctx.arc(bx, by, 1.1, 0, Math.PI * 2);
            }
          }
          ctx.fill();
        }
      } else if (item.type === 'fuel') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
        ctx.beginPath();
        ctx.roundRect(-17, -20, 34, 40, 7);
        ctx.fill();

        ctx.fillStyle = '#DC2626';
        ctx.strokeStyle = '#FCA5A5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-14, -17, 28, 34, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#991B1B';
        ctx.fillRect(-7, -13, 14, 5);

        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('FUEL', 0, 4);
      } else if (item.type === 'repair') {
        // === ON-ROAD REPAIR WRENCH PICKUP ICON (أيقونة إصلاح السيارة والكشافات 100%) ===
        ctx.fillStyle = 'rgba(16, 185, 129, 0.24)';
        ctx.beginPath();
        ctx.arc(0, 0, item.radius * 1.38, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#065F46';
        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Crisp 3D Vector Mechanic Wrench Symbol inside Badge
        ctx.save();
        ctx.rotate(-Math.PI * 0.25 + Math.sin(timeSec * 3) * 0.12);
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-3.2, -10, 6.4, 20, 2.5);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -10, 6.2, 0.3, Math.PI * 2 - 0.3);
        ctx.arc(0, 10, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#FEF08A';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('REPAIR', 0, item.radius + 11);
      }

      ctx.restore();
    }
  }

  // 8. Render Particles (Flames, Sparks, Dust & 0%-Health Billowing Engine Smoke!)
  // Graphics Quality Tiering:
  // - Ultra: Max particle effects + high-res glowing bloom halos on sparks/flames
  // - High: Standard particle effects
  // - Medium: Reduced particle effects & simplified single-circle rendering
  // - Low: Heavy particle effects disabled for maximum performance
  if (quality !== 'Low') {
    for (const p of state.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      if (p.isSpark) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = quality === 'Ultra' ? p.size * 1.25 : p.size;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025);
        ctx.stroke();
        if (quality === 'Ultra') {
          ctx.globalAlpha = Math.max(0, p.alpha * 0.38);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (p.isSmoke && quality !== 'Medium') {
        // Soft multi-puff billowing engine smoke cloud (High & Ultra)
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.arc(p.x + p.size * 0.45, p.y - p.size * 0.25, p.size * 0.78, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (quality === 'Ultra' && p.size > 4) {
          ctx.globalAlpha = Math.max(0, p.alpha * 0.28);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.65, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }
  }

  // 8B. Render Tumbling Detached Car Parts (Bumpers, Hood, Side Door & Shattered Glass Shards!)
  for (const part of state.detachedParts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, part.alpha));
    ctx.translate(part.x, part.y);
    ctx.rotate(part.angle);
    if (part.type === 'glass_shard') {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-part.width * 0.5, -part.height * 0.5);
      ctx.lineTo(part.width * 0.6, -part.height * 0.2);
      ctx.lineTo(part.width * 0.2, part.height * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = part.color;
      ctx.strokeStyle = part.accentColor;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(
        -part.width * 0.5,
        -part.height * 0.5,
        part.width,
        part.height,
        3
      );
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // 9. Render Roadside & Track Rock Obstacles on the Road Surface before the Car & Wheels
  //    so the vehicle's 3D tires visibly climb up and roll ON TOP of every rock crown!
  drawForegroundRoadStonesAndRocks(
    ctx,
    state,
    startWorldX,
    endWorldX,
    map,
    visibleObstacles,
    nightAmt,
    isNightSheen,
    timeSec
  );

  // 9A. Realistic Perspective Vehicle Shadow Connected to Car Body & Terrain Slope!
  //    (Progressively & smoothly hides each part/wheel of the shadow as it transitions onto the suspension bridge,
  //     and smoothly restores it as the vehicle exits back onto solid ground!)
  const surfUnderCar = getEffectiveSurfaceInfo(state.x, map, state, timeSec);
  const groundUnderCarY = surfUnderCar.overGap
    ? getTerrainHeight(state.x, map) + 160
    : surfUnderCar.y;
  const groundSlope = getEffectiveSlope(state.x, map, state, timeSec);
  const carAltitude = Math.max(0, groundUnderCarY - (state.y + car.wheelRadius));

  if (!surfUnderCar.overGap && quality !== 'Low') {
    if (quality === 'Medium') {
      // Medium Quality: Simplified flat shadow ellipse without radial gradient passes
      const heightFactor = Math.max(0.18, 1 - carAltitude / 290);
      ctx.save();
      ctx.translate(state.x, groundUnderCarY + 4);
      ctx.rotate(groundSlope);
      ctx.fillStyle = `rgba(2, 6, 23, ${(0.46 * heightFactor).toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        car.chassisWidth * 0.58 * (1 + (1 - heightFactor) * 0.25),
        8.5 * heightFactor,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    } else {
      // High & Ultra Quality: Smooth multi-layered dynamic shadows & wheel AO contact shadows
      drawDynamicVehicleShadow(
        ctx,
        state,
        car,
        map,
        timeSec,
        groundUnderCarY,
        groundSlope,
        carAltitude
      );
    }

    // 9A-2. Mirror Surface Car Reflection & High-Res Underglow on Wet Road (Ultra Quality Only)
    if (quality === 'Ultra' && carAltitude < 65 && !state.isExploded && !surfUnderCar.onBridge) {
      ctx.save();
      if (state.obstacles && state.obstacles.length > 0) {
        ctx.beginPath();
        ctx.rect(state.x - 1000, -10000, 2000, 20000);
        for (let i = 0; i < state.obstacles.length; i++) {
          const obs = state.obstacles[i];
          if (obs.type === 'suspension_bridge') {
            ctx.rect(obs.x - obs.width * 0.5 + 2, -10000, Math.max(0, obs.width - 4), 20000);
          }
        }
        ctx.clip('evenodd');
      }
      ctx.translate(state.x, groundUnderCarY + 8);
      ctx.rotate(groundSlope);
      ctx.scale(1, -0.32);
      ctx.globalAlpha = Math.max(
        0.18,
        (state.inWaterPit ? 0.42 : 0.26 + state.rainIntensity * 0.18) *
          (1 - carAltitude / 65)
      );
      ctx.fillStyle = car.bodyColor;
      ctx.beginPath();
      ctx.roundRect(
        -car.chassisWidth * 0.45,
        -car.chassisHeight * 0.85,
        car.chassisWidth * 0.9,
        car.chassisHeight * 0.75,
        8
      );
      ctx.fill();
      ctx.fillStyle = car.accentColor;
      ctx.fillRect(-car.chassisWidth * 0.42, -car.chassisHeight * 0.45, car.chassisWidth * 0.84, 4);
      ctx.restore();
    }
  }

  // 9B. Smart Headlights & Taillights Road Illumination Pool:
  // Active on Ultra & High (disabled on Low, simplified on Medium, and suppressed near suspension bridges so zero yellow light beam appears behind wooden bridge support pillars!)
  if (
    quality !== 'Low' &&
    quality !== 'Medium' &&
    state.headlightsOn &&
    !state.isExploded &&
    state.flightPhase === 'none' &&
    state.wingDeployProgress <= 0.05 &&
    carAltitude < 85 &&
    !surfUnderCar.onBridge &&
    !isNearBridgeFast(state.x, 300, visibleObstacles)
  ) {
    drawSmartHeadlightsRoadGlow(
      ctx,
      state,
      car,
      map,
      controls.brake,
      timeSec
    );
  }

  // 9C. HIGH-ALTITUDE VOLUMETRIC 3D CLOUD DECK BELOW THE AIRCRAFT (Zero flat ellipses!)
  if (carAltitude > 150 && volumetricCloudCanvases.length > 0) {
    ctx.save();
    const skyCloudAlpha = Math.min(0.92, (carAltitude - 150) / 210);
    const cloudSpacing = 210;
    const firstCloudX =
      Math.floor((startWorldX - 240) / cloudSpacing) * cloudSpacing;

    // Two 3D volumetric cloud decks positioned BELOW the aircraft and ABOVE the trees/mountains
    for (let layer = 0; layer < 2; layer++) {
      const layerDepth = layer === 0 ? 195 : 115; // Distance below aircraft
      let idx = 0;
      for (
        let cx = firstCloudX;
        cx <= endWorldX + 240;
        cx += cloudSpacing + layer * 45
      ) {
        const sprite =
          volumetricCloudCanvases[(idx + layer) % volumetricCloudCanvases.length];
        idx++;
        const cSeed = Math.sin(cx * 0.017 + layer * 2.1);
        const cloudDrift = (timeSec * (18 + layer * 7)) % (cloudSpacing + layer * 45);
        const cloudWorldX = cx - cloudDrift - 150;
        const cloudWorldY =
          state.y +
          layerDepth +
          cSeed * 28 +
          Math.cos(cx * 0.009) * 14 -
          65;
        const cloudW = 290 + Math.abs(cSeed) * 85;
        const cloudH = 128 + Math.abs(Math.cos(cx * 0.023)) * 32;

        ctx.globalAlpha =
          skyCloudAlpha *
          (layer === 0 ? 0.68 : 0.9) *
          (nightAmt > 0.35 ? 0.65 : 1);
        ctx.drawImage(sprite, cloudWorldX, cloudWorldY, cloudW, cloudH);
      }
    }

    // High-altitude aerodynamic wind stream ribbons rushing past the aircraft
    ctx.strokeStyle = `rgba(224, 242, 254, ${skyCloudAlpha * 0.34})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let wIdx = 0; wIdx < 5; wIdx++) {
      const streamX =
        state.x +
        260 -
        (((timeSec * 680 + wIdx * 170) % 640) + 640) % 640;
      const streamY = state.y - 70 + wIdx * 38;
      ctx.moveTo(streamX, streamY);
      ctx.lineTo(streamX + 75, streamY);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 10. Render Unique 3D Vehicle with Transparent/Shattered Windows, Driver, Progressive Part Damage, Raindrops & Smart Brake/Reverse/Jet Effects
  const isBoosting =
    !state.isExploded && controls.boost && state.nitro > 0 && state.fuel > 0;
  renderVehicle3D(
    ctx,
    state,
    car,
    quality,
    isBoosting,
    carAltitude,
    false,
    !state.isExploded && controls.brake,
    !state.isExploded && controls.gas && state.fuel > 0
  );

  // 10B. Render Moving Drawbridge Foreground Structure (Front Railings, Balusters, Suspension Cables, Hoist Chains & Tower Arches)
  //      OVER the Car so the vehicle drives INSIDE the drawbridge structure rather than floating on top of it!
  if (state.flightPhase === 'none') {
    for (let i = 0; i < visibleObstacles.length; i++) {
      const obs = visibleObstacles[i];
      if (obs.type === 'suspension_bridge') {
        drawMovableWoodenBridgeForeground(ctx, obs, state, map, timeSec);
      }
    }
  }

  // 11. Render Floating Texts
  for (const ft of state.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = 'bold 16px "Cairo", sans-serif';
    ctx.fillStyle = ft.color;
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();

  // 12. Screen-Space Heavy Rain Streaks Overlay (5-Min Weather System)
  if (state.rainIntensity > 0.05) {
    drawWeatherRainOverlay(
      ctx,
      width,
      height,
      timeSec,
      state.rainIntensity,
      state.vx,
      quality
    );
  }
}

/**
 * Renders Realistic Geological Underground Cross-Section Details (طبقات الأرض والتضاريس):
 * Reuses precomputed `roadSamples` directly for Zero-Lag 60 FPS rendering!
 */
function drawUndergroundCrossSection(
  ctx: CanvasRenderingContext2D,
  roadSamples: { wx: number; gy: number; onBridge: boolean }[],
  startWorldX: number,
  endWorldX: number,
  bottomY: number,
  map: MapConfig,
  obstacles: TrackObstacle[],
  quality: GraphicsQuality
): void {
  if (roadSamples.length < 2) return;

  // 1. Sub-Surface Topsoil Stratum Band (Depth: 10px -> 48px)
  ctx.fillStyle = map.isNeon
    ? 'rgba(30, 27, 75, 0.72)'
    : map.environmentType === 'desert'
    ? 'rgba(146, 64, 14, 0.68)'
    : map.environmentType === 'snow'
    ? 'rgba(51, 65, 85, 0.72)'
    : 'rgba(69, 26, 3, 0.68)';
  ctx.beginPath();
  for (let i = 0; i < roadSamples.length; i += 2) {
    const s = roadSamples[i];
    if (i === 0) ctx.moveTo(s.wx, s.gy + 10);
    else ctx.lineTo(s.wx, s.gy + 10);
  }
  for (let i = roadSamples.length - 1; i >= 0; i -= 2) {
    const s = roadSamples[i];
    ctx.lineTo(s.wx, s.gy + 46 + Math.sin(s.wx * 0.018) * 6);
  }
  ctx.closePath();
  ctx.fill();

  // 2. Middle Sedimentary Rock Stratum Band (Depth: 46px -> 128px)
  ctx.fillStyle = map.isNeon
    ? 'rgba(15, 23, 42, 0.78)'
    : map.environmentType === 'desert'
    ? 'rgba(120, 53, 15, 0.72)'
    : map.environmentType === 'snow'
    ? 'rgba(30, 41, 59, 0.78)'
    : 'rgba(41, 37, 36, 0.76)';
  ctx.beginPath();
  for (let i = 0; i < roadSamples.length; i += 2) {
    const s = roadSamples[i];
    const gy = s.gy + 46 + Math.sin(s.wx * 0.018) * 6;
    if (i === 0) ctx.moveTo(s.wx, gy);
    else ctx.lineTo(s.wx, gy);
  }
  for (let i = roadSamples.length - 1; i >= 0; i -= 2) {
    const s = roadSamples[i];
    ctx.lineTo(s.wx, s.gy + 128 + Math.cos(s.wx * 0.012) * 10);
  }
  ctx.closePath();
  ctx.fill();

  // 3. Deep Bedrock Layer (Depth: 128px -> bottom)
  ctx.fillStyle = map.isNeon ? '#090514' : '#0C0A09';
  ctx.beginPath();
  for (let i = 0; i < roadSamples.length; i += 2) {
    const s = roadSamples[i];
    const gy = s.gy + 128 + Math.cos(s.wx * 0.012) * 10;
    if (i === 0) ctx.moveTo(s.wx, gy);
    else ctx.lineTo(s.wx, gy);
  }
  ctx.lineTo(endWorldX, bottomY);
  ctx.lineTo(startWorldX, bottomY);
  ctx.closePath();
  ctx.fill();
}

function drawTrackRockBumps(
  ctx: CanvasRenderingContext2D,
  state: PhysicsState,
  startWorldX: number,
  endWorldX: number,
  map: MapConfig,
  timeSec: number = 0
): void {
  for (const obs of state.obstacles) {
    if (
      obs.x + obs.width * 0.5 < startWorldX - 80 ||
      obs.x - obs.width * 0.5 > endWorldX + 80
    )
      continue;

    if (obs.type === 'suspension_bridge') {
      drawMovableWoodenBridge(ctx, obs, state, map, timeSec);
    }
  }
}

/**
 * Renders all Roadside/Road Surface Jagged Stones AND Track Rock Obstacles in the Foreground Layer
 * (AFTER the drawbridge background & foreground layers) so rocks/stones positioned along or near
 * the drawbridge surface are rendered clearly ON TOP / OUTSIDE of the bridge structure!
 */
function drawForegroundRoadStonesAndRocks(
  ctx: CanvasRenderingContext2D,
  state: PhysicsState,
  startWorldX: number,
  endWorldX: number,
  map: MapConfig,
  visibleObstacles: TrackObstacle[],
  nightAmt: number,
  isNightSheen: boolean,
  timeSec: number = 0
): void {
  const drawRealistic3DBoulderCluster = (
    worldX: number,
    baseY: number,
    slope: number,
    hw: number,
    sh: number,
    h1: number,
    h2: number,
    h3: number,
    isBridgeRock: boolean,
    seedId: number
  ) => {
    ctx.save();
    ctx.translate(worldX, baseY);
    ctx.rotate(slope);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const isNight = nightAmt > 0.45;
    // 1. Multi-layered soft ambient occlusion & ground/bridge-edge contact shadow
    const aoGrad = ctx.createRadialGradient(0, 1.5, hw * 0.15, 0, 1.5, hw * 1.32);
    aoGrad.addColorStop(0, 'rgba(2, 6, 23, 0.72)');
    aoGrad.addColorStop(0.65, 'rgba(15, 23, 42, 0.38)');
    aoGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = aoGrad;
    ctx.beginPath();
    ctx.ellipse(0, 1.8, hw * 1.28, Math.max(3.2, sh * 0.16), 0, 0, Math.PI * 2);
    ctx.fill();

    // Helper to draw a single organic 3D stone body with volumetric shading, crevices & mineral grain
    const renderOrganicRockBody = (
      ox: number,
      oy: number,
      rw: number,
      rh: number,
      s1: number,
      s2: number,
      s3: number,
      isMain: boolean
    ) => {
      ctx.save();
      ctx.translate(ox, oy);

      const peakX = (s3 - 0.5) * rw * 0.32;
      const pL0X = -rw * 1.02;
      const pL0Y = 1.2;
      const pL1X = -rw * (0.88 + s1 * 0.08);
      const pL1Y = -rh * (0.34 + s2 * 0.1);
      const pL2X = -rw * (0.62 + s3 * 0.1);
      const pL2Y = -rh * (0.72 + s1 * 0.08);
      const pL3X = -rw * (0.24 + s2 * 0.08);
      const pL3Y = -rh * (0.94 + s3 * 0.05);
      const pTopX = peakX;
      const pTopY = -rh;
      const pR3X = rw * (0.3 + s1 * 0.1);
      const pR3Y = -rh * (0.9 + s2 * 0.07);
      const pR2X = rw * (0.68 + s3 * 0.08);
      const pR2Y = -rh * (0.62 + s1 * 0.1);
      const pR1X = rw * (0.92 + s2 * 0.06);
      const pR1Y = -rh * (0.28 + s3 * 0.08);
      const pR0X = rw * 1.02;
      const pR0Y = 1.2;

      // Trace smooth organic boulder contour using quadratic curves between control vertices
      const traceOrganicContour = () => {
        ctx.beginPath();
        ctx.moveTo(pL0X, pL0Y);
        ctx.quadraticCurveTo(pL1X, pL1Y, (pL1X + pL2X) * 0.5, (pL1Y + pL2Y) * 0.5);
        ctx.quadraticCurveTo(pL2X, pL2Y, (pL2X + pL3X) * 0.5, (pL2Y + pL3Y) * 0.5);
        ctx.quadraticCurveTo(pL3X, pL3Y, pTopX, pTopY);
        ctx.quadraticCurveTo(pR3X, pR3Y, (pR3X + pR2X) * 0.5, (pR3Y + pR2Y) * 0.5);
        ctx.quadraticCurveTo(pR2X, pR2Y, (pR2X + pR1X) * 0.5, (pR2Y + pR1Y) * 0.5);
        ctx.quadraticCurveTo(pR1X, pR1Y, pR0X, pR0Y);
        ctx.quadraticCurveTo(0, 2.4, pL0X, pL0Y);
        ctx.closePath();
      };

      // Base 3D volumetric stone gradient (high-contrast sunlit granite/limestone so road stones are 100% visible on dark asphalt!)
      const baseGrad = ctx.createLinearGradient(-rw * 0.65, -rh, rw * 0.75, 2);
      if (isNight) {
        baseGrad.addColorStop(0, isBridgeRock ? '#CBD5E1' : '#E2E8F0');
        baseGrad.addColorStop(0.38, isBridgeRock ? '#94A3B8' : '#94A3B8');
        baseGrad.addColorStop(0.75, '#475569');
        baseGrad.addColorStop(1, '#1E293B');
      } else if (isBridgeRock) {
        baseGrad.addColorStop(0, '#F5F5F4');
        baseGrad.addColorStop(0.32, '#D6D3D1');
        baseGrad.addColorStop(0.68, '#78716C');
        baseGrad.addColorStop(1, '#292524');
      } else {
        baseGrad.addColorStop(0, '#F8FAFC');
        baseGrad.addColorStop(0.34, '#CBD5E1');
        baseGrad.addColorStop(0.7, '#64748B');
        baseGrad.addColorStop(1, '#334155');
      }

      traceOrganicContour();
      ctx.fillStyle = baseGrad;
      ctx.fill();

      // Clip interior for multi-faceted 3D rock planes, mineral grain, moss patina & cracks
      ctx.save();
      traceOrganicContour();
      ctx.clip();

      // A) Sunlit upper-left 3D granite ridge plane
      const litGrad = ctx.createLinearGradient(-rw * 0.8, -rh, rw * 0.2, -rh * 0.2);
      if (isNight) {
        litGrad.addColorStop(0, 'rgba(148, 163, 184, 0.48)');
        litGrad.addColorStop(0.6, 'rgba(100, 116, 139, 0.22)');
        litGrad.addColorStop(1, 'rgba(51, 65, 85, 0)');
      } else {
        litGrad.addColorStop(0, isBridgeRock ? 'rgba(245, 245, 244, 0.78)' : 'rgba(241, 245, 249, 0.75)');
        litGrad.addColorStop(0.55, isBridgeRock ? 'rgba(214, 211, 209, 0.35)' : 'rgba(203, 213, 225, 0.32)');
        litGrad.addColorStop(1, 'rgba(100, 116, 139, 0)');
      }
      ctx.fillStyle = litGrad;
      ctx.beginPath();
      ctx.moveTo(pL0X, pL0Y - rh * 0.15);
      ctx.lineTo(pL1X, pL1Y);
      ctx.lineTo(pL2X, pL2Y);
      ctx.lineTo(pTopX, pTopY);
      ctx.lineTo(pR3X * 0.65, pR3Y * 0.85);
      ctx.quadraticCurveTo(peakX * 0.3, -rh * 0.45, -rw * 0.25, -rh * 0.18);
      ctx.closePath();
      ctx.fill();

      // B) Deep-shadowed lower-right 3D undercut & overhang plane
      const shadeGrad = ctx.createLinearGradient(peakX * 0.2, -rh * 0.7, rw, 2);
      shadeGrad.addColorStop(0, 'rgba(15, 23, 42, 0.15)');
      shadeGrad.addColorStop(0.55, 'rgba(15, 23, 42, 0.48)');
      shadeGrad.addColorStop(1, 'rgba(2, 6, 23, 0.76)');
      ctx.fillStyle = shadeGrad;
      ctx.beginPath();
      ctx.moveTo(pTopX, pTopY);
      ctx.lineTo(pR3X, pR3Y);
      ctx.lineTo(pR2X, pR2Y);
      ctx.lineTo(pR1X, pR1Y);
      ctx.lineTo(pR0X, pR0Y);
      ctx.lineTo(-rw * 0.18, 2);
      ctx.quadraticCurveTo(peakX * 0.45, -rh * 0.36, pTopX, pTopY);
      ctx.closePath();
      ctx.fill();

      // C) Central chiseled rock step facet for realistic 3D depth
      ctx.fillStyle = isNight
        ? 'rgba(51, 65, 85, 0.42)'
        : isBridgeRock
        ? 'rgba(120, 113, 108, 0.38)'
        : 'rgba(100, 116, 139, 0.36)';
      ctx.beginPath();
      ctx.moveTo(-rw * 0.48, -rh * 0.56);
      ctx.lineTo(peakX, -rh * 0.78);
      ctx.lineTo(rw * 0.42, -rh * 0.52);
      ctx.lineTo(peakX * 0.5, -rh * 0.22);
      ctx.closePath();
      ctx.fill();

      // D) Warm timber-dust & natural moss basal patina on bridge rocks so they blend organically with the wooden drawbridge
      if (isBridgeRock) {
        const patinaGrad = ctx.createLinearGradient(0, -rh * 0.35, 0, 2);
        patinaGrad.addColorStop(0, 'rgba(120, 53, 15, 0)');
        patinaGrad.addColorStop(1, isNight ? 'rgba(69, 26, 3, 0.45)' : 'rgba(120, 53, 15, 0.38)');
        ctx.fillStyle = patinaGrad;
        ctx.fillRect(-rw, -rh * 0.35, rw * 2, rh * 0.38 + 2);

        // Subtle organic moss cushions nestled in basal rock crevices
        ctx.fillStyle = isNight ? 'rgba(21, 128, 61, 0.42)' : 'rgba(77, 124, 15, 0.55)';
        ctx.beginPath();
        ctx.ellipse(-rw * 0.52, -1.2, rw * 0.22, 2.2, -0.18, 0, Math.PI * 2);
        ctx.ellipse(rw * 0.44, -0.8, rw * 0.18, 1.8, 0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // E) Realistic stone texture: natural mineral speckles (quartz/mica highlights & dark granite pores)
      const speckleCount = isMain ? 10 : 5;
      for (let sp = 0; sp < speckleCount; sp++) {
        const sxNorm = Math.sin(seedId * 17.3 + sp * 31.7) * 0.68;
        const syNorm = 0.16 + Math.abs(Math.cos(seedId * 29.1 + sp * 43.3)) * 0.68;
        const spX = sxNorm * rw;
        const spY = -syNorm * rh;
        const spR = 0.75 + (sp % 3) * 0.45;
        ctx.fillStyle =
          sp % 2 === 0
            ? isNight
              ? 'rgba(226, 232, 240, 0.28)'
              : 'rgba(255, 255, 255, 0.42)'
            : 'rgba(15, 23, 42, 0.42)';
        ctx.beginPath();
        ctx.arc(spX, spY, spR, 0, Math.PI * 2);
        ctx.fill();
      }

      // F) Natural geological micro-fissures & chiseled ridge highlights
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.62)';
      ctx.lineWidth = isMain ? 1.15 : 0.9;
      ctx.beginPath();
      ctx.moveTo(pTopX, pTopY + 1.5);
      ctx.quadraticCurveTo(peakX * 0.55, -rh * 0.56, peakX * 0.25, -rh * 0.2);
      ctx.moveTo(pL2X * 0.75, pL2Y * 0.82);
      ctx.quadraticCurveTo(-rw * 0.22, -rh * 0.52, peakX * 0.4, -rh * 0.44);
      ctx.moveTo(pR2X * 0.78, pR2Y * 0.8);
      ctx.quadraticCurveTo(rw * 0.35, -rh * 0.45, rw * 0.15, -rh * 0.26);
      ctx.stroke();

      // Sunlit ridge rim highlight along the upper-left crest and inner cleavage lip
      ctx.strokeStyle =
        state.rainIntensity > 0.05
          ? 'rgba(224, 242, 254, 0.82)'
          : isNight
          ? 'rgba(148, 163, 184, 0.45)'
          : 'rgba(255, 255, 255, 0.62)';
      ctx.lineWidth = isMain ? 1.25 : 0.95;
      ctx.beginPath();
      ctx.moveTo(pL1X * 0.92, pL1Y * 0.95);
      ctx.quadraticCurveTo(pL2X * 0.92, pL2Y * 0.96, pTopX, pTopY + 0.8);
      ctx.quadraticCurveTo(pR3X * 0.7, pR3Y * 0.92, peakX * 0.45, -rh * 0.46);
      ctx.stroke();

      ctx.restore();

      // Crisp natural stone outer contour stroke
      traceOrganicContour();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = isMain ? 1.55 : 1.25;
      ctx.stroke();
      ctx.restore();
    };

    // Draw rear-left companion cobble stone on all road & bridge rocks for full 3D boulder visibility
    renderOrganicRockBody(
      -hw * 0.68,
      0.8,
      hw * 0.48,
      sh * 0.54,
      h2,
      h3,
      h1,
      false
    );

    // Draw main central 3D boulder
    renderOrganicRockBody(0, 0, hw, sh, h1, h2, h3, true);

    // Draw foreground-right nestled companion cobble stone on all road & bridge rocks
    renderOrganicRockBody(
      hw * 0.66,
      1.2,
      hw * 0.45,
      sh * 0.48,
      h3,
      h1,
      h2,
      false
    );

    // Realistic raindrop impact splashes & water runoff over the 3D boulder crown
    if (state.rainIntensity > 0.05) {
      const stRainAlpha = Math.min(0.85, 0.38 + state.rainIntensity * 0.42);
      ctx.strokeStyle = `rgba(224, 242, 254, ${stRainAlpha})`;
      ctx.fillStyle = `rgba(186, 230, 253, ${stRainAlpha})`;
      ctx.lineWidth = 1.2;
      const peakX = (h3 - 0.5) * hw * 0.32;
      const stoneSplashPts = [
        { x: peakX, y: -sh, s: 0.3 },
        { x: -hw * 0.42, y: -sh * 0.74, s: 1.7 },
        { x: hw * 0.44, y: -sh * 0.7, s: 3.1 },
      ];
      ctx.beginPath();
      for (let spIdx = 0; spIdx < stoneSplashPts.length; spIdx++) {
        const sp = stoneSplashPts[spIdx];
        const phase = (timeSec * 7.4 + seedId * 2.9 + sp.s) % 1;
        if (phase < 0.66) {
          const pNorm = phase / 0.66;
          const spreadX = 1.8 + pNorm * 4.8;
          const liftY = (1 - pNorm) * 5.0;
          ctx.moveTo(sp.x, sp.y);
          ctx.lineTo(sp.x - spreadX, sp.y - liftY);
          ctx.moveTo(sp.x, sp.y);
          ctx.lineTo(sp.x + spreadX, sp.y - liftY);
        } else {
          const dNorm = (phase - 0.66) / 0.34;
          const trickleX = sp.x + (spIdx % 2 === 0 ? -1 : 1) * dNorm * 3.0;
          const trickleY = sp.y + dNorm * (sh * 0.72);
          ctx.moveTo(trickleX, trickleY);
          ctx.lineTo(trickleX, trickleY + 2.6);
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  // 1. Track Rock Obstacles rendered on the road at a standardized uniform MEDIUM size (never on or near bridge pillars!)
  for (const obs of visibleObstacles) {
    if (
      obs.type === 'rock_small' ||
      obs.type === 'rock_medium' ||
      obs.type === 'rock_large'
    ) {
      if (isNearBridgeFast(obs.x, 220, visibleObstacles)) continue;
      const surf = getEffectiveSurfaceInfo(obs.x, map, state, timeSec);
      if (surf.onBridge) continue;
      const gy = surf.y + 2.5;
      const slope = getEffectiveSlope(obs.x, map, state, timeSec);
      const hw = 12.5;
      const rh = 10.5;
      const f0 = obs.rockFacets[0] ?? 0.9;
      const f1 = obs.rockFacets[1] ?? 1.05;
      const f2 = obs.rockFacets[2] ?? 0.95;
      drawRealistic3DBoulderCluster(
        obs.x,
        gy,
        slope,
        hw,
        rh,
        f0 * 0.5,
        f1 * 0.5,
        f2 * 0.5,
        false,
        obs.id
      );
    }
  }

  // 2. Spaced Uniform MEDIUM Roadside Rocks/Boulders Along the Track
  //    (100% free of any rocks near or attached to the suspension bridge pillars!)
  const stoneCellSpacing = ROAD_STONE_CELL_SPACING;
  const firstStoneCell = Math.max(
    1,
    Math.floor((startWorldX - 360) / stoneCellSpacing)
  );
  const lastStoneCell = Math.ceil((endWorldX + 460) / stoneCellSpacing);

  for (let cellIdx = firstStoneCell; cellIdx <= lastStoneCell; cellIdx++) {
    const st = getRoadStoneAtCell(cellIdx, state.obstacles);
    if (!st) continue;
    const stoneX = st.stoneX;
    if (stoneX < startWorldX - 80 || stoneX > endWorldX + 80) continue;
    if (isNearBridgeFast(stoneX, 220, visibleObstacles)) continue;

    const surfInfo = getEffectiveSurfaceInfo(stoneX, map, state, timeSec);
    if (surfInfo.onBridge) continue;
    // Positioned cleanly on the road surface at the exact same base depth (surfInfo.y + 2.5) as track rock obstacles
    const stoneGy = surfInfo.y + 2.5;
    const stoneSlope = getEffectiveSlope(stoneX, map, state, timeSec);

    drawRealistic3DBoulderCluster(
      stoneX,
      stoneGy,
      stoneSlope,
      st.stoneHalfW,
      st.stoneH,
      st.h1,
      st.h2,
      st.h3,
      false,
      cellIdx
    );
  }
}

/**
 * Renders a stylish Movable Wooden / Drawbridge & Dynamic Suspension Bridge over track drops/pits,
 * synchronized 1:1 with the physical drivable surface in `getEffectiveSurfaceInfo`.
 */
function drawMovableWoodenBridge(
  ctx: CanvasRenderingContext2D,
  obs: TrackObstacle,
  state: PhysicsState,
  map: MapConfig,
  timeSec: number
): void {
  const halfW = obs.width * 0.5;
  const leftBankX = obs.x - halfW;
  const rightBankX = obs.x + halfW;
  const leftY = getTerrainHeight(leftBankX, map);
  const rightY = getTerrainHeight(rightBankX, map);
  const safeBridgeSag = Number.isFinite(obs.bridgeSag) ? obs.bridgeSag : 0;

  const getBridgeDeckY = (wx: number): number => {
    const t = Math.max(0, Math.min(1, (wx - leftBankX) / obs.width));
    const chordY = leftY + (rightY - leftY) * t;
    const archShape = 0.5 * (1 - Math.cos(t * Math.PI * 2));
    const naturalSag = archShape * 10;
    const windWave =
      Math.sin(timeSec * 2.4 + t * Math.PI * 2.0 + obs.id) * 1.2 * archShape;
    const distFromCar = wx - state.x;
    const localCarPress = Math.exp(-(distFromCar * distFromCar) / 4800);
    const weightSag = archShape * safeBridgeSag * (0.45 + 0.55 * localCarPress);
    return chordY + naturalSag + windWave + weightSag;
  };

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 0. Open Valley Under the Movable Wooden Bridge + Subtle Mountain Fog / Mist Clouds:
  //    All dark floating rocks and underground dirt patterns are removed so the natural
  //    green mountain range background from drawBackground passes continuously underneath the bridge,
  //    accompanied by subtle drifting mountain fog/mist clouds matching the background mountains!
  {
    const valleyTopY = Math.min(leftY, rightY) + 8;
    const valleyBotY = valleyTopY + 265;
    const cycleT =
      ((state.weatherCycleSec % WEATHER_CYCLE_DURATION) + WEATHER_CYCLE_DURATION) %
      WEATHER_CYCLE_DURATION;
    const isWarmMist =
      (cycleT >= 290 && cycleT < 455) || (cycleT >= 15 && cycleT < 90);
    const isNightMist = state.nightFactor > 0.35;

    ctx.save();
    // Clip strictly inside the open valley gorge between the inner pillar faces so no mist/glow bleeds behind the pillar bases!
    ctx.beginPath();
    ctx.moveTo(leftBankX + 8, valleyTopY - 4);
    for (let s = 0; s <= 16; s++) {
      const wx = leftBankX + 8 + (s / 16) * Math.max(10, obs.width - 16);
      ctx.lineTo(wx, getBridgeDeckY(wx) + 4);
    }
    ctx.lineTo(rightBankX - 8, valleyBotY);
    ctx.lineTo(leftBankX + 8, valleyBotY);
    ctx.closePath();
    ctx.clip();

    // 0A. Soft Atmospheric Valley Mist Veil blending seamlessly with the green mountain range (strictly neutral mist — zero yellow glow behind pillars!)
    const mistVeilGrad = ctx.createLinearGradient(0, valleyTopY, 0, valleyBotY);
    if (isNightMist) {
      mistVeilGrad.addColorStop(0, 'rgba(148, 163, 184, 0)');
      mistVeilGrad.addColorStop(0.28, 'rgba(186, 230, 253, 0.34)');
      mistVeilGrad.addColorStop(0.62, 'rgba(148, 163, 184, 0.42)');
      mistVeilGrad.addColorStop(1, 'rgba(30, 41, 59, 0)');
    } else {
      mistVeilGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      mistVeilGrad.addColorStop(0.26, 'rgba(241, 245, 249, 0.48)');
      mistVeilGrad.addColorStop(0.6, 'rgba(226, 232, 240, 0.54)');
      mistVeilGrad.addColorStop(1, 'rgba(203, 213, 225, 0)');
    }
    ctx.fillStyle = mistVeilGrad;
    ctx.fillRect(
      leftBankX + 8,
      valleyTopY,
      Math.max(10, obs.width - 16),
      valleyBotY - valleyTopY
    );

    // 0B. Drifting Volumetric Mountain Fog/Mist Clouds under the Bridge (matches background mountain clouds!)
    if (volumetricCloudCanvases.length > 0) {
      for (let m = 0; m < 4; m++) {
        const cloudSprite =
          volumetricCloudCanvases[(m + obs.id) % volumetricCloudCanvases.length];
        const cw = 185 + (m % 2) * 45;
        const ch = 74 + (m % 2) * 18;
        const drift = Math.sin(timeSec * (0.45 + m * 0.14) + m * 1.9 + obs.id) * 34;
        const mx =
          leftBankX -
          25 +
          (m / 3) * (obs.width - cw * 0.45) +
          drift;
        const my = valleyTopY + 14 + m * 36;
        ctx.globalAlpha = isNightMist ? 0.44 : 0.62;
        ctx.drawImage(cloudSprite, mx, my, cw, ch);
      }
    }

    // 0C. Soft Billowing Mountain Mist Cushions in the Gorge
    const mistPuffs = [
      { rx: 0.2, dy: 42, rw: 115, rh: 32, spd: 0.55 },
      { rx: 0.52, dy: 68, rw: 135, rh: 38, spd: -0.48 },
      { rx: 0.8, dy: 48, rw: 110, rh: 30, spd: 0.62 },
      { rx: 0.36, dy: 112, rw: 145, rh: 42, spd: -0.38 },
      { rx: 0.68, dy: 124, rw: 130, rh: 36, spd: 0.44 },
    ];
    for (let i = 0; i < mistPuffs.length; i++) {
      const mp = mistPuffs[i];
      const cx =
        leftBankX +
        obs.width * mp.rx +
        Math.sin(timeSec * mp.spd + i * 2.1) * 24;
      const cy = valleyTopY + mp.dy + Math.cos(timeSec * 0.7 + i) * 5;
      const rad = ctx.createRadialGradient(cx, cy, 4, cx, cy, mp.rw);
      if (isNightMist) {
        rad.addColorStop(0, 'rgba(226, 232, 240, 0.42)');
        rad.addColorStop(0.55, 'rgba(148, 163, 184, 0.24)');
        rad.addColorStop(1, 'rgba(100, 116, 139, 0)');
      } else {
        rad.addColorStop(0, 'rgba(255, 255, 255, 0.64)');
        rad.addColorStop(0.55, 'rgba(241, 245, 249, 0.36)');
        rad.addColorStop(1, 'rgba(226, 232, 240, 0)');
      }
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = rad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, mp.rw, mp.rh, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 1. Drawbridge Rear Timber Tower Pillars & Far-Side Cables (Extended downward to anchor deeply into ground base!)
  const drawRearAbutmentPier = (bankX: number, bankY: number) => {
    // Far-side rear timber tower pillar (extended down into the ground base so it never floats)
    const rearTowerTopY = bankY - 72;
    const rearTowerHeight = 116;
    ctx.fillStyle = '#451A03';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(bankX - 11, rearTowerTopY, 12, rearTowerHeight, 3);
    ctx.fill();
    ctx.stroke();

    // Rear timber ground-anchor collar at pillar base
    ctx.fillStyle = '#3B1804';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bankX - 13, bankY - 4, 16, 46, 3);
    ctx.fill();
    ctx.stroke();
  };

  drawRearAbutmentPier(leftBankX, leftY);
  drawRearAbutmentPier(rightBankX, rightY);

  const leftTowerTopY = leftY - 68;
  const rightTowerTopY = rightY - 68;
  const bridgeLightState = getStreetLightState(state.weatherCycleSec);

  // Far-side rear suspension cable & rear wooden safety rail (behind the car!)
  // Dynamically coupled to the bridge deck sag and vehicle load so the main cable flexes with the bridge!
  const getRearCableY = (wx: number): number => {
    const t = Math.max(0, Math.min(1, (wx - leftBankX) / obs.width));
    const topChord = leftTowerTopY + (rightTowerTopY - leftTowerTopY) * t;
    const deckY = getBridgeDeckY(wx);
    const baseDeckChord = leftY + (rightY - leftY) * t;
    const dynamicDeckDisp = deckY - baseDeckChord;
    const sag = Math.sin(t * Math.PI) * 34 + dynamicDeckDisp * 0.68;
    return Math.min(deckY - 18, topChord + sag - 6);
  };

  // Rear vertical suspension ropes connected directly to the exact mount & base of every rear bridge post!
  const plankStep = 16;
  let rearRopeIdx = 0;
  for (let px = leftBankX + 6; px <= rightBankX - 6; px += plankStep) {
    if (rearRopeIdx % 2 === 1) {
      const py = getBridgeDeckY(px);
      const nextPy = getBridgeDeckY(Math.min(rightBankX, px + 8));
      const pAngle = Math.atan2(nextPy - py, 8);
      const cosP = Math.cos(pAngle);
      const sinP = Math.sin(pAngle);
      // Exact world coordinates of the rear post top mount (-1.5, -21) and rear post base (-1.5, -1)
      const postTopX = px - 1.5 * cosP + 21 * sinP;
      const postTopY = py + 2 - 1.5 * sinP - 21 * cosP;
      const postBaseX = px - 1.5 * cosP + 1 * sinP;
      const postBaseY = py + 2 - 1.5 * sinP - 1 * cosP;
      const topCabX = px - 1.5;
      const topCabY = getRearCableY(topCabX);
      const distCar = px - state.x;
      const carWave =
        Math.sin(distCar * 0.08 - timeSec * 7.5) *
        Math.exp(-(distCar * distCar) / 4200) *
        (0.9 + Math.min(2.2, Math.abs(state.vx) * 0.01) + safeBridgeSag * 0.12);
      const windSway =
        Math.sin(timeSec * 4.1 + rearRopeIdx * 0.9 + obs.id) * 0.7;
      const midX = (topCabX + postTopX) * 0.5 + (carWave + windSway) * 0.45;
      const midY = (topCabY + postTopY) * 0.5;

      ctx.strokeStyle = 'rgba(71, 85, 105, 0.82)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(topCabX, topCabY);
      ctx.quadraticCurveTo(midX, midY, postTopX, postTopY);
      ctx.lineTo(postBaseX, postBaseY);
      ctx.stroke();

      // Rope clamp rings on main rear cable, post top mount, and post base mount
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(topCabX, topCabY, 1.8, 0, Math.PI * 2);
      ctx.arc(postTopX, postTopY, 1.7, 0, Math.PI * 2);
      ctx.arc(postBaseX, postBaseY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    rearRopeIdx++;
  }

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  for (let s = 0; s <= 24; s++) {
    const wx = leftBankX + (s / 24) * obs.width;
    const cy = getRearCableY(wx);
    if (s === 0) ctx.moveTo(wx, cy);
    else ctx.lineTo(wx, cy);
  }
  ctx.stroke();

  // Rear-side wooden handrail (behind the car)
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  for (let s = 0; s <= 24; s++) {
    const wx = leftBankX + (s / 24) * obs.width;
    const dy = getBridgeDeckY(wx) - 19;
    if (s === 0) ctx.moveTo(wx, dy);
    else ctx.lineTo(wx, dy);
  }
  ctx.stroke();

  // 2. Flexible Steel Under-Deck Support Beam
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 10;
  ctx.beginPath();
  for (let s = 0; s <= 24; s++) {
    const wx = leftBankX + (s / 24) * obs.width;
    const dy = getBridgeDeckY(wx) + 8;
    if (s === 0) ctx.moveTo(wx, dy);
    else ctx.lineTo(wx, dy);
  }
  ctx.stroke();

  // 3. Articulated Hardwood Bridge Planks along the Dynamic Span (Car wheels drive directly on this deck!)
  let pIdx = 0;
  for (let px = leftBankX + 6; px <= rightBankX - 6; px += plankStep) {
    const py = getBridgeDeckY(px);
    const nextPy = getBridgeDeckY(Math.min(rightBankX, px + 8));
    const pAngle = Math.atan2(nextPy - py, 8);

    ctx.save();
    ctx.translate(px, py + 2);
    ctx.rotate(pAngle);

    // Rear-side baluster post (behind the car — zero rear light cone or halo behind wooden posts/pillars!)
    if (pIdx % 2 === 1 && px >= leftBankX + 20 && px <= rightBankX - 20) {
      ctx.fillStyle = '#451A03';
      ctx.fillRect(-3.5, -21, 4, 18);
    }

    // Thick hardwood plank body
    ctx.fillStyle = pIdx % 2 === 0 ? '#B45309' : '#92400E';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-6.5, -3.5, 13, 9, 2.5);
    ctx.fill();
    ctx.stroke();

    // Sunlit wood grain top bevel
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-5, -2.5, 10, 2.2);

    // Metallic rivet bolt head
    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.arc(0, 1.5, 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    pIdx++;
  }

  ctx.restore();
}

/**
 * Renders the FOREGROUND structure of the Movable Wooden Drawbridge (Front Guardrail Handrail,
 * Front Vertical Balusters, Front Suspension Cables & Hanger Rods, Diagonal Hoist Chains, and
 * Front Abutment Tower Arches with Pulley Wheels) AFTER `renderVehicle3D` so the car drives
 * INSIDE the bridge structure rather than floating on top of it!
 */
function drawMovableWoodenBridgeForeground(
  ctx: CanvasRenderingContext2D,
  obs: TrackObstacle,
  state: PhysicsState,
  map: MapConfig,
  timeSec: number
): void {
  const halfW = obs.width * 0.5;
  const leftBankX = obs.x - halfW;
  const rightBankX = obs.x + halfW;
  const leftY = getTerrainHeight(leftBankX, map);
  const rightY = getTerrainHeight(rightBankX, map);
  const safeBridgeSag = Number.isFinite(obs.bridgeSag) ? obs.bridgeSag : 0;

  const getBridgeDeckY = (wx: number): number => {
    const t = Math.max(0, Math.min(1, (wx - leftBankX) / obs.width));
    const chordY = leftY + (rightY - leftY) * t;
    const archShape = 0.5 * (1 - Math.cos(t * Math.PI * 2));
    const naturalSag = archShape * 10;
    const windWave =
      Math.sin(timeSec * 2.4 + t * Math.PI * 2.0 + obs.id) * 1.2 * archShape;
    const distFromCar = wx - state.x;
    const localCarPress = Math.exp(-(distFromCar * distFromCar) / 4800);
    const weightSag = archShape * safeBridgeSag * (0.45 + 0.55 * localCarPress);
    return chordY + naturalSag + windWave + weightSag;
  };

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const bridgeLightState = getStreetLightState(state.weatherCycleSec);

  // Unified Bridge Lamp Renderer: guarantees 100% identical bright golden/warm glowing tone
  // across BOTH the main pillar lamps and the small lights along the center deck of the bridge,
  // with zero downward light cone/beam behind the wooden pillars!
  const drawUnifiedBridgeLamp = (
    lx: number,
    ly: number,
    boxW: number,
    boxH: number,
    haloRadius: number,
    bulbRadius: number
  ) => {
    // 1. Dark metallic lamp housing bracket (drawn FIRST so it never blocks the golden glow center)
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(lx - boxW * 0.5, ly - boxH * 0.5, boxW, boxH, 2.2);
    ctx.fill();
    ctx.stroke();

    if (bridgeLightState.isOn && bridgeLightState.intensity > 0.01) {
      const bInten = bridgeLightState.intensity;
      // 2. Uniform bright golden/warm radial glow aura rendered ON TOP of the housing
      const lampHalo = ctx.createRadialGradient(
        lx,
        ly,
        1.5,
        lx,
        ly,
        haloRadius
      );
      lampHalo.addColorStop(0, `rgba(255, 251, 235, ${0.96 * bInten})`);
      lampHalo.addColorStop(0.36, `rgba(253, 224, 71, ${0.65 * bInten})`);
      lampHalo.addColorStop(0.7, `rgba(245, 158, 11, ${0.28 * bInten})`);
      lampHalo.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = lampHalo;
      ctx.beginPath();
      ctx.arc(lx, ly, haloRadius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Warm golden outer bulb ring + bright warm-white core
      ctx.fillStyle = `rgba(254, 240, 138, ${0.98 * bInten})`;
      ctx.beginPath();
      ctx.arc(lx, ly, bulbRadius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${0.98 * bInten})`;
      ctx.beginPath();
      ctx.arc(lx, ly, bulbRadius * 0.82, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Unlit daytime bulb lens
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(lx, ly, bulbRadius * 0.88, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawFrontAbutmentTower = (bankX: number, bankY: number, isLeft: boolean) => {
    const dir = isLeft ? -1 : 1;
    // Vertical Timber & Iron Drawbridge Front Tower Pillar / Arch Frame (Extended downward into ground base!)
    const towerTopY = bankY - 68;
    const frontTowerHeight = 112;
    const towerGrad = ctx.createLinearGradient(
      bankX - 8,
      towerTopY,
      bankX + 8,
      towerTopY + frontTowerHeight
    );
    towerGrad.addColorStop(0, '#92400E');
    towerGrad.addColorStop(0.5, '#78350F');
    towerGrad.addColorStop(1, '#451A03');
    ctx.fillStyle = towerGrad;
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bankX - 8, towerTopY, 16, frontTowerHeight, 4);
    ctx.fill();
    ctx.stroke();

    // Anchored stone & timber footing collar at the bottom of the front pillar
    ctx.fillStyle = '#5C2808';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(bankX - 11, bankY - 2, 22, 44, 3);
    ctx.fill();
    ctx.stroke();

    // Overhead Portal Arch Crossbeam connecting Rear & Front Tower Pillars above the Car!
    ctx.fillStyle = '#78350F';
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(bankX - 12, towerTopY - 6, 22, 8, 3);
    ctx.fill();
    ctx.stroke();

    // Steel reinforcement bands on tower (including lower ground-anchoring bands)
    ctx.fillStyle = '#64748B';
    ctx.fillRect(bankX - 9, towerTopY + 14, 18, 4);
    ctx.fillRect(bankX - 9, towerTopY + 36, 18, 4);
    ctx.fillRect(bankX - 9, towerTopY + 58, 18, 4);
    ctx.fillRect(bankX - 12, towerTopY + 78, 24, 4);
    ctx.fillRect(bankX - 12, towerTopY + 96, 24, 4);

    // Mechanical Rotating Drawbridge Pulley Wheel at Tower Top
    const wheelY = towerTopY + 4;
    ctx.save();
    ctx.translate(bankX, wheelY);
    ctx.rotate(timeSec * 1.6 * dir + safeBridgeSag * 0.08 * dir);
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.8;
    for (let sp = 0; sp < 4; sp++) {
      const a = (sp * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * -8, Math.sin(a) * -8);
      ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.stroke();
    }
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Main Pillar Lamp at Tower Crown (uses unified golden/warm bridge lamp style)
    drawUnifiedBridgeLamp(bankX, towerTopY - 10, 11, 9, 26, 3.6);
  };

  const leftTowerTopY = leftY - 64;
  const rightTowerTopY = rightY - 64;

  // Dynamic Front Main Suspension Cable coupled to bridge deck physics
  const getCableY = (wx: number): number => {
    const t = Math.max(0, Math.min(1, (wx - leftBankX) / obs.width));
    const topChord = leftTowerTopY + (rightTowerTopY - leftTowerTopY) * t;
    const deckY = getBridgeDeckY(wx);
    const baseDeckChord = leftY + (rightY - leftY) * t;
    const dynamicDeckDisp = deckY - baseDeckChord;
    const sag = Math.sin(t * Math.PI) * 34 + dynamicDeckDisp * 0.72;
    return Math.min(deckY - 14, topChord + sag);
  };

  // 1. Front Vertical Wooden Bridge Light Posts along the Center Deck (strictly clear of the main left/right support pillars!)
  const plankStep = 16;
  let pIdx = 0;
  for (let px = leftBankX + 6; px <= rightBankX - 6; px += plankStep) {
    if (pIdx % 2 === 0 && px >= leftBankX + 20 && px <= rightBankX - 20) {
      const py = getBridgeDeckY(px);
      const nextPy = getBridgeDeckY(Math.min(rightBankX, px + 8));
      const pAngle = Math.atan2(nextPy - py, 8);
      ctx.save();
      ctx.translate(px, py + 2);
      ctx.rotate(pAngle);
      ctx.fillStyle = '#78350F';
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 1;
      ctx.fillRect(-2.5, -17, 5, 16);
      ctx.strokeRect(-2.5, -17, 5, 16);
      // Steel post base mounting bracket on the wooden plank
      ctx.fillStyle = '#334155';
      ctx.fillRect(-3.8, -2.5, 7.6, 3.0);
      ctx.restore();
    }
    pIdx++;
  }

  // 2. Dynamic Suspension Support Cables connected directly to the exact Light Fixture Mount AND Light Post Base Mount!
  let ropeIdx = 0;
  for (let px = leftBankX + 6; px <= rightBankX - 6; px += plankStep) {
    if (ropeIdx % 2 === 0 && px >= leftBankX + 20 && px <= rightBankX - 20) {
      const py = getBridgeDeckY(px);
      const nextPy = getBridgeDeckY(Math.min(rightBankX, px + 8));
      const pAngle = Math.atan2(nextPy - py, 8);
      const sinP = Math.sin(pAngle);
      const cosP = Math.cos(pAngle);
      // Exact world coordinates of the bridge light fixture mount (top of post: local y = -16) and post base mount (local y = -1)
      const lampMountX = px + sinP * 16;
      const lampMountY = py + 2 - cosP * 16;
      const postBaseX = px + sinP * 1.2;
      const postBaseY = py + 2 - cosP * 1.2;
      const topCabY = getCableY(px);

      // Subtle tensioned rope flex between main catenary cable (px, topCabY) and the exact light fixture mount (lampMountX, lampMountY - 2)
      const distCar = px - state.x;
      const carProximity = Math.exp(-(distCar * distCar) / 3800);
      const ropeFlexWave =
        Math.sin(distCar * 0.085 - timeSec * 8.2) *
        carProximity *
        (1.1 + Math.min(2.4, Math.abs(state.vx) * 0.012) + safeBridgeSag * 0.14);
      const breezeFlex =
        Math.sin(timeSec * 3.8 + ropeIdx * 0.75 + obs.id) * 0.75;
      const ctrlX =
        (px + lampMountX) * 0.5 + (ropeFlexWave + breezeFlex) * 0.45;
      const ctrlY = (topCabY + (lampMountY - 2)) * 0.5;

      // Outer braided cable shadow connecting to light fixture mount AND continuing along the post to the post base mount
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.88)';
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(px, topCabY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, lampMountX, lampMountY - 2);
      ctx.lineTo(postBaseX, postBaseY);
      ctx.stroke();

      // Inner tensioned suspension cable highlight
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.94)';
      ctx.lineWidth = 1.65;
      ctx.beginPath();
      ctx.moveTo(px, topCabY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, lampMountX, lampMountY - 2);
      ctx.lineTo(postBaseX, postBaseY);
      ctx.stroke();

      // Top catenary clevis clamp, light fixture mount shackle ring, and bottom post-base anchor ring
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(px, topCabY, 2.4, 0, Math.PI * 2);
      ctx.arc(lampMountX, lampMountY - 2.2, 2.2, 0, Math.PI * 2);
      ctx.arc(postBaseX, postBaseY, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ropeIdx++;
  }

  // 3. Front Wooden Safety Side Handrail (In front of the car!)
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 6.2;
  ctx.beginPath();
  for (let s = 0; s <= 24; s++) {
    const wx = leftBankX + (s / 24) * obs.width;
    const dy = getBridgeDeckY(wx) - 14;
    if (s === 0) ctx.moveTo(wx, dy);
    else ctx.lineTo(wx, dy);
  }
  ctx.stroke();

  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 3.8;
  ctx.stroke();

  // 3B. Continuous Front Main Suspension Cable Catenary (Rendered BEFORE the bridge deck lamps so the grey cable never covers or dulls the golden bulbs!)
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  for (let s = 0; s <= 24; s++) {
    const wx = leftBankX + (s / 24) * obs.width;
    const cy = getCableY(wx);
    if (s === 0) ctx.moveTo(wx, cy);
    else ctx.lineTo(wx, cy);
  }
  ctx.stroke();

  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 4. Draw the Left & Right Front Abutment Towers on top of the cable ends
  drawFrontAbutmentTower(leftBankX, leftY, true);
  drawFrontAbutmentTower(rightBankX, rightY, false);

  // 4B. Small Bridge Deck Lights Along the Center Deck (Rendered AFTER the main suspension cable & handrail using the exact same bright golden/warm glowing tone as the main pillar lamps, with zero downward light cone!)
  {
    let lIdx = 0;
    for (let px = leftBankX + 6; px <= rightBankX - 6; px += plankStep) {
      if (lIdx % 2 === 0 && px >= leftBankX + 20 && px <= rightBankX - 20) {
        const py = getBridgeDeckY(px);
        const nextPy = getBridgeDeckY(Math.min(rightBankX, px + 8));
        const pAngle = Math.atan2(nextPy - py, 8);
        const lampX = px + Math.sin(pAngle) * 16;
        const lampY = py + 2 - Math.cos(pAngle) * 16;

        drawUnifiedBridgeLamp(lampX, lampY - 1, 8.5, 5.8, 20, 2.9);
      }
      lIdx++;
    }
  }

  // 5. Natural Rain Collisions, Splash Crowns, Bouncing Droplets & Water Drips on the Moving Drawbridge Structure
  if (state.rainIntensity > 0.05) {
    const brRainAlpha = Math.min(0.65, 0.32 + state.rainIntensity * 0.42);
    ctx.strokeStyle = `rgba(224, 242, 254, ${brRainAlpha})`;
    ctx.fillStyle = `rgba(186, 230, 253, ${brRainAlpha})`;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    let sIdx = 0;
    for (let px = leftBankX + 8; px <= rightBankX - 8; px += 18) {
      const deckY = getBridgeDeckY(px);
      const railY = deckY - 14;
      const cabY = getCableY(px);
      const phaseDeck = (timeSec * 7.2 + px * 0.17 + obs.id) % 1;
      const phaseRail = (timeSec * 6.8 + px * 0.23 + obs.id + 1.7) % 1;
      const phaseCab = (timeSec * 7.5 + px * 0.13 + obs.id + 3.1) % 1;

      if (phaseDeck < 0.64) {
        const sp = phaseDeck / 0.64;
        const spread = 2.0 + sp * 5.2;
        const lift = (1 - sp) * 4.8;
        ctx.moveTo(px, deckY - 1.5);
        ctx.lineTo(px - spread, deckY - 1.5 - lift);
        ctx.moveTo(px, deckY - 1.5);
        ctx.lineTo(px + spread, deckY - 1.5 - lift);
      } else {
        const dp = (phaseDeck - 0.64) / 0.36;
        const dripY = deckY + 8 + dp * 18;
        ctx.moveTo(px, dripY);
        ctx.lineTo(px - 0.6, dripY + 4.8);
      }

      if (sIdx % 2 === 0 && phaseRail < 0.62) {
        const sp = phaseRail / 0.62;
        const spread = 1.8 + sp * 4.2;
        const lift = (1 - sp) * 4.4;
        ctx.moveTo(px, railY);
        ctx.lineTo(px - spread, railY - lift);
        ctx.moveTo(px, railY);
        ctx.lineTo(px + spread, railY - lift);
      }

      if (sIdx % 2 === 1 && phaseCab < 0.6) {
        const sp = phaseCab / 0.6;
        const spread = 1.6 + sp * 4.0;
        const lift = (1 - sp) * 4.2;
        ctx.moveTo(px, cabY);
        ctx.lineTo(px - spread, cabY - lift);
        ctx.moveTo(px, cabY);
        ctx.lineTo(px + spread, cabY - lift);
      }
      sIdx++;
    }

    const bridgeMechPoints = [
      { x: leftBankX, y: leftY - 76, seed: 1.1 },
      { x: leftBankX - 7, y: leftY - 64, seed: 1.9 },
      { x: leftBankX + 7, y: leftY - 64, seed: 2.7 },
      { x: leftBankX - 6, y: leftY - 46, seed: 3.5 },
      { x: leftBankX + 6, y: leftY - 28, seed: 4.3 },
      { x: rightBankX, y: rightY - 76, seed: 6.7 },
      { x: rightBankX - 7, y: rightY - 64, seed: 7.5 },
      { x: rightBankX + 7, y: rightY - 64, seed: 8.3 },
      { x: rightBankX - 6, y: rightY - 46, seed: 9.1 },
      { x: rightBankX + 6, y: rightY - 28, seed: 9.9 },
      { x: leftBankX + 28, y: (leftTowerTopY + leftY) * 0.5, seed: 12.3 },
      { x: rightBankX - 28, y: (rightTowerTopY + rightY) * 0.5, seed: 13.1 },
    ];
    for (let bm = 0; bm < bridgeMechPoints.length; bm++) {
      const pt = bridgeMechPoints[bm];
      const phase = (timeSec * 7.0 + obs.id * 1.9 + pt.seed) % 1;
      if (phase < 0.64) {
        const sp = phase / 0.64;
        const spread = 1.8 + sp * 4.8;
        const lift = (1 - sp) * 4.8;
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - spread, pt.y - lift);
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x + spread, pt.y - lift);
      }
    }
    ctx.stroke();

    ctx.beginPath();
    for (let px = leftBankX + 14; px <= rightBankX - 14; px += 28) {
      const deckY = getBridgeDeckY(px);
      const phase = (timeSec * 7.2 + px * 0.17 + obs.id) % 1;
      if (phase < 0.56) {
        const sp = phase / 0.56;
        const by = deckY - 2 - Math.sin(sp * Math.PI) * 5.6;
        ctx.moveTo(px - sp * 4.2 + 1.1, by);
        ctx.arc(px - sp * 4.2, by, 1.1, 0, Math.PI * 2);
        ctx.moveTo(px + sp * 4.2 + 1.1, by);
        ctx.arc(px + sp * 4.2, by, 1.1, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// EXPLICIT CELESTIAL SUN OBJECT & MOON OBJECT + DYNAMIC SKY & STATIC MOUNTAIN RENDERER
// - SunObject: Visible radiant Sun orb rising slowly from behind the mountains in
//   Morning/Sunrise with warm orange sky, centered at Noon in clear blue sky,
//   and descending behind the mountains at Sunset (Maghrib).
// - MoonObject: Visible glowing silvery Moon orb rising at Sunset & Night with
//   dark starry sky and soft moonlight illumination.
// - Static Mountain Layer: Rendered with a locked static matrix transform at (0, 0, width, height)
//   AFTER the Sun & Moon so the mountain peaks naturally occlude the rising/setting Sun!
// ============================================================================
export interface CelestialOrbState {
  visible: boolean;
  x: number;
  y: number;
  radius: number;
  alpha: number;
  isWarmLow: boolean;
  arcHeight: number;
}

export function computeCelestialSunAndMoon(
  weatherCycleSec: number,
  width: number,
  height: number,
  cloudDarkness: number
): { sunObj: CelestialOrbState; moonObj: CelestialOrbState } {
  const cycleT =
    ((weatherCycleSec % WEATHER_CYCLE_DURATION) + WEATHER_CYCLE_DURATION) %
    WEATHER_CYCLE_DURATION;

  // SUN OBJECT: Smooth solar arc across the sky during Dawn, Morning, Noon, Afternoon & Sunset (0..465s)
  // Always 100% solid/opaque (alpha = 1.0) whenever visible so background mountains never show through the sun disk!
  const sunVisible = cycleT < 455;
  const sunProgress = Math.max(0, Math.min(1, cycleT / 450)); // 0 at Dawn -> 0.5 at Noon -> 1 at Sunset
  const sunX = width * (0.82 - sunProgress * 0.56);
  const sunArc = Math.sin(sunProgress * Math.PI); // 0 at horizon -> 1 at zenith
  const sunY = height * (0.26 - sunArc * 0.15);
  const isWarmLow = cycleT < 135 || cycleT >= 340;
  const sunAlpha = sunVisible ? 1.0 : 0;

  // MOON OBJECT: Smooth lunar arc across the starry night sky during late Sunset, Evening, Night & early Dawn (390..630s & 0..35s)
  const moonVisible = cycleT >= 390 || cycleT <= 35;
  const rawMoonT = cycleT >= 390 ? cycleT - 390 : cycleT + (630 - 390); // 0..275
  const moonProgress = Math.max(0, Math.min(1, rawMoonT / 275));
  const moonX = width * (0.8 - moonProgress * 0.48);
  const moonArc = Math.sin(moonProgress * Math.PI);
  const moonY = height * (0.32 - moonArc * 0.19);
  let moonAlpha = 0;
  if (moonVisible) {
    const fadeIn = rawMoonT < 50 ? rawMoonT / 50 : 1;
    const fadeOut = rawMoonT > 225 ? Math.max(0, (275 - rawMoonT) / 50) : 1;
    moonAlpha = Math.min(1, fadeIn * fadeOut * (1 - cloudDarkness * 0.15));
  }

  return {
    sunObj: {
      visible: sunVisible,
      x: sunX,
      y: sunY,
      radius: 42,
      alpha: sunAlpha,
      isWarmLow,
      arcHeight: sunArc,
    },
    moonObj: {
      visible: moonVisible,
      x: moonX,
      y: moonY,
      radius: 36,
      alpha: moonAlpha,
      isWarmLow: false,
      arcHeight: moonArc,
    },
  };
}

// Dynamic Day / Sunset / Night / Dawn Sky, Twinkling Stars, Sun, Moon & Mountain Renderer
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weatherCycleSec: number,
  nightAmt: number,
  cloudDarkness: number,
  lightningFlash: number,
  timeSec: number,
  playerDistance: number = 0,
  isPlaying: boolean = false,
  _carSpeed: number = 0
): void {
  ensureEnvironmentAssetsReady();
  const canvas = { width: Math.floor(width), height: Math.floor(height) };
  const bgImages = staticBackgroundImages;
  const weatherInfo = getWeatherPhaseInfo(weatherCycleSec);
  const celestials = computeCelestialSunAndMoon(
    weatherCycleSec,
    canvas.width,
    canvas.height,
    cloudDarkness
  );

  // Lock screen-space transform matrix & enable high-quality Canvas smoothing
  const staticScreenMatrix = ctx.getTransform();
  ctx.save();
  ctx.setTransform(staticScreenMatrix);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // ============================================================================
  // 1. STATIC & SMOOTH MOUNTAIN BACKGROUND LAYER
  // ============================================================================
  if (bgImages.length > 0) {
    const drawCleanBgImage = (source: HTMLImageElement | HTMLCanvasElement) => {
      if (source instanceof HTMLImageElement && source.naturalWidth > 0 && source.naturalHeight > 0) {
        const cropTop = Math.round(source.naturalHeight * 0.04);
        ctx.drawImage(
          source,
          0,
          cropTop,
          source.naturalWidth,
          source.naturalHeight - cropTop,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else {
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      }
    };

    if (!isPlaying) {
      const menuEntry = bgImages[0];
      const currentImg =
        menuEntry.loaded && menuEntry.img.complete && menuEntry.img.naturalWidth > 0
          ? menuEntry.img
          : menuEntry.fallbackCanvas;

      ctx.globalAlpha = 1.0;
      drawCleanBgImage(currentImg);
    } else {
      const distancePerStage = 180; // Meters per mountain stage
      const fadeZoneRatio = 0.35;   // Smooth cross-fade across the last 35% of each stage
      const bgIndex = Math.floor(playerDistance / distancePerStage) % bgImages.length;
      const nextBgIndex = (bgIndex + 1) % bgImages.length;

      const stageProgress = (playerDistance % distancePerStage) / distancePerStage;
      const rawFade =
        stageProgress > 1 - fadeZoneRatio
          ? (stageProgress - (1 - fadeZoneRatio)) / fadeZoneRatio
          : 0;
      const fadeAlpha = rawFade * rawFade * (3 - 2 * rawFade);

      const currentEntry = bgImages[bgIndex];
      const nextEntry = bgImages[nextBgIndex];

      const currentImg =
        currentEntry.loaded && currentEntry.img.complete && currentEntry.img.naturalWidth > 0
          ? currentEntry.img
          : currentEntry.fallbackCanvas;
      const nextImg =
        nextEntry.loaded && nextEntry.img.complete && nextEntry.img.naturalWidth > 0
          ? nextEntry.img
          : nextEntry.fallbackCanvas;

      ctx.globalAlpha = 1.0;
      drawCleanBgImage(currentImg);

      if (fadeAlpha > 0.001) {
        ctx.globalAlpha = fadeAlpha;
        drawCleanBgImage(nextImg);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  // ============================================================================
  // 1B. REALISTIC DYNAMIC DAY / SUNSET / NIGHT / DAWN SKY ATMOSPHERE GRADIENT
  //     Smoothly blends warm sunrise orange, sunny daytime blue, sunset twilight,
  //     and gentle dark-blue night across the sky without tinting daytime valleys blue!
  // ============================================================================
  {
    ctx.save();
    const skyAtmoGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.62);
    skyAtmoGrad.addColorStop(0, weatherInfo.skyTop);
    skyAtmoGrad.addColorStop(0.48, weatherInfo.skyMid);
    skyAtmoGrad.addColorStop(0.82, weatherInfo.skyBottom);
    skyAtmoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    const skyBlendAlpha = Math.min(
      0.92,
      0.56 + nightAmt * 0.36 + (celestials.sunObj.isWarmLow ? 0.18 : 0)
    );
    ctx.globalAlpha = skyBlendAlpha;
    ctx.fillStyle = skyAtmoGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.64);

    // Uniform full-screen Mountain & Valley Night/Sunset Ambient Shade (Zero daytime blue tint!)
    if (nightAmt > 0.04) {
      ctx.globalAlpha = Math.min(0.68, nightAmt * 0.58);
      ctx.fillStyle = '#081226';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  }

  // ============================================================================
  // 1C. GLOWING TWINKLING STARS IN THE EVENING / NIGHT SKY
  // ============================================================================
  if (nightAmt > 0.06) {
    ctx.save();
    const starVis = Math.min(1, (nightAmt - 0.06) / 0.55);
    const starCount = 68;
    for (let s = 0; s < starCount; s++) {
      const sx = ((s * 137.5 + 43) % 100) * 0.01 * canvas.width;
      const sy = ((s * 73.1 + 19) % 100) * 0.0042 * canvas.height + 8;
      const twinkle =
        0.45 + 0.55 * Math.sin(timeSec * (2.2 + (s % 5) * 0.7) + s * 3.1);
      const alpha = starVis * twinkle;
      if (alpha <= 0.04) continue;

      const starR = s % 7 === 0 ? 2.1 : s % 3 === 0 ? 1.5 : 1.1;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = s % 5 === 0 ? '#BAE6FD' : s % 4 === 0 ? '#FEF08A' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(sx, sy, starR, 0, Math.PI * 2);
      ctx.fill();

      // Crisp 4-point starlight sparkle cross on brighter stars
      if (s % 6 === 0 && twinkle > 0.65) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.0;
        const gl = starR * 3.2;
        ctx.beginPath();
        ctx.moveTo(sx - gl, sy);
        ctx.lineTo(sx + gl, sy);
        ctx.moveTo(sx, sy - gl);
        ctx.lineTo(sx, sy + gl);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ============================================================================
  // 1D. 100% SOLID OPAQUE SUN (OPACITY = 1.0) WITH GLOWING OUTER LIGHT AURA & MOON
  // ============================================================================
  if (celestials.sunObj.visible && celestials.sunObj.alpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';
    const sx = celestials.sunObj.x;
    const sy = celestials.sunObj.y;
    const isWarm = celestials.sunObj.isWarmLow;

    // 1. Ambient atmospheric sunlight bloom over surrounding sky
    const sunBloom = ctx.createRadialGradient(
      sx,
      sy,
      24,
      sx,
      sy,
      canvas.width * 0.52
    );
    sunBloom.addColorStop(
      0,
      isWarm ? 'rgba(251, 146, 60, 0.32)' : 'rgba(254, 249, 195, 0.26)'
    );
    sunBloom.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunBloom;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Glowing Outer Light Aura / Corona Halo
    const sunSprite = isWarm ? sunWarmSpriteCanvas : sunBrightSpriteCanvas;
    if (sunSprite) {
      const drawSize = isWarm ? 300 : 340;
      ctx.globalAlpha = 1.0;
      ctx.drawImage(
        sunSprite,
        sx - drawSize * 0.5,
        sy - drawSize * 0.5,
        drawSize,
        drawSize
      );
    }

    // 3. 100% Solid, Non-Transparent Sun Disk (Opacity = 1.0 — completely occludes background mountains!)
    const solidDiscR = 42;
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = isWarm ? '#FFFBEB' : '#FFFFFF';
    ctx.beginPath();
    ctx.arc(sx, sy, solidDiscR, 0, Math.PI * 2);
    ctx.fill();

    const solidSunGrad = ctx.createRadialGradient(
      sx - 6,
      sy - 6,
      4,
      sx,
      sy,
      solidDiscR
    );
    if (isWarm) {
      solidSunGrad.addColorStop(0, '#FFFFFF');
      solidSunGrad.addColorStop(0.55, '#FEF08A');
      solidSunGrad.addColorStop(0.85, '#FDBA74');
      solidSunGrad.addColorStop(1, '#F97316');
    } else {
      solidSunGrad.addColorStop(0, '#FFFFFF');
      solidSunGrad.addColorStop(0.68, '#FFFBEB');
      solidSunGrad.addColorStop(1, '#FDE047');
    }
    ctx.fillStyle = solidSunGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, solidDiscR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (celestials.moonObj.visible && celestials.moonObj.alpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = celestials.moonObj.alpha;
    if (moonCalmSpriteCanvas) {
      const moonSize = 250;
      ctx.drawImage(
        moonCalmSpriteCanvas,
        celestials.moonObj.x - moonSize * 0.5,
        celestials.moonObj.y - moonSize * 0.5,
        moonSize,
        moonSize
      );
    }
    // Gentle silvery-blue moonlight glow over the night sky
    const moonBloom = ctx.createRadialGradient(
      celestials.moonObj.x,
      celestials.moonObj.y,
      16,
      celestials.moonObj.x,
      celestials.moonObj.y,
      canvas.width * 0.45
    );
    moonBloom.addColorStop(0, 'rgba(186, 230, 253, 0.22)');
    moonBloom.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = moonBloom;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // ============================================================================
  // 2. REALISTIC SMOOTH DRIFTING VOLUMETRIC CLOUDS IN THE UPPER SKY
  //    (Slowly and smoothly drift toward the left side of the screen at a continuous, natural speed)
  // ============================================================================
  if (volumetricCloudCanvases.length > 0) {
    ctx.save();
    const stormDim = Math.max(0.55, 1 - nightAmt * 0.36 - cloudDarkness * 0.18);
    for (let i = 0; i < 5; i++) {
      const cloudImg =
        volumetricCloudCanvases[i % volumetricCloudCanvases.length];
      const cloudW = 230 + (i % 3) * 35;
      const cloudH = 96 + (i % 3) * 14;
      const driftSpeed = 14 + (i % 3) * 4.5; // Continuous natural leftward wind speed (px/sec)
      const parallaxShift = isPlaying ? playerDistance * (1.6 + (i % 3) * 0.5) : 0;
      const spanW = canvas.width + cloudW + 120;
      const initialX = canvas.width * (0.06 + i * 0.22);
      const rawX = initialX - timeSec * driftSpeed - parallaxShift;
      const drawCloudX = ((rawX % spanW) + spanW) % spanW - cloudW - 40;
      const cloudY = canvas.height * (0.02 + (i % 3) * 0.045);
      ctx.globalAlpha = 0.48 * stormDim;
      ctx.drawImage(cloudImg, drawCloudX, cloudY, cloudW, cloudH);
    }
    ctx.restore();
  }

  // ============================================================================
  // 2B. SUBTLE MOUNTAIN VALLEY FOG / MIST LAYER ACROSS MID & LOWER SLOPES
  //     Matches upper mountain clouds and remains visible in the intro scene
  //     and underneath the movable wooden bridge!
  // ============================================================================
  if (volumetricCloudCanvases.length > 0) {
    ctx.save();
    const mistDim = Math.max(0.48, 1 - nightAmt * 0.34 - cloudDarkness * 0.15);
    const valleyMistGrad = ctx.createLinearGradient(
      0,
      canvas.height * 0.4,
      0,
      canvas.height * 0.84
    );
    valleyMistGrad.addColorStop(0, 'rgba(241, 245, 249, 0)');
    valleyMistGrad.addColorStop(
      0.42,
      nightAmt > 0.35
        ? 'rgba(148, 163, 184, 0.22)'
        : celestials.sunObj.isWarmLow
        ? 'rgba(254, 215, 170, 0.26)'
        : 'rgba(241, 245, 249, 0.28)'
    );
    valleyMistGrad.addColorStop(
      0.72,
      nightAmt > 0.35
        ? 'rgba(148, 163, 184, 0.26)'
        : 'rgba(226, 232, 240, 0.32)'
    );
    valleyMistGrad.addColorStop(1, 'rgba(226, 232, 240, 0)');
    ctx.fillStyle = valleyMistGrad;
    ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.44);

    for (let m = 0; m < 6; m++) {
      const mistImg =
        volumetricCloudCanvases[(m + 1) % volumetricCloudCanvases.length];
      const mistW = 280 + (m % 3) * 55;
      const mistH = 92 + (m % 2) * 22;
      const mistSpeed = 9 + (m % 3) * 3.2;
      const parallax = isPlaying ? playerDistance * (1.1 + (m % 2) * 0.4) : 0;
      const spanW = canvas.width + mistW + 140;
      const initX = canvas.width * (0.04 + m * 0.18);
      const rawX = initX - timeSec * mistSpeed - parallax;
      const drawX = ((rawX % spanW) + spanW) % spanW - mistW - 40;
      const drawY = canvas.height * (0.44 + (m % 3) * 0.11);
      ctx.globalAlpha = 0.34 * mistDim;
      ctx.drawImage(mistImg, drawX, drawY, mistW, mistH);
    }
    ctx.restore();
  }

  // ============================================================================
  // 3. GENTLE DARK-BLUE NIGHT ATMOSPHERE TINT & LIGHTNING FLASH
  // ============================================================================
  const gentleNightTint = Math.min(
    0.46,
    nightAmt * 0.38 + cloudDarkness * 0.12
  );
  if (gentleNightTint > 0.03) {
    ctx.fillStyle = `rgba(10, 25, 58, ${gentleNightTint})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (lightningFlash > 0.01) {
    ctx.fillStyle = `rgba(186, 230, 253, ${Math.min(
      0.34,
      lightningFlash * 0.48
    )})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ============================================================================
  // 4. FULL-SKY & BACKGROUND RAIN LAYER (y = 0 TO canvas.height — ZERO TOP CUTOFF)
  //    Ensures uniform raindrop coverage starting directly at y = 0 across the
  //    entire upper sky and mountain background during Evening, Night & Midnight!
  // ============================================================================
  if (weatherInfo.rainIntensity > 0.05) {
    const skyRainInten = weatherInfo.rainIntensity;
    const skyDropCount = 140;
    const skySlantX = -14 - Math.min(26, Math.abs(_carSpeed) * 0.04);
    const skyDropLen = 22 + skyRainInten * 14;
    const skySpanX = canvas.width + 220;
    const skySpanY = canvas.height + skyDropLen * 2;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(186, 230, 253, ${Math.min(0.56, 0.28 + skyRainInten * 0.42)})`;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    for (let i = 0; i < skyDropCount; i++) {
      // Stratified uniform vertical & horizontal distribution starting above y = 0
      const uX = ((i * 0.7548776662) % 1);
      const uY = (i + ((i * 0.61803398875) % 1)) / skyDropCount;
      const speed = 740 + (i % 5) * 85;

      const rx =
        (((uX * skySpanX + timeSec * skySlantX * 14) % skySpanX) + skySpanX) %
          skySpanX -
        110;
      const ry =
        (((uY * skySpanY + timeSec * speed) % skySpanY) + skySpanY) %
          skySpanY -
        skyDropLen;

      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + skySlantX * 0.85, ry + skyDropLen);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Renders Multi-Layered Realistic Falling Raindrops covering 100% of the viewport
 * from y = 0 (the absolute top edge of the canvas/screen) to y = height with
 * uniform stratified distribution and zero top clipping or gap!
 */
function drawWeatherRainOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeSec: number,
  rainIntensity: number,
  carVx: number,
  quality: GraphicsQuality
): void {
  if (rainIntensity <= 0.02) return;
  const baseCount =
    quality === 'Low'
      ? 65
      : quality === 'Medium'
      ? 150
      : quality === 'High'
      ? 250
      : 340;
  const dropCount = Math.max(
    60,
    Math.round(baseCount * Math.max(0.68, rainIntensity * 2.4))
  );

  ctx.save();
  ctx.lineCap = 'round';

  const slantX = -16 - Math.min(30, Math.abs(carVx) * 0.048);
  const dropLen = 26 + rainIntensity * 16;
  const spanX = width + 240;
  const spanY = height + dropLen * 2;

  // 1. Background uniform sky-to-ground rain layer (spawns directly from y = -dropLen through y = 0 to height)
  ctx.strokeStyle = `rgba(186, 230, 253, ${Math.min(0.68, 0.32 + rainIntensity * 0.45)})`;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let i = 0; i < dropCount; i++) {
    const seedX = (i * 0.7548776662 + 0.13) % 1;
    // Stratified uniform Y across [0, 1) guarantees 100% even coverage from y = 0 to height with zero gaps!
    const seedY = (i + ((i * 0.61803398875) % 1)) / dropCount;
    const speed = 780 + (i % 6) * 90;

    const rx =
      (((seedX * spanX + timeSec * slantX * 15 - i * 19) % spanX) + spanX) %
        spanX -
      120;
    const ry =
      (((seedY * spanY + timeSec * speed) % spanY) + spanY) % spanY - dropLen;

    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + slantX * 0.88, ry + dropLen * 0.92);
  }
  ctx.stroke();

  // 2. Foreground crisp raindrop streaks starting directly at y = 0 across the entire canvas
  ctx.strokeStyle = `rgba(224, 242, 254, ${Math.min(0.82, 0.44 + rainIntensity * 0.52)})`;
  ctx.lineWidth = 1.85;
  ctx.beginPath();
  const fgCount = Math.round(dropCount * 0.55);
  const fgSpanX = width + 260;
  const fgDropLen = dropLen * 1.18;
  const fgSpanY = height + fgDropLen * 2;
  for (let i = 0; i < fgCount; i++) {
    const seedX = (i * 0.56984029 + 0.37) % 1;
    const seedY = (i + ((i * 0.7548776662) % 1)) / fgCount;
    const speed = 980 + (i % 5) * 105;

    const rx =
      (((seedX * fgSpanX + timeSec * slantX * 19 - i * 31) % fgSpanX) +
        fgSpanX) %
        fgSpanX -
      130;
    const ry =
      (((seedY * fgSpanY + timeSec * speed) % fgSpanY) + fgSpanY) % fgSpanY -
      fgDropLen;

    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + slantX * 1.1, ry + fgDropLen);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * 3B. SMART HEADLIGHTS & TAILLIGHTS TERRAIN ROAD ILLUMINATION POOL:
 * Casts a glowing forward illumination pool along the terrain surface ahead of the car
 * and a crimson taillight/brake reflection on the road behind the car during Night/Storms!
 */
function drawSmartHeadlightsRoadGlow(
  ctx: CanvasRenderingContext2D,
  state: PhysicsState,
  car: CarConfig,
  map: MapConfig,
  isBraking: boolean,
  timeSec: number
): void {
  const glowStrength = Math.min(
    1,
    Math.max(0.68, state.nightFactor * 0.95 + state.cloudDarkness * 0.45)
  );

  // Forward terrain surface light pool & dynamic high-beam cone
  if (state.frontDamage < 0.88) {
    const poolCenterX = state.x + car.chassisWidth * 0.5 + 165;
    const poolSurf = getEffectiveSurfaceInfo(poolCenterX, map, state, timeSec);
    const poolSlope = getEffectiveSlope(poolCenterX, map, state, timeSec);

    ctx.save();
    ctx.translate(poolCenterX, poolSurf.y + 4);
    ctx.rotate(poolSlope);
    const roadGrad = ctx.createRadialGradient(0, 0, 12, 0, 0, 215);
    roadGrad.addColorStop(0, `rgba(255, 255, 255, ${0.58 * glowStrength})`);
    roadGrad.addColorStop(0.35, `rgba(254, 249, 195, ${0.46 * glowStrength})`);
    roadGrad.addColorStop(0.7, `rgba(186, 230, 253, ${0.24 * glowStrength})`);
    roadGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = roadGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 215, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Volumetric forward headlight beam cone from front bumper
    const noseX = state.x + Math.cos(state.angle) * (car.chassisWidth * 0.48);
    const noseY = state.y + Math.sin(state.angle) * (car.chassisWidth * 0.48) - 10;
    ctx.save();
    ctx.translate(noseX, noseY);
    ctx.rotate(state.angle * 0.65 + poolSlope * 0.35);
    const beamGrad = ctx.createLinearGradient(0, 0, 320, 18);
    beamGrad.addColorStop(0, `rgba(255, 255, 255, ${0.82 * glowStrength})`);
    beamGrad.addColorStop(0.24, `rgba(254, 240, 138, ${0.56 * glowStrength})`);
    beamGrad.addColorStop(0.65, `rgba(56, 189, 248, ${0.22 * glowStrength})`);
    beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(320, -34);
    ctx.lineTo(335, 44);
    ctx.lineTo(0, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Rear taillight / brake light reflection on the road
  const rearPoolX = state.x - car.chassisWidth * 0.5 - 32;
  const rearSurf = getEffectiveSurfaceInfo(rearPoolX, map, state, timeSec);
  const rearSlope = getEffectiveSlope(rearPoolX, map, state, timeSec);
  const brakeBoost = isBraking ? 1.45 : 1.0;

  ctx.save();
  ctx.translate(rearPoolX, rearSurf.y + 3);
  ctx.rotate(rearSlope);
  const tailRoadGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 58 * brakeBoost);
  tailRoadGrad.addColorStop(
    0,
    `rgba(239, 68, 68, ${Math.min(0.68, 0.36 * glowStrength * brakeBoost)})`
  );
  tailRoadGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = tailRoadGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, 58 * brakeBoost, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * 1. REALISTIC PERSPECTIVE & TERRAIN-CONFORMING VEHICLE SHADOWS (ظلال واقعية ديناميكية):
 * Connects directly to the rear and front tire contact points on the terrain slope,
 * renders multi-layered ambient occlusion (AO) contact gradients, and projects an accurate
 * perspective silhouette of the exact vehicle body (including detached parts/open cabin cutouts)
 * that dynamically stretches and softens with altitude, pitch angle, and lighting!
 */
function drawDynamicVehicleShadow(
  ctx: CanvasRenderingContext2D,
  state: PhysicsState,
  car: CarConfig,
  map: MapConfig,
  timeSec: number,
  groundUnderCarY: number,
  groundSlope: number,
  carAltitude: number
): void {
  const w = car.chassisWidth;
  const h = car.chassisHeight;
  const halfWB = car.wheelBase * 0.5;

  // Exact terrain contact points under rear and front wheels
  const cosG = Math.cos(groundSlope);
  const rearGroundX = state.x - halfWB * cosG;
  const frontGroundX = state.x + halfWB * cosG;
  const rearSurf = getEffectiveSurfaceInfo(rearGroundX, map, state, timeSec);
  const frontSurf = getEffectiveSurfaceInfo(frontGroundX, map, state, timeSec);

  // Compute smooth progressive ground shadow visibility at any worldX:
  // 1.0 on solid ground, smoothly fading to 0.0 as that specific point enters the suspension bridge deck,
  // 0.0 across the bridge deck, and smoothly fading back to 1.0 as it exits onto solid ground.
  const getPointGroundShadowVis = (wx: number): number => {
    if (!state.obstacles || state.obstacles.length === 0) return 1;
    let vis = 1;
    const fadeZone = 22;
    for (let i = 0; i < state.obstacles.length; i++) {
      const obs = state.obstacles[i];
      if (obs.type !== 'suspension_bridge') continue;
      const leftBankX = obs.x - obs.width * 0.5;
      const rightBankX = obs.x + obs.width * 0.5;
      if (wx >= leftBankX - 4 && wx <= rightBankX + 4) {
        const distFromLeft = wx - (leftBankX - 4);
        const distFromRight = rightBankX + 4 - wx;
        const nearestEdgeDist = Math.min(distFromLeft, distFromRight);
        if (nearestEdgeDist >= fadeZone) {
          return 0;
        }
        const t = Math.max(0, Math.min(1, 1 - nearestEdgeDist / fadeZone));
        vis = Math.min(vis, t * t * (3 - 2 * t));
      }
    }
    return vis;
  };

  const rearWheelVis = getPointGroundShadowVis(rearGroundX);
  const centerVis = getPointGroundShadowVis(state.x);
  const frontWheelVis = getPointGroundShadowVis(frontGroundX);
  const rearTailVis = getPointGroundShadowVis(state.x - w * 0.52 * cosG);
  const frontNoseVis = getPointGroundShadowVis(state.x + w * 0.52 * cosG);
  const maxCarShadowVis = Math.max(
    rearWheelVis,
    centerVis,
    frontWheelVis,
    rearTailVis,
    frontNoseVis
  );

  // Once the entire vehicle is fully on the suspension bridge, completely hide its shadow!
  if (maxCarShadowVis <= 0.005) return;

  const altitudeRatio = Math.min(1, Math.max(0, carAltitude) / 240);
  const lightIntensity =
    Math.max(0.32, 1 - state.cloudDarkness * 0.25 - state.nightFactor * 0.22) +
    state.lightningFlash * 0.35;

  ctx.save();
  // Clip out the interior of any suspension bridge deck so the shadow stays strictly on the solid ground
  // under the rear of the car when entering and under the front of the car when exiting!
  if (state.obstacles && state.obstacles.length > 0) {
    ctx.beginPath();
    ctx.rect(state.x - 1200, -10000, 2400, 20000);
    for (let i = 0; i < state.obstacles.length; i++) {
      const obs = state.obstacles[i];
      if (obs.type === 'suspension_bridge') {
        const clipLeft = obs.x - obs.width * 0.5 + 4;
        const clipWidth = Math.max(0, obs.width - 8);
        ctx.rect(clipLeft, -10000, clipWidth, 20000);
      }
    }
    ctx.clip('evenodd');
  }

  // 1. Direct Wheel-to-Ground Contact Shadow Pads + WET ASPHALT GOLDEN RIM & TIRE REFLECTIONS!
  //    ("إضافة انعكاس الضوء والإطارات على الأسفلت المبلل لتطابق الجودة البصرية للصورة المرفقة بنسبة 100%")
  const drawWheelContactShadow = (
    wx: number,
    wy: number,
    compression: number,
    wheelVis: number
  ) => {
    if (wheelVis <= 0.01) return;
    const wheelClearance = Math.max(0, carAltitude - compression * 0.6);
    const contactAlpha =
      Math.max(0.08, (0.84 - wheelClearance / 140) * lightIntensity) * wheelVis;
    const rx = car.wheelRadius * (1.28 + Math.min(0.6, wheelClearance * 0.004));
    const ry = Math.max(3.8, 7.2 - wheelClearance * 0.02);
    const slopeAngle = Math.atan2(frontSurf.y - rearSurf.y, Math.max(10, frontGroundX - rearGroundX));

    ctx.save();
    ctx.translate(wx, wy + 2);
    ctx.rotate(slopeAngle);

    // A) Smooth Wet Asphalt Golden Rim, Tire Tread & Light Reflection Pool directly under the tire!
    //    ("إضافة انعكاسات ضوئية مائية ملساء على سطح الطريق الأسفلتي Wet Reflection تظهر لمعان الطريق تحت الإطارات بأسلوب واقعي وعالي الجودة")
    if (wheelClearance < 56) {
      const reflAlpha = Math.max(0, (1 - wheelClearance / 56) * 0.64) * wheelVis;
      // Mirror-like water sheen pool on the asphalt
      const waterPoolGrad = ctx.createRadialGradient(0, 7, 2, 0, 7, rx * 1.55);
      waterPoolGrad.addColorStop(0, `rgba(186, 230, 253, ${reflAlpha * 0.52})`);
      waterPoolGrad.addColorStop(0.55, `rgba(56, 189, 248, ${reflAlpha * 0.26})`);
      waterPoolGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = waterPoolGrad;
      ctx.beginPath();
      ctx.ellipse(0, 7, rx * 1.55, ry * 1.65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden 6-spoke rim reflection shimmering in the wet asphalt under the tire
      const goldReflGrad = ctx.createRadialGradient(0, 6.5, 1.5, 0, 6.5, rx * 1.25);
      goldReflGrad.addColorStop(0, `rgba(254, 240, 138, ${reflAlpha * 0.98})`);
      goldReflGrad.addColorStop(0.48, `rgba(245, 158, 11, ${reflAlpha * 0.76})`);
      goldReflGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = goldReflGrad;
      ctx.beginPath();
      ctx.ellipse(0, 6.5, rx * 1.25, ry * 1.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smooth horizontal water-sheen reflection streaks under tire contact patch
      ctx.strokeStyle = `rgba(224, 242, 254, ${reflAlpha * 0.82})`;
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      ctx.ellipse(0, 3, rx * 1.16, ry * 0.62, 0, 0, Math.PI * 2);
      ctx.moveTo(-rx * 0.95, 8.5);
      ctx.lineTo(rx * 0.95, 8.5);
      ctx.stroke();
    }

    // B) Soft Gradient Cast Shadow directly under the Tire Contact Patch (60 FPS hardware-accelerated radial gradient!)
    const contactGrad = ctx.createRadialGradient(0, 0, 1.5, 0, 0, rx * 1.25);
    contactGrad.addColorStop(0, `rgba(2, 6, 23, ${Math.min(0.96, contactAlpha * 1.05)})`);
    contactGrad.addColorStop(0.5, `rgba(2, 6, 23, ${Math.min(0.76, contactAlpha * 0.78)})`);
    contactGrad.addColorStop(0.82, `rgba(2, 6, 23, ${Math.min(0.32, contactAlpha * 0.34)})`);
    contactGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
    ctx.fillStyle = contactGrad;
    ctx.beginPath();
    ctx.ellipse(0, 1, rx * 1.22, ry * 1.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawWheelContactShadow(rearGroundX, rearSurf.y, state.rearCompression, rearWheelVis);
  drawWheelContactShadow(frontGroundX, frontSurf.y, state.frontCompression, frontWheelVis);

  // 1B. Wet Asphalt Cyan/Crimson Underbody & Headlight Shimmer Reflection on the Road
  if (carAltitude < 65 && centerVis > 0.02) {
    ctx.save();
    const midY = (rearSurf.y + frontSurf.y) * 0.5 + 7;
    const slopeAngle = Math.atan2(frontSurf.y - rearSurf.y, Math.max(10, frontGroundX - rearGroundX));
    ctx.translate(state.x, midY);
    ctx.rotate(slopeAngle);
    const wetGlowAlpha = Math.max(0, (1 - carAltitude / 65) * 0.38) * centerVis;
    const cyanRefl = ctx.createRadialGradient(0, 0, 4, 0, 0, w * 0.62);
    cyanRefl.addColorStop(0, `rgba(56, 189, 248, ${wetGlowAlpha})`);
    cyanRefl.addColorStop(0.55, `rgba(239, 68, 68, ${wetGlowAlpha * 0.58})`);
    cyanRefl.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = cyanRefl;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.62, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Soft Ground Cast Shadow & Underbody Ambient Occlusion Cushion directly beneath the Vehicle Chassis
  //    Uses a longitudinal gradient weighted by rearWheelVis -> centerVis -> frontWheelVis so the shadow
  //    stays under the rear of the car while entering the bridge and under the front when exiting!
  ctx.save();
  const baseRibbonAlpha = Math.max(0.16, (0.84 - altitudeRatio * 0.56) * lightIntensity);
  const midGroundY = (rearSurf.y + frontSurf.y) * 0.5;
  const aoGrad = ctx.createLinearGradient(
    rearGroundX - 30,
    rearSurf.y,
    frontGroundX + 30,
    frontSurf.y
  );
  const rA = Math.min(0.92, baseRibbonAlpha * rearTailVis);
  const rW = Math.min(0.95, baseRibbonAlpha * rearWheelVis);
  const cA = Math.min(0.95, baseRibbonAlpha * centerVis);
  const fW = Math.min(0.95, baseRibbonAlpha * frontWheelVis);
  const fA = Math.min(0.92, baseRibbonAlpha * frontNoseVis);
  aoGrad.addColorStop(0, 'rgba(2, 6, 23, 0)');
  aoGrad.addColorStop(0.12, `rgba(2, 6, 23, ${rA * 0.65})`);
  aoGrad.addColorStop(0.28, `rgba(2, 6, 23, ${rW * 0.92})`);
  aoGrad.addColorStop(0.5, `rgba(2, 6, 23, ${cA * 0.95})`);
  aoGrad.addColorStop(0.72, `rgba(2, 6, 23, ${fW * 0.92})`);
  aoGrad.addColorStop(0.88, `rgba(2, 6, 23, ${fA * 0.65})`);
  aoGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = aoGrad;
  ctx.beginPath();
  ctx.moveTo(rearGroundX - 28, rearSurf.y - 4);
  ctx.quadraticCurveTo(state.x, groundUnderCarY - 8, frontGroundX + 28, frontSurf.y - 4);
  ctx.lineTo(frontGroundX + 32, frontSurf.y + 12);
  ctx.quadraticCurveTo(state.x, groundUnderCarY + 15, rearGroundX - 32, rearSurf.y + 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 3. Perspective-Projected Structural Vehicle Silhouette Shadow with Progressive Longitudinal Bridge Mask
  const scaleX = Math.max(0.45, 1.02 - altitudeRatio * 0.42);
  const scaleY = Math.max(0.18, 0.34 - altitudeRatio * 0.15);
  const pitchDiff = state.angle - groundSlope;
  const lightSkewX =
    Math.sin(pitchDiff) * 0.48 +
    (state.nightFactor > 0.4 ? -0.16 : -0.22) -
    altitudeRatio * 0.18;
  const sunShiftX = carAltitude * (state.nightFactor > 0.4 ? -0.08 : 0.16);
  const shadowY = (groundUnderCarY * 0.65 + midGroundY * 0.35) + 3;

  const coreAlpha = Math.min(
    0.85,
    Math.max(0.18, (0.72 - altitudeRatio * 0.46) * lightIntensity)
  );

  ctx.save();
  ctx.translate(state.x + sunShiftX, shadowY);
  ctx.rotate(groundSlope);
  ctx.transform(scaleX, 0, lightSkewX, scaleY, 0, 0);

  const perspGrad = ctx.createLinearGradient(-w * 0.55, 0, w * 0.55, 0);
  perspGrad.addColorStop(0, `rgba(2, 6, 23, ${Math.min(0.85, coreAlpha * rearTailVis * 0.75)})`);
  perspGrad.addColorStop(0.24, `rgba(2, 6, 23, ${Math.min(0.88, coreAlpha * rearWheelVis)})`);
  perspGrad.addColorStop(0.5, `rgba(2, 6, 23, ${Math.min(0.88, coreAlpha * centerVis)})`);
  perspGrad.addColorStop(0.76, `rgba(2, 6, 23, ${Math.min(0.88, coreAlpha * frontWheelVis)})`);
  perspGrad.addColorStop(1, `rgba(2, 6, 23, ${Math.min(0.85, coreAlpha * frontNoseVis * 0.75)})`);
  ctx.fillStyle = perspGrad;

  const frontNoseTrim = state.frontBumperState === 'detached' ? 7 : 0;
  const rearTailTrim = state.rearBumperState === 'detached' ? 7 : 0;

  ctx.beginPath();
  if (car.style === 'bugatti') {
    ctx.moveTo(-w * 0.52 + rearTailTrim, 6);
    ctx.lineTo(-w * 0.5 + rearTailTrim, -h * 0.85);
    ctx.quadraticCurveTo(-w * 0.12, -h * 1.18, w * 0.22, -h * 0.85);
    ctx.lineTo(w * 0.5 - frontNoseTrim, -h * 0.22);
    ctx.lineTo(w * 0.48 - frontNoseTrim, 8);
    ctx.closePath();
  } else if (car.style === 'buggy') {
    ctx.moveTo(-w * 0.46 + rearTailTrim, 6);
    ctx.lineTo(-w * 0.38 + rearTailTrim, -h * 0.45);
    ctx.lineTo(-w * 0.14, -h * 0.98);
    ctx.lineTo(w * 0.16, -h * 0.92);
    ctx.lineTo(w * 0.32, -h * 0.42);
    ctx.lineTo(w * 0.48 - frontNoseTrim, -h * 0.18);
    ctx.lineTo(w * 0.44 - frontNoseTrim, 6);
    ctx.closePath();
  } else if (car.style === 'rally') {
    ctx.moveTo(-w * 0.52 + rearTailTrim, -h * 0.95);
    ctx.lineTo(-w * 0.48 + rearTailTrim, 6);
    ctx.lineTo(w * 0.48 - frontNoseTrim, 6);
    ctx.lineTo(w * 0.36 - frontNoseTrim * 0.5, -h * 0.42);
    ctx.quadraticCurveTo(-w * 0.08, -h * 1.1, -w * 0.46 + rearTailTrim, -h * 0.55);
    ctx.closePath();
  } else {
    // Offroad 4x4 SUV + Rear Spare Tire + Roof Rack Silhouette
    if (state.rearBumperState !== 'detached') {
      ctx.arc(-w * 0.49, -h * 0.42, 13, 0, Math.PI * 2);
    }
    ctx.moveTo(-w * 0.46 + rearTailTrim, 7);
    ctx.lineTo(-w * 0.46 + rearTailTrim, -h * 0.98);
    ctx.lineTo(w * 0.16, -h * 0.98);
    ctx.lineTo(w * 0.28, -h * 0.48);
    if (state.hoodState === 'open') {
      // Popped-up hood silhouette in the shadow!
      ctx.lineTo(w * 0.44, -h * 0.75);
    }
    ctx.lineTo(w * 0.52 - frontNoseTrim, -h * 0.38);
    ctx.lineTo(w * 0.48 - frontNoseTrim, 7);
    ctx.closePath();
  }
  ctx.fill();

  // Project front & rear wheel silhouettes connected to the chassis shadow (each weighted by its own ground visibility)
  if (rearWheelVis > 0.01) {
    ctx.fillStyle = `rgba(2, 6, 23, ${Math.min(0.88, coreAlpha * rearWheelVis)})`;
    ctx.beginPath();
    ctx.arc(
      -halfWB,
      13 - state.rearCompression * 0.45,
      car.wheelRadius * 1.04,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  if (frontWheelVis > 0.01) {
    ctx.fillStyle = `rgba(2, 6, 23, ${Math.min(0.88, coreAlpha * frontWheelVis)})`;
    ctx.beginPath();
    ctx.arc(
      halfWB,
      13 - state.frontCompression * 0.45,
      car.wheelRadius * 1.04,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
  ctx.restore();
}

/**
 * Draws the Physics-Driven Racing Driver (wearing Racing Suit + Full Helmet & Visor)
 * inside the transparent cabin, reacting to acceleration, braking, and impacts!
 */
function drawPhysicsDriverInCabin(
  ctx: CanvasRenderingContext2D,
  seatX: number,
  seatY: number,
  state: PhysicsState,
  suitColor: string,
  helmetColor: string
): void {
  const timeSec = performance.now() * 0.001;
  // Subtle steering grip adjustment & engine vibration so close-up cabin shots feel alive!
  const steerMotion = Math.sin(timeSec * 4.2) * 0.85;

  ctx.save();
  ctx.translate(seatX, seatY + (state.driverBobY || 0) * 0.45);

  // 1. Carbon-Kevlar Racing Bucket Seat Backrest & Headrest Bolster
  const seatGrad = ctx.createLinearGradient(-12, -19, -2, 5);
  seatGrad.addColorStop(0, '#334155');
  seatGrad.addColorStop(0.5, '#0F172A');
  seatGrad.addColorStop(1, '#020617');
  ctx.fillStyle = seatGrad;
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-9.5, 4);
  ctx.lineTo(-12.5, -17);
  ctx.lineTo(-5.5, -19);
  ctx.lineTo(-2.5, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Seat shoulder harness pass-through slot
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(-9.5, -12, 3.5, 2.5);

  // Apply live longitudinal G-force lean to driver's torso, arms & helmet
  const lean = Number.isFinite(state.driverLean) ? state.driverLean : 0;
  ctx.rotate(lean);

  // 2. Quilted Racing Suit Torso & 4-Point Shoulder Harness with Metallic Buckle
  const suitGrad = ctx.createLinearGradient(-6, -12, 6, 4);
  suitGrad.addColorStop(0, state.isExploded ? '#334155' : suitColor);
  suitGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = suitGrad;
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.roundRect(-6, -11, 12.5, 15, 3.2);
  ctx.fill();
  ctx.stroke();

  // White 4-Point Racing Harness & Gold Center Cam-Lock Buckle
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2.5, -10.5);
  ctx.lineTo(2.2, 2);
  ctx.stroke();
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(1.2, -2, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // 3. Steering Column, Glowing Digital Dash Telemetry & Sport Steering Wheel Rim with Center Marker
  ctx.fillStyle = '#090D16';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(14.5, -12.2, 5.5, 5.5, 1.2);
  ctx.fill();
  ctx.stroke();

  // Active Digital Dash RPM / Nitro / Wings Indicator LEDs
  const isFlightOrBoost =
    state.flightPhase !== 'none' || state.wingDeployProgress > 0.05;
  ctx.fillStyle = isFlightOrBoost ? '#00F0FF' : '#22C55E';
  ctx.fillRect(15.5, -11.2, 3.5, 1.6);
  ctx.fillStyle = state.backfireFlash > 0.1 ? '#F59E0B' : '#38BDF8';
  ctx.fillRect(15.5, -8.8, 2.8, 1.4);

  // Sport Steering Wheel Column & Rim
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.moveTo(13.8, -13.5 + steerMotion * 0.35);
  ctx.lineTo(17.2, -2.5 - steerMotion * 0.35);
  ctx.stroke();
  // Red/Gold Top-Center Racing Stripe on Steering Wheel
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(13.8, -13.5 + steerMotion * 0.35);
  ctx.lineTo(14.7, -10.8 + steerMotion * 0.25);
  ctx.stroke();

  // 4. Driver Arms & Racing Gloves firmly gripping the Steering Wheel
  // Far-side arm gripping upper wheel rim
  ctx.strokeStyle = state.isExploded ? '#1E293B' : '#0F172A';
  ctx.lineWidth = 2.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(3, -8.5);
  ctx.lineTo(10, -9.5);
  ctx.lineTo(14.4, -11.2 + steerMotion * 0.3);
  ctx.stroke();

  // Near-side arm & racing glove gripping steering wheel
  ctx.strokeStyle = state.isExploded ? '#334155' : suitColor;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(2, -7);
  ctx.lineTo(9.8, -4.8 + steerMotion * 0.25);
  ctx.lineTo(15.2, -7.8 + steerMotion * 0.35);
  ctx.stroke();

  // Racing Glove Cuffs & Red/White Grip Knuckles on the Steering Wheel
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(14.4, -11.2 + steerMotion * 0.3, 1.8, 0, Math.PI * 2);
  ctx.arc(15.2, -7.8 + steerMotion * 0.35, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(15.5, -8.0 + steerMotion * 0.35, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // 5. Full-Face Aerodynamic Carbon/Metallic Racing Helmet + Reflective Iridium Visor
  ctx.translate(0, -15.6);
  ctx.rotate(lean * 0.35);
  const helmGrad = ctx.createRadialGradient(-2, -3, 1, 0, 0, 7.5);
  helmGrad.addColorStop(0, '#FFFFFF');
  helmGrad.addColorStop(0.35, state.isExploded ? '#334155' : helmetColor);
  helmGrad.addColorStop(1, '#090D16');
  ctx.fillStyle = helmGrad;
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(0, 0, 6.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Helmet Aero Top Vent & Chin Guard
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(1, 1.2, 6.2, 4.0);

  // Iridium Mirror-Tinted Racing Visor Shield + Specular Glint
  const visorGrad = ctx.createLinearGradient(1.5, -4, 7.5, 1.5);
  visorGrad.addColorStop(0, '#E0F2FE');
  visorGrad.addColorStop(0.5, '#0284C7');
  visorGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = visorGrad;
  ctx.beginPath();
  ctx.moveTo(1.4, -3.8);
  ctx.lineTo(7.2, -2.1);
  ctx.lineTo(6.8, 1.5);
  ctx.lineTo(1.4, 0.9);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws Sculpted Door Panel Seams, B-Pillar, Side Mirror, and Metallic Door Handle,
 * plus visible structural dent creases & cracks when damaged!
 */
function drawDoorDetailsAndDeformation(
  ctx: CanvasRenderingContext2D,
  doorLeftX: number,
  doorRightX: number,
  doorTopY: number,
  doorBottomY: number,
  accentColor: string,
  state: PhysicsState,
  w: number,
  h: number
): void {
  ctx.save();

  const doorW = doorRightX - doorLeftX;
  const doorH = doorBottomY - doorTopY;

  // 1. Progressive Side Door State: Intact vs Broken/Ajar vs Detached!
  if (state.doorState === 'detached') {
    // Side door completely ripped off! Expose dark cabin frame & safety bars
    ctx.fillStyle = 'rgba(2, 6, 23, 0.86)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(doorLeftX + 1, doorTopY + 1, doorW - 2, doorH - 2, 2);
    ctx.fill();
    ctx.stroke();

    // Exposed side-impact intrusion bar inside open doorway
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(doorLeftX + 2, (doorTopY + doorBottomY) * 0.5);
    ctx.lineTo(doorRightX - 2, (doorTopY + doorBottomY) * 0.5 + 2);
    ctx.stroke();
  } else {
    ctx.save();
    if (state.doorState === 'broken') {
      // Broken door hanging skewed off its hinges!
      ctx.translate(doorLeftX, doorTopY);
      ctx.rotate(0.14);
      ctx.translate(-doorLeftX, -doorTopY + 2.5);
      // Dark gap behind ajar door
      ctx.fillStyle = '#020617';
      ctx.fillRect(doorLeftX - 1, doorTopY - 1, doorW, 4);
    }

    // Sculpted Door Panel Seam Outline ("خطوط أبواب السيارة")
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.78)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(doorLeftX, doorTopY, doorW, doorH, 3);
    ctx.stroke();

    // Subtle highlight along door edge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.26)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(doorLeftX + 1.5, doorTopY + 1);
    ctx.lineTo(doorLeftX + 1.5, doorBottomY - 2);
    ctx.moveTo(doorLeftX + 2, doorBottomY - 4);
    ctx.lineTo(doorRightX - 2, doorBottomY - 4);
    ctx.stroke();

    // Recessed Door Handle Pocket & Metallic Handle Bar ("مقبض الباب")
    const handleX = doorLeftX + 6;
    const handleY = doorTopY + 4.5;
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(handleX, handleY, 11, 4.2, 2);
    ctx.fill();

    ctx.fillStyle = '#E2E8F0';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(handleX + 0.8, handleY + 1, 9.5, 2.2, 1);
    ctx.fill();
    ctx.stroke();

    // Side Wing Mirror near Front A-Pillar (Painted to match the vehicle body seamlessly)
    ctx.fillStyle = accentColor;
    ctx.strokeStyle = shadeHexColor(accentColor, -45);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(doorRightX - 5, doorTopY - 4, 7, 4.5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 2. Medium Impact Visual Paint Scratches ("الخدوش البسيطة تظهر فقط عند ضربات متوسطة")
  const paintScratchLevel =
    state.health <= 93
      ? Math.max(
          (100 - state.health) / 100,
          state.frontDamage,
          state.doorDamage,
          state.rearDamage
        )
      : 0;
  if (paintScratchLevel > 0.06 || state.isExploded) {
    const scratchCount = Math.min(8, Math.ceil(paintScratchLevel * 9));
    ctx.strokeStyle = 'rgba(241, 245, 249, 0.68)';
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    for (let s = 0; s < scratchCount; s++) {
      const sx = doorLeftX - 10 + ((s * 17) % Math.max(16, w * 0.65));
      const sy = doorTopY + 3 + ((s * 9) % Math.max(8, doorH - 4));
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 9 + (s % 3) * 3, sy - 1.5 + (s % 2) * 3);
    }
    ctx.stroke();
  }

  // 3. Physical Body Deformation Creases & Cracks when Damaged
  const totalDeform =
    state.frontDamage * 0.45 +
    state.rearDamage * 0.25 +
    state.roofDamage * 0.3 +
    state.doorDamage * 0.4;

  if (totalDeform > 0.14 || state.isExploded) {
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.88)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    if (state.frontDamage > 0.16 || state.isExploded) {
      ctx.moveTo(w * 0.24, -h * 0.44);
      ctx.lineTo(w * 0.31, -h * 0.28);
      ctx.lineTo(w * 0.39, -h * 0.35);
      ctx.lineTo(w * 0.45, -h * 0.16);
    }
    if (
      (state.doorDamage > 0.16 || state.isExploded) &&
      state.doorState !== 'detached'
    ) {
      ctx.moveTo(doorLeftX + 4, doorTopY + 9);
      ctx.lineTo((doorLeftX + doorRightX) * 0.5, doorTopY + 13);
      ctx.lineTo(doorRightX - 3, doorTopY + 7);
    }
    if (state.rearDamage > 0.18 || state.isExploded) {
      ctx.moveTo(-w * 0.44, -h * 0.42);
      ctx.lineTo(-w * 0.33, -h * 0.24);
      ctx.lineTo(-w * 0.26, -h * 0.05);
    }
    ctx.stroke();
  }

  // 4. Progressive Front Engine Hood State ('intact' -> 'open' -> 'detached')
  if (state.hoodState === 'detached') {
    // Exposed dark engine bay & intercooler pipes when hood is completely ripped off!
    ctx.fillStyle = '#090D16';
    ctx.fillRect(w * 0.18, -h * 0.46, w * 0.25, 6);
    ctx.fillStyle = '#475569';
    ctx.fillRect(w * 0.22, -h * 0.45, w * 0.14, 4);
  } else if (state.hoodState === 'open' || state.isExploded) {
    const buckleAngle = state.isExploded
      ? -0.42
      : -Math.min(0.36, 0.18 + state.frontDamage * 0.25);
    ctx.save();
    ctx.translate(w * 0.19, -h * 0.44);
    ctx.rotate(buckleAngle);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w * 0.24, 5);
    ctx.fillStyle = state.isExploded ? '#1E293B' : '#334155';
    ctx.strokeStyle = '#090D16';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(0, -3, w * 0.25, 4.5, 1.5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 5. Progressive Front & Rear Bumper Disassembly ('intact' -> 'hanging' -> 'detached')
  if (state.frontBumperState === 'hanging') {
    ctx.save();
    ctx.translate(w * 0.45, 2);
    ctx.rotate(0.28);
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(-4, -3, 14, 6.5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else if (state.frontBumperState === 'detached') {
    // Exposed front radiator core where bumper ripped off
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(w * 0.42, -4, 6, 10);
  }

  if (state.rearBumperState === 'hanging') {
    ctx.save();
    ctx.translate(-w * 0.46, 3);
    ctx.rotate(-0.26);
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(-9, -3, 13, 6, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 6. Progressive Window Glass State: Cracked Spiderweb vs Completely Shattered!
  if (state.windowShattered) {
    // Remaining jagged glass shards along the window frame edges after glass falls out
    ctx.fillStyle = 'rgba(224, 242, 254, 0.75)';
    ctx.beginPath();
    ctx.moveTo(doorLeftX + 2, doorTopY - 3);
    ctx.lineTo(doorLeftX + 5, doorTopY - 7);
    ctx.lineTo(doorLeftX + 8, doorTopY - 3);
    ctx.moveTo(doorRightX - 9, doorTopY - 3);
    ctx.lineTo(doorRightX - 5, doorTopY - 8);
    ctx.lineTo(doorRightX - 2, doorTopY - 3);
    ctx.fill();
  } else if (state.windowCracked || state.roofDamage > 0.14 || state.frontDamage > 0.22) {
    const crackX = doorRightX - 6;
    const crackY = doorTopY - 8;
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.85)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    for (let c = 0; c < 6; c++) {
      const ca = (c / 6) * Math.PI * 2 + 0.25;
      ctx.moveTo(crackX, crackY);
      ctx.lineTo(crackX + Math.cos(ca) * 10, crackY + Math.sin(ca) * 7.5);
    }
    ctx.stroke();
  }

  // 7. Rainwater Sheen & Splashing Droplets directly on the Vehicle Body during Rain!
  if (state.rainIntensity > 0.05 && !state.isExploded) {
    ctx.strokeStyle = `rgba(224, 242, 254, ${0.35 + state.rainIntensity * 0.4})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    const tBeat = Math.floor(state.weatherCycleSec * 18);
    for (let r = 0; r < 5; r++) {
      const rx = -w * 0.34 + ((r * 23 + tBeat * 7) % Math.max(20, Math.floor(w * 0.72)));
      const ry = -h * 0.88 + (r % 2) * (h * 0.38);
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 4, ry - 4);
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + 4, ry - 3.5);
    }
    ctx.stroke();
  }

  ctx.restore();
}

export function renderVehicle3D(
  ctx: CanvasRenderingContext2D,
  state: PhysicsState,
  car: CarConfig,
  quality: GraphicsQuality,
  isBoosting: boolean,
  altitude = 0,
  showNameplate = false,
  isBraking = false,
  isGas = false
): void {
  ctx.save();
  // Comprehensive Vector Anti-Aliasing & Smooth Edge Rendering (Hardware-Accelerated)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.translate(state.x, state.y);
  ctx.rotate(state.angle);

  const halfWB = car.wheelBase * 0.5;
  // Lifted Suspension Setup + Mechanical Slow Wheel Retraction & Inward Folding during Flight!
  // ("طي العجلات داخل جسم السيارة ببطء: تنسحب العجلات الأربع وتطوى ببطء إلى الداخل لتدخل بالكامل داخل هيكل المركبة")
  const wheelRetract = Math.max(
    0,
    Math.min(1, state.wheelRetractProgress || 0)
  );
  const retractEase =
    wheelRetract * wheelRetract * (3 - 2 * wheelRetract);
  const liftKitHeight = 6;
  // As wheelRetract goes 0 -> 1, wheels retract upward into the chassis bay and fold inward horizontally
  const retractUpOffset = retractEase * (car.wheelRadius * 1.22 + 15);
  const rearWheelLocalX = -halfWB + retractEase * 11;
  const frontWheelLocalX = halfWB - retractEase * 11;
  // Unified resting wheel local Y = 22 (matching rideHeight = car.wheelRadius + 22)
  // so wheels transition between road and movable wooden bridge with zero step jump!
  // Exact rigid rock collision check at the rendered wheel world X so the outer tire rubber never sinks into rocks!
  const cosRenderCar = Math.cos(state.angle || 0);
  const sinRenderCar = Math.sin(state.angle || 0);
  const rearWheelRenderedWorldX =
    state.x + rearWheelLocalX * cosRenderCar - 22 * sinRenderCar;
  const frontWheelRenderedWorldX =
    state.x + frontWheelLocalX * cosRenderCar - 22 * sinRenderCar;
  const rigidRearRockLift =
    retractEase < 0.05 && altitude <= 24 && state.obstacles
      ? getWheelRockBumpAtWorldX(rearWheelRenderedWorldX, state.obstacles)
      : 0;
  const rigidFrontRockLift =
    retractEase < 0.05 && altitude <= 24 && state.obstacles
      ? getWheelRockBumpAtWorldX(frontWheelRenderedWorldX, state.obstacles)
      : 0;
  const effectiveRearComp = Math.max(state.rearCompression, rigidRearRockLift);
  const effectiveFrontComp = Math.max(state.frontCompression, rigidFrontRockLift);
  const defaultRearWheelLocalY =
    16 + liftKitHeight - effectiveRearComp - retractUpOffset;
  const defaultFrontWheelLocalY =
    16 + liftKitHeight - effectiveFrontComp - retractUpOffset;

  const computeFlushBridgeWheelLocalY = (
    wheelLocalX: number,
    fallbackLocalY: number
  ): number => {
    if (
      retractEase > 0.05 ||
      altitude > 24 ||
      !state.obstacles ||
      state.obstacles.length === 0
    ) {
      return fallbackLocalY;
    }
    const cosCar = Math.cos(state.angle || 0);
    const sinCar = Math.sin(state.angle || 0);
    const wheelWorldX = state.x + wheelLocalX * cosCar;
    for (let i = 0; i < state.obstacles.length; i++) {
      const obs = state.obstacles[i];
      if (obs.type !== 'suspension_bridge') continue;
      const halfSpan = obs.width * 0.5;
      const leftBankX = obs.x - halfSpan;
      const rightBankX = obs.x + halfSpan;
      if (wheelWorldX >= leftBankX && wheelWorldX <= rightBankX) {
        const t = Math.max(0, Math.min(1, (wheelWorldX - leftBankX) / obs.width));
        const edgeT = Math.min(t, 1 - t);
        const rampNorm = Math.min(1, Math.max(0, edgeT / 0.12));
        const smoothBlend =
          rampNorm * rampNorm * rampNorm * (rampNorm * (rampNorm * 6 - 15) + 10);
        const flushLocalY =
          (22 - wheelLocalX * sinCar) / Math.max(0.75, cosCar) - retractUpOffset;
        return fallbackLocalY * (1 - smoothBlend) + flushLocalY * smoothBlend;
      }
    }
    return fallbackLocalY;
  };

  const rearWheelLocalY = computeFlushBridgeWheelLocalY(
    rearWheelLocalX,
    defaultRearWheelLocalY
  );
  const frontWheelLocalY = computeFlushBridgeWheelLocalY(
    frontWheelLocalX,
    defaultFrontWheelLocalY
  );
  const w = car.chassisWidth;
  const h = car.chassisHeight;

  // Dynamic Suspension Pitch / Weight Transfer Tilt (Chassis Roll & Weight Transfer Physics)
  // - Negative when accelerating/boosting (GAS): Rear suspension compresses downward (rear squat)
  //   and front nose/wheels naturally lift slightly!
  // - Positive when braking (BRAKE/REV): Front suspension compresses downward (nose-dive)
  //   while the front & rear wheels stay firmly planted on the ground!
  // - Dynamic Spring Differential Pitch & Body Heave: Reacts smoothly to wheel movement over rocks & bridge planks!
  const springDiffPitch =
    ((state.rearCompression - state.frontCompression) /
      Math.max(48, car.wheelBase)) *
    0.46 *
    (1 - retractEase);
  const suspensionPitch =
    (Number.isFinite(state.weightTransferPitch)
      ? state.weightTransferPitch * 0.72
      : 0) + springDiffPitch;
  const dynamicSpringHeaveY =
    -Math.max(
      0,
      Math.min(3.6, (state.rearCompression + state.frontCompression) * 0.22)
    ) *
    (1 - retractEase);
  const brakeNoseDropY =
    suspensionPitch > 0 ? suspensionPitch * 20 : 0;
  const accelRearSquatY =
    suspensionPitch < 0 ? Math.abs(suspensionPitch) * 21 : 0;
  const rearMountY =
    -14 +
    dynamicSpringHeaveY +
    brakeNoseDropY * 0.25 +
    accelRearSquatY -
    Math.sin(suspensionPitch) * halfWB * 0.96;
  const frontMountY =
    -14 +
    dynamicSpringHeaveY +
    brakeNoseDropY -
    accelRearSquatY * 0.35 +
    Math.sin(suspensionPitch) * halfWB * 0.96;

  // Deformation offsets for front nose, rear tail, and roof crush
  const frontCrushX =
    state.frontDamage * 6.5 + (state.frontBumperState === 'detached' ? 4.5 : 0);
  const frontCrushY = state.frontDamage * 4.5;
  const rearCrushX =
    state.rearDamage * 5.5 + (state.rearBumperState === 'detached' ? 4.5 : 0);
  const roofCrushY = state.roofDamage * 4.8;
  const glassFillAlpha = state.windowShattered ? 0.03 : 0.28;
  const glassStrokeAlpha = state.windowShattered ? 0.18 : 0.68;

  // 0. SMART VOLUMETRIC HEADLIGHTS & TAILLIGHTS BEAMS (Automatically ON during Dawn/Fajr, Sunset, Evening & Night; OFF in Morning/Noon/Afternoon!)
  if (!state.isExploded && state.headlightsOn && !state.headlightsBroken) {
    const beamAlpha = Math.min(
      0.94,
      Math.max(0.68, state.nightFactor * 0.95 + state.cloudDarkness * 0.45)
    );

    // Front High-Beam Volumetric Light Cone + Lens Halo
    if (state.frontDamage < 0.88) {
      ctx.save();
      const headX = w * 0.46 - frontCrushX;
      const headY = -h * 0.28 + frontCrushY;

      const beamLen = 380;
      const beamGrad = ctx.createLinearGradient(headX, headY, headX + beamLen, headY + 25);
      beamGrad.addColorStop(0, `rgba(254, 249, 195, ${0.72 * beamAlpha})`);
      beamGrad.addColorStop(0.22, `rgba(224, 242, 254, ${0.38 * beamAlpha})`);
      beamGrad.addColorStop(0.62, `rgba(186, 230, 253, ${0.14 * beamAlpha})`);
      beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(headX, headY - 4);
      ctx.lineTo(headX + beamLen, headY - 72);
      ctx.lineTo(headX + beamLen, headY + 115);
      ctx.lineTo(headX, headY + 5);
      ctx.closePath();
      ctx.fill();

      // Bright inner core beam
      const coreGrad = ctx.createLinearGradient(headX, headY, headX + beamLen * 0.65, headY + 14);
      coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.85 * beamAlpha})`);
      coreGrad.addColorStop(0.45, `rgba(254, 240, 138, ${0.28 * beamAlpha})`);
      coreGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.moveTo(headX, headY - 2);
      ctx.lineTo(headX + beamLen * 0.65, headY - 24);
      ctx.lineTo(headX + beamLen * 0.65, headY + 46);
      ctx.lineTo(headX, headY + 3);
      ctx.closePath();
      ctx.fill();

      // Glowing Headlight Bulb Flare
      const flareGrad = ctx.createRadialGradient(headX, headY, 1, headX, headY, 22);
      flareGrad.addColorStop(0, '#FFFFFF');
      flareGrad.addColorStop(0.4, `rgba(254, 240, 138, ${0.85 * beamAlpha})`);
      flareGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(headX, headY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 0B. REALISTIC REAR RED BRAKE LIGHT GLOW & DEDICATED WHITE REVERSE LIGHT UNDERNEATH (Works Day & Night!)
  //     ("إضاءة خلفية حمراء واقعية Bright Red Brake Light Glow تضيء فور الضغط على الفرامل BRAKE + إضاءة بيضاء مخصصة White Reverse Light تشتعل تحت الإضاءة الحمراء فور الرجوع بالسيارة للخلف")
  const isReversing =
    !state.isExploded &&
    state.flightPhase === 'none' &&
    (state.vx < -1.5 || (isBraking && state.vx <= 1.5));
  const brakeLightActive =
    !state.isExploded && (isBraking || state.headlightsOn);

  if (brakeLightActive || isReversing) {
    ctx.save();
    const tailX = -w * 0.47 + rearCrushX;
    const tailY = -h * 0.34;

    // 1) Bright Red Taillight & Brake Light Volumetric Glow Halo & Rear Cone (Active at Dawn/Fajr, Sunset, Night, or when pressing BRAKE!)
    if (brakeLightActive) {
      const redIntensity = isBraking ? 0.96 : 0.78;
      const glowRadius = isBraking ? 68 : 54;
      const brakeGlowGrad = ctx.createRadialGradient(
        tailX - 2,
        tailY,
        2,
        tailX - 16,
        tailY,
        glowRadius
      );
      brakeGlowGrad.addColorStop(0, `rgba(255, 228, 230, ${redIntensity})`);
      brakeGlowGrad.addColorStop(0.26, `rgba(255, 30, 30, ${redIntensity * 0.92})`);
      brakeGlowGrad.addColorStop(0.62, `rgba(220, 38, 38, ${redIntensity * 0.54})`);
      brakeGlowGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = brakeGlowGrad;
      ctx.beginPath();
      ctx.arc(tailX - 10, tailY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Rear red taillight / brake beam cone projecting backward
      const coneLen = isBraking ? 95 : 68;
      const brakeConeGrad = ctx.createLinearGradient(
        tailX,
        tailY,
        tailX - coneLen,
        tailY + 8
      );
      brakeConeGrad.addColorStop(0, isBraking ? 'rgba(255, 50, 50, 0.85)' : 'rgba(239, 68, 68, 0.68)');
      brakeConeGrad.addColorStop(0.45, isBraking ? 'rgba(239, 68, 68, 0.38)' : 'rgba(220, 38, 38, 0.28)');
      brakeConeGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = brakeConeGrad;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY - 5);
      ctx.lineTo(tailX - coneLen, tailY - (isBraking ? 24 : 18));
      ctx.lineTo(tailX - coneLen, tailY + (isBraking ? 28 : 22));
      ctx.lineTo(tailX, tailY + 5);
      ctx.closePath();
      ctx.fill();
    }

    // 2) Dedicated White Reverse Light Glow directly UNDERNEATH the Red Brake Light when backing up!
    if (isReversing) {
      const revY = tailY + 11;
      const revGlowGrad = ctx.createRadialGradient(
        tailX - 2,
        revY,
        1.5,
        tailX - 14,
        revY + 2,
        46
      );
      revGlowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      revGlowGrad.addColorStop(0.38, 'rgba(224, 242, 254, 0.65)');
      revGlowGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
      ctx.fillStyle = revGlowGrad;
      ctx.beginPath();
      ctx.arc(tailX - 8, revY, 46, 0, Math.PI * 2);
      ctx.fill();

      // Crisp white reverse backup light cone projecting backward below the red light
      const revConeGrad = ctx.createLinearGradient(
        tailX,
        revY,
        tailX - 78,
        revY + 12
      );
      revConeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
      revConeGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.35)');
      revConeGrad.addColorStop(1, 'rgba(224, 242, 254, 0)');
      ctx.fillStyle = revConeGrad;
      ctx.beginPath();
      ctx.moveTo(tailX, revY - 2.5);
      ctx.lineTo(tailX - 78, revY - 12);
      ctx.lineTo(tailX - 78, revY + 18);
      ctx.lineTo(tailX, revY + 3.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 1. SMART JET ENGINE AFTERBURNER FLAME (IN FLIGHT) OR NITRO / BACKFIRE PLUME (ON GROUND)
  //    ("لهب النفاث الواقعي عند الطيران: يكون اللهب خفيفاً وهادئاً أثناء الطيران العادي بدون ضغط دواسة البنزين، ويشتد اللهب ويتعاظم لونه وناره بشكل متوسط عند الضغط على زر البنزين GAS")
  const isFlyingMode =
    state.flightPhase !== 'none' || state.wingDeployProgress > 0.05;
  if (
    !state.isExploded &&
    (isFlyingMode || isBoosting || state.backfireFlash > 0.05)
  ) {
    ctx.save();
    // In flight: gentle/calm flame (0.38) when cruising without GAS; medium-high intense flame (0.88) when pressing GAS; full (1.15) on NITRO!
    const flashScale = isFlyingMode
      ? isBoosting
        ? 1.15
        : isGas
        ? 0.88
        : 0.38
      : isBoosting
      ? 1.0
      : state.backfireFlash * 0.78;
    const flicker =
      isFlyingMode && !isGas && !isBoosting
        ? 0.95 + Math.sin(performance.now() * 0.025) * 0.05
        : 0.88 + Math.sin(performance.now() * 0.055) * 0.14;
    const outerLen =
      (isFlyingMode && !isGas && !isBoosting
        ? 36
        : 62 + Math.random() * 18) *
      flashScale *
      flicker;
    const nozX = -w * 0.48 + rearCrushX;
    const nozY = 4;

    // A) Outer Warm Orange / Fiery Red-Gold Afterburner Plume (Calm & subtle when cruising, fiery & intense when pressing GAS!)
    const outerFlameGrad = ctx.createLinearGradient(
      nozX,
      nozY,
      nozX - outerLen * 1.22,
      nozY
    );
    if (isFlyingMode && !isGas && !isBoosting) {
      outerFlameGrad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
      outerFlameGrad.addColorStop(0.55, 'rgba(14, 165, 233, 0.32)');
      outerFlameGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
    } else {
      outerFlameGrad.addColorStop(0, 'rgba(254, 240, 138, 0.96)');
      outerFlameGrad.addColorStop(0.35, 'rgba(249, 115, 22, 0.9)');
      outerFlameGrad.addColorStop(0.75, 'rgba(220, 38, 38, 0.55)');
      outerFlameGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
    }
    ctx.fillStyle = outerFlameGrad;
    ctx.beginPath();
    ctx.moveTo(nozX, nozY - 6.5 * Math.min(1, flashScale + 0.3));
    ctx.lineTo(nozX - outerLen * 1.18, nozY - 15 * flashScale);
    ctx.lineTo(nozX - outerLen * 0.92, nozY - 2.5);
    ctx.lineTo(nozX - outerLen * 1.25, nozY + 0.5);
    ctx.lineTo(nozX - outerLen * 0.9, nozY + 5);
    ctx.lineTo(nozX - outerLen * 1.15, nozY + 16 * flashScale);
    ctx.lineTo(nozX, nozY + 7.5 * Math.min(1, flashScale + 0.3));
    ctx.closePath();
    ctx.fill();

    // B) Mid-Layer Fiery Gold-Orange Combustion Cone (intensifies on GAS / Boost)
    if (!isFlyingMode || isGas || isBoosting) {
      const midFlameGrad = ctx.createLinearGradient(
        nozX,
        nozY,
        nozX - outerLen * 0.88,
        nozY
      );
      midFlameGrad.addColorStop(0, '#FFFFFF');
      midFlameGrad.addColorStop(0.35, '#FEF08A');
      midFlameGrad.addColorStop(0.72, '#F97316');
      midFlameGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = midFlameGrad;
      ctx.beginPath();
      ctx.moveTo(nozX, nozY - 5);
      ctx.lineTo(nozX - outerLen * 0.86, nozY - 9.5 * flashScale);
      ctx.lineTo(nozX - outerLen * 0.65, nozY + 0.5);
      ctx.lineTo(nozX - outerLen * 0.86, nozY + 10.5 * flashScale);
      ctx.lineTo(nozX, nozY + 6);
      ctx.closePath();
      ctx.fill();
    }

    // C) Inner Superheated Electric-Blue & White Plasma Jet Core
    const blueCoreLen =
      outerLen * (isBoosting || (isFlyingMode && isGas) ? 0.72 : 0.58);
    const blueFlameGrad = ctx.createLinearGradient(
      nozX,
      nozY,
      nozX - blueCoreLen,
      nozY
    );
    blueFlameGrad.addColorStop(0, '#FFFFFF');
    blueFlameGrad.addColorStop(0.32, '#E0F2FE');
    blueFlameGrad.addColorStop(0.68, '#00F0FF');
    blueFlameGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = blueFlameGrad;
    ctx.beginPath();
    ctx.moveTo(nozX, nozY - 3.2);
    ctx.lineTo(nozX - blueCoreLen, nozY - 4.8 * flashScale);
    ctx.lineTo(nozX - blueCoreLen * 0.84, nozY + 0.5);
    ctx.lineTo(nozX - blueCoreLen, nozY + 5.5 * flashScale);
    ctx.lineTo(nozX, nozY + 4.2);
    ctx.closePath();
    ctx.fill();

    // D) Supersonic Mach Shock Diamonds when pressing GAS in flight or NITRO
    if (isBoosting || (isFlyingMode && isGas)) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
      for (let d = 1; d <= 2; d++) {
        const dx = nozX - d * (blueCoreLen * 0.36);
        ctx.beginPath();
        ctx.moveTo(dx + 4, nozY + 0.5);
        ctx.lineTo(dx, nozY - 2.6);
        ctx.lineTo(dx - 4.5, nozY + 0.5);
        ctx.lineTo(dx, nozY + 3.6);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 2. FAR-SIDE 3D WHEEL SHADOWS (Fade and fold inward into the chassis as wheels retract!)
  if (retractEase < 0.95) {
    ctx.save();
    ctx.globalAlpha = 1 - retractEase * 0.95;
    ctx.translate(4, -3);
    ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
    ctx.beginPath();
    ctx.ellipse(
      rearWheelLocalX,
      rearWheelLocalY,
      car.wheelRadius * 0.95 * (1 - retractEase * 0.3),
      car.wheelRadius * 0.95 * Math.max(0.2, 1 - retractEase * 0.78),
      0,
      0,
      Math.PI * 2
    );
    ctx.ellipse(
      frontWheelLocalX,
      frontWheelLocalY,
      car.wheelRadius * 0.95 * (1 - retractEase * 0.3),
      car.wheelRadius * 0.95 * Math.max(0.2, 1 - retractEase * 0.78),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Natural semi-transparent rain splashes on Far-Side 3D Wheels (Zero bright/neon glow!)
    if (!state.isExploded && state.rainIntensity > 0.05) {
      const fsAlpha = Math.min(0.38, 0.22 + state.rainIntensity * 0.28);
      const tFs = performance.now() * 0.001;
      ctx.strokeStyle = `rgba(203, 213, 225, ${fsAlpha})`;
      ctx.lineWidth = 1.0;
      const farWheelHits = [
        { x: rearWheelLocalX, y: rearWheelLocalY - car.wheelRadius * 0.92, s: 0.8 },
        { x: frontWheelLocalX, y: frontWheelLocalY - car.wheelRadius * 0.92, s: 2.3 },
      ];
      ctx.beginPath();
      for (let f = 0; f < farWheelHits.length; f++) {
        const fw = farWheelHits[f];
        const ph = (tFs * 7.8 + fw.s) % 1;
        if (ph < 0.65) {
          const pNorm = ph / 0.65;
          const sx = 1.6 + pNorm * 4.2;
          const sy = (1 - pNorm) * 4.2;
          ctx.moveTo(fw.x, fw.y);
          ctx.lineTo(fw.x - sx, fw.y - sy);
          ctx.moveTo(fw.x, fw.y);
          ctx.lineTo(fw.x + sx, fw.y - sy);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. 4 DISTINCTIVE 3D VEHICLE CHASSIS SHAPES WITH LIFTED SUSPENSION, METALLIC SHEEN SHADER & DAYTIME HEADLIGHTS OFF
  ctx.save();
  ctx.translate(
    0,
    -4 + dynamicSpringHeaveY + brakeNoseDropY + accelRearSquatY * 0.58
  );
  ctx.rotate(suspensionPitch);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const rawSheen =
    ((state.x * 0.004 + altitude * 0.015 - state.angle * 0.8) % 1 + 1) % 1;
  const sheenShift = Number.isFinite(rawSheen) ? rawSheen : 0.35;

  const primaryPaint = state.isExploded ? '#1C1917' : car.bodyColor;
  const dualNeon = state.isExploded ? null : getDualNeonInfo(primaryPaint);
  const starryGalaxy = state.isExploded ? null : getStarryGalaxyInfo(primaryPaint);
  const neonNowSec = performance.now() * 0.001;
  const neonWave = 0.5 + 0.5 * Math.sin(neonNowSec * 4.4);
  const neonStrobe = 0.5 + 0.5 * Math.sin(neonNowSec * 16.0);
  const neonPulse = 0.38 + 0.38 * neonWave + 0.24 * neonStrobe;
  const neonBlink = Math.sin(neonNowSec * 11.5) > -0.2 ? 1.0 : 0.42;

  const secondaryPaint = state.isExploded
    ? '#090D16'
    : dualNeon
    ? dualNeon.colorB
    : starryGalaxy
    ? starryGalaxy.deepColor
    : shadeHexColor(primaryPaint, -30);
  const paintLight = state.isExploded
    ? '#334155'
    : dualNeon
    ? dualNeon.colorA
    : starryGalaxy
    ? starryGalaxy.nebulaColor
    : shadeHexColor(primaryPaint, 42);
  const paintMidLight = state.isExploded
    ? '#334155'
    : dualNeon
    ? dualNeon.midColor
    : starryGalaxy
    ? starryGalaxy.nebulaColor
    : shadeHexColor(primaryPaint, 20);
  const paintMidDark = state.isExploded
    ? '#1E293B'
    : dualNeon
    ? dualNeon.colorB
    : starryGalaxy
    ? starryGalaxy.baseColor
    : shadeHexColor(primaryPaint, -22);
  const paintDeepStroke = state.isExploded
    ? '#090D16'
    : dualNeon
    ? neonBlink > 0.7
      ? dualNeon.colorB
      : dualNeon.colorA
    : starryGalaxy
    ? starryGalaxy.deepColor
    : shadeHexColor(primaryPaint, -55);

  if (car.style === 'bugatti') {
    // === STYLE 4: BUGATTI CHIRON ULTRA W16 (ULTRA HD HYPERCAR VECTOR RENDER) ===
    // 1. Carbon-Fiber Front Splitter, Side Skirts & Rear Quad-Exhaust Diffuser Undertray
    ctx.fillStyle = '#090D16';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-w * 0.51 + rearCrushX, 3, w * 1.01 - frontCrushX - rearCrushX, 6.5, 2.5);
    ctx.fill();
    ctx.stroke();

    // Quad Titanium Exhaust Pipes at Rear Diffuser
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-w * 0.52 + rearCrushX, 4, 4, 4.5);

    // 2. Active Hydraulic Rear Airbrake Wing (bends if rearDamage)
    ctx.save();
    ctx.translate(-w * 0.44 + rearCrushX, -h * 0.88 + state.rearDamage * 6);
    ctx.rotate(state.rearDamage * 0.32 - (isBoosting ? 0.12 : 0.04));
    // Dual hydraulic wing struts
    ctx.fillStyle = '#334155';
    ctx.fillRect(-2, 1, 3, 12);
    ctx.fillRect(6, 1, 3, 12);
    // Carbon wing blade with Cyan tip endplate
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = car.accentColor;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-9, -3.5, 22, 5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Exposed Rear W16 Quad-Turbo Chrome Engine Bay Louvers
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.46 + rearCrushX, -h * 0.56);
    ctx.lineTo(-w * 0.18, -h * 0.96 + roofCrushY);
    ctx.lineTo(-w * 0.08, -h * 0.96 + roofCrushY);
    ctx.lineTo(-w * 0.22, -h * 0.54);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Chrome W16 intake manifold ribs
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.4;
    for (let r = 0; r < 3; r++) {
      const ry = -h * (0.64 + r * 0.09);
      ctx.beginPath();
      ctx.moveTo(-w * 0.36 + r * 4, ry);
      ctx.lineTo(-w * 0.2 + r * 3, ry - 2);
      ctx.stroke();
    }

    // 4. Main Sculpted Metallic Atlantic-Blue Hypercar Body + Specular Sheen
    const paintGrad = dualNeon
      ? createAnimatedDualNeonGradient(ctx, -w * 0.5, -h * 1.15, w * 0.5, 12, dualNeon, neonNowSec)
      : starryGalaxy
      ? createStarryGalaxyGradient(ctx, -w * 0.5, -h * 1.15, w * 0.5, 12, starryGalaxy, neonNowSec)
      : ctx.createLinearGradient(-w * 0.5, -h * 1.15, w * 0.5, 12);
    if (!dualNeon && !starryGalaxy) {
      paintGrad.addColorStop(0, '#020617');
      paintGrad.addColorStop(0.22, paintMidDark);
      paintGrad.addColorStop(
        Math.max(0.28, Math.min(0.65, 0.38 + sheenShift * 0.25)),
        paintLight
      );
      paintGrad.addColorStop(0.75, primaryPaint);
      paintGrad.addColorStop(1, secondaryPaint);
    }
    ctx.fillStyle = paintGrad;
    ctx.strokeStyle = dualNeon || starryGalaxy ? paintDeepStroke : '#020617';
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(-w * 0.5 + rearCrushX, 7);
    ctx.lineTo(-w * 0.48 + rearCrushX, -h * 0.58);
    ctx.quadraticCurveTo(
      -w * 0.14,
      -h * 1.18 + roofCrushY,
      w * 0.2,
      -h * 0.85 + roofCrushY
    );
    ctx.lineTo(w * 0.49 - frontCrushX, -h * 0.22 + frontCrushY);
    ctx.quadraticCurveTo(w * 0.54 - frontCrushX, 4, w * 0.48 - frontCrushX, 8);
    ctx.closePath();
    ctx.fill();
    if (starryGalaxy && !state.isExploded) {
      ctx.save();
      ctx.clip();
      drawStarryGalaxySparkles(ctx, -w * 0.5, -h * 1.15, w, h * 1.25, starryGalaxy, neonNowSec);
      ctx.restore();
    }
    ctx.stroke();

    // Top Fender & Roof Metallic Specular Highlight Ribbon
    if (!state.isExploded) {
      ctx.strokeStyle = '#E0F2FE';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.16, -h * 0.78 + roofCrushY);
      ctx.lineTo(w * 0.45 - frontCrushX, -h * 0.23 + frontCrushY);
      ctx.stroke();
    }

    // 5. Sculpted Rear & Lower Side Pod Section (Uniformly painted with vehicle body color)
    const sidePodGrad = ctx.createLinearGradient(-w * 0.5, -h * 0.5, w * 0.08, 8);
    sidePodGrad.addColorStop(0, paintMidDark);
    sidePodGrad.addColorStop(0.5, primaryPaint);
    sidePodGrad.addColorStop(1, secondaryPaint);
    ctx.fillStyle = sidePodGrad;
    ctx.beginPath();
    ctx.moveTo(-w * 0.5 + rearCrushX, 7);
    ctx.lineTo(-w * 0.48 + rearCrushX, -h * 0.48);
    ctx.lineTo(-w * 0.03, -h * 0.48);
    ctx.lineTo(w * 0.1, 7);
    ctx.closePath();
    ctx.fill();

    // 6. Interior Cabin Backwall + Physics Racing Driver (Visible through Transparent Glass!)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-w * 0.16, -h * 0.48);
    ctx.quadraticCurveTo(
      0,
      -h * 0.98 + roofCrushY,
      w * 0.18,
      -h * 0.74 + roofCrushY
    );
    ctx.lineTo(w * 0.3, -h * 0.28);
    ctx.lineTo(-w * 0.14, -h * 0.28);
    ctx.closePath();
    ctx.fillStyle = 'rgba(9, 13, 22, 0.58)';
    ctx.fill();
    ctx.clip();
    drawPhysicsDriverInCabin(ctx, 2, -h * 0.3, state, '#0284C7', '#00F0FF');
    ctx.restore();

    // Transparent Glass Canopy + Diagonal Specular Reflection Glint
    ctx.fillStyle = `rgba(186, 230, 253, ${glassFillAlpha})`;
    ctx.strokeStyle = `rgba(224, 242, 254, ${glassStrokeAlpha})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-w * 0.16, -h * 0.48);
    ctx.quadraticCurveTo(
      0,
      -h * 0.98 + roofCrushY,
      w * 0.18,
      -h * 0.74 + roofCrushY
    );
    ctx.lineTo(w * 0.3, -h * 0.28);
    ctx.lineTo(-w * 0.14, -h * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (!state.windowShattered) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(w * 0.06, -h * 0.78 + roofCrushY);
      ctx.lineTo(w * 0.2, -h * 0.34);
      ctx.stroke();
    }

    // 7. Signature Bugatti Metallic Cyan/Silver C-Line Arch
    ctx.strokeStyle = '#E0F2FE';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.arc(-w * 0.04, -h * 0.27, 16.5, -Math.PI * 0.7, Math.PI * 0.66, true);
    ctx.stroke();
    ctx.strokeStyle = car.accentColor;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Sculpted Door Seams, Handle & Deformation
    drawDoorDetailsAndDeformation(
      ctx,
      -w * 0.1,
      w * 0.2,
      -h * 0.32,
      5,
      car.accentColor,
      state,
      w,
      h
    );

    // 8. Front Bugatti Horseshoe Grille Emblem & Quad-LED Matrix Headlights (OFF in Daytime!)
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(w * 0.48 - frontCrushX, 2, 5.5, -Math.PI * 0.55, Math.PI * 0.55);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(w * 0.48 - frontCrushX - 1.5, -1.5, 3, 3);

    // Quad LED Headlight Housing (Strictly OFF in Daytime, ON in Sunset/Night!)
    ctx.fillStyle = '#090D16';
    ctx.fillRect(w * 0.4 - frontCrushX, -h * 0.24 + frontCrushY, 10.5, 5.5);
    ctx.fillStyle =
      state.frontDamage > 0.85
        ? '#1E293B'
        : state.headlightsOn
        ? '#FFFFFF'
        : '#334155';
    for (let led = 0; led < 4; led++) {
      ctx.fillRect(w * 0.405 - frontCrushX + led * 2.4, -h * 0.22 + frontCrushY, 1.8, 3.2);
    }

    // Full-Width Rear Red Brake LED Blade + Dedicated White Reverse Light Underneath
    ctx.fillStyle = brakeLightActive ? '#FF1E1E' : '#450A0A';
    ctx.fillRect(-w * 0.49 + rearCrushX, -h * 0.4, 5.5, 8);
    if (isBraking) {
      ctx.fillStyle = '#FECACA';
      ctx.fillRect(-w * 0.485 + rearCrushX, -h * 0.38, 3.2, 4.5);
    }
    // White Reverse Lamp housing directly below Red Brake Light
    ctx.fillStyle = isReversing ? '#FFFFFF' : '#1E293B';
    ctx.fillRect(-w * 0.49 + rearCrushX, -h * 0.16, 4.8, 4.2);
  } else if (car.style === 'buggy') {
    // === STYLE 2: FORD RAPTOR BAJA V8 TRUCK / BUGGY (ULTRA HD VECTOR RENDER) ===
    // 1. Heavy-Duty Tubular Baja Skid Plate, Frame Rails & External Bypass Shock Reservoirs
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-halfWB + 4, 3);
    ctx.lineTo(halfWB - 4, 3);
    ctx.lineTo(halfWB + 8, -2);
    ctx.lineTo(halfWB - 8, 11);
    ctx.lineTo(-halfWB + 8, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Anodized Emerald-Green Bypass Shock Piggyback Reservoirs above Wheel Wells
    ctx.fillStyle = car.accentColor;
    ctx.fillRect(-halfWB - 5, -11, 4.5, 9);
    ctx.fillRect(halfWB - 5, -11, 4.5, 9);

    // 2. Exposed Rear 6.2L Supercharged V8 Engine Block, Chrome Headers & Twin Intercooler Fans
    ctx.save();
    const engX = -w * 0.41 + rearCrushX;
    const engY = -h * 0.78;
    // Engine block casing
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(engX, engY, 27, 19, 3);
    ctx.fill();
    ctx.stroke();
    // Supercharger red blower hat & chrome intake scoop
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(engX + 3, engY - 6, 20, 6.5);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(engX + 6, engY - 9, 14, 3.5);
    // Chrome V8 exhaust headers
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    for (let p = 0; p < 3; p++) {
      ctx.beginPath();
      ctx.moveTo(engX + 5 + p * 6, engY + 5);
      ctx.lineTo(engX + 3 + p * 6, engY + 16);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Physics Driver inside Open Roll-Cage Cabin
    drawPhysicsDriverInCabin(ctx, 3, -h * 0.36, state, '#EA580C', '#10B981');

    // 4. Transparent Polycarbonate Baja Windshield + Specular Glint
    ctx.fillStyle = `rgba(186, 230, 253, ${glassFillAlpha})`;
    ctx.strokeStyle = `rgba(224, 242, 254, ${glassStrokeAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w * 0.12, -h * 0.94 + roofCrushY);
    ctx.lineTo(w * 0.15, -h * 0.9 + roofCrushY);
    ctx.lineTo(w * 0.27, -h * 0.42);
    ctx.lineTo(-w * 0.12, -h * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5. Reinforced Chromoly Tubular Roll-Cage with Welded Gussets
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 5.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(-w * 0.39 + rearCrushX, -h * 0.4);
    ctx.lineTo(-w * 0.13, -h * 0.96 + roofCrushY);
    ctx.lineTo(w * 0.15, -h * 0.92 + roofCrushY);
    ctx.lineTo(w * 0.29, -h * 0.4);
    ctx.moveTo(-w * 0.13, -h * 0.96 + roofCrushY);
    ctx.lineTo(-w * 0.01, -h * 0.4);
    ctx.stroke();

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2.8;
    ctx.stroke();

    // 6. Sculpted Metallic Amber-Gold Baja Truck Bodywork & Flared Fenders
    const bodyGrad = dualNeon
      ? createAnimatedDualNeonGradient(ctx, -w * 0.48, -h * 0.55, w * 0.48, 8, dualNeon, neonNowSec)
      : starryGalaxy
      ? createStarryGalaxyGradient(ctx, -w * 0.48, -h * 0.55, w * 0.48, 8, starryGalaxy, neonNowSec)
      : ctx.createLinearGradient(0, -h * 0.5, 0, 8);
    if (!dualNeon && !starryGalaxy) {
      bodyGrad.addColorStop(0, paintLight);
      bodyGrad.addColorStop(0.28, primaryPaint);
      bodyGrad.addColorStop(0.72, paintMidDark);
      bodyGrad.addColorStop(1, secondaryPaint);
    }

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = paintDeepStroke;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-w * 0.46 + rearCrushX, 5);
    ctx.lineTo(-w * 0.43 + rearCrushX, -h * 0.46);
    ctx.lineTo(w * 0.25, -h * 0.44);
    ctx.lineTo(w * 0.49 - frontCrushX, -h * 0.24 + frontCrushY);
    ctx.lineTo(w * 0.45 - frontCrushX, 5);
    ctx.closePath();
    ctx.fill();
    if (starryGalaxy && !state.isExploded) {
      ctx.save();
      ctx.clip();
      drawStarryGalaxySparkles(ctx, -w * 0.48, -h * 0.55, w * 0.96, h * 0.65, starryGalaxy, neonNowSec);
      ctx.restore();
    }
    ctx.stroke();

    // Sculpted Door Seams, Handle & Deformation
    drawDoorDetailsAndDeformation(
      ctx,
      -w * 0.12,
      w * 0.2,
      -h * 0.4,
      4,
      primaryPaint,
      state,
      w,
      h
    );

    // 7. Roof Desert Aero Visor + 4-Pod LED Roof Light Bar & Front Headlight (OFF in Daytime!)
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = car.accentColor;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(-w * 0.16, -h * 1.04 + roofCrushY, 36, 5.5, 2);
    ctx.fill();
    ctx.stroke();
    // Roof LED Pods (OFF in Daytime, ON in Sunset/Night!)
    ctx.fillStyle = state.headlightsOn ? '#FEF08A' : '#334155';
    for (let lx = 0; lx < 3; lx++) {
      ctx.beginPath();
      ctx.arc(w * 0.02 + lx * 5.5, -h * 1.01 + roofCrushY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Front Main Headlight (OFF in Daytime, ON in Sunset/Night!)
    ctx.fillStyle = state.headlightsOn ? '#FEF08A' : '#334155';
    ctx.strokeStyle = state.headlightsOn ? '#F59E0B' : '#475569';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(w * 0.42 - frontCrushX, -h * 0.23 + frontCrushY, 6.5, 6, 1.5);
    ctx.fill();
    ctx.stroke();

    // Rear Red Brake Light + Dedicated White Reverse Light Underneath
    ctx.fillStyle = brakeLightActive ? '#FF1E1E' : '#450A0A';
    ctx.fillRect(-w * 0.46 + rearCrushX, -h * 0.38, 4.8, 7.5);
    if (isBraking) {
      ctx.fillStyle = '#FECACA';
      ctx.fillRect(-w * 0.455 + rearCrushX, -h * 0.36, 2.8, 4.2);
    }
    ctx.fillStyle = isReversing ? '#FFFFFF' : '#1E293B';
    ctx.fillRect(-w * 0.46 + rearCrushX, -h * 0.17, 4.5, 4.2);
  } else if (car.style === 'rally') {
    // === STYLE 3: PORSCHE 911 DAKAR RALLY (ULTRA HD VECTOR RENDER) ===
    // 1. Stainless Steel Dakar Underbody Bash Plates & Side Rocker Moldings
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(-w * 0.48 + rearCrushX, 3, w * 0.96 - frontCrushX - rearCrushX, 5.5, 2);
    ctx.fill();
    ctx.stroke();

    // 2. Twin-Plane Carbon Swan-Neck Rear Rally Wing + Roof Expedition Basket with LED Floodlights
    ctx.save();
    ctx.translate(-w * 0.48 + rearCrushX, -h * 0.92 + state.rearDamage * 6);
    ctx.rotate(state.rearDamage * 0.28);
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.fillRect(0, 0, 16, 14);
    ctx.fillStyle = car.accentColor;
    ctx.beginPath();
    ctx.roundRect(-3, -3.5, 23, 4.5, 1.5);
    ctx.fill();
    ctx.restore();

    // Dakar Roof Expedition Rack + Red Jerrycan + Front LED Light Bar (OFF in Daytime!)
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-w * 0.16, -h * 1.04 + roofCrushY, 32, 4.5, 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-w * 0.13, -h * 1.11 + roofCrushY, 11, 4);
    ctx.fillStyle = state.headlightsOn ? '#FEF08A' : '#334155';
    ctx.fillRect(w * 0.04, -h * 1.03 + roofCrushY, 6, 3.5);

    // 3. Sculpted Metallic Emerald-Green 911 Dakar Coupe Body + Specular Highlights
    const bodyGrad = dualNeon
      ? createAnimatedDualNeonGradient(ctx, -w * 0.48, -h * 1.05, w * 0.48, 10, dualNeon, neonNowSec)
      : starryGalaxy
      ? createStarryGalaxyGradient(ctx, -w * 0.48, -h * 1.05, w * 0.48, 10, starryGalaxy, neonNowSec)
      : ctx.createLinearGradient(0, -h * 1.05, 0, 10);
    if (!dualNeon && !starryGalaxy) {
      bodyGrad.addColorStop(0, paintLight);
      bodyGrad.addColorStop(0.28, primaryPaint);
      bodyGrad.addColorStop(0.68, paintMidDark);
      bodyGrad.addColorStop(1, secondaryPaint);
    }

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = paintDeepStroke;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-w * 0.48 + rearCrushX, 6);
    ctx.lineTo(-w * 0.46 + rearCrushX, -h * 0.52);
    ctx.quadraticCurveTo(
      -w * 0.12,
      -h * 1.12 + roofCrushY,
      w * 0.18,
      -h * 0.88 + roofCrushY
    );
    ctx.lineTo(w * 0.36, -h * 0.42);
    ctx.quadraticCurveTo(
      w * 0.5 - frontCrushX,
      -h * 0.3 + frontCrushY,
      w * 0.48 - frontCrushX,
      6
    );
    ctx.closePath();
    ctx.fill();
    if (starryGalaxy && !state.isExploded) {
      ctx.save();
      ctx.clip();
      drawStarryGalaxySparkles(ctx, -w * 0.48, -h * 1.1, w * 0.96, h * 1.2, starryGalaxy, neonNowSec);
      ctx.restore();
    }
    ctx.stroke();

    // 4. Interior Cabin + Physics Racing Driver visible through Transparent Rally Glass!
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-w * 0.22, -h * 0.46);
    ctx.quadraticCurveTo(
      -w * 0.04,
      -h * 0.96 + roofCrushY,
      w * 0.16,
      -h * 0.78 + roofCrushY
    );
    ctx.lineTo(w * 0.28, -h * 0.44);
    ctx.closePath();
    ctx.fillStyle = 'rgba(9, 13, 22, 0.56)';
    ctx.fill();
    ctx.clip();
    drawPhysicsDriverInCabin(ctx, 2, -h * 0.4, state, '#E11D48', '#F8FAFC');
    ctx.restore();

    // Transparent Rally Windows + Specular Reflection
    ctx.fillStyle = `rgba(186, 230, 253, ${glassFillAlpha})`;
    ctx.strokeStyle = `rgba(224, 242, 254, ${glassStrokeAlpha})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-w * 0.22, -h * 0.46);
    ctx.quadraticCurveTo(
      -w * 0.04,
      -h * 0.96 + roofCrushY,
      w * 0.16,
      -h * 0.78 + roofCrushY
    );
    ctx.lineTo(w * 0.28, -h * 0.44);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // B-Pillar & Rear Quarter Window Louvers
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.05, -h * 0.82 + roofCrushY);
    ctx.lineTo(-w * 0.06, -h * 0.45);
    ctx.stroke();

    // Sculpted Door Seams, Door Handle & Deformation
    drawDoorDetailsAndDeformation(
      ctx,
      -w * 0.12,
      w * 0.22,
      -h * 0.44,
      5,
      car.accentColor,
      state,
      w,
      h
    );

    // 5. Rally Number "911" Door Plate (only if door is still attached)
    if (state.doorState !== 'detached') {
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-7, -h * 0.31, 23, 12, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#020617';
      ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('911', 4.5, -h * 0.31 + 9);
    }

    // 6. Slanted Oval Porsche Matrix LED Headlight (OFF in Daytime!) & Rear Taillight Bar
    ctx.save();
    ctx.fillStyle = state.headlightsOn ? '#FEF9C3' : '#334155';
    ctx.strokeStyle = state.headlightsOn ? car.accentColor : '#64748B';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(w * 0.43 - frontCrushX, -h * 0.26 + frontCrushY, 4.5, 3.2, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Rear Red Brake Light + Dedicated White Reverse Light Underneath
    ctx.fillStyle = brakeLightActive ? '#FF1E1E' : '#450A0A';
    ctx.fillRect(-w * 0.48 + rearCrushX, -h * 0.38, 5.2, 7.5);
    if (isBraking) {
      ctx.fillStyle = '#FECACA';
      ctx.fillRect(-w * 0.475 + rearCrushX, -h * 0.36, 3.0, 4.2);
    }
    ctx.fillStyle = isReversing ? '#FFFFFF' : '#1E293B';
    ctx.fillRect(-w * 0.48 + rearCrushX, -h * 0.17, 4.6, 4.2);
  } else {
    // === STYLE 1: APEX RED TRAILBLAZER HD (MATCHING ATTACHED REFERENCE ARTWORK 100%) ===
    // Features:
    // - Lifted 4x4 chassis with high wheel-arch clearance exposing Red Coilover Springs
    // - Smart Metallic Sheen Shader (لمعان واقعي للسيارة) on crimson-red 4x4 bodywork
    // - Daytime Headlights & Roof Floodlights strictly OFF in Daytime, ON only in Sunset/Night!
    // - Transparent windows showing orange-tan bucket seat & driver + golden door handle
    // - Black tubular Roof Rack basket + Black raised A-pillar Safari Snorkel (أنبوب سحب الهواء)

    // 1) Volumetric Warm Headlight & Roof Floodlight Glow Cones (STRICTLY ON ONLY IN SUNSET/NIGHT!)
    //    ("إطفاء أضواء الكشافات الأمامية والعلوية للسيارة بالكامل أثناء فترة النهار/الصباح، وتخصيص إضاءتها فقط لأوقات الليل والمغرب")
    if (!state.isExploded && state.headlightsOn && state.frontDamage < 0.88) {
      const coneAlpha = 0.72;
      ctx.save();
      // Front round headlight volumetric cone
      const fHeadX = w * 0.48 - frontCrushX;
      const fHeadY = -h * 0.26 + frontCrushY;
      const fConeGrad = ctx.createLinearGradient(fHeadX, fHeadY, fHeadX + 145, fHeadY + 18);
      fConeGrad.addColorStop(0, `rgba(254, 249, 195, ${coneAlpha})`);
      fConeGrad.addColorStop(0.45, `rgba(254, 240, 138, ${coneAlpha * 0.45})`);
      fConeGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = fConeGrad;
      ctx.beginPath();
      ctx.moveTo(fHeadX, fHeadY - 5);
      ctx.lineTo(fHeadX + 145, fHeadY - 32);
      ctx.lineTo(fHeadX + 145, fHeadY + 42);
      ctx.lineTo(fHeadX, fHeadY + 6);
      ctx.closePath();
      ctx.fill();

      // Upper roof floodlights volumetric cone
      const rLightX = w * 0.12;
      const rLightY = -h * 1.04 + roofCrushY;
      const rConeGrad = ctx.createLinearGradient(rLightX, rLightY, rLightX + 120, rLightY - 10);
      rConeGrad.addColorStop(0, `rgba(254, 240, 138, ${coneAlpha * 0.72})`);
      rConeGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = rConeGrad;
      ctx.beginPath();
      ctx.moveTo(rLightX, rLightY - 4);
      ctx.lineTo(rLightX + 120, rLightY - 26);
      ctx.lineTo(rLightX + 120, rLightY + 18);
      ctx.lineTo(rLightX, rLightY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2) Undercarriage Heavy-Duty Lifted Differential Axle Truss & Chassis Frame
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-halfWB + 6, 4);
    ctx.lineTo(halfWB - 6, 4);
    ctx.lineTo(halfWB - 14, 12);
    ctx.lineTo(-halfWB + 14, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Gearbox / Differential Housing & Tow Hooks
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-14, 7, 28, 7);
    ctx.strokeRect(-14, 7, 28, 7);

    // 3) Rear-Mounted Chunky Knobby Spare Tire on Left Tailgate + Dedicated Spare Tire Rain Impacts & Water Runoff
    if (state.rearBumperState !== 'detached') {
      const spX = -w * 0.48 + rearCrushX;
      const spY = -h * 0.46 + state.rearDamage * 4;
      ctx.save();
      ctx.translate(spX, spY);
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#030712';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-9, -16, 15, 32, 4);
      ctx.fill();
      ctx.stroke();
      // Knobby spare tire tread lugs
      ctx.fillStyle = '#1F2937';
      for (let ty = -13; ty <= 11; ty += 5) {
        ctx.fillRect(-10.5, ty, 5, 3);
      }
      // Spare tire mounting bracket
      ctx.fillStyle = '#334155';
      ctx.fillRect(-5, -5, 11, 10);

      // Natural, Semi-Transparent Spare Tire Rain Splashes (Zero glowing/neon outline!)
      if (!state.isExploded && state.rainIntensity > 0.05) {
        const spRainAlpha = Math.min(0.42, 0.24 + state.rainIntensity * 0.32);
        const tSp = performance.now() * 0.001;
        ctx.strokeStyle = `rgba(203, 213, 225, ${spRainAlpha})`;
        ctx.fillStyle = `rgba(203, 213, 225, ${spRainAlpha})`;
        ctx.lineWidth = 1.0;

        const spareSplashSpots = [
          { x: -2, y: -16.2, seed: 0.6 }, // Top crown
          { x: -8.8, y: -14.0, seed: 1.4 }, // Top-left lug
          { x: 4.5, y: -13.5, seed: 2.2 }, // Top-right inner tread
          { x: -10.4, y: -8.0, seed: 3.0 }, // Upper-mid outer lug
          { x: -2.0, y: -6.0, seed: 3.8 }, // Upper sidewall/bracket
          { x: -10.4, y: -1.5, seed: 4.6 }, // Center outer lug
          { x: 2.5, y: 0.0, seed: 5.4 }, // Center mounting hub
          { x: -10.4, y: 5.0, seed: 6.2 }, // Lower-mid outer lug
          { x: -2.0, y: 7.5, seed: 7.0 }, // Lower sidewall
          { x: -8.8, y: 12.5, seed: 7.8 }, // Bottom-left lug
          { x: -2.0, y: 15.8, seed: 8.6 }, // Bottom crown
        ];
        ctx.beginPath();
        for (let s = 0; s < spareSplashSpots.length; s++) {
          const pt = spareSplashSpots[s];
          const phase = (tSp * 8.2 + pt.seed * 2.3) % 1;
          if (phase < 0.68) {
            const pNorm = phase / 0.68;
            const spread = 1.6 + pNorm * 4.2;
            const lift = (1 - pNorm) * 4.4;
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x - spread, pt.y - lift);
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(pt.x + spread * 0.85, pt.y - lift);
          } else {
            const dNorm = (phase - 0.68) / 0.32;
            const trickleY = pt.y + dNorm * 7.5;
            ctx.moveTo(pt.x, trickleY);
            ctx.lineTo(pt.x - 0.5, trickleY + 3.2);
          }
        }
        ctx.stroke();

        // Standard semi-transparent micro-droplets on spare tire
        ctx.beginPath();
        for (let s = 0; s < spareSplashSpots.length; s += 2) {
          const pt = spareSplashSpots[s];
          const phase = (tSp * 8.2 + pt.seed * 2.3) % 1;
          if (phase < 0.58) {
            const pNorm = phase / 0.58;
            const bx = pt.x - (1.4 + pNorm * 3.6);
            const by = pt.y - Math.sin(pNorm * Math.PI) * 4.2;
            ctx.moveTo(bx + 0.95, by);
            ctx.arc(bx, by, 0.95, 0, Math.PI * 2);
          }
        }
        ctx.fill();
      }
      ctx.restore();
    }

    // 4) Rear External Angled Roll-Cage Struts (Behind Rear Cabin Window)
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-w * 0.41 + rearCrushX, -h * 0.48);
    ctx.lineTo(-w * 0.31 + rearCrushX, -h * 0.94 + roofCrushY);
    ctx.stroke();
    ctx.strokeStyle = paintMidLight;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.4 + rearCrushX, -h * 0.48);
    ctx.lineTo(-w * 0.3 + rearCrushX, -h * 0.94 + roofCrushY);
    ctx.stroke();

    // 5) Main 4x4 SUV Body with Uniform Solid Paint, Starry Galaxy, or Animated Dual Neon Blend & Smart Metallic Sheen Shader
    const bodyGrad = dualNeon
      ? createAnimatedDualNeonGradient(ctx, -w * 0.48, -h * 0.98, w * 0.49, 8, dualNeon, neonNowSec)
      : starryGalaxy
      ? createStarryGalaxyGradient(ctx, -w * 0.48, -h * 0.98, w * 0.49, 8, starryGalaxy, neonNowSec)
      : ctx.createLinearGradient(0, -h * 0.98, 0, 8);
    if (!dualNeon && !starryGalaxy) {
      bodyGrad.addColorStop(0, paintLight);
      bodyGrad.addColorStop(0.18, paintMidLight);
      bodyGrad.addColorStop(0.45, primaryPaint);
      bodyGrad.addColorStop(
        Math.min(0.78, 0.52 + sheenShift * 0.2),
        paintMidDark
      );
      bodyGrad.addColorStop(1, secondaryPaint);
    }

    ctx.save();
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = paintDeepStroke;
    ctx.lineWidth = 2.0;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-w * 0.45 + rearCrushX, 6);
    ctx.lineTo(-w * 0.45 + rearCrushX, -h * 0.46);
    ctx.quadraticCurveTo(
      -w * 0.45 + rearCrushX,
      -h * 0.5,
      -w * 0.37 + rearCrushX,
      -h * 0.5
    );
    ctx.lineTo(-w * 0.31 + rearCrushX, -h * 0.91 + roofCrushY);
    ctx.quadraticCurveTo(
      -w * 0.29 + rearCrushX,
      -h * 0.96 + roofCrushY,
      -w * 0.24 + rearCrushX,
      -h * 0.96 + roofCrushY
    );
    ctx.lineTo(w * 0.11, -h * 0.96 + roofCrushY);
    ctx.quadraticCurveTo(
      w * 0.16,
      -h * 0.96 + roofCrushY,
      w * 0.18,
      -h * 0.9 + roofCrushY
    );
    ctx.lineTo(w * 0.26, -h * 0.49);
    ctx.lineTo(w * 0.46 - frontCrushX, -h * 0.43 + frontCrushY);
    ctx.quadraticCurveTo(
      w * 0.49 - frontCrushX,
      -h * 0.41 + frontCrushY,
      w * 0.49 - frontCrushX,
      -h * 0.34 + frontCrushY
    );
    ctx.lineTo(w * 0.49 - frontCrushX, 5);
    ctx.closePath();
    ctx.fill();

    // Smart Metallic Sheen Shader (Neutral Clear-Coat Gloss Band & Horizon Reflection without yellow tint)
    if (!state.isExploded) {
      ctx.save();
      ctx.clip();
      const glossCenter = -w * 0.25 + sheenShift * (w * 0.55);
      const sheenGrad = ctx.createLinearGradient(
        glossCenter - 36,
        -h,
        glossCenter + 36,
        10
      );
      sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      sheenGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0.2)');
      sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.28)');
      sheenGrad.addColorStop(0.58, 'rgba(255, 255, 255, 0.2)');
      sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = sheenGrad;
      ctx.fillRect(-w * 0.55, -h * 1.05, w * 1.1, h * 1.2);

      // Upper door/hood horizon clear-coat reflection band
      const horizonGloss = ctx.createLinearGradient(0, -h * 0.52, 0, -h * 0.22);
      horizonGloss.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      horizonGloss.addColorStop(0.35, 'rgba(255, 255, 255, 0.08)');
      horizonGloss.addColorStop(1, 'rgba(0, 0, 0, 0.14)');
      ctx.fillStyle = horizonGloss;
      ctx.fillRect(-w * 0.5, -h * 0.52, w, h * 0.34);

      // Animated Sparkling Star Particles & Glimmer Dots for Starry Galaxy Paints
      if (starryGalaxy) {
        drawStarryGalaxySparkles(ctx, -w * 0.48, -h * 0.96, w * 0.96, h * 1.02, starryGalaxy, neonNowSec);
      }
      ctx.restore();
    }

    ctx.stroke();

    // Inner Crisp Anti-Aliased Vector Rim Highlight around Chassis Edge matching paintLight / Dual Neon Pulse (Strictly Contained on Car Body, Zero Outer Light Beams!)
    if (!state.isExploded) {
      if (dualNeon) {
        ctx.save();
        ctx.strokeStyle = createAnimatedDualNeonGradient(
          ctx,
          -w * 0.48,
          -h * 0.96,
          w * 0.49,
          6,
          dualNeon,
          neonNowSec + 0.45
        );
        ctx.globalAlpha = 0.78 + neonPulse * 0.22;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.strokeStyle = paintLight;
        ctx.globalAlpha = 0.42;
        ctx.lineWidth = 1.0;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    }
    ctx.restore();

    // Roof Specular Highlight Only (No yellow side stripe along the car body!)
    if (!state.isExploded) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-w * 0.27 + rearCrushX, -h * 0.93 + roofCrushY);
      ctx.lineTo(w * 0.12, -h * 0.93 + roofCrushY);
      ctx.stroke();
    }

    // 6) Rear Passenger Window (Real Automotive Glass Tint + Multi-Band Light Reflection Glare)
    ctx.fillStyle = 'rgba(9, 15, 28, 0.72)';
    ctx.beginPath();
    ctx.moveTo(-w * 0.28 + rearCrushX, -h * 0.88 + roofCrushY);
    ctx.lineTo(-w * 0.08, -h * 0.88 + roofCrushY);
    ctx.lineTo(-w * 0.08, -h * 0.51);
    ctx.lineTo(-w * 0.34 + rearCrushX, -h * 0.51);
    ctx.closePath();
    ctx.fill();
    const rearGlassGrad = ctx.createLinearGradient(
      -w * 0.32,
      -h * 0.88 + roofCrushY,
      -w * 0.08,
      -h * 0.51
    );
    rearGlassGrad.addColorStop(0, `rgba(56, 189, 248, ${glassFillAlpha * 0.95})`);
    rearGlassGrad.addColorStop(0.5, `rgba(186, 230, 253, ${glassFillAlpha * 1.15})`);
    rearGlassGrad.addColorStop(1, `rgba(14, 116, 144, ${glassFillAlpha * 0.85})`);
    ctx.fillStyle = rearGlassGrad;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    if (!state.windowShattered) {
      // Rear window diagonal glass light reflection glare streaks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.58)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-w * 0.22 + rearCrushX, -h * 0.85 + roofCrushY);
      ctx.lineTo(-w * 0.14, -h * 0.54);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.38)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-w * 0.17 + rearCrushX, -h * 0.85 + roofCrushY);
      ctx.lineTo(-w * 0.10, -h * 0.56);
      ctx.stroke();
    }

    // 7) Front Driver Transparent Window + Orange-Tan Bucket Seat & Physics Driver Inside Cabin!
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-w * 0.03, -h * 0.88 + roofCrushY);
    ctx.lineTo(w * 0.13, -h * 0.88 + roofCrushY);
    ctx.lineTo(w * 0.23, -h * 0.51);
    ctx.lineTo(-w * 0.03, -h * 0.51);
    ctx.closePath();
    ctx.fillStyle = 'rgba(9, 15, 28, 0.42)';
    ctx.fill();
    ctx.clip();
    drawPhysicsDriverInCabin(ctx, 2.5, -h * 0.49, state, '#F59E0B', '#334155');
    ctx.restore();

    // Transparent Front Windshield & Side Glass Overlay with Tint & Specular Glare
    const frontGlassGrad = ctx.createLinearGradient(
      -w * 0.03,
      -h * 0.88 + roofCrushY,
      w * 0.23,
      -h * 0.51
    );
    frontGlassGrad.addColorStop(0, `rgba(56, 189, 248, ${glassFillAlpha * 0.88})`);
    frontGlassGrad.addColorStop(0.55, `rgba(224, 242, 254, ${glassFillAlpha * 1.08})`);
    frontGlassGrad.addColorStop(1, `rgba(14, 165, 233, ${glassFillAlpha * 0.75})`);
    ctx.fillStyle = frontGlassGrad;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.03, -h * 0.88 + roofCrushY);
    ctx.lineTo(w * 0.13, -h * 0.88 + roofCrushY);
    ctx.lineTo(w * 0.23, -h * 0.51);
    ctx.lineTo(-w * 0.03, -h * 0.51);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (!state.windowShattered) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(w * 0.04, -h * 0.85 + roofCrushY);
      ctx.lineTo(w * 0.15, -h * 0.53);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.42)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(w * 0.09, -h * 0.85 + roofCrushY);
      ctx.lineTo(w * 0.19, -h * 0.54);
      ctx.stroke();
    }

    // 8) Sculpted Door Seams, Matching Door Handle & Deformation
    drawDoorDetailsAndDeformation(
      ctx,
      -w * 0.04,
      w * 0.23,
      -h * 0.48,
      5,
      primaryPaint,
      state,
      w,
      h
    );

    // 9) BLACK TUBULAR ROOF RACK BASKET + 3 ROUND FLOODLIGHTS (OFF in Daytime, ON in Sunset/Night!)
    ctx.save();
    // Tubular Roof Rack Rails & Stanchions
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-w * 0.28 + rearCrushX, -h * 1.07 + roofCrushY, w * 0.4, 4.5, 2);
    ctx.fill();
    ctx.stroke();
    for (let rx = -w * 0.25; rx <= w * 0.08; rx += w * 0.11) {
      ctx.fillRect(rx, -h * 1.03 + roofCrushY, 3, 4.5);
    }

    // 3 Round Floodlight Pods on Front of Roof Rack (OFF in Daytime, Glowing in Sunset/Night!)
    const podOffsets = [w * 0.07, w * 0.11, w * 0.15];
    podOffsets.forEach((px) => {
      const py = -h * 1.04 + roofCrushY;
      // Pod housing
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(px - 1.5, py, 3.8, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Circular floodlight lens (Dark unlit reflector in Daytime, Glowing in Night/Sunset!)
      ctx.fillStyle = state.headlightsOn ? '#FEF08A' : '#334155';
      ctx.strokeStyle = state.headlightsOn ? '#F59E0B' : '#64748B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(px, py, 2.8, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (state.headlightsOn) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(px + 0.6, py, 1.4, 2.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    // 10) BLACK RAISED A-PILLAR SAFARI SNORKEL (أنبوب سحب الهواء الأسود — Snorkel)
    ctx.save();
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    // Ram-air intake head at roof level
    ctx.moveTo(w * 0.18, -h * 1.03 + roofCrushY);
    ctx.lineTo(w * 0.24, -h * 1.03 + roofCrushY);
    ctx.lineTo(w * 0.24, -h * 0.96 + roofCrushY);
    ctx.lineTo(w * 0.21, -h * 0.96 + roofCrushY);
    // Diagonal pipe down along right A-pillar
    ctx.lineTo(w * 0.29, -h * 0.5);
    // Horizontal base pipe along hood side
    ctx.lineTo(w * 0.39, -h * 0.47);
    ctx.lineTo(w * 0.39, -h * 0.42);
    ctx.lineTo(w * 0.26, -h * 0.45);
    ctx.lineTo(w * 0.17, -h * 0.96 + roofCrushY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Amber intake grille on front of snorkel head
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(w * 0.23, -h * 1.02 + roofCrushY, 2, 5);
    ctx.restore();

    // 11) ROUND FRONT HEADLIGHT (OFF IN DAYTIME!), AMBER SIGNAL & HEAVY STEEL BUMPER
    ctx.save();
    const noseX = w * 0.45 - frontCrushX;
    const noseY = -h * 0.36 + frontCrushY;
    // Dark Headlight Bezel
    ctx.fillStyle = '#1E293B';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(noseX - 1, noseY, 7.5, 16, 2);
    ctx.fill();
    ctx.stroke();

    // Round/Oval Headlight Lens (Unlit crystal reflector in Daytime, Glowing in Sunset/Night, or Cracked/Shattered when Broken!)
    ctx.fillStyle = state.headlightsBroken
      ? '#090D16'
      : state.headlightsOn
      ? '#FEF9C3'
      : '#334155';
    ctx.strokeStyle = state.headlightsBroken
      ? '#475569'
      : state.headlightsOn
      ? '#F59E0B'
      : '#64748B';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(noseX + 4.5, noseY + 8, 3.2, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (state.headlightsBroken) {
      // Jagged cracked glass lines across broken headlight
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(noseX + 2, noseY + 4);
      ctx.lineTo(noseX + 6.5, noseY + 11);
      ctx.moveTo(noseX + 6.5, noseY + 5);
      ctx.lineTo(noseX + 2.5, noseY + 11);
      ctx.stroke();
    } else if (state.headlightsOn) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.ellipse(noseX + 5, noseY + 8, 1.6, 3.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Front & Rear Heavy Steel Off-Road Bumpers
    if (state.frontBumperState !== 'detached') {
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(w * 0.42 - frontCrushX, -2, 13, 9, 2.5);
      ctx.fill();
      ctx.stroke();
      // Amber fog indicator in bumper (only lit when headlightsOn)
      ctx.fillStyle = state.headlightsOn ? '#F97316' : '#475569';
      ctx.beginPath();
      ctx.arc(w * 0.49 - frontCrushX, 2.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (state.rearBumperState !== 'detached') {
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-w * 0.49 + rearCrushX, -2, 11, 8, 2);
      ctx.fill();
      ctx.stroke();
    }

    // Rear Red Brake Light & Dedicated White Reverse Lamp Directly Underneath
    ctx.fillStyle = brakeLightActive ? '#FF1E1E' : '#7F1D1D';
    ctx.fillRect(-w * 0.465 + rearCrushX, -h * 0.4, 5.0, 9.5);
    if (isBraking) {
      ctx.fillStyle = '#FECACA';
      ctx.fillRect(-w * 0.46 + rearCrushX, -h * 0.38, 3.2, 5.8);
    }
    // White Reverse Light directly below the Red Brake Light
    ctx.fillStyle = isReversing ? '#FFFFFF' : '#1E293B';
    ctx.strokeStyle = isReversing ? '#E0F2FE' : '#475569';
    ctx.lineWidth = 0.8;
    ctx.fillRect(-w * 0.465 + rearCrushX, -h * 0.18, 4.8, 4.6);
    ctx.strokeRect(-w * 0.465 + rearCrushX, -h * 0.18, 4.8, 4.6);
    ctx.restore();
  }

  // Dynamic Daytime & Nighttime Roof Specular Sheen (No yellow side beltline stripe!)
  if (!state.isExploded) {
    ctx.save();
    if (state.nightFactor > 0.35) {
      const moonAlpha = Math.min(0.65, state.nightFactor * 0.62);
      const moonCarGrad = ctx.createLinearGradient(
        -w * 0.38,
        -h * 1.02 + roofCrushY,
        w * 0.46,
        -h * 0.18
      );
      moonCarGrad.addColorStop(0, `rgba(224, 242, 254, ${moonAlpha * 0.88})`);
      moonCarGrad.addColorStop(0.5, `rgba(186, 230, 253, ${moonAlpha * 0.48})`);
      moonCarGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
      ctx.strokeStyle = moonCarGrad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-w * 0.28 + rearCrushX, -h * 0.94 + roofCrushY);
      ctx.lineTo(w * 0.14, -h * 0.94 + roofCrushY);
      ctx.stroke();
    } else if (state.cloudDarkness < 0.65) {
      const sunAlpha = Math.max(0.2, (1 - state.cloudDarkness) * 0.52);
      const sunCarGrad = ctx.createLinearGradient(
        -w * 0.35,
        -h * 1.02 + roofCrushY,
        w * 0.46,
        -h * 0.2
      );
      sunCarGrad.addColorStop(0, `rgba(255, 255, 255, ${sunAlpha * 0.9})`);
      sunCarGrad.addColorStop(0.55, `rgba(241, 245, 249, ${sunAlpha * 0.55})`);
      sunCarGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.strokeStyle = sunCarGrad;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-w * 0.28 + rearCrushX, -h * 0.94 + roofCrushY);
      ctx.lineTo(w * 0.15, -h * 0.94 + roofCrushY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // =========================================================================
  // 3A-2. DYNAMIC OVERHEAD STREET LIGHT ILLUMINATION & REFLECTION ON CAR BODY
  //       Strictly active ONLY when driving on/near the ground road!
  //       Completely disabled when transforming into an airplane or flying in the sky!
  // =========================================================================
  if (
    !state.isExploded &&
    state.flightPhase === 'none' &&
    state.wingDeployProgress <= 0.02 &&
    altitude < 58
  ) {
    const streetLightState = getStreetLightState(state.weatherCycleSec);
    if (streetLightState.isOn && streetLightState.intensity > 0.01) {
      const groundProximity = Math.max(
        0,
        Math.min(1, 1 - Math.max(0, altitude - 16) / 42)
      );
      const nearestPoleIdx = Math.round(
        (state.x - STREET_LIGHT_START_X - STREET_LIGHT_ARM_REACH_X) /
          STREET_LIGHT_INTERVAL
      );
      const rawPoleX =
        STREET_LIGHT_START_X + nearestPoleIdx * STREET_LIGHT_INTERVAL;
      const poleX = resolveStreetLightPoleX(rawPoleX, state.obstacles);
      if (Number.isFinite(poleX)) {
        const lampWorldX = poleX + STREET_LIGHT_ARM_REACH_X;
        const dx = state.x - lampWorldX;
        const coneRadius = 132;
        if (Math.abs(dx) < coneRadius) {
          const passRaw = Math.cos((dx / coneRadius) * (Math.PI * 0.5));
          const passFactor =
            Math.pow(Math.max(0, passRaw), 1.45) *
            streetLightState.intensity *
            groundProximity;

          if (passFactor > 0.01) {
            ctx.save();
            // Sweep position across the car body: +48 (front hood) -> 0 (roof/cabin) -> -48 (rear trunk)
            const sweepX = Math.max(-52, Math.min(52, -dx * 0.58));

            // 1. Warm Golden-Amber Overhead Street Light Glow Across Car Body
            const carGlowGrad = ctx.createRadialGradient(
              sweepX,
              -h * 0.78,
              4,
              sweepX,
              -h * 0.48,
              w * 0.58
            );
            carGlowGrad.addColorStop(
              0,
              `rgba(255, 251, 235, ${0.52 * passFactor})`
            );
            carGlowGrad.addColorStop(
              0.38,
              `rgba(253, 224, 71, ${0.34 * passFactor})`
            );
            carGlowGrad.addColorStop(
              0.72,
              `rgba(245, 158, 11, ${0.16 * passFactor})`
            );
            carGlowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

            ctx.fillStyle = carGlowGrad;
            ctx.beginPath();
            ctx.ellipse(sweepX * 0.62, -h * 0.52, w * 0.52, h * 0.46, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Traveling Specular Metallic Reflection Ribbon Along Roof, Windshield & Hood
            const specSweepGrad = ctx.createLinearGradient(
              sweepX - 36,
              -h * 0.95,
              sweepX + 36,
              -h * 0.35
            );
            specSweepGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            specSweepGrad.addColorStop(
              0.5,
              `rgba(254, 249, 195, ${0.72 * passFactor})`
            );
            specSweepGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.strokeStyle = specSweepGrad;
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(-w * 0.28 + rearCrushX, -h * 0.94 + roofCrushY);
            ctx.lineTo(w * 0.15, -h * 0.94 + roofCrushY);
            ctx.stroke();

            ctx.restore();
          }
        }
      }

      // 3A-2B. DYNAMIC BRIDGE PILLAR LAMPS & DECK LIGHTS CASTING ONTO CAR BODY, WINDOWS & CHASSIS:
      //        Smoothly updates ambient golden reflection, window glass glare, and lower chassis glow
      //        based on the car's real-time proximity to each bridge pillar lamp and middle deck light source!
      if (state.obstacles && state.obstacles.length > 0) {
        for (let bIdx = 0; bIdx < state.obstacles.length; bIdx++) {
          const obs = state.obstacles[bIdx];
          if (obs.type !== 'suspension_bridge') continue;
          const halfSpan = obs.width * 0.5;
          const leftBankX = obs.x - halfSpan;
          const rightBankX = obs.x + halfSpan;

          // A) Left & Right Main Pillar Lamps casting onto Car Body, Windows & Upper Chassis
          const pillarXs = [leftBankX, rightBankX];
          const pillarReach = 118;
          for (let p = 0; p < 2; p++) {
            const pillarX = pillarXs[p];
            const dxPillar = state.x - pillarX;
            if (Math.abs(dxPillar) < pillarReach) {
              const pRaw = Math.cos((dxPillar / pillarReach) * (Math.PI * 0.5));
              const pFactor =
                Math.pow(Math.max(0, pRaw), 1.35) *
                streetLightState.intensity *
                groundProximity;

              if (pFactor > 0.01) {
                ctx.save();
                // Local X position of the pillar light sweep across the car (+w*0.46 at front hood -> 0 at cabin/windows -> -w*0.46 at rear)
                const pSweepX = Math.max(
                  -w * 0.48,
                  Math.min(w * 0.48, -dxPillar * 0.62)
                );

                // 1) Warm golden atmospheric light overlay across Car Body & Chassis
                const pillarBodyGrad = ctx.createRadialGradient(
                  pSweepX,
                  -h * 0.72,
                  4,
                  pSweepX,
                  -h * 0.44,
                  w * 0.58
                );
                pillarBodyGrad.addColorStop(
                  0,
                  `rgba(255, 251, 235, ${0.58 * pFactor})`
                );
                pillarBodyGrad.addColorStop(
                  0.36,
                  `rgba(253, 224, 71, ${0.40 * pFactor})`
                );
                pillarBodyGrad.addColorStop(
                  0.72,
                  `rgba(245, 158, 11, ${0.18 * pFactor})`
                );
                pillarBodyGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
                ctx.fillStyle = pillarBodyGrad;
                ctx.beginPath();
                ctx.ellipse(
                  pSweepX * 0.65,
                  -h * 0.48,
                  w * 0.54,
                  h * 0.48,
                  0,
                  0,
                  Math.PI * 2
                );
                ctx.fill();

                // 2) Warm golden light reflection across the Car Windows (Windshield & Side/Rear Glass)
                const winDist = Math.abs(pSweepX + w * 0.04);
                if (winDist < w * 0.42 && !state.windowShattered) {
                  const winGlow =
                    Math.max(0, 1 - winDist / (w * 0.42)) * pFactor;
                  const winGrad = ctx.createLinearGradient(
                    pSweepX - 24,
                    -h * 0.88,
                    pSweepX + 24,
                    -h * 0.48
                  );
                  winGrad.addColorStop(0, 'rgba(255, 251, 235, 0)');
                  winGrad.addColorStop(
                    0.45,
                    `rgba(254, 240, 138, ${0.52 * winGlow})`
                  );
                  winGrad.addColorStop(
                    0.55,
                    `rgba(255, 251, 235, ${0.68 * winGlow})`
                  );
                  winGrad.addColorStop(1, 'rgba(253, 224, 71, 0)');
                  ctx.fillStyle = winGrad;
                  ctx.fillRect(-w * 0.34, -h * 0.89, w * 0.62, h * 0.4);
                }

                // 3) Traveling warm golden specular highlight along the Roofline
                const specGrad = ctx.createLinearGradient(
                  pSweepX - 34,
                  -h * 0.94,
                  pSweepX + 34,
                  -h * 0.38
                );
                specGrad.addColorStop(0, 'rgba(255, 251, 235, 0)');
                specGrad.addColorStop(
                  0.5,
                  `rgba(254, 240, 138, ${0.72 * pFactor})`
                );
                specGrad.addColorStop(1, 'rgba(255, 251, 255, 0)');
                ctx.strokeStyle = specGrad;
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(-w * 0.28 + rearCrushX, -h * 0.94 + roofCrushY);
                ctx.lineTo(w * 0.15, -h * 0.94 + roofCrushY);
                ctx.stroke();

                ctx.restore();
              }
            }
          }
        }
      }
    }
  }

  // Sculpted Black Off-Road Wheel Arch Fender Flares & High-Clearance Cutouts (Lifted to expose Red Suspension Springs!)
  ctx.fillStyle = '#04070E';
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(-halfWB, 9, car.wheelRadius + 1.5, Math.PI * 1.04, -0.04, false);
  ctx.stroke();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(halfWB, 9, car.wheelRadius + 1.5, Math.PI * 1.04, -0.04, false);
  ctx.stroke();
  ctx.fill();

  // =========================================================================
  // 3A-3. DYNAMIC MIDNIGHT LIGHTNING ILLUMINATION & RAIN SPLASHES ON CAR BODYWORK
  // =========================================================================
  if (!state.isExploded && state.lightningFlash > 0.04) {
    ctx.save();
    const lAlpha = Math.min(0.82, state.lightningFlash * 0.76);
    const carBoltGrad = ctx.createLinearGradient(0, -h * 1.02, 0, 4);
    carBoltGrad.addColorStop(0, `rgba(224, 242, 254, ${lAlpha})`);
    carBoltGrad.addColorStop(0.5, `rgba(56, 189, 248, ${lAlpha * 0.45})`);
    carBoltGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = carBoltGrad;
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.52, w * 0.48, h * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.95, lAlpha * 1.15)})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-w * 0.3 + rearCrushX, -h * 0.94 + roofCrushY);
    ctx.lineTo(w * 0.16, -h * 0.94 + roofCrushY);
    ctx.moveTo(w * 0.16, -h * 0.88 + roofCrushY);
    ctx.lineTo(w * 0.28, -h * 0.44);
    ctx.lineTo(w * 0.47 - frontCrushX, -h * 0.36 + frontCrushY);
    ctx.stroke();
    ctx.restore();
  }

  if (!state.isExploded && state.rainIntensity > 0.05) {
    ctx.save();
    const tNow = performance.now() * 0.001;
    const carRainAlpha = Math.min(0.96, 0.48 + state.rainIntensity * 0.48);
    ctx.strokeStyle = `rgba(224, 242, 254, ${carRainAlpha})`;
    ctx.fillStyle = `rgba(255, 255, 255, ${carRainAlpha})`;
    ctx.lineWidth = 1.35;

    // Comprehensive Raindrop Impact & Splash Points Covering the ENTIRE Car Bodywork & Rear Spare Tire:
    // Roof, Roof Rack, Front Windshield Frame, Rear Window Frame, Side Doors, Front Hood, Fenders, and Full Rear Spare Tire!
    const carImpactZones = [
      // 1) Rear Spare Tire (Full multi-point raindrop landing, impact & scatter across top crown, outer tread, sidewall & hub mount)
      { x: -w * 0.48 + rearCrushX - 1.5, y: -h * 0.46 - 17 + state.rearDamage * 4, seed: 0.1 },
      { x: -w * 0.48 + rearCrushX - 6.0, y: -h * 0.46 - 14 + state.rearDamage * 4, seed: 0.35 },
      { x: -w * 0.48 + rearCrushX - 9.5, y: -h * 0.46 - 9 + state.rearDamage * 4, seed: 0.6 },
      { x: -w * 0.48 + rearCrushX - 10.2, y: -h * 0.46 - 3 + state.rearDamage * 4, seed: 0.82 },
      { x: -w * 0.48 + rearCrushX - 9.5, y: -h * 0.46 + 3 + state.rearDamage * 4, seed: 1.05 },
      { x: -w * 0.48 + rearCrushX - 6.0, y: -h * 0.46 + 8 + state.rearDamage * 4, seed: 1.25 },
      // 2) Full Roof & Roof Rack Coverage (from rear roof edge to front roof visor)
      { x: -w * 0.29 + rearCrushX, y: -h * 0.94 + roofCrushY, seed: 1.4 },
      { x: -w * 0.22 + rearCrushX * 0.7, y: -h * 0.96 + roofCrushY, seed: 1.8 },
      { x: -w * 0.14, y: -h * 1.05 + roofCrushY, seed: 2.2 },
      { x: -w * 0.06, y: -h * 0.96 + roofCrushY, seed: 2.6 },
      { x: w * 0.02, y: -h * 1.05 + roofCrushY, seed: 3.0 },
      { x: w * 0.09, y: -h * 0.95 + roofCrushY, seed: 3.4 },
      { x: w * 0.16, y: -h * 0.93 + roofCrushY, seed: 3.8 },
      // 3) Front Windshield Frame & Slanted A-Pillar Frame (top header, mid-pillar, lower cowl & window frame)
      { x: w * 0.05, y: -h * 0.88 + roofCrushY, seed: 4.2 },
      { x: w * 0.15, y: -h * 0.86 + roofCrushY * 0.8, seed: 4.6 },
      { x: w * 0.19, y: -h * 0.74 + roofCrushY * 0.5, seed: 5.0 },
      { x: w * 0.23, y: -h * 0.61 + roofCrushY * 0.3, seed: 5.4 },
      { x: w * 0.26, y: -h * 0.50, seed: 5.8 },
      { x: w * 0.08, y: -h * 0.51, seed: 6.2 },
      // 4) Rear Window Frame, C-Pillar & B-Pillar Frame (upper frame, rear slant pillar, center pillar & lower sill)
      { x: -w * 0.28 + rearCrushX, y: -h * 0.88 + roofCrushY, seed: 6.6 },
      { x: -w * 0.18 + rearCrushX * 0.5, y: -h * 0.88 + roofCrushY, seed: 7.0 },
      { x: -w * 0.08, y: -h * 0.88 + roofCrushY, seed: 7.4 },
      { x: -w * 0.32 + rearCrushX, y: -h * 0.72 + roofCrushY * 0.5, seed: 7.8 },
      { x: -w * 0.36 + rearCrushX, y: -h * 0.52, seed: 8.2 },
      { x: -w * 0.21 + rearCrushX * 0.5, y: -h * 0.51, seed: 8.6 },
      { x: -w * 0.05, y: -h * 0.70 + roofCrushY * 0.4, seed: 9.0 },
      // 5) Side Doors & Full Side Bodywork Panels (upper beltline, door handle, mid-door skin, lower door rocker & rear quarter panel)
      { x: -w * 0.38 + rearCrushX, y: -h * 0.44, seed: 9.4 },
      { x: -w * 0.24 + rearCrushX * 0.5, y: -h * 0.38, seed: 9.8 },
      { x: -w * 0.12, y: -h * 0.42, seed: 10.2 },
      { x: -w * 0.02, y: -h * 0.36, seed: 10.6 },
      { x: w * 0.09, y: -h * 0.38, seed: 11.0 },
      { x: w * 0.19, y: -h * 0.40, seed: 11.4 },
      { x: -w * 0.28 + rearCrushX * 0.5, y: -h * 0.22, seed: 11.8 },
      { x: -w * 0.14, y: -h * 0.24, seed: 12.2 },
      { x: w * 0.01, y: -h * 0.22, seed: 12.6 },
      { x: w * 0.14, y: -h * 0.24, seed: 13.0 },
      { x: -w * 0.18, y: -h * 0.08, seed: 13.4 },
      { x: -w * 0.02, y: -h * 0.07, seed: 13.8 },
      { x: w * 0.14, y: -h * 0.08, seed: 14.2 },
      // 6) Front Hood, Front Fender Panels & Nose
      { x: w * 0.31, y: -h * 0.45 + frontCrushY * 0.5, seed: 14.6 },
      { x: w * 0.39 - frontCrushX * 0.5, y: -h * 0.42 + frontCrushY * 0.8, seed: 15.0 },
      { x: w * 0.46 - frontCrushX, y: -h * 0.38 + frontCrushY, seed: 15.4 },
      { x: w * 0.34, y: -h * 0.24 + frontCrushY * 0.5, seed: 15.8 },
      { x: w * 0.44 - frontCrushX, y: -h * 0.18 + frontCrushY, seed: 16.2 },
    ];

    ctx.beginPath();
    for (let cIdx = 0; cIdx < carImpactZones.length; cIdx++) {
      const cz = carImpactZones[cIdx];
      const phase = (tNow * 7.6 + cz.seed * 2.9) % 1;
      if (phase < 0.66) {
        const pNorm = phase / 0.66;
        const spreadX = 1.8 + pNorm * 5.6;
        const liftY = (1 - pNorm) * 5.8;
        ctx.moveTo(cz.x, cz.y);
        ctx.lineTo(cz.x - spreadX, cz.y - liftY);
        ctx.moveTo(cz.x, cz.y);
        ctx.lineTo(cz.x + spreadX, cz.y - liftY);
      } else {
        // Water rivulet / droplet trickling down the side doors, window frames & bodywork panels
        const dNorm = (phase - 0.66) / 0.34;
        const trickleY = cz.y + dNorm * 11;
        ctx.moveTo(cz.x, trickleY);
        ctx.lineTo(cz.x - 0.8, trickleY + 4.2);
      }
    }
    ctx.stroke();

    // Bouncing water micro-droplets across the Roof, Windshield Frame, Rear Window Frame, Side Doors & Spare Tire
    ctx.beginPath();
    for (let cIdx = 0; cIdx < carImpactZones.length; cIdx += 2) {
      const cz = carImpactZones[cIdx];
      const phase = (tNow * 7.6 + cz.seed * 2.9) % 1;
      if (phase < 0.58) {
        const pNorm = phase / 0.58;
        const bx = cz.x + (cIdx % 4 === 0 ? -1 : 1) * (1.8 + pNorm * 4.4);
        const by = cz.y - Math.sin(pNorm * Math.PI) * 5.4;
        ctx.moveTo(bx + 1.15, by);
        ctx.arc(bx, by, 1.15, 0, Math.PI * 2);
      }
    }
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // 3B. MUD SPLATTER COATING ON LOWER CHASSIS & FENDERS (Washes off in Water Pits!)
  //     ("تنظيف الطين: عند مرور السيارة فوق المياه أو دخول الحفرة المائية يتلاشى ويتنظف الطين والوحل المترسب على جسم السيارة وعجلاتها")
  // =========================================================================
  if (state.mudDirtiness > 0.03 && !state.isExploded) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.88, state.mudDirtiness * 0.85);
    ctx.fillStyle = '#451A03';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.2;
    const mudSpots = [
      { x: -w * 0.36, y: 2, rx: 14, ry: 4.5 },
      { x: -w * 0.16, y: 3, rx: 18, ry: 5.2 },
      { x: w * 0.05, y: 2.5, rx: 16, ry: 4.8 },
      { x: w * 0.26, y: 2, rx: 13, ry: 4.2 },
      { x: -w * 0.24, y: -6, rx: 9, ry: 3.2 },
      { x: w * 0.14, y: -5, rx: 10, ry: 3.5 },
    ];
    ctx.beginPath();
    for (const ms of mudSpots) {
      ctx.moveTo(ms.x + ms.rx, ms.y);
      ctx.ellipse(ms.x, ms.y, ms.rx, ms.ry, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // 3C. CINEMATIC CAR-COLORED AIRPLANE WINGS & JET TURBINES (تحول السيارة إلى طائرة بأجنحة بنفس لون السيارة!)
  //     Smoothly unfolds (0 -> 1) during Slow-Mo Takeoff and folds back (1 -> 0) during Landing!
  // =========================================================================
  if (state.wingDeployProgress > 0.01 && !state.isExploded) {
    const wp = Math.max(0, Math.min(1, state.wingDeployProgress));
    ctx.save();

    // 1. Rear Aerodynamic Tail Stabilizer Fin (matching car.bodyColor & car.accentColor)
    const tailFinH = 24 * wp;
    ctx.fillStyle = car.bodyColor;
    ctx.strokeStyle = car.accentColor;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-w * 0.44, -h * 0.45);
    ctx.lineTo(-w * 0.54 - 10 * wp, -h * 0.45 - tailFinH);
    ctx.lineTo(-w * 0.36, -h * 0.45 - tailFinH * 0.82);
    ctx.lineTo(-w * 0.28, -h * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Main Swept-Back 3D Airplane Wing (Painted in the exact same metallic color as the Car!)
    const wingSpanX = (w * 0.62 + 34) * wp;
    const wingLiftY = -h * 0.34 - 16 * wp;
    const wingGrad = ctx.createLinearGradient(
      -wingSpanX * 0.6,
      wingLiftY - 12,
      wingSpanX * 0.4,
      wingLiftY + 14
    );
    wingGrad.addColorStop(0, car.bodyColor);
    wingGrad.addColorStop(0.55, car.secondaryColor);
    wingGrad.addColorStop(1, car.bodyColor);

    ctx.fillStyle = wingGrad;
    ctx.strokeStyle = car.accentColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    // Wing root attached to mid-chassis -> swept wingtip -> aileron trailing edge
    ctx.moveTo(w * 0.22, -h * 0.28);
    ctx.lineTo(-wingSpanX * 0.48, wingLiftY - 14 * wp);
    ctx.lineTo(-wingSpanX * 0.68, wingLiftY - 6 * wp);
    ctx.lineTo(-w * 0.26, -h * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Metallic Wing Ribbing & Accent Stripe
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, -h * 0.25);
    ctx.lineTo(-wingSpanX * 0.52, wingLiftY - 9 * wp);
    ctx.stroke();

    // 3. Under-Wing Twin Jet Turbine Pod & Smart Throttle-Reactive Jet Afterburner Plume
    // ("يكون اللهب خفيفاً وهادئاً أثناء الطيران العادي بدون ضغط دواسة البنزين، ويشتد اللهب ويتعاظم لونه وناره بشكل متوسط عند الضغط على زر البنزين GAS")
    const podX = -w * 0.08;
    const podY = -h * 0.14;
    ctx.fillStyle = '#0F172A';
    ctx.strokeStyle = car.accentColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(podX - 18 * wp, podY - 4.5, 34 * wp, 9, 4);
    ctx.fill();
    ctx.stroke();

    const nozTipX = podX - 18 * wp;
    const isJetThrottle = isGas || isBoosting;
    const jetLen =
      (isBoosting
        ? 64 + Math.sin(performance.now() * 0.06) * 12
        : isGas
        ? 48 + Math.sin(performance.now() * 0.05) * 9
        : 20 + Math.sin(performance.now() * 0.025) * 3.5) * wp;
    const jetHalfH = (isBoosting ? 7.2 : isGas ? 5.8 : 3.0) * wp;

    // Outer Fiery Orange-Gold Afterburner Cone when GAS or NITRO is pressed!
    if (isJetThrottle) {
      const outerJetGrad = ctx.createLinearGradient(
        nozTipX,
        podY,
        nozTipX - jetLen * 1.18,
        podY
      );
      outerJetGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      outerJetGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.88)');
      outerJetGrad.addColorStop(0.78, 'rgba(220, 38, 38, 0.5)');
      outerJetGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = outerJetGrad;
      ctx.beginPath();
      ctx.moveTo(nozTipX, podY - jetHalfH);
      ctx.lineTo(nozTipX - jetLen * 1.15, podY);
      ctx.lineTo(nozTipX, podY + jetHalfH);
      ctx.closePath();
      ctx.fill();
    }

    // Core Plasma Jet Flame (Calm soft blue-cyan when cruising, intense white-cyan-gold core on GAS!)
    const jetGrad = ctx.createLinearGradient(
      nozTipX,
      podY,
      nozTipX - jetLen,
      podY
    );
    jetGrad.addColorStop(0, '#FFFFFF');
    jetGrad.addColorStop(0.35, isJetThrottle ? '#FEF08A' : '#E0F2FE');
    jetGrad.addColorStop(0.7, '#00F0FF');
    jetGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = jetGrad;
    ctx.beginPath();
    ctx.moveTo(nozTipX, podY - jetHalfH * 0.68);
    ctx.lineTo(nozTipX - jetLen * 0.92, podY);
    ctx.lineTo(nozTipX, podY + jetHalfH * 0.68);
    ctx.closePath();
    ctx.fill();

    // Blinking Aviation Wingtip Strobe Light
    ctx.fillStyle =
      Math.floor(performance.now() / 180) % 2 === 0 ? '#00F0FF' : '#FEF08A';
    ctx.beginPath();
    ctx.arc(-wingSpanX * 0.58, wingLiftY - 10 * wp, 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();

  // 4. VISIBLE ANIMATED RED SUSPENSION COIL SPRINGS, RETRACTING LANDING GEAR & FOLDING 3D WHEELS
  //    ("تنسحب العجلات الأربع وتطوى ببطء إلى الداخل لتدخل بالكامل داخل هيكل المركبة / تخرج العجلات ببطء وتفتح إلى الأسفل لتتجهز للمس الأسفلت")
  const springColor = car.style === 'offroad' ? '#EF4444' : car.accentColor;
  if (retractEase < 0.95) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - retractEase * 0.88);
    drawSuspensionCoil(
      ctx,
      rearWheelLocalX,
      rearMountY,
      rearWheelLocalY - 2,
      springColor
    );
    drawSuspensionCoil(
      ctx,
      frontWheelLocalX,
      frontMountY,
      frontWheelLocalY - 2,
      springColor
    );
    ctx.restore();

    // Mechanical Hydraulic Folding Strut Arms visible during wheel retraction / deployment
    if (retractEase > 0.03) {
      ctx.save();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-halfWB * 0.55, 2);
      ctx.lineTo(rearWheelLocalX, rearWheelLocalY);
      ctx.moveTo(halfWB * 0.55, 2);
      ctx.lineTo(frontWheelLocalX, frontWheelLocalY);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Rear & Front 3D Wheels with 3D Inward Folding Perspective as they tuck into the body!
    const wheelFoldScaleX = 1 - retractEase * 0.28;
    const wheelFoldScaleY = Math.max(0.18, 1 - retractEase * 0.78);
    const wheelFoldTilt = retractEase * 0.45;

    ctx.save();
    ctx.translate(rearWheelLocalX, rearWheelLocalY);
    ctx.rotate(wheelFoldTilt);
    ctx.scale(wheelFoldScaleX, wheelFoldScaleY);
    drawWheel3D(
      ctx,
      0,
      0,
      car.wheelRadius,
      state.wheelRotation,
      car.accentColor,
      state.mudDirtiness,
      state.isExploded ? 0 : state.rainIntensity,
      1.1
    );
    ctx.restore();

    ctx.save();
    ctx.translate(frontWheelLocalX, frontWheelLocalY);
    ctx.rotate(-wheelFoldTilt);
    ctx.scale(wheelFoldScaleX, wheelFoldScaleY);
    drawWheel3D(
      ctx,
      0,
      0,
      car.wheelRadius,
      state.wheelRotation,
      car.accentColor,
      state.mudDirtiness,
      state.isExploded ? 0 : state.rainIntensity,
      2.7
    );
    ctx.restore();

    // 4B. UPWARD LIGHT BEAMS FROM CENTER BRIDGE LAMPS ONTO THE BOTTOM OF THE TIRES:
    //     Casts soft, directional upward light beams/rays from each middle bridge lamp onto the
    //     bottom of the tires as the wheels drive over them (zero outline rings, strokes, or borders!).
    if (
      !state.isExploded &&
      state.flightPhase === 'none' &&
      altitude < 42 &&
      state.obstacles &&
      state.obstacles.length > 0
    ) {
      const bridgeLightState = getStreetLightState(state.weatherCycleSec);
      if (bridgeLightState.isOn && bridgeLightState.intensity > 0.01) {
        const bInten = bridgeLightState.intensity;
        const plankStep = 16;
        const r = car.wheelRadius;
        const wheelTargets = [
          {
            wx: rearWheelRenderedWorldX,
            lx: rearWheelLocalX,
            ly: rearWheelLocalY,
          },
          {
            wx: frontWheelRenderedWorldX,
            lx: frontWheelLocalX,
            ly: frontWheelLocalY,
          },
        ];

        for (let bIdx = 0; bIdx < state.obstacles.length; bIdx++) {
          const obs = state.obstacles[bIdx];
          if (obs.type !== 'suspension_bridge') continue;
          const halfSpan = obs.width * 0.5;
          const leftBankX = obs.x - halfSpan;
          const rightBankX = obs.x + halfSpan;
          if (state.x < leftBankX - 70 || state.x > rightBankX + 70) continue;

          for (let wIdx = 0; wIdx < 2; wIdx++) {
            const wt = wheelTargets[wIdx];
            let lIdx = 0;
            for (let px = leftBankX + 6; px <= rightBankX - 6; px += plankStep) {
              if (
                lIdx % 2 === 0 &&
                px >= leftBankX + 20 &&
                px <= rightBankX - 20
              ) {
                const dx = px - wt.wx;
                const absDx = Math.abs(dx);
                if (absDx < 28) {
                  const prox =
                    Math.cos((absDx / 28) * (Math.PI * 0.5)) * bInten;
                  if (prox > 0.02) {
                    const srcX = Math.max(
                      -r * 0.72,
                      Math.min(r * 0.72, dx * 0.62)
                    );
                    const srcY = r + 2.5;
                    const aimX = srcX * 0.22;
                    const aimY = -r * 0.18;

                    ctx.save();
                    ctx.translate(wt.lx, wt.ly);

                    // Clip to the tire interior so upward beams illuminate only the bottom tire surface with zero outer border ring
                    ctx.beginPath();
                    ctx.arc(0, 0, r - 0.4, 0, Math.PI * 2);
                    ctx.clip();

                    // 1) Soft upward directional light cone shining from the bridge lamp onto the bottom of the tire
                    const coneGrad = ctx.createLinearGradient(
                      srcX,
                      srcY,
                      aimX,
                      aimY
                    );
                    coneGrad.addColorStop(
                      0,
                      `rgba(255, 251, 235, ${0.72 * prox})`
                    );
                    coneGrad.addColorStop(
                      0.36,
                      `rgba(253, 224, 71, ${0.46 * prox})`
                    );
                    coneGrad.addColorStop(
                      0.72,
                      `rgba(245, 158, 11, ${0.16 * prox})`
                    );
                    coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
                    ctx.fillStyle = coneGrad;
                    ctx.beginPath();
                    ctx.moveTo(srcX - 3.5, srcY);
                    ctx.lineTo(aimX - r * 0.88, aimY);
                    ctx.lineTo(aimX + r * 0.88, aimY);
                    ctx.lineTo(srcX + 3.5, srcY);
                    ctx.closePath();
                    ctx.fill();

                    // 2) Soft upward light rays fanning from the lamp source onto the bottom rubber tread
                    const rayGrad = ctx.createLinearGradient(
                      srcX,
                      srcY,
                      aimX,
                      -r * 0.08
                    );
                    rayGrad.addColorStop(
                      0,
                      `rgba(255, 251, 235, ${0.58 * prox})`
                    );
                    rayGrad.addColorStop(
                      0.5,
                      `rgba(254, 240, 138, ${0.28 * prox})`
                    );
                    rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
                    ctx.fillStyle = rayGrad;
                    for (let rIdx = -1; rIdx <= 1; rIdx++) {
                      const rayTopX = aimX + rIdx * (r * 0.42);
                      ctx.beginPath();
                      ctx.moveTo(srcX - 1.4, srcY);
                      ctx.lineTo(rayTopX - 3.2, -r * 0.08);
                      ctx.lineTo(rayTopX + 3.2, -r * 0.08);
                      ctx.lineTo(srcX + 1.4, srcY);
                      ctx.closePath();
                      ctx.fill();
                    }

                    // 3) Soft bottom-surface illumination glow where the upward beam strikes the bottom of the tire
                    const botGlow = ctx.createRadialGradient(
                      srcX,
                      r,
                      1,
                      srcX * 0.6,
                      r * 0.55,
                      r * 0.78
                    );
                    botGlow.addColorStop(
                      0,
                      `rgba(255, 251, 235, ${0.64 * prox})`
                    );
                    botGlow.addColorStop(
                      0.45,
                      `rgba(253, 224, 71, ${0.34 * prox})`
                    );
                    botGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
                    ctx.fillStyle = botGlow;
                    ctx.beginPath();
                    ctx.arc(srcX * 0.5, r * 0.55, r * 0.78, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                  }
                }
              }
              lIdx++;
            }
          }
        }
      }
    }
  }

  // 5B. Mechanical Underbody Wheel-Bay Doors that close flush over the retracted wheels in flight!
  if (retractEase > 0.12 && !state.isExploded) {
    const bayCoverProgress = Math.min(1, (retractEase - 0.12) / 0.85);
    const coverW = (car.wheelRadius * 2.15) * bayCoverProgress;
    ctx.save();
    ctx.fillStyle = car.bodyColor;
    ctx.strokeStyle = car.accentColor;
    ctx.lineWidth = 1.6;
    // Rear wheel bay aerodynamic hatch door
    ctx.beginPath();
    ctx.roundRect(-halfWB - coverW * 0.5, 3.5, coverW, 6.5, 3);
    // Front wheel bay aerodynamic hatch door
    ctx.roundRect(halfWB - coverW * 0.5, 3.5, coverW, 6.5, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 6. CATASTROPHIC VEHICLE EXPLOSION FIREBALL & SHOCKWAVE RING
  if (state.isExploded && state.explosionTimer > 0) {
    const t = Math.min(1.4, state.explosionTimer);
    const blastAlpha = Math.max(0, 1 - t / 1.35);
    const ringRadius = 28 + t * 185;

    ctx.save();
    // Expanding Supersonic Blast Wave Ring
    ctx.strokeStyle = `rgba(254, 240, 138, ${blastAlpha * 0.85})`;
    ctx.lineWidth = Math.max(1.5, 8 * (1 - t / 1.4));
    ctx.beginPath();
    ctx.arc(0, -10, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Glowing Fireball Dome
    if (t < 0.85) {
      const fireR = 24 + t * 75;
      const fireGrad = ctx.createRadialGradient(0, -12, 4, 0, -12, fireR);
      fireGrad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
      fireGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.9)');
      fireGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.72)');
      fireGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(0, -12, fireR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

function drawSuspensionCoil(
  ctx: CanvasRenderingContext2D,
  wheelX: number,
  topY: number,
  bottomY: number,
  coilColor: string
): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Upper Anodized Gold/Red Shock Tower Cap & Reservoir Mount
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(wheelX - 7.5, topY - 3, 15, 5.5);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(wheelX - 6, topY + 1.5, 12, 3);

  // 2. Central Chrome Hydraulic Shock Damper Piston Shaft
  const shaftGrad = ctx.createLinearGradient(wheelX - 3, topY, wheelX + 3, topY);
  shaftGrad.addColorStop(0, '#475569');
  shaftGrad.addColorStop(0.5, '#F8FAFC');
  shaftGrad.addColorStop(1, '#334155');
  ctx.strokeStyle = shaftGrad;
  ctx.lineWidth = 5.2;
  ctx.beginPath();
  ctx.moveTo(wheelX, topY + 2);
  ctx.lineTo(wheelX, bottomY);
  ctx.stroke();

  // 3. Prominent Exposed Sport Red Helical Coilover Spring (Dynamic Compression & Extension Animation!)
  //    ("تحريك المساعدين والسبرنجات ديناميكياً مع انضغاطها وتمددها بحسب تضاريس الطريق، القفزات، والفرملة")
  const coils = 6;
  const startY = topY + 4;
  const span = Math.max(6.5, bottomY - startY);
  const step = span / coils;
  // When compressed (smaller span), coils bulge slightly wider for authentic mechanical spring physics!
  const compressionRatio = Math.max(0, Math.min(1, (34 - span) / 18));
  const coilHalfW = 8.0 + compressionRatio * 1.8;

  // Upper shock body cylinder sleeve
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(wheelX - 4.2, startY - 1, 8.4, Math.min(11, span * 0.42));

  // Dark 3D casing outline behind helical coils
  ctx.strokeStyle = '#2A0404';
  ctx.lineWidth = 5.8;
  ctx.beginPath();
  ctx.moveTo(wheelX, startY);
  for (let i = 0; i < coils; i++) {
    const yMid = startY + (i + 0.5) * step;
    const yEnd = startY + (i + 1) * step;
    const side = i % 2 === 0 ? -coilHalfW : coilHalfW;
    ctx.lineTo(wheelX + side, yMid);
    ctx.lineTo(wheelX, yEnd);
  }
  ctx.stroke();

  // Vivid Red / Accent Helical Coil Core
  ctx.strokeStyle = coilColor;
  ctx.lineWidth = 3.6;
  ctx.stroke();

  // Specular metallic highlight along the red coils
  ctx.strokeStyle = coilColor === '#EF4444' ? '#FCA5A5' : '#FFFFFF';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Lower Spring Perch Collar above Axle Hub
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(wheelX - 6.5, bottomY - 2.5, 13, 3);

  ctx.restore();
}

function lerpNeonRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
  alpha: number = 1
): string {
  const cl = Math.max(0, Math.min(1, t));
  const r = Math.round(a[0] + (b[0] - a[0]) * cl);
  const g = Math.round(a[1] + (b[1] - a[1]) * cl);
  const bl = Math.round(a[2] + (b[2] - a[2]) * cl);
  return alpha >= 0.999
    ? `rgb(${r}, ${g}, ${bl})`
    : `rgba(${r}, ${g}, ${bl}, ${Math.max(0, Math.min(1, alpha)).toFixed(3)})`;
}

function createAnimatedDualNeonGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  dualNeon: DualNeonInfo,
  nowSec: number
): CanvasGradient {
  const phase = nowSec * 4.0;
  const shiftX = Math.sin(phase) * 18;
  const shiftY = Math.cos(phase) * 8;
  const grad = ctx.createLinearGradient(
    x0 + shiftX,
    y0 + shiftY,
    x1 - shiftX,
    y1 - shiftY
  );
  const t0 = 0.5 + 0.5 * Math.sin(phase);
  const t1 = 0.5 + 0.5 * Math.sin(phase + 1.57);
  const t2 = 0.5 + 0.5 * Math.sin(phase + 3.14);
  const t3 = 0.5 + 0.5 * Math.sin(phase + 4.71);
  grad.addColorStop(0, lerpNeonRgb(dualNeon.rgbA, dualNeon.rgbB, t0));
  grad.addColorStop(0.28, lerpNeonRgb(dualNeon.rgbA, dualNeon.rgbMid, t1));
  grad.addColorStop(0.52, dualNeon.midColor);
  grad.addColorStop(0.76, lerpNeonRgb(dualNeon.rgbB, dualNeon.rgbMid, t2));
  grad.addColorStop(1, lerpNeonRgb(dualNeon.rgbB, dualNeon.rgbA, t3));
  return grad;
}

/**
 * Creates a deep cosmic metallic gradient for Starry Galaxy Paints.
 */
function createStarryGalaxyGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  starry: StarryGalaxyInfo,
  nowSec: number
): CanvasGradient {
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  const shift = 0.5 + 0.5 * Math.sin(nowSec * 2.4);
  grad.addColorStop(0, starry.deepColor);
  grad.addColorStop(0.22 + shift * 0.12, starry.baseColor);
  grad.addColorStop(0.5 + shift * 0.1, starry.nebulaColor);
  grad.addColorStop(0.78, starry.baseColor);
  grad.addColorStop(1, starry.deepColor);
  return grad;
}

/**
 * Renders animated sparkling star particles, nebula shimmer, and 4-point diamond glimmer dots
 * across the currently clipped car paint surface.
 */
function drawStarryGalaxySparkles(
  ctx: CanvasRenderingContext2D,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  starry: StarryGalaxyInfo,
  nowSec: number
): void {
  // 1. Soft cosmic nebula cloud glow patches
  for (let n = 0; n < 3; n++) {
    const nx = boxX + boxW * (0.22 + n * 0.28 + Math.sin(nowSec * 1.3 + n * 2.1) * 0.06);
    const ny = boxY + boxH * (0.35 + (n % 2) * 0.25 + Math.cos(nowSec * 1.5 + n) * 0.05);
    const nr = Math.max(boxW, boxH) * 0.32;
    const nebGrad = ctx.createRadialGradient(nx, ny, 1, nx, ny, nr);
    nebGrad.addColorStop(
      0,
      `rgba(${starry.rgbNebula[0]}, ${starry.rgbNebula[1]}, ${starry.rgbNebula[2]}, 0.38)`
    );
    nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebGrad;
    ctx.beginPath();
    ctx.arc(nx, ny, nr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. 34 Animated Sparkling Star Particles / Glimmer Dots
  for (let i = 0; i < 34; i++) {
    const u = ((i * 37 + 13) % 97) / 97;
    const v = ((i * 53 + 29) % 89) / 89;
    const sx = boxX + u * boxW + Math.sin(nowSec * 0.9 + i) * 1.2;
    const sy = boxY + v * boxH + Math.cos(nowSec * 1.1 + i * 1.3) * 0.9;
    const speed = 3.2 + (i % 5) * 1.45;
    const twinkle = 0.5 + 0.5 * Math.sin(nowSec * speed + i * 1.73);
    if (twinkle < 0.18) continue;

    const alpha = 0.28 + twinkle * 0.72;
    const radius = (0.65 + (i % 3) * 0.48) * (0.7 + twinkle * 0.55);

    ctx.fillStyle =
      i % 3 === 0 ? '#FFFFFF' : i % 3 === 1 ? starry.starColor : starry.nebulaColor;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw crisp 4-point star flare on the brightest glimmer stars
    if (i % 4 === 0 && twinkle > 0.58) {
      const flareLen = (2.8 + (i % 3) * 1.4) * twinkle;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(sx - flareLen, sy);
      ctx.lineTo(sx + flareLen, sy);
      ctx.moveTo(sx, sy - flareLen);
      ctx.lineTo(sx, sy + flareLen);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1.0;
}

function shadeHexColor(hex: string, percent: number): string {
  const clean = (hex || '#E60026').replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2]
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return hex || '#E60026';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  // Deep lustrous glossy metallic Candy Red (#E60026 / #FF001E) clear-coat finish!
  if (r >= 200 && g <= 55 && b <= 65) {
    if (percent > 0) {
      const warmR = 255;
      const warmG = Math.min(88, Math.round(g + percent * 1.25));
      const warmB = Math.min(108, Math.round(b + percent * 1.35));
      const rr = warmR.toString(16).padStart(2, '0');
      const gg = warmG.toString(16).padStart(2, '0');
      const bb = warmB.toString(16).padStart(2, '0');
      return `#${rr}${gg}${bb}`;
    } else {
      const factor = Math.max(0.24, 1 + percent / 100);
      const darkR = Math.max(72, Math.round(r * factor));
      const darkG = Math.max(0, Math.round(g * factor * 0.35));
      const darkB = Math.max(10, Math.round(b * factor * 0.55));
      const rr = darkR.toString(16).padStart(2, '0');
      const gg = darkG.toString(16).padStart(2, '0');
      const bb = darkB.toString(16).padStart(2, '0');
      return `#${rr}${gg}${bb}`;
    }
  }

  const adjust = (c: number) => {
    if (percent >= 0) {
      return Math.min(255, Math.round(c + (255 - c) * (percent / 100)));
    }
    return Math.max(0, Math.round(c * (1 + percent / 100)));
  };
  const rr = adjust(r).toString(16).padStart(2, '0');
  const gg = adjust(g).toString(16).padStart(2, '0');
  const bb = adjust(b).toString(16).padStart(2, '0');
  return `#${rr}${gg}${bb}`;
}

function drawWheel3D(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  rimAccent: string,
  mudDirtiness: number = 0,
  rainIntensity: number = 0,
  wheelSeed: number = 0
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 1. 3D Rear Tire Depth Offset
  ctx.fillStyle = '#030712';
  ctx.beginPath();
  ctx.arc(-2.2, 1.5, radius * 0.99, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(rotation);

  // 2. Ultra High-Res Crisp Vector Outer Mud-Terrain Tire Treads (Batched single vector path for 60 FPS & razor-sharp edges!)
  const treadCount = 16;
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#030712';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < treadCount; i++) {
    const a = (i * Math.PI * 2) / treadCount;
    const da = 0.095;
    const rIn = radius - 2.2;
    const rOut = radius + 2.6;
    ctx.moveTo(Math.cos(a - da * 1.15) * rIn, Math.sin(a - da * 1.15) * rIn);
    ctx.lineTo(Math.cos(a - da) * rOut, Math.sin(a - da) * rOut);
    ctx.lineTo(Math.cos(a + da) * rOut, Math.sin(a + da) * rOut);
    ctx.lineTo(Math.cos(a + da * 1.15) * rIn, Math.sin(a + da * 1.15) * rIn);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();

  // Crisp Tire Tread Top Specular Ridge
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < treadCount; i++) {
    const a = (i * Math.PI * 2) / treadCount;
    const da = 0.065;
    const rTip = radius + 1.4;
    ctx.moveTo(Math.cos(a - da) * rTip, Math.sin(a - da) * rTip);
    ctx.lineTo(Math.cos(a + da) * rTip, Math.sin(a + da) * rTip);
  }
  ctx.stroke();

  // 3. Main Tire Sidewall Carcass with Crisp Anti-Aliased Vector Rim
  const tireGrad = ctx.createRadialGradient(0, 0, radius * 0.52, 0, 0, radius);
  tireGrad.addColorStop(0, '#1F2937');
  tireGrad.addColorStop(0.76, '#111827');
  tireGrad.addColorStop(1, '#030712');
  ctx.fillStyle = tireGrad;
  ctx.strokeStyle = '#030712';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sidewall Shoulder Lug Blocks
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([4.5, 4.5]);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.84, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Deep-Dish Golden 6-Spoke Alloy Rim (جنوط ذهبية سداسية الأضلاع فائقة الوضوح)
  const rimR = radius * 0.64;
  // Dark Inner Wheel Well & Ventilated Brake Rotor
  ctx.fillStyle = '#090D16';
  ctx.beginPath();
  ctx.arc(0, 0, rimR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.4;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(0, 0, rimR * 0.62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Red Performance Brake Caliper
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.arc(-rimR * 0.42, -rimR * 0.25, rimR * 0.24, 0, Math.PI * 2);
  ctx.fill();

  // Metallic Alloy Rim Outer Barrel Ring & Wheel Hubs ("الطاوات") matching rimAccent / Car Paint, Starry Galaxy, or Dual Neon!
  // (Strictly contained inside the wheel rim without casting outer light beams!)
  const dualNeonRim = getDualNeonInfo(rimAccent);
  const starryRim = getStarryGalaxyInfo(rimAccent);
  const rimNowSec = performance.now() * 0.001;
  const rimWave = 0.5 + 0.5 * Math.sin(rimNowSec * 4.8 + wheelSeed);
  const rimStrobe = 0.5 + 0.5 * Math.sin(rimNowSec * 16.5 + wheelSeed);
  const rimPulse = 0.42 + 0.36 * rimWave + 0.22 * rimStrobe;
  const rimBlink = Math.sin(rimNowSec * 12.0 + wheelSeed) > -0.18 ? 1.0 : 0.45;

  const rimLight = dualNeonRim
    ? dualNeonRim.colorB
    : starryRim
    ? starryRim.nebulaColor
    : shadeHexColor(rimAccent, 42);
  const rimDark = dualNeonRim
    ? dualNeonRim.colorA
    : starryRim
    ? starryRim.deepColor
    : shadeHexColor(rimAccent, -32);
  const rimStroke = dualNeonRim
    ? rimBlink > 0.7
      ? dualNeonRim.colorB
      : dualNeonRim.colorA
    : starryRim
    ? starryRim.deepColor
    : shadeHexColor(rimAccent, -48);
  const goldGrad = dualNeonRim
    ? createAnimatedDualNeonGradient(
        ctx,
        -rimR,
        -rimR,
        rimR,
        rimR,
        dualNeonRim,
        rimNowSec + wheelSeed * 0.3
      )
    : starryRim
    ? createStarryGalaxyGradient(
        ctx,
        -rimR,
        -rimR,
        rimR,
        rimR,
        starryRim,
        rimNowSec + wheelSeed * 0.3
      )
    : ctx.createLinearGradient(-rimR, -rimR, rimR, rimR);
  if (!dualNeonRim && !starryRim) {
    goldGrad.addColorStop(0, rimLight);
    goldGrad.addColorStop(0.45, rimAccent);
    goldGrad.addColorStop(0.85, rimDark);
    goldGrad.addColorStop(1, shadeHexColor(rimAccent, 24));
  }

  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = dualNeonRim ? 3.8 + rimPulse * 1.2 : 3.5;
  ctx.beginPath();
  ctx.arc(0, 0, rimR - 1.1, 0, Math.PI * 2);
  ctx.stroke();

  // 6 Sculpted Alloy Spokes (Batched Crisp Vector Path matching Car Paint!)
  ctx.fillStyle = goldGrad;
  ctx.strokeStyle = rimStroke;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const px = -sinA;
    const py = cosA;
    const r0 = 2.0;
    const r1 = rimR - 1.5;
    const w0 = 2.6;
    const w1 = 2.0;
    ctx.moveTo(cosA * r0 - px * w0, sinA * r0 - py * w0);
    ctx.lineTo(cosA * r1 - px * w1, sinA * r1 - py * w1);
    ctx.lineTo(cosA * r1 + px * w1, sinA * r1 + py * w1);
    ctx.lineTo(cosA * r0 + px * w0, sinA * r0 + py * w0);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();

  // Specular spoke center highlight ridges
  ctx.strokeStyle = rimLight;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6;
    ctx.moveTo(Math.cos(a) * 3.5, Math.sin(a) * 3.5);
    ctx.lineTo(Math.cos(a) * (rimR - 3), Math.sin(a) * (rimR - 3));
  }
  ctx.stroke();

  // Center Hub Cap ("الطاوات") with Matching Color Ring & Crisp Vector Bolt Detail
  ctx.fillStyle = goldGrad;
  ctx.strokeStyle = rimStroke;
  ctx.lineWidth = dualNeonRim ? 1.8 : 1;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (dualNeonRim) {
    ctx.save();
    ctx.strokeStyle = rimBlink > 0.7 ? dualNeonRim.coreColor : dualNeonRim.colorB;
    ctx.lineWidth = 1.6 + rimStrobe * 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.31, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (starryRim) {
    ctx.save();
    for (let s = 0; s < 6; s++) {
      const sa = (s * Math.PI * 2) / 6 + 0.25;
      const sr = rimR * (0.48 + (s % 2) * 0.24);
      const sx = Math.cos(sa) * sr;
      const sy = Math.sin(sa) * sr;
      const tw = 0.5 + 0.5 * Math.sin(rimNowSec * (4.5 + s) + wheelSeed);
      if (tw > 0.25) {
        ctx.fillStyle = s % 2 === 0 ? '#FFFFFF' : starryRim.starColor;
        ctx.globalAlpha = 0.4 + tw * 0.6;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.9 + tw * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.11, 0, Math.PI * 2);
  ctx.fill();

  // 5. Dynamic Mud Coating Ring on Tire Treads (Washes off cleanly when driving through Water Pits!)
  if (mudDirtiness > 0.04) {
    ctx.strokeStyle = `rgba(120, 53, 15, ${Math.min(0.85, mudDirtiness * 0.85)})`;
    ctx.lineWidth = 4.2;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, radius - 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 6. REALISTIC TIRE RAIN PARTICLE INTERACTION, LANDING, IMPACT & SCATTER (Zero glowing neon rings!):
  if (rainIntensity > 0.05) {
    ctx.rotate(-rotation); // Keep rain landings, splashes & gravity runoff oriented naturally in world/car space!
    const tWheel = performance.now() * 0.001;
    const tireRainAlpha = Math.min(0.46, 0.26 + rainIntensity * 0.34);
    const spinDir = Math.abs(rotation) > 0.01 ? Math.sign(rotation) : 1;

    ctx.strokeStyle = `rgba(203, 213, 225, ${tireRainAlpha})`;
    ctx.fillStyle = `rgba(226, 232, 240, ${tireRainAlpha})`;
    ctx.lineWidth = 1.05;

    const tireSplashSpots = [
      { x: 0, y: -radius - 0.8, nx: 0, ny: -1, s: 0.1 }, // Top center tread crown
      { x: -radius * 0.32, y: -radius * 0.95, nx: -0.32, ny: -0.95, s: 0.35 }, // Upper-left crown lug
      { x: radius * 0.32, y: -radius * 0.95, nx: 0.32, ny: -0.95, s: 0.6 }, // Upper-right crown lug
      { x: -radius * 0.62, y: -radius * 0.78, nx: -0.62, ny: -0.78, s: 0.9 }, // Upper-left tread shoulder
      { x: radius * 0.62, y: -radius * 0.78, nx: 0.62, ny: -0.78, s: 1.2 }, // Upper-right tread shoulder
      { x: -radius * 0.86, y: -radius * 0.5, nx: -0.86, ny: -0.5, s: 1.55 }, // Mid-upper left knobby lug
      { x: radius * 0.86, y: -radius * 0.5, nx: 0.86, ny: -0.5, s: 1.9 }, // Mid-upper right knobby lug
      { x: -radius * 0.98, y: -radius * 0.06, nx: -0.98, ny: -0.1, s: 2.3 }, // Left equator outer tread
      { x: radius * 0.98, y: -radius * 0.06, nx: 0.98, ny: -0.1, s: 2.7 }, // Right equator outer tread
      { x: -radius * 0.82, y: radius * 0.46, nx: -0.82, ny: 0.46, s: 3.1 }, // Mid-lower left outer tread
      { x: radius * 0.82, y: radius * 0.46, nx: 0.82, ny: 0.46, s: 3.5 }, // Mid-lower right outer tread
      { x: -radius * 0.45, y: -radius * 0.44, nx: -0.35, ny: -0.85, s: 4.1 }, // Upper-left sidewall
      { x: radius * 0.45, y: -radius * 0.44, nx: 0.35, ny: -0.85, s: 4.6 }, // Upper-right sidewall
      { x: -radius * 0.42, y: radius * 0.38, nx: -0.35, ny: 0.5, s: 5.1 }, // Lower-left sidewall
      { x: radius * 0.42, y: radius * 0.38, nx: 0.35, ny: 0.5, s: 5.6 }, // Lower-right sidewall
      { x: 0, y: -radius * 0.22, nx: 0, ny: -1, s: 6.2 }, // Center alloy hub
    ];

    ctx.beginPath();
    for (let i = 0; i < tireSplashSpots.length; i++) {
      const pt = tireSplashSpots[i];
      const phase = (tWheel * 8.6 + wheelSeed * 3.1 + pt.s) % 1;
      if (phase < 0.24) {
        // 1) Incoming raindrop particle landing directly onto the tire surface
        const landNorm = phase / 0.24;
        const dropStartX = pt.x + (1 - landNorm) * 3.2;
        const dropStartY = pt.y - (1 - landNorm) * 9.5;
        ctx.moveTo(dropStartX, dropStartY);
        ctx.lineTo(pt.x, pt.y);
      } else if (phase < 0.72) {
        // 2) Natural impact splash crown scattering outward along surface normal
        const pNorm = (phase - 0.24) / 0.48;
        const spreadX = 1.6 + pNorm * 4.5;
        const liftY = (1 - pNorm) * 4.6;
        const tangDrift = spinDir * pNorm * 1.6;
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x - spreadX + tangDrift, pt.y - liftY + pt.ny * 1.2);
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x + spreadX + tangDrift, pt.y - liftY + pt.ny * 1.2);
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(pt.x + pt.nx * (1.8 + pNorm * 3.2), pt.y - liftY * 1.15);
      } else {
        // 3) Natural water rivulet trickling down the curved tire sidewall & tread
        const dNorm = (phase - 0.72) / 0.28;
        const trickleX = pt.x + pt.nx * dNorm * 1.8;
        const trickleY = pt.y + dNorm * (radius * 0.46);
        ctx.moveTo(trickleX, trickleY);
        ctx.lineTo(trickleX - 0.4, trickleY + 3.2);
      }
    }
    ctx.stroke();

    // 4) Natural semi-transparent scattering micro-droplets bouncing off the tire treads & sidewalls
    ctx.beginPath();
    for (let i = 0; i < tireSplashSpots.length; i++) {
      const pt = tireSplashSpots[i];
      const phase = (tWheel * 8.6 + wheelSeed * 3.1 + pt.s) % 1;
      if (phase >= 0.22 && phase < 0.76) {
        const pNorm = (phase - 0.22) / 0.54;
        const dir = i % 2 === 0 ? -1 : 1;
        const bx = pt.x + (dir * (1.5 + pNorm * 4.2)) + pt.nx * pNorm * 2.2;
        const by = pt.y - Math.sin(pNorm * Math.PI) * 4.6 + pt.ny * pNorm * 1.5;
        ctx.moveTo(bx + 0.95, by);
        ctx.arc(bx, by, 0.95, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// IN-ENGINE 20-SECOND REALISTIC CINEMATIC INTRO SCENE (المشهد السينمائي الواقعي داخل محرك الخريطة الافتراضية)
// - Rendered 100% inside the native Default Game Map Engine (renderGameCanvas)
//   using the exact same road, pine forest trees, highway guardrail, rocks,
//   water pit, suspension bridge, 3D vehicle, and physics driver!
// - 20-Second Dynamic Camera & Action Sequence (Zero rush, smooth natural pacing):
//   • (0 - 5s): Close-up interior cabin perspective on the driver holding the
//     steering wheel, revving the engine, and preparing to launch.
//   • (5 - 10s): Exciting launch along the default map road with authentic engine
//     sound, traversing the 3D surface rocks, crossing the suspension bridge,
//     and splashing through the water pit.
//   • (10 - 15s): Pressing Nitro, deploying Airplane Wings, transforming into an
//     aircraft, and climbing smoothly into the sky above the trees & clouds.
//   • (15 - 20s): Gradual disappearance in soft atmospheric smoke and seamless
//     transition to the Main Menu.
// ============================================================================
export function renderActionCinematicCutscene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsedSec: number,
  state: PhysicsState,
  car: CarConfig,
  map: MapConfig,
  quality: GraphicsQuality
): { finished: boolean } {
  ensureEnvironmentAssetsReady();
  const totalDuration = 20.0;
  const t = Math.max(0, Math.min(totalDuration, elapsedSec));

  // Smoothly progress the Solar & Lunar Sky Shader during the Cinematic Cutscene
  // in sync with the 90s-per-phase Day/Night Cycle:
  persistentWeatherClockSec =
    (persistentWeatherClockSec + 1 / 60) % WEATHER_CYCLE_DURATION;
  state.weatherCycleSec = persistentWeatherClockSec;
  const cineWeather = getWeatherPhaseInfo(state.weatherCycleSec);
  state.nightFactor = cineWeather.nightFactor;
  state.cloudDarkness = 0;
  state.rainIntensity = 0;
  state.headlightsOn = false;
  state.isExploded = false;
  state.health = 100;
  state.nitro = 100;
  state.fuel = state.maxFuel;

  // Deterministic track obstacles along the Default Map road for the 5-10s driving phase
  if (
    state.obstacles.length < 4 ||
    state.obstacles[0].id !== 9501
  ) {
    state.obstacles = [
      {
        id: 9501,
        type: 'rock_small',
        x: 430,
        width: 25,
        height: 10.5,
        rockFacets: [0.82, 1.08, 0.92, 1.14, 0.86, 0.98, 0.9],
        bridgeSag: 0,
        bridgeSagVel: 0,
        cleared: false,
      },
      {
        id: 9502,
        type: 'suspension_bridge',
        x: 720,
        width: 240,
        height: 140,
        rockFacets: [],
        bridgeSag: 12,
        bridgeSagVel: 0,
        cleared: false,
      },
      {
        id: 9503,
        type: 'pit_medium',
        x: 1090,
        width: 255,
        height: 44,
        rockFacets: [],
        bridgeSag: 0,
        bridgeSagVel: 0,
        cleared: false,
      },
      {
        id: 9504,
        type: 'rock_small',
        x: 1390,
        width: 25,
        height: 10.5,
        rockFacets: [0.86, 0.96, 1.12, 0.88, 1.04, 0.82, 0.95],
        bridgeSag: 0,
        bridgeSagVel: 0,
        cleared: false,
      },
    ];
    state.pickups = [];
    state.floatingTexts = [];
  }

  // Smoothstep helper (0 -> 1)
  const smoothstep = (edge0: number, edge1: number, val: number) => {
    const x = Math.max(0, Math.min(1, (val - edge0) / Math.max(0.0001, edge1 - edge0)));
    return x * x * (3 - 2 * x);
  };

  let camZoom = 1.0;
  let focusWorldX = state.x;
  let focusWorldY = state.y;
  let screenAnchorX = width * 0.44;
  let screenAnchorY = height * 0.56;
  let isGasActive = false;
  let isBoostActive = false;

  if (t < 5.0) {
    // =========================================================================
    // PHASE 1 (0 - 5s): منظور داخلي للسائق وهو يمسك المقود ويتجهز للانطلاق
    // First-Person Interior Driver Cockpit Perspective looking forward through the
    // windshield at the EXACT Default Game Map environment:
    // - Background Ahead: Default Game Map Mountain Landscape (static) + Volumetric 3D Clouds (Slow Cloud Drift)
    // - Road Ahead: Default Game Map Wet Asphalt Road with Mirror Water Puddles, Cracks & Dashed Centerline
    // - Both Sides: Polished Metallic W-Beam Highway Guardrails with Steel Posts & Red/Amber Reflectors
    // - Left & Right: Scattered Diverse Realistic Botanical Trees & Flowers (Japanese Purple, Pink Sakura & Lush Green Trees)
    // - Cabin Foreground: Car Hood, Windshield, Live Digital Dash, Sport Steering Wheel & Gloved Driver Hands!
    // =========================================================================
    const launchRoll = smoothstep(4.25, 5.0, t);
    const rev1 =
      t >= 1.1 && t <= 2.15 ? Math.sin(((t - 1.1) / 1.05) * Math.PI) : 0;
    const rev2 =
      t >= 2.85 && t <= 4.05 ? Math.sin(((t - 2.85) / 1.2) * Math.PI) : 0;
    const revIntensity = Math.max(rev1 * 0.78, rev2 * 1.0, launchRoll * 0.95);

    state.x = 180 + launchRoll * 35;
    state.vx = launchRoll * 140;
    state.vy = 0;
    state.flightPhase = 'none';
    state.wingDeployProgress = 0;
    state.wheelRetractProgress = 0;
    state.inWaterPit = false;

    const engineVibX = 0;
    const engineVibY = 0;
    // 100% Fixed Horizon & Vanishing Point so the Mountains & Environment NEVER jitter!
    const horizonY = Math.round(height * 0.42);
    const vanishX = Math.round(width * 0.5);

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. STATIC BACKGROUND LAYER (Fixed on Cutscene / Menu)
    drawBackground(
      ctx,
      width,
      height,
      state.weatherCycleSec,
      state.nightFactor,
      0,
      0,
      t,
      0,
      false
    );

    // 2. LUSH GREEN FOREST VALLEY GROUND & SHOULDERS ON LEFT AND RIGHT OF THE ROAD
    // (Uses the exact same staticMountainRangeCanvas from step 1 above horizonY so mountains are 100% identical & static!)
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
    groundGrad.addColorStop(0, '#15803D');
    groundGrad.addColorStop(0.35, '#166534');
    groundGrad.addColorStop(0.75, '#14532D');
    groundGrad.addColorStop(1, '#052E16');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, width, height - horizonY);

    // 2B. SUBTLE MOUNTAIN VALLEY FOG / MIST LAYER IN INTRO CUTSCENE VIEW
    //     Matches the background mountain fog and hangs softly across the mountain base & bridge valley!
    {
      ctx.save();
      const introMistGrad = ctx.createLinearGradient(
        0,
        horizonY - height * 0.07,
        0,
        horizonY + height * 0.14
      );
      introMistGrad.addColorStop(0, 'rgba(241, 245, 249, 0)');
      introMistGrad.addColorStop(
        0.48,
        state.nightFactor > 0.35
          ? 'rgba(186, 230, 253, 0.36)'
          : 'rgba(241, 245, 249, 0.52)'
      );
      introMistGrad.addColorStop(1, 'rgba(226, 232, 240, 0)');
      ctx.fillStyle = introMistGrad;
      ctx.fillRect(0, horizonY - height * 0.07, width, height * 0.21);

      if (volumetricCloudCanvases.length > 0) {
        for (let m = 0; m < 5; m++) {
          const mistSprite =
            volumetricCloudCanvases[m % volumetricCloudCanvases.length];
          const mw = 260 + (m % 2) * 60;
          const mh = 86 + (m % 2) * 18;
          const mx =
            ((width * (0.05 + m * 0.21) - t * (10 + m * 2)) %
              (width + mw)) -
            mw * 0.35;
          const my =
            horizonY -
            mh * 0.42 +
            Math.sin(t * 0.8 + m * 1.7) * 8;
          ctx.globalAlpha = state.nightFactor > 0.35 ? 0.38 : 0.54;
          ctx.drawImage(mistSprite, mx, my, mw, mh);
        }
      }
      ctx.restore();
    }

    // Forward motion scroll during launch preparation (4.25s -> 5.0s)
    const forwardScroll = (launchRoll * launchRoll) * 1.65;

    // 3. WET ASPHALT ROAD SURFACE IN PERSPECTIVE ("طريق مبلل بالماء مطابق تماماً لطريق اللعبة الافتراضي")
    const roadTopHalfW = width * 0.052;
    const roadBotHalfW = width * 0.43;
    const roadBotY = height * 0.82;

    const getRoadEdgeX = (depthNorm: number, side: -1 | 1) => {
      const halfW = roadTopHalfW + (roadBotHalfW - roadTopHalfW) * depthNorm;
      return vanishX + side * halfW;
    };
    const getRoadY = (depthNorm: number) =>
      horizonY + (roadBotY - horizonY) * depthNorm;

    // Green grass verge & gravel foundation border outside the asphalt
    ctx.fillStyle = '#16A34A';
    ctx.beginPath();
    ctx.moveTo(vanishX - roadTopHalfW * 1.28, horizonY);
    ctx.lineTo(vanishX + roadTopHalfW * 1.28, horizonY);
    ctx.lineTo(vanishX + roadBotHalfW * 1.14, roadBotY);
    ctx.lineTo(vanishX - roadBotHalfW * 1.14, roadBotY);
    ctx.closePath();
    ctx.fill();

    // Main 2K Smooth Dark-Grey Wet Asphalt Deck
    const asphaltGrad = ctx.createLinearGradient(0, horizonY, 0, roadBotY);
    asphaltGrad.addColorStop(0, '#334155');
    asphaltGrad.addColorStop(0.25, '#1E293B');
    asphaltGrad.addColorStop(0.7, '#0F172A');
    asphaltGrad.addColorStop(1, '#090D16');
    ctx.fillStyle = asphaltGrad;
    ctx.beginPath();
    ctx.moveTo(vanishX - roadTopHalfW, horizonY);
    ctx.lineTo(vanishX + roadTopHalfW, horizonY);
    ctx.lineTo(vanishX + roadBotHalfW, roadBotY);
    ctx.lineTo(vanishX - roadBotHalfW, roadBotY);
    ctx.closePath();
    ctx.fill();

    // Wet Track Gloss Reflection Ribbons (Warm Golden Sunlight & Sky Cyan Sheen on Wet Asphalt)
    const wetGlowLeft = ctx.createLinearGradient(0, horizonY, 0, roadBotY);
    wetGlowLeft.addColorStop(0, 'rgba(254, 240, 138, 0.36)');
    wetGlowLeft.addColorStop(0.5, 'rgba(125, 211, 252, 0.28)');
    wetGlowLeft.addColorStop(1, 'rgba(56, 189, 248, 0.22)');
    ctx.fillStyle = wetGlowLeft;
    ctx.beginPath();
    ctx.moveTo(vanishX - roadTopHalfW * 0.45, horizonY);
    ctx.lineTo(vanishX - roadTopHalfW * 0.18, horizonY);
    ctx.lineTo(vanishX - roadBotHalfW * 0.22, roadBotY);
    ctx.lineTo(vanishX - roadBotHalfW * 0.52, roadBotY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(vanishX + roadTopHalfW * 0.18, horizonY);
    ctx.lineTo(vanishX + roadTopHalfW * 0.45, horizonY);
    ctx.lineTo(vanishX + roadBotHalfW * 0.52, roadBotY);
    ctx.lineTo(vanishX + roadBotHalfW * 0.22, roadBotY);
    ctx.closePath();
    ctx.fill();

    // Scattered Mirror Water Puddles on the Wet Road reflecting Sky & Sun Shimmer ("طريق مبلل بالماء بدون أشجار")
    const puddleSlots = [
      { baseZ: 0.18, sideOffset: -0.38, wScale: 0.28 },
      { baseZ: 0.34, sideOffset: 0.32, wScale: 0.32 },
      { baseZ: 0.54, sideOffset: -0.26, wScale: 0.35 },
      { baseZ: 0.74, sideOffset: 0.36, wScale: 0.38 },
    ];
    for (const pd of puddleSlots) {
      const z = (pd.baseZ + forwardScroll) % 1.0;
      const depth = z * z; // perspective depth curve
      if (depth < 0.03 || depth > 0.95) continue;
      const py = getRoadY(depth);
      const roadHalfW = roadTopHalfW + (roadBotHalfW - roadTopHalfW) * depth;
      const px = vanishX + pd.sideOffset * roadHalfW;
      const pw = Math.max(14, roadHalfW * pd.wScale);
      const ph = Math.max(2.5, 11 * depth);

      ctx.save();
      // Mirror Sky Puddle Base
      ctx.fillStyle = 'rgba(125, 211, 252, 0.46)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
      ctx.lineWidth = Math.max(0.8, 1.5 * depth);
      ctx.beginPath();
      ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Specular Sun Shimmer Streak across Water Puddle
      ctx.strokeStyle = 'rgba(254, 249, 195, 0.85)';
      ctx.lineWidth = Math.max(0.8, 1.4 * depth);
      ctx.beginPath();
      ctx.moveTo(px - pw * 0.55, py - ph * 0.15);
      ctx.lineTo(px + pw * 0.55, py - ph * 0.15);
      ctx.stroke();
      ctx.restore();
    }

    // Dashed Amber Highway Center Lane Markings & Polished Side Curbs
    for (let d = 0; d < 9; d++) {
      const z0 = ((d / 9 + forwardScroll) % 1.0);
      const z1 = Math.min(1.0, z0 + 0.055);
      if (z1 <= z0) continue;
      const p0 = z0 * z0;
      const p1 = z1 * z1;
      const y0 = getRoadY(p0);
      const y1 = getRoadY(p1);
      const w0 = Math.max(1.5, 9 * p0);
      const w1 = Math.max(2.0, 9 * p1);

      ctx.fillStyle = 'rgba(251, 191, 36, 0.86)';
      ctx.beginPath();
      ctx.moveTo(vanishX - w0 * 0.5, y0);
      ctx.lineTo(vanishX + w0 * 0.5, y0);
      ctx.lineTo(vanishX + w1 * 0.5, y1);
      ctx.lineTo(vanishX - w1 * 0.5, y1);
      ctx.closePath();
      ctx.fill();
    }

    // Polished Metallic Asphalt Edge Curbs
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(getRoadEdgeX(0, -1), horizonY);
    ctx.lineTo(getRoadEdgeX(1, -1), roadBotY);
    ctx.moveTo(getRoadEdgeX(0, 1), horizonY);
    ctx.lineTo(getRoadEdgeX(1, 1), roadBotY);
    ctx.stroke();

    // 3B. 100% OPAQUE ENLARGED JACARANDA (PURPLE), LUSH GREEN, SAKURA (WHITE) & AUTUMN ORANGE TREES ON BOTH LEFT & RIGHT SIDES OF THE INTRO ROAD
    //     Continuously spans from the horizon to the foreground, dynamically lit based on active time-of-day atmosphere!
    {
      const litIntroTrees = getLitTreeAssets(state.weatherCycleSec);
      ctx.save();
      ctx.globalAlpha = 1.0;

      const viewportScale = Math.max(1.0, Math.min(1.5, width / 1080));
      const treeSlots: { z: number; slotIdx: number }[] = [];
      const rowCount = 9;
      for (let r = 0; r < rowCount; r++) {
        const z = ((r / rowCount + forwardScroll * 0.55) % 1.0);
        treeSlots.push({ z, slotIdx: r });
      }
      // Sort from farthest (near horizon) to nearest (foreground) for true 3D depth occlusion
      treeSlots.sort((a, b) => a.z - b.z);

      for (const slot of treeSlots) {
        const depth = slot.z * slot.z;
        if (depth < 0.015 || depth > 0.96) continue;
        const perspScale = Math.pow(slot.z, 1.22);
        const baseRoadY = getRoadY(depth);

        for (const side of [-1, 1] as const) {
          const roadEdgeX = getRoadEdgeX(depth, side);

          // Outer background hill tree + inner roadside tree on both left & right sides (All 4 Tree Varieties: Purple, Green, White, Orange!)
          for (let tier = 0; tier < 2; tier++) {
            const treeVariety =
              (slot.slotIdx + (side === -1 ? 0 : 2) + tier) % 4;
            const spriteList =
              treeVariety === 0
                ? litIntroTrees.jacarandaSprites
                : treeVariety === 1
                ? litIntroTrees.greenSprites
                : treeVariety === 2
                ? litIntroTrees.sakuraSprites
                : litIntroTrees.orangeSprites;
            const sprite = spriteList[(slot.slotIdx + tier) % spriteList.length];

            // Prominent, large, realistically proportioned scale on both sides of the perspective road
            const treeScale =
              ((tier === 0 ? 0.62 : 0.78) +
                perspScale * (tier === 0 ? 1.12 : 1.38)) *
              viewportScale;
            const drawW = sprite.width * treeScale;
            const drawH = sprite.height * treeScale;

            const lateralOffset =
              tier === 0
                ? 110 +
                  270 * perspScale +
                  Math.sin(slot.slotIdx * 2.7) * 20 * perspScale
                : 38 +
                  138 * perspScale +
                  Math.cos(slot.slotIdx * 3.1) * 14 * perspScale;
            const treeX = roadEdgeX + side * lateralOffset;
            const treeY = baseRoadY + 10 * perspScale - (tier === 0 ? 8 * perspScale : 0);
            const introRainAmt = Math.max(0, Math.min(1, state.rainIntensity || 0));
            const introWindSpeed = 1.7 + introRainAmt * 3.8;
            const introWindAmp = 1.0 + introRainAmt * 2.5;
            const introPhase = t * introWindSpeed + slot.slotIdx * 2.1 + side;
            const introShearX =
              -introRainAmt * 0.075 +
              (Math.sin(introPhase) +
                Math.sin(introPhase * 2.4) * (0.28 + introRainAmt * 0.45)) *
                introWindAmp *
                0.024;

            ctx.save();
            ctx.translate(treeX, treeY + 22 * treeScale);
            ctx.transform(1, 0, introShearX, 1, 0, 0);
            ctx.globalAlpha = 1.0;
            ctx.drawImage(
              sprite,
              -drawW * 0.5,
              -drawH,
              drawW,
              drawH
            );
            ctx.restore();

            // Random splash particles distributed naturally across intro tree leaf foliage during rain
            if (introRainAmt > 0.05) {
              const introCrownOffsetX = -drawH * 0.64 * introShearX;
              const iRainAlpha = Math.min(0.92, 0.38 + introRainAmt * 0.5);
              ctx.save();
              ctx.strokeStyle = `rgba(224, 242, 254, ${iRainAlpha})`;
              ctx.lineWidth = Math.max(1.0, 1.25 * treeScale);
              ctx.beginPath();
              for (let fs = 0; fs < 6; fs++) {
                const fSeed = slot.slotIdx * 19.3 + fs * 7.9 + (side === 1 ? 5 : 0);
                const sPhase = (t * 5.8 + fSeed) % 1;
                if (sPhase < 0.62) {
                  const sp = sPhase / 0.62;
                  const rNorm = Math.sqrt(((fs * 29 + slot.slotIdx * 11) % 17) / 17) * 0.88;
                  const ang = fSeed * 2.39996;
                  const sx =
                    treeX +
                    introCrownOffsetX +
                    Math.cos(ang) * rNorm * (drawW * 0.36);
                  const sy =
                    treeY -
                    drawH * 0.64 +
                    Math.sin(ang) * rNorm * (drawH * 0.22);
                  const spread = (1.6 + sp * 4.5) * treeScale;
                  const lift = (1 - sp) * 4.5 * treeScale;
                  ctx.moveTo(sx, sy);
                  ctx.lineTo(sx - spread, sy - lift);
                  ctx.moveTo(sx, sy);
                  ctx.lineTo(sx + spread, sy - lift);
                }
              }
              ctx.stroke();
              ctx.restore();
            }

            // Solid falling purple / green / white / orange petals & leaves along both sides of the road (Time-of-day lit)
            if (tier === 1) {
              for (let pt = 0; pt < 4; pt++) {
                const pSeed = slot.slotIdx * 13.1 + pt * 5.7 + (side === 1 ? 9 : 0);
                const fallProg = (t * 0.32 + pSeed) % 1;
                const px =
                  treeX +
                  Math.sin(pSeed * 2.3) * (drawW * 0.34) -
                  fallProg * 24 * treeScale +
                  Math.sin(t * 2.5 + pSeed) * 6 * treeScale;
                const py =
                  treeY -
                  drawH * 0.72 +
                  fallProg * (drawH * 0.58);
                ctx.fillStyle =
                  treeVariety === 0
                    ? pt % 2 === 0
                      ? litIntroTrees.jacPetal1
                      : litIntroTrees.jacPetal2
                    : treeVariety === 1
                    ? pt % 2 === 0
                      ? litIntroTrees.greenLeaf1
                      : litIntroTrees.greenLeaf2
                    : treeVariety === 2
                    ? pt % 2 === 0
                      ? litIntroTrees.sakPetal1
                      : litIntroTrees.sakPetal2
                    : pt % 2 === 0
                    ? litIntroTrees.orangeLeaf1
                    : litIntroTrees.orangeLeaf2;
                ctx.beginPath();
                ctx.ellipse(
                  px,
                  py,
                  Math.max(2.4, 4.2 * treeScale),
                  Math.max(1.5, 2.5 * treeScale),
                  t * 1.8 + pSeed,
                  0,
                  Math.PI * 2
                );
                ctx.fill();
              }
            }
          }
        }
      }
      ctx.restore();
    }

    // 4. PROMINENT 3D IRON FENCE / METALLIC W-BEAM GUARDRAILS ON BOTH SIDES OF THE ROAD (السياج الحديدي في المشهد السينمائي — بدون أي أشجار أو عوائق جانبية)
    for (const side of [-1, 1] as const) {
      const postCount = 14;
      for (let p = 0; p < postCount; p++) {
        const z = (p / postCount + forwardScroll) % 1.0;
        const depth = z * z;
        if (depth < 0.015) continue;
        const gx = getRoadEdgeX(depth, side) + side * (8 * depth);
        const gy = getRoadY(depth);
        const postW = Math.max(2.4, 10.5 * depth);
        const postH = Math.max(6, 48 * depth);

        // Galvanized Steel I-Beam Fence Post
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = Math.max(0.7, 1.4 * depth);
        ctx.fillRect(gx - postW * 0.5, gy - postH, postW, postH);
        ctx.strokeRect(gx - postW * 0.5, gy - postH, postW, postH);

        // Metallic Specular Edge on Steel Post
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(
          gx - postW * 0.25,
          gy - postH + 1,
          postW * 0.28,
          postH - 2
        );

        // Glowing Red / Amber Highway Reflector Plate on Fence Post
        ctx.fillStyle = p % 2 === 0 ? '#EF4444' : '#F59E0B';
        ctx.fillRect(
          gx - postW * 0.38,
          gy - postH * 0.76,
          postW * 0.76,
          Math.max(1.8, 5.5 * depth)
        );

        // Tall Automated Modern Street Light Poles spanning the complete perspective road in the Intro Cutscene
        // - Full-size Cobra-Head LED Luminaire Fixtures matching the 28px x 8px scale used during main gameplay
        // - Boosted glow brightness & expanded light projection radius illuminating the intro scene clearly
        if (p % 2 === 0 && depth > 0.014) {
          const introLight = getStreetLightState(state.weatherCycleSec);
          const perspScale = Math.pow(z, 1.12);
          const fixtureScale = Math.max(0.56, 0.48 + perspScale * 0.92);
          const poleH = Math.max(32, 268 * perspScale);
          const poleW = Math.max(2.6, 7.2 * perspScale);
          const armW = Math.max(18, 46 * perspScale);
          const basePX = gx + side * (postW * 1.05 + 4 * depth);
          const topPY = gy - poleH;
          const lampPX = basePX - side * armW;
          const lampPY = topPY - Math.max(5.5, 16 * fixtureScale);
          const headW = 28 * fixtureScale;
          const headH = 8.4 * fixtureScale;

          // 1. Heavy metallic pedestal base
          ctx.fillStyle = '#1E293B';
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = Math.max(1.0, 1.4 * perspScale);
          ctx.beginPath();
          ctx.roundRect(
            basePX - poleW * 0.95,
            gy - Math.max(5, 16 * perspScale),
            poleW * 1.9,
            Math.max(5.5, 18 * perspScale),
            Math.max(1.5, 2.5 * perspScale)
          );
          ctx.fill();
          ctx.stroke();

          // 2. Tall tapered steel pole shaft
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.moveTo(basePX - poleW * 0.58, gy - Math.max(4, 14 * perspScale));
          ctx.lineTo(basePX - poleW * 0.36, topPY);
          ctx.lineTo(basePX + poleW * 0.36, topPY);
          ctx.lineTo(basePX + poleW * 0.58, gy - Math.max(4, 14 * perspScale));
          ctx.closePath();
          ctx.fill();

          // 3. High curved cantilever overhang arm + diagonal under-brace support gusset matching main gameplay
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = Math.max(2.2, 4.4 * fixtureScale);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(basePX, topPY + 2 * fixtureScale);
          ctx.quadraticCurveTo(
            basePX - side * armW * 0.25,
            lampPY,
            lampPX + side * (headW * 0.28),
            lampPY
          );
          ctx.stroke();

          ctx.strokeStyle = '#334155';
          ctx.lineWidth = Math.max(1.2, 2.2 * fixtureScale);
          ctx.beginPath();
          ctx.moveTo(basePX - side * 1.5, topPY + 16 * fixtureScale);
          ctx.lineTo(basePX - side * armW * 0.48, lampPY + 2.5 * fixtureScale);
          ctx.stroke();

          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = Math.max(0.9, 1.3 * fixtureScale);
          ctx.beginPath();
          ctx.moveTo(basePX, topPY + 1 * fixtureScale);
          ctx.quadraticCurveTo(
            basePX - side * armW * 0.25,
            lampPY - 1.2 * fixtureScale,
            lampPX + side * (headW * 0.28),
            lampPY - 1.2 * fixtureScale
          );
          ctx.stroke();

          // 4. Full-Scale Cobra-Head LED Luminaire Housing (matches 28px x 8px main gameplay fixture!)
          ctx.fillStyle = '#1E293B';
          ctx.strokeStyle = '#64748B';
          ctx.lineWidth = Math.max(1.0, 1.3 * fixtureScale);
          ctx.beginPath();
          ctx.roundRect(
            lampPX - headW * 0.5,
            lampPY - headH * 0.55,
            headW,
            headH,
            Math.max(2.2, 4 * fixtureScale)
          );
          ctx.fill();
          ctx.stroke();

          // 5. High-Brightness Light Projection Cone, Wide Road Illumination Pool & Bright LED Emitter Halo
          const introInten = introLight.isOn
            ? Math.max(0.96, introLight.intensity)
            : 0.94;
          const coneW = Math.max(54, 138 * perspScale);
          const coneBotY = gy + 8 * perspScale;

          // 5A. Wide Bright Volumetric Light Cone illuminating the intro perspective scene clearly
          const coneGrad = ctx.createLinearGradient(
            lampPX,
            lampPY + headH * 0.35,
            lampPX,
            coneBotY
          );
          coneGrad.addColorStop(0, `rgba(255, 253, 230, ${0.74 * introInten})`);
          coneGrad.addColorStop(0.35, `rgba(254, 240, 138, ${0.46 * introInten})`);
          coneGrad.addColorStop(0.74, `rgba(251, 191, 36, ${0.24 * introInten})`);
          coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = coneGrad;
          ctx.beginPath();
          ctx.moveTo(lampPX - headW * 0.36, lampPY + headH * 0.35);
          ctx.lineTo(lampPX + headW * 0.36, lampPY + headH * 0.35);
          ctx.lineTo(lampPX + coneW, coneBotY);
          ctx.lineTo(lampPX - coneW, coneBotY);
          ctx.closePath();
          ctx.fill();

          // 5B. Expanded Elliptical Road Surface Light Projection Pool & Wet Asphalt Hotspot
          const poolRx = Math.max(48, 132 * perspScale);
          const poolRy = Math.max(6.5, 16.5 * perspScale);
          const poolGrad = ctx.createRadialGradient(
            lampPX,
            gy + 3 * perspScale,
            3,
            lampPX,
            gy + 3 * perspScale,
            poolRx
          );
          poolGrad.addColorStop(0, `rgba(255, 253, 230, ${0.68 * introInten})`);
          poolGrad.addColorStop(0.45, `rgba(253, 224, 71, ${0.42 * introInten})`);
          poolGrad.addColorStop(0.82, `rgba(245, 158, 11, ${0.18 * introInten})`);
          poolGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = poolGrad;
          ctx.beginPath();
          ctx.ellipse(lampPX, gy + 3 * perspScale, poolRx, poolRy, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255, 255, 255, ${0.55 * introInten})`;
          ctx.beginPath();
          ctx.ellipse(
            lampPX,
            gy + 2.5 * perspScale,
            poolRx * 0.34,
            poolRy * 0.36,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();

          // 5C. Large Bright LED Fixture Glow Halo & Full-Scale Emitter Core
          const haloR = Math.max(24, 48 * fixtureScale);
          const bulbHalo = ctx.createRadialGradient(
            lampPX,
            lampPY + headH * 0.32,
            2,
            lampPX,
            lampPY + headH * 0.32,
            haloR
          );
          bulbHalo.addColorStop(0, `rgba(255, 255, 255, ${0.98 * introInten})`);
          bulbHalo.addColorStop(0.38, `rgba(254, 240, 138, ${0.78 * introInten})`);
          bulbHalo.addColorStop(0.72, `rgba(251, 191, 36, ${0.34 * introInten})`);
          bulbHalo.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = bulbHalo;
          ctx.beginPath();
          ctx.arc(lampPX, lampPY + headH * 0.32, haloR, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(
            lampPX,
            lampPY + headH * 0.32,
            10.2 * fixtureScale,
            3.2 * fixtureScale,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      // Upper & Lower 3D Corrugated Iron Fence Rails (عوارض السياج الحديدي المزدوجة)
      const railTopX = getRoadEdgeX(0, side) + side * 1.5;
      const railTopY = horizonY - 5;
      const railBotX = getRoadEdgeX(1, side) + side * 8;
      const railBotY = roadBotY - 34;

      // 1) Lower Secondary Iron Safety Bar
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      ctx.moveTo(railTopX, railTopY + 2.5);
      ctx.lineTo(railBotX, railBotY + 14);
      ctx.stroke();

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(railTopX, railTopY + 2.5);
      ctx.lineTo(railBotX, railBotY + 14);
      ctx.stroke();

      // 2) Main Upper Corrugated Steel W-Beam Fence Ribbon
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(railTopX, railTopY);
      ctx.lineTo(railBotX, railBotY);
      ctx.stroke();

      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 10.5;
      ctx.beginPath();
      ctx.moveTo(railTopX, railTopY);
      ctx.lineTo(railBotX, railBotY);
      ctx.stroke();

      // Chrome Specular Highlight & Recessed Center Channel
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(railTopX, railTopY - 1.8);
      ctx.lineTo(railBotX, railBotY - 3.2);
      ctx.stroke();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(railTopX, railTopY + 0.6);
      ctx.lineTo(railBotX, railBotY + 0.8);
      ctx.stroke();

      // 3) Detailed Green Grass Patches & Scattered Vibrant Flowers (Purple, Pink, Yellow, White)
      //    Along the Outer Side of the Perspective Iron Road Fence, Seamlessly Blending with the Terrain!
      const introFlowerColors = [
        { petal: '#A855F7', light: '#D8B4FE', center: '#FACC15' }, // Purple
        { petal: '#EC4899', light: '#F9A8D4', center: '#FEF08A' }, // Pink
        { petal: '#FACC15', light: '#FEF9C3', center: '#EA580C' }, // Yellow
        { petal: '#F8FAFC', light: '#FFFFFF', center: '#F59E0B' }, // White
      ];
      const grassPatchCount = 18;
      for (let gp = 0; gp < grassPatchCount; gp++) {
        const gz = (gp / grassPatchCount + forwardScroll) % 1.0;
        const gDepth = gz * gz;
        if (gDepth < 0.02) continue;
        const gScale = Math.pow(gz, 1.15);
        const fenceX = getRoadEdgeX(gDepth, side) + side * (8 * gDepth);
        const outerGrassX =
          fenceX +
          side * (10 * gScale + (gp % 3) * 4.5 * gScale);
        const outerGrassY = getRoadY(gDepth) + 2 * gScale;
        const sway = Math.sin(t * 2.3 + gp * 1.4 + side) * 2.4 * gScale;

        // Seamless green turf mound blending into the valley ground
        ctx.fillStyle = state.nightFactor > 0.4 ? '#0B4627' : '#15803D';
        ctx.beginPath();
        ctx.ellipse(
          outerGrassX,
          outerGrassY,
          Math.max(4, 18 * gScale),
          Math.max(1.8, 5.2 * gScale),
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Swaying green grass blades along the outer side of the iron fence
        const bladeCnt = 5;
        for (let b = 0; b < bladeCnt; b++) {
          const bNorm = (b / (bladeCnt - 1)) * 2 - 1;
          const bx = outerGrassX + bNorm * 11 * gScale;
          const bh = Math.max(3.5, (12 + ((gp + b) % 3) * 3.5) * gScale);
          ctx.strokeStyle =
            b % 2 === 0
              ? state.nightFactor > 0.4
                ? '#156539'
                : '#4ADE80'
              : state.nightFactor > 0.4
              ? '#0B4627'
              : '#16A34A';
          ctx.lineWidth = Math.max(0.9, 1.8 * gScale);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(bx, outerGrassY);
          ctx.quadraticCurveTo(
            bx + bNorm * 2 * gScale,
            outerGrassY - bh * 0.55,
            bx + bNorm * 4.5 * gScale + sway,
            outerGrassY - bh
          );
          ctx.stroke();
        }

        // Vibrant colorful flowers (Purple, Pink, Yellow, White) blooming in the grass patch
        const flCount = gp % 2 === 0 ? 2 : 1;
        for (let f = 0; f < flCount; f++) {
          const fc =
            introFlowerColors[(gp + f * 2 + (side === 1 ? 1 : 0)) % introFlowerColors.length];
          const fx =
            outerGrassX +
            (f === 0 ? -4.5 : 5.5) * gScale +
            sway * 0.8;
          const fy =
            outerGrassY - Math.max(3.5, (11 + ((gp + f) % 3) * 3) * gScale);
          const pr = Math.max(1.4, 3.2 * gScale);

          ctx.fillStyle = fc.petal;
          ctx.beginPath();
          for (let pt = 0; pt < 5; pt++) {
            const a = (pt / 5) * Math.PI * 2 + gp;
            const px = fx + Math.cos(a) * pr * 0.85;
            const py = fy + Math.sin(a) * pr * 0.8;
            ctx.moveTo(px + pr * 0.65, py);
            ctx.arc(px, py, pr * 0.65, 0, Math.PI * 2);
          }
          ctx.fill();

          ctx.fillStyle = fc.center;
          ctx.beginPath();
          ctx.arc(fx, fy, pr * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 6. FIRST-PERSON CABIN FOREGROUND: ENCLOSED WINDSHIELD GLASS TINT & GLARE, REARVIEW MIRROR WITH REAR SEATS & ROAD, FULL DASHBOARD (RADIO, VENTS, STALKS, HAZARD, GEAR SHIFTER) & REALISTIC HANDS ON 3D STEERING WHEEL!
    ctx.save();
    ctx.translate(engineVibX, engineVibY);

    // A) Sculpted Metallic Front Car Hood visible through the lower windshield
    const hoodTopY = height * 0.62;
    const hoodBotY = height * 0.75;
    const hoodGrad = ctx.createLinearGradient(0, hoodTopY, 0, hoodBotY);
    hoodGrad.addColorStop(0, car.bodyColor);
    hoodGrad.addColorStop(0.5, car.bodyColor);
    hoodGrad.addColorStop(1, car.secondaryColor);
    ctx.fillStyle = hoodGrad;
    ctx.strokeStyle = '#090D16';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(width * 0.21, hoodTopY + 8);
    ctx.quadraticCurveTo(width * 0.5, hoodTopY - 10, width * 0.79, hoodTopY + 8);
    ctx.lineTo(width * 0.92, hoodBotY);
    ctx.lineTo(width * 0.08, hoodBotY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Hood Power Dome & Twin Racing Stripes + Wet Sun Glint
    ctx.fillStyle = 'rgba(2, 6, 23, 0.32)';
    ctx.beginPath();
    ctx.moveTo(width * 0.41, hoodTopY + 2);
    ctx.lineTo(width * 0.59, hoodTopY + 2);
    ctx.lineTo(width * 0.64, hoodBotY);
    ctx.lineTo(width * 0.36, hoodBotY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = car.accentColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.41, hoodTopY + 3);
    ctx.lineTo(width * 0.36, hoodBotY);
    ctx.moveTo(width * 0.59, hoodTopY + 3);
    ctx.lineTo(width * 0.64, hoodBotY);
    ctx.stroke();

    // A2) FRONT WINDSHIELD REAL GLASS TINT, SUN-VISOR SHADE BAND, WIPER BLADES & DIAGONAL LIGHT REFLECTION GLARE
    {
      ctx.save();
      // Clip to windshield glass opening
      ctx.beginPath();
      ctx.moveTo(width * 0.105, height * 0.082);
      ctx.lineTo(width * 0.895, height * 0.082);
      ctx.lineTo(width * 0.948, height * 0.735);
      ctx.lineTo(width * 0.052, height * 0.735);
      ctx.closePath();
      ctx.clip();

      // 1. Subtle Full-Windshield Automotive Laminated Glass Tint
      const wsTintGrad = ctx.createLinearGradient(0, height * 0.08, 0, height * 0.74);
      wsTintGrad.addColorStop(0, 'rgba(14, 116, 144, 0.18)');
      wsTintGrad.addColorStop(0.22, 'rgba(56, 189, 248, 0.07)');
      wsTintGrad.addColorStop(0.78, 'rgba(186, 230, 253, 0.05)');
      wsTintGrad.addColorStop(1, 'rgba(15, 23, 42, 0.14)');
      ctx.fillStyle = wsTintGrad;
      ctx.fillRect(0, height * 0.08, width, height * 0.66);

      // 2. Top Sun-Visor Blue-Cyan Tint Strip along upper windshield edge
      const visorBandGrad = ctx.createLinearGradient(0, height * 0.082, 0, height * 0.175);
      visorBandGrad.addColorStop(0, 'rgba(2, 6, 23, 0.52)');
      visorBandGrad.addColorStop(0.45, 'rgba(3, 105, 161, 0.28)');
      visorBandGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = visorBandGrad;
      ctx.fillRect(0, height * 0.082, width, height * 0.095);

      // 3. Diagonal Multi-Band Specular Light Reflection Glare Streaks across Front Windshield Glass
      const glareShift = forwardScroll * 28;
      const glareGrad1 = ctx.createLinearGradient(
        width * 0.14 - glareShift,
        height * 0.08,
        width * 0.42 - glareShift,
        height * 0.72
      );
      glareGrad1.addColorStop(0, 'rgba(255, 255, 255, 0)');
      glareGrad1.addColorStop(0.42, 'rgba(224, 242, 254, 0.13)');
      glareGrad1.addColorStop(0.5, 'rgba(255, 255, 255, 0.22)');
      glareGrad1.addColorStop(0.58, 'rgba(224, 242, 254, 0.11)');
      glareGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glareGrad1;
      ctx.beginPath();
      ctx.moveTo(width * 0.18 - glareShift, height * 0.08);
      ctx.lineTo(width * 0.31 - glareShift, height * 0.08);
      ctx.lineTo(width * 0.17 - glareShift, height * 0.73);
      ctx.lineTo(width * 0.05 - glareShift, height * 0.73);
      ctx.closePath();
      ctx.fill();

      // Secondary narrow glass glare streak on right side of windshield
      ctx.fillStyle = 'rgba(255, 255, 255, 0.10)';
      ctx.beginPath();
      ctx.moveTo(width * 0.74 - glareShift * 0.6, height * 0.08);
      ctx.lineTo(width * 0.79 - glareShift * 0.6, height * 0.08);
      ctx.lineTo(width * 0.67 - glareShift * 0.6, height * 0.73);
      ctx.lineTo(width * 0.62 - glareShift * 0.6, height * 0.73);
      ctx.closePath();
      ctx.fill();

      // Crisp diagonal glass reflection highlight lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.26)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(width * 0.24 - glareShift, height * 0.09);
      ctx.lineTo(width * 0.11 - glareShift, height * 0.71);
      ctx.moveTo(width * 0.76 - glareShift * 0.6, height * 0.09);
      ctx.lineTo(width * 0.64 - glareShift * 0.6, height * 0.71);
      ctx.stroke();

      // 4. Subtle Ceramic Frit Border & Resting Dual Windshield Wipers at Cowl Base
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.lineWidth = 6;
      ctx.strokeRect(width * 0.055, height * 0.084, width * 0.89, height * 0.645);

      // Left & Right Aerodynamic Windshield Wiper Blades resting along lower windshield
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(width * 0.16, height * 0.73);
      ctx.quadraticCurveTo(width * 0.31, height * 0.685, width * 0.46, height * 0.712);
      ctx.moveTo(width * 0.54, height * 0.73);
      ctx.quadraticCurveTo(width * 0.69, height * 0.688, width * 0.84, height * 0.716);
      ctx.stroke();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();
    }

    // B) Panoramic Cabin Windshield Frame, Left & Right A-Pillars & Enhanced Interior Rearview Mirror
    // Left A-pillar with clean 3D interior trim (no dark circular speaker holes/cutouts)
    const leftPillarGrad = ctx.createLinearGradient(0, 0, width * 0.11, height * 0.4);
    leftPillarGrad.addColorStop(0, '#020617');
    leftPillarGrad.addColorStop(0.65, '#0F172A');
    leftPillarGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = leftPillarGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.11, 0);
    ctx.lineTo(width * 0.054, height * 0.76);
    ctx.lineTo(0, height * 0.76);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.11, 0);
    ctx.lineTo(width * 0.054, height * 0.76);
    ctx.stroke();

    // Right A-pillar with clean 3D interior trim (no dark circular speaker holes/cutouts)
    const rightPillarGrad = ctx.createLinearGradient(width, 0, width * 0.89, height * 0.4);
    rightPillarGrad.addColorStop(0, '#020617');
    rightPillarGrad.addColorStop(0.65, '#0F172A');
    rightPillarGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = rightPillarGrad;
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width * 0.89, 0);
    ctx.lineTo(width * 0.946, height * 0.76);
    ctx.lineTo(width, height * 0.76);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.89, 0);
    ctx.lineTo(width * 0.946, height * 0.76);
    ctx.stroke();

    // Top Cabin Headliner Header (Clean continuous trim without dark cutouts)
    const headerGrad = ctx.createLinearGradient(0, 0, 0, height * 0.09);
    headerGrad.addColorStop(0, '#020617');
    headerGrad.addColorStop(0.75, '#0F172A');
    headerGrad.addColorStop(1, '#1E293B');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, width, height * 0.068);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(width * 0.09, height * 0.068);
    ctx.lineTo(width * 0.91, height * 0.068);
    ctx.stroke();

    // B2) ENHANCED TOP INTERIOR REARVIEW MIRROR MATCHING THE EXACT FRONT SCENE ENVIRONMENT, BOTANICAL TREES, STREET LIGHTS, IRON FENCE & WET ROAD!
    {
      const mirW = width * 0.27;
      const mirH = height * 0.116;
      const mirX = width * 0.5 - mirW * 0.5;
      const mirY = height * 0.054;

      // 3D Ball-Joint Mounting Stem connecting Mirror to Headliner
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(width * 0.5 - 9, height * 0.02, 18, mirY - height * 0.015, 5);
      ctx.fill();
      ctx.stroke();

      // Outer 3D Sculpted Rearview Mirror Housing & Bezel
      ctx.save();
      ctx.fillStyle = '#090D16';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.roundRect(mirX - 4, mirY - 4, mirW + 8, mirH + 8, 14);
      ctx.fill();
      ctx.stroke();

      // Anti-glare night/day flip tab underneath mirror center
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(width * 0.5 - 12, mirY + mirH + 2, 24, 6, 2);
      ctx.fill();

      // Clip inside the Rearview Mirror Glass Lens
      ctx.beginPath();
      ctx.roundRect(mirX, mirY, mirW, mirH, 10);
      ctx.clip();

      const mHzY = mirY + mirH * 0.42;
      const mCx = width * 0.5;
      const mRoadBotY = mirY + mirH;

      // 1. EXACT MATCHING SKY, VOLUMETRIC CLOUDS, STATIC MOUNTAIN RANGE & VALLEY MIST FROM THE FRONT SCENE
      const mirWeatherInfo = getWeatherPhaseInfo(state.weatherCycleSec);
      if (staticBackgroundImages.length > 0) {
        const menuEntry = staticBackgroundImages[0];
        const bgSource =
          menuEntry.loaded &&
          menuEntry.img.complete &&
          menuEntry.img.naturalWidth > 0
            ? menuEntry.img
            : menuEntry.fallbackCanvas;
        ctx.drawImage(bgSource, mirX, mirY, mirW, mirH);
      } else {
        const mirSkyFallback = ctx.createLinearGradient(0, mirY, 0, mHzY);
        mirSkyFallback.addColorStop(0, mirWeatherInfo.skyTop);
        mirSkyFallback.addColorStop(0.55, mirWeatherInfo.skyMid);
        mirSkyFallback.addColorStop(1, mirWeatherInfo.skyBottom);
        ctx.fillStyle = mirSkyFallback;
        ctx.fillRect(mirX, mirY, mirW, mHzY - mirY);
      }

      // Dynamic Sky Atmosphere Gradient matching drawBackground
      {
        ctx.save();
        const mirSkyGrad = ctx.createLinearGradient(0, mirY, 0, mirY + mirH * 0.62);
        mirSkyGrad.addColorStop(0, mirWeatherInfo.skyTop);
        mirSkyGrad.addColorStop(0.48, mirWeatherInfo.skyMid);
        mirSkyGrad.addColorStop(0.82, mirWeatherInfo.skyBottom);
        mirSkyGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalAlpha = Math.min(0.9, 0.56 + state.nightFactor * 0.34);
        ctx.fillStyle = mirSkyGrad;
        ctx.fillRect(mirX, mirY, mirW, mirH * 0.64);
        if (state.nightFactor > 0.04) {
          ctx.globalAlpha = Math.min(0.68, state.nightFactor * 0.58);
          ctx.fillStyle = '#081226';
          ctx.fillRect(mirX, mirY, mirW, mirH);
        }
        ctx.restore();
      }

      // Drifting Volumetric 3D Clouds in Mirror Upper Sky matching Front Scene
      if (volumetricCloudCanvases.length > 0) {
        ctx.save();
        for (let mc = 0; mc < 4; mc++) {
          const cImg = volumetricCloudCanvases[mc % volumetricCloudCanvases.length];
          const cw = mirW * (0.22 + (mc % 2) * 0.05);
          const ch = mirH * 0.22;
          const spanCW = mirW + cw + 20;
          const rawCX = mirW * (0.08 + mc * 0.25) - t * (4 + mc);
          const dcx = mirX + (((rawCX % spanCW) + spanCW) % spanCW) - cw * 0.5;
          const dcy = mirY + mirH * (0.03 + (mc % 2) * 0.05);
          ctx.globalAlpha = 0.52;
          ctx.drawImage(cImg, dcx, dcy, cw, ch);
        }
        ctx.restore();
      }

      // 2. LUSH GREEN FOREST VALLEY GROUND & HORIZON MOUNTAIN MIST MATCHING FRONT SCENE (step 2 & 2B)
      const mirGroundGrad = ctx.createLinearGradient(0, mHzY, 0, mRoadBotY);
      mirGroundGrad.addColorStop(0, '#15803D');
      mirGroundGrad.addColorStop(0.35, '#166534');
      mirGroundGrad.addColorStop(0.75, '#14532D');
      mirGroundGrad.addColorStop(1, '#052E16');
      ctx.fillStyle = mirGroundGrad;
      ctx.fillRect(mirX, mHzY, mirW, mRoadBotY - mHzY);

      // Subtle Mountain Valley Fog / Mist Layer across Mirror Horizon
      {
        const mMistGrad = ctx.createLinearGradient(
          0,
          mHzY - mirH * 0.08,
          0,
          mHzY + mirH * 0.15
        );
        mMistGrad.addColorStop(0, 'rgba(241, 245, 249, 0)');
        mMistGrad.addColorStop(
          0.48,
          state.nightFactor > 0.35
            ? 'rgba(186, 230, 253, 0.36)'
            : 'rgba(241, 245, 249, 0.52)'
        );
        mMistGrad.addColorStop(1, 'rgba(226, 232, 240, 0)');
        ctx.fillStyle = mMistGrad;
        ctx.fillRect(mirX, mHzY - mirH * 0.08, mirW, mirH * 0.23);
      }

      // 3. WET ASPHALT ROAD SURFACE IN PERSPECTIVE MATCHING FRONT ROAD 1:1 (step 3)
      const mRoadTopW = mirW * 0.054;
      const mRoadBotW = mirW * 0.43;
      const getMirRoadEdgeX = (depthNorm: number, side: -1 | 1) => {
        const halfW = mRoadTopW + (mRoadBotW - mRoadTopW) * depthNorm;
        return mCx + side * halfW;
      };
      const getMirRoadY = (depthNorm: number) =>
        mHzY + (mRoadBotY - mHzY) * depthNorm;

      // Green grass verge border outside the asphalt
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.moveTo(mCx - mRoadTopW * 1.28, mHzY);
      ctx.lineTo(mCx + mRoadTopW * 1.28, mHzY);
      ctx.lineTo(mCx + mRoadBotW * 1.14, mRoadBotY);
      ctx.lineTo(mCx - mRoadBotW * 1.14, mRoadBotY);
      ctx.closePath();
      ctx.fill();

      // Main 2K Smooth Dark-Grey Wet Asphalt Deck
      const mirRoadGrad = ctx.createLinearGradient(0, mHzY, 0, mRoadBotY);
      mirRoadGrad.addColorStop(0, '#334155');
      mirRoadGrad.addColorStop(0.25, '#1E293B');
      mirRoadGrad.addColorStop(0.7, '#0F172A');
      mirRoadGrad.addColorStop(1, '#090D16');
      ctx.fillStyle = mirRoadGrad;
      ctx.beginPath();
      ctx.moveTo(mCx - mRoadTopW, mHzY);
      ctx.lineTo(mCx + mRoadTopW, mHzY);
      ctx.lineTo(mCx + mRoadBotW, mRoadBotY);
      ctx.lineTo(mCx - mRoadBotW, mRoadBotY);
      ctx.closePath();
      ctx.fill();

      // Wet Track Gloss Reflection Ribbons (Warm Golden Sunlight & Sky Cyan Sheen on Wet Asphalt)
      const mWetGlow = ctx.createLinearGradient(0, mHzY, 0, mRoadBotY);
      mWetGlow.addColorStop(0, 'rgba(254, 240, 138, 0.36)');
      mWetGlow.addColorStop(0.5, 'rgba(125, 211, 252, 0.28)');
      mWetGlow.addColorStop(1, 'rgba(56, 189, 248, 0.22)');
      ctx.fillStyle = mWetGlow;
      ctx.beginPath();
      ctx.moveTo(mCx - mRoadTopW * 0.45, mHzY);
      ctx.lineTo(mCx - mRoadTopW * 0.18, mHzY);
      ctx.lineTo(mCx - mRoadBotW * 0.22, mRoadBotY);
      ctx.lineTo(mCx - mRoadBotW * 0.52, mRoadBotY);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(mCx + mRoadTopW * 0.18, mHzY);
      ctx.lineTo(mCx + mRoadTopW * 0.45, mHzY);
      ctx.lineTo(mCx + mRoadBotW * 0.52, mRoadBotY);
      ctx.lineTo(mCx + mRoadBotW * 0.22, mRoadBotY);
      ctx.closePath();
      ctx.fill();

      // Scattered Mirror Water Puddles on the Wet Road matching Front Scene puddles
      for (const pd of puddleSlots) {
        const z = (pd.baseZ + forwardScroll) % 1.0;
        const depth = z * z;
        if (depth < 0.03 || depth > 0.95) continue;
        const py = getMirRoadY(depth);
        const rHalfW = mRoadTopW + (mRoadBotW - mRoadTopW) * depth;
        const px = mCx + pd.sideOffset * rHalfW;
        const pw = Math.max(3.5, rHalfW * pd.wScale);
        const ph = Math.max(0.9, 2.8 * depth);

        ctx.fillStyle = 'rgba(125, 211, 252, 0.48)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.ellipse(px, py, pw, ph, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Perspective Dashed Amber Highway Center Lane Markings matching Front Scene
      for (let d = 0; d < 8; d++) {
        const z0 = (d / 8 + forwardScroll) % 1.0;
        const z1 = Math.min(1.0, z0 + 0.06);
        if (z1 <= z0) continue;
        const p0 = z0 * z0;
        const p1 = z1 * z1;
        const y0 = getMirRoadY(p0);
        const y1 = getMirRoadY(p1);
        const w0 = Math.max(0.8, 2.8 * p0);
        const w1 = Math.max(1.1, 2.8 * p1);
        ctx.fillStyle = 'rgba(251, 191, 36, 0.88)';
        ctx.beginPath();
        ctx.moveTo(mCx - w0 * 0.5, y0);
        ctx.lineTo(mCx + w0 * 0.5, y0);
        ctx.lineTo(mCx + w1 * 0.5, y1);
        ctx.lineTo(mCx - w1 * 0.5, y1);
        ctx.closePath();
        ctx.fill();
      }

      // Polished Metallic Asphalt Edge Curbs
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(getMirRoadEdgeX(0, -1), mHzY);
      ctx.lineTo(getMirRoadEdgeX(1, -1), mRoadBotY);
      ctx.moveTo(getMirRoadEdgeX(0, 1), mHzY);
      ctx.lineTo(getMirRoadEdgeX(1, 1), mRoadBotY);
      ctx.stroke();

      // 4. ACTUAL BOTANICAL TREE SPRITES (JACARANDA PURPLE, LUSH GREEN, SAKURA WHITE & AUTUMN ORANGE) ON BOTH SIDES OF MIRROR ROAD MATCHING FRONT SCENE (step 3B)
      {
        const litMirTrees = getLitTreeAssets(state.weatherCycleSec);
        const mirScaleRatio = mirW / width;
        const mirTreeSlots: { z: number; slotIdx: number }[] = [];
        const mRowCount = 8;
        for (let r = 0; r < mRowCount; r++) {
          const z = (r / mRowCount + forwardScroll * 0.55) % 1.0;
          mirTreeSlots.push({ z, slotIdx: r });
        }
        mirTreeSlots.sort((a, b) => a.z - b.z);

        for (const slot of mirTreeSlots) {
          const depth = slot.z * slot.z;
          if (depth < 0.015 || depth > 0.96) continue;
          const perspScale = Math.pow(slot.z, 1.22);
          const baseRoadY = getMirRoadY(depth);

          for (const side of [-1, 1] as const) {
            const roadEdgeX = getMirRoadEdgeX(depth, side);
            for (let tier = 0; tier < 2; tier++) {
              const treeVariety =
                (slot.slotIdx + (side === -1 ? 0 : 2) + tier) % 4;
              const spriteList =
                treeVariety === 0
                  ? litMirTrees.jacarandaSprites
                  : treeVariety === 1
                  ? litMirTrees.greenSprites
                  : treeVariety === 2
                  ? litMirTrees.sakuraSprites
                  : litMirTrees.orangeSprites;
              const sprite = spriteList[(slot.slotIdx + tier) % spriteList.length];

              const tScale =
                ((tier === 0 ? 0.68 : 0.86) +
                  perspScale * (tier === 0 ? 1.18 : 1.45)) *
                mirScaleRatio;
              const drawW = sprite.width * tScale;
              const drawH = sprite.height * tScale;

              const latOffset =
                (tier === 0
                  ? 105 + 250 * perspScale + Math.sin(slot.slotIdx * 2.7) * 18 * perspScale
                  : 34 + 128 * perspScale + Math.cos(slot.slotIdx * 3.1) * 12 * perspScale) *
                mirScaleRatio;
              const treeX = roadEdgeX + side * latOffset;
              const treeY = baseRoadY + 3 * perspScale;
              const mShearX =
                Math.sin(t * 1.7 + slot.slotIdx * 2.1 + side) * 0.022;

              ctx.save();
              ctx.translate(treeX, treeY + 6 * tScale);
              ctx.transform(1, 0, mShearX, 1, 0, 0);
              ctx.drawImage(sprite, -drawW * 0.5, -drawH, drawW, drawH);
              ctx.restore();
            }
          }
        }
      }

      // 5. 3D CORRUGATED IRON FENCE GUARDRAILS, COBRA-HEAD STREET LIGHT POLES WITH GOLDEN LIGHT CONES & GREEN GRASS/FLOWERS ON BOTH SIDES OF MIRROR ROAD (step 4)
      {
        const mirScale = mirW / width;
        const mIntroLight = getStreetLightState(state.weatherCycleSec);
        const mInten = mIntroLight.isOn ? Math.max(0.96, mIntroLight.intensity) : 0.94;

        for (const side of [-1, 1] as const) {
          const mPostCount = 12;
          for (let p = 0; p < mPostCount; p++) {
            const z = (p / mPostCount + forwardScroll) % 1.0;
            const depth = z * z;
            if (depth < 0.015) continue;
            const gx = getMirRoadEdgeX(depth, side) + side * (2.5 * depth);
            const gy = getMirRoadY(depth);
            const postW = Math.max(0.9, 3.2 * depth);
            const postH = Math.max(2.2, 13 * depth);

            // Steel fence post + Red/Amber reflector
            ctx.fillStyle = '#334155';
            ctx.fillRect(gx - postW * 0.5, gy - postH, postW, postH);
            ctx.fillStyle = p % 2 === 0 ? '#EF4444' : '#F59E0B';
            ctx.fillRect(
              gx - postW * 0.4,
              gy - postH * 0.78,
              postW * 0.8,
              Math.max(0.8, 1.8 * depth)
            );

            // Tall Cobra-Head Street Light Pole & Golden Light Cone matching Front Scene
            if (p % 2 === 0 && depth > 0.02) {
              const pScale = Math.pow(z, 1.12);
              const poleH = Math.max(9, 76 * pScale);
              const armW = Math.max(5, 14 * pScale);
              const basePX = gx + side * (postW + 1.5 * depth);
              const topPY = gy - poleH;
              const lampPX = basePX - side * armW;
              const lampPY = topPY - Math.max(1.8, 4.5 * pScale);

              // Tapered steel shaft & curved cantilever arm
              ctx.strokeStyle = '#64748B';
              ctx.lineWidth = Math.max(0.8, 2.0 * pScale);
              ctx.beginPath();
              ctx.moveTo(basePX, gy);
              ctx.lineTo(basePX, topPY);
              ctx.quadraticCurveTo(
                basePX - side * armW * 0.3,
                lampPY,
                lampPX,
                lampPY
              );
              ctx.stroke();

              // Cobra-Head luminaire housing
              const hW = Math.max(3.5, 9 * pScale);
              const hH = Math.max(1.4, 2.8 * pScale);
              ctx.fillStyle = '#1E293B';
              ctx.fillRect(lampPX - hW * 0.5, lampPY - hH * 0.5, hW, hH);

              // Warm Golden Downward Volumetric Light Cone & Road Pool
              const coneW = Math.max(14, 38 * pScale);
              const coneGrad = ctx.createLinearGradient(lampPX, lampPY, lampPX, gy + 2);
              coneGrad.addColorStop(0, `rgba(255, 253, 230, ${0.68 * mInten})`);
              coneGrad.addColorStop(0.5, `rgba(254, 240, 138, ${0.36 * mInten})`);
              coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
              ctx.fillStyle = coneGrad;
              ctx.beginPath();
              ctx.moveTo(lampPX - hW * 0.35, lampPY);
              ctx.lineTo(lampPX + hW * 0.35, lampPY);
              ctx.lineTo(lampPX + coneW, gy + 2);
              ctx.lineTo(lampPX - coneW, gy + 2);
              ctx.closePath();
              ctx.fill();

              // Bright LED Emitter Halo
              ctx.fillStyle = '#FEF08A';
              ctx.beginPath();
              ctx.arc(lampPX, lampPY + 0.5, Math.max(1.4, 3.2 * pScale), 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Upper & Lower 3D Corrugated Iron Fence W-Beam Rails
          const rTopX = getMirRoadEdgeX(0, side) + side * 0.5;
          const rTopY = mHzY - 1.5;
          const rBotX = getMirRoadEdgeX(1, side) + side * 2.5;
          const rBotY = mRoadBotY - 9;

          ctx.strokeStyle = '#0F172A';
          ctx.lineWidth = 4.2;
          ctx.beginPath();
          ctx.moveTo(rTopX, rTopY);
          ctx.lineTo(rBotX, rBotY);
          ctx.stroke();

          ctx.strokeStyle = '#CBD5E1';
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.moveTo(rTopX, rTopY);
          ctx.lineTo(rBotX, rBotY);
          ctx.stroke();

          // Outer Green Grass Patches & Blooming Wildflowers along Mirror Iron Fence
          const mFlowerCols = ['#A855F7', '#EC4899', '#FACC15', '#FFFFFF'];
          for (let gp = 0; gp < 12; gp++) {
            const gz = (gp / 12 + forwardScroll) % 1.0;
            const gDepth = gz * gz;
            if (gDepth < 0.03) continue;
            const gScale = Math.pow(gz, 1.15) * mirScale * 3.4;
            const fX =
              getMirRoadEdgeX(gDepth, side) +
              side * (4 * gDepth + (3 + (gp % 3) * 1.5) * gScale);
            const fY = getMirRoadY(gDepth) + 0.8 * gScale;
            ctx.fillStyle = '#16A34A';
            ctx.beginPath();
            ctx.ellipse(
              fX,
              fY,
              Math.max(1.5, 4.5 * gScale),
              Math.max(0.8, 1.6 * gScale),
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.fillStyle = mFlowerCols[(gp + (side === 1 ? 1 : 0)) % mFlowerCols.length];
            ctx.beginPath();
            ctx.arc(fX, fY - Math.max(1.2, 2.6 * gScale), Math.max(0.9, 1.4 * gScale), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 6. Subtle Rear Cabin C-Pillars, Rear Window Defroster Lines & Low-Profile Rear Seat Headrests along Bottom Edge
      ctx.fillStyle = '#090D16';
      ctx.beginPath();
      ctx.moveTo(mirX, mirY);
      ctx.lineTo(mirX + mirW * 0.055, mirY);
      ctx.lineTo(mirX + mirW * 0.025, mirY + mirH);
      ctx.lineTo(mirX, mirY + mirH);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(mirX + mirW, mirY);
      ctx.lineTo(mirX + mirW * 0.945, mirY);
      ctx.lineTo(mirX + mirW * 0.975, mirY + mirH);
      ctx.lineTo(mirX + mirW, mirY + mirH);
      ctx.closePath();
      ctx.fill();

      // Subtle Rear Window Defroster Lines
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.16)';
      ctx.lineWidth = 0.7;
      for (let dl = 1; dl <= 3; dl++) {
        const dy = mirY + (mirH * dl) / 4.5;
        ctx.beginPath();
        ctx.moveTo(mirX + mirW * 0.05, dy);
        ctx.lineTo(mirX + mirW * 0.95, dy);
        ctx.stroke();
      }

      // Low-Profile Rear Seat Headrests at the very bottom edge of the mirror (keeps 86%+ of the mirror open for the matching scene reflection!)
      const seatBaseY = mirY + mirH * 0.88;
      const seatPositions = [
        mirX + mirW * 0.22,
        mirX + mirW * 0.5,
        mirX + mirW * 0.78,
      ];
      seatPositions.forEach((sx, sIdx) => {
        const isCenterSeat = sIdx === 1;
        const hw = isCenterSeat ? mirW * 0.065 : mirW * 0.085;
        const hh = isCenterSeat ? mirH * 0.11 : mirH * 0.15;
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.roundRect(sx - hw * 0.7, seatBaseY - hh * 0.45, hw * 1.4, hh + 4, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.roundRect(sx - hw * 0.4, seatBaseY - hh * 0.3, hw * 0.8, hh, 2.5);
        ctx.fill();
      });

      // 7. Rear Window & Mirror Glass Diagonal Specular Reflection Glare
      const mirGlare = ctx.createLinearGradient(mirX, mirY, mirX + mirW, mirY + mirH);
      mirGlare.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
      mirGlare.addColorStop(0.3, 'rgba(186, 230, 253, 0.05)');
      mirGlare.addColorStop(0.5, 'rgba(255, 255, 255, 0.18)');
      mirGlare.addColorStop(0.7, 'rgba(56, 189, 248, 0.04)');
      mirGlare.addColorStop(1, 'rgba(255, 255, 255, 0.10)');
      ctx.fillStyle = mirGlare;
      ctx.fillRect(mirX, mirY, mirW, mirH);

      // Crisp inner mirror bevel rim
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(mirX + 1, mirY + 1, mirW - 2, mirH - 2);
      ctx.restore();
    }

    // C) Sculpted Carbon-Leather Dashboard Deck, 4 Detailed Air Vents, Hazard Switch, Center Car Radio/Screen & Gear Shifter Stick!
    const dashTopY = height * 0.705;
    const dashGrad = ctx.createLinearGradient(0, dashTopY - 20, 0, height);
    dashGrad.addColorStop(0, '#1E293B');
    dashGrad.addColorStop(0.24, '#0F172A');
    dashGrad.addColorStop(0.65, '#090D16');
    dashGrad.addColorStop(1, '#020617');
    ctx.fillStyle = dashGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(0, dashTopY + 18);
    ctx.quadraticCurveTo(width * 0.28, dashTopY - 24, width * 0.5, dashTopY - 4);
    ctx.quadraticCurveTo(width * 0.74, dashTopY + 8, width, dashTopY + 16);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Upper Dashboard Defroster Vent Slot along Windshield Base
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.roundRect(width * 0.46, dashTopY - 3, width * 0.34, 5, 2.5);
    ctx.fill();

    // Red/Gold Sport Stitching along Dashboard Crest
    ctx.strokeStyle = car.accentColor;
    ctx.lineWidth = 1.7;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(width * 0.04, dashTopY + 22);
    ctx.quadraticCurveTo(width * 0.28, dashTopY - 17, width * 0.5, dashTopY + 3);
    ctx.quadraticCurveTo(width * 0.74, dashTopY + 14, width * 0.96, dashTopY + 22);
    ctx.stroke();
    ctx.setLineDash([]);

    // C1) DETAILED 3D AIR CONDITIONING VENTS (فتحات التكييف) — Left Driver Vent, Dual Center Vents & Right Passenger Vent
    const drawDetailedAirVent = (vx: number, vy: number, vw: number, vh: number) => {
      ctx.save();
      // Outer Chrome & Carbon Bezel
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(vx - vw * 0.5, vy - vh * 0.5, vw, vh, 7);
      ctx.fill();
      ctx.stroke();

      // Inner recessed dark housing
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(vx - vw * 0.44, vy - vh * 0.4, vw * 0.88, vh * 0.8, 4);
      ctx.stroke();

      // Vertical rear louver fins
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.2;
      for (let v = -2; v <= 2; v++) {
        const lx = vx + v * (vw * 0.14);
        ctx.beginPath();
        ctx.moveTo(lx, vy - vh * 0.36);
        ctx.lineTo(lx, vy + vh * 0.36);
        ctx.stroke();
      }

      // Horizontal directional louver slats
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      for (let s = -1; s <= 1; s++) {
        const sy = vy + s * (vh * 0.23);
        ctx.beginPath();
        ctx.moveTo(vx - vw * 0.42, sy);
        ctx.lineTo(vx + vw * 0.42, sy);
        ctx.stroke();
      }

      // Center Chrome Airflow Direction Slider Tab with Cyan A/C Accent
      ctx.fillStyle = '#CBD5E1';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(vx - 6, vy - 3.5, 12, 7, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(vx - 2, vy - 1.5, 4, 3);
      ctx.restore();
    };

    // Render 4 Air Vents across the Dashboard
    drawDetailedAirVent(width * 0.105, dashTopY + 36, width * 0.068, height * 0.048);
    drawDetailedAirVent(width * 0.575, dashTopY + 23, width * 0.064, height * 0.042);
    drawDetailedAirVent(width * 0.705, dashTopY + 25, width * 0.064, height * 0.042);
    drawDetailedAirVent(width * 0.905, dashTopY + 42, width * 0.072, height * 0.050);

    // C2) PROMINENT RED HAZARD WARNING LIGHTS BUTTON (زر الفلشر الرباعي المثلث الأحمر) between Center Air Vents
    {
      const hazX = width * 0.64;
      const hazY = dashTopY + 24;
      const hazPulse = 0.75 + 0.25 * Math.sin(t * 7.5);
      ctx.save();
      ctx.fillStyle = '#7F1D1D';
      ctx.strokeStyle = '#F87171';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(hazX - 15, hazY - 12, 30, 24, 6);
      ctx.fill();
      ctx.stroke();

      // Glowing red double-triangle Hazard icon
      ctx.strokeStyle = `rgba(254, 226, 226, ${hazPulse})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(hazX, hazY - 7);
      ctx.lineTo(hazX + 8, hazY + 6);
      ctx.lineTo(hazX - 8, hazY + 6);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hazX, hazY - 3);
      ctx.lineTo(hazX + 4.2, hazY + 4);
      ctx.lineTo(hazX - 4.2, hazY + 4);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // C3) CENTER CAR RADIO / INFOTAINMENT TOUCHSCREEN & AUDIO CONSOLE (شاشة ومسجل السيارة الوسطي)
    {
      const screenX = width * 0.535;
      const screenY = dashTopY + height * 0.055;
      const screenW = width * 0.215;
      const screenH = height * 0.145;

      ctx.save();
      // Outer Brushed-Aluminum & Carbon Radio Bezel
      ctx.fillStyle = '#090D16';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(screenX - 8, screenY - 6, screenW + 16, screenH + 22, 10);
      ctx.fill();
      ctx.stroke();

      // Inner Glowing Touchscreen Display
      const dispGrad = ctx.createLinearGradient(screenX, screenY, screenX, screenY + screenH);
      dispGrad.addColorStop(0, '#020617');
      dispGrad.addColorStop(0.5, '#081426');
      dispGrad.addColorStop(1, '#020617');
      ctx.fillStyle = dispGrad;
      ctx.strokeStyle = '#0EA5E9';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(screenX, screenY, screenW, screenH - 4, 6);
      ctx.fill();
      ctx.stroke();

      // Left Zone of Screen: 3D GPS Navigation Route Preview
      const mapZoneW = screenW * 0.44;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(screenX + 4, screenY + 4, mapZoneW, screenH - 12, 4);
      ctx.clip();
      ctx.fillStyle = '#06281E';
      ctx.fillRect(screenX + 4, screenY + 4, mapZoneW, screenH - 12);
      // Winding GPS road line
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(screenX + mapZoneW * 0.35, screenY + screenH - 8);
      ctx.quadraticCurveTo(
        screenX + mapZoneW * 0.75,
        screenY + screenH * 0.5,
        screenX + mapZoneW * 0.52,
        screenY + 8
      );
      ctx.stroke();
      // Player Car GPS Triangle Cursor
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(screenX + mapZoneW * 0.46, screenY + screenH * 0.58);
      ctx.lineTo(screenX + mapZoneW * 0.54, screenY + screenH * 0.76);
      ctx.lineTo(screenX + mapZoneW * 0.38, screenY + screenH * 0.76);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('GPS 3D', screenX + 8, screenY + 15);
      ctx.restore();

      // Right Zone of Screen: FM Car Radio Tuner, Animated Equalizer & Engine Telemetry
      const radX = screenX + mapZoneW + 10;
      const radW = screenW - mapZoneW - 14;
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('FM 104.8 · APEX', radX, screenY + 16);

      ctx.fillStyle = revIntensity > 0.45 ? '#F59E0B' : '#22C55E';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText(
        revIntensity > 0.45 ? 'LAUNCH: BOOST READY' : 'AUDIO & ECU: ONLINE',
        radX,
        screenY + 30
      );

      // Animated Audio Equalizer Bars on Car Radio Display
      const eqBars = 10;
      const barW = Math.max(2.5, (radW - 18) / eqBars);
      for (let b = 0; b < eqBars; b++) {
        const eqRatio =
          0.25 +
          0.72 *
            Math.abs(
              Math.sin(t * (5.5 + b * 0.7) + b * 0.9) *
                (0.55 + revIntensity * 0.45)
            );
        const bh = Math.max(3, (screenH * 0.34) * eqRatio);
        const bx = radX + b * (barW + 1.5);
        const by = screenY + screenH - 22 - bh;
        ctx.fillStyle =
          b > 7 ? '#EF4444' : b > 4 ? '#F59E0B' : '#22C55E';
        ctx.fillRect(bx, by, barW, bh);
      }

      // Digital Climate Control Strip at bottom of Radio Screen
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
      ctx.fillText('A/C 21.5°C · DUAL', radX, screenY + screenH - 10);

      // Physical Radio Rotary Knobs (Left VOL/PWR Knob & Right TUNE Knob) + Media Buttons Bar
      const ctrlBarY = screenY + screenH + 5;
      // Left Rotary Volume Knob
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(screenX + 10, ctrlBarY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Right Rotary Tune Knob
      ctx.beginPath();
      ctx.arc(screenX + screenW - 10, ctrlBarY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Physical Illuminated Media Shortcut Buttons (`RADIO`, `MEDIA`, `NAV`, `SETUP`)
      const btnLabels = ['RADIO', 'MEDIA', 'NAV', 'CLIM'];
      const btnSpanW = screenW - 52;
      const singleBtnW = btnSpanW / btnLabels.length - 4;
      btnLabels.forEach((lbl, idx) => {
        const bx = screenX + 26 + idx * (singleBtnW + 4);
        ctx.fillStyle = idx === 0 ? '#0284C7' : '#1E293B';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx, ctrlBarY - 5.5, singleBtnW, 11, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 7px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(lbl, bx + singleBtnW * 0.5, ctrlBarY + 2.5);
      });

      // Screen Glass Diagonal Reflection Sheen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX + screenW * 0.45, screenY);
      ctx.lineTo(screenX + screenW * 0.18, screenY + screenH - 4);
      ctx.lineTo(screenX, screenY + screenH - 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // C4) 3D GEAR SHIFTER STICK & CENTER CONSOLE TRANSMISSION TUNNEL (عصا القير والكونسول الوسطي)
    {
      const gearBaseX = width * 0.565;
      const gearBaseY = height * 0.955;
      const shiftTilt = launchRoll > 0.05 ? 0.12 : rev2 > 0.2 ? 0.06 : -0.04;

      ctx.save();
      // Sculpted Center Console Transmission Tunnel Base & Illuminated PRNDS Gate
      ctx.fillStyle = '#090D16';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(width * 0.485, height);
      ctx.lineTo(width * 0.515, dashTopY + height * 0.205);
      ctx.lineTo(width * 0.765, dashTopY + height * 0.205);
      ctx.lineTo(width * 0.805, height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Clean Center Console Trim Plate (without dark circular hole cutouts)
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(gearBaseX - 38, gearBaseY - 14, 76, 22, 6);
      ctx.fill();
      ctx.stroke();

      // Illuminated Gear Indicator Strip (`P  R  N  D  S+`) next to Shifter Boot
      const gears = ['P', 'R', 'N', 'D', 'S+'];
      gears.forEach((g, gIdx) => {
        const gx = gearBaseX + 56 + gIdx * 15;
        const gy = gearBaseY - 4;
        const isActiveGear =
          (launchRoll > 0.05 || rev2 > 0.15) ? g === 'S+' : g === 'D';
        ctx.fillStyle = isActiveGear ? '#EF4444' : '#64748B';
        ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(g, gx, gy);
        if (isActiveGear) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
          ctx.beginPath();
          ctx.arc(gx, gy - 3, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Red Engine START/STOP Push Button on Center Console
      const startBtnX = gearBaseX - 66;
      const startBtnY = gearBaseY - 6;
      ctx.fillStyle = '#DC2626';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(startBtnX, startBtnY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 6.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('START', startBtnX, startBtnY - 1);
      ctx.fillText('ENGINE', startBtnX, startBtnY + 6);

      // Pleated Leather Shift Boot Pyramid
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = car.accentColor;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(gearBaseX - 30, gearBaseY + 4);
      ctx.lineTo(gearBaseX - 9 + shiftTilt * 24, gearBaseY - 34);
      ctx.lineTo(gearBaseX + 9 + shiftTilt * 24, gearBaseY - 34);
      ctx.lineTo(gearBaseX + 30, gearBaseY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Chromed Metallic Shifter Shaft & 3D Ergonomic Carbon/Leather Gear Shifter Knob
      const knobX = gearBaseX + shiftTilt * 38;
      const knobY = gearBaseY - 64;
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(gearBaseX + shiftTilt * 18, gearBaseY - 30);
      ctx.lineTo(knobX, knobY + 10);
      ctx.stroke();

      // 3D Sculpted Gear Shifter Knob Head
      const knobGrad = ctx.createLinearGradient(knobX - 18, knobY - 18, knobX + 18, knobY + 16);
      knobGrad.addColorStop(0, '#334155');
      knobGrad.addColorStop(0.45, '#0F172A');
      knobGrad.addColorStop(1, '#020617');
      ctx.fillStyle = knobGrad;
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(knobX - 17, knobY - 16, 34, 30, 11);
      ctx.fill();
      ctx.stroke();

      // Red Sport Shift Trigger & Top Metallic Shift Pattern Cap
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(knobX - 14, knobY - 4, 4, 12);
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = car.accentColor;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(knobX, knobY - 9, 11, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('S+', knobX, knobY - 6.5);
      ctx.restore();
    }

    // D) Driver's Side 3D Steering Wheel, Turn Signal / Wiper Stalks, Digital RPM Tachometer Cluster & Realistic Driver Hands!
    const wheelCx = width * 0.315;
    const wheelCy = height * 0.835;
    const wheelR = Math.min(width, height) * 0.225;
    const steerAngle =
      Math.sin(t * 2.6) * 0.075 +
      (rev1 > 0.1 ? -0.06 * rev1 : 0) +
      (rev2 > 0.1 ? 0.08 * rev2 : 0);

    // D1) Glowing Digital RPM & Speedometer Instrument Binnacle behind Steering Wheel
    ctx.save();
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(wheelCx, wheelCy - wheelR * 0.22, wheelR * 0.66, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Live RPM Bar & Digital Readout reacting to Engine Revs + Blinking Turn Signal Arrows
    const rpmNorm = 0.18 + revIntensity * 0.78;
    ctx.strokeStyle = rpmNorm > 0.7 ? '#EF4444' : '#22C55E';
    ctx.lineWidth = 6.5;
    ctx.beginPath();
    ctx.arc(
      wheelCx,
      wheelCy - wheelR * 0.22,
      wheelR * 0.55,
      Math.PI,
      Math.PI + rpmNorm * Math.PI
    );
    ctx.stroke();

    // Blinking green left/right turn signal indicator arrows in instrument cluster
    const blinkOn = Math.floor(t * 3.2) % 2 === 0;
    ctx.fillStyle = blinkOn ? '#22C55E' : '#14532D';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('◀', wheelCx - wheelR * 0.34, wheelCy - wheelR * 0.48);
    ctx.fillText('▶', wheelCx + wheelR * 0.34, wheelCy - wheelR * 0.48);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 13px "JetBrains Mono", monospace';
    ctx.fillText(
      `${Math.round(1200 + rpmNorm * 6400)} RPM`,
      wheelCx,
      wheelCy - wheelR * 0.36
    );
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillText(
      `${Math.round(state.vx * 0.36)} KM/H · GEAR S1`,
      wheelCx,
      wheelCy - wheelR * 0.23
    );
    ctx.restore();

    // D2) STEERING COLUMN TURN SIGNAL / HEADLIGHT STALK (LEFT) & WIPER STALK (RIGHT) (أذرع الإشارات والأنوار والمساحات خلف المقود)
    {
      ctx.save();
      ctx.translate(wheelCx, wheelCy - wheelR * 0.04);

      // Left Turn Signal & Headlight Rotary Stalk
      ctx.save();
      ctx.rotate(-0.22);
      const leftStalkGrad = ctx.createLinearGradient(-wheelR * 1.18, -10, -wheelR * 0.45, 10);
      leftStalkGrad.addColorStop(0, '#334155');
      leftStalkGrad.addColorStop(0.5, '#1E293B');
      leftStalkGrad.addColorStop(1, '#090D16');
      ctx.fillStyle = leftStalkGrad;
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-wheelR * 0.45, -6);
      ctx.lineTo(-wheelR * 1.14, -11);
      ctx.quadraticCurveTo(-wheelR * 1.23, -11, -wheelR * 1.23, 0);
      ctx.quadraticCurveTo(-wheelR * 1.23, 9, -wheelR * 1.14, 9);
      ctx.lineTo(-wheelR * 0.45, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // White headlight & turn signal markings on left stalk
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-wheelR * 1.02, -9);
      ctx.lineTo(-wheelR * 1.02, 7);
      ctx.moveTo(-wheelR * 0.94, -8);
      ctx.lineTo(-wheelR * 0.94, 6);
      ctx.stroke();
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⇦⇨ ☼', -wheelR * 0.78, 3);
      ctx.restore();

      // Right Windshield Wiper & Washer Control Stalk
      ctx.save();
      ctx.rotate(0.20);
      const rightStalkGrad = ctx.createLinearGradient(wheelR * 0.45, -10, wheelR * 1.18, 10);
      rightStalkGrad.addColorStop(0, '#090D16');
      rightStalkGrad.addColorStop(0.5, '#1E293B');
      rightStalkGrad.addColorStop(1, '#334155');
      ctx.fillStyle = rightStalkGrad;
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(wheelR * 0.45, -6);
      ctx.lineTo(wheelR * 1.14, -11);
      ctx.quadraticCurveTo(wheelR * 1.23, -11, wheelR * 1.23, 0);
      ctx.quadraticCurveTo(wheelR * 1.23, 9, wheelR * 1.14, 9);
      ctx.lineTo(wheelR * 0.45, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(wheelR * 1.02, -9);
      ctx.lineTo(wheelR * 1.02, 7);
      ctx.stroke();
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 7.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('WIPER', wheelR * 0.78, 3);
      ctx.restore();

      ctx.restore();
    }

    // D3) 3D-STYLED SPORT STEERING WHEEL & REALISTIC ARTICULATED DRIVER HANDS GRIPPING THE WHEEL!
    ctx.save();
    ctx.translate(wheelCx, wheelCy);
    ctx.rotate(steerAngle);

    // 1. Metallic Paddle Shifters (`-` Left Downshift / `+` Right Upshift) behind the Steering Wheel Spokes
    for (const pSide of [-1, 1] as const) {
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(pSide * wheelR * 0.56, -wheelR * 0.42);
      ctx.lineTo(pSide * wheelR * 0.72, -wheelR * 0.48);
      ctx.lineTo(pSide * wheelR * 0.74, wheelR * 0.16);
      ctx.lineTo(pSide * wheelR * 0.56, wheelR * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pSide === -1 ? '-' : '+', pSide * wheelR * 0.65, -wheelR * 0.16);
    }

    // 2. Sculpted 3D Steering Wheel Outer Torus Rim with Thumb Rest Bolsters & Carbon/Leather Segments
    // Deep 3D drop shadow & outer rim base
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 24;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.stroke();

    // Main 3D contoured leather & carbon-fiber rim body
    const rimBodyGrad = ctx.createLinearGradient(-wheelR, -wheelR, wheelR, wheelR);
    rimBodyGrad.addColorStop(0, '#334155');
    rimBodyGrad.addColorStop(0.45, '#1E293B');
    rimBodyGrad.addColorStop(1, '#090D16');
    ctx.strokeStyle = rimBodyGrad;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.stroke();

    // Ergonomic 10-and-2 Inner Thumb Rest Bolsters
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR - 2, -Math.PI * 0.84, -Math.PI * 0.68);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, wheelR - 2, -Math.PI * 0.32, -Math.PI * 0.16);
    ctx.stroke();

    // Specular 3D top-inner highlight ring along steering wheel torus
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.32)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR - 5.5, -Math.PI * 0.88, -Math.PI * 0.12);
    ctx.stroke();

    // Red Top-Center 12-O'Clock Racing Alignment Ring with Specular Gloss
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 18.5;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, -Math.PI * 0.5 - 0.11, -Math.PI * 0.5 + 0.11);
    ctx.stroke();
    ctx.strokeStyle = '#FCA5A5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, wheelR - 4, -Math.PI * 0.5 - 0.09, -Math.PI * 0.5 + 0.09);
    ctx.stroke();

    // 3. Detailed 3-Spoke 3D Brushed-Titanium & Carbon Frame with Multi-Function Thumb Control Buttons
    const spokeGrad = ctx.createLinearGradient(-wheelR * 0.85, -18, wheelR * 0.85, wheelR * 0.85);
    spokeGrad.addColorStop(0, '#64748B');
    spokeGrad.addColorStop(0.45, '#334155');
    spokeGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = spokeGrad;
    ctx.strokeStyle = '#090D16';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-wheelR * 0.9, -10);
    ctx.quadraticCurveTo(-wheelR * 0.45, -15, -wheelR * 0.25, -8);
    ctx.lineTo(wheelR * 0.25, -8);
    ctx.quadraticCurveTo(wheelR * 0.45, -15, wheelR * 0.9, -10);
    ctx.lineTo(wheelR * 0.9, 14);
    ctx.quadraticCurveTo(wheelR * 0.42, 18, 18, 24);
    ctx.lineTo(15, wheelR * 0.9);
    ctx.lineTo(-15, wheelR * 0.9);
    ctx.lineTo(-18, 24);
    ctx.quadraticCurveTo(-wheelR * 0.42, 18, -wheelR * 0.9, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Solid metallic lower spoke trim accent (no dark cutout hole)
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(-3.5, 32, 7, wheelR * 0.44, 3);
    ctx.fill();

    // Left & Right Spoke Multi-Function Thumb Button Clusters (D-Pad, Red BOOST Button, Rotary Mode Dial)
    ctx.fillStyle = '#090D16';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-wheelR * 0.68, -6, 28, 16, 4);
    ctx.roundRect(wheelR * 0.68 - 28, -6, 28, 16, 4);
    ctx.fill();
    ctx.stroke();
    // Glowing Red NITRO/LAUNCH thumb button on right spoke & Cyan MODE button on left spoke
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.arc(-wheelR * 0.56, 2, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(wheelR * 0.56, 2, 4.8, 0, Math.PI * 2);
    ctx.fill();

    // 4. Sculpted 3D Central Airbag Hub Boss & Metallic APEX Emblem
    const hubGrad = ctx.createRadialGradient(-6, -4, 4, 0, 4, wheelR * 0.31);
    hubGrad.addColorStop(0, '#334155');
    hubGrad.addColorStop(0.7, '#0F172A');
    hubGrad.addColorStop(1, '#020617');
    ctx.fillStyle = hubGrad;
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 4, wheelR * 0.29, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner Chrome Ring & Center Shield Emblem
    ctx.strokeStyle = car.accentColor;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(0, 4, wheelR * 0.21, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 9.5px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('APEX', 0, 7.5);

    // 5. HIGHLY REALISTIC ARTICULATED DRIVER HANDS & FOREARMS GRIPPING THE 3D STEERING WHEEL!
    const drawRealisticDriverHandAndArm = (side: -1 | 1) => {
      const gripX = side * (wheelR * 0.96);
      const gripY = -wheelR * 0.05;

      ctx.save();
      // A. Sculpted Racing Suit Forearm extending naturally from bottom of cabin
      const armGrad = ctx.createLinearGradient(
        gripX - side * 14,
        gripY + 18,
        side * wheelR * 1.38,
        wheelR * 1.48
      );
      armGrad.addColorStop(0, '#DC2626');
      armGrad.addColorStop(0.45, '#B91C1C');
      armGrad.addColorStop(0.82, '#7F1D1D');
      armGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = armGrad;
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(gripX - side * 20, gripY + 24);
      ctx.quadraticCurveTo(
        gripX + side * 6,
        gripY + 14,
        gripX + side * 22,
        gripY + 18
      );
      ctx.lineTo(side * wheelR * 1.56, wheelR * 1.44);
      ctx.lineTo(side * wheelR * 0.94, wheelR * 1.58);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White Nomex Racing Sleeve Stripe & Forearm Quilted Seam Highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(gripX + side * 6, gripY + 24);
      ctx.lineTo(side * wheelR * 1.34, wheelR * 1.44);
      ctx.stroke();

      // Left Wrist Chronograph Racing Watch / Right Wrist Telemetry Strap
      if (side === -1) {
        ctx.save();
        ctx.translate(gripX - 2, gripY + 22);
        ctx.rotate(-0.22);
        // Watch leather/steel band
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(-22, -6, 44, 12, 4);
        ctx.fill();
        ctx.stroke();
        // Chronograph metallic bezel & dial
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(4, -4);
        ctx.moveTo(0, 0);
        ctx.lineTo(-3, 3);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(gripX - 20, gripY + 16, 40, 10, 4);
        ctx.fill();
        ctx.stroke();
      }

      // B. Anatomically Sculpted Dorsal Hand, Palm Heel & Carbon Knuckle Guard
      const handGrad = ctx.createRadialGradient(
        gripX - side * 4,
        gripY - 2,
        4,
        gripX,
        gripY + 2,
        28
      );
      handGrad.addColorStop(0, '#334155');
      handGrad.addColorStop(0.55, '#1E293B');
      handGrad.addColorStop(1, '#090D16');
      ctx.fillStyle = handGrad;
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(gripX - side * 20, gripY + 18);
      ctx.quadraticCurveTo(gripX - side * 24, gripY - 8, gripX - side * 14, gripY - 22);
      ctx.lineTo(gripX + side * 18, gripY - 20);
      ctx.quadraticCurveTo(gripX + side * 25, gripY - 2, gripX + side * 18, gripY + 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Molded Red Kevlar/Carbon 3D Knuckle Protector Plate across back of hand
      const knuckleGrad = ctx.createLinearGradient(gripX - 18, gripY - 14, gripX + 18, gripY + 4);
      knuckleGrad.addColorStop(0, '#EF4444');
      knuckleGrad.addColorStop(0.5, '#DC2626');
      knuckleGrad.addColorStop(1, '#991B1B');
      ctx.fillStyle = knuckleGrad;
      ctx.strokeStyle = '#FCA5A5';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.roundRect(gripX - 17, gripY - 12, 34, 13, 6);
      ctx.fill();
      ctx.stroke();

      // C. Articulated Thumb Wrapping Inward Around the Steering Wheel Spoke & Thumb Bolster!
      ctx.save();
      const thumbBaseX = gripX - side * 13;
      const thumbBaseY = gripY + 2;
      const thumbTipX = gripX - side * 32;
      const thumbTipY = gripY - 12;
      const thumbGrad = ctx.createLinearGradient(thumbBaseX, thumbBaseY, thumbTipX, thumbTipY);
      thumbGrad.addColorStop(0, '#1E293B');
      thumbGrad.addColorStop(0.6, '#334155');
      thumbGrad.addColorStop(1, '#475569');
      ctx.fillStyle = thumbGrad;
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(thumbBaseX, thumbBaseY + 8);
      ctx.quadraticCurveTo(
        thumbBaseX - side * 14,
        thumbBaseY + 2,
        thumbTipX,
        thumbTipY + 4
      );
      ctx.quadraticCurveTo(
        thumbTipX - side * 4,
        thumbTipY - 6,
        thumbTipX + side * 6,
        thumbTipY - 7
      );
      ctx.quadraticCurveTo(
        thumbBaseX - side * 4,
        thumbBaseY - 7,
        thumbBaseX + side * 4,
        thumbBaseY - 2
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Thumb pad highlight & joint crease
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(thumbTipX + side * 3, thumbTipY - 1, 3.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // D. 4 Individual Articulated Fingers (Index, Middle, Ring, Pinky) Wrapping Tightly Over the Outer Rim!
      const fingerSpecs = [
        { offset: -13.5, len: 16, w: 7.8 }, // Index finger
        { offset: -4.5, len: 18, w: 8.0 },  // Middle finger
        { offset: 4.5, len: 16.5, w: 7.6 }, // Ring finger
        { offset: 13.0, len: 13.5, w: 7.0 }, // Little finger
      ];
      fingerSpecs.forEach((fg) => {
        const fx = gripX + side * fg.offset;
        const fy = gripY - 15;
        const fGrad = ctx.createLinearGradient(fx, fy - fg.len, fx, fy + 4);
        fGrad.addColorStop(0, '#475569');
        fGrad.addColorStop(0.45, '#1E293B');
        fGrad.addColorStop(1, '#0F172A');
        ctx.fillStyle = fGrad;
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(fx - fg.w * 0.5, fy - fg.len, fg.w, fg.len + 5, 3.8);
        ctx.fill();
        ctx.stroke();

        // Finger knuckle pad & top specular crease highlight
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.roundRect(fx - fg.w * 0.34, fy - fg.len + 3, fg.w * 0.68, 4.5, 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.4)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(fx - fg.w * 0.28, fy - fg.len + 1.5);
        ctx.lineTo(fx + fg.w * 0.28, fy - fg.len + 1.5);
        ctx.stroke();
      });

      ctx.restore();
    };

    drawRealisticDriverHandAndArm(-1);
    drawRealisticDriverHandAndArm(1);
    ctx.restore();
    ctx.restore();
    ctx.restore();
  } else {
    // =========================================================================
    // PHASES 2, 3 & 4 (5 - 20s): IN-ENGINE DEFAULT GAME MAP SEQUENCE
    // Rendered 100% inside the native Default Game Map Engine (renderGameCanvas)
    // with Wet Asphalt Road & Mirror Puddles, Metallic Guardrail, Diverse Botanical
    // Trees & Flowers, Static Mountains, and Slow Cloud Drift!
    // =========================================================================
    state.rainIntensity = 0.04; // Enhances wet road mirror sheen & puddles while keeping clear sunny sky

    if (t < 10.0) {
      // =========================================================================
      // PHASE 2 (5 - 10s): MID-SCENE — Crossing Roadside Rocks, Movable Wooden Bridge & Water Pit
      // - Synchronized 1:1 with active gameplay bridge height & per-wheel collision logic
      //   so wheels sit and roll strictly ON TOP of the wooden bridge planks (zero clipping!)
      // - Dynamic suspension compression & fluid car body pitch/tilt over rocks and bridge planks!
      // =========================================================================
      const phaseT = t - 5.0; // 0 -> 5.0s
      const accelEase = smoothstep(0, 1.2, phaseT);
      state.vx = 110 + accelEase * 145;
      state.x = 205 + phaseT * 235;

      // 1. Update movable bridge sag FIRST and use the exact live render clock (`liveTimeSec`)
      //    so bridge plank height in `getEffectiveSurfaceInfo` matches `drawMovableWoodenBridge` 1:1!
      const liveTimeSec = performance.now() * 0.001;
      const bridgeObs = state.obstacles.find(
        (o) => o.type === 'suspension_bridge'
      );
      if (bridgeObs) {
        const distToBridge = Math.abs(state.x - bridgeObs.x);
        bridgeObs.bridgeSag =
          distToBridge < 135
            ? 14 * Math.cos((distToBridge / 135) * (Math.PI * 0.5)) +
              Math.sin(liveTimeSec * 9.5) * 1.8
            : 4;
      }

      const halfWB = car.wheelBase * 0.5;
      const cosEst = Math.cos(state.angle || 0);
      const frontWheelX = state.x + cosEst * halfWB;
      const rearWheelX = state.x - cosEst * halfWB;
      const rearSurf = getEffectiveSurfaceInfo(
        rearWheelX,
        map,
        state,
        liveTimeSec
      );
      const frontSurf = getEffectiveSurfaceInfo(
        frontWheelX,
        map,
        state,
        liveTimeSec
      );
      const surf = getEffectiveSurfaceInfo(state.x, map, state, liveTimeSec);
      state.onBridge =
        rearSurf.onBridge || frontSurf.onBridge || surf.onBridge;

      // 2. Independent front & rear wheel displacement over roadside rocks & moving bridge planks
      const frontRockBump = getWheelRockBumpAtWorldX(
        frontWheelX,
        state.obstacles
      );
      const rearRockBump = getWheelRockBumpAtWorldX(
        rearWheelX,
        state.obstacles
      );
      const bridgePlankWaveRear = rearSurf.onBridge
        ? 1.4 +
          Math.sin(rearWheelX * 0.24 - liveTimeSec * 6.5) * 1.35 +
          Math.cos(liveTimeSec * 5.2) * 0.55
        : 0;
      const bridgePlankWaveFront = frontSurf.onBridge
        ? 1.4 +
          Math.sin(frontWheelX * 0.24 - liveTimeSec * 6.5) * 1.35 -
          Math.cos(liveTimeSec * 5.2) * 0.55
        : 0;

      state.frontCompression = 1.6;
      state.rearCompression = 1.8;

      // 3. Smooth car body pitch/tilt & soft weight transfer over road and bridge planks
      const wheelSurfaceSlope = Math.atan2(
        frontSurf.y - rearSurf.y,
        car.wheelBase
      );
      const accelSquatPitch = -0.024 * (1 - smoothstep(1.5, 4.2, phaseT));

      state.weightTransferPitch = accelSquatPitch;
      state.angle = Math.max(
        -0.28,
        Math.min(0.28, wheelSurfaceSlope + accelSquatPitch * 0.5)
      );

      // 4. Exact per-wheel height alignment matching active gameplay (`rideHeight = car.wheelRadius + 22`)
      //    so front and rear wheels sit strictly ON TOP of the wooden bridge planks without clipping!
      const rideHeight = car.wheelRadius + 22;
      const sinA = Math.sin(state.angle);
      const cosA = Math.cos(state.angle);
      const liftKitOffset =
        car.style === 'offroad' ? 7 : car.style === 'buggy' ? 6 : 4;
      const rearEffectiveGroundY = rearSurf.y - rearRockBump * 0.42;
      const frontEffectiveGroundY = frontSurf.y - frontRockBump * 0.42;
      const avgWheelChassisY =
        (rearEffectiveGroundY + frontEffectiveGroundY) * 0.5 - rideHeight;

      // Strict per-wheel top-of-plank boundary check so neither wheel can ever dip beneath the bridge planks
      const rearPlankLimitY = rearSurf.onBridge
        ? rearSurf.y +
          4.2 -
          (-sinA * halfWB +
            (16 + liftKitOffset - state.rearCompression) * cosA +
            car.wheelRadius +
            2.6)
        : avgWheelChassisY + 6;
      const frontPlankLimitY = frontSurf.onBridge
        ? frontSurf.y +
          4.2 -
          (sinA * halfWB +
            (16 + liftKitOffset - state.frontCompression) * cosA +
            car.wheelRadius +
            2.6)
        : avgWheelChassisY + 6;

      state.y = Math.min(avgWheelChassisY, rearPlankLimitY, frontPlankLimitY);
      state.vy = 0;
      state.angVel = 0;
      state.upsideDownTimer = 0;
      state.wheelRotation = 3.2 + phaseT * 14.5;
      state.flightPhase = 'none';
      state.wingDeployProgress = 0;
      state.wheelRetractProgress = 0;
      state.driverLean =
        -0.05 +
        (frontRockBump - rearRockBump) * 0.018 +
        (state.onBridge ? Math.sin(liveTimeSec * 7.5) * 0.04 : 0);
      state.driverBobY =
        (frontRockBump + rearRockBump) * 0.18 +
        (state.rearCompression + state.frontCompression - 3.6) * 0.16;
      state.backfireFlash = phaseT < 0.45 ? 0.55 : 0;
      isGasActive = true;

      const inPit = state.x > 975 && state.x < 1205;
      state.inWaterPit = inPit;
      if (inPit && state.particles.length < 65) {
        for (let i = 0; i < 2; i++) {
          state.particles.push({
            x: state.x + (Math.random() - 0.5) * 58,
            y: state.y + car.wheelRadius * 0.55,
            vx: -110 + (Math.random() - 0.5) * 75,
            vy: -55 - Math.random() * 70,
            size: 3.5 + Math.random() * 3.2,
            color: 'rgba(125, 211, 252, 0.9)',
            alpha: 0.92,
            decay: 1.9,
          });
        }
      }

      camZoom = 1.04;
      focusWorldX = state.x + 95;
      focusWorldY = surf.y - (car.wheelRadius + 49);
      screenAnchorX = width * 0.34;
      screenAnchorY = height * 0.62;
    } else {
      // =========================================================================
      // PHASE 3 (10 - 15s): ضغط النيترو وتفعيل ميزة الأجنحة والتحول لطائرة والتصاعد نحو السماء
      // & PHASE 4 (15 - 20s): اختفاء تدريجي بالدخان الناعم والتحول السلس للواجهة الرئيسية للعبة
      // =========================================================================
      const phaseT = t - 10.0; // 0 -> 10.0s (covers 10s..20s)
      isGasActive = true;
      isBoostActive = true;
      state.inWaterPit = false;

      state.vx = 265 + smoothstep(0, 1.5, phaseT) * 45;
      state.x = 1380 + phaseT * 295;

      const wingDeploy = smoothstep(0.9, 2.5, phaseT);
      const wheelRetract = smoothstep(1.1, 2.7, phaseT);
      state.wingDeployProgress = wingDeploy;
      state.wheelRetractProgress = wheelRetract;
      state.flightPhase =
        phaseT < 0.9
          ? 'none'
          : phaseT < 2.5
          ? 'transform_takeoff'
          : 'flying';

      const climbProgress = smoothstep(1.3, 5.2, phaseT);
      const cruiseGlide = phaseT > 5.0 ? (phaseT - 5.0) * 16 : 0;
      const climbHeight = climbProgress * 320 + cruiseGlide;

      const groundY = getTerrainHeight(state.x, map);
      const groundSlope = getTerrainSlope(state.x, map);
      state.y = groundY - (car.wheelRadius + 22) - climbHeight;
      state.vy = phaseT >= 1.3 && phaseT <= 5.2 ? -75 : -15;
      state.wheelRotation = 76 + phaseT * 18;

      const groundPitch = groundSlope * (1 - smoothstep(1.0, 2.2, phaseT));
      const climbPitch =
        -0.17 *
        smoothstep(1.1, 2.2, phaseT) *
        (1 - smoothstep(4.4, 6.2, phaseT) * 0.55);
      const gentleSkyWave =
        phaseT > 2.5 ? Math.sin((phaseT - 2.5) * 2.1) * 0.035 : 0;
      state.angle = groundPitch + climbPitch + gentleSkyWave;
      state.weightTransferPitch = phaseT < 1.3 ? -0.045 : 0;
      state.driverLean = -0.1;
      state.driverBobY = 0;
      state.backfireFlash = 1.0;

      const nitroPush =
        phaseT < 1.6 ? Math.sin((phaseT / 1.6) * Math.PI) * 0.22 : 0;
      camZoom = 1.04 + nitroPush - smoothstep(1.6, 4.5, phaseT) * 0.06;
      focusWorldX = state.x + 90;
      focusWorldY = state.y - 18 + climbProgress * 22;
      screenAnchorX = width * 0.36;
      screenAnchorY = height * (0.62 - climbProgress * 0.1);
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * (1 / 60);
      p.y += p.vy * (1 / 60);
      p.alpha -= p.decay * (1 / 60);
      if (p.alpha <= 0) state.particles.splice(i, 1);
    }

    renderGameCanvas(
      ctx,
      width,
      height,
      state,
      car,
      map,
      quality,
      {
        gas: isGasActive,
        brake: false,
        boost: isBoostActive,
      },
      false,
      false,
      {
        zoom: camZoom,
        focusWorldX,
        focusWorldY,
        screenAnchorX,
        screenAnchorY,
        suppressFlightLetterbox: true,
      }
    );
  }

  // =========================================================================
  // PHASE 4 (15 - 20s): اختفاء تدريجي بالدخان الناعم والتحول السلس للواجهة الرئيسية للعبة
  // Soft, multi-layered volumetric smoke gradually enveloping the screen over 5 full seconds
  // =========================================================================
  if (t >= 15.0) {
    const smokeLinear = Math.min(1, (t - 15.0) / 5.0);
    const smoothSmoke = smokeLinear * smokeLinear * (3 - 2 * smokeLinear);

    ctx.save();
    // Soft drifting atmospheric smoke clouds
    const puffCount = 16;
    for (let i = 0; i < puffCount; i++) {
      const px =
        ((i * (width / 5.5) + Math.sin(i * 2.1 + t * 0.75) * 110) %
          (width + 260)) -
        90;
      const py =
        height * (1.02 - smoothSmoke * 0.88) +
        ((i % 3) - 1) * (height * 0.28) +
        Math.cos(i * 1.6 + t * 0.9) * 42;
      const radius = (135 + (i % 4) * 55) * (0.55 + smoothSmoke * 1.55);

      const puffGrad = ctx.createRadialGradient(
        px,
        py,
        radius * 0.08,
        px,
        py,
        radius
      );
      const puffAlpha = Math.min(0.92, smoothSmoke * 1.08);
      puffGrad.addColorStop(0, `rgba(226, 232, 240, ${puffAlpha * 0.88})`);
      puffGrad.addColorStop(0.45, `rgba(148, 163, 184, ${puffAlpha * 0.78})`);
      puffGrad.addColorStop(0.78, `rgba(51, 65, 85, ${puffAlpha * 0.62})`);
      puffGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = puffGrad;
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smooth full-screen soft smoke veil for a 100% seamless transition into Main Menu
    if (smoothSmoke > 0.2) {
      const veilAlpha = Math.min(1, (smoothSmoke - 0.2) / 0.78);
      const veilGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        30,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.78
      );
      veilGrad.addColorStop(0, `rgba(203, 213, 225, ${veilAlpha * 0.92})`);
      veilGrad.addColorStop(0.55, `rgba(71, 85, 105, ${veilAlpha * 0.96})`);
      veilGrad.addColorStop(1, `rgba(15, 23, 42, ${veilAlpha})`);
      ctx.fillStyle = veilGrad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  return { finished: t >= totalDuration };
}

