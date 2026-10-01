import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CAR_COLOR_PRESETS,
  CAR_COLOR_PRICE,
  CARS_CATALOG,
  CarConfig,
  CustomCarColor,
  DEFAULT_SAVE_DATA,
  FpsLimit,
  GameSettings,
  GraphicsQuality,
  MAPS_CATALOG,
  MapConfig,
  MenuModal,
  NEON_CAR_COLOR_PRICE,
  STARRY_CAR_COLOR_PRICE,
  SaveData,
  ScreenState,
  UpgradeLevels,
  getCarColorPrice,
  getDualNeonInfo,
  getStarryGalaxyInfo,
  getUpgradeCost,
  loadSaveData,
  persistSaveData,
  registerCustomDualNeonColor,
  registerCustomStarryColor,
  saveSettingsToLocalStorage,
} from './types/game';
import { soundEngine } from './utils/audio';
import {
  PhysicsState,
  activateFlightWings,
  advanceWeatherPhaseManual,
  createInitialPhysicsState,
  renderActionCinematicCutscene,
  renderGameCanvas,
  repairVehicleCompletely,
  stepPhysics,
} from './utils/physicsAndRender';
import { generateStandaloneHtml } from './utils/standaloneHtmlBuilder';
import { MidoNxLogo } from './components/MidoNxLogo';
import {
  ApexGameLogo,
  OfficialGameCoverIcon,
} from './components/ApexGameLogo';
import {
  CarThumbnailCanvas,
  MapThumbnailCanvas,
} from './components/ShowroomThumbnails';
import {
  Car,
  CloudLightning,
  CloudRain,
  Code2,
  Coins,
  Copy,
  Download,
  Flame,
  Fuel,
  Gauge,
  Home,
  Map as MapIcon,
  Maximize2,
  Moon,
  Pause,
  Plane,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  Trophy,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';

export default function App() {
  const [saveData, setSaveData] = useState<SaveData>(() => loadSaveData());
  const [screen, setScreen] = useState<ScreenState>(ScreenState.SPLASH_MIDO);
  const [activeModal, setActiveModal] = useState<MenuModal>(MenuModal.NONE);
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [hudAlertMessage, setHudAlertMessage] = useState<string | null>(null);
  const [isPausedAfterShop, setIsPausedAfterShop] = useState(false);
  const [previewCarColor, setPreviewCarColor] = useState<CustomCarColor | null>(
    null
  );
  const [customStarryPickerHex, setCustomStarryPickerHex] =
    useState<string>('#c90035');
  const [customNeonPickerColorA, setCustomNeonPickerColorA] =
    useState<string>('#00f5ff');
  const [customNeonPickerColorB, setCustomNeonPickerColorB] =
    useState<string>('#ff00d4');

  // Live HUD state synced from Physics loop
  const [hudState, setHudState] = useState<{
    distance: number;
    sessionCoins: number;
    fuelPct: number;
    nitroPct: number;
    speedKmh: number;
    fps: number;
    flips: number;
    carHealth: number;
    weatherLabel: string;
    rainIntensity: number;
    cloudDarkness: number;
    nightFactor: number;
    headlightsOn: boolean;
    headlightsBroken: boolean;
    flightPhase: 'none' | 'transform_takeoff' | 'flying' | 'transform_landing';
    flightTimer: number;
    isExploded: boolean;
  }>({
    distance: 0,
    sessionCoins: 0,
    fuelPct: 100,
    nitroPct: 100,
    speedKmh: 0,
    fps: 60,
    flips: 0,
    carHealth: 100,
    weatherLabel: '☀️ سماء مشمسة صافية',
    rainIntensity: 0,
    cloudDarkness: 0,
    nightFactor: 0,
    headlightsOn: false,
    headlightsBroken: false,
    flightPhase: 'none',
    flightTimer: 120,
    isExploded: false,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsRef = useRef<PhysicsState | null>(null);
  const controlsRef = useRef<{ gas: boolean; brake: boolean; boost: boolean }>({
    gas: false,
    brake: false,
    boost: false,
  });
  const saveDataRef = useRef<SaveData>(saveData);
  const savedSettingsRef = useRef<GameSettings>(
    structuredClone(saveData.settings)
  );
  const screenRef = useRef<ScreenState>(screen);
  const activeModalRef = useRef<MenuModal>(activeModal);
  const [hoveredMenuCategory, setHoveredMenuCategory] = useState<MenuModal>(
    MenuModal.NONE
  );
  const isPausedAfterShopRef = useRef<boolean>(isPausedAfterShop);
  const previewCarColorRef = useRef<CustomCarColor | null>(previewCarColor);
  const hudAlertTimeoutRef = useRef<number | null>(null);
  const cinematicStartRef = useRef<number>(0);
  const cinematicSoundStageRef = useRef<number>(0);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);
  const touchDragRef = useRef<{
    active: boolean;
    lastX: number;
    lastY: number;
    startScrollTop: number;
  }>({
    active: false,
    lastX: 0,
    lastY: 0,
    startScrollTop: 0,
  });

  useEffect(() => {
    activeModalRef.current = activeModal;
    if (activeModal !== MenuModal.GARAGE) {
      previewCarColorRef.current = null;
      setPreviewCarColor(null);
    }
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTop = 0;
    }
  }, [activeModal]);

  useEffect(() => {
    isPausedAfterShopRef.current = isPausedAfterShop;
  }, [isPausedAfterShop]);

  useEffect(() => {
    previewCarColorRef.current = previewCarColor;
  }, [previewCarColor]);

  const triggerHudAlert = useCallback((msg: string) => {
    setHudAlertMessage(msg);
    if (hudAlertTimeoutRef.current) {
      window.clearTimeout(hudAlertTimeoutRef.current);
    }
    hudAlertTimeoutRef.current = window.setTimeout(() => {
      setHudAlertMessage(null);
    }, 2600);
  }, []);

  useEffect(() => {
    saveDataRef.current = saveData;
    persistSaveData(saveData);
    soundEngine.updateSettings(saveData.settings);
  }, [saveData]);

  useEffect(() => {
    screenRef.current = screen;
    if (screen === ScreenState.GAME_OVER) {
      soundEngine.stopEngineSound();
      soundEngine.stopEnvironmentAmbience();
    }
  }, [screen]);

  const baseSelectedCar: CarConfig =
    CARS_CATALOG.find((c) => c.id === saveData.selectedCar) || CARS_CATALOG[0];
  const customSelectedColor = saveData.carColors?.[baseSelectedCar.id];
  const ownedColorsForSelectedCar = (
    saveData.unlockedCarColors?.[baseSelectedCar.id] || []
  ).map((c) => c.toLowerCase());
  const isCarColorOwned = (hexColor: string): boolean => {
    const norm = hexColor.toLowerCase();
    return (
      norm === '#ff001e' ||
      norm === baseSelectedCar.bodyColor.toLowerCase() ||
      ownedColorsForSelectedCar.includes(norm)
    );
  };
  const effectiveCarColor = previewCarColor || customSelectedColor;
  const selectedCar: CarConfig = effectiveCarColor
    ? {
        ...baseSelectedCar,
        bodyColor: effectiveCarColor.bodyColor,
        secondaryColor: effectiveCarColor.secondaryColor,
        accentColor: effectiveCarColor.bodyColor,
      }
    : baseSelectedCar;
  const selectedMap: MapConfig =
    MAPS_CATALOG.find((m) => m.id === saveData.selectedMap) || MAPS_CATALOG[0];
  const currentUpgrades: UpgradeLevels = saveData.upgrades[selectedCar.id] || {
    engine: 0,
    armor: 0,
    exhaustSound: 0,
    suspension: 0,
    tires: 0,
    fuel: 0,
  };

  // Two-Stage Splash Screen Sequence -> Followed Immediately by Action Cinematic Cutscene!
  // ("إزالة كلمة Skip عند ظهور الشعار الأول والشعار الثاني. فور اختفاء الشعار الثاني، يبدأ مشهد سينمائي حماسي")
  useEffect(() => {
    soundEngine.playSplashRockstar(1);
    const timer1 = window.setTimeout(() => {
      setScreen((prev) =>
        prev === ScreenState.SPLASH_MIDO ? ScreenState.SPLASH_GAME : prev
      );
      soundEngine.playSplashRockstar(2);
    }, 2600);

    const timer2 = window.setTimeout(() => {
      setScreen((prev) => {
        if (
          prev === ScreenState.SPLASH_GAME ||
          prev === ScreenState.SPLASH_MIDO
        ) {
          cinematicStartRef.current = performance.now();
          cinematicSoundStageRef.current = 0;
          return ScreenState.CINEMATIC_INTRO;
        }
        return prev;
      });
    }, 5400);

    const unlockSplashAudio = () => {
      if (screenRef.current === ScreenState.SPLASH_MIDO) {
        soundEngine.playSplashRockstar(1);
      } else if (screenRef.current === ScreenState.SPLASH_GAME) {
        soundEngine.playSplashRockstar(2);
      }
    };
    window.addEventListener('pointerdown', unlockSplashAudio, { once: true });
    window.addEventListener('touchstart', unlockSplashAudio, { once: true });
    window.addEventListener('keydown', unlockSplashAudio, { once: true });

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
      window.removeEventListener('pointerdown', unlockSplashAudio);
      window.removeEventListener('touchstart', unlockSplashAudio);
      window.removeEventListener('keydown', unlockSplashAudio);
    };
  }, []);

  // Initialize or reset physics state
  const initPhysicsSession = useCallback(() => {
    const currentSave = saveDataRef.current;
    const baseCar =
      CARS_CATALOG.find((c) => c.id === currentSave.selectedCar) ||
      CARS_CATALOG[0];
    const customCol = currentSave.carColors?.[baseCar.id];
    const car = customCol
      ? {
          ...baseCar,
          bodyColor: customCol.bodyColor,
          secondaryColor: customCol.secondaryColor,
          accentColor: customCol.accentColor,
        }
      : baseCar;
    const map =
      MAPS_CATALOG.find((m) => m.id === currentSave.selectedMap) ||
      MAPS_CATALOG[0];
    const upg = currentSave.upgrades[car.id] || {
      engine: 0,
      armor: 0,
      exhaustSound: 0,
      suspension: 0,
      tires: 0,
      fuel: 0,
    };

    physicsRef.current = createInitialPhysicsState(car, map, upg);
    controlsRef.current = { gas: false, brake: false, boost: false };
    setHudState({
      distance: 0,
      sessionCoins: 0,
      fuelPct: 100,
      nitroPct: 100,
      speedKmh: 0,
      fps: currentSave.settings.fpsLimit,
      flips: 0,
      carHealth: 100,
      weatherLabel: physicsRef.current.weatherLabel,
      rainIntensity: physicsRef.current.rainIntensity,
      cloudDarkness: physicsRef.current.cloudDarkness,
      nightFactor: physicsRef.current.nightFactor,
      headlightsOn: physicsRef.current.headlightsOn,
      headlightsBroken: false,
      flightPhase: 'none',
      flightTimer: 120,
      isExploded: false,
    });
  }, []);

  useEffect(() => {
    if (screen === ScreenState.MAIN_MENU) {
      initPhysicsSession();
    }
  }, [
    saveData.selectedCar,
    saveData.selectedMap,
    screen,
    initPhysicsSession,
  ]);

  const commitSessionProgress = useCallback(() => {
    const p = physicsRef.current;
    if (!p) return;
    const earned = p.sessionCoins;
    const dist = p.maxDistance;
    p.sessionCoins = 0;

    setSaveData((prev) => {
      const prevBest = prev.bestDistanceByMap[prev.selectedMap] || 0;
      const updated: SaveData = {
        ...prev,
        coins: prev.coins + earned,
        totalCoinsEarned: prev.totalCoinsEarned + earned,
        bestDistanceByMap: {
          ...prev.bestDistanceByMap,
          [prev.selectedMap]: Math.max(prevBest, dist),
        },
      };
      persistSaveData(updated);
      return updated;
    });
  }, []);

  const startRace = () => {
    soundEngine.playClick();
    setActiveModal(MenuModal.NONE);
    setIsPausedAfterShop(false);
    initPhysicsSession();
    setScreen(ScreenState.PLAYING);
  };

  const returnToHomeMenu = () => {
    soundEngine.playClick();
    setActiveModal(MenuModal.NONE);
    setIsPausedAfterShop(false);
    commitSessionProgress();
    setScreen(ScreenState.MAIN_MENU);
  };

  const handleContinueGameAfterShop = () => {
    soundEngine.playClick();
    previewCarColorRef.current = null;
    setPreviewCarColor(null);
    setActiveModal(MenuModal.NONE);
    setIsPausedAfterShop(false);
    if (screen !== ScreenState.PLAYING) {
      setScreen(ScreenState.PLAYING);
    }
  };

  // In-Game Special Items Shop & Instant Activation Handlers
  const formatCountdown = (sec: number) => {
    const clamped = Math.max(0, Math.ceil(sec));
    const m = Math.floor(clamped / 60);
    const s = clamped % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleUseFlightWings = () => {
    const p = physicsRef.current;
    if (!p || p.isExploded) return;
    if (p.flightPhase === 'flying' || p.flightPhase === 'transform_takeoff') {
      return;
    }
    const wingsOwned = saveData.inventory?.flightWings ?? 0;
    if (wingsOwned <= 0) {
      soundEngine.playClick();
      controlsRef.current = { gas: false, brake: false, boost: false };
      if (screen === ScreenState.PLAYING) {
        setIsPausedAfterShop(true);
      }
      setActiveModal(MenuModal.SHOP);
      return;
    }
    if (activateFlightWings(p)) {
      soundEngine.playWingTransformSFX(true);
      setSaveData((prev) => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          flightWings: Math.max(0, (prev.inventory?.flightWings ?? 1) - 1),
        },
      }));
      setHudState((prev) => ({
        ...prev,
        flightPhase: p.flightPhase,
        flightTimer: p.flightTimer,
      }));
    }
  };

  const handleUseRepairKit = () => {
    const p = physicsRef.current;
    if (!p || p.isExploded) return;
    const kitsOwned = saveData.inventory?.repairKits ?? 0;
    const isCarUndamaged =
      Math.round(p.health) >= 100 &&
      p.frontDamage === 0 &&
      p.rearDamage === 0 &&
      p.roofDamage === 0 &&
      p.doorDamage === 0 &&
      !p.headlightsBroken;

    if (kitsOwned <= 0) {
      soundEngine.playClick();
      if (isCarUndamaged) {
        triggerHudAlert('السيارة سليمة تماماً! · Car is undamaged!');
      }
      controlsRef.current = { gas: false, brake: false, boost: false };
      if (screen === ScreenState.PLAYING) {
        setIsPausedAfterShop(true);
      }
      setActiveModal(MenuModal.SHOP);
      return;
    }

    if (isCarUndamaged) {
      soundEngine.playClick();
      triggerHudAlert('السيارة سليمة تماماً! · Car is undamaged!');
      p.floatingTexts.push({
        id: p.nextEntityId++,
        x: p.x,
        y: p.y - 58,
        text: 'السيارة سليمة 100%! · Car is undamaged!',
        color: '#38BDF8',
        alpha: 1,
        vy: -36,
      });
      return;
    }

    repairVehicleCompletely(p);
    soundEngine.playRepairWrenchSFX();
    setSaveData((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        repairKits: Math.max(0, (prev.inventory?.repairKits ?? 1) - 1),
      },
    }));
    setHudState((prev) => ({
      ...prev,
      carHealth: 100,
      headlightsBroken: false,
      headlightsOn: p.headlightsOn,
    }));
  };

  const handleBuyShopItem = (
    itemType: 'nitro' | 'repair' | 'wings',
    cost: number,
    useImmediately: boolean = false
  ) => {
    const p = physicsRef.current;
    const totalAvailableCoins =
      saveData.coins + (screen === ScreenState.PLAYING ? p?.sessionCoins || 0 : 0);
    if (totalAvailableCoins < cost) return;

    if (screen === ScreenState.PLAYING && p && p.sessionCoins > 0) {
      const deductFromSession = Math.min(p.sessionCoins, cost);
      p.sessionCoins -= deductFromSession;
      const remainder = cost - deductFromSession;
      setSaveData((prev) => ({
        ...prev,
        coins: Math.max(0, prev.coins - remainder),
      }));
    } else {
      setSaveData((prev) => ({
        ...prev,
        coins: Math.max(0, prev.coins - cost),
      }));
    }

    if (itemType === 'nitro') {
      soundEngine.playNitroThrust();
      if (useImmediately && p) {
        p.nitro = 100;
        p.fuel = p.maxFuel;
        setIsPausedAfterShop(false);
        setActiveModal(MenuModal.NONE);
      } else {
        setSaveData((prev) => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            nitroPacks: (prev.inventory?.nitroPacks ?? 0) + 1,
          },
        }));
      }
      if (p) {
        p.nitro = 100;
      }
    } else if (itemType === 'repair') {
      soundEngine.playRepairWrenchSFX();
      if (useImmediately && p) {
        repairVehicleCompletely(p);
        setHudState((prev) => ({
          ...prev,
          carHealth: 100,
          headlightsBroken: false,
          headlightsOn: p.headlightsOn,
        }));
        setIsPausedAfterShop(false);
        setActiveModal(MenuModal.NONE);
      } else {
        setSaveData((prev) => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            repairKits: (prev.inventory?.repairKits ?? 0) + 1,
          },
        }));
      }
    } else if (itemType === 'wings') {
      if (useImmediately && p && screen === ScreenState.PLAYING) {
        activateFlightWings(p);
        soundEngine.playWingTransformSFX(true);
        setIsPausedAfterShop(false);
        setActiveModal(MenuModal.NONE);
      } else {
        soundEngine.playWingTransformSFX(true);
        setSaveData((prev) => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            flightWings: (prev.inventory?.flightWings ?? 0) + 1,
          },
        }));
      }
    }
  };

  const toggleFullscreenLandscape = () => {
    soundEngine.playClick();
    const docEl = document.documentElement;
    if (!document.fullscreenElement && docEl.requestFullscreen) {
      docEl
        .requestFullscreen()
        .then(() => {
          const scr = window.screen as Screen & {
            orientation?: { lock?: (mode: string) => Promise<void> };
          };
          if (scr.orientation && scr.orientation.lock) {
            scr.orientation.lock('landscape').catch(() => {});
          }
        })
        .catch(() => {});
    } else if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard Controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screenRef.current !== ScreenState.PLAYING) return;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        controlsRef.current.gas = true;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        controlsRef.current.brake = true;
      } else if (e.key === ' ' || e.key === 'Shift') {
        if (!controlsRef.current.boost && !e.repeat) {
          soundEngine.playNitroThrust();
        }
        controlsRef.current.boost = true;
      } else if (e.key === 'Escape') {
        setScreen(ScreenState.PAUSED);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        controlsRef.current.gas = false;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        controlsRef.current.brake = false;
      } else if (e.key === ' ' || e.key === 'Shift') {
        controlsRef.current.boost = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main Canvas Resize (Forced Landscape Dimensions) + Stutter-Free 60 FPS Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx =
      canvas.getContext('2d', { alpha: false, desynchronized: true }) ||
      canvas.getContext('2d', { alpha: false }) ||
      canvas.getContext('2d');
    if (!ctx) return;

    let logicalWidth = window.innerWidth;
    let logicalHeight = window.innerHeight;
    let activeDpr = Math.min(1.25, Math.max(1.0, window.devicePixelRatio || 1.0));

    let lastQuality: GraphicsQuality = saveDataRef.current.settings.quality || 'High';

    const getDprForQuality = (q: GraphicsQuality) => {
      const deviceDpr = window.devicePixelRatio || 1.0;
      if (q === 'Ultra') return Math.min(1.5, Math.max(1.0, deviceDpr));
      if (q === 'High') return Math.min(1.25, Math.max(1.0, deviceDpr));
      if (q === 'Medium') return 1.0;
      return 0.85;
    };

    const handleResize = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      logicalWidth = isPortrait ? window.innerHeight : window.innerWidth;
      logicalHeight = isPortrait ? window.innerWidth : window.innerHeight;
      lastQuality = saveDataRef.current.settings.quality || 'High';
      activeDpr = getDprForQuality(lastQuality);
      canvas.width = Math.round(logicalWidth * activeDpr);
      canvas.height = Math.round(logicalHeight * activeDpr);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    if (!physicsRef.current) {
      initPhysicsSession();
    }

    let animId = 0;
    let lastRenderTime = performance.now();
    let lastPhysicsTime = performance.now();
    let lastHudUpdate = performance.now();
    let frameCounter = 0;
    let fpsTimer = performance.now();
    let measuredFps = saveDataRef.current.settings.fpsLimit || 60;

    const tick = (now: number) => {
      animId = requestAnimationFrame(tick);

      const currentSave = saveDataRef.current;
      const targetFps = Number(currentSave.settings.fpsLimit) || 60;
      const minFrameInterval = 1000 / targetFps;
      const elapsed = now - lastRenderTime;

      // Active real-time frame-rate limiter & delta-time throttle for 30, 60, 90, 120, 144 FPS
      if (elapsed < minFrameInterval - 0.75) {
        return;
      }
      lastRenderTime = now - (elapsed % minFrameInterval);
      const rawDeltaMs = Math.min(Math.max(now - lastPhysicsTime, 1), 50);
      lastPhysicsTime = now;
      const deltaTime = rawDeltaMs * 0.001;
      const physicsSteps = deltaTime > 0.022 ? 2 : 1;
      const stepDt = deltaTime / physicsSteps;
      frameCounter++;

      if (currentSave.settings.quality !== lastQuality) {
        handleResize();
      }

      if (now - fpsTimer >= 400) {
        const rawFps = Math.round((frameCounter * 1000) / (now - fpsTimer));
        measuredFps = Math.min(targetFps, Math.max(1, rawFps));
        frameCounter = 0;
        fpsTimer = now;
      }

      const baseCar =
        CARS_CATALOG.find((c) => c.id === currentSave.selectedCar) ||
        CARS_CATALOG[0];
      const customCol =
        previewCarColorRef.current || currentSave.carColors?.[baseCar.id];
      const car = customCol
        ? {
            ...baseCar,
            bodyColor: customCol.bodyColor,
            secondaryColor: customCol.secondaryColor,
            accentColor: customCol.bodyColor,
          }
        : baseCar;

      // Skip heavy 2D canvas physics & rendering while splash logos are fading in/out, while keeping engine audio warmed up and ready!
      if (
        screenRef.current === ScreenState.SPLASH_MIDO ||
        screenRef.current === ScreenState.SPLASH_GAME
      ) {
        soundEngine.updateEngineSound(0.3, false, false, false, car, false);
        return;
      }

      const map =
        MAPS_CATALOG.find((m) => m.id === currentSave.selectedMap) ||
        MAPS_CATALOG[0];
      const upgrades = currentSave.upgrades[car.id] || {
        engine: 0,
        armor: 0,
        exhaustSound: 0,
        suspension: 0,
        tires: 0,
        fuel: 0,
      };
      const pState = physicsRef.current;
      if (!pState) return;

      if (screenRef.current === ScreenState.CINEMATIC_INTRO) {
        if (!cinematicStartRef.current) {
          cinematicStartRef.current = now;
          cinematicSoundStageRef.current = 0;
        }
        const elapsedSec = (now - cinematicStartRef.current) * 0.001;
        // Always use the Default Game Map (MAPS_CATALOG[0] - Forest Valley) for the In-Engine Cinematic Scene
        const defaultCinematicMap = MAPS_CATALOG[0];

        ctx.setTransform(activeDpr, 0, 0, activeDpr, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';

        const cutsceneRes = renderActionCinematicCutscene(
          ctx,
          logicalWidth,
          logicalHeight,
          elapsedSec,
          pState,
          car,
          defaultCinematicMap,
          currentSave.settings.quality
        );

        // Authentic Car Engine Sound & Synchronized SFX across the 20-Second Sequence:
        // (0-5s): Driver in cabin revving engine & preparing to launch
        // (5-10s): Exciting launch with 100% authentic original car engine sound, crossing rocks & water pit
        // (10-15s): Pressing Nitro, deploying Airplane Wings & climbing into the sky
        // (15-20s): Gradual soft smoke fade & smooth audio fade-out to Main Menu
        soundEngine.updateEnvironmentAmbience(
          pState.nightFactor,
          pState.rainIntensity
        );

        if (elapsedSec < 5.0) {
          const rev1 =
            elapsedSec >= 0.6 && elapsedSec <= 2.25
              ? Math.sin(((elapsedSec - 0.6) / 1.65) * Math.PI)
              : 0;
          const rev2 =
            elapsedSec >= 2.55 && elapsedSec <= 4.15
              ? Math.sin(((elapsedSec - 2.55) / 1.6) * Math.PI)
              : 0;
          const launchPrep = elapsedSec >= 4.15 ? (elapsedSec - 4.15) / 0.85 : 0;
          const simSpeedRatio = Math.max(
            0.28,
            rev1 * 0.76,
            rev2 * 0.94,
            launchPrep * 0.85
          );
          const isRevving = rev1 > 0.08 || rev2 > 0.08 || launchPrep > 0.05;
          soundEngine.updateEngineSound(
            simSpeedRatio,
            isRevving,
            false,
            launchPrep > 0.45,
            car,
            false
          );
        } else if (elapsedSec < 10.0) {
          soundEngine.updateEngineSound(
            Math.max(0.58, pState.vx / 390),
            true,
            false,
            false,
            car,
            false
          );
        } else if (elapsedSec < 15.0) {
          soundEngine.updateEngineSound(
            Math.max(0.78, pState.vx / 380),
            true,
            false,
            true,
            car,
            pState.flightPhase !== 'none'
          );
        } else if (elapsedSec < 19.6) {
          const fadeFactor = Math.max(0.35, 1 - (elapsedSec - 15.0) / 5.5);
          soundEngine.updateEngineSound(
            Math.max(0.32, (pState.vx / 400) * fadeFactor),
            fadeFactor > 0.25,
            false,
            fadeFactor > 0.45,
            car,
            pState.flightPhase !== 'none' && fadeFactor > 0.25
          );
        } else {
          soundEngine.updateEngineSound(0.3, false, false, false, car, false);
        }

        // Trigger synchronized one-shot SFX at exact milestones of the 20-second timeline
        // (Backfire is muted when stationary in cabin 0-5s, triggering only when actively driving/accelerating)
        if (elapsedSec >= 6.0 && cinematicSoundStageRef.current < 3) {
          cinematicSoundStageRef.current = 3;
          soundEngine.playImpactThud(0.55);
        } else if (elapsedSec >= 7.05 && cinematicSoundStageRef.current < 4) {
          cinematicSoundStageRef.current = 4;
          soundEngine.playBridgeMechanismSFX(0.95);
        } else if (elapsedSec >= 8.5 && cinematicSoundStageRef.current < 5) {
          cinematicSoundStageRef.current = 5;
          soundEngine.playWaterSplashSFX(0.82);
        } else if (elapsedSec >= 10.0 && cinematicSoundStageRef.current < 6) {
          cinematicSoundStageRef.current = 6;
          soundEngine.playNitroThrust();
          soundEngine.playExhaustBackfire(0.95);
        } else if (elapsedSec >= 11.0 && cinematicSoundStageRef.current < 7) {
          cinematicSoundStageRef.current = 7;
          soundEngine.playWingTransformSFX(true);
        }

        if (cutsceneRes.finished) {
          initPhysicsSession();
          setScreen(ScreenState.MAIN_MENU);
        }
        return;
      }

      if (
        screenRef.current === ScreenState.PLAYING &&
        activeModalRef.current === MenuModal.NONE &&
        !isPausedAfterShopRef.current
      ) {
        let result = { gameOverReason: null as string | null };
        for (let stepIdx = 0; stepIdx < physicsSteps; stepIdx++) {
          result = stepPhysics(
            pState,
            car,
            map,
            upgrades,
            controlsRef.current,
            currentSave.settings.quality,
            () => soundEngine.playCoin(),
            () => soundEngine.playFuel(),
            (intensity) => {
              if (
                Math.abs(pState.vx) > 28 &&
                (controlsRef.current.gas ||
                  controlsRef.current.boost ||
                  Math.abs(pState.vx) > 95)
              ) {
                soundEngine.playExhaustBackfire(
                  intensity,
                  upgrades.exhaustSound || 0
                );
              }
            },
            (intensity) => soundEngine.playImpactThud(intensity),
            (intensity) => soundEngine.playThunderclap(intensity),
            () => soundEngine.playCarExplosion(),
            (isGlassShatter) => soundEngine.playPartBreakOrGlassShatter(isGlassShatter),
            () => soundEngine.playRepairWrenchSFX(),
            (isDeploying) => soundEngine.playWingTransformSFX(isDeploying),
            (stage) => soundEngine.playDriverDoorDamageSFX(stage),
            (intensity) => soundEngine.playBridgeMechanismSFX(intensity),
            stepDt
          );
          if (result.gameOverReason) break;
        }

        soundEngine.updateEngineSound(
          pState.vx / 320,
          controlsRef.current.gas && !pState.isExploded,
          controlsRef.current.brake && !pState.isExploded,
          controlsRef.current.boost && pState.nitro > 0 && !pState.isExploded,
          car,
          pState.flightPhase !== 'none' && !pState.isExploded,
          upgrades.exhaustSound || 0
        );

        soundEngine.updateEnvironmentAmbience(
          pState.nightFactor,
          pState.rainIntensity
        );

        if (result.gameOverReason) {
          soundEngine.stopEngineSound();
          soundEngine.stopEnvironmentAmbience();
          setGameOverReason(result.gameOverReason);
          commitSessionProgress();
          setScreen(ScreenState.GAME_OVER);
        }

        if (now - lastHudUpdate > 125) {
          lastHudUpdate = now;
          const nextFuelPct = Math.round((pState.fuel / pState.maxFuel) * 100);
          const nextNitroPct = Math.round(pState.nitro);
          const nextSpeedKmh = Math.round(Math.abs(pState.vx) * 0.36);
          const nextHealth = Math.max(0, Math.round(pState.health));
          const nextRain = Math.round(pState.rainIntensity * 10) / 10;
          const nextCloud = Math.round(pState.cloudDarkness * 10) / 10;
          const nextNight = Math.round(pState.nightFactor * 10) / 10;
          const nextFlightTimer = Math.round(pState.flightTimer * 10) / 10;

          setHudState((prev) => {
            if (
              prev.distance === pState.distance &&
              prev.sessionCoins === pState.sessionCoins &&
              prev.fuelPct === nextFuelPct &&
              prev.nitroPct === nextNitroPct &&
              prev.speedKmh === nextSpeedKmh &&
              prev.fps === measuredFps &&
              prev.flips === pState.flipsCount &&
              prev.carHealth === nextHealth &&
              prev.weatherLabel === pState.weatherLabel &&
              prev.rainIntensity === nextRain &&
              prev.cloudDarkness === nextCloud &&
              prev.nightFactor === nextNight &&
              prev.headlightsOn === pState.headlightsOn &&
              prev.headlightsBroken === pState.headlightsBroken &&
              prev.flightPhase === pState.flightPhase &&
              prev.flightTimer === nextFlightTimer &&
              prev.isExploded === pState.isExploded
            ) {
              return prev;
            }
            return {
              distance: pState.distance,
              sessionCoins: pState.sessionCoins,
              fuelPct: nextFuelPct,
              nitroPct: nextNitroPct,
              speedKmh: nextSpeedKmh,
              fps: measuredFps,
              flips: pState.flipsCount,
              carHealth: nextHealth,
              weatherLabel: pState.weatherLabel,
              rainIntensity: nextRain,
              cloudDarkness: nextCloud,
              nightFactor: nextNight,
              headlightsOn: pState.headlightsOn,
              headlightsBroken: pState.headlightsBroken,
              flightPhase: pState.flightPhase,
              flightTimer: nextFlightTimer,
              isExploded: pState.isExploded,
            };
          });
        }
      } else if (screenRef.current === ScreenState.MAIN_MENU) {
        for (let stepIdx = 0; stepIdx < physicsSteps; stepIdx++) {
          stepPhysics(
            pState,
            car,
            map,
            upgrades,
            { gas: false, brake: false, boost: false },
            currentSave.settings.quality,
            () => {},
            () => {},
            undefined,
            undefined,
            (intensity) => soundEngine.playThunderclap(intensity),
            () => soundEngine.playCarExplosion(),
            (isGlassShatter) => soundEngine.playPartBreakOrGlassShatter(isGlassShatter),
            undefined,
            undefined,
            undefined,
            undefined,
            stepDt
          );
        }
        // Keep car smoothly upright on all four wheels in the background preview/demo sequence
        pState.angVel *= 0.35;
        pState.angle = Math.max(-0.2, Math.min(0.2, pState.angle));
        pState.vy = Math.max(-60, Math.min(60, pState.vy));
        pState.isExploded = false;
        pState.health = 100;
        soundEngine.updateEngineSound(
          Math.max(0.3, Math.abs(pState.vx) / 480),
          false,
          false,
          false,
          car,
          false
        );
        soundEngine.updateEnvironmentAmbience(
          pState.nightFactor,
          pState.rainIntensity
        );
        if (now - lastHudUpdate > 350) {
          lastHudUpdate = now;
          const nextRain = Math.round(pState.rainIntensity * 10) / 10;
          const nextCloud = Math.round(pState.cloudDarkness * 10) / 10;
          const nextNight = Math.round(pState.nightFactor * 10) / 10;
          setHudState((prev) => {
            if (
              prev.weatherLabel === pState.weatherLabel &&
              prev.rainIntensity === nextRain &&
              prev.cloudDarkness === nextCloud &&
              prev.nightFactor === nextNight &&
              prev.headlightsOn === pState.headlightsOn
            ) {
              return prev;
            }
            return {
              ...prev,
              weatherLabel: pState.weatherLabel,
              rainIntensity: nextRain,
              cloudDarkness: nextCloud,
              nightFactor: nextNight,
              headlightsOn: pState.headlightsOn,
            };
          });
        }
      } else if (
        screenRef.current === ScreenState.PAUSED ||
        (screenRef.current === ScreenState.PLAYING &&
          (activeModalRef.current !== MenuModal.NONE ||
            isPausedAfterShopRef.current))
      ) {
        soundEngine.updateEngineSound(
          0.28,
          false,
          false,
          false,
          car,
          false,
          upgrades.exhaustSound || 0
        );
        soundEngine.updateEnvironmentAmbience(
          pState.nightFactor,
          pState.rainIntensity
        );
      }

      ctx.setTransform(activeDpr, 0, 0, activeDpr, 0, 0);
      ctx.imageSmoothingEnabled = currentSave.settings.quality !== 'Low';
      ctx.imageSmoothingQuality =
        currentSave.settings.quality === 'Ultra'
          ? 'high'
          : currentSave.settings.quality === 'High'
          ? 'medium'
          : 'low';

      renderGameCanvas(
        ctx,
        logicalWidth,
        logicalHeight,
        pState,
        car,
        map,
        currentSave.settings.quality,
        controlsRef.current,
        screenRef.current !== ScreenState.PLAYING &&
          screenRef.current !== ScreenState.PAUSED &&
          screenRef.current !== ScreenState.GAME_OVER,
        false
      );
    };

    animId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [initPhysicsSession, commitSessionProgress]);

  const handleUpgrade = (part: 'engine' | 'armor' | 'exhaustSound') => {
    const level = currentUpgrades[part] || 0;
    if (level >= 100) return;
    const cost = getUpgradeCost(level);
    if (saveData.coins < cost) return;

    soundEngine.playUnlock();
    if (part === 'exhaustSound') {
      soundEngine.playCarRevPreview(selectedCar);
      soundEngine.playExhaustBackfire(1.15, level + 1);
    }
    setSaveData((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      upgrades: {
        ...prev.upgrades,
        [selectedCar.id]: {
          ...currentUpgrades,
          [part]: level + 1,
          ...(part === 'engine' ? { tires: level + 1, fuel: level + 1 } : {}),
          ...(part === 'armor' ? { suspension: level + 1 } : {}),
        },
      },
    }));
  };

  const handleChangeCarColor = (
    customColor: CustomCarColor | null,
    isPurchase: boolean = false,
    explicitPrice?: number
  ) => {
    if (!customColor) {
      soundEngine.playClick();
      previewCarColorRef.current = null;
      setPreviewCarColor(null);
      setSaveData((prev) => {
        const nextColors = { ...(prev.carColors || {}) };
        if (baseSelectedCar.bodyColor.toLowerCase() === '#ff001e') {
          delete nextColors[selectedCar.id];
        } else {
          nextColors[selectedCar.id] = {
            bodyColor: '#FF001E',
            secondaryColor: '#FF001E',
            accentColor: '#FF001E',
          };
        }
        const nextState: SaveData = {
          ...prev,
          carColors: nextColors,
        };
        saveDataRef.current = nextState;
        return nextState;
      });
      triggerHudAlert('🎨 تم استعادة اللون الافتراضي (أحمر ناري) للسيارة والطاوات!');
      return;
    }

    // Ensure wheel rims / wheel hubs ("الطاوات") always match the exact car paint color!
    const syncedColor: CustomCarColor = {
      bodyColor: customColor.bodyColor,
      secondaryColor: customColor.secondaryColor || customColor.bodyColor,
      accentColor: customColor.bodyColor,
    };

    if (!isPurchase) {
      // Previewing from custom color picker inputs
      soundEngine.playClick();
      previewCarColorRef.current = syncedColor;
      setPreviewCarColor(syncedColor);
      return;
    }

    const normHex = syncedColor.bodyColor.toLowerCase();
    const alreadyOwned = isCarColorOwned(normHex);
    const targetPrice =
      typeof explicitPrice === 'number'
        ? explicitPrice
        : getCarColorPrice(syncedColor.bodyColor);

    if (alreadyOwned) {
      soundEngine.playClick();
      previewCarColorRef.current = null;
      setPreviewCarColor(null);
      setSaveData((prev) => {
        const nextColors = { ...(prev.carColors || {}) };
        nextColors[selectedCar.id] = syncedColor;
        const prevUnlocked = prev.unlockedCarColors?.[selectedCar.id] || [];
        const nextUnlockedForCar = prevUnlocked.some(
          (c) => c.toLowerCase() === normHex
        )
          ? prevUnlocked
          : [...prevUnlocked, normHex];
        const nextState: SaveData = {
          ...prev,
          carColors: nextColors,
          unlockedCarColors: {
            ...(prev.unlockedCarColors || {}),
            [selectedCar.id]: nextUnlockedForCar,
          },
        };
        saveDataRef.current = nextState;
        return nextState;
      });
      triggerHudAlert('🎨 تم اختيار وتفعيل اللون على السيارة والطاوات!');
      return;
    }

    const canAfford = saveData.coins >= targetPrice;
    if (!canAfford) {
      soundEngine.playClick();
      previewCarColorRef.current = syncedColor;
      setPreviewCarColor(syncedColor);
      triggerHudAlert(
        `⚠️ تحتاج إلى ${targetPrice.toLocaleString()} كوينز لشراء وحفظ اللون! (تمت المعاينة مجاناً)`
      );
      return;
    }

    soundEngine.playUnlock();
    previewCarColorRef.current = null;
    setPreviewCarColor(null);
    setSaveData((prev) => {
      const nextColors = { ...(prev.carColors || {}) };
      nextColors[selectedCar.id] = syncedColor;
      const prevUnlocked = prev.unlockedCarColors?.[selectedCar.id] || [];
      const nextUnlockedForCar = prevUnlocked.some(
        (c) => c.toLowerCase() === normHex
      )
        ? prevUnlocked
        : [...prevUnlocked, normHex];
      const nextState: SaveData = {
        ...prev,
        coins: Math.max(0, prev.coins - targetPrice),
        carColors: nextColors,
        unlockedCarColors: {
          ...(prev.unlockedCarColors || {}),
          [selectedCar.id]: nextUnlockedForCar,
        },
      };
      saveDataRef.current = nextState;
      return nextState;
    });
    triggerHudAlert(
      `🎨 تم شراء وحفظ لون السيارة والطاوات مقابل ${targetPrice.toLocaleString()} كوينز!`
    );
  };

  const handleSelectOrBuyCar = (car: CarConfig) => {
    const isUnlocked = saveData.unlockedCars.includes(car.id);
    if (isUnlocked) {
      soundEngine.playCarRevPreview(car);
      setSaveData((prev) => ({ ...prev, selectedCar: car.id }));
      return;
    }
    if (saveData.coins >= car.price) {
      soundEngine.playUnlock();
      soundEngine.playCarRevPreview(car);
      setSaveData((prev) => ({
        ...prev,
        coins: prev.coins - car.price,
        unlockedCars: [...prev.unlockedCars, car.id],
        selectedCar: car.id,
      }));
    }
  };

  const handleSelectOrBuyMap = (map: MapConfig) => {
    const isUnlocked = saveData.unlockedMaps.includes(map.id);
    if (isUnlocked) {
      soundEngine.playClick();
      setSaveData((prev) => ({ ...prev, selectedMap: map.id }));
      return;
    }
    if (saveData.coins >= map.price) {
      soundEngine.playUnlock();
      setSaveData((prev) => ({
        ...prev,
        coins: prev.coins - map.price,
        unlockedMaps: [...prev.unlockedMaps, map.id],
        selectedMap: map.id,
      }));
    }
  };

  const handleSaveSettings = () => {
    soundEngine.playUnlock();
    savedSettingsRef.current = structuredClone(saveData.settings);
    saveSettingsToLocalStorage(saveData.settings);
    persistSaveData(saveData);
    soundEngine.updateSettings(saveData.settings);
    setSettingsSavedToast(true);
    window.setTimeout(() => setSettingsSavedToast(false), 2800);
  };

  const handleCloseModal = () => {
    soundEngine.playClick();
    if (activeModal === MenuModal.SETTINGS) {
      // Persist current settings on close so FPS Limit & Graphics Quality changes stay active immediately
      savedSettingsRef.current = structuredClone(saveData.settings);
      saveSettingsToLocalStorage(saveData.settings);
      persistSaveData(saveData);
      soundEngine.updateSettings(saveData.settings);
    }
    setSettingsSavedToast(false);
    previewCarColorRef.current = null;
    setPreviewCarColor(null);
    setIsPausedAfterShop(false);
    setActiveModal(MenuModal.NONE);
  };

  const handleDownloadStandaloneHtml = () => {
    soundEngine.playClick();
    const htmlContent = generateStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyStandaloneHtml = () => {
    soundEngine.playClick();
    navigator.clipboard.writeText(generateStandaloneHtml()).then(() => {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    });
  };

  return (
    <div className="forced-landscape-stage relative w-screen h-screen overflow-hidden bg-slate-950 select-none flex flex-col justify-between">
      {/* Live Widescreen 16:9 Daytime & Spring Physics Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block z-0"
      />

      {/* 1. TWO-STAGE SPLASH SCREEN SEQUENCE WITH SUB-BASS BOOM ("بمّّم") — SMOOTH ZERO-LAG FADE-IN/OUT & UNCLIPPED LOGO */}
      {(screen === ScreenState.SPLASH_MIDO ||
        screen === ScreenState.SPLASH_GAME) && (
        <div
          onPointerDown={() =>
            soundEngine.playSplashRockstar(
              screen === ScreenState.SPLASH_MIDO ? 1 : 2
            )
          }
          className="absolute inset-0 z-50 flex items-center justify-center px-4 sm:px-8 md:px-14 py-2 overflow-visible cursor-pointer"
          style={{
            background:
              screen === ScreenState.SPLASH_MIDO
                ? 'radial-gradient(circle at center, #1E050A 0%, #090408 55%, #020617 100%)'
                : 'radial-gradient(circle at center, #08203E 0%, #050B16 60%, #020617 100%)',
          }}
        >
          {screen === ScreenState.SPLASH_MIDO ? (
            /* SCREEN 1: Personal MIDO NX Crowned M Logo */
            <div className="flex flex-row items-center justify-center gap-6 sm:gap-10 md:gap-14 max-w-5xl w-full animate-rockstar-logo">
              <MidoNxLogo size={200} className="shrink-0" />

              <div className="text-right space-y-2">
                <p className="font-display text-xs md:text-sm font-bold tracking-widest text-red-500">
                  MIDO NX STUDIOS · SUB-BASS CINEMATIC EDITION
                </p>
                <h1 className="font-display text-4xl md:text-6xl font-black italic tracking-wider text-white">
                  MIDO <span className="text-red-500">NX</span>
                </h1>
                <p className="text-sm md:text-base text-slate-300 max-w-md">
                  تقديم النسخة الاحترافية عالية الدقة (Daytime & Spring Physics)
                </p>
              </div>
            </div>
          ) : (
            /* SCREEN 2: Independent Official Game Logo "Mido NX: Apex Hill Racing" (Fully Unclipped!) */
            <div className="max-w-5xl w-full flex items-center justify-center overflow-visible animate-apex-logo">
              <ApexGameLogo />
            </div>
          )}
        </div>
      )}

      {/* 1B. ACTION CINEMATIC INTRO CUTSCENE OVERLAY — Skip Button ONLY in Bottom-Left during Cinematic Scene! */}
      {screen === ScreenState.CINEMATIC_INTRO && (
        <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-end p-5 sm:p-8">
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                initPhysicsSession();
                setScreen(ScreenState.MAIN_MENU);
              }}
              className="pointer-events-auto px-5 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 active:scale-95 text-amber-400 font-display font-bold text-xs sm:text-sm border border-amber-400/50 shadow-[0_0_20px_rgba(2,6,23,0.9)] transition-all cursor-pointer"
            >
              Skip (تخطي المشهد السينمائي)
            </button>
          </div>
        </div>
      )}

      {/* 2. HORIZONTAL TOP BAR CONTRACT (Hidden during Cinematic Intro; Logo is Static Display Only & Hidden during Gameplay!) */}
      {screen !== ScreenState.CINEMATIC_INTRO && (
        <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 md:px-8 py-2 bg-transparent border-none opacity-85 hover:opacity-100 transition-opacity shrink-0">
          {/* Zone 1: Static Non-Clickable Brand Logo & Title (Visible ONLY in Main Menu — Hidden during Gameplay!) */}
          {screen === ScreenState.MAIN_MENU ? (
            <div
              aria-label="APEX HILL RACING"
              className="flex items-center gap-2 font-display text-base md:text-lg font-black italic tracking-tight text-amber-400 whitespace-nowrap shrink-0 pointer-events-none select-none"
            >
              <OfficialGameCoverIcon size={34} className="shrink-0" />
              <span>APEX HILL RACING</span>
            </div>
          ) : (
            <div className="w-2 shrink-0" />
          )}

        {/* Zone 2: Telemetry (Gameplay Only — Clean Top Edge in Main Menu) */}
        {screen === ScreenState.MAIN_MENU ? (
          <div className="w-2 shrink-0" />
        ) : (
          <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm font-mono-num text-slate-200">
            <span>
              المسافة:{' '}
              <strong className="text-cyan-400">{hudState.distance}m</strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>
              كوينز:{' '}
              <strong className="text-amber-400">
                +{hudState.sessionCoins}
              </strong>
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>
              السرعة:{' '}
              <strong className="text-emerald-400">
                {hudState.speedKmh} km/h
              </strong>
            </span>
          </div>
        )}

        {/* Zone 3: Coins Counter + Fullscreen + Home Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-mono-num text-amber-400 font-semibold whitespace-nowrap">
            <Coins className="w-4 h-4" />
            <span>
              {(
                saveData.coins +
                (screen === ScreenState.PLAYING ? hudState.sessionCoins : 0)
              ).toLocaleString()}{' '}
              كوينز
            </span>
          </div>

          {saveData.settings.showFpsCounter && (
            <span className="hidden sm:inline text-xs font-mono-num text-slate-400 whitespace-nowrap">
              · {hudState.fps} FPS
            </span>
          )}

          {screen === ScreenState.MAIN_MENU ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (physicsRef.current) {
                    const nextLabel = advanceWeatherPhaseManual(physicsRef.current);
                    setHudState((prev) => ({
                      ...prev,
                      weatherLabel: nextLabel,
                      rainIntensity: physicsRef.current!.rainIntensity,
                      cloudDarkness: physicsRef.current!.cloudDarkness,
                      nightFactor: physicsRef.current!.nightFactor,
                      headlightsOn: physicsRef.current!.headlightsOn,
                    }));
                    soundEngine.updateEnvironmentAmbience(
                      physicsRef.current.nightFactor,
                      physicsRef.current.rainIntensity
                    );
                    if (physicsRef.current.rainIntensity > 0.18) {
                      soundEngine.playThunderclap(1.15);
                    } else {
                      soundEngine.playClick();
                    }
                  }
                }}
                title="تبديل الوقت والطقس (الشروق · الظهر · العصر · المغرب · الليل الممطر)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-100 transition-colors cursor-pointer shrink-0"
              >
                {hudState.nightFactor > 0.4 && hudState.rainIntensity < 0.2 ? (
                  <Moon className="w-3.5 h-3.5 text-cyan-300" />
                ) : hudState.rainIntensity > 0.18 ? (
                  <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span className="hidden sm:inline">{hudState.weatherLabel}</span>
              </button>
              <button
                onClick={toggleFullscreenLandscape}
                title="ملء الشاشة بالوضع الأفقي (Fullscreen 16:9)"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isPausedAfterShop && (
                <button
                  onClick={handleContinueGameAfterShop}
                  className="px-4 py-1.5 text-xs sm:text-sm font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-xl border border-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.75)] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer animate-pulse"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>متابعة اللعب (Continue Game)</span>
                </button>
              )}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (isPausedAfterShop) {
                    setIsPausedAfterShop(false);
                    setScreen(ScreenState.PLAYING);
                    return;
                  }
                  setScreen((prev) =>
                    prev === ScreenState.PAUSED
                      ? ScreenState.PLAYING
                      : ScreenState.PAUSED
                  );
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>إيقاف</span>
              </button>

              <button
                onClick={returnToHomeMenu}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home (الرئيسية)</span>
              </button>
            </div>
          )}
        </div>
        </header>
      )}

      {/* 3. WIDESCREEN MAIN MENU WITH LEFT SIDEBAR (Shop directly under Maps in Left Sidebar!) */}
      {screen === ScreenState.MAIN_MENU && (
        <main
          dir="ltr"
          className="relative z-10 flex-1 min-h-0 flex items-end justify-between px-3 sm:px-6 md:px-10 py-2 sm:py-4 pointer-events-none"
        >
          {/* Left Sidebar Navigation Panel (الشريط الجانبي الأيسر: ألوان الخلفية والتوهج متطابقة ديناميكياً مع شعار وأيقونة كل زر!) */}
          <aside
            dir="rtl"
            onMouseLeave={() => setHoveredMenuCategory(MenuModal.NONE)}
            className={`w-52 sm:w-60 backdrop-blur-xl rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2 pointer-events-auto transition-all duration-300 ${
              hoveredMenuCategory === MenuModal.GARAGE ||
              activeModal === MenuModal.GARAGE
                ? 'bg-gradient-to-br from-amber-950/95 via-orange-950/90 to-yellow-950/95 border border-amber-400/75 shadow-[0_0_32px_rgba(245,158,11,0.45)]'
                : hoveredMenuCategory === MenuModal.SHOWROOM ||
                  activeModal === MenuModal.SHOWROOM
                ? 'bg-gradient-to-br from-red-950/95 via-rose-950/90 to-orange-950/95 border border-red-400/75 shadow-[0_0_32px_rgba(239,68,68,0.45)]'
                : hoveredMenuCategory === MenuModal.MAPS ||
                  activeModal === MenuModal.MAPS
                ? 'bg-gradient-to-br from-emerald-950/95 via-teal-950/90 to-green-950/95 border border-emerald-400/75 shadow-[0_0_32px_rgba(16,185,129,0.45)]'
                : hoveredMenuCategory === MenuModal.SHOP ||
                  activeModal === MenuModal.SHOP
                ? 'bg-gradient-to-br from-cyan-950/95 via-sky-950/90 to-blue-950/95 border border-cyan-400/80 shadow-[0_0_32px_rgba(6,182,212,0.5)]'
                : hoveredMenuCategory === MenuModal.SETTINGS ||
                  activeModal === MenuModal.SETTINGS
                ? 'bg-gradient-to-br from-purple-950/95 via-violet-950/90 to-fuchsia-950/95 border border-purple-400/75 shadow-[0_0_32px_rgba(168,85,247,0.45)]'
                : 'bg-gradient-to-br from-amber-950/85 via-indigo-950/90 to-purple-950/85 border border-amber-400/45 shadow-[0_0_28px_rgba(245,158,11,0.28),0_0_24px_rgba(6,182,212,0.22)]'
            }`}
          >
            {/* 1. Garage Button — Amber-Gold & Orange Wrench Logo Theme */}
            <button
              onMouseEnter={() => setHoveredMenuCategory(MenuModal.GARAGE)}
              onFocus={() => setHoveredMenuCategory(MenuModal.GARAGE)}
              onClick={() => {
                soundEngine.playClick();
                setActiveModal(MenuModal.GARAGE);
              }}
              className="w-full flex items-center gap-2.5 py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600/95 via-amber-700/95 to-orange-800/95 hover:from-amber-500 hover:via-amber-600 hover:to-orange-700 border border-amber-300/75 text-white font-bold text-xs md:text-sm shadow-[0_0_16px_rgba(245,158,11,0.4)] hover:shadow-[0_0_24px_rgba(251,191,36,0.65)] transition-all whitespace-nowrap cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-amber-400/25 border border-amber-300/60 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.45)]">
                <Wrench className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              </span>
              <span>Garage (الكراج)</span>
            </button>

            {/* 2. Cars Showroom Button — Crimson-Red & Fiery Rose Cover Car Logo Theme */}
            <button
              onMouseEnter={() => setHoveredMenuCategory(MenuModal.SHOWROOM)}
              onFocus={() => setHoveredMenuCategory(MenuModal.SHOWROOM)}
              onClick={() => {
                soundEngine.playClick();
                setActiveModal(MenuModal.SHOWROOM);
              }}
              className="w-full flex items-center gap-2.5 py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600/95 via-rose-700/95 to-orange-800/95 hover:from-red-500 hover:via-rose-600 hover:to-orange-700 border border-red-300/75 text-white font-bold text-xs md:text-sm shadow-[0_0_16px_rgba(239,68,68,0.42)] hover:shadow-[0_0_24px_rgba(248,113,113,0.68)] transition-all whitespace-nowrap cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-red-500/25 border border-red-300/60 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.45)]">
                <OfficialGameCoverIcon size={18} className="shrink-0" />
              </span>
              <span>Cars Showroom (المعرض)</span>
            </button>

            {/* 3. Maps Button — Lush Emerald-Green & Teal Map Logo Theme */}
            <button
              onMouseEnter={() => setHoveredMenuCategory(MenuModal.MAPS)}
              onFocus={() => setHoveredMenuCategory(MenuModal.MAPS)}
              onClick={() => {
                soundEngine.playClick();
                setActiveModal(MenuModal.MAPS);
              }}
              className="w-full flex items-center gap-2.5 py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600/95 via-emerald-700/95 to-teal-800/95 hover:from-emerald-500 hover:via-emerald-600 hover:to-teal-700 border border-emerald-300/75 text-white font-bold text-xs md:text-sm shadow-[0_0_16px_rgba(16,185,129,0.42)] hover:shadow-[0_0_24px_rgba(52,211,153,0.65)] transition-all whitespace-nowrap cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-emerald-400/25 border border-emerald-300/60 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.45)]">
                <MapIcon className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              </span>
              <span>Maps (الخرائط)</span>
            </button>

            {/* 4. Shop Button — Electric Cyan & Royal Blue Shopping Bag Logo Theme */}
            <button
              onMouseEnter={() => setHoveredMenuCategory(MenuModal.SHOP)}
              onFocus={() => setHoveredMenuCategory(MenuModal.SHOP)}
              onClick={() => {
                soundEngine.playClick();
                setActiveModal(MenuModal.SHOP);
              }}
              className="w-full flex items-center gap-2.5 py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600/95 via-sky-700/95 to-blue-800/95 hover:from-cyan-500 hover:via-sky-600 hover:to-blue-700 border border-cyan-300/80 text-white font-bold text-xs md:text-sm shadow-[0_0_18px_rgba(6,182,212,0.48)] hover:shadow-[0_0_26px_rgba(34,211,238,0.72)] transition-all whitespace-nowrap cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-cyan-400/25 border border-cyan-300/60 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-200 shrink-0" />
              </span>
              <span>Shop (المتجر)</span>
            </button>

            {/* 5. Settings Button — Royal Purple, Violet & Fuchsia Gear Logo Theme */}
            <button
              onMouseEnter={() => setHoveredMenuCategory(MenuModal.SETTINGS)}
              onFocus={() => setHoveredMenuCategory(MenuModal.SETTINGS)}
              onClick={() => {
                soundEngine.playClick();
                setActiveModal(MenuModal.SETTINGS);
              }}
              className="w-full flex items-center gap-2.5 py-2 sm:py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600/95 via-violet-700/95 to-fuchsia-800/95 hover:from-purple-500 hover:via-violet-600 hover:to-fuchsia-700 border border-purple-300/75 text-white font-bold text-xs md:text-sm shadow-[0_0_16px_rgba(168,85,247,0.42)] hover:shadow-[0_0_24px_rgba(192,132,252,0.68)] transition-all whitespace-nowrap cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-purple-400/25 border border-purple-300/60 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.45)]">
                <SettingsIcon className="w-3.5 h-3.5 text-purple-200 shrink-0" />
              </span>
              <span>Settings (الإعدادات)</span>
            </button>
          </aside>

          {/* Right Launch Action Button */}
          <div className="pointer-events-auto">
            <button
              onClick={startRace}
              className="px-7 sm:px-10 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 active:scale-95 text-white font-display font-black text-base sm:text-xl md:text-2xl tracking-wide shadow-2xl transition-all flex items-center justify-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-white" />
              <span>العب الآن (PLAY)</span>
            </button>
          </div>
        </main>
      )}

      {/* 4. ACTIVE GAMEPLAY HUD & TWO-HANDED CORNER PEDALS (16:9 Landscape) */}
      {screen === ScreenState.PLAYING && (
        <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-4 sm:px-6 md:px-10 py-2 sm:py-3 pointer-events-none">
          {/* Top-Center Alert / Continue Game Banner */}
          {(hudAlertMessage || (isPausedAfterShop && activeModal === MenuModal.NONE)) && (
            <div className="flex flex-col items-center justify-center gap-2 mx-auto mb-1 pointer-events-auto z-30">
              {hudAlertMessage && (
                <div className="px-4 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-400/70 text-cyan-300 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                  {hudAlertMessage}
                </div>
              )}
              {isPausedAfterShop && activeModal === MenuModal.NONE && (
                <button
                  type="button"
                  onClick={handleContinueGameAfterShop}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-display font-black text-sm sm:text-base shadow-[0_0_28px_rgba(16,185,129,0.85)] border-2 border-white/80 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>متابعة اللعب · Continue Game</span>
                </button>
              )}
            </div>
          )}

          {/* Compact Top Horizontal Fuel, Nitro, Structural Health & Weather Strip (No Backing Container Panel — 80% Opacity & Transparent Background) */}
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-5 max-w-4xl w-full mx-auto bg-transparent border-none shadow-none opacity-80 px-2 py-1 pointer-events-auto">
            {/* Fuel Bar */}
            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
              <Fuel
                className={`w-4 h-4 shrink-0 ${
                  hudState.fuelPct <= 25
                    ? 'text-red-500 animate-pulse'
                    : 'text-emerald-400'
                }`}
              />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] sm:text-[11px] font-mono-num mb-0.5">
                  <span className="text-slate-300">
                    FUEL {hudState.fuelPct <= 25 ? '· LOW!' : ''}
                  </span>
                  <span className="text-white font-bold">{hudState.fuelPct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      hudState.fuelPct <= 25 ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, hudState.fuelPct))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Nitro Bar */}
            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
              <Flame className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] sm:text-[11px] font-mono-num mb-0.5">
                  <span className="text-slate-300">NITRO ×2.2</span>
                  <span className="text-cyan-400 font-bold">
                    {hudState.nitroPct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-150"
                    style={{
                      width: `${Math.max(0, Math.min(100, hudState.nitroPct))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Structural Damage / Progressive Chassis Health Bar */}
            <div className="flex items-center gap-2 flex-1 min-w-[130px]">
              <ShieldAlert
                className={`w-4 h-4 shrink-0 ${
                  hudState.carHealth <= 0
                    ? 'text-red-500 animate-bounce'
                    : hudState.carHealth <= 45
                    ? 'text-amber-400'
                    : 'text-cyan-300'
                }`}
              />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] sm:text-[11px] font-mono-num mb-0.5">
                  <span className="text-slate-300">
                    {hudState.isExploded || hudState.carHealth <= 0
                      ? '💥 0% · دخان وانفجار!'
                      : hudState.carHealth <= 40
                      ? 'الهيكل · تفكك الأجزاء'
                      : hudState.carHealth <= 82
                      ? 'الهيكل · خدوش وتشقق'
                      : 'سلامة الهيكل'}
                  </span>
                  <span
                    className={`font-bold ${
                      hudState.carHealth <= 25
                        ? 'text-red-400'
                        : hudState.carHealth <= 65
                        ? 'text-amber-300'
                        : 'text-white'
                    }`}
                  >
                    {hudState.carHealth}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      hudState.carHealth <= 25
                        ? 'bg-red-600'
                        : hudState.carHealth <= 65
                        ? 'bg-amber-500'
                        : 'bg-cyan-400'
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, hudState.carHealth))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Live Dynamic Weather & Night Cycle Button (5-Min Cycle + Instant Preview) */}
            <button
              onClick={() => {
                if (physicsRef.current) {
                  const nextLabel = advanceWeatherPhaseManual(physicsRef.current);
                  setHudState((prev) => ({
                    ...prev,
                    weatherLabel: nextLabel,
                    rainIntensity: physicsRef.current!.rainIntensity,
                    cloudDarkness: physicsRef.current!.cloudDarkness,
                    nightFactor: physicsRef.current!.nightFactor,
                    headlightsOn: physicsRef.current!.headlightsOn,
                  }));
                  soundEngine.updateEnvironmentAmbience(
                    physicsRef.current.nightFactor,
                    physicsRef.current.rainIntensity
                  );
                  if (physicsRef.current.rainIntensity > 0.18) {
                    soundEngine.playThunderclap(1.15);
                  } else {
                    soundEngine.playClick();
                  }
                }
              }}
              title="تبديل حالة الطقس والليل والأضواء الذكية"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-transparent hover:bg-white/10 border border-white/20 text-[11px] font-semibold text-slate-100 transition-colors cursor-pointer shrink-0"
            >
              {hudState.nightFactor > 0.4 && hudState.rainIntensity < 0.25 ? (
                <Moon className="w-3.5 h-3.5 text-cyan-300" />
              ) : hudState.rainIntensity > 0.35 ? (
                <CloudLightning className="w-3.5 h-3.5 text-amber-400" />
              ) : hudState.cloudDarkness > 0.25 ? (
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{hudState.weatherLabel}</span>
            </button>
          </div>

          {/* TWO-HANDED 3D ERGONOMIC CORNER PEDALS + FLIGHT WINGS & INSTANT REPAIR CONTROLS */}
          <div
            dir="ltr"
            className="w-full flex items-end justify-between pb-1.5 px-1 sm:px-2 pointer-events-auto select-none"
          >
            {/* Far Bottom-Left Corner: 3D Tactile BRAKE / REVERSE Pedal + Quick Repair Button (Clean In-Game HUD: Maps & Shop hidden during driving!) */}
            <div className="flex items-end gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  controlsRef.current.brake = true;
                }}
                onPointerUp={() => {
                  controlsRef.current.brake = false;
                }}
                onPointerLeave={() => {
                  controlsRef.current.brake = false;
                }}
                onPointerCancel={() => {
                  controlsRef.current.brake = false;
                }}
                className="group relative w-32 h-24 sm:w-36 sm:h-28 md:w-44 md:h-32 rounded-2xl bg-gradient-to-b from-red-500 via-red-600 to-red-800 border-t-2 border-x-2 border-red-300/80 border-b-[7px] border-b-red-950 active:border-b-[2px] active:translate-y-[5px] shadow-[0_10px_24px_rgba(0,0,0,0.65),inset_0_2px_1px_rgba(255,255,255,0.45)] flex flex-col items-center justify-between py-2.5 px-3 text-white cursor-pointer touch-none select-none transition-none"
              >
                {/* Top 3D Metallic Bevel & Status LED Bar */}
                <div className="w-full flex items-center justify-between px-1">
                  <span className="w-2 h-2 rounded-full bg-red-200 shadow-[0_0_6px_#FECACA]" />
                  <div className="h-1.5 flex-1 mx-2 rounded-full bg-red-950/60 border border-red-400/30" />
                  <span className="w-2 h-2 rounded-full bg-red-200 shadow-[0_0_6px_#FECACA]" />
                </div>

                {/* Center Raised 3D Pedal Face + Anti-Slip Tread Ribs */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <span className="font-display font-black text-base sm:text-xl md:text-2xl tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    BRAKE / REV
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-red-100/95 tracking-tight">
                    فرامل / تراجع للخلف
                  </span>
                </div>

                {/* Bottom Tactile Rubber Pedal Grip Grooves */}
                <div className="w-4/5 flex flex-col gap-1 opacity-85">
                  <div className="w-full h-1 rounded-full bg-red-950/80 shadow-[0_1px_0_rgba(255,255,255,0.25)]" />
                  <div className="w-full h-1 rounded-full bg-red-950/80 shadow-[0_1px_0_rgba(255,255,255,0.25)]" />
                </div>
              </button>

              {/* 3D Instant Car & Headlights Repair Button */}
              <button
                type="button"
                onClick={handleUseRepairKit}
                title="إصلاح هيكل السيارة والكشافات الأمامية فوراً 100%"
                className="relative w-20 h-20 sm:w-22 sm:h-24 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 border-t-2 border-x-2 border-amber-200 border-b-[6px] border-b-amber-950 active:border-b-[2px] active:translate-y-[4px] shadow-xl flex flex-col items-center justify-center p-1.5 text-slate-950 cursor-pointer select-none transition-none"
              >
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-300 border border-amber-400 text-[10px] font-mono-num font-bold">
                  ×{saveData.inventory?.repairKits ?? 0}
                </span>
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
                <span className="font-display font-black text-[10px] sm:text-xs mt-0.5">
                  REPAIR
                </span>
                <span className="text-[9px] font-extrabold text-slate-950/90">
                  {hudState.headlightsBroken ? '💡 إصلاح الأضواء' : 'إصلاح 100%'}
                </span>
              </button>
            </div>

            {/* Far Bottom-Right Corner: 3D Tactile WINGS + NITRO + GAS Pedals */}
            <div className="flex items-end gap-2.5 sm:gap-3.5 md:gap-4">
              {/* 3D FLYING CAR WINGS TRANSFORMATION BUTTON */}
              <button
                type="button"
                onClick={handleUseFlightWings}
                title="تحويل السيارة إلى طائرة بأجنحة بنفس لون السيارة لمدة دقيقتين (02:00)"
                className={`relative w-22 h-24 sm:w-24 sm:h-28 md:w-28 md:h-32 rounded-2xl border-t-2 border-x-2 border-b-[7px] active:border-b-[2px] active:translate-y-[5px] flex flex-col items-center justify-between py-2 px-1.5 cursor-pointer select-none transition-none ${
                  hudState.flightPhase !== 'none'
                    ? 'bg-gradient-to-b from-sky-300 via-cyan-400 to-blue-600 border-white border-b-blue-950 text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.85)]'
                    : 'bg-gradient-to-b from-indigo-400 via-blue-600 to-slate-900 border-sky-300/90 border-b-slate-950 text-white shadow-[0_10px_24px_rgba(37,99,235,0.5)]'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded-full bg-slate-950/85 text-cyan-300 border border-cyan-400/60 text-[10px] font-mono-num font-bold">
                  {hudState.flightPhase !== 'none'
                    ? formatCountdown(hudState.flightTimer)
                    : `×${saveData.inventory?.flightWings ?? 0}`}
                </span>
                <div className="flex flex-col items-center justify-center my-auto">
                  <Plane className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="font-display font-black text-[11px] sm:text-xs md:text-sm tracking-wider mt-0.5">
                    WINGS
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold opacity-95">
                    {hudState.flightPhase !== 'none'
                      ? 'طيران نشط'
                      : 'تحول لطائرة'}
                  </span>
                </div>
                <div className="w-3/4 h-1 rounded-full bg-white/40" />
              </button>
              {/* 3D NITRO Boost Button */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  const p = physicsRef.current;
                  if (p && p.nitro <= 0.5) {
                    const packsOwned = saveData.inventory?.nitroPacks ?? 0;
                    if (packsOwned > 0) {
                      p.nitro = 100;
                      p.fuel = p.maxFuel;
                      soundEngine.playNitroThrust();
                      setSaveData((prev) => ({
                        ...prev,
                        inventory: {
                          ...prev.inventory,
                          nitroPacks: Math.max(
                            0,
                            (prev.inventory?.nitroPacks ?? 1) - 1
                          ),
                        },
                      }));
                      controlsRef.current.boost = true;
                      return;
                    }
                    soundEngine.playClick();
                    controlsRef.current = {
                      gas: false,
                      brake: false,
                      boost: false,
                    };
                    setIsPausedAfterShop(true);
                    setActiveModal(MenuModal.SHOP);
                    return;
                  }
                  if (!controlsRef.current.boost) {
                    soundEngine.playNitroThrust();
                  }
                  controlsRef.current.boost = true;
                }}
                onPointerUp={() => {
                  controlsRef.current.boost = false;
                }}
                onPointerLeave={() => {
                  controlsRef.current.boost = false;
                }}
                onPointerCancel={() => {
                  controlsRef.current.boost = false;
                }}
                className="group relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-b from-cyan-300 via-sky-500 to-orange-500 border-t-2 border-x-2 border-cyan-100/90 border-b-[7px] border-b-slate-950 active:border-b-[2px] active:translate-y-[5px] shadow-[0_10px_25px_rgba(6,182,212,0.45),inset_0_2px_2px_rgba(255,255,255,0.75)] flex flex-col items-center justify-between py-2 px-2 text-slate-950 cursor-pointer touch-none select-none transition-none"
              >
                {/* Top 3D Nitro Pressure Gauge Cap */}
                <div className="w-4/5 h-1.5 rounded-full bg-slate-950/35 border border-white/50" />

                <div className="flex flex-col items-center justify-center my-auto">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-950/15 border border-white/60 flex items-center justify-center shadow-inner">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950 text-slate-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]" />
                  </div>
                  <span className="font-display font-black text-xs sm:text-sm md:text-base tracking-wider mt-0.5 drop-shadow-[0_1px_0_rgba(255,255,255,0.65)]">
                    NITRO
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold text-slate-950/90">
                    لهب تيربو ×2
                  </span>
                </div>

                {/* Bottom Tactile Grip Rib */}
                <div className="w-3/4 h-1 rounded-full bg-slate-950/55 shadow-[0_1px_0_rgba(255,255,255,0.45)]" />
              </button>

              {/* 3D Ergonomic GAS Accelerator Pedal */}
              <button
                type="button"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  controlsRef.current.gas = true;
                }}
                onPointerUp={() => {
                  controlsRef.current.gas = false;
                }}
                onPointerLeave={() => {
                  controlsRef.current.gas = false;
                }}
                onPointerCancel={() => {
                  controlsRef.current.gas = false;
                }}
                className="group relative w-32 h-24 sm:w-36 sm:h-28 md:w-44 md:h-32 rounded-2xl bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-800 border-t-2 border-x-2 border-emerald-200/85 border-b-[7px] border-b-emerald-950 active:border-b-[2px] active:translate-y-[5px] shadow-[0_10px_24px_rgba(0,0,0,0.65),inset_0_2px_1px_rgba(255,255,255,0.5)] flex flex-col items-center justify-between py-2.5 px-3 text-white cursor-pointer touch-none select-none transition-none"
              >
                {/* Top 3D Metallic Bevel & Green Active LEDs */}
                <div className="w-full flex items-center justify-between px-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-200 shadow-[0_0_6px_#A7F3D0]" />
                  <div className="h-1.5 flex-1 mx-2 rounded-full bg-emerald-950/60 border border-emerald-300/35" />
                  <span className="w-2 h-2 rounded-full bg-emerald-200 shadow-[0_0_6px_#A7F3D0]" />
                </div>

                {/* Center Raised 3D Gas Pedal Label */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <span className="font-display font-black text-xl sm:text-2xl md:text-3xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    GAS
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-100/95">
                    دواسة البنزين
                  </span>
                </div>

                {/* Bottom Tactile Rubber Pedal Grip Grooves */}
                <div className="w-4/5 flex flex-col gap-1 opacity-85">
                  <div className="w-full h-1 rounded-full bg-emerald-950/80 shadow-[0_1px_0_rgba(255,255,255,0.3)]" />
                  <div className="w-full h-1 rounded-full bg-emerald-950/80 shadow-[0_1px_0_rgba(255,255,255,0.3)]" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PAUSE OVERLAY (Mobile Responsive & Scrollable) */}
      {screen === ScreenState.PAUSED && (
        <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 responsive-modal-overlay">
          <div className="responsive-modal-card max-h-[85vh] max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 md:p-8 text-center shadow-2xl overflow-y-auto scrollable-modal-body">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              اللعبة متوقفة مؤقتاً
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              المسافة المقطوعة: {hudState.distance}m · الكوينز المجمعة: +
              {hudState.sessionCoins}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-5">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setScreen(ScreenState.PLAYING);
                }}
                className="py-2.5 sm:py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                مواصلة (Resume)
              </button>
              <button
                onClick={startRace}
                className="py-2.5 sm:py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                إعادة الجولة (Restart)
              </button>
              <button
                onClick={returnToHomeMenu}
                className="py-2.5 sm:py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                الرئيسية (Home)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. GAME OVER SUMMARY MODAL (Mobile Responsive & Scrollable) */}
      {screen === ScreenState.GAME_OVER && (
        <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 responsive-modal-overlay">
          <div className="responsive-modal-card max-h-[85vh] max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl overflow-y-auto scrollable-modal-body">
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
              <div className="flex-1 text-center md:text-right">
                <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm mb-1">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>ملخص الجولة</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {hudState.isExploded
                    ? '💥 انفجرت السيارة بالكامل!'
                    : 'انتهت الجولة!'}
                </h2>
                <p className="text-xs sm:text-sm text-red-400 mt-1">
                  {gameOverReason}
                </p>

                <div className="flex gap-2.5 sm:gap-3 mt-4">
                  <button
                    onClick={startRace}
                    className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة محاولة المرحلة (Retry)</span>
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      setScreen(ScreenState.MAIN_MENU);
                    }}
                    className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                    <span>الرئيسية (Home)</span>
                  </button>
                </div>
              </div>

              <div className="w-full md:w-64 py-3 sm:py-4 px-4 sm:px-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs md:text-sm font-mono-num shrink-0">
                <div className="flex justify-between">
                  <span className="text-slate-400">المسافة:</span>
                  <strong className="text-cyan-400">{hudState.distance} m</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">أفضل رقم:</span>
                  <strong className="text-white">
                    {saveData.bestDistanceByMap[selectedMap.id] || 0} m
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">إجمالي الكوينز:</span>
                  <strong className="text-amber-400">
                    {saveData.coins.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MOBILE-RESPONSIVE SCROLLABLE MODALS (Themed to match each Category Button's Logo/Icon Palette!) */}
      {activeModal !== MenuModal.NONE && (
        <div className="absolute inset-0 z-40 bg-slate-950/82 backdrop-blur-lg flex items-center justify-center p-2 sm:p-4 md:p-6 responsive-modal-overlay">
          <div
            className={`responsive-modal-card max-h-[85vh] rounded-2xl sm:rounded-3xl max-w-6xl w-full flex flex-col overflow-hidden transition-all ${
              activeModal === MenuModal.GARAGE
                ? 'bg-gradient-to-br from-amber-950/95 via-orange-950/90 to-slate-900/95 border-2 border-amber-400/75 shadow-[0_0_42px_rgba(245,158,11,0.38)]'
                : activeModal === MenuModal.SHOWROOM
                ? 'bg-gradient-to-br from-red-950/95 via-rose-950/90 to-slate-900/95 border-2 border-red-400/75 shadow-[0_0_42px_rgba(239,68,68,0.4)]'
                : activeModal === MenuModal.MAPS
                ? 'bg-gradient-to-br from-emerald-950/95 via-teal-950/90 to-slate-900/95 border-2 border-emerald-400/75 shadow-[0_0_42px_rgba(16,185,129,0.38)]'
                : activeModal === MenuModal.SHOP
                ? 'bg-gradient-to-br from-cyan-950/95 via-sky-950/90 to-blue-950/95 border-2 border-cyan-400/80 shadow-[0_0_42px_rgba(6,182,212,0.42)]'
                : activeModal === MenuModal.SETTINGS
                ? 'bg-gradient-to-br from-purple-950/95 via-violet-950/90 to-fuchsia-950/95 border-2 border-purple-400/75 shadow-[0_0_42px_rgba(168,85,247,0.4)]'
                : 'bg-gradient-to-br from-cyan-950/95 via-slate-900 to-indigo-950/95 border-2 border-cyan-400/70 shadow-2xl'
            }`}
          >
            {/* Sticky Modal Header with Logo-Matched Gradient & Prominent "Close / Main Menu" Button */}
            <div
              className={`flex flex-wrap items-center justify-between gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 border-b shrink-0 ${
                activeModal === MenuModal.GARAGE
                  ? 'bg-gradient-to-r from-amber-900/85 via-orange-900/80 to-amber-950/90 border-amber-400/50'
                  : activeModal === MenuModal.SHOWROOM
                  ? 'bg-gradient-to-r from-red-900/85 via-rose-900/80 to-orange-950/90 border-red-400/50'
                  : activeModal === MenuModal.MAPS
                  ? 'bg-gradient-to-r from-emerald-900/85 via-teal-900/80 to-emerald-950/90 border-emerald-400/50'
                  : activeModal === MenuModal.SHOP
                  ? 'bg-gradient-to-r from-cyan-900/85 via-sky-900/80 to-blue-950/90 border-cyan-400/55'
                  : activeModal === MenuModal.SETTINGS
                  ? 'bg-gradient-to-r from-purple-900/85 via-violet-900/80 to-fuchsia-950/90 border-purple-400/50'
                  : 'bg-gradient-to-r from-cyan-900/80 to-indigo-950/90 border-cyan-400/50'
              }`}
            >
              <div className="flex items-center gap-2">
                {activeModal === MenuModal.SHOP && (
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                )}
                {activeModal === MenuModal.GARAGE && (
                  <OfficialGameCoverIcon size={26} className="shrink-0" />
                )}
                {activeModal === MenuModal.SHOWROOM && (
                  <OfficialGameCoverIcon size={26} className="shrink-0" />
                )}
                {activeModal === MenuModal.MAPS && (
                  <MapIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                )}
                {activeModal === MenuModal.SETTINGS && (
                  <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                )}
                {activeModal === MenuModal.EXPORT_HTML && (
                  <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                )}
                <h2 className="text-xs sm:text-sm md:text-base font-bold text-white">
                  {activeModal === MenuModal.SHOP &&
                    'متجر العناصر الخاصة وأجنحة الطيران النادرة (In-Game Shop)'}
                  {activeModal === MenuModal.GARAGE &&
                    `الكراج وتطوير المساعدين والمحرك — ${selectedCar.name}`}
                  {activeModal === MenuModal.SHOWROOM &&
                    'معرض السيارات والأصوات الفريدة (Cars Showroom)'}
                  {activeModal === MenuModal.MAPS &&
                    'معرض الخرائط والعوائق التفاعلية (Maps Showroom)'}
                  {activeModal === MenuModal.SETTINGS &&
                    'قائمة الإعدادات الكاملة (Settings)'}
                  {activeModal === MenuModal.EXPORT_HTML &&
                    'تصدير ونسخ كود اللعبة في ملف واحد (index.html)'}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-mono-num text-amber-400 font-semibold">
                  {(
                    saveData.coins +
                    (screen === ScreenState.PLAYING ? hudState.sessionCoins : 0)
                  ).toLocaleString()}{' '}
                  كوينز
                </span>

                {/* PROMINENT CONTINUE GAME / CLOSE BUTTONS IN HEADER */}
                {screen === ScreenState.PLAYING && (
                  <button
                    onClick={handleContinueGameAfterShop}
                    className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_18px_rgba(16,185,129,0.65)] transition-all whitespace-nowrap cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950" />
                    <span>متابعة اللعب · Continue Game</span>
                  </button>
                )}
                <button
                  onClick={handleCloseModal}
                  className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all whitespace-nowrap cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>
                    {screen === ScreenState.PLAYING
                      ? 'إغلاق المتجر (Close Shop)'
                      : 'إغلاق / العودة للقائمة الرئيسية'}
                  </span>
                </button>
              </div>
            </div>

            {/* Modal Touch-Scrollable Body (Smooth Vertical Touch Scroll on Mobile & Desktop) */}
            <div
              ref={modalScrollRef}
              onTouchStart={(e) => {
                if ((e.target as HTMLElement)?.closest('input[type="range"]')) {
                  return;
                }
                const t = e.touches[0];
                if (!t || !modalScrollRef.current) return;
                touchDragRef.current = {
                  active: true,
                  lastX: t.clientX,
                  lastY: t.clientY,
                  startScrollTop: modalScrollRef.current.scrollTop,
                };
              }}
              onTouchMove={(e) => {
                if (!touchDragRef.current.active || !modalScrollRef.current) {
                  return;
                }
                const t = e.touches[0];
                if (!t) return;
                const dx = t.clientX - touchDragRef.current.lastX;
                const dy = touchDragRef.current.lastY - t.clientY;
                touchDragRef.current.lastX = t.clientX;
                touchDragRef.current.lastY = t.clientY;
                // When stage is rotated 90deg in portrait orientation, visual vertical swipe maps to clientX (dx)
                const isPortraitRotated = window.innerHeight > window.innerWidth;
                if (isPortraitRotated) {
                  const delta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
                  modalScrollRef.current.scrollTop += delta * 1.25;
                }
              }}
              onTouchEnd={() => {
                touchDragRef.current.active = false;
              }}
              onTouchCancel={() => {
                touchDragRef.current.active = false;
              }}
              className="flex-1 min-h-0 p-3 sm:p-5 pb-12 overflow-y-auto scrollable-modal-body"
            >
              {/* IN-GAME SPECIAL ITEMS SHOP MODAL (متجر العناصر الخاصة وأجنحة الطيران النادرة) */}
              {activeModal === MenuModal.SHOP && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 1. RARE FLIGHT WINGS ITEM (أجنحة الطيران النادرة — 02:00 Flying Car Transformation) */}
                    <div className="p-4 rounded-2xl bg-slate-950 border-2 border-cyan-400/70 shadow-[0_0_24px_rgba(6,182,212,0.2)] flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[11px] font-bold">
                            ✈️ عنصر نادر · 02:00 طيران
                          </span>
                          <span className="text-xs font-mono-num text-amber-400 font-bold">
                            المملوك: ×{saveData.inventory?.flightWings ?? 0}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">
                          أجنحة الطيران النادرة (Flight Wings)
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          تحول سينمائي بطيء (Slow-Mo Cutscene) تخرج فيه أجنحة نفاثة بنفس لون سيارتك، لترتفع وتطير في السماء لمدة دقيقتين (02:00) مع هبوط تدريجي وطي الأجنحة!
                        </p>
                        <div className="text-sm font-mono-num text-amber-400 font-bold pt-1">
                          السعر: 1,200 كوينز
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          disabled={
                            saveData.coins +
                              (screen === ScreenState.PLAYING
                                ? hudState.sessionCoins
                                : 0) <
                            1200
                          }
                          onClick={() => handleBuyShopItem('wings', 1200, false)}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-colors ${
                            saveData.coins +
                              (screen === ScreenState.PLAYING
                                ? hudState.sessionCoins
                                : 0) >=
                            1200
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          شراء أجنحة طيران (+1 للمخزون · 1,200 كوينز)
                        </button>
                        {screen === ScreenState.PLAYING && (
                          <button
                            disabled={
                              saveData.coins + hudState.sessionCoins < 1200
                            }
                            onClick={() => handleBuyShopItem('wings', 1200, true)}
                            className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-colors ${
                              saveData.coins + hudState.sessionCoins >= 1200
                                ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            ✈️ شراء وتفعيل الطيران فوراً الآن!
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. FULL VEHICLE & HEADLIGHTS REPAIR KIT (إصلاح شامل للسيارة والكشافات 100%) */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/60 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[11px] font-bold">
                            🔧 إصلاح الهيكل والأضواء 100%
                          </span>
                          <span className="text-xs font-mono-num text-amber-400 font-bold">
                            المملوك: ×{saveData.inventory?.repairKits ?? 0}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">
                          عدة إصلاح السيارة والكشافات (Full Repair)
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          يعيد سلامة هيكل السيارة إلى 100%، يركب الأبواب والصدامات المخلوعة، ويصلح الكشافات الأمامية المكسورة لتعود للعمل ليلاً!
                        </p>
                        <div className="text-sm font-mono-num text-amber-400 font-bold pt-1">
                          السعر: 600 كوينز
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          disabled={
                            saveData.coins +
                              (screen === ScreenState.PLAYING
                                ? hudState.sessionCoins
                                : 0) <
                            600
                          }
                          onClick={() => handleBuyShopItem('repair', 600, false)}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-colors ${
                            saveData.coins +
                              (screen === ScreenState.PLAYING
                                ? hudState.sessionCoins
                                : 0) >=
                            600
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          شراء عدة إصلاح (+1 للمخزون · 600 كوينز)
                        </button>
                        {screen === ScreenState.PLAYING && (
                          <button
                            disabled={
                              saveData.coins + hudState.sessionCoins < 600
                            }
                            onClick={() => {
                              handleBuyShopItem('repair', 600, true);
                              setActiveModal(MenuModal.NONE);
                            }}
                            className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-colors ${
                              saveData.coins + hudState.sessionCoins >= 600
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            🔧 شراء وإصلاح السيارة والكشافات فوراً!
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 3. SUPER NITRO REFILL PACK (عبوة نيترو تيربو فوري 100%) */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/60 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-[11px] font-bold">
                            🔥 تعبئة نيترو ووقود 100%
                          </span>
                          <span className="text-xs font-mono-num text-amber-400 font-bold">
                            المملوك: ×{saveData.inventory?.nitroPacks ?? 0}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">
                          شحنة نيترو ووقود فائق (Nitro & Fuel Pack)
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          يشحن خزان النيترو الأزرق والبرتقالي وخزان الوقود إلى 100% فوراً للانطلاق بأقصى سرعة تيربو!
                        </p>
                        <div className="text-sm font-mono-num text-amber-400 font-bold pt-1">
                          السعر: 400 كوينز
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          disabled={
                            saveData.coins +
                              (screen === ScreenState.PLAYING
                                ? hudState.sessionCoins
                                : 0) <
                            400
                          }
                          onClick={() => {
                            handleBuyShopItem('nitro', 400, true);
                            if (screen === ScreenState.PLAYING) {
                              setIsPausedAfterShop(false);
                              setActiveModal(MenuModal.NONE);
                            }
                          }}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-colors ${
                            saveData.coins +
                              (screen === ScreenState.PLAYING
                                ? hudState.sessionCoins
                                : 0) >=
                            400
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 cursor-pointer'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          🔥 شراء وتعبئة النيترو 100% (400 كوينز)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Quick-Resume / Return Button */}
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={
                        screen === ScreenState.PLAYING
                          ? handleContinueGameAfterShop
                          : handleCloseModal
                      }
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {screen === ScreenState.PLAYING ? (
                        <>
                          <Play className="w-4 h-4 fill-slate-950" />
                          <span>متابعة اللعب · Continue Game</span>
                        </>
                      ) : (
                        <>
                          <Home className="w-4 h-4" />
                          <span>تم · العودة للقائمة الرئيسية</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* GARAGE MODAL (Redesigned: Change Car Color + 3 Vehicle Upgrades 0..100, +10k coins per level, NO Maps/Shop buttons inside Garage!) */}
              {activeModal === MenuModal.GARAGE && (
                <div className="space-y-4">
                  {/* Top Vehicle Overview & Change Car Color Card */}
                  <div className="flex flex-col lg:flex-row items-center gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="w-full sm:w-64 shrink-0">
                      <CarThumbnailCanvas car={selectedCar} />
                    </div>
                    <div className="flex-1 text-right w-full space-y-2.5">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {selectedCar.arabicName} ({selectedCar.name})
                        </h3>
                        <p className="text-xs text-amber-400 font-mono-num mt-0.5">
                          نوع المحرك: {selectedCar.engineTypeLabel}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedCar.subtitle}
                        </p>
                      </div>

                      {/* Change Car Color & Matching Wheel Rims — Organized into 3 Distinct Category Rows with Dedicated Pickers */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                          <div>
                            <span className="text-xs font-bold text-cyan-300 block">
                              🎨 أقسام طلاء السيارة والطاوات (3 فئات منفصلة مع دوائر اختيار مخصصة):
                            </span>
                            <span className="text-[11px] text-amber-400 font-mono-num font-bold block">
                              اللون الأساسي للسيارة: أحمر ناري (مجاني افتراضي) · الألوان القياسية: {CAR_COLOR_PRICE} كوينز · ألوان النجوم والنيون المزدوج: {NEON_CAR_COLOR_PRICE.toLocaleString()} كوينز
                            </span>
                          </div>
                        </div>

                        {/* =====================================================================
                            ROW 1: STANDARD PAINTS (500 Coins) + Custom Color Picker Circle + Default Color Option Below It
                           ===================================================================== */}
                        <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-extrabold text-white block">
                                1️⃣ الألوان القياسية واللامعة (Standard Paints · {CAR_COLOR_PRICE} كوينز)
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                تشمل أحمر كاندي الفلزي والألوان القياسية اللامعة للسيارة والطاوات
                              </span>
                            </div>

                            {/* Custom Color Picker Circle (Free Preview) + Repositioned Default Color Option Directly Below It */}
                            <div className="flex flex-col items-stretch gap-1.5">
                              <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-700">
                                <label
                                  title="دائرة اختيار اللون المخصص - معاينة مجانية"
                                  className="relative w-9 h-9 rounded-full p-[2.5px] cursor-pointer shadow-[0_0_10px_rgba(56,189,248,0.35)] hover:scale-105 transition-transform shrink-0"
                                  style={{
                                    background:
                                      'conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
                                  }}
                                >
                                  <span
                                    className="w-full h-full rounded-full block border-2 border-white shadow-inner"
                                    style={{
                                      backgroundColor: selectedCar.bodyColor,
                                    }}
                                  />
                                  <input
                                    type="color"
                                    value={selectedCar.bodyColor}
                                    onChange={(e) => {
                                      const hex = e.target.value;
                                      handleChangeCarColor(
                                        {
                                          bodyColor: hex,
                                          secondaryColor: hex,
                                          accentColor: hex,
                                        },
                                        false,
                                        CAR_COLOR_PRICE
                                      );
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                </label>
                                <div className="flex flex-col items-start gap-0.5">
                                  <span className="text-[10px] text-cyan-200 font-bold">
                                    دائرة اختيار اللون المخصص (معاينة مجانية)
                                  </span>
                                  {(() => {
                                    const currentHex =
                                      selectedCar.bodyColor.toLowerCase();
                                    const activeSavedHex = (
                                      customSelectedColor?.bodyColor ||
                                      baseSelectedCar.bodyColor
                                    ).toLowerCase();
                                    const isCustomOwned =
                                      isCarColorOwned(currentHex);
                                    const isCustomEquipped =
                                      !previewCarColor &&
                                      isCustomOwned &&
                                      currentHex === activeSavedHex;
                                    const targetPrice = getCarColorPrice(currentHex);
                                    const canBuyOrEquip =
                                      isCustomOwned ||
                                      saveData.coins >= targetPrice;
                                    return (
                                      <button
                                        type="button"
                                        disabled={!canBuyOrEquip}
                                        onClick={() =>
                                          handleChangeCarColor(
                                            {
                                              bodyColor: selectedCar.bodyColor,
                                              secondaryColor:
                                                previewCarColor?.secondaryColor ||
                                                selectedCar.bodyColor,
                                              accentColor: selectedCar.bodyColor,
                                            },
                                            true,
                                            targetPrice
                                          )
                                        }
                                        className={`px-2.5 py-0.5 rounded-lg font-mono-num font-extrabold text-[10px] transition-all flex items-center gap-1 ${
                                          isCustomEquipped
                                            ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 cursor-pointer'
                                            : isCustomOwned
                                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                                            : canBuyOrEquip
                                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 cursor-pointer'
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                      >
                                        <Coins className="w-3 h-3" />
                                        <span>
                                          {isCustomEquipped
                                            ? '✓ مُفعل'
                                            : isCustomOwned
                                            ? 'اختيار (مجاني)'
                                            : `${targetPrice.toLocaleString()} كوينز`}
                                        </span>
                                      </button>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Default Color Option ("اللون الافتراضي / استعادة اللون الافتراضي") placed directly BELOW the Custom Color Picker */}
                              {(() => {
                                const isDefaultCurrentlyActive =
                                  !previewCarColor &&
                                  (!customSelectedColor ||
                                    customSelectedColor.bodyColor.toLowerCase() ===
                                      '#ff001e');
                                return (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChangeCarColor(null, true);
                                    }}
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-extrabold transition-all cursor-pointer ${
                                      isDefaultCurrentlyActive
                                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                        : 'bg-slate-900 hover:bg-slate-800 border-amber-400/60 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.18)]'
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <span
                                        className="w-3.5 h-3.5 rounded-full border border-white shrink-0"
                                        style={{ backgroundColor: '#FF001E' }}
                                      />
                                      <span>اللون الافتراضي: أحمر ناري (استعادة اللون الافتراضي)</span>
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] font-mono-num">
                                      {isDefaultCurrentlyActive ? '✓ مُفعل (مجاني)' : 'تفعيل مجاني'}
                                    </span>
                                  </button>
                                );
                              })()}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {CAR_COLOR_PRESETS.filter(
                              (p) => !p.isStarryGalaxy && !p.isDualNeon
                            ).map((preset) => {
                              const presetHex = preset.bodyColor.toLowerCase();
                              const activeSavedHex = (
                                customSelectedColor?.bodyColor ||
                                baseSelectedCar.bodyColor
                              ).toLowerCase();
                              const isOwned =
                                Boolean(preset.isDefaultFree) ||
                                isCarColorOwned(presetHex);
                              const isSavedActive =
                                !previewCarColor &&
                                isOwned &&
                                presetHex === activeSavedHex;
                              const isPreviewActive =
                                previewCarColor?.bodyColor.toLowerCase() ===
                                presetHex;
                              const presetPrice =
                                preset.price !== undefined
                                  ? preset.price
                                  : CAR_COLOR_PRICE;
                              return (
                                <div
                                  key={preset.id}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border text-[11px] font-bold transition-all ${
                                    isSavedActive || isPreviewActive
                                      ? 'bg-slate-800 border-amber-400 text-white shadow-[0_0_10px_rgba(251,191,36,0.3)] scale-[1.02]'
                                      : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-600'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChangeCarColor(
                                        {
                                          bodyColor: preset.bodyColor,
                                          secondaryColor: preset.secondaryColor,
                                          accentColor: preset.bodyColor,
                                        },
                                        false,
                                        presetPrice
                                      );
                                    }}
                                    title={`معاينة ${preset.name} مجاناً بدون خصم كوينز`}
                                    className="flex items-center gap-1.5 cursor-pointer py-0.5 pr-0.5 text-right"
                                  >
                                    <span
                                      className="w-4 h-4 rounded-full border border-white/60 shrink-0"
                                      style={{
                                        backgroundColor: preset.bodyColor,
                                      }}
                                    />
                                    <span>{preset.name}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChangeCarColor(
                                        {
                                          bodyColor: preset.bodyColor,
                                          secondaryColor: preset.secondaryColor,
                                          accentColor: preset.bodyColor,
                                        },
                                        true,
                                        presetPrice
                                      );
                                    }}
                                    className={`px-2 py-0.5 rounded-lg font-mono-num text-[10px] font-extrabold transition-all cursor-pointer ${
                                      isSavedActive
                                        ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300'
                                        : isOwned
                                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300'
                                    }`}
                                  >
                                    {isSavedActive
                                      ? '✓ مُفعل'
                                      : isOwned
                                      ? preset.isDefaultFree
                                        ? 'مجاني (تفعيل)'
                                        : 'اختيار'
                                      : `${presetPrice.toLocaleString()} كوينز`}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* =====================================================================
                            ROW 2: STARRY GALAXY PAINTS (8,000 Coins) + Custom Starry Color Picker Circle
                           ===================================================================== */}
                        <div className="p-2.5 rounded-xl bg-slate-950/95 border border-indigo-500/50 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-extrabold text-indigo-200 block">
                                2️⃣ ألوان النجوم والفضائي (Starry Galaxy Paints · {STARRY_CAR_COLOR_PRICE.toLocaleString()} كوينز)
                              </span>
                              <span className="text-[10px] text-indigo-300/80 block">
                                طلاء مجري مرصع بذرات نجوم متلألئة وبريق كوني داخل هيكل السيارة والطاوات
                              </span>
                            </div>

                            {/* Custom Starry Color Picker Circle (Free Preview) */}
                            <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-indigo-500/50">
                              <label
                                title="دائرة اختيار لون النجوم المخصص - معاينة مجانية"
                                className="relative w-9 h-9 rounded-full p-[2.5px] cursor-pointer shadow-[0_0_12px_rgba(129,140,248,0.5)] hover:scale-105 transition-transform shrink-0"
                                style={{
                                  background:
                                    'conic-gradient(from 0deg, #c90035, #7b2cbf, #0038a8, #00b4d8, #f72585, #c90035)',
                                }}
                              >
                                <span
                                  className="w-full h-full rounded-full flex items-center justify-center border-2 border-white text-[9px]"
                                  style={{ backgroundColor: customStarryPickerHex }}
                                >
                                  ✨
                                </span>
                                <input
                                  type="color"
                                  value={customStarryPickerHex}
                                  onChange={(e) => {
                                    const rawHex = e.target.value;
                                    setCustomStarryPickerHex(rawHex);
                                    const starryInfo =
                                      registerCustomStarryColor(rawHex);
                                    handleChangeCarColor(
                                      {
                                        bodyColor: starryInfo.baseColor,
                                        secondaryColor: starryInfo.deepColor,
                                        accentColor: starryInfo.baseColor,
                                      },
                                      false,
                                      STARRY_CAR_COLOR_PRICE
                                    );
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </label>
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="text-[10px] text-indigo-200 font-bold">
                                  دائرة اختيار لون النجوم المخصص (معاينة مجانية)
                                </span>
                                {(() => {
                                  const starryInfo =
                                    registerCustomStarryColor(
                                      customStarryPickerHex,
                                      false
                                    );
                                  const starryHex =
                                    starryInfo.baseColor.toLowerCase();
                                  const activeSavedHex = (
                                    customSelectedColor?.bodyColor ||
                                    baseSelectedCar.bodyColor
                                  ).toLowerCase();
                                  const isOwned = isCarColorOwned(starryHex);
                                  const isEquipped =
                                    !previewCarColor &&
                                    isOwned &&
                                    starryHex === activeSavedHex;
                                  return (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleChangeCarColor(
                                          {
                                            bodyColor: starryInfo.baseColor,
                                            secondaryColor: starryInfo.deepColor,
                                            accentColor: starryInfo.baseColor,
                                          },
                                          true,
                                          STARRY_CAR_COLOR_PRICE
                                        )
                                      }
                                      className={`px-2.5 py-0.5 rounded-lg font-mono-num font-extrabold text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                                        isEquipped
                                          ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300'
                                          : isOwned
                                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                          : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-300 text-slate-950'
                                      }`}
                                    >
                                      <Coins className="w-3 h-3" />
                                      <span>
                                        {isEquipped
                                          ? '✓ مُفعل'
                                          : isOwned
                                          ? 'اختيار'
                                          : `${STARRY_CAR_COLOR_PRICE.toLocaleString()} كوينز`}
                                      </span>
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {CAR_COLOR_PRESETS.filter((p) => p.isStarryGalaxy).map(
                              (preset) => {
                                const presetHex = preset.bodyColor.toLowerCase();
                                const activeSavedHex = (
                                  customSelectedColor?.bodyColor ||
                                  baseSelectedCar.bodyColor
                                ).toLowerCase();
                                const isOwned = isCarColorOwned(presetHex);
                                const isSavedActive =
                                  !previewCarColor &&
                                  isOwned &&
                                  presetHex === activeSavedHex;
                                const isPreviewActive =
                                  previewCarColor?.bodyColor.toLowerCase() ===
                                  presetHex;
                                const presetPrice =
                                  preset.price || STARRY_CAR_COLOR_PRICE;
                                return (
                                  <div
                                    key={preset.id}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border text-[11px] font-bold transition-all ${
                                      isPreviewActive
                                        ? 'bg-slate-800 border-amber-400 text-white shadow-[0_0_10px_rgba(251,191,36,0.35)] scale-[1.02]'
                                        : 'bg-slate-900/95 border-indigo-500/60 text-white hover:border-indigo-400'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleChangeCarColor(
                                          {
                                            bodyColor: preset.bodyColor,
                                            secondaryColor: preset.secondaryColor,
                                            accentColor: preset.bodyColor,
                                          },
                                          false,
                                          presetPrice
                                        )
                                      }
                                      title={`معاينة ${preset.name} مجاناً`}
                                      className="flex items-center gap-1.5 cursor-pointer py-0.5 pr-0.5 text-right"
                                    >
                                      <span
                                        className="w-4 h-4 rounded-full border border-white/60 shrink-0 flex items-center justify-center text-[8px]"
                                        style={{
                                          background: `radial-gradient(circle at 30% 30%, #ffffff, ${preset.bodyColor} 55%, ${preset.secondaryColor})`,
                                        }}
                                      >
                                        ✨
                                      </span>
                                      <span>{preset.name}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleChangeCarColor(
                                          {
                                            bodyColor: preset.bodyColor,
                                            secondaryColor: preset.secondaryColor,
                                            accentColor: preset.bodyColor,
                                          },
                                          true,
                                          presetPrice
                                        );
                                      }}
                                      className={`px-2 py-0.5 rounded-lg font-mono-num text-[10px] font-extrabold transition-all cursor-pointer ${
                                        isSavedActive
                                          ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300'
                                          : isOwned
                                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                          : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 text-slate-950 border border-amber-200'
                                      }`}
                                    >
                                      {isSavedActive
                                        ? '✓ مُفعل'
                                        : isOwned
                                        ? 'اختيار'
                                        : `${presetPrice.toLocaleString()} كوينز`}
                                    </button>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>

                        {/* =====================================================================
                            ROW 3: DUAL NEON PAINTS (8,000 Coins) + Custom Neon Color Picker Circle
                           ===================================================================== */}
                        <div className="p-2.5 rounded-xl bg-slate-950/95 border border-fuchsia-500/50 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-extrabold text-fuchsia-200 block">
                                3️⃣ ألوان النيون المزدوجة المتحركة (Dual Neon Paints · {NEON_CAR_COLOR_PRICE.toLocaleString()} كوينز)
                              </span>
                              <span className="text-[10px] text-fuchsia-300/80 block">
                                تدرج نيون مزدوج نابض ومتحرك داخل هيكل السيارة والطاوات بدون أشعة خارجية
                              </span>
                            </div>

                            {/* Custom Neon Color Picker Circle (Free Preview) */}
                            <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-fuchsia-500/50">
                              <div className="flex items-center gap-1">
                                <label
                                  title="دائرة اختيار لون النيون المخصص (اللون 1) - معاينة مجانية"
                                  className="relative w-8 h-8 rounded-full p-[2px] cursor-pointer hover:scale-105 transition-transform shrink-0"
                                  style={{
                                    background: `linear-gradient(135deg, ${customNeonPickerColorA}, ${customNeonPickerColorB})`,
                                  }}
                                >
                                  <span
                                    className="w-full h-full rounded-full block border border-white"
                                    style={{
                                      backgroundColor: customNeonPickerColorA,
                                    }}
                                  />
                                  <input
                                    type="color"
                                    value={customNeonPickerColorA}
                                    onChange={(e) => {
                                      const nextA = e.target.value;
                                      setCustomNeonPickerColorA(nextA);
                                      const neonInfo =
                                        registerCustomDualNeonColor(
                                          nextA,
                                          customNeonPickerColorB
                                        );
                                      handleChangeCarColor(
                                        {
                                          bodyColor: neonInfo.colorA,
                                          secondaryColor: neonInfo.colorB,
                                          accentColor: neonInfo.colorA,
                                        },
                                        false,
                                        NEON_CAR_COLOR_PRICE
                                      );
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                </label>
                                <label
                                  title="دائرة اختيار لون النيون المخصص (اللون 2) - معاينة مجانية"
                                  className="relative w-8 h-8 rounded-full p-[2px] cursor-pointer hover:scale-105 transition-transform shrink-0"
                                  style={{
                                    background: `linear-gradient(135deg, ${customNeonPickerColorB}, ${customNeonPickerColorA})`,
                                  }}
                                >
                                  <span
                                    className="w-full h-full rounded-full block border border-white"
                                    style={{
                                      backgroundColor: customNeonPickerColorB,
                                    }}
                                  />
                                  <input
                                    type="color"
                                    value={customNeonPickerColorB}
                                    onChange={(e) => {
                                      const nextB = e.target.value;
                                      setCustomNeonPickerColorB(nextB);
                                      const neonInfo =
                                        registerCustomDualNeonColor(
                                          customNeonPickerColorA,
                                          nextB
                                        );
                                      handleChangeCarColor(
                                        {
                                          bodyColor: neonInfo.colorA,
                                          secondaryColor: neonInfo.colorB,
                                          accentColor: neonInfo.colorA,
                                        },
                                        false,
                                        NEON_CAR_COLOR_PRICE
                                      );
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                </label>
                              </div>
                              <div className="flex flex-col items-start gap-0.5">
                                <span className="text-[10px] text-fuchsia-200 font-bold">
                                  دائرة اختيار لون النيون المخصص (معاينة مجانية)
                                </span>
                                {(() => {
                                  const neonInfo = registerCustomDualNeonColor(
                                    customNeonPickerColorA,
                                    customNeonPickerColorB,
                                    false
                                  );
                                  const neonHex =
                                    neonInfo.colorA.toLowerCase();
                                  const activeSavedHex = (
                                    customSelectedColor?.bodyColor ||
                                    baseSelectedCar.bodyColor
                                  ).toLowerCase();
                                  const isOwned = isCarColorOwned(neonHex);
                                  const isEquipped =
                                    !previewCarColor &&
                                    isOwned &&
                                    neonHex === activeSavedHex;
                                  return (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleChangeCarColor(
                                          {
                                            bodyColor: neonInfo.colorA,
                                            secondaryColor: neonInfo.colorB,
                                            accentColor: neonInfo.colorA,
                                          },
                                          true,
                                          NEON_CAR_COLOR_PRICE
                                        )
                                      }
                                      className={`px-2.5 py-0.5 rounded-lg font-mono-num font-extrabold text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                                        isEquipped
                                          ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300'
                                          : isOwned
                                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                          : 'bg-gradient-to-r from-fuchsia-400 via-amber-300 to-cyan-400 text-slate-950'
                                      }`}
                                    >
                                      <Coins className="w-3 h-3" />
                                      <span>
                                        {isEquipped
                                          ? '✓ مُفعل'
                                          : isOwned
                                          ? 'اختيار'
                                          : `${NEON_CAR_COLOR_PRICE.toLocaleString()} كوينز`}
                                      </span>
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {CAR_COLOR_PRESETS.filter((p) => p.isDualNeon).map(
                              (preset) => {
                                const presetHex = preset.bodyColor.toLowerCase();
                                const activeSavedHex = (
                                  customSelectedColor?.bodyColor ||
                                  baseSelectedCar.bodyColor
                                ).toLowerCase();
                                const isOwned = isCarColorOwned(presetHex);
                                const isSavedActive =
                                  !previewCarColor &&
                                  isOwned &&
                                  presetHex === activeSavedHex;
                                const isPreviewActive =
                                  previewCarColor?.bodyColor.toLowerCase() ===
                                  presetHex;
                                const presetPrice =
                                  preset.price || NEON_CAR_COLOR_PRICE;
                                const c1 =
                                  preset.neonColors?.[0] || preset.bodyColor;
                                const c2 =
                                  preset.neonColors?.[1] || preset.secondaryColor;
                                return (
                                  <div
                                    key={preset.id}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border text-[11px] font-bold transition-all ${
                                      isPreviewActive
                                        ? 'bg-slate-800 border-amber-400 text-white shadow-[0_0_10px_rgba(251,191,36,0.35)] scale-[1.02]'
                                        : 'bg-slate-900/95 border-fuchsia-500/60 text-white hover:border-fuchsia-400'
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleChangeCarColor(
                                          {
                                            bodyColor: preset.bodyColor,
                                            secondaryColor: preset.secondaryColor,
                                            accentColor: preset.bodyColor,
                                          },
                                          false,
                                          presetPrice
                                        )
                                      }
                                      title={`معاينة ${preset.name} مجاناً`}
                                      className="flex items-center gap-1.5 cursor-pointer py-0.5 pr-0.5 text-right"
                                    >
                                      <span
                                        className="w-4 h-4 rounded-full border border-white/60 shrink-0 animate-pulse"
                                        style={{
                                          background: `linear-gradient(135deg, ${c1}, ${c2})`,
                                        }}
                                      />
                                      <span>{preset.name}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleChangeCarColor(
                                          {
                                            bodyColor: preset.bodyColor,
                                            secondaryColor: preset.secondaryColor,
                                            accentColor: preset.bodyColor,
                                          },
                                          true,
                                          presetPrice
                                        );
                                      }}
                                      className={`px-2 py-0.5 rounded-lg font-mono-num text-[10px] font-extrabold transition-all cursor-pointer ${
                                        isSavedActive
                                          ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300'
                                          : isOwned
                                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                          : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500 text-slate-950 border border-amber-200'
                                      }`}
                                    >
                                      {isSavedActive
                                        ? '✓ مُفعل'
                                        : isOwned
                                        ? 'اختيار'
                                        : `${presetPrice.toLocaleString()} كوينز`}
                                    </button>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Three Vehicle Upgrades (Level 0 -> 100 MAX, Starting at 10,000 coins, +10,000 per level) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                    {(
                      [
                        {
                          key: 'engine',
                          title: 'ترقية المكينة (Engine Power)',
                          badge: '⚡ قوة المحرك والسرعة',
                          desc: 'يرفع قوة الأحصنة والتسارع والسرعة القصوى لتسلق المرتفعات والمنحدرات الصعبة.',
                          barColor: 'from-amber-500 to-orange-400',
                        },
                        {
                          key: 'armor',
                          title: 'ترقية قوة وتحمل السيارة (Vehicle Armor / Durability)',
                          badge: '🛡️ صلابة وتحمل الهيكل',
                          desc: 'يزيد تدريع الشاسيه واليايات لتقليل أضرار الصدمات وحماية الهيكل والكشافات.',
                          barColor: 'from-emerald-500 to-teal-400',
                        },
                        {
                          key: 'exhaustSound',
                          title: 'ترقية صوت المحرك وطلاق الشكمان (Engine Sound & Exhaust Pops)',
                          badge: '🔊🔥 صوت المحرك وطلاق الشكمان',
                          desc: 'يعزز هدير المحرك التيربو ويزيد قوة وكثافة طلقات وفرقعة الشكمان النارية عند القيادة.',
                          barColor: 'from-cyan-500 to-blue-400',
                        },
                      ] as const
                    ).map((item) => {
                      const lvl = Math.max(
                        0,
                        Math.min(100, currentUpgrades[item.key] || 0)
                      );
                      const isMax = lvl >= 100;
                      const cost = getUpgradeCost(lvl);
                      const canAfford = saveData.coins >= cost;

                      return (
                        <div
                          key={item.key}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col justify-between gap-3.5 shadow-lg"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-semibold text-slate-300">
                                {item.badge}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-lg text-xs font-mono-num font-extrabold ${
                                  isMax
                                    ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                                    : 'bg-amber-500/15 border border-amber-400/40 text-amber-300'
                                }`}
                              >
                                {isMax ? 'MAX (100/100)' : `Lv. ${lvl} / 100`}
                              </span>
                            </div>

                            <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              {item.desc}
                            </p>

                            {/* Independent Progress Bar (0 to 100) */}
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-[11px] font-mono-num text-slate-300">
                                <span>التقدم (Progress)</span>
                                <span className="font-bold text-white">
                                  {isMax ? '100% MAX' : `${lvl}%`}
                                </span>
                              </div>
                              <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${item.barColor} transition-all duration-200`}
                                  style={{ width: `${lvl}%` }}
                                />
                              </div>
                            </div>

                            <div className="text-xs font-mono-num text-amber-400 font-bold pt-1">
                              {isMax
                                ? 'تم الوصول للحد الأقصى (MAX)'
                                : `سعر المستوى ${lvl + 1}: ${cost.toLocaleString()} كوينز`}
                            </div>
                          </div>

                          <button
                            disabled={isMax || !canAfford}
                            onClick={() => handleUpgrade(item.key)}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-colors whitespace-nowrap ${
                              isMax
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/60 cursor-not-allowed'
                                : canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isMax
                              ? 'MAX · الحد الأقصى'
                              : `ترقية إلى Lv.${lvl + 1} (${cost.toLocaleString()} كوينز)`}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Return Action for Mobile Scroll Convenience */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setPreviewCarColor(null);
                        setActiveModal(MenuModal.NONE);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Home className="w-4 h-4" />
                      <span>تم · العودة للقائمة الرئيسية</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CARS SHOWROOM MODAL WITH UNIQUE 3D CARS & ENGINE AUDIO PREVIEW */}
              {activeModal === MenuModal.SHOWROOM && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {CARS_CATALOG.map((baseCarItem) => {
                      const savedCol = saveData.carColors?.[baseCarItem.id];
                      const car: CarConfig = savedCol
                        ? {
                            ...baseCarItem,
                            bodyColor: savedCol.bodyColor,
                            secondaryColor: savedCol.secondaryColor,
                            accentColor: savedCol.bodyColor,
                          }
                        : baseCarItem;
                      const owned = saveData.unlockedCars.includes(car.id);
                      const isSelected = saveData.selectedCar === car.id;
                      const canAfford = saveData.coins >= car.price;

                      return (
                        <div
                          key={car.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'bg-slate-950 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.28)] ring-1 ring-amber-400/40'
                              : 'bg-slate-950/95 border-slate-700/80 hover:border-cyan-400/60 shadow-[0_0_16px_rgba(15,23,42,0.85)]'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Unique 2K Ultra-HD 3D Car Thumbnail */}
                            <CarThumbnailCanvas car={car} />

                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <h3 className="font-display font-bold text-white text-sm">
                                  {car.name}
                                </h3>
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-[10px] font-mono-num text-amber-300 font-bold">
                                  ULTRA HD
                                </span>
                              </div>
                              <p className="text-xs text-cyan-400 font-semibold mt-0.5">
                                {car.arabicName}
                              </p>
                              <p className="text-[11px] font-mono-num text-slate-400 mt-0.5">
                                المحرك: {car.engineTypeLabel}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-mono-num text-amber-400 font-bold">
                                {car.price === 0
                                  ? 'مجانية'
                                  : `${car.price.toLocaleString()} Coins`}
                              </span>
                              <button
                                onClick={() => soundEngine.playCarRevPreview(car)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-300 border border-slate-700 transition-colors cursor-pointer"
                              >
                                🔊 صوت المحرك والشكمان
                              </button>
                            </div>

                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {car.subtitle}
                            </p>

                            {/* Spec Bars */}
                            <div className="space-y-1.5 pt-1 text-[11px] font-mono-num">
                              <div>
                                <div className="flex justify-between text-slate-300">
                                  <span>السرعة القصوى</span>
                                  <span>{car.baseSpeed * 10} km/h</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                                  <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-300"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (car.baseSpeed / 33) * 100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-slate-300">
                                  <span>التسارع والقفز</span>
                                  <span>{car.baseAccel * 10}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (car.baseAccel / 29) * 100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectOrBuyCar(car)}
                            disabled={!owned && !canAfford}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-colors whitespace-nowrap cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                                : owned
                                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                : canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isSelected
                              ? '✓ المركبة المختارة حالياً'
                              : owned
                              ? 'اختيار المركبة'
                              : `شراء (${car.price.toLocaleString()} كوينز)`}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Return Action for Mobile Scroll Convenience */}
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveModal(MenuModal.NONE);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Home className="w-4 h-4" />
                      <span>تم · العودة للقائمة الرئيسية</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MAPS SHOWROOM MODAL WITH 2K/HD ENVIRONMENT THUMBNAILS */}
              {activeModal === MenuModal.MAPS && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                    {MAPS_CATALOG.map((map) => {
                      const owned = saveData.unlockedMaps.includes(map.id);
                      const isSelected = saveData.selectedMap === map.id;
                      const canAfford = saveData.coins >= map.price;
                      const bestDist = saveData.bestDistanceByMap[map.id] || 0;

                      return (
                        <div
                          key={map.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'bg-slate-950 border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.28)] ring-1 ring-cyan-400/40'
                              : 'bg-slate-950/95 border-slate-700/80 hover:border-emerald-400/60 shadow-[0_0_16px_rgba(15,23,42,0.85)]'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <MapThumbnailCanvas map={map} />

                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-semibold text-emerald-400">
                                  {map.environmentBadge}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-mono-num text-cyan-300 font-bold">
                                  2K TRACK
                                </span>
                              </div>
                              <h3 className="font-bold text-white text-sm mt-1">
                                {map.arabicName}
                              </h3>
                              <div className="text-xs font-mono-num text-amber-400 font-bold mt-0.5">
                                السعر:{' '}
                                {map.price === 0
                                  ? 'مجانية (مفتوحة)'
                                  : `${map.price.toLocaleString()} Coins`}
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {map.subtitle}
                            </p>

                            <div className="pt-1 space-y-1 text-[11px] text-slate-300 font-mono-num">
                              <div className="flex justify-between">
                                <span className="text-slate-400">مضاعف الكوينز:</span>
                                <strong className="text-amber-400">
                                  ×{map.coinMultiplier}
                                </strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">أفضل مسافة:</span>
                                <strong className="text-cyan-400">{bestDist} m</strong>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectOrBuyMap(map)}
                            disabled={!owned && !canAfford}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-colors whitespace-nowrap cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                                : owned
                                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                : canAfford
                                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                : 'bg-slate-800/60 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isSelected
                              ? '✓ الحلبة المختارة حالياً'
                              : owned
                              ? 'اختيار الحلبة'
                              : `شراء (${map.price.toLocaleString()} كوينز)`}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bottom Return Action for Mobile Scroll Convenience */}
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setActiveModal(MenuModal.NONE);
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Home className="w-4 h-4" />
                      <span>تم · العودة للقائمة الرئيسية</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SETTINGS MODAL — Smoothly Scrollable with Close / Main Menu Button */}
              {activeModal === MenuModal.SETTINGS && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Audio Controls */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {saveData.settings.muted ? (
                            <VolumeX className="w-4 h-4 text-red-400" />
                          ) : (
                            <Volume2 className="w-4 h-4 text-emerald-400" />
                          )}
                          <h3 className="font-bold text-white text-sm">
                            التحكم بالصوت والشكمان (Audio & Backfire SFX)
                          </h3>
                        </div>
                        <button
                          onClick={() =>
                            setSaveData((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                muted: !prev.settings.muted,
                              },
                            }))
                          }
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            saveData.settings.muted
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {saveData.settings.muted
                            ? 'مكتوم (Muted)'
                            : 'مفعل (Active)'}
                        </button>
                      </div>

                      <div className="space-y-3.5">
                        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                          <div className="flex justify-between text-xs text-amber-300 font-semibold mb-1.5">
                            <span>مستوى الصوت الرئيسي (Master Volume)</span>
                            <span className="font-mono-num text-white">
                              {saveData.settings.masterVolume ?? 100}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={saveData.settings.masterVolume ?? 100}
                            onChange={(e) =>
                              setSaveData((prev) => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  masterVolume: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full accent-amber-400 cursor-pointer"
                          />
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                          <div className="flex justify-between text-xs text-emerald-300 font-semibold mb-1.5">
                            <span>أصوات الطبيعة والبيئة (Nature SFX)</span>
                            <span className="font-mono-num text-white">
                              {saveData.settings.natureVolume ?? 95}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={saveData.settings.natureVolume ?? 95}
                            onChange={(e) =>
                              setSaveData((prev) => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  natureVolume: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full accent-emerald-400 cursor-pointer"
                          />
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                          <div className="flex justify-between text-xs text-cyan-300 font-semibold mb-1.5">
                            <span>أصوات المحرك والمركبة (Engine SFX)</span>
                            <span className="font-mono-num text-white">
                              {saveData.settings.sfxVolume}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={saveData.settings.sfxVolume}
                            onChange={(e) =>
                              setSaveData((prev) => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  sfxVolume: Number(e.target.value),
                                },
                              }))
                            }
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => soundEngine.playCoin()}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-emerald-300 border border-slate-800 cursor-pointer"
                          >
                            🪙 تجربة صوت الكوينز (Coin SFX)
                          </button>
                          <button
                            onClick={() => soundEngine.playExhaustBackfire(1.2)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-cyan-300 border border-slate-800 cursor-pointer"
                          >
                            💥 تجربة فرقعة الشكمان (Backfire)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Graphics Quality (Low -> Ultra) */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h3 className="font-bold text-white text-sm">
                          الجودة الرسومية (Graphics Quality)
                        </h3>
                      </div>
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {(
                          ['Low', 'Medium', 'High', 'Ultra'] as GraphicsQuality[]
                        ).map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              soundEngine.playClick();
                              setSaveData((prev) => {
                                const nextSettings = { ...prev.settings, quality: q };
                                const nextSave = { ...prev, settings: nextSettings };
                                saveDataRef.current = nextSave;
                                savedSettingsRef.current = structuredClone(nextSettings);
                                saveSettingsToLocalStorage(nextSettings);
                                persistSaveData(nextSave);
                                return nextSave;
                              });
                            }}
                            className={`py-2.5 px-2 rounded-xl font-display font-bold text-xs transition-colors cursor-pointer ${
                              saveData.settings.quality === q
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>

                      {/* Steady Camera + Dynamic Weather & Explosion SFX Controls */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              if (physicsRef.current) {
                                const nextLabel = advanceWeatherPhaseManual(
                                  physicsRef.current
                                );
                                setHudState((prev) => ({
                                  ...prev,
                                  weatherLabel: nextLabel,
                                  rainIntensity: physicsRef.current!.rainIntensity,
                                  cloudDarkness: physicsRef.current!.cloudDarkness,
                                }));
                              }
                              soundEngine.playThunderclap(1.1);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-cyan-300 border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            ⛈️ تبديل الطقس + صوت الرعد والبرق
                          </button>
                          <button
                            onClick={() => {
                              soundEngine.playCarExplosion();
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-red-300 border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            💥 تجربة صوت انفجار السيارة الفخم
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Frame Rate Limiter (30fps to 144fps) */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-cyan-400" />
                        <h3 className="font-bold text-white text-sm">
                          محدد الفريمات (FPS Limit)
                        </h3>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveData.settings.showFpsCounter}
                          onChange={(e) =>
                            setSaveData((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                showFpsCounter: e.target.checked,
                              },
                            }))
                          }
                          className="accent-cyan-400"
                        />
                        <span>إظهار عداد FPS</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {([30, 60, 90, 120, 144] as FpsLimit[]).map((fps) => (
                        <button
                          key={fps}
                          onClick={() => {
                            soundEngine.playClick();
                            setSaveData((prev) => {
                              const nextSettings = { ...prev.settings, fpsLimit: fps };
                              const nextSave = { ...prev, settings: nextSettings };
                              saveDataRef.current = nextSave;
                              savedSettingsRef.current = structuredClone(nextSettings);
                              saveSettingsToLocalStorage(nextSettings);
                              persistSaveData(nextSave);
                              return nextSave;
                            });
                            setHudState((prev) => ({ ...prev, fps }));
                          }}
                          className={`py-2.5 px-2 rounded-xl font-mono-num font-bold text-xs transition-colors cursor-pointer ${
                            saveData.settings.fpsLimit === fps
                              ? 'bg-cyan-400 text-slate-950'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {fps} FPS
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clean Action Buttons Only */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        const fresh = structuredClone(DEFAULT_SAVE_DATA);
                        savedSettingsRef.current = structuredClone(
                          fresh.settings
                        );
                        setSaveData(fresh);
                        saveSettingsToLocalStorage(fresh.settings);
                        persistSaveData(fresh);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      إعادة ضبط التقدم (Reset)
                    </button>
                    <button
                      onClick={handleSaveSettings}
                      className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {settingsSavedToast
                          ? '✓ تم الحفظ! (Saved!)'
                          : 'حفظ الإعدادات (Save Settings)'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* SINGLE-FILE HTML EXPORT MODAL */}
              {activeModal === MenuModal.EXPORT_HTML && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs md:text-sm text-slate-300">
                      كود اللعبة كاملاً بالوضع الأفقي والنهاري مدمج في ملف واحد{' '}
                      <code className="text-cyan-400 font-mono-num">
                        index.html
                      </code>
                      :
                    </p>
                    <div className="flex gap-2.5">
                      <button
                        onClick={handleDownloadStandaloneHtml}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل index.html</span>
                      </button>
                      <button
                        onClick={handleCopyStandaloneHtml}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                      >
                        <Copy className="w-4 h-4 text-cyan-400" />
                        <span>
                          {copiedHtml ? '✓ تم النسخ!' : 'نسخ الكود الكامل'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <pre
                    dir="ltr"
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono-num text-slate-300 overflow-x-auto max-h-60 leading-relaxed"
                  >
                    {generateStandaloneHtml()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
