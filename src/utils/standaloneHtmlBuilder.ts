export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Mido NX: Apex Hill Racing</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
        body, html { width: 100%; height: 100%; overflow: hidden; background: #111; font-family: system-ui, sans-serif; }
        #gameCanvas { width: 100vw; height: 100vh; display: block; }
        .hud-top { position: absolute; top: 15px; left: 15px; right: 15px; display: flex; justify-content: space-between; align-items: center; gap: 10px; pointer-events: none; z-index: 10; }
        .stats-box { background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px); padding: 8px 16px; border-radius: 20px; color: #fff; font-weight: bold; font-size: 14px; border: 1px solid rgba(255,255,255,0.12); pointer-events: auto; }
        .menu-bar { display: flex; gap: 8px; flex-wrap: wrap; pointer-events: auto; padding: 6px 10px; border-radius: 16px; background: linear-gradient(135deg, rgba(120, 53, 15, 0.72), rgba(30, 27, 75, 0.78), rgba(88, 28, 135, 0.72)); backdrop-filter: blur(12px); border: 1px solid rgba(251, 191, 36, 0.42); box-shadow: 0 0 24px rgba(245, 158, 11, 0.25), 0 0 20px rgba(6, 182, 212, 0.2); transition: all 0.25s ease; }
        .menu-btn { background: linear-gradient(135deg, #1e293b, #0f172a); color: #fff; border: 1px solid rgba(255,255,255,0.28); padding: 7px 13px; border-radius: 12px; font-size: 12px; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease; }
        .menu-btn:hover { transform: translateY(-1px); filter: brightness(1.12); }
        .menu-btn-garage { background: linear-gradient(135deg, #d97706, #b45309, #9a3412); border: 1px solid rgba(253, 224, 71, 0.75); box-shadow: 0 0 16px rgba(245, 158, 11, 0.45); }
        .menu-btn-showroom { background: linear-gradient(135deg, #dc2626, #be123c, #9a3412); border: 1px solid rgba(252, 165, 165, 0.75); box-shadow: 0 0 16px rgba(239, 68, 68, 0.48); }
        .menu-btn-maps { background: linear-gradient(135deg, #059669, #047857, #115e59); border: 1px solid rgba(110, 231, 183, 0.75); box-shadow: 0 0 16px rgba(16, 185, 129, 0.45); }
        .menu-btn-shop { background: linear-gradient(135deg, #0891b2, #0284c7, #1e40af); border: 1px solid rgba(103, 232, 249, 0.8); box-shadow: 0 0 18px rgba(6, 182, 212, 0.5); }
        .menu-btn-settings { background: linear-gradient(135deg, #9333ea, #6d28d9, #86198f); border: 1px solid rgba(216, 180, 254, 0.75); box-shadow: 0 0 16px rgba(168, 85, 247, 0.45); }
        .coins-display { color: #ffd700; }
        .controls-container { position: absolute; bottom: 20px; left: 20px; right: 20px; display: flex; justify-content: space-between; pointer-events: none; z-index: 10; }
        .btn-group { display: flex; gap: 12px; pointer-events: auto; }
        .control-btn { width: 80px; height: 80px; border-radius: 18px; border: none; color: white; font-weight: bold; font-size: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 6px 12px rgba(0,0,0,0.4); cursor: pointer; }
        .btn-gas { background: linear-gradient(135deg, #2ecc71, #27ae60); }
        .btn-brake { background: linear-gradient(135deg, #e74c3c, #c0392b); }
        .btn-nitro { background: linear-gradient(135deg, #3498db, #2980b9); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.82); backdrop-filter: blur(10px); z-index: 40; display: none; align-items: center; justify-content: center; padding: 16px; overflow-y: auto; -webkit-overflow-scrolling: touch; touch-action: pan-y; }
        .modal-overlay.active { display: flex; }
        .modal-card { width: min(96%, 760px); max-height: 85vh; background: linear-gradient(145deg, rgba(120, 53, 15, 0.94), rgba(30, 41, 59, 0.96)); border: 2px solid rgba(251, 191, 36, 0.7); box-shadow: 0 0 38px rgba(245, 158, 11, 0.35); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; color: #fff; transition: all 0.25s ease; }
        .modal-header { padding: 14px 18px; background: linear-gradient(90deg, rgba(146, 64, 14, 0.9), rgba(69, 26, 3, 0.95)); border-bottom: 1px solid rgba(251, 191, 36, 0.45); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; font-weight: 800; }
        .modal-body { padding: 16px 18px 28px; overflow-y: auto; -webkit-overflow-scrolling: touch; touch-action: pan-y; flex: 1 1 auto; min-height: 0; max-height: calc(85vh - 58px); }
        .modal-body * { touch-action: pan-y; }
        .item-card { background: #020617; border: 1px solid #1e293b; border-radius: 14px; padding: 14px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .close-btn { background: #ef4444; color: #fff; border: none; padding: 6px 14px; border-radius: 10px; font-weight: bold; cursor: pointer; }
        .btn-repair { background: linear-gradient(135deg, #f59e0b, #d97706); color: #020617; position: relative; }
        .btn-wings { background: linear-gradient(135deg, #06b6d4, #2563eb); color: #fff; position: relative; }
        .badge-count { position: absolute; top: -6px; right: -6px; background: #020617; color: #fbbf24; border: 1px solid #fbbf24; border-radius: 999px; padding: 1px 6px; font-size: 11px; font-weight: 800; }
        .top-center-banner { position: absolute; top: 64px; left: 50%; transform: translateX(-50%); z-index: 25; display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: auto; }
        .hud-alert-toast { display: none; background: rgba(2, 6, 23, 0.92); color: #38bdf8; border: 1px solid #38bdf8; border-radius: 12px; padding: 8px 18px; font-weight: 800; font-size: 13px; box-shadow: 0 0 18px rgba(56, 189, 248, 0.45); }
        .continue-game-btn { display: none; background: linear-gradient(90deg, #10b981, #06b6d4); color: #020617; border: 2px solid #ffffff; border-radius: 14px; padding: 10px 24px; font-weight: 900; font-size: 14px; cursor: pointer; box-shadow: 0 0 24px rgba(16, 185, 129, 0.8); }
    </style>
</head>
<body>
    <div class="hud-top">
        <div class="stats-box"><span id="coinCount" class="coins-display">25000 كوينز</span> 🪙 · الهيكل: <span id="healthDisplay" style="color:#38bdf8;">100%</span></div>
        <div class="menu-bar" id="topMenuBar">
            <button class="menu-btn menu-btn-garage" onclick="openModal('garage')">🔧 الكراج (Garage)</button>
            <button class="menu-btn menu-btn-showroom" onclick="openModal('showroom')">🏎️ معرض السيارات (Showroom)</button>
            <button class="menu-btn menu-btn-maps" onclick="openModal('maps')">🗺️ الخرائط (Maps)</button>
            <button class="menu-btn menu-btn-shop" onclick="openModal('shop')">🛍️ المتجر (Shop)</button>
            <button class="menu-btn menu-btn-settings" onclick="openModal('settings')">⚙️ الإعدادات (Settings)</button>
        </div>
        <div class="stats-box">السرعة: <span id="speedDisplay">0</span> km/h</div>
    </div>
    <div class="top-center-banner">
        <div id="hudAlertToast" class="hud-alert-toast">السيارة سليمة تماماً! · Car is undamaged!</div>
        <button id="continueGameTopBtn" class="continue-game-btn" onclick="resumeGameFromShop()">▶️ متابعة اللعب · Continue Game</button>
    </div>
    <div id="modalOverlay" class="modal-overlay">
        <div class="modal-card">
            <div class="modal-header">
                <span id="modalTitle">القائمة</span>
                <div style="display:flex;gap:8px;align-items:center;">
                    <button id="modalContinueBtn" onclick="resumeGameFromShop()" style="display:none;background:linear-gradient(90deg,#10b981,#06b6d4);color:#020617;border:none;padding:6px 14px;border-radius:10px;font-weight:900;cursor:pointer;">▶️ متابعة اللعب · Continue Game</button>
                    <button class="close-btn" onclick="closeModal()">إغلاق</button>
                </div>
            </div>
            <div id="modalBody" class="modal-body"></div>
        </div>
    </div>
    <div class="controls-container">
        <div class="btn-group">
            <button class="control-btn btn-brake" id="btnBrake">فرامل<br>REV</button>
            <button class="control-btn btn-repair" id="btnRepair" onclick="handleHudRepairClick()">
                <span id="repairCountBadge" class="badge-count">×2</span>
                🔧 إصلاح<br>REPAIR
            </button>
        </div>
        <div class="btn-group">
            <button class="control-btn btn-wings" id="btnWings" onclick="handleHudWingsClick()">
                <span id="wingsCountBadge" class="badge-count">×2</span>
                ✈️ أجنحة<br>WINGS
            </button>
            <button class="control-btn btn-nitro" id="btnNitro">نيترو<br>NITRO</button>
            <button class="control-btn btn-gas" id="btnGas">بنزين<br>GAS</button>
        </div>
    </div>
    <canvas id="gameCanvas"></canvas>
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        let coins = 25000;
        let carHealth = 100;
        let repairKitsCount = 2;
        let flightWingsCount = 2;
        let isPausedForShop = false;
        let carBodyColor = '#ff001e';
        let carRoofColor = '#ff001e';
        let carRimColor = '#ff001e';
        let previewCustomColor = null;
        let previewCustomRoofColor = null;
        let customStarryHex = '#c90035';
        let customNeonColorA = '#00f5ff';
        let customNeonColorB = '#ff00d4';
        const customStarryRegistry = {};
        const customNeonRegistry = {};
        const CAR_COLOR_PRICE = 500;
        const STARRY_CAR_COLOR_PRICE = 8000;
        const NEON_CAR_COLOR_PRICE = 8000;
        const UNLOCKED_COLORS_STORAGE_KEY = 'mido_nx_apex_unlocked_colors_v5';
        let unlockedCarColors = ['#ff001e'];
        try {
            const rawColors = localStorage.getItem(UNLOCKED_COLORS_STORAGE_KEY);
            if (rawColors) {
                const parsedColors = JSON.parse(rawColors);
                if (Array.isArray(parsedColors) && parsedColors.length > 0) {
                    unlockedCarColors = parsedColors.map(c => String(c).toLowerCase());
                    if (!unlockedCarColors.includes('#ff001e')) unlockedCarColors.unshift('#ff001e');
                }
            }
        } catch (e) {}
        function parseHexRgbStandalone(hex) {
            const c = String(hex || '#e60026').replace('#', '').trim().padEnd(6, '0').slice(0, 6);
            const n = parseInt(c, 16);
            if (isNaN(n)) return [230, 0, 38];
            return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
        }
        function rgbToHexStandalone(r, g, b) {
            const cl = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
            return '#' + cl(r) + cl(g) + cl(b);
        }
        function registerStandaloneCustomStarry(rawHex) {
            const rgb = parseHexRgbStandalone(rawHex);
            const r = rgb[0], g = rgb[1], b = rgb[2];
            const encoded = rgbToHexStandalone(r, g, (b & 0xfc) | 0x01);
            const deep = rgbToHexStandalone(r * 0.25, g * 0.22, b * 0.28);
            const nebula = rgbToHexStandalone(r + (255 - r) * 0.45, g + (255 - g) * 0.35, b + (255 - b) * 0.48);
            const star = rgbToHexStandalone(r + (255 - r) * 0.82, g + (255 - g) * 0.82, b + (255 - b) * 0.85);
            const info = {
                id: 'custom_starry_galaxy',
                name: 'لون نجوم مخصص (Custom Starry Galaxy)',
                baseColor: encoded,
                deepColor: deep,
                nebulaColor: nebula,
                starColor: star,
                rgbBase: parseHexRgbStandalone(encoded),
                rgbNebula: parseHexRgbStandalone(nebula)
            };
            customStarryRegistry[encoded.toLowerCase()] = info;
            customStarryRegistry[String(rawHex).toLowerCase()] = info;
            return info;
        }
        function getStandaloneStarryInfo(hex) {
            if (!hex) return null;
            const norm = String(hex).trim().toLowerCase();
            if (customStarryRegistry[norm]) return customStarryRegistry[norm];
            if (norm === '#b80028' || norm === 'starry_candy_red') {
                return {
                    id: 'starry_candy_red',
                    name: 'أحمر مجري كاندي (Starry Candy Red)',
                    baseColor: '#b80028',
                    deepColor: '#2b0008',
                    nebulaColor: '#ff2a55',
                    starColor: '#ffe4e9',
                    rgbBase: [184, 0, 40],
                    rgbNebula: [255, 42, 85]
                };
            }
            if (norm === '#0038a8' || norm === 'cosmic_starry_blue') {
                return {
                    id: 'cosmic_starry_blue',
                    name: 'أزرق كوني (Cosmic Starry Blue)',
                    baseColor: '#0038a8',
                    deepColor: '#020b26',
                    nebulaColor: '#00b4d8',
                    starColor: '#e0f2fe',
                    rgbBase: [0, 56, 168],
                    rgbNebula: [0, 180, 216]
                };
            }
            if (norm === '#5a189a' || norm === 'galaxy_purple') {
                return {
                    id: 'galaxy_purple',
                    name: 'أرجواني مجري (Galaxy Purple)',
                    baseColor: '#5a189a',
                    deepColor: '#150329',
                    nebulaColor: '#c77dff',
                    starColor: '#f3e8ff',
                    rgbBase: [90, 24, 154],
                    rgbNebula: [199, 125, 255]
                };
            }
            return null;
        }
        function registerStandaloneCustomNeon(hexA, hexB) {
            const rgbA = parseHexRgbStandalone(hexA);
            const rgbB = parseHexRgbStandalone(hexB);
            const encodedA = rgbToHexStandalone(rgbA[0], rgbA[1], (rgbA[2] & 0xfc) | 0x02);
            const mid = rgbToHexStandalone((rgbA[0] + rgbB[0]) * 0.5, (rgbA[1] + rgbB[1]) * 0.5, (rgbA[2] + rgbB[2]) * 0.5);
            const info = {
                id: 'custom_dual_neon',
                name: 'نيون مخصص مزدوج (Custom Dual Neon)',
                colorA: encodedA,
                colorB: hexB,
                midColor: mid,
                coreColor: '#ffffff',
                rgbA: parseHexRgbStandalone(encodedA),
                rgbB: rgbB,
                rgbMid: parseHexRgbStandalone(mid)
            };
            customNeonRegistry[encodedA.toLowerCase()] = info;
            customNeonRegistry[String(hexA).toLowerCase()] = info;
            return info;
        }
        function getStandaloneDualNeonInfo(hex) {
            if (!hex) return null;
            const norm = String(hex).trim().toLowerCase();
            if (customNeonRegistry[norm]) return customNeonRegistry[norm];
            if (norm === '#ff0022' || norm === 'cyber_fire_neon') {
                return {
                    id: 'cyber_fire_neon',
                    name: 'نيون ناري (أحمر + أصفر)',
                    colorA: '#ff001e',
                    colorB: '#ffe600',
                    midColor: '#ff5e00',
                    coreColor: '#fffbeb',
                    rgbA: [255, 0, 30],
                    rgbB: [255, 230, 0],
                    rgbMid: [255, 94, 0]
                };
            }
            if (norm === '#00ff66' || norm === 'bio_hazard_neon') {
                return {
                    id: 'bio_hazard_neon',
                    name: 'نيون ليزري (أخضر + أزرق)',
                    colorA: '#00ff66',
                    colorB: '#00b8ff',
                    midColor: '#00f5d4',
                    coreColor: '#ecfeff',
                    rgbA: [0, 255, 102],
                    rgbB: [0, 184, 255],
                    rgbMid: [0, 245, 212]
                };
            }
            if (norm === '#00f5ff' || norm === 'cyber_synth_neon') {
                return {
                    id: 'cyber_synth_neon',
                    name: 'نيون سايبر (سيان + ماجنتا)',
                    colorA: '#00f5ff',
                    colorB: '#ff00d4',
                    midColor: '#9d4edd',
                    coreColor: '#fdf4ff',
                    rgbA: [0, 245, 255],
                    rgbB: [255, 0, 212],
                    rgbMid: [157, 78, 221]
                };
            }
            if (norm === '#ffbe0b' || norm === 'solar_plasma_neon') {
                return {
                    id: 'solar_plasma_neon',
                    name: 'نيون بلازما (ذهبي + بنفسجي)',
                    colorA: '#ffbe0b',
                    colorB: '#8338ec',
                    midColor: '#ff006e',
                    coreColor: '#fffbeb',
                    rgbA: [255, 190, 11],
                    rgbB: [131, 56, 236],
                    rgbMid: [255, 0, 110]
                };
            }
            return null;
        }
        function getStandaloneColorPrice(hex) {
            if (hex && String(hex).trim().toLowerCase() === '#ff001e') return 0;
            if (getStandaloneDualNeonInfo(hex)) return NEON_CAR_COLOR_PRICE;
            if (getStandaloneStarryInfo(hex)) return STARRY_CAR_COLOR_PRICE;
            return CAR_COLOR_PRICE;
        }
        function lerpStandaloneRgb(a, b, t, alpha) {
            const cl = Math.max(0, Math.min(1, t));
            const r = Math.round(a[0] + (b[0] - a[0]) * cl);
            const g = Math.round(a[1] + (b[1] - a[1]) * cl);
            const bl = Math.round(a[2] + (b[2] - a[2]) * cl);
            if (alpha === undefined || alpha >= 0.999) return 'rgb(' + r + ',' + g + ',' + bl + ')';
            return 'rgba(' + r + ',' + g + ',' + bl + ',' + Math.max(0, Math.min(1, alpha)).toFixed(3) + ')';
        }
        function isStandaloneColorUnlocked(hex) {
            if (!hex) return false;
            const norm = String(hex).trim().toLowerCase();
            if (norm === '#ff001e') return true;
            return unlockedCarColors.includes(norm);
        }
        function saveUnlockedColor(hex) {
            const norm = String(hex).toLowerCase();
            if (!unlockedCarColors.includes(norm)) {
                unlockedCarColors.push(norm);
                try {
                    localStorage.setItem(UNLOCKED_COLORS_STORAGE_KEY, JSON.stringify(unlockedCarColors));
                } catch (e) {}
            }
        }
        let garageUpgrades = {
            engine: 0,
            armor: 0,
            exhaustSound: 0
        };
        const COLOR_PRESETS = [
            { name: 'أحمر كاندي (Candy Red)', body: '#e60026', roof: '#e60026', price: CAR_COLOR_PRICE, isCandyRed: true },
            { name: 'برتقالي صحراوي', body: '#d35400', roof: '#d35400', price: CAR_COLOR_PRICE },
            { name: 'أزرق نيون', body: '#0284c7', roof: '#0284c7', price: CAR_COLOR_PRICE },
            { name: 'ذهبي ملكي', body: '#d97706', roof: '#d97706', price: CAR_COLOR_PRICE },
            { name: 'أخضر زمردي', body: '#059669', roof: '#059669', price: CAR_COLOR_PRICE },
            { name: 'بنفسجي رياضي', body: '#7c3aed', roof: '#7c3aed', price: CAR_COLOR_PRICE },
            { name: 'أسود كربوني', body: '#1e293b', roof: '#1e293b', price: CAR_COLOR_PRICE },
            { name: 'أحمر مجري كاندي (Starry Candy Red)', body: '#b80028', roof: '#2b0008', price: STARRY_CAR_COLOR_PRICE, isStarryGalaxy: true },
            { name: 'أزرق كوني (Cosmic Starry Blue)', body: '#0038a8', roof: '#020b26', price: STARRY_CAR_COLOR_PRICE, isStarryGalaxy: true },
            { name: 'أرجواني مجري (Galaxy Purple)', body: '#5a189a', roof: '#150329', price: STARRY_CAR_COLOR_PRICE, isStarryGalaxy: true },
            { name: 'نيون ناري (أحمر + أصفر)', body: '#ff0022', roof: '#ffe600', price: NEON_CAR_COLOR_PRICE, isDualNeon: true, c1: '#ff001e', c2: '#ffe600' },
            { name: 'نيون ليزري (أخضر + أزرق)', body: '#00ff66', roof: '#00b8ff', price: NEON_CAR_COLOR_PRICE, isDualNeon: true, c1: '#00ff66', c2: '#00b8ff' },
            { name: 'نيون سايبر (سيان + ماجنتا)', body: '#00f5ff', roof: '#ff00d4', price: NEON_CAR_COLOR_PRICE, isDualNeon: true, c1: '#00f5ff', c2: '#ff00d4' },
            { name: 'نيون بلازما (ذهبي + بنفسجي)', body: '#ffbe0b', roof: '#8338ec', price: NEON_CAR_COLOR_PRICE, isDualNeon: true, c1: '#ffbe0b', c2: '#8338ec' }
        ];
        const SETTINGS_STORAGE_KEY = 'mido_nx_apex_settings_v1';
        let savedPrefs = {};
        try {
            const rawPrefs = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (rawPrefs) savedPrefs = JSON.parse(rawPrefs) || {};
        } catch (e) {}
        let masterVolume = typeof savedPrefs.masterVolume === 'number' ? savedPrefs.masterVolume : 100;
        let natureVolume = typeof savedPrefs.natureVolume === 'number' ? savedPrefs.natureVolume : 100;
        let engineVolume = typeof savedPrefs.sfxVolume === 'number' ? savedPrefs.sfxVolume : 100;
        let fpsLimit = typeof savedPrefs.fpsLimit === 'number' ? savedPrefs.fpsLimit : 60;
        let graphicsQuality = typeof savedPrefs.quality === 'string' ? savedPrefs.quality : 'Ultra';
        let committedSettings = {
            masterVolume: masterVolume,
            natureVolume: natureVolume,
            sfxVolume: engineVolume,
            fpsLimit: fpsLimit,
            quality: graphicsQuality
        };
        let activeModalKey = null;
        let speed = 0;
        let worldX = 0;
        let fuel = 100;
        let car = { x: 150, y: canvas.height - 180, width: 90, height: 45, vy: 0, angle: 0, angVel: 0, suspensionOffset: 0, suspensionVelocity: 0, rearWheelDisp: 0, frontWheelDisp: 0, rearWheelVel: 0, frontWheelVel: 0, frontBrakeDive: 0, rearAccelSquat: 0, isGrounded: true, rearGrounded: true, frontGrounded: true, isFlying: false, airTime: 0, peakAirVy: 0, jumpCooldown: 0 };
        let keys = { gas: false, brake: false, nitro: false };

        // Realistic distant sky clouds slowly and smoothly drifting toward the left
        const skyClouds = [
            { x: 120, y: 55, w: 220, h: 72, speed: 0.28 },
            { x: 480, y: 88, w: 260, h: 84, speed: 0.36 },
            { x: 860, y: 48, w: 240, h: 76, speed: 0.24 },
            { x: 1240, y: 78, w: 250, h: 80, speed: 0.32 }
        ];

        // Balanced fuel canister spawn distance (~8960px apart), repair kit distance (~16000px apart), and Fixed 25-Value 3D Coins
        const FUEL_SPAWN_INTERVAL = 8960;
        const REPAIR_SPAWN_INTERVAL = 16000;
        const COIN_CLUSTER_INTERVAL = 640;
        const ROAD_STONE_CELL_SPACING = 680;
        let nextFuelSpawnX = 8120;
        let nextRepairSpawnX = 13280;
        let nextCoinSpawnX = 480;
        const fuelCanisters = [];
        const repairKits = [];
        const trackCoins = [];

        function isNearBridgeWorldX(wx, pad = 120) {
            const bridgeInterval = 1400;
            const nearestB = Math.round((wx - 520) / bridgeInterval) * bridgeInterval + 520;
            return Math.abs(wx - nearestB) < pad;
        }

        // Deterministic Roadside Rock Geometry & Tactile 3-Lobe Per-Wheel Climbing Profile (100% Synchronized with Rendering!)
        function getRoadStoneInfoAtCell(cellIdx) {
            if (cellIdx <= 0) return null;
            const h1 = Math.abs(Math.sin(cellIdx * 127.1 + 31.7));
            const h2 = Math.abs(Math.cos(cellIdx * 269.5 + 19.3));
            const h3 = Math.abs(Math.sin(cellIdx * 419.3 + 73.1));
            let stoneWorldX = cellIdx * ROAD_STONE_CELL_SPACING - 120 + (h1 - 0.5) * 90;
            if (stoneWorldX < 340) return null;
            const bridgeInterval = 1400;
            const nearestB = Math.round((stoneWorldX - 520) / bridgeInterval) * bridgeInterval + 520;
            // Shift any rock that lands near a suspension bridge outside the 260px pillar zone so 100% of rocks are visible & collidable!
            if (Math.abs(stoneWorldX - nearestB) < 295) {
                stoneWorldX = stoneWorldX >= nearestB ? nearestB + 295 : nearestB - 295;
            }
            if (stoneWorldX < 340) return null;
            // Standardized balanced, uniform MEDIUM size for all roadside rocks/boulders with tactile height
            const isMed = true;
            const hw = 12.5;
            const sh = 10.5;
            return { cellIdx, stoneWorldX, hw, sh, isMed, h1, h2, h3 };
        }

        // Rigid Circular Tire-to-Rock Shell Collision (Prevents any part of the circular rubber tire from sinking/embedding into rock graphics and ensures immediate elevation & 100% flush surface rolling!)
        function getStoneWheelLiftAtWorldX(wx) {
            if (wx < 300) return 0;
            const approxCell = Math.max(1, Math.round((wx + 120) / ROAD_STONE_CELL_SPACING));
            const evalOrganicLobeShell = (sampleX, lobeCenterX, oy, rw, rh, s3, strokePad) => {
                const localDx = sampleX - lobeCenterX;
                const halfSpan = rw * 1.02;
                if (localDx <= -halfSpan || localDx >= halfSpan) return 0;
                const peakX = (s3 - 0.5) * rw * 0.32;
                const u = localDx <= peakX
                    ? (peakX - localDx) / Math.max(1e-3, halfSpan + peakX)
                    : (localDx - peakX) / Math.max(1e-3, halfSpan - peakX);
                if (u >= 1) return 0;
                const shellYAboveBase = rh * Math.pow(1 - u * u, 0.52) + strokePad - oy;
                // Rock base is at groundY - 8.5 (canvas.height - 128.5); resting tire bottom is at canvas.height - 129.0 (0.5px above rock base)
                return Math.max(0, shellYAboveBase - 0.5);
            };
            const evalClusterShellAtX = (sampleX, stoneWorldX, hw, sh, h1, h2, h3) => {
                const leftShell = evalOrganicLobeShell(sampleX, stoneWorldX - hw * 0.68, 0.8, hw * 0.48, sh * 0.54, h1, 0.55);
                const mainShell = evalOrganicLobeShell(sampleX, stoneWorldX, 0, hw, sh, h3, 0.68);
                const rightShell = evalOrganicLobeShell(sampleX, stoneWorldX + hw * 0.66, 1.0, hw * 0.45, sh * 0.48, h2, 0.55);
                return Math.max(leftShell, mainShell, rightShell);
            };
            let maxLift = 0;
            const rigidWheelR = 16.0;
            const maxSweepDx = 15.0;
            for (let c = approxCell - 1; c <= approxCell + 1; c++) {
                const st = getRoadStoneInfoAtCell(c);
                if (!st) continue;
                const { stoneWorldX, hw, sh, h1, h2, h3 } = st;
                if (isNearBridgeWorldX(stoneWorldX, 260)) continue;
                if (Math.abs(wx - stoneWorldX) > hw * 1.2 + maxSweepDx + 4) continue;
                let clusterRigidLift = 0;
                for (let dx = -maxSweepDx; dx <= maxSweepDx; dx += 1.5) {
                    const shellH = evalClusterShellAtX(wx + dx, stoneWorldX, hw, sh, h1, h2, h3);
                    if (shellH > 0) {
                        const tireArcRise = rigidWheelR - Math.sqrt(Math.max(0, rigidWheelR * rigidWheelR - dx * dx));
                        const requiredLift = shellH - tireArcRise;
                        if (requiredLift > clusterRigidLift) {
                            clusterRigidLift = requiredLift;
                        }
                    }
                }
                if (clusterRigidLift > maxLift) maxLift = clusterRigidLift;
            }
            return maxLift;
        }

        // Movable Bridge Collision Surface Helper (100% synchronized with wooden plank rendering and C2-smoothed at entry/exit so wheels sit strictly ON TOP of the planks with zero edge step bump!)
        function getBridgeDeckYAtWorldX(wx, nowSec) {
            const bridgeInterval = 1400;
            const bw = 220;
            const nearestB = Math.round((wx - 520) / bridgeInterval) * bridgeInterval + 520;
            if (nearestB < 520) return null;
            const leftWorldX = nearestB - bw * 0.5;
            const rightWorldX = nearestB + bw * 0.5;
            if (wx < leftWorldX - 24 || wx > rightWorldX + 24) return null;
            const groundY = canvas.height - 120;
            const t = Math.max(0, Math.min(1, (wx - leftWorldX) / bw));
            const archShape = 0.5 * (1 - Math.cos(t * Math.PI * 2));
            const carCenterWorldX = worldX + car.x + car.width * 0.5;
            const distCar = wx - carCenterWorldX;
            const carPress = (!car.isFlying && Math.abs(distCar) < bw * 0.65)
                ? Math.exp(-(distCar * distCar) / 3600) * 2.4
                : 0;
            const windOsc = Math.sin(nowSec * 2.4 + t * Math.PI * 2.0 + nearestB * 0.01) * 0.8 * archShape;
            return groundY - 15 + archShape * 2.2 + carPress * archShape + windOsc;
        }

        function getBridgeTransitionBlendAtWorldX(wx) {
            const bridgeInterval = 1400;
            const bw = 220;
            const nearestB = Math.round((wx - 520) / bridgeInterval) * bridgeInterval + 520;
            if (nearestB < 520) return 0;
            const leftWorldX = nearestB - bw * 0.5;
            const rightWorldX = nearestB + bw * 0.5;
            if (wx < leftWorldX - 24 || wx > rightWorldX + 24) return 0;
            if (wx >= leftWorldX && wx <= rightWorldX) return 1;
            const u = wx < leftWorldX
                ? (wx - (leftWorldX - 24)) / 24
                : ((rightWorldX + 24) - wx) / 24;
            const cl = Math.max(0, Math.min(1, u));
            // C2 quintic smootherstep ramp eliminates the 6px step bump at bridge entry/exit!
            return cl * cl * cl * (cl * (cl * 6 - 15) + 10);
        }

        function getBridgeWheelLiftAtWorldX(wx, nowSec) {
            const deckY = getBridgeDeckYAtWorldX(wx, nowSec);
            if (deckY === null) return 0;
            const blend = getBridgeTransitionBlendAtWorldX(wx);
            const roadWheelBottomY = canvas.height - 129;
            return Math.max(0, (roadWheelBottomY - deckY) * blend);
        }

        // Flat, stable road baseline (zero artificial sine-wave bouncing on flat road!)
        function getRoadHillLiftAtWorldX(wx) {
            return 0;
        }

        function spawnBalancedPickupsAhead() {
            const targetAhead = worldX + canvas.width + 2200;
            while (nextCoinSpawnX < targetAhead) {
                for (let i = 0; i < 5; i++) {
                    const cx = nextCoinSpawnX + i * 52;
                    trackCoins.push({ id: trackCoins.length + 1, x: cx, value: 25, radius: 16, collected: false });
                }
                nextCoinSpawnX += COIN_CLUSTER_INTERVAL;
            }
            while (nextFuelSpawnX < targetAhead) {
                fuelCanisters.push({ x: nextFuelSpawnX, collected: false });
                nextFuelSpawnX += FUEL_SPAWN_INTERVAL;
            }
            while (nextRepairSpawnX < targetAhead) {
                repairKits.push({ x: nextRepairSpawnX, collected: false });
                nextRepairSpawnX += REPAIR_SPAWN_INTERVAL;
            }
        }
        spawnBalancedPickupsAhead();

        // High-Fidelity Normalized Web Audio API Engine with Dynamic Limiter (Zero Distortion / Zero Clipping / Zero Repetitive Tones)
        const NORMALIZED_SAMPLE_RATE = 48000;
        let audioCtx = null;
        let masterBusGain = null;
        let engineSource = null;
        let enginePrimaryOsc = null;
        let engineSubOsc = null;
        let engineBassBoost = null;
        let engineFilter = null;
        let engineGain = null;
        let rainSource = null;
        let rainFilter = null;
        let rainGain = null;

        function getNatureGain(base) {
            if (natureVolume <= 0 || masterVolume <= 0) return 0;
            return Math.min(0.82, Math.max(0, base * 1.08 * (natureVolume / 100) * (masterVolume / 100)));
        }

        function getEngineGain(base) {
            if (engineVolume <= 0 || masterVolume <= 0) return 0;
            return Math.min(0.92, Math.max(0, base * 1.24 * (engineVolume / 100) * (masterVolume / 100)));
        }

        function normalizeAudioBuffer(buffer, targetPeak = 0.72) {
            const data = buffer.getChannelData(0);
            const len = data.length;
            if (!len) return buffer;
            let sum = 0;
            for (let i = 0; i < len; i++) sum += data[i];
            const mean = sum / len;
            for (let i = 0; i < len; i++) data[i] -= mean;
            let prev = data[0];
            for (let i = 1; i < len - 1; i++) {
                const curr = data[i];
                data[i] = 0.24 * prev + 0.52 * curr + 0.24 * data[i + 1];
                prev = curr;
            }
            let maxAbs = 0.0001;
            for (let i = 0; i < len; i++) {
                const a = Math.abs(data[i]);
                if (a > maxAbs) maxAbs = a;
            }
            const cleanTarget = Math.min(0.76, Math.max(0.58, targetPeak));
            const scale = Math.min(1.25, cleanTarget / maxAbs);
            for (let i = 0; i < len; i++) data[i] *= scale;
            return buffer;
        }

        function ensureAudio() {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (!AudioContextClass) return null;
                try {
                    audioCtx = new AudioContextClass({ latencyHint: 'interactive', sampleRate: NORMALIZED_SAMPLE_RATE });
                } catch (e) {
                    audioCtx = new AudioContextClass();
                }
                masterBusGain = audioCtx.createGain();
                masterBusGain.gain.value = 1.18;

                const dcBlocker = audioCtx.createBiquadFilter();
                dcBlocker.type = 'highpass';
                dcBlocker.frequency.value = 30;
                dcBlocker.Q.value = 0.707;

                const bassBoost = audioCtx.createBiquadFilter();
                bassBoost.type = 'lowshelf';
                bassBoost.frequency.value = 105;
                bassBoost.gain.value = 3.0;

                const antiMud = audioCtx.createBiquadFilter();
                antiMud.type = 'peaking';
                antiMud.frequency.value = 250;
                antiMud.Q.value = 0.9;
                antiMud.gain.value = -2.2;

                const highCut = audioCtx.createBiquadFilter();
                highCut.type = 'lowpass';
                highCut.frequency.value = 5800;
                highCut.Q.value = 0.707;

                const compressor = audioCtx.createDynamicsCompressor();
                compressor.threshold.value = -14.0;
                compressor.knee.value = 12.0;
                compressor.ratio.value = 6.0;
                compressor.attack.value = 0.003;
                compressor.release.value = 0.15;

                const brickwallLimiter = audioCtx.createDynamicsCompressor();
                brickwallLimiter.threshold.value = -3.0;
                brickwallLimiter.knee.value = 0.0;
                brickwallLimiter.ratio.value = 20.0;
                brickwallLimiter.attack.value = 0.001;
                brickwallLimiter.release.value = 0.08;

                const ceilingGain = audioCtx.createGain();
                ceilingGain.gain.value = 0.88;

                masterBusGain.connect(dcBlocker);
                dcBlocker.connect(bassBoost);
                bassBoost.connect(antiMud);
                antiMud.connect(highCut);
                highCut.connect(compressor);
                compressor.connect(brickwallLimiter);
                brickwallLimiter.connect(ceilingGain);
                ceilingGain.connect(audioCtx.destination);

                // Restored Full-Bodied Multi-Cylinder Car Engine Sample Buffer + Real-Time Synthesizer Oscillators (55Hz-680Hz)
                const sr = audioCtx.sampleRate || NORMALIZED_SAMPLE_RATE;
                const engLen = Math.floor(sr * 2.4);
                const engBuf = audioCtx.createBuffer(1, engLen, sr);
                const engData = engBuf.getChannelData(0);
                let b0 = 0, b1 = 0, b2 = 0, subLp1 = 0, subLp2 = 0, lp1 = 0, lp2 = 0, lp3 = 0, modLp = 0;
                const subFreq = 62.5;
                for (let i = 0; i < engLen; i++) {
                    const t = i / sr;
                    const w = Math.random() * 2 - 1;
                    b0 = 0.995 * b0 + w * 0.045;
                    b1 = 0.975 * b1 + w * 0.085;
                    b2 = 0.91 * b2 + w * 0.14;
                    modLp = 0.995 * modLp + 0.005 * b1;
                    const smoothMod = 0.86 + 0.24 * Math.tanh(modLp * 1.5);
                    const phase = 2 * Math.PI * subFreq * t;
                    const deepSubWave =
                        Math.sin(phase * 0.5 + 0.2) * 0.32 +
                        Math.sin(phase) * 0.48 +
                        Math.sin(phase * 1.5 + 0.45) * 0.26 +
                        Math.sin(phase * 2.0 + 0.8) * 0.36 +
                        Math.sin(phase * 3.0 + 1.1) * 0.22 +
                        Math.sin(phase * 4.0 + 1.5) * 0.14 +
                        Math.sin(phase * 5.0 + 0.3) * 0.08;
                    const pulseEnv = 0.58 + 0.42 * Math.max(0, Math.sin(phase)) + 0.28 * Math.max(0, Math.sin(phase * 2.0 + 0.4));
                    const rawSubCore = b0 * 0.65 + b1 * 0.35;
                    subLp1 = subLp1 + 0.085 * (rawSubCore - subLp1);
                    subLp2 = subLp2 + 0.075 * (subLp1 - subLp2);
                    const body = (b0 * 0.45 + b1 * 0.35 + b2 * 0.2) * smoothMod * pulseEnv;
                    lp1 = lp1 + 0.24 * (body - lp1);
                    lp2 = lp2 + 0.21 * (lp1 - lp2);
                    lp3 = lp3 + 0.19 * (lp2 - lp3);
                    engData[i] = Math.tanh((deepSubWave * 0.68 + subLp2 * 0.64 + lp3 * 0.72) * 1.12);
                }
                normalizeAudioBuffer(engBuf, 0.80);

                engineSource = audioCtx.createBufferSource();
                engineSource.buffer = engBuf;
                engineSource.loop = true;

                enginePrimaryOsc = audioCtx.createOscillator();
                enginePrimaryOsc.type = 'triangle';
                enginePrimaryOsc.frequency.value = 62;
                const primaryOscGain = audioCtx.createGain();
                primaryOscGain.gain.value = 0.24;

                engineSubOsc = audioCtx.createOscillator();
                engineSubOsc.type = 'sine';
                engineSubOsc.frequency.value = 42;
                const subOscGain = audioCtx.createGain();
                subOscGain.gain.value = 0.34;

                engineBassBoost = audioCtx.createBiquadFilter();
                engineBassBoost.type = 'lowshelf';
                engineBassBoost.frequency.value = 115;
                engineBassBoost.gain.value = 5.4;

                engineFilter = audioCtx.createBiquadFilter();
                engineFilter.type = 'lowpass';
                engineFilter.Q.value = 0.78;
                engineFilter.frequency.value = 420;

                engineGain = audioCtx.createGain();
                engineGain.gain.value = Math.max(0.0001, getEngineGain(0.52));

                engineSource.connect(engineBassBoost);
                enginePrimaryOsc.connect(primaryOscGain);
                primaryOscGain.connect(engineBassBoost);
                engineSubOsc.connect(subOscGain);
                subOscGain.connect(engineBassBoost);
                engineBassBoost.connect(engineFilter);
                engineFilter.connect(engineGain);
                engineGain.connect(masterBusGain);
                engineSource.start();
                enginePrimaryOsc.start();
                engineSubOsc.start();

                // Active Main Menu & Gameplay Natural Valley Breeze & Rain Ambience
                const ambLen = Math.floor(sr * 2.0);
                const ambBuf = audioCtx.createBuffer(1, ambLen, sr);
                const ambData = ambBuf.getChannelData(0);
                let ab0 = 0, ab1 = 0, ab2 = 0;
                for (let i = 0; i < ambLen; i++) {
                    const w = Math.random() * 2 - 1;
                    ab0 = 0.998 * ab0 + w * 0.05;
                    ab1 = 0.985 * ab1 + w * 0.09;
                    ab2 = 0.92 * ab2 + w * 0.16;
                    ambData[i] = Math.tanh((ab0 + ab1 + ab2) * 0.42);
                }
                normalizeAudioBuffer(ambBuf, 0.65);

                rainSource = audioCtx.createBufferSource();
                rainSource.buffer = ambBuf;
                rainSource.loop = true;
                rainFilter = audioCtx.createBiquadFilter();
                rainFilter.type = 'lowpass';
                rainFilter.Q.value = 0.707;
                rainFilter.frequency.value = 320;
                rainGain = audioCtx.createGain();
                rainGain.gain.value = Math.max(0.0001, getNatureGain(0.065));
                rainSource.connect(rainFilter);
                rainFilter.connect(rainGain);
                rainGain.connect(masterBusGain);
                rainSource.start();
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume().catch(() => {});
            }
            return audioCtx;
        }
        window.addEventListener('pointerdown', ensureAudio, { passive: true });
        window.addEventListener('touchstart', ensureAudio, { passive: true });
        window.addEventListener('keydown', ensureAudio, { passive: true });

        // Soft, quiet, gentle & pleasant coin pickup SFX (Exclusively controlled by Nature & Environmental SFX slider)
        function playCoinSound() {
            const ac = ensureAudio();
            if (!ac || !masterBusGain) return;
            const gainVal = getNatureGain(0.11);
            if (gainVal <= 0) return;
            const now = ac.currentTime;
            const osc = ac.createOscillator();
            const flt = ac.createBiquadFilter();
            const g = ac.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(329.63, now);
            osc.frequency.exponentialRampToValueAtTime(440.0, now + 0.065);
            flt.type = 'lowpass';
            flt.frequency.setValueAtTime(460, now);
            g.gain.setValueAtTime(0.0003, now);
            g.gain.linearRampToValueAtTime(gainVal, now + 0.018);
            g.gain.exponentialRampToValueAtTime(0.0003, now + 0.115);
            osc.connect(flt);
            flt.connect(g);
            g.connect(masterBusGain);
            osc.start(now);
            osc.stop(now + 0.12);
        }

        // Logical Exhaust Backfire Pop SFX (Slightly boosted while driving/moving, Muted on Main Menu & when idle/stationary)
        let lastBackfireAt = 0;
        let wasGasActive = false;
        let backfireFlash = 0;
        let lightningFlash = 0;
        let lightningCountdown = 3.6;
        let lightningBolt = [];

        function generateForkedBolt(centerX, topY) {
            const segs = [];
            let curX = centerX + (Math.random() - 0.5) * 180;
            let curY = topY;
            for (let i = 0; i < 10; i++) {
                const nextX = curX + (Math.random() - 0.5) * 72;
                const nextY = curY + 24 + Math.random() * 24;
                segs.push({ x1: curX, y1: curY, x2: nextX, y2: nextY, width: Math.max(1.5, 4.8 - i * 0.34) });
                if (i >= 1 && i <= 7 && Math.random() < 0.65) {
                    let bx = curX, by = curY;
                    const dir = Math.random() < 0.5 ? -1 : 1;
                    for (let b = 0; b < 3; b++) {
                        const nbx = bx + dir * (16 + Math.random() * 26);
                        const nby = by + 18 + Math.random() * 18;
                        segs.push({ x1: bx, y1: by, x2: nbx, y2: nby, width: Math.max(1.0, 2.0 - b * 0.3) });
                        bx = nbx;
                        by = nby;
                    }
                }
                curX = nextX;
                curY = nextY;
            }
            return segs;
        }

        function playBackfireSound(intensity = 1.0, forcePreview = false) {
            if (!forcePreview && Math.abs(speed) <= 18) return; // Never play backfire when car is idle/stationary!
            const ac = ensureAudio();
            if (!ac || !masterBusGain) return;
            const now = ac.currentTime;
            if (now - lastBackfireAt < 0.15) return;
            lastBackfireAt = now;
            const gainVal = getEngineGain(0.74 * Math.min(1.25, intensity));
            if (gainVal <= 0) return;

            // 1. Deep Sub-Bass Muffler Thump (142Hz -> 36Hz)
            const osc = ac.createOscillator();
            const flt = ac.createBiquadFilter();
            const g = ac.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(142 + Math.random() * 16, now);
            osc.frequency.exponentialRampToValueAtTime(36, now + 0.1);
            flt.type = 'lowpass';
            flt.frequency.setValueAtTime(210, now);
            flt.Q.setValueAtTime(0.707, now);
            g.gain.setValueAtTime(0.0008, now);
            g.gain.linearRampToValueAtTime(gainVal * 0.82, now + 0.007);
            g.gain.exponentialRampToValueAtTime(0.0008, now + 0.105);
            osc.connect(flt);
            flt.connect(g);
            g.connect(masterBusGain);
            osc.start(now);
            osc.stop(now + 0.11);

            // 2. Warm Low-Pass Filtered Exhaust Pop Shot
            const sr = ac.sampleRate || NORMALIZED_SAMPLE_RATE;
            const bufLen = Math.floor(sr * 0.085);
            const buf = ac.createBuffer(1, bufLen, sr);
            const out = buf.getChannelData(0);
            let lp1 = 0, lp2 = 0;
            for (let i = 0; i < bufLen; i++) {
                const w = Math.random() * 2 - 1;
                lp1 = 0.88 * lp1 + 0.12 * w;
                lp2 = 0.82 * lp2 + 0.18 * lp1;
                out[i] = lp2 * Math.exp(-i / (sr * 0.022));
            }
            normalizeAudioBuffer(buf, 0.72);
            const popSrc = ac.createBufferSource();
            popSrc.buffer = buf;
            const bp = ac.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = 360 + Math.random() * 110;
            bp.Q.value = 0.8;
            const popG = ac.createGain();
            popG.gain.setValueAtTime(0.0008, now);
            popG.gain.linearRampToValueAtTime(gainVal * 0.62, now + 0.006);
            popG.gain.exponentialRampToValueAtTime(0.0008, now + 0.085);
            popSrc.connect(bp);
            bp.connect(popG);
            popG.connect(masterBusGain);
            popSrc.start(now);
        }

        // Authentic Thunder & Lightning SFX (Exclusively controlled by Nature & Environmental SFX slider)
        function playThunderSound(intensity = 1.0) {
            const ac = ensureAudio();
            if (!ac || !masterBusGain) return;
            const gainVal = getNatureGain(0.72 * Math.min(1.2, intensity));
            if (gainVal <= 0) return;
            const now = ac.currentTime;
            const sr = ac.sampleRate || NORMALIZED_SAMPLE_RATE;

            // 1. Lightning Crack & Rolling Valley Thunder Rumble Buffer
            const rLen = Math.floor(sr * 2.2);
            const rBuf = ac.createBuffer(1, rLen, sr);
            const rData = rBuf.getChannelData(0);
            let lp = 0;
            for (let i = 0; i < rLen; i++) {
                const t = i / sr;
                const w = Math.random() * 2 - 1;
                lp = 0.89 * lp + 0.11 * w;
                const env = Math.exp(-t * 1.9) * 0.95 + (t > 0.26 ? Math.exp(-(t - 0.26) * 1.5) * 0.65 : 0);
                rData[i] = Math.tanh(lp * env * (0.75 + 0.25 * Math.sin(t * 9.2)));
            }
            normalizeAudioBuffer(rBuf, 0.74);
            const rSrc = ac.createBufferSource();
            rSrc.buffer = rBuf;
            const rFlt = ac.createBiquadFilter();
            rFlt.type = 'lowpass';
            rFlt.frequency.setValueAtTime(280, now);
            rFlt.frequency.exponentialRampToValueAtTime(55, now + 2.2);
            const rGain = ac.createGain();
            rGain.gain.setValueAtTime(0.001, now);
            rGain.gain.linearRampToValueAtTime(gainVal * 0.75, now + 0.04);
            rGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.2);
            rSrc.connect(rFlt);
            rFlt.connect(rGain);
            rGain.connect(masterBusGain);
            rSrc.start(now);

            // 2. Deep Sub-Bass Thunder Boom
            const subOsc = ac.createOscillator();
            const subGain = ac.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(105, now);
            subOsc.frequency.exponentialRampToValueAtTime(26, now + 2.1);
            subGain.gain.setValueAtTime(0.001, now);
            subGain.gain.linearRampToValueAtTime(gainVal * 0.68, now + 0.025);
            subGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.15);
            subOsc.connect(subGain);
            subGain.connect(masterBusGain);
            subOsc.start(now);
            subOsc.stop(now + 2.2);
        }

        function playNitroSound() {
            const ac = ensureAudio();
            if (!ac || !masterBusGain) return;
            const now = ac.currentTime;
            const sr = ac.sampleRate || NORMALIZED_SAMPLE_RATE;
            const len = Math.floor(sr * 0.55);
            const buf = ac.createBuffer(1, len, sr);
            const data = buf.getChannelData(0);
            let lp = 0;
            for (let i = 0; i < len; i++) {
                const t = i / sr;
                lp = 0.9 * lp + 0.1 * (Math.random() * 2 - 1);
                data[i] = lp * Math.min(1, t / 0.03) * Math.exp(-t * 2.8);
            }
            normalizeAudioBuffer(buf, 0.78);
            const src = ac.createBufferSource();
            src.buffer = buf;
            const flt = ac.createBiquadFilter();
            flt.type = 'lowpass';
            flt.frequency.setValueAtTime(720, now);
            const g = ac.createGain();
            g.gain.setValueAtTime(0.001, now);
            g.gain.linearRampToValueAtTime(0.76, now + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0008, now + 0.55);
            src.connect(flt);
            flt.connect(g);
            g.connect(masterBusGain);
            src.start(now);
        }

        function playClickSound() {
            const ac = ensureAudio();
            if (!ac || !masterBusGain) return;
            const now = ac.currentTime;
            const osc = ac.createOscillator();
            const g = ac.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(620, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
            g.gain.setValueAtTime(0.58, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
            osc.connect(g);
            g.connect(masterBusGain);
            osc.start(now);
            osc.stop(now + 0.07);
        }

        const modalSections = {
            garage: { title: 'الكراج (Garage)', items: ['تطوير المحرك (Engine Lv.1)', 'تطوير المساعدين واليايات (Suspension Lv.1)', 'تطوير الإطارات والتماسك (Tires Lv.1)', 'تطوير خزان الوقود والنيترو (Fuel Lv.1)'] },
            showroom: { title: 'معرض السيارات (Cars Showroom)', items: ['Mido Offroad 4x4 (مجانية)', 'Apex Baja Truck (15,000 كوينز)', 'Storm Rally V6 (35,000 كوينز)', 'Hyperion W16 (75,000 كوينز)'] },
            maps: { title: 'الخرائط (Maps)', items: ['وادي الغابات الخضراء (مجانية)', 'مرتفعات الألب الجبلية (12,000 كوينز)', 'تلال الزمرد الصخرية (25,000 كوينز)', 'قمم الغابات العاصفة (45,000 كوينز)'] },
            shop: { title: 'المتجر (Shop)', items: ['أجنحة الطيران النادرة (1,200 كوينز)', 'عدة إصلاح السيارة والكشافات (600 كوينز)', 'شحنة نيترو ووقود فائق (400 كوينز)'] },
            settings: { title: 'الإعدادات (Settings)', items: ['جودة الصوت: منقى بالكامل بدون تشويش (Normalized 48kHz + Dynamic Limiter)', 'جودة الرسوميات: Ultra HD', 'معدل الإطارات: 60 FPS', 'تثبيت الكاميرا: مفعل'] }
        };
        function setMasterVol(val) {
            masterVolume = Number(val);
            const el = document.getElementById('masterVolLabel');
            if (el) el.innerText = masterVolume + '%';
            if (masterBusGain && audioCtx) {
                masterBusGain.gain.setTargetAtTime(Math.max(0.0001, 1.18 * (masterVolume / 100)), audioCtx.currentTime, 0.05);
            }
        }
        function setNatureVol(val) {
            natureVolume = Number(val);
            const el = document.getElementById('natureVolLabel');
            if (el) el.innerText = natureVolume + '%';
            if (rainGain && audioCtx) {
                rainGain.gain.setTargetAtTime(Math.max(0.0001, getNatureGain(0.18)), audioCtx.currentTime, 0.08);
            }
        }
        function setEngineVol(val) {
            engineVolume = Number(val);
            const el = document.getElementById('engineVolLabel');
            if (el) el.innerText = engineVolume + '%';
            if (engineGain && audioCtx && engineVolume <= 0) {
                engineGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.05);
            }
        }
        function setFpsOption(val) {
            fpsLimit = Number(val) || 60;
            committedSettings.fpsLimit = fpsLimit;
            try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(committedSettings)); } catch (e) {}
            playClickSound();
            const el = document.getElementById('fpsCurrentLabel');
            if (el) el.innerText = fpsLimit + ' FPS';
            if (activeModalKey === 'settings') openModal('settings');
        }
        function setQualityOption(val) {
            graphicsQuality = String(val);
            committedSettings.quality = graphicsQuality;
            try { localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(committedSettings)); } catch (e) {}
            playClickSound();
            const el = document.getElementById('qualityCurrentLabel');
            if (el) el.innerText = graphicsQuality;
            if (activeModalKey === 'settings') openModal('settings');
        }
        function saveSettingsToStorage() {
            playClickSound();
            committedSettings = {
                masterVolume: masterVolume,
                natureVolume: natureVolume,
                sfxVolume: engineVolume,
                fpsLimit: fpsLimit,
                quality: graphicsQuality
            };
            try {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(committedSettings));
            } catch (e) {}
            const saveBtn = document.getElementById('saveSettingsBtn');
            if (saveBtn) {
                saveBtn.innerText = '✓ تم الحفظ! (Saved!)';
            }
        }
        let hudAlertTimer = null;
        function showHudAlert(msg) {
            const el = document.getElementById('hudAlertToast');
            if (!el) return;
            el.innerText = msg;
            el.style.display = 'block';
            if (hudAlertTimer) clearTimeout(hudAlertTimer);
            hudAlertTimer = setTimeout(() => {
                el.style.display = 'none';
            }, 2500);
        }
        function updateHudBadges() {
            const rBadge = document.getElementById('repairCountBadge');
            const wBadge = document.getElementById('wingsCountBadge');
            const hDisp = document.getElementById('healthDisplay');
            const cDisp = document.getElementById('coinCount');
            const contBtn = document.getElementById('continueGameTopBtn');
            const modalContBtn = document.getElementById('modalContinueBtn');
            if (rBadge) rBadge.innerText = '×' + repairKitsCount;
            if (wBadge) wBadge.innerText = '×' + flightWingsCount;
            if (hDisp) hDisp.innerText = Math.round(carHealth) + '%';
            if (cDisp) cDisp.innerText = coins.toLocaleString() + ' كوينز';
            if (contBtn) contBtn.style.display = (isPausedForShop && !activeModalKey) ? 'inline-block' : 'none';
            if (modalContBtn) modalContBtn.style.display = isPausedForShop ? 'inline-block' : 'none';
        }
        function handleHudRepairClick() {
            playClickSound();
            if (repairKitsCount <= 0) {
                if (carHealth >= 100) {
                    showHudAlert('السيارة سليمة تماماً! · Car is undamaged!');
                }
                keys.gas = false; keys.brake = false; keys.nitro = false;
                isPausedForShop = true;
                openModal('shop');
                updateHudBadges();
                return;
            }
            if (carHealth >= 100) {
                showHudAlert('السيارة سليمة تماماً! · Car is undamaged!');
                return;
            }
            repairKitsCount = Math.max(0, repairKitsCount - 1);
            carHealth = 100;
            showHudAlert('🔧 تم إصلاح السيارة 100%!');
            updateHudBadges();
        }
        function handleHudWingsClick() {
            playClickSound();
            if (flightWingsCount <= 0) {
                keys.gas = false; keys.brake = false; keys.nitro = false;
                isPausedForShop = true;
                openModal('shop');
                updateHudBadges();
                return;
            }
            flightWingsCount = Math.max(0, flightWingsCount - 1);
            car.isFlying = !car.isFlying;
            showHudAlert(car.isFlying ? '✈️ تم تفعيل أجنحة الطيران!' : '🚗 عودة للقيادة الأرضية');
            updateHudBadges();
        }
        function resumeGameFromShop() {
            playClickSound();
            isPausedForShop = false;
            closeModal();
            updateHudBadges();
        }
        function buyShopItemStandalone(type, cost) {
            if (coins < cost) {
                showHudAlert('⚠️ رصيد الكوينز غير كافٍ!');
                return;
            }
            playClickSound();
            coins -= cost;
            if (type === 'repair') repairKitsCount++;
            else if (type === 'wings') flightWingsCount++;
            else if (type === 'nitro') fuel = 100;
            updateHudBadges();
            if (activeModalKey === 'shop') openModal('shop');
        }
        function previewStandaloneCustomColor(hex) {
            previewCustomColor = hex;
            previewCustomRoofColor = hex;
            const innerCircle = document.getElementById('customColorInnerCircle');
            if (innerCircle) innerCircle.style.background = hex;
            const customBuyBtn = document.getElementById('customColorBuyBtn');
            if (customBuyBtn) {
                const isOwned = isStandaloneColorUnlocked(hex);
                const isEquipped = isOwned && !previewCustomColor && carBodyColor.toLowerCase() === hex.toLowerCase();
                const targetPrice = getStandaloneColorPrice(hex);
                if (isEquipped) {
                    customBuyBtn.innerText = '✓ مُفعل';
                } else if (isOwned) {
                    customBuyBtn.innerText = 'اختيار';
                } else {
                    customBuyBtn.innerText = targetPrice.toLocaleString() + ' كوينز';
                }
            }
        }
        function previewStandaloneStarryCustom(hex) {
            customStarryHex = hex;
            const info = registerStandaloneCustomStarry(hex);
            previewCustomColor = info.baseColor;
            previewCustomRoofColor = info.deepColor;
            const inner = document.getElementById('customStarryInnerCircle');
            if (inner) inner.style.background = hex;
        }
        function buyStandaloneStarryCustom() {
            const info = registerStandaloneCustomStarry(customStarryHex);
            buyOrEquipStandaloneCarColor(info.baseColor, info.deepColor, STARRY_CAR_COLOR_PRICE);
        }
        function previewStandaloneNeonCustom(hexA, hexB) {
            if (hexA) customNeonColorA = hexA;
            if (hexB) customNeonColorB = hexB;
            const info = registerStandaloneCustomNeon(customNeonColorA, customNeonColorB);
            previewCustomColor = info.colorA;
            previewCustomRoofColor = info.colorB;
            const innerA = document.getElementById('customNeonInnerCircleA');
            if (innerA) innerA.style.background = customNeonColorA;
            const innerB = document.getElementById('customNeonInnerCircleB');
            if (innerB) innerB.style.background = customNeonColorB;
        }
        function buyStandaloneNeonCustom() {
            const info = registerStandaloneCustomNeon(customNeonColorA, customNeonColorB);
            buyOrEquipStandaloneCarColor(info.colorA, info.colorB, NEON_CAR_COLOR_PRICE);
        }
        function previewStandalonePresetColor(bodyCol, roofCol) {
            playClickSound();
            previewCustomColor = bodyCol;
            previewCustomRoofColor = roofCol || bodyCol;
            const targetPrice = getStandaloneColorPrice(bodyCol);
            showHudAlert('👁️ معاينة اللون على السيارة والطاوات (اضغط على مربع ' + targetPrice.toLocaleString() + ' كوينز للشراء أو التفعيل)');
            if (activeModalKey === 'garage') openModal('garage');
        }
        function buyStandaloneCustomColor() {
            const targetHex = previewCustomColor || carBodyColor;
            buyOrEquipStandaloneCarColor(targetHex, targetHex, getStandaloneColorPrice(targetHex));
        }
        function restoreStandaloneDefaultColor() {
            playClickSound();
            carBodyColor = '#ff001e';
            carRoofColor = '#ff001e';
            carRimColor = '#ff001e';
            previewCustomColor = null;
            previewCustomRoofColor = null;
            showHudAlert('🎨 تم استعادة اللون الافتراضي (أحمر ناري) للسيارة والطاوات!');
            updateHudBadges();
            if (activeModalKey === 'garage') openModal('garage');
        }
        function buyOrEquipStandaloneCarColor(bodyCol, roofCol, explicitPrice) {
            const normBody = String(bodyCol).toLowerCase();
            const isAlreadyUnlocked = isStandaloneColorUnlocked(normBody);
            const targetPrice = typeof explicitPrice === 'number' ? explicitPrice : getStandaloneColorPrice(bodyCol);
            if (isAlreadyUnlocked && carBodyColor.toLowerCase() === normBody && !previewCustomColor) {
                playClickSound();
                carBodyColor = bodyCol;
                carRoofColor = roofCol || bodyCol;
                carRimColor = bodyCol;
                showHudAlert('✓ هذا اللون مُفعل حالياً على السيارة والطاوات!');
                updateHudBadges();
                if (activeModalKey === 'garage') openModal('garage');
                return;
            }
            if (isAlreadyUnlocked) {
                playClickSound();
                carBodyColor = bodyCol;
                carRoofColor = roofCol || bodyCol;
                carRimColor = bodyCol;
                previewCustomColor = null;
                previewCustomRoofColor = null;
                showHudAlert('✓ تم تفعيل اللون المملوك مجاناً على السيارة والطاوات!');
                updateHudBadges();
                if (activeModalKey === 'garage') openModal('garage');
                return;
            }
            if (coins < targetPrice) {
                playClickSound();
                previewCustomColor = bodyCol;
                previewCustomRoofColor = roofCol || bodyCol;
                showHudAlert('⚠️ تحتاج إلى ' + targetPrice.toLocaleString() + ' كوينز لشراء وحفظ اللون! (تمت المعاينة مجاناً)');
                if (activeModalKey === 'garage') openModal('garage');
                return;
            }
            playClickSound();
            coins -= targetPrice;
            saveUnlockedColor(bodyCol);
            carBodyColor = bodyCol;
            carRoofColor = roofCol || bodyCol;
            carRimColor = bodyCol;
            previewCustomColor = null;
            previewCustomRoofColor = null;
            showHudAlert('🎨 تم شراء وحفظ اللون نهائياً للسيارة والطاوات مقابل ' + targetPrice.toLocaleString() + ' كوينز!');
            updateHudBadges();
            if (activeModalKey === 'garage') openModal('garage');
        }
        function upgradeGaragePart(partKey) {
            const curLvl = garageUpgrades[partKey] || 0;
            if (curLvl >= 100) return;
            const cost = (curLvl + 1) * 10000;
            if (coins < cost) {
                showHudAlert('⚠️ تحتاج إلى ' + cost.toLocaleString() + ' كوينز للترقية!');
                return;
            }
            playClickSound();
            coins -= cost;
            garageUpgrades[partKey] = curLvl + 1;
            if (partKey === 'exhaustSound') {
                playBackfireSound(1.2, true);
            }
            updateHudBadges();
            if (activeModalKey === 'garage') openModal('garage');
        }
        function openModal(key) {
            playClickSound();
            const sec = modalSections[key];
            if (!sec) return;
            activeModalKey = key;
            document.getElementById('modalTitle').innerText = sec.title;
            const modalCardEl = document.querySelector('.modal-card');
            const modalHeaderEl = document.querySelector('.modal-header');
            const topMenuBarEl = document.getElementById('topMenuBar');
            const categoryThemes = {
                garage: {
                    cardBg: 'linear-gradient(145deg, rgba(120, 53, 15, 0.95), rgba(69, 26, 3, 0.95), rgba(15, 23, 42, 0.96))',
                    cardBorder: 'rgba(251, 191, 36, 0.78)',
                    cardShadow: '0 0 42px rgba(245, 158, 11, 0.42)',
                    headerBg: 'linear-gradient(90deg, rgba(180, 83, 9, 0.92), rgba(120, 53, 15, 0.95))'
                },
                showroom: {
                    cardBg: 'linear-gradient(145deg, rgba(127, 29, 29, 0.95), rgba(76, 5, 25, 0.95), rgba(15, 23, 42, 0.96))',
                    cardBorder: 'rgba(248, 113, 113, 0.78)',
                    cardShadow: '0 0 42px rgba(239, 68, 68, 0.45)',
                    headerBg: 'linear-gradient(90deg, rgba(185, 28, 28, 0.92), rgba(136, 19, 55, 0.95))'
                },
                maps: {
                    cardBg: 'linear-gradient(145deg, rgba(6, 78, 59, 0.95), rgba(19, 78, 74, 0.95), rgba(15, 23, 42, 0.96))',
                    cardBorder: 'rgba(52, 211, 153, 0.78)',
                    cardShadow: '0 0 42px rgba(16, 185, 129, 0.42)',
                    headerBg: 'linear-gradient(90deg, rgba(4, 120, 87, 0.92), rgba(17, 94, 89, 0.95))'
                },
                shop: {
                    cardBg: 'linear-gradient(145deg, rgba(12, 74, 110, 0.95), rgba(30, 58, 138, 0.95), rgba(15, 23, 42, 0.96))',
                    cardBorder: 'rgba(34, 211, 238, 0.82)',
                    cardShadow: '0 0 42px rgba(6, 182, 212, 0.48)',
                    headerBg: 'linear-gradient(90deg, rgba(14, 116, 144, 0.92), rgba(30, 64, 175, 0.95))'
                },
                settings: {
                    cardBg: 'linear-gradient(145deg, rgba(88, 28, 135, 0.95), rgba(46, 16, 101, 0.95), rgba(15, 23, 42, 0.96))',
                    cardBorder: 'rgba(192, 132, 252, 0.78)',
                    cardShadow: '0 0 42px rgba(168, 85, 247, 0.45)',
                    headerBg: 'linear-gradient(90deg, rgba(126, 34, 206, 0.92), rgba(109, 40, 217, 0.95))'
                }
            };
            const activeTheme = categoryThemes[key] || categoryThemes.garage;
            if (modalCardEl) {
                modalCardEl.style.background = activeTheme.cardBg;
                modalCardEl.style.borderColor = activeTheme.cardBorder;
                modalCardEl.style.boxShadow = activeTheme.cardShadow;
            }
            if (modalHeaderEl) {
                modalHeaderEl.style.background = activeTheme.headerBg;
                modalHeaderEl.style.borderBottomColor = activeTheme.cardBorder;
            }
            if (topMenuBarEl) {
                topMenuBarEl.style.borderColor = activeTheme.cardBorder;
                topMenuBarEl.style.boxShadow = activeTheme.cardShadow;
            }
            updateHudBadges();
            if (key === 'garage') {
                const upgradeMeta = [
                    { key: 'engine', title: 'ترقية المكينة (Engine Power)', desc: 'يرفع قوة المحرك والتسارع والسرعة القصوى لتسلق المرتفعات.', color: '#f59e0b' },
                    { key: 'armor', title: 'ترقية قوة وتحمل السيارة (Vehicle Armor / Durability)', desc: 'يزيد صلابة الشاسيه والهيكل لتقليل أضرار الصدمات.', color: '#10b981' },
                    { key: 'exhaustSound', title: 'ترقية صوت المحرك وطلاق الشكمان (Engine Sound & Exhaust Pops)', desc: 'يعزز هدير المحرك التيربو وطلقات الشكمان النارية عند القيادة.', color: '#06b6d4' }
                ];
                const activeColorHex = previewCustomColor || carBodyColor;
                const activeColorPrice = getStandaloneColorPrice(activeColorHex);
                const canAffordColor = coins >= activeColorPrice;
                const isCustomUnlocked = isStandaloneColorUnlocked(activeColorHex);
                const isCustomEquipped = isCustomUnlocked && !previewCustomColor && carBodyColor.toLowerCase() === activeColorHex.toLowerCase();
                const renderPresetRowBtn = p => {
                    const pPrice = p.price !== undefined ? p.price : CAR_COLOR_PRICE;
                    const canAffordPreset = coins >= pPrice;
                    const isUnlocked = Boolean(p.isDefaultFree) || isStandaloneColorUnlocked(p.body);
                    const isEquipped = isUnlocked && !previewCustomColor && carBodyColor.toLowerCase() === p.body.toLowerCase();
                    const isPreviewing = Boolean(previewCustomColor) && activeColorHex.toLowerCase() === p.body.toLowerCase();
                    const badgeLabel = isEquipped ? '✓ مُفعل' : (isUnlocked ? (p.isDefaultFree ? 'مجاني (تفعيل)' : 'اختيار') : pPrice.toLocaleString() + ' كوينز');
                    const badgeBg = isEquipped ? '#10b981' : (isUnlocked ? '#0ea5e9' : (canAffordPreset ? (p.isDualNeon ? 'linear-gradient(90deg,#fbbf24,#f97316)' : (p.isStarryGalaxy ? 'linear-gradient(90deg,#818cf8,#fbbf24)' : '#f59e0b')) : '#334155'));
                    const badgeColor = (isEquipped || isUnlocked || canAffordPreset) ? '#020617' : '#94a3b8';
                    const dotStyle = p.isDualNeon
                        ? 'width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,' + p.c1 + ',' + p.c2 + ');display:inline-block;border:1.5px solid #fff;'
                        : p.isStarryGalaxy
                        ? 'width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#ffffff,' + p.body + ' 60%,' + p.roof + ');display:inline-flex;align-items:center;justify-content:center;border:1.5px solid #fff;font-size:8px;'
                        : 'width:14px;height:14px;border-radius:50%;background:' + p.body + ';display:inline-block;border:1px solid #fff;';
                    const dotContent = p.isStarryGalaxy ? '✨' : '';
                    const borderCol = isPreviewing ? '#fbbf24' : (isEquipped ? '#10b981' : (p.isDualNeon ? '#d946ef' : (p.isStarryGalaxy ? '#6366f1' : '#334155')));
                    return '<div style="display:flex;align-items:center;gap:6px;padding:4px 6px 4px 10px;border-radius:10px;background:' + (isPreviewing ? '#1e293b' : '#020617') + ';border:2px solid ' + borderCol + ';color:#fff;font-size:12px;font-weight:bold;">' +
                        '<button type="button" title="معاينة اللون مجاناً بدون خصم كوينز" onclick="event.stopPropagation();previewStandalonePresetColor(\\'' + p.body + '\\', \\'' + p.roof + '\\')" style="display:flex;align-items:center;gap:6px;background:transparent;border:none;color:#fff;font-size:12px;font-weight:bold;cursor:pointer;padding:3px 4px;">' +
                            '<span style="' + dotStyle + '">' + dotContent + '</span>' +
                            '<span>' + p.name + '</span>' +
                        '</button>' +
                        '<button type="button" onclick="event.stopPropagation();buyOrEquipStandaloneCarColor(\\'' + p.body + '\\', \\'' + p.roof + '\\', ' + pPrice + ')" style="background:' + badgeBg + ';border:1px solid rgba(251,191,36,0.5);color:' + badgeColor + ';padding:4px 9px;border-radius:7px;font-size:11px;font-weight:900;cursor:pointer;">' +
                            badgeLabel +
                        '</button>' +
                    '</div>';
                };
                const standardColorButtonsHtml = COLOR_PRESETS.filter(p => !p.isStarryGalaxy && !p.isDualNeon).map(renderPresetRowBtn).join('');
                const starryColorButtonsHtml = COLOR_PRESETS.filter(p => p.isStarryGalaxy).map(renderPresetRowBtn).join('');
                const neonColorButtonsHtml = COLOR_PRESETS.filter(p => p.isDualNeon).map(renderPresetRowBtn).join('');
                const upgradesHtml = upgradeMeta.map(u => {
                    const lvl = garageUpgrades[u.key] || 0;
                    const isMax = lvl >= 100;
                    const nextCost = (lvl + 1) * 10000;
                    const canAfford = coins >= nextCost;
                    return '<div class="item-card" style="flex-direction:column;align-items:stretch;gap:10px;">' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                            '<strong style="font-size:14px;color:#fff;">' + u.title + '</strong>' +
                            '<span style="background:#1e293b;color:' + (isMax ? '#34d399' : '#fbbf24') + ';padding:3px 10px;border-radius:8px;font-weight:900;font-size:12px;">' + (isMax ? 'MAX (100/100)' : 'Lv. ' + lvl + ' / 100') + '</span>' +
                        '</div>' +
                        '<div style="font-size:12px;color:#94a3b8;">' + u.desc + '</div>' +
                        '<div style="width:100%;height:10px;background:#0f172a;border:1px solid #1e293b;border-radius:999px;overflow:hidden;">' +
                            '<div style="width:' + lvl + '%;height:100%;background:' + u.color + ';transition:width 0.2s;"></div>' +
                        '</div>' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                            '<span style="font-size:12px;color:#fbbf24;font-weight:bold;">' + (isMax ? 'تم الوصول للحد الأقصى (MAX)' : 'سعر المستوى ' + (lvl + 1) + ': ' + nextCost.toLocaleString() + ' كوينز') + '</span>' +
                            '<button ' + (isMax || !canAfford ? 'disabled' : '') + ' onclick="upgradeGaragePart(\\'' + u.key + '\\')" style="background:' + (isMax ? '#064e3b' : (canAfford ? '#f59e0b' : '#1e293b')) + ';color:' + (isMax ? '#34d399' : (canAfford ? '#020617' : '#64748b')) + ';border:none;padding:8px 16px;border-radius:10px;font-weight:900;font-size:12px;cursor:' + (isMax || !canAfford ? 'not-allowed' : 'pointer') + ';">' +
                                (isMax ? 'MAX' : 'ترقية (+' + nextCost.toLocaleString() + ' كوينز)') +
                            '</button>' +
                        '</div>' +
                    '</div>';
                }).join('');
                document.getElementById('modalBody').innerHTML =
                    '<div class="item-card" style="flex-direction:column;align-items:stretch;gap:12px;">' +
                        '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;">' +
                            '<canvas id="garagePreviewCanvas" width="280" height="110" style="width:280px;height:110px;border-radius:12px;border:1px solid #334155;background:#020617;flex-shrink:0;"></canvas>' +
                            '<div style="flex:1;min-width:200px;">' +
                                '<strong style="color:#38bdf8;font-size:14px;display:block;">🎨 أقسام طلاء السيارة والطاوات (3 فئات منفصلة مع دوائر اختيار مخصصة)</strong>' +
                                '<span style="color:#fbbf24;font-size:11px;font-weight:bold;display:block;margin-top:3px;">أحمر ناري (مجاني افتراضي) · الألوان القياسية وأحمر كاندي: 500 كوينز · ألوان النجوم والنيون المزدوج: 8,000 كوينز</span>' +
                            '</div>' +
                        '</div>' +
                        '<!-- ROW 1: STANDARD PAINTS (500 Coins) + Custom Color Picker Circle + Default Color Option Directly Below It -->' +
                        '<div style="background:#020617;border:1px solid #334155;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px;">' +
                            '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:8px;">' +
                                '<div>' +
                                    '<strong style="color:#f8fafc;font-size:12px;display:block;">1️⃣ الألوان القياسية واللامعة (Standard Paints · 500 كوينز)</strong>' +
                                    '<span style="color:#94a3b8;font-size:10px;">تشمل أحمر كاندي الفلزي والألوان القياسية اللامعة للسيارة والطاوات</span>' +
                                '</div>' +
                                '<div style="display:flex;flex-direction:column;gap:6px;align-items:stretch;">' +
                                    '<div style="display:flex;align-items:center;gap:8px;background:#0f172a;padding:5px 10px;border-radius:10px;border:1px solid #475569;">' +
                                        '<label title="دائرة اختيار اللون المخصص - معاينة مجانية" style="position:relative;width:32px;height:32px;border-radius:50%;padding:3px;background:conic-gradient(from 0deg,#ef4444,#f59e0b,#eab308,#22c55e,#06b6d4,#3b82f6,#8b5cf6,#ec4899,#ef4444);cursor:pointer;display:inline-block;">' +
                                            '<span id="customColorInnerCircle" style="display:block;width:100%;height:100%;border-radius:50%;background:' + activeColorHex + ';border:2px solid #fff;"></span>' +
                                            '<input type="color" value="' + activeColorHex + '" oninput="previewStandaloneCustomColor(this.value)" onchange="previewStandaloneCustomColor(this.value)" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;" />' +
                                        '</label>' +
                                        '<div style="display:flex;flex-direction:column;gap:2px;">' +
                                            '<span style="font-size:10px;color:#bae6fd;font-weight:bold;">دائرة اختيار اللون المخصص (معاينة مجانية)</span>' +
                                            '<button id="customColorBuyBtn" onclick="buyStandaloneCustomColor()" style="background:#f59e0b;color:#020617;border:none;padding:4px 8px;border-radius:7px;font-weight:900;font-size:10px;cursor:pointer;">' +
                                                (isCustomEquipped ? '✓ مُفعل' : (isCustomUnlocked ? 'اختيار' : activeColorPrice.toLocaleString() + ' كوينز')) +
                                            '</button>' +
                                        '</div>' +
                                    '</div>' +
                                    '<button type="button" onclick="restoreStandaloneDefaultColor()" style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:' + (!previewCustomColor && carBodyColor.toLowerCase() === '#ff001e' ? 'rgba(16,185,129,0.2)' : '#0f172a') + ';border:1px solid ' + (!previewCustomColor && carBodyColor.toLowerCase() === '#ff001e' ? '#34d399' : '#f59e0b') + ';color:' + (!previewCustomColor && carBodyColor.toLowerCase() === '#ff001e' ? '#6ee7b7' : '#fde68a') + ';padding:6px 10px;border-radius:10px;font-size:11px;font-weight:900;cursor:pointer;">' +
                                        '<span style="display:flex;align-items:center;gap:6px;">' +
                                            '<span style="width:12px;height:12px;border-radius:50%;background:#ff001e;border:1px solid #fff;display:inline-block;"></span>' +
                                            '<span>اللون الافتراضي: أحمر ناري (استعادة اللون الافتراضي)</span>' +
                                        '</span>' +
                                        '<span style="background:#020617;padding:2px 6px;border-radius:6px;font-size:10px;">' + (!previewCustomColor && carBodyColor.toLowerCase() === '#ff001e' ? '✓ مُفعل (مجاني)' : 'تفعيل مجاني') + '</span>' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                            '<div style="display:flex;flex-wrap:wrap;gap:8px;">' + standardColorButtonsHtml + '</div>' +
                        '</div>' +
                        '<!-- ROW 2: STARRY GALAXY PAINTS (8,000 Coins) + Custom Starry Color Picker Circle -->' +
                        '<div style="background:#020617;border:1px solid #6366f1;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px;">' +
                            '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">' +
                                '<div>' +
                                    '<strong style="color:#c7d2fe;font-size:12px;display:block;">2️⃣ ألوان النجوم والفضائي (Starry Galaxy Paints · 8,000 كوينز)</strong>' +
                                    '<span style="color:#a5b4fc;font-size:10px;">طلاء مجري مرصع بذرات نجوم متلألئة وبريق كوني داخل هيكل السيارة والطاوات</span>' +
                                '</div>' +
                                '<div style="display:flex;align-items:center;gap:8px;background:#0f172a;padding:5px 10px;border-radius:10px;border:1px solid #6366f1;">' +
                                    '<label title="دائرة اختيار لون النجوم المخصص - معاينة مجانية" style="position:relative;width:32px;height:32px;border-radius:50%;padding:3px;background:conic-gradient(from 0deg,#c90035,#7b2cbf,#0038a8,#00b4d8,#f72585,#c90035);cursor:pointer;display:inline-block;">' +
                                        '<span id="customStarryInnerCircle" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:50%;background:' + customStarryHex + ';border:2px solid #fff;font-size:10px;">✨</span>' +
                                        '<input type="color" value="' + customStarryHex + '" oninput="previewStandaloneStarryCustom(this.value)" onchange="previewStandaloneStarryCustom(this.value)" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;" />' +
                                    '</label>' +
                                    '<div style="display:flex;flex-direction:column;gap:2px;">' +
                                        '<span style="font-size:10px;color:#c7d2fe;font-weight:bold;">دائرة اختيار لون النجوم المخصص (معاينة مجانية)</span>' +
                                        '<button onclick="buyStandaloneStarryCustom()" style="background:linear-gradient(90deg,#6366f1,#f59e0b);color:#020617;border:none;padding:4px 8px;border-radius:7px;font-weight:900;font-size:10px;cursor:pointer;">8,000 كوينز</button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div style="display:flex;flex-wrap:wrap;gap:8px;">' + starryColorButtonsHtml + '</div>' +
                        '</div>' +
                        '<!-- ROW 3: DUAL NEON PAINTS (8,000 Coins) + Custom Neon Color Picker Circle -->' +
                        '<div style="background:#020617;border:1px solid #d946ef;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px;">' +
                            '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;">' +
                                '<div>' +
                                    '<strong style="color:#f5d0fe;font-size:12px;display:block;">3️⃣ ألوان النيون المزدوجة المتحركة (Dual Neon Paints · 8,000 كوينز)</strong>' +
                                    '<span style="color:#f0abfc;font-size:10px;">تدرج نيون مزدوج نابض ومتحرك داخل هيكل السيارة والطاوات بدون أشعة خارجية</span>' +
                                '</div>' +
                                '<div style="display:flex;align-items:center;gap:8px;background:#0f172a;padding:5px 10px;border-radius:10px;border:1px solid #d946ef;">' +
                                    '<label title="دائرة اختيار لون النيون المخصص (1) - معاينة مجانية" style="position:relative;width:30px;height:30px;border-radius:50%;padding:2px;background:linear-gradient(135deg,' + customNeonColorA + ',' + customNeonColorB + ');cursor:pointer;display:inline-block;">' +
                                        '<span id="customNeonInnerCircleA" style="display:block;width:100%;height:100%;border-radius:50%;background:' + customNeonColorA + ';border:1.5px solid #fff;"></span>' +
                                        '<input type="color" value="' + customNeonColorA + '" oninput="previewStandaloneNeonCustom(this.value, null)" onchange="previewStandaloneNeonCustom(this.value, null)" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;" />' +
                                    '</label>' +
                                    '<label title="دائرة اختيار لون النيون المخصص (2) - معاينة مجانية" style="position:relative;width:30px;height:30px;border-radius:50%;padding:2px;background:linear-gradient(135deg,' + customNeonColorB + ',' + customNeonColorA + ');cursor:pointer;display:inline-block;">' +
                                        '<span id="customNeonInnerCircleB" style="display:block;width:100%;height:100%;border-radius:50%;background:' + customNeonColorB + ';border:1.5px solid #fff;"></span>' +
                                        '<input type="color" value="' + customNeonColorB + '" oninput="previewStandaloneNeonCustom(null, this.value)" onchange="previewStandaloneNeonCustom(null, this.value)" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;" />' +
                                    '</label>' +
                                    '<div style="display:flex;flex-direction:column;gap:2px;">' +
                                        '<span style="font-size:10px;color:#f5d0fe;font-weight:bold;">دائرة اختيار لون النيون المخصص (معاينة مجانية)</span>' +
                                        '<button onclick="buyStandaloneNeonCustom()" style="background:linear-gradient(90deg,#d946ef,#fbbf24);color:#020617;border:none;padding:4px 8px;border-radius:7px;font-weight:900;font-size:10px;cursor:pointer;">8,000 كوينز</button>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div style="display:flex;flex-wrap:wrap;gap:8px;">' + neonColorButtonsHtml + '</div>' +
                        '</div>' +
                    '</div>' +
                    upgradesHtml;
            } else if (key === 'shop') {
                document.getElementById('modalBody').innerHTML =
                    '<div class="item-card">' +
                        '<div><strong>✈️ أجنحة الطيران النادرة (Flight Wings)</strong><div style="font-size:12px;color:#94a3b8;margin-top:4px;">المملوك حالياً: ×' + flightWingsCount + ' · السعر: 1,200 كوينز</div></div>' +
                        '<button onclick="buyShopItemStandalone(\\'wings\\', 1200)" style="background:#06b6d4;color:#020617;border:none;padding:8px 16px;border-radius:10px;font-weight:900;cursor:pointer;">شراء (+1)</button>' +
                    '</div>' +
                    '<div class="item-card">' +
                        '<div><strong>🔧 عدة إصلاح السيارة 100% (Repair Kit)</strong><div style="font-size:12px;color:#94a3b8;margin-top:4px;">المملوك حالياً: ×' + repairKitsCount + ' · السعر: 600 كوينز</div></div>' +
                        '<button onclick="buyShopItemStandalone(\\'repair\\', 600)" style="background:#10b981;color:#020617;border:none;padding:8px 16px;border-radius:10px;font-weight:900;cursor:pointer;">شراء (+1)</button>' +
                    '</div>' +
                    '<div class="item-card">' +
                        '<div><strong>🔥 شحنة نيترو ووقود 100% (Nitro & Fuel)</strong><div style="font-size:12px;color:#94a3b8;margin-top:4px;">تعبئة فورية للوقود والنيترو · السعر: 400 كوينز</div></div>' +
                        '<button onclick="buyShopItemStandalone(\\'nitro\\', 400)" style="background:#f59e0b;color:#020617;border:none;padding:8px 16px;border-radius:10px;font-weight:900;cursor:pointer;">شراء وتعبئة</button>' +
                    '</div>';
            } else if (key === 'settings') {
                document.getElementById('modalBody').innerHTML =
                    '<div class="item-card" style="flex-direction:column;align-items:stretch;gap:8px;">' +
                        '<div style="display:flex;justify-content:space-between;color:#fcd34d;font-weight:bold;">' +
                            '<span>مستوى الصوت الرئيسي (Master Volume)</span>' +
                            '<span id="masterVolLabel">' + masterVolume + '%</span>' +
                        '</div>' +
                        '<input type="range" min="0" max="100" value="' + masterVolume + '" oninput="setMasterVol(this.value)" style="width:100%;accent-color:#fbbf24;cursor:pointer;" />' +
                    '</div>' +
                    '<div class="item-card" style="flex-direction:column;align-items:stretch;gap:8px;">' +
                        '<div style="display:flex;justify-content:space-between;color:#6ee7b7;font-weight:bold;">' +
                            '<span>أصوات الطبيعة والبيئة (Nature SFX)</span>' +
                            '<span id="natureVolLabel">' + natureVolume + '%</span>' +
                        '</div>' +
                        '<input type="range" min="0" max="100" value="' + natureVolume + '" oninput="setNatureVol(this.value)" style="width:100%;accent-color:#10b981;cursor:pointer;" />' +
                    '</div>' +
                    '<div class="item-card" style="flex-direction:column;align-items:stretch;gap:8px;">' +
                        '<div style="display:flex;justify-content:space-between;color:#67e8f9;font-weight:bold;">' +
                            '<span>أصوات المحرك والمركبة (Engine SFX)</span>' +
                            '<span id="engineVolLabel">' + engineVolume + '%</span>' +
                        '</div>' +
                        '<input type="range" min="0" max="100" value="' + engineVolume + '" oninput="setEngineVol(this.value)" style="width:100%;accent-color:#22d3ee;cursor:pointer;" />' +
                    '</div>' +
                    '<div class="item-card" style="flex-direction:column;align-items:stretch;gap:8px;">' +
                        '<div style="display:flex;justify-content:space-between;color:#f8fafc;font-weight:bold;">' +
                            '<span>الجودة الرسومية (Graphics Quality)</span>' +
                            '<span id="qualityCurrentLabel" style="color:#fbbf24;">' + graphicsQuality + '</span>' +
                        '</div>' +
                        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                            ['Low', 'Medium', 'High', 'Ultra'].map(q => '<button class="menu-btn" style="' + (graphicsQuality === q ? 'background:#f59e0b;color:#020617;border-color:#fbbf24;' : '') + '" onclick="setQualityOption(\\'' + q + '\\')">' + q + '</button>').join('') +
                        '</div>' +
                    '</div>' +
                    '<div class="item-card" style="flex-direction:column;align-items:stretch;gap:8px;">' +
                        '<div style="display:flex;justify-content:space-between;color:#f8fafc;font-weight:bold;">' +
                            '<span>محدد الفريمات (FPS Limit)</span>' +
                            '<span id="fpsCurrentLabel" style="color:#22d3ee;">' + fpsLimit + ' FPS</span>' +
                        '</div>' +
                        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                            [30, 60, 90, 120, 144].map(f => '<button class="menu-btn" style="' + (Number(fpsLimit) === f ? 'background:#06b6d4;color:#020617;border-color:#22d3ee;' : '') + '" onclick="setFpsOption(' + f + ')">' + f + ' FPS</button>').join('') +
                        '</div>' +
                    '</div>' +
                    '<div class="item-card" style="justify-content:flex-end;border-color:#2563eb;">' +
                        '<button id="saveSettingsBtn" onclick="saveSettingsToStorage()" style="background:linear-gradient(90deg,#2563eb,#0284c7);color:#ffffff;border:1px solid #60a5fa;padding:11px 22px;border-radius:12px;font-weight:bold;cursor:pointer;font-size:13px;">💾 حفظ الإعدادات (Save Settings)</button>' +
                    '</div>';
            } else {
                document.getElementById('modalBody').innerHTML = sec.items.map(t => '<div class="item-card"><span>' + t + '</span></div>').join('');
            }
            document.getElementById('modalOverlay').classList.add('active');
        }
        function closeModal() {
            playClickSound();
            if (activeModalKey === 'settings') {
                committedSettings = {
                    masterVolume: masterVolume,
                    natureVolume: natureVolume,
                    sfxVolume: engineVolume,
                    fpsLimit: fpsLimit,
                    quality: graphicsQuality
                };
                try {
                    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(committedSettings));
                } catch (e) {}
            }
            activeModalKey = null;
            isPausedForShop = false;
            previewCustomColor = null;
            previewCustomRoofColor = null;
            document.getElementById('modalOverlay').classList.remove('active');
            updateHudBadges();
        }
        const btnGas = document.getElementById('btnGas');
        const btnBrake = document.getElementById('btnBrake');
        const btnNitro = document.getElementById('btnNitro');
        btnGas.addEventListener('touchstart', () => { ensureAudio(); keys.gas = true; });
        btnGas.addEventListener('touchend', () => keys.gas = false);
        btnGas.addEventListener('mousedown', () => { ensureAudio(); keys.gas = true; });
        btnGas.addEventListener('mouseup', () => keys.gas = false);
        btnBrake.addEventListener('touchstart', () => { ensureAudio(); keys.brake = true; });
        btnBrake.addEventListener('touchend', () => keys.brake = false);
        btnBrake.addEventListener('mousedown', () => { ensureAudio(); keys.brake = true; });
        btnBrake.addEventListener('mouseup', () => keys.brake = false);
        btnNitro.addEventListener('touchstart', () => { if (!keys.nitro) playNitroSound(); keys.nitro = true; });
        btnNitro.addEventListener('touchend', () => keys.nitro = false);
        btnNitro.addEventListener('mousedown', () => { if (!keys.nitro) playNitroSound(); keys.nitro = true; });
        btnNitro.addEventListener('mouseup', () => keys.nitro = false);
        function updatePhysics(deltaTime) {
            if (isPausedForShop || activeModalKey !== null) {
                updateHudBadges();
                return;
            }
            const dt = Math.min(Math.max(typeof deltaTime === 'number' && Number.isFinite(deltaTime) ? deltaTime : (1 / 60), 0.001), 0.05);
            const dtScale = dt * 60;
            const hasFuel = fuel > 0;
            const engBonus = 1 + Math.min(100, Math.max(0, garageUpgrades.engine || 0)) * 0.0035;
            const rearWheelWorldX = worldX + car.x + 20;
            const frontWheelWorldX = worldX + car.x + car.width - 20;
            const rearStoneLift = getStoneWheelLiftAtWorldX(rearWheelWorldX);
            const frontStoneLift = getStoneWheelLiftAtWorldX(frontWheelWorldX);
            const onRockContact = !car.isFlying && (rearStoneLift > 0.15 || frontStoneLift > 0.15);
            // Re-calibrated driving speeds, natural reverse force, and distinct Turbo velocity jump (100% frame-rate independent via dt)
            const rockGripBoost = onRockContact ? 1.28 : 1.0;
            const rockClimbTorque = onRockContact ? (28.0 * engBonus) : 0;

            const maxGasSpeed = 142 * engBonus;
            const maxNitroSpeed = 256 * engBonus;
            const maxRevSpeed = -58 * engBonus;
            const baseEngineAccel = (118 * engBonus + rockClimbTorque) * rockGripBoost;
            const turboMultiplier = 2.25;
            const turboSurgeForce = 92 * engBonus;
            const reverseAccel = (68.0 * engBonus + rockClimbTorque * 0.5) * rockGripBoost;
            if (keys.nitro && hasFuel) {
                if (speed < 0) {
                    speed += 165 * engBonus * dt;
                } else {
                    const turboRatio = Math.min(1, Math.max(0, speed / maxNitroSpeed));
                    const turboTorqueCurve = 1 - turboRatio * 0.22;
                    speed = Math.min(maxNitroSpeed, speed + (baseEngineAccel * turboMultiplier + turboSurgeForce) * turboTorqueCurve * dt);
                }
            } else if (keys.gas && hasFuel) {
                if (speed < 0) {
                    speed += 130 * engBonus * dt;
                } else if (speed < maxGasSpeed) {
                    const gasRatio = Math.min(1, Math.max(0, speed / maxGasSpeed));
                    const gasTorqueCurve = 1 - gasRatio * 0.24;
                    speed = Math.min(maxGasSpeed, speed + baseEngineAccel * gasTorqueCurve * dt);
                } else {
                    // Turbo 2x was released while still holding Gas: DO NOT instantly drop/reset speed!
                    // Maintain forward momentum and gradually coast down toward normal cruising speed:
                    speed = Math.max(maxGasSpeed, speed * Math.pow(0.9975, dtScale) - 16.0 * dt);
                }
            } else if (keys.brake) {
                if (speed > 0.5) {
                    // Smooth progressive braking with enhanced tire grip
                    speed = Math.max(0, speed * Math.pow(0.988, dtScale) - 88.0 * rockGripBoost * dt);
                } else if (hasFuel) {
                    const revRatio = Math.min(1, Math.max(0, Math.abs(speed) / Math.abs(maxRevSpeed)));
                    const revTorqueCurve = 1 - revRatio * 0.25;
                    speed = Math.max(maxRevSpeed, speed - reverseAccel * revTorqueCurve * dt);
                } else {
                    speed *= Math.pow(0.985, dtScale);
                }
            } else {
                // Vehicle Inertia & Gradual Coasting Deceleration when Turbo 2x, Gas, or Reverse is released:
                // Maintain forward/backward momentum with realistic linear velocity decay until naturally stopping
                speed *= Math.pow(0.9968, dtScale);
                const coastStep = 14.0 * dt;
                if (speed > coastStep) {
                    speed -= coastStep;
                } else if (speed < -coastStep) {
                    speed += coastStep;
                } else {
                    speed = 0;
                }
            }
            if (worldX > 160 && hasFuel) {
                const drainPerSec = keys.nitro ? 4.2 : keys.gas ? 3.2 : keys.brake ? 1.4 : 0.7;
                fuel = Math.max(0, fuel - drainPerSec * dt);
            }
            worldX = Math.max(0, worldX + speed * 4.5 * dt);
            spawnBalancedPickupsAhead();
            for (let i = 0; i < skyClouds.length; i++) {
                const c = skyClouds[i];
                c.x -= (c.speed + Math.max(0, speed * 0.012)) * dtScale;
                if (c.x + c.w < -40) {
                    c.x = canvas.width + 60;
                }
            }
            for (let i = trackCoins.length - 1; i >= 0; i--) {
                const tc = trackCoins[i];
                const screenX = tc.x - worldX;
                if (!tc.collected && Math.abs(screenX - (car.x + car.width * 0.5)) < 48) {
                    tc.collected = true;
                    coins += 25; // Strictly and exclusively 25 value per coin!
                    playCoinSound();
                }
            }
            for (let i = fuelCanisters.length - 1; i >= 0; i--) {
                const fc = fuelCanisters[i];
                const screenX = fc.x - worldX;
                if (!fc.collected && Math.abs(screenX - (car.x + car.width * 0.5)) < 48) {
                    fc.collected = true;
                    fuel = 100;
                }
            }
            for (let i = repairKits.length - 1; i >= 0; i--) {
                const rk = repairKits[i];
                const screenX = rk.x - worldX;
                if (!rk.collected && Math.abs(screenX - (car.x + car.width * 0.5)) < 48) {
                    rk.collected = true;
                }
            }
            if (audioCtx && engineSource && engineFilter && engineGain) {
                const now = audioCtx.currentTime;
                const ratio = Math.min(1.5, Math.abs(speed) / 100);
                const idleBreath = ratio < 0.05 ? Math.sin(now * 3.1) * 0.03 : 0;
                const rpm = 0.32 + idleBreath + ratio * 0.85 + (keys.gas ? 0.35 : 0) + (keys.nitro ? 0.5 : 0);
                // Full-Bodied Audible Engine Sample Playback Rate + Synthesizer Frequencies
                engineSource.playbackRate.setTargetAtTime(0.92 + rpm * 0.65, now, 0.055);
                if (enginePrimaryOsc && engineSubOsc) {
                    const pFreq = 56 + rpm * 58;
                    enginePrimaryOsc.frequency.setTargetAtTime(pFreq, now, 0.06);
                    engineSubOsc.frequency.setTargetAtTime(pFreq * 0.66, now, 0.06);
                }
                engineFilter.frequency.setTargetAtTime(390 + rpm * 380 + (keys.gas ? 180 : 0) + (keys.nitro ? 260 : 0), now, 0.06);
                const isPedal = keys.gas || keys.nitro || keys.brake;
                const rawLevel = isPedal ? (keys.nitro ? 0.88 : 0.80) : Math.max(0.52, ratio * 0.64);
                const targetGain = engineVolume <= 0 ? 0.0001 : Math.max(0.0001, getEngineGain(rawLevel));
                engineGain.gain.setTargetAtTime(targetGain, now, 0.06);
            }
            // Logical Exhaust Backfire / Pop Shots: Trigger ONLY when actively moving & accelerating (Muted when stationary/idle!)
            const activeGasNow = (keys.gas || keys.nitro) && hasFuel;
            const isMovingNow = Math.abs(speed) > 18;
            if (isMovingNow && hasFuel) {
                if ((activeGasNow && !wasGasActive && Math.abs(speed) > 25) ||
                    (!activeGasNow && wasGasActive && Math.abs(speed) > 58) ||
                    ((keys.nitro || (keys.gas && Math.abs(speed) > 72)) && Math.random() < 0.042 * dtScale)) {
                    backfireFlash = 1.0;
                    playBackfireSound(keys.nitro ? 1.2 : 0.95);
                }
            } else {
                backfireFlash = 0;
            }
            wasGasActive = activeGasNow;
            if (backfireFlash > 0) backfireFlash = Math.max(0, backfireFlash - 5.4 * dt);
            // Re-evaluate wheel world X and rock collision lift AFTER worldX integration so wheel climbing is 100% frame-accurate with rendered rocks!
            const restCarY = canvas.height - 180;
            const absSpeed = Math.abs(speed);
            const nowSecPhys = Date.now() * 0.001;
            const latestRearWheelWorldX = worldX + car.x + 20;
            const latestFrontWheelWorldX = worldX + car.x + car.width - 20;
            const latestRearStoneLift = getStoneWheelLiftAtWorldX(latestRearWheelWorldX);
            const latestFrontStoneLift = getStoneWheelLiftAtWorldX(latestFrontWheelWorldX);
            const rearBridgeLift = getBridgeWheelLiftAtWorldX(latestRearWheelWorldX, nowSecPhys);
            const frontBridgeLift = getBridgeWheelLiftAtWorldX(latestFrontWheelWorldX, nowSecPhys);
            const rearHillLift = getRoadHillLiftAtWorldX(latestRearWheelWorldX);
            const frontHillLift = getRoadHillLiftAtWorldX(latestFrontWheelWorldX);
            const rearSurfaceLift = Math.max(latestRearStoneLift, rearBridgeLift, rearHillLift);
            const frontSurfaceLift = Math.max(latestFrontStoneLift, frontBridgeLift, frontHillLift);

            if (car.isFlying) {
                const targetFlyY = canvas.height - 320 + Math.sin(Date.now() * 0.003) * 10;
                car.y += (targetFlyY - car.y) * (1 - Math.pow(1 - 0.08, dtScale));
                car.vy = 0;
                car.isGrounded = false;
                car.rearGrounded = false;
                car.frontGrounded = false;
                car.rearWheelDisp += (0 - car.rearWheelDisp) * (1 - Math.pow(1 - 0.2, dtScale));
                car.frontWheelDisp += (0 - car.frontWheelDisp) * (1 - Math.pow(1 - 0.2, dtScale));
                car.suspensionOffset *= Math.pow(0.85, dtScale);
                car.suspensionVelocity *= Math.pow(0.8, dtScale);
                car.angle *= Math.pow(0.88, dtScale);
            } else {
                // Separate Ground-Check Logic & Dynamic Hill Climb Racing 2 Rock Suspension Response
                const prevRearDisp = car.rearWheelDisp || 0;
                const prevFrontDisp = car.frontWheelDisp || 0;

                car.vy = 0;
                car.airTime = 0;
                car.peakAirVy = 0;
                car.rearGrounded = true;
                car.frontGrounded = true;
                car.isGrounded = true;

                // 100% Flush Per-Wheel Surface Tracking over rocks & bridges (Zero air gap or descent lag!)
                const targetRearDisp = Math.max(latestRearStoneLift, rearBridgeLift);
                car.rearWheelVel = 0;
                car.rearWheelDisp = Math.max(0, Math.min(14.5, targetRearDisp));

                const targetFrontDisp = Math.max(latestFrontStoneLift, frontBridgeLift);
                car.frontWheelVel = 0;
                car.frontWheelDisp = Math.max(0, Math.min(14.5, targetFrontDisp));

                // Smooth chassis climb cushion & grounded downforce over roadside rocks
                const avgStoneLift = (latestRearStoneLift + latestFrontStoneLift) * 0.5;
                const avgBridgeLift = (rearBridgeLift + frontBridgeLift) * 0.5;
                const targetGroundCarY = restCarY - avgStoneLift * 0.28 - avgBridgeLift * 1.0;
                car.y += (targetGroundCarY - car.y) * (1 - Math.pow(1 - 0.45, dtScale));
                car.vy = 0;

                // Dynamic suspension body heave when rolling over rocks (critically damped so it never oscillates)
                const rockSuspCushion = (latestRearStoneLift + latestFrontStoneLift) * 0.08;
                const targetSuspension = -rockSuspCushion;
                car.suspensionVelocity = 0;
                car.suspensionOffset += (targetSuspension - car.suspensionOffset) * (1 - Math.pow(1 - 0.38, dtScale));
                car.suspensionOffset = Math.max(-3.5, Math.min(3.5, car.suspensionOffset));

                // Hill Climb Racing 2 style dynamic chassis tilt & weight transfer when climbing rocks
                const rawPitch = ((car.rearWheelDisp - car.frontWheelDisp) / Math.max(48, car.width - 36)) * 0.42;
                const rockWeightShift = (latestFrontStoneLift - latestRearStoneLift) * 0.22;
                const pedalPitch = keys.brake ? 0.045 : (keys.nitro && hasFuel ? -0.058 : (keys.gas && hasFuel ? -0.040 : 0));
                const targetBrakeDive = (keys.brake ? 2.6 : 0) + Math.max(0, -rockWeightShift);
                const targetRearSquat = ((keys.nitro && hasFuel) ? 3.2 : ((keys.gas && hasFuel) ? 2.2 : 0)) + Math.max(0, rockWeightShift);
                car.frontBrakeDive = (car.frontBrakeDive || 0) + (targetBrakeDive - (car.frontBrakeDive || 0)) * (1 - Math.pow(1 - 0.32, dtScale));
                car.rearAccelSquat = (car.rearAccelSquat || 0) + (targetRearSquat - (car.rearAccelSquat || 0)) * (1 - Math.pow(1 - 0.32, dtScale));
                const clampedPitch = Math.max(-0.14, Math.min(0.14, rawPitch + pedalPitch));
                car.angVel = 0;
                car.angle = (car.angle || 0) + (clampedPitch - (car.angle || 0)) * (1 - Math.pow(1 - 0.38, dtScale));
                car.angle = Math.max(-0.14, Math.min(0.14, car.angle));
            }
            document.getElementById('speedDisplay').innerText = Math.abs(Math.round(speed));
            document.getElementById('coinCount').innerText = coins + ' كوينز';
        }
        function drawScene(deltaTime) {
            const dt = Math.min(Math.max(typeof deltaTime === 'number' && Number.isFinite(deltaTime) ? deltaTime : (1 / 60), 0.001), 0.05);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const isUltraQuality = graphicsQuality === 'Ultra';
            const isHighQuality = graphicsQuality === 'High';
            const isMediumQuality = graphicsQuality === 'Medium';
            const isLowQuality = graphicsQuality === 'Low';
            ctx.imageSmoothingEnabled = !isLowQuality;
            const nowSec = Date.now() * 0.001;
            // Uniform Gentle Weather & Wind System across Evening (Maghrib), Night (Isha), and Midnight:
            // Rain intensity and wind force are locked to a consistent light/gentle level across all rainy time phases.
            const PHASE_DURATION = 90;
            const TOTAL_CYCLE = PHASE_DURATION * 7;
            const cycleT = (nowSec + 25) % TOTAL_CYCLE;
            const isEveningMaghribPhase = cycleT >= 360 && cycleT < 450;
            const isNightIshaPhase = cycleT >= 450 && cycleT < 540;
            const isMidnightPhase = cycleT >= 540;
            const isNightPhase = cycleT >= 450 || cycleT < 35;
            const nightAmt = isMidnightPhase
                ? 0.96
                : isNightIshaPhase
                ? 0.44 + ((cycleT - 450) / 90) * 0.48
                : isEveningMaghribPhase
                ? ((cycleT - 360) / 90) * 0.44
                : cycleT < 35
                ? (1 - cycleT / 35) * 0.5
                : 0;
            const isSunriseOrSunset = (cycleT < 110) || isEveningMaghribPhase;
            // Uniform Light Rain Intensity (0.25) across Evening, Night (Isha), and Midnight
            const rainIntensity = (isEveningMaghribPhase || isNightIshaPhase || isMidnightPhase) ? 0.25 : 0;

            if (rainGain && rainFilter && audioCtx) {
                const ambTarget = getNatureGain(0.065 + rainIntensity * 0.24);
                rainGain.gain.setTargetAtTime(Math.max(0.0001, ambTarget), audioCtx.currentTime, 0.1);
                rainFilter.frequency.setTargetAtTime(320 + rainIntensity * 540, audioCtx.currentTime, 0.1);
            }

            // Trigger Thunder SFX & Visible Forked Lightning Flashes in BOTH Night (Isha) and Midnight!
            if (isNightIshaPhase || isMidnightPhase) {
                lightningCountdown -= dt;
                if (lightningCountdown <= 0) {
                    lightningCountdown = isMidnightPhase ? 2.4 + Math.random() * 2.2 : 4.5 + Math.random() * 2.8;
                    lightningFlash = isMidnightPhase ? 0.94 + Math.random() * 0.06 : 0.78 + Math.random() * 0.14;
                    lightningBolt = generateForkedBolt(canvas.width * (0.3 + Math.random() * 0.45), 10);
                    playThunderSound(isMidnightPhase ? 1.18 : 0.9);
                }
            }
            if (lightningFlash > 0) {
                lightningFlash = Math.max(0, lightningFlash - dt * 2.1);
                if (lightningFlash <= 0.04) lightningBolt = [];
            }

            let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            if (nightAmt > 0.5) {
                gradient.addColorStop(0, '#081430');
                gradient.addColorStop(0.55, '#0f234c');
                gradient.addColorStop(1, '#1e3a6e');
            } else if (isSunriseOrSunset) {
                gradient.addColorStop(0, '#1e3a8a');
                gradient.addColorStop(0.5, '#ea580c');
                gradient.addColorStop(1, '#fde047');
            } else {
                gradient.addColorStop(0, '#0284c7');
                gradient.addColorStop(0.55, '#38bdf8');
                gradient.addColorStop(1, '#e0f2fe');
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Twinkling stars & glowing Moon at Night, or glowing Sun by Day/Dawn
            ctx.save();
            if (nightAmt > 0.08) {
                for (let s = 0; s < 55; s++) {
                    const sx = ((s * 137.5 + 31) % 100) * 0.01 * canvas.width;
                    const sy = ((s * 73.1 + 17) % 100) * 0.0042 * canvas.height + 10;
                    const tw = 0.45 + 0.55 * Math.sin(nowSec * (2 + (s % 4)) + s);
                    ctx.globalAlpha = nightAmt * tw;
                    ctx.fillStyle = s % 4 === 0 ? '#fef08a' : '#ffffff';
                    ctx.beginPath();
                    ctx.arc(sx, sy, s % 5 === 0 ? 2.0 : 1.3, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = Math.min(1, nightAmt * 1.15);
                const mx = canvas.width * 0.75;
                const my = canvas.height * 0.18;
                const mGlow = ctx.createRadialGradient(mx, my, 6, mx, my, 90);
                mGlow.addColorStop(0, 'rgba(248, 250, 252, 0.95)');
                mGlow.addColorStop(0.35, 'rgba(186, 230, 253, 0.45)');
                mGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
                ctx.fillStyle = mGlow;
                ctx.beginPath();
                ctx.arc(mx, my, 90, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f8fafc';
                ctx.beginPath();
                ctx.arc(mx, my, 26, 0, Math.PI * 2);
                ctx.fill();
            } else {
                const sx = canvas.width * 0.74;
                const sy = canvas.height * 0.18;
                ctx.globalAlpha = 1.0;
                const sGlow = ctx.createRadialGradient(sx, sy, 34, sx, sy, 135);
                sGlow.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
                sGlow.addColorStop(0.35, isSunriseOrSunset ? 'rgba(251, 146, 60, 0.78)' : 'rgba(254, 240, 138, 0.78)');
                sGlow.addColorStop(1, 'rgba(251, 146, 60, 0)');
                ctx.fillStyle = sGlow;
                ctx.beginPath();
                ctx.arc(sx, sy, 135, 0, Math.PI * 2);
                ctx.fill();
                // 100% Solid Opaque Sun Disk (Opacity = 1.0)
                ctx.globalAlpha = 1.0;
                ctx.fillStyle = isSunriseOrSunset ? '#fdba74' : '#ffffff';
                ctx.beginPath();
                ctx.arc(sx, sy, 38, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            // Draw distant sky clouds drifting smoothly to the left + Midnight Lightning Bolts & Sky Veils
            ctx.save();
            ctx.fillStyle = isNightPhase ? 'rgba(203, 213, 225, 0.48)' : 'rgba(255, 255, 255, 0.65)';
            for (let i = 0; i < skyClouds.length; i++) {
                const c = skyClouds[i];
                ctx.beginPath();
                ctx.ellipse(c.x + c.w * 0.5, c.y + c.h * 0.5, c.w * 0.45, c.h * 0.38, 0, 0, Math.PI * 2);
                ctx.ellipse(c.x + c.w * 0.3, c.y + c.h * 0.55, c.w * 0.28, c.h * 0.3, 0, 0, Math.PI * 2);
                ctx.ellipse(c.x + c.w * 0.7, c.y + c.h * 0.55, c.w * 0.28, c.h * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            if (lightningFlash > 0.03) {
                ctx.fillStyle = 'rgba(186, 230, 253, ' + Math.min(0.36, lightningFlash * 0.45).toFixed(3) + ')';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                if (lightningBolt.length > 0) {
                    ctx.lineCap = 'round';
                    ctx.strokeStyle = 'rgba(56, 189, 248, ' + Math.min(0.88, lightningFlash).toFixed(3) + ')';
                    for (let b = 0; b < lightningBolt.length; b++) {
                        const seg = lightningBolt[b];
                        ctx.lineWidth = seg.width * 3.0;
                        ctx.beginPath();
                        ctx.moveTo(seg.x1, seg.y1);
                        ctx.lineTo(seg.x2, seg.y2);
                        ctx.stroke();
                    }
                    ctx.strokeStyle = '#ffffff';
                    for (let b = 0; b < lightningBolt.length; b++) {
                        const seg = lightningBolt[b];
                        ctx.lineWidth = seg.width;
                        ctx.beginPath();
                        ctx.moveTo(seg.x1, seg.y1);
                        ctx.lineTo(seg.x2, seg.y2);
                        ctx.stroke();
                    }
                }
            }
            ctx.restore();
            const groundY = canvas.height - 120;
            // Continuous Natural Green Mountain Range Background (passes continuously underneath the movable bridge!)
            ctx.save();
            const mtnFarColor = nightAmt > 0.5 ? '#112233' : isSunriseOrSunset ? '#3b4d3e' : '#3b6e5c';
            const mtnMidColor = nightAmt > 0.5 ? '#0d261f' : isSunriseOrSunset ? '#2e4c2d' : '#2d6a32';
            const mtnNearColor = nightAmt > 0.5 ? '#091c16' : isSunriseOrSunset ? '#223d21' : '#1e5622';
            ctx.fillStyle = mtnFarColor;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            for (let mx = 0; mx <= canvas.width + 40; mx += 40) {
                const wx = mx + worldX * 0.12;
                const my = groundY - 145 - Math.sin(wx * 0.004) * 52 - Math.cos(wx * 0.009) * 24;
                ctx.lineTo(mx, my);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = mtnMidColor;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            for (let mx = 0; mx <= canvas.width + 40; mx += 40) {
                const wx = mx + worldX * 0.22;
                const my = groundY - 82 - Math.cos(wx * 0.0055) * 38 - Math.sin(wx * 0.012) * 16;
                ctx.lineTo(mx, my);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = mtnNearColor;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height);
            for (let mx = 0; mx <= canvas.width + 40; mx += 40) {
                const wx = mx + worldX * 0.34;
                const my = groundY - 28 - Math.sin(wx * 0.007) * 22;
                ctx.lineTo(mx, my);
            }
            ctx.lineTo(canvas.width, canvas.height);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Automated Day/Night Street Light, Bridge Light & Car Headlights/Taillights Control:
            // ON during Dawn/Fajr (0..90), Sunset/Dusk (360..450), Evening/Isha (450..540), and Midnight (540..630)
            // OFF during daylight hours: Morning (90..180), Noon (180..270), and Afternoon (270..348)
            // Seamless C1-continuous smoothstep fade-in at Dusk (348..376s) and fade-out at Dawn sunrise (65..90s)
            let envLightIntensity = 0;
            if (cycleT >= 376 || cycleT < 65) {
                envLightIntensity = 1.0;
            } else if (cycleT >= 348 && cycleT < 376) {
                const u = (cycleT - 348) / 28;
                envLightIntensity = u * u * (3 - 2 * u);
            } else if (cycleT >= 65 && cycleT < 90) {
                const u = (90 - cycleT) / 25;
                envLightIntensity = u * u * (3 - 2 * u);
            }
            const streetLightsOn = envLightIntensity > 0.005;
            const bridgeLightsOn = envLightIntensity > 0.005;
            const carLightsOn = cycleT >= 355 || cycleT < 90;

            const bridgeInterval = 1400;
            const firstBridge = Math.floor((worldX - 300) / bridgeInterval) * bridgeInterval + 520;
            const isUnderBridgeScreenX = (sx) => {
                for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                    const screenBX = bx - worldX;
                    if (Math.abs(sx - screenBX) < 110) return true;
                }
                return false;
            };

            // Render 100% opaque Purple Jacaranda, Lush Green, White Sakura & Warm Autumn Orange trees with Uniform Gentle Wind Swaying!
            // Clean smooth leaf clusters with zero dark/black V-shaped branch lines inside the foliage.
            ctx.save();
            ctx.globalAlpha = 1.0;
            const treeWindSpeed = 1.45;
            const treeWindAmp = 0.85;
            const treeWindGust = 0.82 + 0.18 * Math.sin(nowSec * 0.85);
            const treeStormLean = rainIntensity > 0.05 ? -0.015 : 0;
            const treeSpacing = 225;
            const firstTreeIdx = Math.floor((worldX * 0.65 - 240) / treeSpacing);
            const lastTreeIdx = Math.ceil((worldX * 0.65 + canvas.width + 240) / treeSpacing);
            let lastStandaloneTreeX = -999999;
            for (let idx = firstTreeIdx; idx <= lastTreeIdx; idx++) {
                let tx = idx * treeSpacing - worldX * 0.65 + Math.sin(idx * 3.1) * 30;
                for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                    const screenBX = bx - worldX;
                    if (Math.abs(tx - screenBX) < 132) {
                        tx = tx < screenBX ? screenBX - 132 : screenBX + 132;
                        break;
                    }
                }
                if (!Number.isFinite(tx) || Math.abs(tx - lastStandaloneTreeX) < 58) continue;
                lastStandaloneTreeX = tx;
                const treeType = Math.abs(idx) % 4; // 0: Jacaranda, 1: Lush Green, 2: Sakura, 3: Autumn Orange
                const scale = 1.05 + (Math.abs(idx) % 3) * 0.14;
                const baseTreeY = groundY - 15;
                const tPhase = nowSec * treeWindSpeed + idx * 2.3;
                const tFlutter = Math.sin(tPhase * 2.1 + idx) * 0.22;
                const shearX = treeStormLean + (Math.sin(tPhase) + tFlutter) * treeWindAmp * treeWindGust * 0.022;
                const crownOffsetX = -115 * scale * shearX;

                ctx.save();
                ctx.translate(tx, baseTreeY);
                ctx.transform(1, 0, shearX, 1, 0, 0);
                ctx.globalAlpha = 1.0;
                // Lower tree trunk only (stops cleanly below leaf clusters so zero dark V-lines cross the leaves!)
                const trunkCol = nightAmt > 0.5
                    ? '#1c1311'
                    : isSunriseOrSunset
                    ? '#4a2511'
                    : treeType === 0 ? '#3e2723' : treeType === 1 ? '#3e2723' : treeType === 2 ? '#351e17' : '#3b1e0d';
                ctx.fillStyle = trunkCol;
                ctx.beginPath();
                ctx.moveTo(-10 * scale, 0);
                ctx.quadraticCurveTo(-5 * scale, -42 * scale, -4 * scale, -84 * scale);
                ctx.lineTo(4 * scale, -84 * scale);
                ctx.quadraticCurveTo(5 * scale, -42 * scale, 10 * scale, 0);
                ctx.closePath();
                ctx.fill();
                // Smooth, vibrant, natural multi-layered canopy gradient + small organic leaves (Zero black lines, zero angular V-branches!)
                const dayColors = treeType === 0
                    ? ['#4c1d95', '#7c3aed', '#a78bfa', '#ddd6fe', '#c4b5fd', '#a78bfa', '#ddd6fe']
                    : treeType === 1
                    ? ['#064e3b', '#15803d', '#22c55e', '#86efac', '#4ade80', '#22c55e', '#86efac']
                    : treeType === 2
                    ? ['#cbd5e1', '#ffe4e6', '#fff1f2', '#ffffff', '#ffffff', '#fff1f2', '#ffe4e6']
                    : ['#7c2d12', '#ea580c', '#fb923c', '#fde047', '#fdba74', '#fb923c', '#fde047'];
                const sunsetColors = treeType === 0
                    ? ['#4a044e', '#86198f', '#c026d3', '#f0abfc', '#e879f9', '#c026d3', '#f0abfc']
                    : treeType === 1
                    ? ['#052e16', '#15803d', '#16a34a', '#bef264', '#4ade80', '#16a34a', '#bef264']
                    : treeType === 2
                    ? ['#fb923c', '#fdba74', '#fed7aa', '#fff7ed', '#ffedd5', '#fed7aa', '#fff7ed']
                    : ['#431407', '#c2410c', '#ea580c', '#fde047', '#fdba74', '#f97316', '#fde047'];
                const nightColors = treeType === 0
                    ? ['#2e1065', '#4c1d95', '#5b21b6', '#7c3aed', '#6d28d9', '#5b21b6', '#7c3aed']
                    : treeType === 1
                    ? ['#022c22', '#064e3b', '#14532d', '#15803d', '#166534', '#14532d', '#15803d']
                    : treeType === 2
                    ? ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#cbd5e1', '#94a3b8', '#cbd5e1']
                    : ['#2a1205', '#7c2d12', '#9a3412', '#ea580c', '#c2410c', '#9a3412', '#ea580c'];
                const activePalette = nightAmt > 0.5 ? nightColors : isSunriseOrSunset ? sunsetColors : dayColors;
                const canopyGrad = ctx.createLinearGradient(0, -158 * scale, 0, -78 * scale);
                canopyGrad.addColorStop(0, activePalette[3]);
                canopyGrad.addColorStop(0.42, activePalette[2]);
                canopyGrad.addColorStop(0.78, activePalette[1]);
                canopyGrad.addColorStop(1, activePalette[0]);
                ctx.fillStyle = canopyGrad;
                const lobes = [
                    { dx: 0, dy: -112, rx: 58, ry: 34, rot: 0 },
                    { dx: -34, dy: -104, rx: 34, ry: 23, rot: -0.16 },
                    { dx: 34, dy: -104, rx: 34, ry: 23, rot: 0.16 },
                    { dx: -20, dy: -126, rx: 38, ry: 26, rot: -0.1 },
                    { dx: 20, dy: -126, rx: 38, ry: 26, rot: 0.1 },
                    { dx: 0, dy: -136, rx: 36, ry: 24, rot: 0 }
                ];
                for (let l = 0; l < lobes.length; l++) {
                    const lb = lobes[l];
                    ctx.beginPath();
                    ctx.ellipse(lb.dx * scale, lb.dy * scale, lb.rx * scale, lb.ry * scale, lb.rot, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Delicate natural small leaf petals across the crown (Scaled by Graphics Quality!)
                const canopyPetalCount = isLowQuality ? 0 : isMediumQuality ? 8 : isHighQuality ? 16 : 24;
                for (let lf = 0; lf < canopyPetalCount; lf++) {
                    const lAng = lf * 2.39996 + idx * 0.7;
                    const lRad = Math.sqrt(lf / canopyPetalCount);
                    const bPhase = nowSec * (treeWindSpeed * 1.8) + idx * 2.3 + lf;
                    const lx = Math.cos(lAng) * lRad * 54 * scale + Math.sin(bPhase) * 2.2 * scale;
                    const ly = -116 * scale + Math.sin(lAng) * lRad * 30 * scale + Math.cos(bPhase * 1.3) * 1.2 * scale;
                    ctx.fillStyle = activePalette[4 + (lf % 3)];
                    ctx.beginPath();
                    ctx.ellipse(lx, ly, 4.2 * scale, 2.2 * scale, lAng * 0.5 + Math.sin(bPhase) * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
                // Dynamic Midnight Lightning Illumination & Random Rain Splash Particles Across Tree Leaf Foliage
                if (!isLowQuality && lightningFlash > 0.05) {
                    ctx.fillStyle = 'rgba(224, 242, 254, ' + Math.min(0.42, lightningFlash * 0.45).toFixed(3) + ')';
                    ctx.beginPath();
                    ctx.ellipse(tx + crownOffsetX, baseTreeY - 122 * scale, 54 * scale, 26 * scale, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                if (!isLowQuality && !isMediumQuality && rainIntensity > 0.05) {
                    const treeSplashCount = isUltraQuality ? 12 : 7;
                    ctx.strokeStyle = 'rgba(224, 242, 254, ' + (0.45 + rainIntensity * 0.48).toFixed(3) + ')';
                    ctx.fillStyle = 'rgba(186, 230, 253, ' + (0.45 + rainIntensity * 0.48).toFixed(3) + ')';
                    ctx.lineWidth = 1.25;
                    ctx.beginPath();
                    for (let fs = 0; fs < treeSplashCount; fs++) {
                        const fSeed = idx * 23.7 + fs * 8.3;
                        const sPhase = (nowSec * (5.6 + (fs % 3) * 1.1) + fSeed) % 1;
                        const uHash = Math.abs(Math.sin(fSeed * 12.9898 + 1.7));
                        const vHash = Math.abs(Math.cos(fSeed * 78.233 + 3.1));
                        const rNorm = Math.sqrt(uHash) * 0.9;
                        const theta = vHash * Math.PI * 2;
                        const sx = tx + crownOffsetX + Math.cos(theta) * rNorm * 52 * scale;
                        const sy = baseTreeY - 116 * scale + Math.sin(theta) * rNorm * 28 * scale;
                        if (sPhase < 0.62) {
                            const sp = sPhase / 0.62;
                            ctx.moveTo(sx, sy);
                            ctx.lineTo(sx - (2 + sp * 5.2), sy - (1 - sp) * 5.2);
                            ctx.moveTo(sx, sy);
                            ctx.lineTo(sx + (2 + sp * 5.2), sy - (1 - sp) * 5.2);
                        } else {
                            const dp = (sPhase - 0.62) / 0.38;
                            ctx.moveTo(sx, sy + dp * 16);
                            ctx.lineTo(sx - 0.6, sy + dp * 16 + 4.2);
                        }
                    }
                    ctx.stroke();
                }
                // Solid wind-blown falling petals & leaves (Scaled by Graphics Quality!)
                const leafCount = isLowQuality ? 0 : isMediumQuality ? 2 : isHighQuality ? (5 + Math.round(rainIntensity * 4)) : (8 + Math.round(rainIntensity * 6));
                for (let pt = 0; pt < leafCount; pt++) {
                    const pSeed = idx * 13.7 + pt * 5.3;
                    const prog = (nowSec * (0.32 + rainIntensity * 0.55) + pSeed) % 1;
                    const px = tx + crownOffsetX + Math.sin(pSeed * 2.3) * 44 * scale - prog * (32 + rainIntensity * 85) + Math.sin(nowSec * (2.5 + rainIntensity * 4.5) + pSeed) * (7 + rainIntensity * 18);
                    const py = baseTreeY - 115 * scale + prog * 95 * scale;
                    ctx.fillStyle = activePalette[5 + (pt % 2)];
                    ctx.beginPath();
                    ctx.ellipse(px, py, 3.4, 2.1, nowSec * (1.8 + rainIntensity * 4.2) + pSeed, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();

            // Draw road & ground segments ONLY outside the movable bridge span so the green mountain valley shows underneath!
            ctx.fillStyle = nightAmt > 0.5 ? '#0f172a' : isSunriseOrSunset ? '#291d12' : '#3d2817';
            for (let sx = 0; sx < canvas.width; sx += 8) {
                if (isUnderBridgeScreenX(sx + 4)) continue;
                ctx.fillRect(sx, groundY, 9, 120);
            }
            ctx.fillStyle = '#1e252b';
            for (let sx = 0; sx < canvas.width; sx += 8) {
                if (isUnderBridgeScreenX(sx + 4)) continue;
                ctx.fillRect(sx, groundY - 15, 9, 15);
            }
            ctx.fillStyle = '#b0b0b0';
            for (let sx = 0; sx < canvas.width; sx += 8) {
                if (isUnderBridgeScreenX(sx + 4)) continue;
                ctx.fillRect(sx, groundY - 25, 9, 4);
            }
            for (let x = 0; x < canvas.width; x += 60) {
                if (isUnderBridgeScreenX(x)) continue;
                ctx.fillRect(x, groundY - 25, 6, 10);
            }

            // Detailed Green Grass Patches, Scattered Vibrant Flowers & Roadside Rocks/Stones along the terrain
            const flowerColors = ['#a855f7', '#ec4899', '#facc15', '#ffffff'];
            const firstGrass = Math.floor((worldX - 60) / 34) * 34;
            for (let gx = firstGrass; gx < worldX + canvas.width + 60; gx += 34) {
                const sx = gx - worldX;
                if (isUnderBridgeScreenX(sx)) continue;
                const gIdx = Math.abs(Math.round(gx / 34));
                const baseY = groundY - 15;
                const sway = Math.sin(nowSec * 2.2 + gIdx * 0.85) * 2.0;
                ctx.fillStyle = nightAmt > 0.5 ? '#0b4627' : '#15803d';
                ctx.beginPath();
                ctx.ellipse(sx, baseY, 15, 4.2, 0, Math.PI, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = nightAmt > 0.5 ? '#156539' : '#22c55e';
                ctx.lineWidth = 1.6;
                for (let b = -2; b <= 2; b++) {
                    ctx.beginPath();
                    ctx.moveTo(sx + b * 4.5, baseY);
                    ctx.quadraticCurveTo(sx + b * 5.2, baseY - 6, sx + b * 6 + sway, baseY - 12 - (Math.abs(b) % 2) * 3);
                    ctx.stroke();
                }
                const fCol = flowerColors[gIdx % flowerColors.length];
                const fx = sx + (gIdx % 2 === 0 ? -4 : 4) + sway * 0.8;
                const fy = baseY - 12 - (gIdx % 3) * 2;
                ctx.fillStyle = fCol;
                ctx.beginPath();
                ctx.arc(fx, fy, 3.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.arc(fx, fy, 1.3, 0, Math.PI * 2);
                ctx.fill();
            }

            // (Road & drawbridge surface stones are rendered in the foreground layer AFTER the drawbridge structure!)

            // Tall Automated Modern Street Light Poles along the complete road length (Start to End)
            const poleSpacing = 185;
            const firstPole = Math.floor((worldX - 180) / poleSpacing) * poleSpacing;
            for (let px = firstPole; px < worldX + canvas.width + 180; px += poleSpacing) {
                const screenPX = px - worldX;
                let nearBridgePillar = false;
                for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                    const screenBX = bx - worldX;
                    const dxBridge = screenPX - screenBX;
                    if (dxBridge > -278 && dxBridge < 214) {
                        nearBridgePillar = true;
                        break;
                    }
                }
                if (nearBridgePillar) continue;
                const baseY = groundY - 15;
                const poleH = 194;
                const topY = baseY - poleH;
                const lampX = screenPX + 32;
                const lampY = topY - 14;
                ctx.save();
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(screenPX - 7, baseY - 14, 14, 16);
                ctx.fillStyle = '#475569';
                ctx.fillRect(screenPX - 3.5, topY, 7, poleH);
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 4.2;
                ctx.beginPath();
                ctx.moveTo(screenPX, topY + 2);
                ctx.quadraticCurveTo(screenPX + 6, lampY, lampX - 6, lampY);
                ctx.stroke();
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(lampX - 14, lampY - 4.5, 28, 8);
                if (streetLightsOn) {
                    const sInten = envLightIntensity;
                    if (!isLowQuality) {
                        const coneGrad = ctx.createLinearGradient(lampX, lampY + 3.5, lampX, baseY + 6);
                        coneGrad.addColorStop(0, 'rgba(255, 253, 230, ' + ((isUltraQuality ? 0.78 : 0.68) * sInten).toFixed(3) + ')');
                        coneGrad.addColorStop(0.5, 'rgba(251, 191, 36, ' + ((isUltraQuality ? 0.44 : 0.36) * sInten).toFixed(3) + ')');
                        coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
                        ctx.fillStyle = coneGrad;
                        ctx.beginPath();
                        ctx.moveTo(lampX - 10.5, lampY + 3.5);
                        ctx.lineTo(lampX + 10.5, lampY + 3.5);
                        ctx.lineTo(lampX + 122, baseY + 6);
                        ctx.lineTo(lampX - 122, baseY + 6);
                        ctx.closePath();
                        ctx.fill();
                        if (!isMediumQuality) {
                            const halo = ctx.createRadialGradient(lampX, lampY + 3.5, 2, lampX, lampY + 3.5, isUltraQuality ? 48 : 38);
                            halo.addColorStop(0, 'rgba(255, 255, 255, ' + (0.98 * sInten).toFixed(3) + ')');
                            halo.addColorStop(0.45, 'rgba(254, 240, 138, ' + (0.76 * sInten).toFixed(3) + ')');
                            halo.addColorStop(1, 'rgba(245, 158, 11, 0)');
                            ctx.fillStyle = halo;
                            ctx.beginPath();
                            ctx.arc(lampX, lampY + 3.5, isUltraQuality ? 48 : 38, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(1, sInten * 1.05).toFixed(3) + ')';
                    ctx.beginPath();
                    ctx.ellipse(lampX, lampY + 3, 10.2, 3.0, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Comprehensive Rain Impact Splashes & Running Drops along the Entire Street Light Post from Top to Bottom!
                if (!isLowQuality && !isMediumQuality && rainIntensity > 0.05) {
                    ctx.strokeStyle = 'rgba(224, 242, 254, ' + (0.46 + rainIntensity * 0.48).toFixed(3) + ')';
                    ctx.lineWidth = 1.3;
                    ctx.beginPath();
                    const poleHits = [
                        { x: lampX - 6, y: lampY - 4.5, s: 0.4 },
                        { x: lampX + 6, y: lampY - 4.5, s: 1.2 },
                        { x: screenPX + 14, y: topY - 7, s: 2.0 },
                        { x: screenPX, y: topY, s: 2.8 },
                        { x: screenPX - 3.5, y: topY + poleH * 0.18, s: 3.6 },
                        { x: screenPX + 3.5, y: topY + poleH * 0.36, s: 4.4 },
                        { x: screenPX - 3.5, y: topY + poleH * 0.54, s: 5.2 },
                        { x: screenPX + 3.5, y: topY + poleH * 0.72, s: 6.0 },
                        { x: screenPX - 3.5, y: topY + poleH * 0.88, s: 6.8 },
                        { x: screenPX - 6, y: baseY - 14, s: 7.6 },
                        { x: screenPX + 6, y: baseY - 14, s: 8.4 }
                    ];
                    for (let h = 0; h < poleHits.length; h++) {
                        const pt = poleHits[h];
                        const pPhase = (nowSec * 6.9 + px * 0.05 + pt.s) % 1;
                        if (pPhase < 0.64) {
                            const sp = pPhase / 0.64;
                            ctx.moveTo(pt.x, pt.y);
                            ctx.lineTo(pt.x - (2 + sp * 4.8), pt.y - (1 - sp) * 5.0);
                            ctx.moveTo(pt.x, pt.y);
                            ctx.lineTo(pt.x + (2 + sp * 4.8), pt.y - (1 - sp) * 5.0);
                        } else {
                            const dp = (pPhase - 0.64) / 0.36;
                            ctx.moveTo(pt.x, pt.y + dp * 14);
                            ctx.lineTo(pt.x, pt.y + dp * 14 + 4.5);
                        }
                    }
                    ctx.stroke();
                }
                ctx.restore();
            }

            // Render movable wooden bridge REAR structure & deck planks BEFORE the car so the car drives INSIDE the bridge
            for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                const screenBX = bx - worldX;
                const bw = 220;
                const leftX = screenBX - bw * 0.5;
                const rightX = screenBX + bw * 0.5;
                if (rightX < -40 || leftX > canvas.width + 40) continue;
                ctx.save();
                // Subtle mountain fog/mist clouds under the movable bridge matching background mountain mist
                const mistGrad = ctx.createLinearGradient(0, groundY - 6, 0, canvas.height);
                mistGrad.addColorStop(0, 'rgba(241, 245, 249, 0)');
                mistGrad.addColorStop(0.42, nightAmt > 0.5 ? 'rgba(186, 230, 253, 0.36)' : 'rgba(241, 245, 249, 0.52)');
                mistGrad.addColorStop(1, 'rgba(226, 232, 240, 0)');
                ctx.fillStyle = mistGrad;
                ctx.fillRect(leftX - 14, groundY - 6, bw + 28, canvas.height - groundY + 6);
                ctx.fillStyle = nightAmt > 0.5 ? 'rgba(203, 213, 225, 0.34)' : 'rgba(255, 255, 255, 0.52)';
                for (let m = 0; m < 3; m++) {
                    const mx = leftX + 35 + m * 75 + Math.sin(nowSec * 0.6 + m * 1.9) * 18;
                    const my = groundY + 34 + (m % 2) * 22;
                    ctx.beginPath();
                    ctx.ellipse(mx, my, 58, 18, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Extended Rear-side wooden suspension towers (Anchored deeply into the ground base with clean timber collars!) & rear dynamic cable + plank joints
                ctx.fillStyle = '#3b1804';
                ctx.fillRect(leftX - 12, groundY - 6, 12, 26);
                ctx.fillRect(rightX - 10, groundY - 6, 12, 26);
                ctx.fillStyle = '#451a03';
                ctx.fillRect(leftX - 11, groundY - 72, 10, 92);
                ctx.fillRect(rightX - 9, groundY - 72, 10, 92);
                const carCenterScreenX = car.x + car.width * 0.5;
                const getDynamicBridgeDeckY = (sx) => {
                    const exactDeckY = getBridgeDeckYAtWorldX(worldX + sx, nowSec);
                    if (exactDeckY !== null) return exactDeckY;
                    const t = Math.max(0, Math.min(1, (sx - leftX) / bw));
                    const archShape = 0.5 * (1 - Math.cos(t * Math.PI * 2));
                    return groundY - 15 + archShape * 2.6;
                };
                const getDynamicRearCableY = (sx) => {
                    const t = Math.max(0, Math.min(1, (sx - leftX) / bw));
                    const deckY = getDynamicBridgeDeckY(sx);
                    const dynamicDisp = deckY - (groundY - 15);
                    return groundY - 68 + Math.sin(t * Math.PI) * 34 + dynamicDisp * 0.68;
                };
                // Rear vertical suspension ropes connected directly to the rear bridge posts & plank mounts
                let rPlankIdx = 0;
                for (let px = leftX + 4; px <= rightX - 4; px += 16) {
                    const deckY = getDynamicBridgeDeckY(px);
                    if (rPlankIdx % 2 === 1 && px >= leftX + 20 && px <= rightX - 20) {
                        const cabY = getDynamicRearCableY(px);
                        const postX = px - 2;
                        const postTopY = deckY - 16;
                        const postBaseY = deckY + 1;
                        // Rear wooden support post anchored to the plank (zero rear light beam/halo!)
                        ctx.fillStyle = '#451a03';
                        ctx.fillRect(postX - 1.8, postTopY, 3.6, postBaseY - postTopY);
                        const distCar = px - carCenterScreenX;
                        const ropeFlex = Math.sin(distCar * 0.08 - nowSec * 7.5) * Math.exp(-(distCar * distCar) / 3200) * (1.1 + Math.abs(speed) * 0.02);
                        const sway = Math.sin(nowSec * 4.0 + rPlankIdx * 0.8) * 0.8;
                        ctx.strokeStyle = 'rgba(100, 116, 139, 0.82)';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(postX, cabY);
                        ctx.quadraticCurveTo(postX + (ropeFlex + sway) * 0.45, (cabY + postTopY) * 0.5, postX, postTopY);
                        ctx.lineTo(postX, postBaseY);
                        ctx.stroke();
                        ctx.fillStyle = '#334155';
                        ctx.beginPath();
                        ctx.arc(postX, cabY, 1.7, 0, Math.PI * 2);
                        ctx.arc(postX, postTopY, 1.6, 0, Math.PI * 2);
                        ctx.arc(postX, postBaseY, 1.7, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    rPlankIdx++;
                }
                ctx.strokeStyle = 'rgba(100, 116, 139, 0.85)';
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                for (let s = 0; s <= 20; s++) {
                    const sx = leftX + (s / 20) * bw;
                    const cy = getDynamicRearCableY(sx);
                    if (s === 0) ctx.moveTo(sx, cy);
                    else ctx.lineTo(sx, cy);
                }
                ctx.stroke();
                // Articulated wooden bridge planks with dynamic physics deflection
                for (let px = leftX + 4; px <= rightX - 4; px += 16) {
                    const deckY = getDynamicBridgeDeckY(px);
                    ctx.fillStyle = '#b45309';
                    ctx.fillRect(px - 6, deckY, 12, 8);
                    ctx.fillStyle = '#f59e0b';
                    ctx.fillRect(px - 5, deckY, 10, 2);
                }
                ctx.restore();
            }
            // Render Fixed 25-Value 3D Beveled Coins with Visible Raindrop Impacts & Splashes
            for (let i = 0; i < trackCoins.length; i++) {
                const tc = trackCoins[i];
                if (tc.collected) continue;
                const sx = tc.x - worldX;
                if (sx < -40 || sx > canvas.width + 40) continue;
                const cy = groundY - 46 + Math.sin(nowSec * 4 + tc.id) * 3;
                const coinR = tc.radius;
                const coinDepth = 4.5;
                ctx.save();
                ctx.translate(sx, cy);

                // 1. Golden ambient glow halo
                ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
                ctx.beginPath();
                ctx.arc(0, 0, coinR * 1.32, 0, Math.PI * 2);
                ctx.fill();

                // 2. 3D extruded metallic gold cylinder rim & milled edge ridges
                ctx.fillStyle = '#78350f';
                ctx.strokeStyle = '#451a03';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(coinDepth * 0.72, coinDepth * 0.48, coinR, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // 3. Outer 3D beveled metallic gold face
                const cGrad = ctx.createLinearGradient(-coinR, -coinR, coinR, coinR);
                cGrad.addColorStop(0, '#fef08a');
                cGrad.addColorStop(0.38, '#facc15');
                cGrad.addColorStop(0.76, '#d97706');
                cGrad.addColorStop(1, '#92400e');
                ctx.fillStyle = cGrad;
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.arc(0, 0, coinR, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Upper-left 3D bevel highlight arc
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(0, 0, coinR - 1.1, -Math.PI * 0.88, -Math.PI * 0.12);
                ctx.stroke();

                // 4. Recessed inner 3D dish & bevel ring
                const innerR = coinR * 0.76;
                ctx.fillStyle = '#fde047';
                ctx.strokeStyle = '#b45309';
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.arc(0, 0, innerR, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // 5. Embossed 3D "25" numeral (Strictly & Exclusively 25!)
                ctx.font = 'bold 11px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#78350f';
                ctx.fillText('25', 1.1, 1.8);
                ctx.fillStyle = '#92400e';
                ctx.fillText('25', 0, 0.8);

                // 6. Raindrop Impact V-Splashes, Bouncing Droplets & Water Runoff on the 3D Coin Surface!
                if (rainIntensity > 0.05) {
                    const cAlpha = (0.52 + rainIntensity * 0.45).toFixed(3);
                    ctx.strokeStyle = 'rgba(224, 242, 254, ' + cAlpha + ')';
                    ctx.fillStyle = 'rgba(186, 230, 253, ' + cAlpha + ')';
                    ctx.lineWidth = 1.3;
                    ctx.beginPath();
                    ctx.arc(0, 0, coinR + 0.4, -Math.PI * 0.82, -Math.PI * 0.18);
                    const cPts = [
                        { x: 0, y: -coinR, s: 0.2 },
                        { x: -coinR * 0.62, y: -coinR * 0.74, s: 1.5 },
                        { x: coinR * 0.62, y: -coinR * 0.74, s: 2.8 },
                        { x: 0, y: -2, s: 4.1 }
                    ];
                    for (let cp = 0; cp < cPts.length; cp++) {
                        const pt = cPts[cp];
                        const ph = (nowSec * 7.8 + tc.id * 2.3 + pt.s) % 1;
                        if (ph < 0.66) {
                            const pNorm = ph / 0.66;
                            const spX = 1.8 + pNorm * 4.8;
                            const spY = (1 - pNorm) * 5.2;
                            ctx.moveTo(pt.x, pt.y);
                            ctx.lineTo(pt.x - spX, pt.y - spY);
                            ctx.moveTo(pt.x, pt.y);
                            ctx.lineTo(pt.x + spX, pt.y - spY);
                        } else {
                            const dNorm = (ph - 0.66) / 0.34;
                            const ty = pt.y + dNorm * (coinR * 0.85);
                            ctx.moveTo(pt.x, ty);
                            ctx.lineTo(pt.x - 0.5, ty + 3.4);
                        }
                    }
                    ctx.stroke();

                    ctx.beginPath();
                    for (let cp = 0; cp < cPts.length; cp++) {
                        const pt = cPts[cp];
                        const ph = (nowSec * 7.8 + tc.id * 2.3 + pt.s) % 1;
                        if (ph < 0.58) {
                            const pNorm = ph / 0.58;
                            const bx = pt.x + (cp % 2 === 0 ? -1 : 1) * (1.5 + pNorm * 3.8);
                            const by = pt.y - Math.sin(pNorm * Math.PI) * 4.8;
                            ctx.moveTo(bx + 1.1, by);
                            ctx.arc(bx, by, 1.1, 0, Math.PI * 2);
                        }
                    }
                    ctx.fill();
                }
                ctx.restore();
            }
            // Render balanced fuel canisters along the track
            for (let i = 0; i < fuelCanisters.length; i++) {
                const fc = fuelCanisters[i];
                if (fc.collected) continue;
                const sx = fc.x - worldX;
                if (sx < -40 || sx > canvas.width + 40) continue;
                ctx.save();
                ctx.fillStyle = '#dc2626';
                ctx.strokeStyle = '#fca5a5';
                ctx.lineWidth = 2;
                ctx.fillRect(sx - 14, groundY - 50, 28, 34);
                ctx.strokeRect(sx - 14, groundY - 50, 28, 34);
                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('FUEL', sx, groundY - 30);
                ctx.restore();
            }
            // Render balanced repair kits along the track
            for (let i = 0; i < repairKits.length; i++) {
                const rk = repairKits[i];
                if (rk.collected) continue;
                const sx = rk.x - worldX;
                if (sx < -40 || sx > canvas.width + 40) continue;
                ctx.save();
                ctx.fillStyle = '#065f46';
                ctx.strokeStyle = '#34d399';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(sx, groundY - 34, 18, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#fef08a';
                ctx.font = 'bold 8px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('REPAIR', sx, groundY - 31);
                ctx.restore();
            }
            // Render Roadside 3D Organic Rock Clusters on the road surface BEFORE the Car & Wheels so tires visibly climb & roll over them!
            {
                const renderRealistic3DRockCluster = (sx, baseY, hw, sh, h1, h2, h3, isBridgeRock, seedId) => {
                    ctx.save();
                    ctx.translate(sx, baseY);
                    ctx.lineJoin = 'round';
                    ctx.lineCap = 'round';

                    const isNight = nightAmt > 0.45;
                    const aoGrad = ctx.createRadialGradient(0, 1.5, hw * 0.15, 0, 1.5, hw * 1.32);
                    aoGrad.addColorStop(0, 'rgba(2, 6, 23, 0.72)');
                    aoGrad.addColorStop(0.65, 'rgba(15, 23, 42, 0.38)');
                    aoGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
                    ctx.fillStyle = aoGrad;
                    ctx.beginPath();
                    ctx.ellipse(0, 1.8, hw * 1.28, Math.max(3.2, sh * 0.16), 0, 0, Math.PI * 2);
                    ctx.fill();

                    const drawOrganicRockBody = (ox, oy, rw, rh, s1, s2, s3, isMain) => {
                        ctx.save();
                        ctx.translate(ox, oy);
                        const peakX = (s3 - 0.5) * rw * 0.32;
                        const pL0X = -rw * 1.02, pL0Y = 1.2;
                        const pL1X = -rw * (0.88 + s1 * 0.08), pL1Y = -rh * (0.34 + s2 * 0.1);
                        const pL2X = -rw * (0.62 + s3 * 0.1), pL2Y = -rh * (0.72 + s1 * 0.08);
                        const pL3X = -rw * (0.24 + s2 * 0.08), pL3Y = -rh * (0.94 + s3 * 0.05);
                        const pTopX = peakX, pTopY = -rh;
                        const pR3X = rw * (0.3 + s1 * 0.1), pR3Y = -rh * (0.9 + s2 * 0.07);
                        const pR2X = rw * (0.68 + s3 * 0.08), pR2Y = -rh * (0.62 + s1 * 0.1);
                        const pR1X = rw * (0.92 + s2 * 0.06), pR1Y = -rh * (0.28 + s3 * 0.08);
                        const pR0X = rw * 1.02, pR0Y = 1.2;

                        const traceContour = () => {
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

                        const baseGrad = ctx.createLinearGradient(-rw * 0.65, -rh, rw * 0.75, 2);
                        if (isNight) {
                            baseGrad.addColorStop(0, isBridgeRock ? '#cbd5e1' : '#e2e8f0');
                            baseGrad.addColorStop(0.42, isBridgeRock ? '#94a3b8' : '#94a3b8');
                            baseGrad.addColorStop(0.78, '#475569');
                            baseGrad.addColorStop(1, '#1e293b');
                        } else if (isBridgeRock) {
                            baseGrad.addColorStop(0, '#e7e5e4');
                            baseGrad.addColorStop(0.32, '#d6d3d1');
                            baseGrad.addColorStop(0.68, '#78716c');
                            baseGrad.addColorStop(1, '#292524');
                        } else {
                            baseGrad.addColorStop(0, '#f8fafc');
                            baseGrad.addColorStop(0.35, '#cbd5e1');
                            baseGrad.addColorStop(0.72, '#64748b');
                            baseGrad.addColorStop(1, '#1e293b');
                        }
                        traceContour();
                        ctx.fillStyle = baseGrad;
                        ctx.fill();

                        ctx.save();
                        traceContour();
                        ctx.clip();

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

                        ctx.fillStyle = isNight ? 'rgba(51, 65, 85, 0.42)' : (isBridgeRock ? 'rgba(120, 113, 108, 0.38)' : 'rgba(100, 116, 139, 0.36)');
                        ctx.beginPath();
                        ctx.moveTo(-rw * 0.48, -rh * 0.56);
                        ctx.lineTo(peakX, -rh * 0.78);
                        ctx.lineTo(rw * 0.42, -rh * 0.52);
                        ctx.lineTo(peakX * 0.5, -rh * 0.22);
                        ctx.closePath();
                        ctx.fill();

                        const speckleCount = isMain ? 10 : 5;
                        for (let sp = 0; sp < speckleCount; sp++) {
                            const sxNorm = Math.sin(seedId * 17.3 + sp * 31.7) * 0.68;
                            const syNorm = 0.16 + Math.abs(Math.cos(seedId * 29.1 + sp * 43.3)) * 0.68;
                            const spX = sxNorm * rw;
                            const spY = -syNorm * rh;
                            const spR = 0.75 + (sp % 3) * 0.45;
                            ctx.fillStyle = sp % 2 === 0 ? (isNight ? 'rgba(226, 232, 240, 0.28)' : 'rgba(255, 255, 255, 0.42)') : 'rgba(15, 23, 42, 0.42)';
                            ctx.beginPath();
                            ctx.arc(spX, spY, spR, 0, Math.PI * 2);
                            ctx.fill();
                        }

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

                        ctx.strokeStyle = rainIntensity > 0.05 ? 'rgba(224, 242, 254, 0.82)' : (isNight ? 'rgba(148, 163, 184, 0.45)' : 'rgba(255, 255, 255, 0.62)');
                        ctx.lineWidth = isMain ? 1.25 : 0.95;
                        ctx.beginPath();
                        ctx.moveTo(pL1X * 0.92, pL1Y * 0.95);
                        ctx.quadraticCurveTo(pL2X * 0.92, pL2Y * 0.96, pTopX, pTopY + 0.8);
                        ctx.quadraticCurveTo(pR3X * 0.7, pR3Y * 0.92, peakX * 0.45, -rh * 0.46);
                        ctx.stroke();

                        ctx.restore();

                        traceContour();
                        ctx.strokeStyle = '#0f172a';
                        ctx.lineWidth = isMain ? 1.35 : 1.1;
                        ctx.stroke();
                        ctx.restore();
                    };

                    drawOrganicRockBody(-hw * 0.68, 0.8, hw * 0.48, sh * 0.54, h2, h3, h1, false);
                    drawOrganicRockBody(0, 0, hw, sh, h1, h2, h3, true);
                    drawOrganicRockBody(hw * 0.66, 1.0, hw * 0.45, sh * 0.48, h3, h1, h2, false);

                    if (rainIntensity > 0.05) {
                        const stAlpha = (0.38 + rainIntensity * 0.42).toFixed(3);
                        ctx.strokeStyle = 'rgba(224, 242, 254, ' + stAlpha + ')';
                        ctx.fillStyle = 'rgba(186, 230, 253, ' + stAlpha + ')';
                        ctx.lineWidth = 1.2;
                        const peakX = (h3 - 0.5) * hw * 0.32;
                        const stPts = [
                            { x: peakX, y: -sh, s: 0.3 },
                            { x: -hw * 0.42, y: -sh * 0.74, s: 1.7 },
                            { x: hw * 0.44, y: -sh * 0.7, s: 3.1 }
                        ];
                        ctx.beginPath();
                        for (let spI = 0; spI < stPts.length; spI++) {
                            const pt = stPts[spI];
                            const ph = (nowSec * 7.4 + seedId * 2.9 + pt.s) % 1;
                            if (ph < 0.66) {
                                const pNorm = ph / 0.66;
                                const spX = 1.8 + pNorm * 4.8;
                                const spY = (1 - pNorm) * 5.0;
                                ctx.moveTo(pt.x, pt.y);
                                ctx.lineTo(pt.x - spX, pt.y - spY);
                                ctx.moveTo(pt.x, pt.y);
                                ctx.lineTo(pt.x + spX, pt.y - spY);
                            } else {
                                const dNorm = (ph - 0.66) / 0.34;
                                const trX = pt.x + (spI % 2 === 0 ? -1 : 1) * dNorm * 3.0;
                                const trY = pt.y + dNorm * (sh * 0.72);
                                ctx.moveTo(trX, trY);
                                ctx.lineTo(trX, trY + 2.6);
                            }
                        }
                        ctx.stroke();
                    }
                    ctx.restore();
                };

                const stoneCellSpacing = ROAD_STONE_CELL_SPACING;
                const firstStoneCell = Math.max(1, Math.floor((worldX - 450) / stoneCellSpacing));
                const lastStoneCell = Math.ceil((worldX + canvas.width + 450) / stoneCellSpacing);
                for (let cellIdx = firstStoneCell; cellIdx <= lastStoneCell; cellIdx++) {
                    const st = getRoadStoneInfoAtCell(cellIdx);
                    if (!st) continue;
                    const { stoneWorldX, hw, sh, h1, h2, h3 } = st;
                    if (isNearBridgeWorldX(stoneWorldX, 260)) continue;
                    const sx = stoneWorldX - worldX;
                    if (sx < -80 || sx > canvas.width + 80) continue;
                    renderRealistic3DRockCluster(sx, groundY - 8.5, hw, sh, h1, h2, h3, false, cellIdx);
                }
            }
            ctx.save();
            const drawCarY = car.y + car.suspensionOffset;
            // Progressive Dynamic Vehicle Ground Drop Shadow (Controlled by Graphics Quality: Ultra/High = Dynamic Smooth Gradient, Medium = Simplified Flat Shadow, Low = Disabled)
            if (!car.isFlying && !isLowQuality) {
                if (isMediumQuality) {
                    if (!isUnderBridgeScreenX(car.x + car.width * 0.5)) {
                        ctx.fillStyle = 'rgba(2, 6, 23, 0.48)';
                        ctx.beginPath();
                        ctx.ellipse(car.x + car.width * 0.5, groundY - 12, car.width * 0.55, 5.5, 0, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    const getPointBridgeShadowVis = (sx) => {
                        let vis = 1;
                        const fadeSpan = 20;
                        for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                            const screenBX = bx - worldX;
                            const leftEdge = screenBX - 110;
                            const rightEdge = screenBX + 110;
                            if (sx >= leftEdge - 4 && sx <= rightEdge + 4) {
                                const nearestEdgeDist = Math.min(sx - (leftEdge - 4), (rightEdge + 4) - sx);
                                if (nearestEdgeDist >= fadeSpan) return 0;
                                const t = Math.max(0, Math.min(1, 1 - nearestEdgeDist / fadeSpan));
                                vis = Math.min(vis, t * t * (3 - 2 * t));
                            }
                        }
                        return vis;
                    };
                    const rearShVis = getPointBridgeShadowVis(car.x + 18);
                    const midShVis = getPointBridgeShadowVis(car.x + car.width * 0.5);
                    const frontShVis = getPointBridgeShadowVis(car.x + car.width - 18);
                    if (Math.max(rearShVis, midShVis, frontShVis) > 0.01) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(0, 0, canvas.width, canvas.height);
                        for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                            const screenBX = bx - worldX;
                            ctx.rect(screenBX - 108, 0, 216, canvas.height);
                        }
                        ctx.clip('evenodd');
                        const shadowY = groundY - 12;
                        const shGrad = ctx.createLinearGradient(car.x - 10, shadowY, car.x + car.width + 10, shadowY);
                        shGrad.addColorStop(0, 'rgba(2, 6, 23, 0)');
                        shGrad.addColorStop(0.22, 'rgba(2, 6, 23, ' + (0.68 * rearShVis).toFixed(3) + ')');
                        shGrad.addColorStop(0.5, 'rgba(2, 6, 23, ' + ((isUltraQuality ? 0.84 : 0.74) * midShVis).toFixed(3) + ')');
                        shGrad.addColorStop(0.78, 'rgba(2, 6, 23, ' + (0.68 * frontShVis).toFixed(3) + ')');
                        shGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
                        ctx.fillStyle = shGrad;
                        ctx.beginPath();
                        ctx.ellipse(car.x + car.width * 0.5, shadowY, car.width * (isUltraQuality ? 0.66 : 0.62), isUltraQuality ? 7.5 : 6.5, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                }
            }
            // Player Car Headlights & Red Taillights (Suppressed across wooden bridge & support pillars so zero yellow light beam appears behind the wooden bridge support pillars!)
            let carBeamNearBridgePillar = false;
            for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                const screenBX = bx - worldX;
                if (screenBX > car.x - 140 && screenBX < car.x + car.width + 420) {
                    carBeamNearBridgePillar = true;
                    break;
                }
            }
            if (carLightsOn && !isLowQuality && !carBeamNearBridgePillar) {
                const headX = car.x + car.width;
                const headY = drawCarY + 12;
                const beamReach = isUltraQuality ? 320 : isHighQuality ? 260 : 190;
                const beamGrad = ctx.createLinearGradient(headX, headY, headX + beamReach, headY + 18);
                beamGrad.addColorStop(0, isUltraQuality ? 'rgba(255, 255, 255, 0.92)' : 'rgba(254, 249, 195, 0.78)');
                beamGrad.addColorStop(0.45, isUltraQuality ? 'rgba(254, 240, 138, 0.45)' : 'rgba(186, 230, 253, 0.32)');
                beamGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
                ctx.fillStyle = beamGrad;
                ctx.beginPath();
                ctx.moveTo(headX, headY - 4);
                ctx.lineTo(headX + beamReach, headY - (isUltraQuality ? 56 : 48));
                ctx.lineTo(headX + beamReach, headY + (isUltraQuality ? 82 : 72));
                ctx.lineTo(headX, headY + 5);
                ctx.closePath();
                ctx.fill();
                if (isUltraQuality) {
                    const flare = ctx.createRadialGradient(headX, headY, 2, headX, headY, 36);
                    flare.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
                    flare.addColorStop(0.5, 'rgba(254, 240, 138, 0.55)');
                    flare.addColorStop(1, 'rgba(254, 240, 138, 0)');
                    ctx.fillStyle = flare;
                    ctx.beginPath();
                    ctx.arc(headX, headY, 36, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            if ((carLightsOn || keys.brake) && !isLowQuality) {
                const tailX = car.x;
                const tailY = drawCarY + 10;
                const tGlow = ctx.createRadialGradient(tailX, tailY, 2, tailX - 8, tailY, 44);
                tGlow.addColorStop(0, 'rgba(255, 228, 230, 0.92)');
                tGlow.addColorStop(0.35, 'rgba(239, 68, 68, 0.78)');
                tGlow.addColorStop(1, 'rgba(220, 38, 38, 0)');
                ctx.fillStyle = tGlow;
                ctx.beginPath();
                ctx.arc(tailX - 6, tailY, 44, 0, Math.PI * 2);
                ctx.fill();
            }
            // Rear-mounted Spare Tire & Car Chassis with Braking Nose-Dive AND Acceleration Rear Squat & Front Lift
            const brakeDivePx = Math.max(0, car.frontBrakeDive || 0);
            const rearSquatPx = Math.max(0, car.rearAccelSquat || 0);
            const chassisPitch = car.angle || 0;
            ctx.save();
            ctx.translate(car.x + car.width * 0.5, drawCarY + (car.height - 15) * 0.5 + brakeDivePx * 0.45 + rearSquatPx * 0.48);
            ctx.rotate(chassisPitch);
            ctx.translate(-(car.x + car.width * 0.5), -(drawCarY + (car.height - 15) * 0.5));
            ctx.fillStyle = '#111827';
            ctx.fillRect(car.x - 9, drawCarY - 4, 10, 24);
            ctx.fillStyle = '#334155';
            ctx.fillRect(car.x - 4, drawCarY + 4, 6, 8);
            const activeBodyPaint = previewCustomColor || carBodyColor;
            const activeRoofPaint = activeBodyPaint;
            const activeRimPaint = previewCustomColor || carRimColor;
            const activeDualNeon = getStandaloneDualNeonInfo(activeBodyPaint);
            const activeStarry = getStandaloneStarryInfo(activeBodyPaint);
            const neonWave = 0.5 + 0.5 * Math.sin(nowSec * 4.6);
            const neonStrobe = 0.5 + 0.5 * Math.sin(nowSec * 16.0);
            const neonPulse = 0.38 + 0.38 * neonWave + 0.24 * neonStrobe;
            const neonBlink = Math.sin(nowSec * 11.5) > -0.2 ? 1.0 : 0.42;

            // Strictly contained Dual Neon or Starry Galaxy paint on the car body surfaces (zero external volumetric light beams!)
            if (activeDualNeon) {
                const shiftX = Math.sin(nowSec * 4.2) * 18;
                const bodyNeonGrad = ctx.createLinearGradient(car.x + shiftX, drawCarY - 12, car.x + car.width - shiftX, drawCarY + car.height);
                bodyNeonGrad.addColorStop(0, lerpStandaloneRgb(activeDualNeon.rgbA, activeDualNeon.rgbB, neonWave));
                bodyNeonGrad.addColorStop(0.5, activeDualNeon.midColor);
                bodyNeonGrad.addColorStop(1, lerpStandaloneRgb(activeDualNeon.rgbB, activeDualNeon.rgbA, neonWave));
                ctx.fillStyle = bodyNeonGrad;
                ctx.fillRect(car.x, drawCarY, car.width, car.height - 15);
                ctx.fillRect(car.x + 15, drawCarY - 12, car.width - 30, 15);
                ctx.strokeStyle = neonBlink > 0.7 ? activeDualNeon.colorB : activeDualNeon.colorA;
                ctx.lineWidth = 1.6;
                ctx.strokeRect(car.x, drawCarY, car.width, car.height - 15);
            } else if (activeStarry) {
                const stGrad = ctx.createLinearGradient(car.x, drawCarY - 12, car.x + car.width, drawCarY + car.height);
                stGrad.addColorStop(0, activeStarry.deepColor);
                stGrad.addColorStop(0.35, activeStarry.baseColor);
                stGrad.addColorStop(0.65, activeStarry.nebulaColor);
                stGrad.addColorStop(1, activeStarry.deepColor);
                ctx.fillStyle = stGrad;
                ctx.fillRect(car.x, drawCarY, car.width, car.height - 15);
                ctx.fillRect(car.x + 15, drawCarY - 12, car.width - 30, 15);
                // Animated sparkling star particles / glimmer dots across car paint
                ctx.save();
                for (let s = 0; s < 24; s++) {
                    const tw = 0.5 + 0.5 * Math.sin(nowSec * (3.5 + (s % 4)) + s * 1.7);
                    if (tw < 0.22) continue;
                    const sx = car.x + 4 + ((s * 37 + 11) % (car.width - 8));
                    const sy = drawCarY + 2 + ((s * 53 + 7) % (car.height - 19));
                    ctx.fillStyle = s % 2 === 0 ? '#ffffff' : activeStarry.starColor;
                    ctx.globalAlpha = 0.35 + tw * 0.65;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 0.8 + tw * 0.9, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;
                ctx.restore();
            } else {
                // Lustrous metallic gradient (especially deep glossy Candy Red!)
                const cGrad = ctx.createLinearGradient(car.x, drawCarY - 12, car.x, drawCarY + car.height - 15);
                if (activeBodyPaint.toLowerCase() === '#e60026') {
                    cGrad.addColorStop(0, '#ff4d6d');
                    cGrad.addColorStop(0.35, '#e60026');
                    cGrad.addColorStop(0.75, '#a80018');
                    cGrad.addColorStop(1, '#59000c');
                    ctx.fillStyle = cGrad;
                } else {
                    ctx.fillStyle = activeBodyPaint;
                }
                ctx.fillRect(car.x, drawCarY, car.width, car.height - 15);
                ctx.fillRect(car.x + 15, drawCarY - 12, car.width - 30, 15);
            }
            // Enclosed Rear Window & Front Windshield with Real Glass Tint & Diagonal Light Reflection Glare
            ctx.fillStyle = 'rgba(14, 165, 233, 0.42)';
            ctx.strokeStyle = '#020617';
            ctx.lineWidth = 1.4;
            ctx.fillRect(car.x + 18, drawCarY - 10, 18, 11);
            ctx.strokeRect(car.x + 18, drawCarY - 10, 18, 11);
            ctx.fillRect(car.x + 42, drawCarY - 10, 28, 11);
            ctx.strokeRect(car.x + 42, drawCarY - 10, 28, 11);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(car.x + 22, drawCarY - 9);
            ctx.lineTo(car.x + 28, drawCarY - 1);
            ctx.moveTo(car.x + 50, drawCarY - 9);
            ctx.lineTo(car.x + 58, drawCarY - 1);
            ctx.moveTo(car.x + 56, drawCarY - 9);
            ctx.lineTo(car.x + 63, drawCarY - 1);
            ctx.stroke();
            if (carLightsOn) {
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(car.x + car.width - 5, drawCarY + 6, 5, 9);
            }
            if (carLightsOn || keys.brake) {
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(car.x, drawCarY + 5, 5, 10);
            }
            ctx.restore();
            const carAltitude = Math.max(0, (groundY - 60) - drawCarY);
            if (!isLowQuality && !isMediumQuality && streetLightsOn && !car.isFlying && carAltitude < 48) {
                const carCenterX = car.x + car.width * 0.5;
                for (let px = firstPole; px < worldX + canvas.width + 150; px += poleSpacing) {
                    const screenPX = px - worldX;
                    let nearBridgePillar = false;
                    for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                        const dxBridge = screenPX - (bx - worldX);
                        if (dxBridge > -278 && dxBridge < 214) {
                            nearBridgePillar = true;
                            break;
                        }
                    }
                    if (nearBridgePillar) continue;
                    const lampX = screenPX + 32;
                    const dist = Math.abs(carCenterX - lampX);
                    if (dist < 115) {
                        const passGlow = Math.cos((dist / 115) * Math.PI * 0.5) * envLightIntensity;
                        ctx.fillStyle = 'rgba(254, 249, 195, ' + (0.48 * passGlow).toFixed(3) + ')';
                        ctx.fillRect(car.x, drawCarY - 12, car.width, car.height - 3);
                    }
                }
            }
            // Dynamic Bridge Pillar Lamps & Middle Deck Lights Casting Onto Car Body, Windows & Chassis!
            if (!isLowQuality && bridgeLightsOn && !car.isFlying && carAltitude < 48) {
                const carCenterX = car.x + car.width * 0.5;
                for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                    const screenBX = bx - worldX;
                    const bw = 220;
                    const leftX = screenBX - bw * 0.5;
                    const rightX = screenBX + bw * 0.5;
                    if (car.x + car.width < leftX - 120 || car.x > rightX + 120) continue;

                    ctx.save();
                    ctx.translate(car.x + car.width * 0.5, drawCarY + (car.height - 15) * 0.5 + brakeDivePx * 0.45 + rearSquatPx * 0.48);
                    ctx.rotate(chassisPitch);
                    ctx.translate(-(car.x + car.width * 0.5), -(drawCarY + (car.height - 15) * 0.5));

                    // Clip strictly to the car's cabin + lower body silhouette so light overlay sits cleanly on the vehicle
                    ctx.beginPath();
                    ctx.rect(car.x + 15, drawCarY - 12, car.width - 30, 15);
                    ctx.rect(car.x, drawCarY, car.width, car.height - 15);
                    ctx.clip();

                    // 1) Main Bridge Pillar Lamps (leftX + 1 & rightX + 1) casting onto Car Body, Windows & Chassis
                    const pillarXs = [leftX + 1, rightX + 1];
                    const pillarReach = 115;
                    for (let p = 0; p < 2; p++) {
                        const dxPillar = carCenterX - pillarXs[p];
                        if (Math.abs(dxPillar) < pillarReach) {
                            const pRaw = Math.cos((dxPillar / pillarReach) * Math.PI * 0.5);
                            const pFactor = Math.pow(Math.max(0, pRaw), 1.35) * envLightIntensity;
                            const sweepX = Math.max(car.x + 6, Math.min(car.x + car.width - 6, carCenterX - dxPillar * 0.58));

                            // Warm golden radial light overlay across body, roof & doors
                            const pGrad = ctx.createRadialGradient(sweepX, drawCarY - 6, 3, sweepX, drawCarY + 6, car.width * 0.62);
                            pGrad.addColorStop(0, 'rgba(255, 251, 235, ' + (0.58 * pFactor).toFixed(3) + ')');
                            pGrad.addColorStop(0.38, 'rgba(253, 224, 71, ' + (0.40 * pFactor).toFixed(3) + ')');
                            pGrad.addColorStop(0.72, 'rgba(245, 158, 11, ' + (0.18 * pFactor).toFixed(3) + ')');
                            pGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
                            ctx.fillStyle = pGrad;
                            ctx.fillRect(car.x, drawCarY - 12, car.width, car.height - 3);

                            // Warm golden reflection glare across Rear Window & Front Windshield glass
                            const wGrad = ctx.createLinearGradient(sweepX - 22, drawCarY - 10, sweepX + 22, drawCarY + 1);
                            wGrad.addColorStop(0, 'rgba(255, 251, 235, 0)');
                            wGrad.addColorStop(0.5, 'rgba(254, 240, 138, ' + (0.66 * pFactor).toFixed(3) + ')');
                            wGrad.addColorStop(1, 'rgba(255, 251, 235, 0)');
                            ctx.fillStyle = wGrad;
                            ctx.fillRect(car.x + 18, drawCarY - 10, 18, 11);
                            ctx.fillRect(car.x + 42, drawCarY - 10, 28, 11);
                        }
                    }
                    ctx.restore();
                }
            }
            const rearWheelX = car.x + 20;
            const frontWheelX = car.x + car.width - 20;
            const rearBridgeDeckY = getBridgeDeckYAtWorldX(worldX + rearWheelX, nowSec);
            const frontBridgeDeckY = getBridgeDeckYAtWorldX(worldX + frontWheelX, nowSec);
            const rearBridgeBlend = getBridgeTransitionBlendAtWorldX(worldX + rearWheelX);
            const frontBridgeBlend = getBridgeTransitionBlendAtWorldX(worldX + frontWheelX);
            const rearTireLift = Math.max(car.rearWheelDisp !== undefined ? car.rearWheelDisp : 0, getStoneWheelLiftAtWorldX(worldX + rearWheelX));
            const frontTireLift = Math.max(car.frontWheelDisp !== undefined ? car.frontWheelDisp : 0, getStoneWheelLiftAtWorldX(worldX + frontWheelX));
            const baseWheelY = (car.rearGrounded && car.frontGrounded) ? (canvas.height - 145) : ((car.y) + car.height - 10);
            const roadRearWheelY = baseWheelY - rearTireLift;
            const roadFrontWheelY = baseWheelY - frontTireLift;
            // Smooth C2-blended wheel alignment from flat road onto movable suspension bridge planks (100% flush on planks with zero entry/exit step bump!)
            const rearWheelY = (rearBridgeDeckY !== null && !car.isFlying && car.rearGrounded)
                ? (roadRearWheelY * (1 - rearBridgeBlend) + (rearBridgeDeckY - 16) * rearBridgeBlend)
                : roadRearWheelY;
            const frontWheelY = (frontBridgeDeckY !== null && !car.isFlying && car.frontGrounded)
                ? (roadFrontWheelY * (1 - frontBridgeBlend) + (frontBridgeDeckY - 16) * frontBridgeBlend)
                : roadFrontWheelY;
            const rearMountTopY = drawCarY + car.height - 26 + rearSquatPx - Math.sin(chassisPitch) * 25;
            const frontMountTopY = drawCarY + car.height - 26 + brakeDivePx - rearSquatPx * 0.35 + Math.sin(chassisPitch) * 25;
            const wheelR = 16;
            // Realistic Multi-Turn Suspension Coils & Hydraulic Shock Pistons (Compress & bulge over rocks/landings, recoil smoothly!)
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            for (let wIdx = 0; wIdx < 2; wIdx++) {
                const wx = wIdx === 0 ? rearWheelX : frontWheelX;
                const topY = wIdx === 0 ? rearMountTopY : frontMountTopY;
                const botY = (wIdx === 0 ? rearWheelY : frontWheelY) - 3;
                const spanY = Math.max(5.0, botY - topY);
                const compRatio = Math.max(0, Math.min(1, (22 - spanY) / 14));
                const coilHalfW = 4.6 + compRatio * 1.8;
                // Inner chrome hydraulic shock damper shaft
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.moveTo(wx, topY);
                ctx.lineTo(wx, botY);
                ctx.stroke();
                // 5-turn helical red suspension spring coil
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3.1;
                ctx.beginPath();
                ctx.moveTo(wx, topY);
                const turns = 5;
                for (let c = 0; c < turns; c++) {
                    const yMid = topY + ((c + 0.5) / turns) * spanY;
                    const yEnd = topY + ((c + 1) / turns) * spanY;
                    const dir = c % 2 === 0 ? -coilHalfW : coilHalfW;
                    ctx.lineTo(wx + dir, yMid);
                    ctx.lineTo(wx, yEnd);
                }
                ctx.stroke();
            }
            ctx.restore();

            ctx.fillStyle = '#111'; ctx.beginPath();
            ctx.arc(rearWheelX, rearWheelY, wheelR, 0, Math.PI * 2);
            ctx.arc(frontWheelX, frontWheelY, wheelR, 0, Math.PI * 2); ctx.fill();
            // Wheel Rims / Wheel Hubs ("الطاوات") matching the exact Car Paint Color, Starry Galaxy, or Animated Dual Neon (strictly contained inside the rim!)
            if (activeDualNeon) {
                const wheelPositions = [rearWheelX, frontWheelX];
                const wheelYs = [rearWheelY, frontWheelY];
                for (let wIdx = 0; wIdx < 2; wIdx++) {
                    const wx = wheelPositions[wIdx];
                    const wy = wheelYs[wIdx];
                    ctx.save();
                    const rimGrad = ctx.createLinearGradient(wx - 9, wy - 9, wx + 9, wy + 9);
                    rimGrad.addColorStop(0, lerpStandaloneRgb(activeDualNeon.rgbA, activeDualNeon.rgbB, neonWave));
                    rimGrad.addColorStop(0.5, activeDualNeon.midColor);
                    rimGrad.addColorStop(1, lerpStandaloneRgb(activeDualNeon.rgbB, activeDualNeon.rgbA, neonWave));
                    ctx.fillStyle = rimGrad;
                    ctx.strokeStyle = neonBlink > 0.7 ? activeDualNeon.colorB : activeDualNeon.colorA;
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.arc(wx, wy, 9.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            } else if (activeStarry) {
                const wheelPositions = [rearWheelX, frontWheelX];
                const wheelYs = [rearWheelY, frontWheelY];
                for (let wIdx = 0; wIdx < 2; wIdx++) {
                    const wx = wheelPositions[wIdx];
                    const wy = wheelYs[wIdx];
                    ctx.save();
                    const rimGrad = ctx.createRadialGradient(wx - 2, wy - 2, 1, wx, wy, 9.5);
                    rimGrad.addColorStop(0, activeStarry.nebulaColor);
                    rimGrad.addColorStop(0.55, activeStarry.baseColor);
                    rimGrad.addColorStop(1, activeStarry.deepColor);
                    ctx.fillStyle = rimGrad;
                    ctx.strokeStyle = activeStarry.starColor;
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.arc(wx, wy, 9.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    for (let rs = 0; rs < 6; rs++) {
                        const rAng = nowSec * 1.6 + rs * 1.047;
                        const sx = wx + Math.cos(rAng) * 5.2;
                        const sy = wy + Math.sin(rAng) * 5.2;
                        ctx.fillStyle = rs % 2 === 0 ? '#ffffff' : activeStarry.starColor;
                        ctx.beginPath();
                        ctx.arc(sx, sy, 0.9, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                }
            } else {
                ctx.fillStyle = activeRimPaint;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(rearWheelX, rearWheelY, 9, 0, Math.PI * 2);
                ctx.arc(frontWheelX, frontWheelY, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(rearWheelX, rearWheelY, 3.2, 0, Math.PI * 2);
            ctx.arc(frontWheelX, frontWheelY, 3.2, 0, Math.PI * 2);
            ctx.fill();
            // Upward Light Beams from Center Bridge Lamps onto the Bottom of the Tires (Zero static outline rings, strokes, or borders!)
            if (!isLowQuality && bridgeLightsOn && !car.isFlying && carAltitude < 42) {
                const wheelTargets = [
                    { x: rearWheelX, y: rearWheelY },
                    { x: frontWheelX, y: frontWheelY }
                ];
                for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                    const screenBX = bx - worldX;
                    const bw = 220;
                    const leftX = screenBX - bw * 0.5;
                    const rightX = screenBX + bw * 0.5;
                    if (car.x + car.width < leftX - 60 || car.x > rightX + 60) continue;

                    for (let wIdx = 0; wIdx < 2; wIdx++) {
                        const wt = wheelTargets[wIdx];
                        let lIdx = 0;
                        for (let px = leftX + 4; px <= rightX - 4; px += 16) {
                            if (lIdx % 2 === 0 && px >= leftX + 20 && px <= rightX - 20) {
                                const dx = px - wt.x;
                                const absDx = Math.abs(dx);
                                if (absDx < 28) {
                                    const prox = Math.cos((absDx / 28) * Math.PI * 0.5) * envLightIntensity;
                                    if (prox > 0.02) {
                                        const srcX = Math.max(-wheelR * 0.72, Math.min(wheelR * 0.72, dx * 0.62));
                                        const srcY = wheelR + 2.5;
                                        const aimX = srcX * 0.22;
                                        const aimY = -wheelR * 0.18;

                                        ctx.save();
                                        ctx.translate(wt.x, wt.y);

                                        // Clip strictly to the tire interior so upward beams shine onto the bottom of the tire with zero outline ring
                                        ctx.beginPath();
                                        ctx.arc(0, 0, wheelR - 0.4, 0, Math.PI * 2);
                                        ctx.clip();

                                        // 1) Soft upward directional light cone from the bridge lamp onto the bottom of the tire
                                        const coneGrad = ctx.createLinearGradient(srcX, srcY, aimX, aimY);
                                        coneGrad.addColorStop(0, 'rgba(255, 251, 235, ' + (0.72 * prox).toFixed(3) + ')');
                                        coneGrad.addColorStop(0.36, 'rgba(253, 224, 71, ' + (0.46 * prox).toFixed(3) + ')');
                                        coneGrad.addColorStop(0.72, 'rgba(245, 158, 11, ' + (0.16 * prox).toFixed(3) + ')');
                                        coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
                                        ctx.fillStyle = coneGrad;
                                        ctx.beginPath();
                                        ctx.moveTo(srcX - 3.5, srcY);
                                        ctx.lineTo(aimX - wheelR * 0.88, aimY);
                                        ctx.lineTo(aimX + wheelR * 0.88, aimY);
                                        ctx.lineTo(srcX + 3.5, srcY);
                                        ctx.closePath();
                                        ctx.fill();

                                        // 2) Soft upward light rays fanning from the lamp onto the bottom tire surface
                                        const rayGrad = ctx.createLinearGradient(srcX, srcY, aimX, -wheelR * 0.08);
                                        rayGrad.addColorStop(0, 'rgba(255, 251, 235, ' + (0.58 * prox).toFixed(3) + ')');
                                        rayGrad.addColorStop(0.5, 'rgba(254, 240, 138, ' + (0.28 * prox).toFixed(3) + ')');
                                        rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
                                        ctx.fillStyle = rayGrad;
                                        for (let rIdx = -1; rIdx <= 1; rIdx++) {
                                            const rayTopX = aimX + rIdx * (wheelR * 0.42);
                                            ctx.beginPath();
                                            ctx.moveTo(srcX - 1.4, srcY);
                                            ctx.lineTo(rayTopX - 3.2, -wheelR * 0.08);
                                            ctx.lineTo(rayTopX + 3.2, -wheelR * 0.08);
                                            ctx.lineTo(srcX + 1.4, srcY);
                                            ctx.closePath();
                                            ctx.fill();
                                        }

                                        // 3) Soft bottom-surface glow where the upward light beam strikes the bottom of the tire
                                        const botGlow = ctx.createRadialGradient(srcX, wheelR, 1, srcX * 0.6, wheelR * 0.55, wheelR * 0.78);
                                        botGlow.addColorStop(0, 'rgba(255, 251, 235, ' + (0.64 * prox).toFixed(3) + ')');
                                        botGlow.addColorStop(0.45, 'rgba(253, 224, 71, ' + (0.34 * prox).toFixed(3) + ')');
                                        botGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
                                        ctx.fillStyle = botGlow;
                                        ctx.beginPath();
                                        ctx.arc(srcX * 0.5, wheelR * 0.55, wheelR * 0.78, 0, Math.PI * 2);
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

            // Live Garage Preview Canvas Animation (if Garage Modal is Open)
            if (activeModalKey === 'garage') {
                const gpCanvas = document.getElementById('garagePreviewCanvas');
                if (gpCanvas && gpCanvas.getContext) {
                    const gctx = gpCanvas.getContext('2d');
                    const gw = gpCanvas.width;
                    const gh = gpCanvas.height;
                    gctx.clearRect(0, 0, gw, gh);
                    gctx.fillStyle = '#020617';
                    gctx.fillRect(0, 0, gw, gh);
                    // Podium disc
                    gctx.fillStyle = '#1e293b';
                    gctx.strokeStyle = activeDualNeon ? (neonBlink > 0.7 ? activeDualNeon.colorB : activeDualNeon.colorA) : (activeStarry ? activeStarry.nebulaColor : activeBodyPaint);
                    gctx.lineWidth = 2;
                    gctx.beginPath();
                    gctx.ellipse(gw * 0.5, gh * 0.82, 105, 11, 0, 0, Math.PI * 2);
                    gctx.fill();
                    gctx.stroke();
                    // Car body in preview (strictly contained surface shader, no outer light rays)
                    const px = gw * 0.5 - 45;
                    const py = gh * 0.46;
                    if (activeDualNeon) {
                        const sx = Math.sin(nowSec * 4.2) * 18;
                        const pg = gctx.createLinearGradient(px + sx, py - 12, px + 90 - sx, py + 30);
                        pg.addColorStop(0, lerpStandaloneRgb(activeDualNeon.rgbA, activeDualNeon.rgbB, neonWave));
                        pg.addColorStop(0.5, activeDualNeon.midColor);
                        pg.addColorStop(1, lerpStandaloneRgb(activeDualNeon.rgbB, activeDualNeon.rgbA, neonWave));
                        gctx.fillStyle = pg;
                    } else if (activeStarry) {
                        const sg = gctx.createLinearGradient(px, py - 12, px + 90, py + 30);
                        sg.addColorStop(0, activeStarry.deepColor);
                        sg.addColorStop(0.4, activeStarry.baseColor);
                        sg.addColorStop(0.7, activeStarry.nebulaColor);
                        sg.addColorStop(1, activeStarry.deepColor);
                        gctx.fillStyle = sg;
                    } else {
                        gctx.fillStyle = activeBodyPaint;
                    }
                    gctx.fillRect(px, py, 90, 30);
                    gctx.fillRect(px + 15, py - 12, 60, 15);
                    if (activeStarry) {
                        for (let s = 0; s < 18; s++) {
                            const tw = 0.5 + 0.5 * Math.sin(nowSec * (3.5 + (s % 4)) + s * 1.7);
                            if (tw < 0.25) continue;
                            const sx = px + 4 + ((s * 37 + 11) % 82);
                            const sy = py + 2 + ((s * 53 + 7) % 26);
                            gctx.fillStyle = s % 2 === 0 ? '#ffffff' : activeStarry.starColor;
                            gctx.beginPath();
                            gctx.arc(sx, sy, 0.8 + tw * 0.8, 0, Math.PI * 2);
                            gctx.fill();
                        }
                    }
                    gctx.fillStyle = 'rgba(14, 165, 233, 0.45)';
                    gctx.fillRect(px + 18, py - 10, 18, 11);
                    gctx.fillRect(px + 42, py - 10, 28, 11);
                    // Preview Wheels & Contained Rims ("الطاوات")
                    const pWheels = [px + 20, px + 70];
                    for (let i = 0; i < 2; i++) {
                        const wx = pWheels[i];
                        const wy = py + 32;
                        gctx.fillStyle = '#111';
                        gctx.beginPath();
                        gctx.arc(wx, wy, 15, 0, Math.PI * 2);
                        gctx.fill();
                        if (activeDualNeon) {
                            const rg = gctx.createLinearGradient(wx - 9, wy - 9, wx + 9, wy + 9);
                            rg.addColorStop(0, lerpStandaloneRgb(activeDualNeon.rgbA, activeDualNeon.rgbB, neonWave));
                            rg.addColorStop(1, lerpStandaloneRgb(activeDualNeon.rgbB, activeDualNeon.rgbA, neonWave));
                            gctx.fillStyle = rg;
                        } else if (activeStarry) {
                            gctx.fillStyle = activeStarry.nebulaColor;
                        } else {
                            gctx.fillStyle = activeRimPaint;
                        }
                        gctx.beginPath();
                        gctx.arc(wx, wy, 9, 0, Math.PI * 2);
                        gctx.fill();
                        gctx.fillStyle = '#0f172a';
                        gctx.beginPath();
                        gctx.arc(wx, wy, 3, 0, Math.PI * 2);
                        gctx.fill();
                    }
                }
            }
            // Dynamic Lightning Illumination & Realistic Tire Rain Particle Interaction, Landing & Scatter (Front, Rear & Spare Tires - Zero glow!)
            if (lightningFlash > 0.04) {
                ctx.fillStyle = 'rgba(224, 242, 254, ' + Math.min(0.62, lightningFlash * 0.65).toFixed(3) + ')';
                ctx.fillRect(car.x, drawCarY - 12, car.width, 16);
            }
            if (!isLowQuality && rainIntensity > 0.05) {
                const natSplashAlpha = (0.3 + rainIntensity * 0.34).toFixed(3);
                ctx.strokeStyle = 'rgba(203, 213, 225, ' + natSplashAlpha + ')';
                ctx.fillStyle = 'rgba(226, 232, 240, ' + natSplashAlpha + ')';
                ctx.lineWidth = 1.1;

                ctx.beginPath();
                // Realistic Rain Particle Landing, Impact & Scatter across Rear Spare Tire, Rear Wheel, Front Wheel & Car Bodywork
                const carRainTargets = [
                    // 1) Rear Spare Tire (top crown, outer tread & sidewall)
                    { x: car.x - 5, y: drawCarY - 4, s: 0.2, drip: 10 },
                    { x: car.x - 9, y: drawCarY + 1, s: 0.6, drip: 9 },
                    { x: car.x - 9, y: drawCarY + 7, s: 1.0, drip: 9 },
                    { x: car.x - 9, y: drawCarY + 14, s: 1.4, drip: 8 },
                    { x: car.x - 4, y: drawCarY + 18, s: 1.8, drip: 7 },
                    // 2) Rear Wheel / Tire (tread crown, shoulders, sidewalls & hub)
                    { x: rearWheelX, y: rearWheelY - wheelR, s: 10.2, drip: 10 },
                    { x: rearWheelX - 8, y: rearWheelY - wheelR * 0.86, s: 10.6, drip: 9 },
                    { x: rearWheelX + 8, y: rearWheelY - wheelR * 0.86, s: 11.0, drip: 9 },
                    { x: rearWheelX - 14, y: rearWheelY - wheelR * 0.45, s: 11.4, drip: 8 },
                    { x: rearWheelX + 14, y: rearWheelY - wheelR * 0.45, s: 11.8, drip: 8 },
                    { x: rearWheelX - 15, y: rearWheelY + 2, s: 12.4, drip: 7 },
                    { x: rearWheelX + 15, y: rearWheelY + 2, s: 13.0, drip: 7 },
                    { x: rearWheelX, y: rearWheelY - 4, s: 13.8, drip: 7 },
                    // 3) Front Wheel / Tire (tread crown, shoulders, sidewalls & hub)
                    { x: frontWheelX, y: frontWheelY - wheelR, s: 14.2, drip: 10 },
                    { x: frontWheelX - 8, y: frontWheelY - wheelR * 0.86, s: 14.6, drip: 9 },
                    { x: frontWheelX + 8, y: frontWheelY - wheelR * 0.86, s: 15.0, drip: 9 },
                    { x: frontWheelX - 14, y: frontWheelY - wheelR * 0.45, s: 15.4, drip: 8 },
                    { x: frontWheelX + 14, y: frontWheelY - wheelR * 0.45, s: 15.8, drip: 8 },
                    { x: frontWheelX - 15, y: frontWheelY + 2, s: 16.4, drip: 7 },
                    { x: frontWheelX + 15, y: frontWheelY + 2, s: 17.0, drip: 7 },
                    { x: frontWheelX, y: frontWheelY - 4, s: 17.8, drip: 7 },
                    // 4) Rear Window Frame (C-Pillar & Rear Glass Frame)
                    { x: car.x + 15, y: drawCarY - 12, s: 2.2, drip: 12 },
                    { x: car.x + 15, y: drawCarY - 6, s: 2.6, drip: 12 },
                    { x: car.x + 16, y: drawCarY - 1, s: 3.0, drip: 14 },
                    // 5) Full Roof Line
                    { x: car.x + 25, y: drawCarY - 12, s: 3.4, drip: 10 },
                    { x: car.x + 38, y: drawCarY - 12, s: 3.8, drip: 10 },
                    { x: car.x + 50, y: drawCarY - 12, s: 4.2, drip: 10 },
                    { x: car.x + 63, y: drawCarY - 12, s: 4.6, drip: 10 },
                    // 6) Front Windshield Frame (A-Pillar & Windshield Header/Cowl)
                    { x: car.x + 75, y: drawCarY - 12, s: 5.0, drip: 12 },
                    { x: car.x + 75, y: drawCarY - 6, s: 5.4, drip: 12 },
                    { x: car.x + 74, y: drawCarY - 1, s: 5.8, drip: 14 },
                    // 7) Side Doors
                    { x: car.x + 22, y: drawCarY + 4, s: 6.2, drip: 16 },
                    { x: car.x + 34, y: drawCarY + 8, s: 6.6, drip: 15 },
                    { x: car.x + 45, y: drawCarY + 3, s: 7.0, drip: 16 },
                    { x: car.x + 56, y: drawCarY + 9, s: 7.4, drip: 14 },
                    { x: car.x + 67, y: drawCarY + 5, s: 7.8, drip: 15 },
                    // 8) Rear Deck, Front Hood & Fenders
                    { x: car.x + 8, y: drawCarY, s: 9.4, drip: 12 },
                    { x: car.x + 80, y: drawCarY, s: 9.8, drip: 12 },
                    { x: car.x + 88, y: drawCarY + 2, s: 10.2, drip: 12 }
                ];
                const carTargetStep = isMediumQuality ? 2 : 1;
                for (let c = 0; c < carRainTargets.length; c += carTargetStep) {
                    const ct = carRainTargets[c];
                    const cPhase = (nowSec * 8.2 + ct.s) % 1;
                    if (cPhase < 0.22) {
                        const lNorm = cPhase / 0.22;
                        ctx.moveTo(ct.x + (1 - lNorm) * 3.0, ct.y - (1 - lNorm) * 8.5);
                        ctx.lineTo(ct.x, ct.y);
                    } else if (cPhase < 0.7) {
                        const sp = (cPhase - 0.22) / 0.48;
                        ctx.moveTo(ct.x, ct.y);
                        ctx.lineTo(ct.x - (1.8 + sp * 4.4), ct.y - (1 - sp) * 4.5);
                        ctx.moveTo(ct.x, ct.y);
                        ctx.lineTo(ct.x + (1.8 + sp * 4.4), ct.y - (1 - sp) * 4.5);
                    } else {
                        const dp = (cPhase - 0.7) / 0.3;
                        const streakY = ct.y + dp * ct.drip;
                        ctx.moveTo(ct.x, streakY);
                        ctx.lineTo(ct.x - 0.6, streakY + 3.6);
                    }
                }
                ctx.stroke();

                // Scattering semi-transparent micro-droplet beads on Front Tire, Rear Tire, Spare Tire & Car Bodywork
                ctx.beginPath();
                for (let c = 0; c < carRainTargets.length; c++) {
                    const ct = carRainTargets[c];
                    const cPhase = (nowSec * 8.2 + ct.s) % 1;
                    if (cPhase >= 0.2 && cPhase < 0.74) {
                        const pNorm = (cPhase - 0.2) / 0.54;
                        const bx = ct.x + (c % 2 === 0 ? -1 : 1) * (1.5 + pNorm * 3.8);
                        const by = ct.y - Math.sin(pNorm * Math.PI) * 4.4;
                        ctx.moveTo(bx + 0.95, by);
                        ctx.arc(bx, by, 0.95, 0, Math.PI * 2);
                    }
                }
                ctx.fill();
            }
            ctx.restore();

            // FOREGROUND DRAWBRIDGE STRUCTURE (Rendered AFTER the car so the car drives INSIDE the bridge behind front railings & arches!)
            for (let bx = firstBridge; bx < worldX + canvas.width + 300; bx += bridgeInterval) {
                const screenBX = bx - worldX;
                const bw = 220;
                const leftX = screenBX - bw * 0.5;
                const rightX = screenBX + bw * 0.5;
                if (rightX < -40 || leftX > canvas.width + 40) continue;
                ctx.save();
                const carCenterScreenX = car.x + car.width * 0.5;
                const getDynamicBridgeDeckY = (sx) => {
                    const exactDeckY = getBridgeDeckYAtWorldX(worldX + sx, nowSec);
                    if (exactDeckY !== null) return exactDeckY;
                    const t = Math.max(0, Math.min(1, (sx - leftX) / bw));
                    const archShape = 0.5 * (1 - Math.cos(t * Math.PI * 2));
                    return groundY - 15 + archShape * 2.6;
                };
                const getDynamicFrontCableY = (sx) => {
                    const t = Math.max(0, Math.min(1, (sx - leftX) / bw));
                    const deckY = getDynamicBridgeDeckY(sx);
                    const dynamicDisp = deckY - (groundY - 15);
                    return groundY - 68 + Math.sin(t * Math.PI) * 34 + dynamicDisp * 0.72;
                };
                // Unified Bridge Lamp Helper: strictly matches the bright golden/warm glowing tone across both main pillar lamps and small deck lights (zero downward light cone behind wooden pillars!)
                const drawUnifiedBridgeLamp = (lx, ly, boxW, boxH, haloR, bulbR) => {
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(lx - boxW * 0.5, ly - boxH * 0.5, boxW, boxH);
                    if (bridgeLightsOn) {
                        const bInten = envLightIntensity;
                        const uHalo = ctx.createRadialGradient(lx, ly, 1.5, lx, ly, haloR);
                        uHalo.addColorStop(0, 'rgba(255, 251, 235, ' + (0.96 * bInten).toFixed(3) + ')');
                        uHalo.addColorStop(0.36, 'rgba(253, 224, 71, ' + (0.65 * bInten).toFixed(3) + ')');
                        uHalo.addColorStop(0.70, 'rgba(245, 158, 11, ' + (0.28 * bInten).toFixed(3) + ')');
                        uHalo.addColorStop(1, 'rgba(245, 158, 11, 0)');
                        ctx.fillStyle = uHalo;
                        ctx.beginPath();
                        ctx.arc(lx, ly, haloR, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.fillStyle = 'rgba(254, 240, 138, ' + (0.98 * bInten).toFixed(3) + ')';
                        ctx.beginPath();
                        ctx.arc(lx, ly, bulbR * 1.15, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.98 * bInten).toFixed(3) + ')';
                        ctx.beginPath();
                        ctx.arc(lx, ly, bulbR * 0.82, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.fillStyle = '#94a3b8';
                        ctx.beginPath();
                        ctx.arc(lx, ly, bulbR * 0.88, 0, Math.PI * 2);
                        ctx.fill();
                    }
                };
                // 1) Front vertical bridge light posts & suspension support cables along center deck (strictly clear of the main left/right wooden pillars!)
                let fPlankIdx = 0;
                for (let px = leftX + 4; px <= rightX - 4; px += 16) {
                    if (fPlankIdx % 2 === 0 && px >= leftX + 20 && px <= rightX - 20) {
                        const cableY = getDynamicFrontCableY(px);
                        const deckY = getDynamicBridgeDeckY(px);
                        const lampMountY = deckY - 18;
                        const postBaseY = deckY + 1;
                        // Front wooden bridge light post anchored to the plank
                        ctx.fillStyle = '#78350f';
                        ctx.fillRect(px - 2.2, lampMountY, 4.4, postBaseY - lampMountY);
                        // Steel base mounting bracket at the bottom of the bridge light post
                        ctx.fillStyle = '#334155';
                        ctx.fillRect(px - 3.5, postBaseY - 2, 7, 3);

                        // Support cable connecting from main catenary cable (px, cableY) directly to light fixture mount (px, lampMountY - 2) and anchored down to post base (px, postBaseY)
                        const distCar = px - carCenterScreenX;
                        const ropeFlex = Math.sin(distCar * 0.085 - nowSec * 8.2) * Math.exp(-(distCar * distCar) / 3200) * (1.2 + Math.abs(speed) * 0.02);
                        const windSway = Math.sin(nowSec * 3.8 + fPlankIdx * 0.75) * 0.8;
                        const ctrlX = px + (ropeFlex + windSway) * 0.45;
                        const ctrlY = (cableY + (lampMountY - 2)) * 0.5;
                        ctx.strokeStyle = 'rgba(203, 213, 225, 0.94)';
                        ctx.lineWidth = 1.8;
                        ctx.beginPath();
                        ctx.moveTo(px, cableY);
                        ctx.quadraticCurveTo(ctrlX, ctrlY, px, lampMountY - 2);
                        ctx.lineTo(px, postBaseY);
                        ctx.stroke();

                        // Top catenary clamp, light fixture mount shackle, & bottom post-base anchor bolt
                        ctx.fillStyle = '#475569';
                        ctx.beginPath();
                        ctx.arc(px, cableY, 2.2, 0, Math.PI * 2);
                        ctx.arc(px, lampMountY - 2.2, 2.1, 0, Math.PI * 2);
                        ctx.arc(px, postBaseY - 0.5, 2.1, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    fPlankIdx++;
                }
                // 2) Front wooden safety handrail following the dynamic bridge deck
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                for (let s = 0; s <= 20; s++) {
                    const sx = leftX + (s / 20) * bw;
                    const ry = getDynamicBridgeDeckY(sx) - 16;
                    if (s === 0) ctx.moveTo(sx, ry);
                    else ctx.lineTo(sx, ry);
                }
                ctx.stroke();
                // 3) Front main suspension cable catenary flexing with the bridge (drawn BEFORE the bridge lamps so the grey cable never covers or dulls the golden bulbs!)
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 2.6;
                ctx.beginPath();
                for (let s = 0; s <= 20; s++) {
                    const sx = leftX + (s / 20) * bw;
                    const cy = getDynamicFrontCableY(sx);
                    if (s === 0) ctx.moveTo(sx, cy);
                    else ctx.lineTo(sx, cy);
                }
                ctx.stroke();
                // 4) Extended Front wooden tower pillars, mechanical pulley wheels & dynamic tower crown lanterns!
                ctx.fillStyle = '#78350f';
                ctx.fillRect(leftX - 5, groundY - 72, 12, 92);
                ctx.fillRect(rightX - 5, groundY - 72, 12, 92);
                ctx.fillStyle = '#451a03';
                ctx.fillRect(leftX - 8, groundY - 6, 18, 26);
                ctx.fillRect(rightX - 8, groundY - 6, 18, 26);
                ctx.fillStyle = '#64748b';
                ctx.fillRect(leftX - 6, groundY - 54, 14, 3.5);
                ctx.fillRect(leftX - 6, groundY - 32, 14, 3.5);
                ctx.fillRect(leftX - 6, groundY - 10, 14, 3.5);
                ctx.fillRect(rightX - 6, groundY - 54, 14, 3.5);
                ctx.fillRect(rightX - 6, groundY - 32, 14, 3.5);
                ctx.fillRect(rightX - 6, groundY - 10, 14, 3.5);
                ctx.fillStyle = '#475569';
                ctx.beginPath();
                ctx.arc(leftX + 1, groundY - 68, 8, 0, Math.PI * 2);
                ctx.arc(rightX + 1, groundY - 68, 8, 0, Math.PI * 2);
                ctx.fill();
                // Left & Right Main Pillar Lamps at Tower Crowns
                drawUnifiedBridgeLamp(leftX + 1, groundY - 78, 10, 8, 25, 3.4);
                drawUnifiedBridgeLamp(rightX + 1, groundY - 78, 10, 8, 25, 3.4);
                // 5) Small Bridge Lights Along the Center Deck (Rendered on top of cables with the exact same bright golden/warm glowing tone as the main pillar lamps!)
                let lIdx = 0;
                for (let px = leftX + 4; px <= rightX - 4; px += 16) {
                    if (lIdx % 2 === 0 && px >= leftX + 20 && px <= rightX - 20) {
                        const deckY = getDynamicBridgeDeckY(px);
                        const lampY = deckY - 18;
                        drawUnifiedBridgeLamp(px, lampY, 8, 5.5, 20, 2.8);
                    }
                    lIdx++;
                }
                ctx.restore();
            }

            // Dynamic Lightning Road Illumination + Comprehensive Falling Rain Particles & Road Surface Splashes
            if (lightningFlash > 0.04) {
                ctx.fillStyle = 'rgba(224, 242, 254, ' + Math.min(0.45, lightningFlash * 0.48).toFixed(3) + ')';
                ctx.fillRect(0, groundY - 15, canvas.width, 6);
            }
            if (rainIntensity > 0.05) {
                ctx.save();
                ctx.lineCap = 'round';
                const slantX = -16 - Math.min(28, Math.abs(speed) * 0.18);
                const dropLen = 26 + rainIntensity * 16;
                const spanX = canvas.width + 240;
                const spanY = canvas.height + dropLen * 2;

                // 1. Uniform Background Sky-to-Ground Rain Layer (Scaled by Graphics Quality!)
                const bgDropCount = isLowQuality ? 45 : isMediumQuality ? 95 : isHighQuality ? 195 : 270;
                ctx.strokeStyle = 'rgba(186, 230, 253, ' + Math.min(0.68, 0.34 + rainIntensity * 0.45).toFixed(3) + ')';
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                for (let i = 0; i < bgDropCount; i++) {
                    const uX = (i * 0.7548776662 + 0.13) % 1;
                    const uY = (i + ((i * 0.61803398875) % 1)) / bgDropCount;
                    const fallSpeed = 780 + (i % 6) * 90;
                    const drawX = (((uX * spanX + nowSec * slantX * 15 - i * 19) % spanX) + spanX) % spanX - 120;
                    const drawY = (((uY * spanY + nowSec * fallSpeed) % spanY) + spanY) % spanY - dropLen;
                    ctx.moveTo(drawX, drawY);
                    ctx.lineTo(drawX + slantX * 0.88, drawY + dropLen * 0.92);
                }
                ctx.stroke();

                // 2. Foreground Crisp Rain Streaks (Full Top-to-Bottom Coverage from y = 0 to canvas.height)
                const fgDropCount = isLowQuality ? 20 : isMediumQuality ? 55 : isHighQuality ? 110 : 155;
                const fgDropLen = dropLen * 1.18;
                const fgSpanY = canvas.height + fgDropLen * 2;
                ctx.strokeStyle = 'rgba(224, 242, 254, ' + Math.min(0.82, 0.44 + rainIntensity * 0.52).toFixed(3) + ')';
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                for (let i = 0; i < fgDropCount; i++) {
                    const uX = (i * 0.56984029 + 0.37) % 1;
                    const uY = (i + ((i * 0.7548776662) % 1)) / fgDropCount;
                    const fallSpeed = 980 + (i % 5) * 105;
                    const drawX = (((uX * spanX + nowSec * slantX * 19 - i * 31) % spanX) + spanX) % spanX - 120;
                    const drawY = (((uY * fgSpanY + nowSec * fallSpeed) % fgSpanY) + fgSpanY) % fgSpanY - fgDropLen;
                    ctx.moveTo(drawX, drawY);
                    ctx.lineTo(drawX + slantX * 1.08, drawY + fgDropLen);
                }

                // 3. Road Surface Rain Impact Splashes
                if (!isLowQuality) {
                    const splashStep = isMediumQuality ? 56 : isHighQuality ? 28 : 20;
                    for (let sx = 12; sx < canvas.width; sx += splashStep) {
                        if (isUnderBridgeScreenX(sx)) continue;
                        const rPhase = (nowSec * 6.8 + sx * 0.13) % 1;
                        if (rPhase < 0.65) {
                            const sp = rPhase / 0.65;
                            const gy = groundY - 14;
                            ctx.moveTo(sx - (2 + sp * 7), gy);
                            ctx.lineTo(sx - (1 + sp * 3), gy - (1 - sp) * 6);
                            ctx.moveTo(sx + (2 + sp * 7), gy);
                            ctx.lineTo(sx + (1 + sp * 3), gy - (1 - sp) * 6);
                        }
                    }
                }
                ctx.stroke();
                ctx.restore();
            }
        }
        let lastFrameTimestamp = performance.now();
        let lastPhysicsTimestamp = performance.now();
        function gameLoop(now) {
            requestAnimationFrame(gameLoop);
            if (!now) now = performance.now();
            const targetFps = Number(fpsLimit) || 60;
            const minFrameInterval = 1000 / targetFps;
            const elapsed = now - lastFrameTimestamp;
            if (elapsed < minFrameInterval - 0.75) {
                return;
            }
            lastFrameTimestamp = now - (elapsed % minFrameInterval);
            const rawDeltaMs = Math.min(Math.max(now - lastPhysicsTimestamp, 1), 50);
            lastPhysicsTimestamp = now;
            const deltaTime = rawDeltaMs / 1000;
            const subSteps = deltaTime > 0.022 ? 2 : 1;
            const stepDt = deltaTime / subSteps;
            for (let s = 0; s < subSteps; s++) {
                updatePhysics(stepDt);
            }
            drawScene(deltaTime);
        }
        requestAnimationFrame(gameLoop);
    </script>
</body>
</html>`;
}
