import { CarConfig, GameSettings } from '../types/game';

class SoundEngine {
  private readonly NORMALIZED_SAMPLE_RATE = 48000;
  private ctx: AudioContext | null = null;
  private masterBusGain: GainNode | null = null;
  private dcBlockerFilter: BiquadFilterNode | null = null;
  private masterBassBoost: BiquadFilterNode | null = null;
  private masterPresenceBoost: BiquadFilterNode | null = null;
  private masterHighCutFilter: BiquadFilterNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private masterBrickwallLimiter: DynamicsCompressorNode | null = null;
  private masterLimiterGain: GainNode | null = null;
  private sampleNode: AudioBufferSourceNode | null = null;
  private primaryOsc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private primaryOscGain: GainNode | null = null;
  private subOscGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private formantNode: BiquadFilterNode | null = null;
  private driveShaper: WaveShaperNode | null = null;
  private engineGain: GainNode | null = null;
  private sampleGain: GainNode | null = null;
  // Continuous Jet Thruster Afterburner Nodes for Flying Car Mode ("أصوات محرك نفاث واقعية وحماسية عند الضغط على زر البنزين GAS أثناء الطيران")
  private jetNoiseBuffer: AudioBuffer | null = null;
  private jetNoiseNode: AudioBufferSourceNode | null = null;
  private jetFilterNode: BiquadFilterNode | null = null;
  private jetSubOsc: OscillatorNode | null = null;
  private jetSubGain: GainNode | null = null;
  private jetGain: GainNode | null = null;
  private engineBuffers: Map<string, AudioBuffer> = new Map();
  private currentTimbre: string = '';
  private smoothedRpmRatio: number = 0;
  private lastBackfireTime: number = 0;
  private lastCoinTime: number = 0;
  private lastImpactTime: number = 0;

  // Continuous Environmental Ambience Nodes (Natural Rain Only — Zero High-Pitch Whistle/Beep)
  private envNoiseNode: AudioBufferSourceNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;

  private settings: GameSettings = {
    masterVolume: 100,
    natureVolume: 100,
    sfxVolume: 100,
    musicEnabled: true,
    muted: false,
    quality: 'Ultra',
    fpsLimit: 60,
    showFpsCounter: true,
    cameraShake: false,
  };

  private pendingSplashStage: 1 | 2 | null = null;
  private lastSplashPlayedStage: number = 0;
  // Pre-baked physical crash & weather buffers for Zero-Lag, Zero-Beep Real SFX!
  private crashRockBuffer: AudioBuffer | null = null;
  private crashMetalBuffer: AudioBuffer | null = null;
  private crashScrapeBuffer: AudioBuffer | null = null;
  private crashSubPunchBuffer: AudioBuffer | null = null;
  private envNoiseBuffer: AudioBuffer | null = null;
  private thunderCrackBuffer: AudioBuffer | null = null;
  private thunderRumbleBuffer: AudioBuffer | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        if (!this.ctx) {
          this.ensureContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx
            .resume()
            .then(() => {
              if (this.pendingSplashStage !== null) {
                const st = this.pendingSplashStage;
                this.pendingSplashStage = null;
                this.playSplashRockstar(st);
              }
            })
            .catch(() => {});
        } else if (this.pendingSplashStage !== null) {
          const st = this.pendingSplashStage;
          this.pendingSplashStage = null;
          this.playSplashRockstar(st);
        }
      };
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('pointermove', unlockAudio, { passive: true });
      window.addEventListener('mousedown', unlockAudio, { passive: true });
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.settings.muted) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx({
            latencyHint: 'interactive',
            sampleRate: this.NORMALIZED_SAMPLE_RATE,
          });
        } catch {
          this.ctx = new AudioCtx();
        }
      }
    }
    if (this.ctx && !this.masterBusGain) {
      // Crystal-Clear Distortion-Free Mastering Chain with Two-Stage DynamicsCompressor & Brickwall Limiter:
      // Master Bus Gain (1.18x Normalized) -> 30Hz Subsonic DC-Blocker -> +3.0dB Smooth Low-Shelf Bass Warmth (105Hz)
      // -> -2.2dB Anti-Mud Clarity Dip (250Hz) -> 5800Hz Butterworth Lowpass (Q=0.707)
      // -> Stage 1 Smooth Dynamic Range Compressor (-14dB, 6:1) -> Stage 2 Brickwall Peak Limiter (-3dB, 20:1)
      // -> 0.88x True-Peak Safety Ceiling -> Destination
      this.masterBusGain = this.ctx.createGain();
      this.masterBusGain.gain.value = 1.18;

      this.dcBlockerFilter = this.ctx.createBiquadFilter();
      this.dcBlockerFilter.type = 'highpass';
      this.dcBlockerFilter.frequency.value = 30;
      this.dcBlockerFilter.Q.value = 0.707;

      this.masterBassBoost = this.ctx.createBiquadFilter();
      this.masterBassBoost.type = 'lowshelf';
      this.masterBassBoost.frequency.value = 105;
      this.masterBassBoost.gain.value = 3.0;

      this.masterPresenceBoost = this.ctx.createBiquadFilter();
      this.masterPresenceBoost.type = 'peaking';
      this.masterPresenceBoost.frequency.value = 250;
      this.masterPresenceBoost.Q.value = 0.9;
      this.masterPresenceBoost.gain.value = -2.2;

      this.masterHighCutFilter = this.ctx.createBiquadFilter();
      this.masterHighCutFilter.type = 'lowpass';
      this.masterHighCutFilter.frequency.value = 5800;
      this.masterHighCutFilter.Q.value = 0.707;

      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.value = -14.0;
      this.masterCompressor.knee.value = 12.0;
      this.masterCompressor.ratio.value = 6.0;
      this.masterCompressor.attack.value = 0.003;
      this.masterCompressor.release.value = 0.15;

      this.masterBrickwallLimiter = this.ctx.createDynamicsCompressor();
      this.masterBrickwallLimiter.threshold.value = -3.0;
      this.masterBrickwallLimiter.knee.value = 0.0;
      this.masterBrickwallLimiter.ratio.value = 20.0;
      this.masterBrickwallLimiter.attack.value = 0.001;
      this.masterBrickwallLimiter.release.value = 0.08;

      this.masterLimiterGain = this.ctx.createGain();
      this.masterLimiterGain.gain.value = 0.88;

      this.masterBusGain.connect(this.dcBlockerFilter);
      this.dcBlockerFilter.connect(this.masterBassBoost);
      this.masterBassBoost.connect(this.masterPresenceBoost);
      this.masterPresenceBoost.connect(this.masterHighCutFilter);
      this.masterHighCutFilter.connect(this.masterCompressor);
      this.masterCompressor.connect(this.masterBrickwallLimiter);
      this.masterBrickwallLimiter.connect(this.masterLimiterGain);
      this.masterLimiterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getOutputNode(ctx: AudioContext): AudioNode {
    return this.masterBusGain || ctx.destination;
  }

  private getNormalizedSampleRate(ctx: AudioContext): number {
    return ctx.sampleRate || this.NORMALIZED_SAMPLE_RATE;
  }

  /**
   * Normalizes an AudioBuffer to remove DC offset, smooth out high-frequency digital scratching,
   * enforce a clean headroom peak threshold (<= targetPeak), and apply click-free fades/loop edges.
   */
  private normalizeAudioBuffer(
    buffer: AudioBuffer,
    targetPeak: number = 0.72,
    isLooping: boolean = false
  ): AudioBuffer {
    const data = buffer.getChannelData(0);
    const len = data.length;
    if (len === 0) return buffer;

    // 1. Remove DC offset
    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += data[i];
    }
    const mean = sum / len;
    for (let i = 0; i < len; i++) {
      data[i] -= mean;
    }

    // 2. Gentle 3-point anti-aliasing smoothing pass to eliminate digital scratching
    let prev = data[0];
    for (let i = 1; i < len - 1; i++) {
      const curr = data[i];
      data[i] = 0.24 * prev + 0.52 * curr + 0.24 * data[i + 1];
      prev = curr;
    }

    // 3. Clean high-fidelity peak normalization with generous headroom to prevent any clipping
    let maxAbs = 0.0001;
    for (let i = 0; i < len; i++) {
      const a = Math.abs(data[i]);
      if (a > maxAbs) maxAbs = a;
    }
    const cleanTarget = Math.min(0.76, Math.max(0.58, targetPeak));
    const scale = Math.min(1.25, cleanTarget / maxAbs);
    for (let i = 0; i < len; i++) {
      data[i] *= scale;
    }

    // 4. Click-free envelope edges or seamless loop boundary cross-fade
    const sr = buffer.sampleRate || this.NORMALIZED_SAMPLE_RATE;
    if (isLooping) {
      const xfSamples = Math.min(Math.floor(sr * 0.012), Math.floor(len * 0.1));
      for (let i = 0; i < xfSamples; i++) {
        const alpha = i / xfSamples;
        const smoothAlpha = 0.5 - 0.5 * Math.cos(alpha * Math.PI);
        const tailIdx = len - xfSamples + i;
        const blended =
          data[i] * smoothAlpha + data[tailIdx] * (1 - smoothAlpha);
        data[i] = blended;
        data[tailIdx] = blended;
      }
    } else {
      const fadeInSamples = Math.min(Math.floor(sr * 0.004), Math.floor(len * 0.15));
      const fadeOutSamples = Math.min(Math.floor(sr * 0.012), Math.floor(len * 0.25));
      for (let i = 0; i < fadeInSamples; i++) {
        const w = 0.5 - 0.5 * Math.cos((i / fadeInSamples) * Math.PI);
        data[i] *= w;
      }
      for (let i = 0; i < fadeOutSamples; i++) {
        const w = 0.5 - 0.5 * Math.cos((i / fadeOutSamples) * Math.PI);
        data[len - 1 - i] *= w;
      }
    }

    return buffer;
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = settings;
    if (this.masterBusGain && this.ctx) {
      const masterScale =
        typeof settings.masterVolume === 'number'
          ? Math.max(0, Math.min(100, settings.masterVolume)) / 100
          : 1.0;
      this.masterBusGain.gain.setTargetAtTime(
        settings.muted ? 0.0001 : Math.max(0.0001, 1.18 * masterScale),
        this.ctx.currentTime,
        0.04
      );
    }
    if (settings.muted) {
      this.stopEngineSound();
      this.stopEnvironmentAmbience();
      return;
    }
    if ((settings.sfxVolume ?? 95) <= 0) {
      this.stopEngineSound();
    }
    if ((settings.natureVolume ?? 95) <= 0) {
      this.stopEnvironmentAmbience();
    }
  }

  /**
   * General SFX Gain (UI clicks, splash logos, nitro, wings, fuel/repair, impacts, explosion):
   * Remains active independently so moving or muting either the Nature slider or Engine slider
   * NEVER turns off the entire game audio!
   */
  private getEffectiveGain(baseGain: number): number {
    if (this.settings.muted) return 0;
    const masterScale =
      typeof this.settings.masterVolume === 'number' &&
      this.settings.masterVolume > 0
        ? this.settings.masterVolume / 100
        : 1.0;
    return Math.min(0.85, Math.max(0, baseGain * 1.12 * masterScale));
  }

  /**
   * Dedicated "Nature & Environmental SFX" Slider Gain:
   * Exclusively controls:
   * 1) Coin pickup sounds (playCoin)
   * 2) Rain & valley ambient sound (updateEnvironmentAmbience)
   * 3) Thunder & lightning sound effects (playThunderclap)
   */
  private getNatureEffectiveGain(baseGain: number): number {
    if (this.settings.muted) return 0;
    const natureVol =
      typeof this.settings.natureVolume === 'number'
        ? this.settings.natureVolume
        : 100;
    if (natureVol <= 0) return 0;
    const volScale = natureVol / 100;
    return Math.min(0.82, Math.max(0, baseGain * 1.08 * volScale));
  }

  /**
   * Dedicated "Engine & Vehicle SFX" Slider Gain:
   * Exclusively controls:
   * 1) Car engine sounds (updateEngineSound & playCarRevPreview)
   * 2) Exhaust backfire / pop shots (playExhaustBackfire)
   */
  private getEngineEffectiveGain(baseGain: number): number {
    if (this.settings.muted) return 0;
    const engineVol =
      typeof this.settings.sfxVolume === 'number'
        ? this.settings.sfxVolume
        : 100;
    if (engineVol <= 0) return 0;
    const volScale = engineVol / 100;
    return Math.min(0.92, Math.max(0, baseGain * 1.24 * volScale));
  }

  /**
   * Builds and caches 100% non-tonal physical acoustic buffers for Heavy Metal & Rock Crash SFX
   * (Normalized sample rate & lowered peak thresholds for crisp, distortion-free collision audio!)
   */
  private ensurePhysicalCrashBuffers(ctx: AudioContext): void {
    if (
      this.crashRockBuffer &&
      this.crashMetalBuffer &&
      this.crashScrapeBuffer &&
      this.crashSubPunchBuffer
    ) {
      return;
    }
    const sr = this.getNormalizedSampleRate(ctx);

    // 1. Warm Physical Rock & Boulder Impact Buffer (0.38s — Smooth low-pass filtered acoustic grains)
    const rockLen = Math.floor(sr * 0.38);
    const rockBuf = ctx.createBuffer(1, rockLen, sr);
    const rData = rockBuf.getChannelData(0);
    let lp1 = 0;
    let lp2 = 0;
    const grainTimes = [0.0, 0.018, 0.045, 0.085, 0.135, 0.195];
    const grainAmps = [0.9, 0.72, 0.56, 0.42, 0.28, 0.16];
    for (let i = 0; i < rockLen; i++) {
      const t = i / sr;
      const white = Math.random() * 2 - 1;
      lp1 = 0.92 * lp1 + 0.08 * white;
      lp2 = 0.78 * lp2 + 0.22 * lp1;
      let grainEnv = 0;
      for (let g = 0; g < grainTimes.length; g++) {
        const dt = t - grainTimes[g];
        if (dt >= 0) {
          grainEnv += grainAmps[g] * Math.exp(-dt * 28);
        }
      }
      const bodyThud = Math.sin(2 * Math.PI * (78 * Math.exp(-t * 8)) * t) * Math.exp(-t * 18) * 0.45;
      rData[i] = Math.tanh((lp1 * 0.85 + lp2 * 0.65) * grainEnv * 0.75 + bodyThud);
    }
    this.crashRockBuffer = this.normalizeAudioBuffer(rockBuf, 0.72, false);

    // 2. Smooth Chassis & Sheet-Metal Impact Buffer (0.42s — Zero harsh comb-filter scratching!)
    const metalLen = Math.floor(sr * 0.42);
    const metalBuf = ctx.createBuffer(1, metalLen, sr);
    const mData = metalBuf.getChannelData(0);
    let mp1 = 0;
    let mp2 = 0;
    const crunchImpulses = [0.0, 0.015, 0.038, 0.072, 0.118, 0.175];
    for (let i = 0; i < metalLen; i++) {
      const t = i / sr;
      const white = Math.random() * 2 - 1;
      mp1 = 0.9 * mp1 + 0.1 * white;
      mp2 = 0.75 * mp2 + 0.25 * mp1;
      let burst = 0;
      for (let c = 0; c < crunchImpulses.length; c++) {
        const dt = t - crunchImpulses[c];
        if (dt >= 0) {
          burst += Math.exp(-dt * (26 + c * 3.0)) * (0.85 - c * 0.1);
        }
      }
      const lowBody =
        (Math.sin(2 * Math.PI * 112 * Math.exp(-t * 6) * t) * 0.5 +
          Math.sin(2 * Math.PI * 64 * Math.exp(-t * 5) * t) * 0.45) *
        Math.exp(-t * 14);
      mData[i] = Math.tanh((mp1 * 0.75 + mp2 * 0.6) * burst * 0.65 + lowBody);
    }
    this.crashMetalBuffer = this.normalizeAudioBuffer(metalBuf, 0.72, false);

    // 3. Smooth Damped Chassis Friction Brush Buffer (0.24s — Zero scratching!)
    const scrapeLen = Math.floor(sr * 0.24);
    const scrapeBuf = ctx.createBuffer(1, scrapeLen, sr);
    const sData = scrapeBuf.getChannelData(0);
    let sp1 = 0;
    let sp2 = 0;
    for (let i = 0; i < scrapeLen; i++) {
      const t = i / sr;
      const white = Math.random() * 2 - 1;
      sp1 = 0.91 * sp1 + 0.09 * white;
      sp2 = 0.82 * sp2 + 0.18 * sp1;
      const env = Math.sin((t / 0.24) * Math.PI) * Math.exp(-t * 5.2);
      sData[i] = Math.tanh(sp2 * env * 1.1);
    }
    this.crashScrapeBuffer = this.normalizeAudioBuffer(scrapeBuf, 0.65, false);

    // 4. Deep Physical Sub-Bass Body Impact Punch Buffer (0.22s — Clean Warm Low-End Thud!)
    const punchLen = Math.floor(sr * 0.22);
    const punchBuf = ctx.createBuffer(1, punchLen, sr);
    const pData = punchBuf.getChannelData(0);
    let subLp1 = 0;
    let subLp2 = 0;
    for (let i = 0; i < punchLen; i++) {
      const t = i / sr;
      const white = Math.random() * 2 - 1;
      subLp1 = 0.965 * subLp1 + 0.035 * white;
      subLp2 = 0.94 * subLp2 + 0.06 * subLp1;
      const thudEnv = Math.exp(-t * 20);
      const warmSub = Math.sin(2 * Math.PI * (86 * Math.exp(-t * 7)) * t) * thudEnv * 0.75;
      pData[i] = Math.tanh(subLp2 * thudEnv * 1.1 + warmSub);
    }
    this.crashSubPunchBuffer = this.normalizeAudioBuffer(punchBuf, 0.76, false);
  }

  /**
   * Original Luxurious Cinematic Sub-Bass Boom & Prestige Chord ("بمّّم") for Both Splash Logos
   * (Stage 1: MIDO NX, Stage 2: Official Game Cover Mido NX: Apex Hill Racing)
   * ("استعادة وتشغيل أصوات الدخول السابقة الفخمة للشعار الأول والشعار الثاني فور ظهورها في البداية")
   */
  public playSplashRockstar(stage: 1 | 2 = 1): void {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Loud, rich prestige volume for the two splash logos
    const masterGain = this.getEffectiveGain(0.95);
    if (masterGain <= 0) return;

    const triggerSynth = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const sr = this.getNormalizedSampleRate(this.ctx);
      this.lastSplashPlayedStage = stage;

      // 1. Deep Sub-Bass Drop ("بمّّم" 148Hz -> 30Hz)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      const startFreq = stage === 1 ? 148 : 164;
      subOsc.frequency.setValueAtTime(startFreq, now);
      subOsc.frequency.exponentialRampToValueAtTime(56, now + 0.34);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 2.35);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(masterGain * 0.72, now + 0.035);
      subGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.45);

      subOsc.connect(subGain);
      subGain.connect(this.getOutputNode(this.ctx));
      subOsc.start(now);
      subOsc.stop(now + 2.5);

      // 2. Clear Upper-Bass Harmonic Body (98Hz -> 48Hz Triangle)
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(stage === 1 ? 98 : 112, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(
        stage === 1 ? 46 : 52,
        now + 2.0
      );
      bodyGain.gain.setValueAtTime(0.001, now);
      bodyGain.gain.linearRampToValueAtTime(masterGain * 0.56, now + 0.04);
      bodyGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.1);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(this.getOutputNode(this.ctx));
      bodyOsc.start(now);
      bodyOsc.stop(now + 2.15);

      // 3. Luxurious Cinematic Braaam & Prestige Harmonic Swell
      const chordFreqs =
        stage === 1
          ? [65.41, 98.0, 130.81, 196.0, 261.63]
          : [82.41, 123.47, 164.81, 246.94, 329.63];
      chordFreqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const punchOsc = this.ctx.createOscillator();
        const punchFilter = this.ctx.createBiquadFilter();
        const punchGain = this.ctx.createGain();
        punchOsc.type = idx >= 2 ? 'sine' : 'triangle';
        punchOsc.frequency.setValueAtTime(freq, now);
        punchOsc.frequency.exponentialRampToValueAtTime(freq * 0.92, now + 2.2);

        punchFilter.type = 'lowpass';
        punchFilter.frequency.setValueAtTime(640, now);
        punchFilter.frequency.exponentialRampToValueAtTime(160, now + 2.15);

        const voiceWeight =
          idx === 0 ? 0.34 : idx === 1 ? 0.26 : idx === 2 ? 0.2 : 0.14;
        punchGain.gain.setValueAtTime(0.001, now);
        punchGain.gain.linearRampToValueAtTime(
          masterGain * voiceWeight,
          now + 0.055
        );
        punchGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.25);

        punchOsc.connect(punchFilter);
        punchFilter.connect(punchGain);
        punchGain.connect(this.getOutputNode(this.ctx));
        punchOsc.start(now);
        punchOsc.stop(now + 2.3);
      });

      // 4. Smooth Filtered Impact Thud at t=0
      const bufferSize = Math.floor(sr * 0.26);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sr);
      const data = noiseBuffer.getChannelData(0);
      let lp = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lp = 0.9 * lp + 0.1 * white;
        data[i] = lp * Math.exp(-i / (sr * 0.055));
      }
      this.normalizeAudioBuffer(noiseBuffer, 0.65, false);

      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 220;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = masterGain * 0.55;

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.getOutputNode(this.ctx));
      noise.start(now);
    };

    if (ctx.state === 'running') {
      this.pendingSplashStage = null;
      triggerSynth();
    } else {
      this.pendingSplashStage = stage;
      ctx
        .resume()
        .then(() => {
          if (this.pendingSplashStage === stage) {
            this.pendingSplashStage = null;
            triggerSynth();
          }
        })
        .catch(() => {});
    }
  }

  /**
   * Realistic Exhaust Backfire Pop & Bang ("طق / بوم الشكمان") at high RPM / Nitro / Decel while actively driving
   * Exclusively controlled by the "Engine & Vehicle SFX" slider!
   */
  public playExhaustBackfire(intensity = 1.0, exhaustSoundLevel = 0): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const upgradeRatio = Math.max(0, Math.min(1, exhaustSoundLevel / 100));
    const boostedIntensity = intensity * (1 + upgradeRatio * 0.35);
    // Slightly increased backfire pop volume while driving/moving, keeping 100% clean headroom
    const gainVal = this.getEngineEffectiveGain(0.74 * Math.min(1.35, boostedIntensity));
    if (gainVal <= 0) return;
    const now = ctx.currentTime;
    const minCooldown = Math.max(0.08, 0.14 - upgradeRatio * 0.05);
    if (now - this.lastBackfireTime < minCooldown) return;
    this.lastBackfireTime = now;

    const triggerPopShot = (startTime: number, scale: number) => {
      // 1. Deep Sub-Bass Muffler Thump (142Hz -> 36Hz in 105ms with Butterworth lowpass for punchy bass without clipping)
      const thumpOsc = ctx.createOscillator();
      const thumpFilter = ctx.createBiquadFilter();
      const thumpGain = ctx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(142 + Math.random() * 24 + upgradeRatio * 18, startTime);
      thumpOsc.frequency.exponentialRampToValueAtTime(34, startTime + 0.1);

      thumpFilter.type = 'lowpass';
      thumpFilter.frequency.setValueAtTime(210 + upgradeRatio * 65, startTime);
      thumpFilter.Q.setValueAtTime(0.707, startTime);

      thumpGain.gain.setValueAtTime(0.0008, startTime);
      thumpGain.gain.linearRampToValueAtTime(gainVal * 0.84 * scale, startTime + 0.007);
      thumpGain.gain.exponentialRampToValueAtTime(0.0008, startTime + 0.105);

      thumpOsc.connect(thumpFilter);
      thumpFilter.connect(thumpGain);
      thumpGain.connect(this.getOutputNode(ctx));
      thumpOsc.start(startTime);
      thumpOsc.stop(startTime + 0.11);

      // 2. Smooth Low-Pass Filtered Exhaust Pop Shot (Punchy & Clear, Zero Clipping)
      const sr = this.getNormalizedSampleRate(ctx);
      const bufLen = Math.floor(sr * 0.085);
      const buf = ctx.createBuffer(1, bufLen, sr);
      const out = buf.getChannelData(0);
      let lp1 = 0;
      let lp2 = 0;
      for (let i = 0; i < bufLen; i++) {
        const white = Math.random() * 2 - 1;
        lp1 = 0.88 * lp1 + 0.12 * white;
        lp2 = 0.82 * lp2 + 0.18 * lp1;
        out[i] = lp2 * Math.exp(-i / (sr * 0.022));
      }
      this.normalizeAudioBuffer(buf, 0.72, false);

      const popSource = ctx.createBufferSource();
      popSource.buffer = buf;

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 360 + Math.random() * 120 + upgradeRatio * 90;
      bp.Q.value = 0.8;

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.0008, startTime);
      popGain.gain.linearRampToValueAtTime(gainVal * 0.65 * scale, startTime + 0.006);
      popGain.gain.exponentialRampToValueAtTime(0.0008, startTime + 0.085);

      popSource.connect(bp);
      bp.connect(popGain);
      popGain.connect(this.getOutputNode(ctx));
      popSource.start(startTime);
    };

    triggerPopShot(now, 1.0);
    // Secondary crackle pops unlocked as exhaustSoundLevel increases ("طلاق الشكمان")
    if (exhaustSoundLevel >= 15 && Math.random() < 0.45 + upgradeRatio * 0.45) {
      triggerPopShot(now + 0.075, 0.72);
    }
    if (exhaustSoundLevel >= 50 && Math.random() < upgradeRatio * 0.65) {
      triggerPopShot(now + 0.145, 0.54);
    }
  }

  /**
   * Generates a 100% distortion-free, velvet-smooth, luxurious deep sub-bass engine sound buffer (Bass-focused).
   * Synthesizes a heavy, rich, punchy sub-bass & low-mid muffler resonance without any harshness, clipping, or noise.
   */
  private getOrCreateEngineSampleBuffer(
    ctx: AudioContext,
    timbre: string
  ): AudioBuffer {
    const key =
      timbre === 'v6_offroad'
        ? 'v8_4x4'
        : timbre === 'v8_baja'
        ? 'diesel_truck'
        : timbre === 'turbo_rally'
        ? 'v6_sports'
        : timbre;

    const cached = this.engineBuffers.get(key);
    if (cached) return cached;

    const duration = 2.4;
    const sampleRate = this.getNormalizedSampleRate(ctx);
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let subLp1 = 0;
    let subLp2 = 0;
    let lp1 = 0;
    let lp2 = 0;
    let lp3 = 0;
    let modLp = 0;

    // Rich audible bass & low-mid muffler filter coefficients (preserves full 55Hz-750Hz engine body & roar)
    const filterAlpha =
      key === 'diesel_truck'
        ? 0.21
        : key === 'v8_4x4'
        ? 0.24
        : key === 'v6_sports'
        ? 0.29
        : 0.26;

    // Exact integer cycle counts over 2.4s (multiples of 1.25Hz) for 100% seamless loop continuity
    const subFreq =
      key === 'diesel_truck'
        ? 55.0
        : key === 'v8_4x4'
        ? 62.5
        : key === 'v6_sports'
        ? 72.5
        : 67.5;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const white = Math.random() * 2 - 1;
      b0 = 0.995 * b0 + white * 0.045;
      b1 = 0.975 * b1 + white * 0.085;
      b2 = 0.91 * b2 + white * 0.14;

      // Smooth continuous low-frequency airflow modulation
      modLp = 0.995 * modLp + 0.005 * b1;
      const smoothMod = 0.86 + 0.24 * Math.tanh(modLp * 1.5);

      // Multi-harmonic internal combustion cylinder pulse train + deep sub-bass fundamental (31Hz - 435Hz)
      const phase = 2 * Math.PI * subFreq * t;
      const deepSubWave =
        Math.sin(phase * 0.5 + 0.2) * 0.32 +
        Math.sin(phase) * 0.48 +
        Math.sin(phase * 1.5 + 0.45) * 0.26 +
        Math.sin(phase * 2.0 + 0.8) * 0.36 +
        Math.sin(phase * 3.0 + 1.1) * 0.22 +
        Math.sin(phase * 4.0 + 1.5) * 0.14 +
        Math.sin(phase * 5.0 + 0.3) * 0.08;
      const pulseEnvelope =
        0.58 +
        0.42 * Math.max(0, Math.sin(phase)) +
        0.28 * Math.max(0, Math.sin(phase * 2.0 + 0.4));

      // Deep sub-bass acoustic core (45Hz - 180Hz)
      const rawSubCore = b0 * 0.65 + b1 * 0.35;
      subLp1 = subLp1 + 0.085 * (rawSubCore - subLp1);
      subLp2 = subLp2 + 0.075 * (subLp1 - subLp2);

      // Warm low-mid muffler resonance & exhaust roar (80Hz - 680Hz)
      const exhaustBody =
        (b0 * 0.45 + b1 * 0.35 + b2 * 0.2) * smoothMod * pulseEnvelope;
      lp1 = lp1 + filterAlpha * (exhaustBody - lp1);
      lp2 = lp2 + filterAlpha * 0.88 * (lp1 - lp2);
      lp3 = lp3 + filterAlpha * 0.82 * (lp2 - lp3);

      data[i] = Math.tanh(
        (deepSubWave * 0.68 + subLp2 * 0.64 + lp3 * 0.72) * 1.12
      );
    }

    this.normalizeAudioBuffer(buffer, 0.8, true);
    this.engineBuffers.set(key, buffer);
    return buffer;
  }

  private createDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const nSamples = 1024;
    const curve = new Float32Array(new ArrayBuffer(nSamples * 4));
    for (let i = 0; i < nSamples; i++) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = Math.tanh(x * amount);
    }
    return curve;
  }

  /**
   * Cinematic Flying Car Wing Transformation & Jet Turbine Sound (Zero Whistle!)
   * ("إلغاء وإزالة صوت الصفير الحاد والمزعج تماماً عند تحول السيارة إلى طائرة والعكس، واستبداله بمؤثر صوتي حماسي وهادئ Cinematic Mech/Jet Engine Sound يتناسب مع حركة الأجنحة")
   */
  public playWingTransformSFX(isDeploying: boolean = true): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const gainVal = this.getEffectiveGain(0.88);
    if (gainVal <= 0) return;
    const now = ctx.currentTime;

    // 1. Warm Cinematic Jet Airflow Cushion (Filtered Pink/Brown Noise — Zero High-Pitch Whistle!)
    const dur = 1.45;
    const bufLen = Math.floor(ctx.sampleRate * dur);
    const airBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = airBuf.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufLen; i++) {
      const t = i / ctx.sampleRate;
      const white = Math.random() * 2 - 1;
      // Warm brown/pink noise smoothing so there is zero harshness or hiss
      lastOut = (lastOut + 0.06 * white) / 1.06;
      const env =
        Math.min(1, t / 0.22) * Math.exp(-Math.max(0, t - 0.35) * 2.1);
      data[i] = lastOut * 1.2 * env;
    }
    this.normalizeAudioBuffer(airBuf, 0.68, false);

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = airBuf;

    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'lowpass';
    airFilter.Q.setValueAtTime(0.7, now);
    airFilter.frequency.setValueAtTime(isDeploying ? 140 : 320, now);
    airFilter.frequency.exponentialRampToValueAtTime(
      isDeploying ? 340 : 130,
      now + 1.25
    );

    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(0.001, now);
    airGain.gain.linearRampToValueAtTime(gainVal * 0.85, now + 0.25);
    airGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noiseSrc.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(this.getOutputNode(ctx));
    noiseSrc.start(now);

    // 2. Deep, Calm Mechanical Wing-Lock Sub-Bass Chord (65Hz - 130Hz only, low-pass filtered at 240Hz)
    const mechNotes = isDeploying ? [72, 96, 128] : [128, 96, 68];
    mechNotes.forEach((freq, idx) => {
      const tStart = now + idx * 0.28;
      const osc = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      const g = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, tStart);
      osc.frequency.exponentialRampToValueAtTime(
        isDeploying ? freq * 1.08 : freq * 0.9,
        tStart + 0.26
      );

      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(220, tStart);

      g.gain.setValueAtTime(0.001, tStart);
      g.gain.linearRampToValueAtTime(gainVal * 0.78, tStart + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, tStart + 0.28);

      osc.connect(lp);
      lp.connect(g);
      g.connect(this.getOutputNode(ctx));
      osc.start(tStart);
      osc.stop(tStart + 0.3);
    });
  }

  /**
   * Bridge traversal repetitive tones are permanently silenced to prevent any repetitive "nn nn nn" background tones.
   */
  public playBridgeMechanismSFX(_intensity: number = 1.0): void {
    // Intentionally silent — prevents repetitive oscillator notes during intro & gameplay
  }

  /**
   * Repair Wrench Pickup & Full Vehicle Restoration SFX ("إصلاح هيكل السيارة وكشافاتها 100%")
   */
  public playRepairWrenchSFX(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const gainVal = this.getEffectiveGain(0.88);
    if (gainVal <= 0) return;
    const now = ctx.currentTime;

    // Pneumatic ratchet clicks + ascending restoration chord
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      const t0 = now + idx * 0.065;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(gainVal * 0.65, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
      osc.connect(g);
      g.connect(this.getOutputNode(ctx));
      osc.start(t0);
      osc.stop(t0 + 0.24);
    });
  }
  public playCarRevPreview(car: CarConfig): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gainVal = this.getEngineEffectiveGain(0.66);
    if (gainVal <= 0) return;

    const sampleBuf = this.getOrCreateEngineSampleBuffer(ctx, car.engineTimbre);
    const sampleSrc = ctx.createBufferSource();
    sampleSrc.buffer = sampleBuf;
    sampleSrc.loop = true;

    const bassShelf = ctx.createBiquadFilter();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    const isDiesel =
      car.engineTimbre === 'diesel_truck' || car.engineTimbre === 'v8_baja';
    const isV6Sports =
      car.engineTimbre === 'v6_sports' || car.engineTimbre === 'turbo_rally';

    const baseRate = isDiesel ? 0.65 : isV6Sports ? 0.92 : 0.78;
    const peakRate = isDiesel ? 1.5 : isV6Sports ? 2.15 : 1.8;

    sampleSrc.playbackRate.setValueAtTime(baseRate, now);
    sampleSrc.playbackRate.exponentialRampToValueAtTime(peakRate, now + 0.25);
    sampleSrc.playbackRate.exponentialRampToValueAtTime(baseRate * 1.08, now + 0.65);

    bassShelf.type = 'lowshelf';
    bassShelf.frequency.setValueAtTime(110, now);
    bassShelf.gain.setValueAtTime(2.6, now);

    filter.type = 'lowpass';
    filter.Q.value = 0.707;
    filter.frequency.setValueAtTime(280, now);
    filter.frequency.exponentialRampToValueAtTime(
      isV6Sports ? 760 : isDiesel ? 520 : 640,
      now + 0.25
    );
    filter.frequency.exponentialRampToValueAtTime(260, now + 0.65);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainVal * 0.78, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

    sampleSrc.connect(bassShelf);
    bassShelf.connect(filter);
    filter.connect(gain);
    gain.connect(this.getOutputNode(ctx));

    sampleSrc.start(now);
    sampleSrc.stop(now + 0.7);
  }

  /**
   * Authentic Nitro Turbo Thrust SFX ("تأثير النيترو: صوت اندفاع نيترو حقيقي وواقعي Turbo Thrust SFX")
   * Combines:
   * 1. High-pressure N2O solenoid purge valve hiss
   * 2. Deep supersonic jet afterburner combustion roar
   * 3. Twin-scroll turbocharger compressor spool-up whine
   */
  public playNitroThrust(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const outNode = this.getOutputNode(ctx);
    const masterGain = this.getEffectiveGain(0.92);
    if (masterGain <= 0) return;

    const now = ctx.currentTime;
    const sr = this.getNormalizedSampleRate(ctx);

    // 1. Smooth Warm N2O Jet Plume Roar (Low-pass filtered pink/brown noise — Zero static scratching!)
    const dur = 0.65;
    const len = Math.floor(sr * dur);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    let lp1 = 0;
    let lp2 = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const white = Math.random() * 2 - 1;
      lp1 = 0.91 * lp1 + 0.09 * white;
      lp2 = 0.82 * lp2 + 0.18 * lp1;
      const attack = Math.min(1, t / 0.035);
      const decay = Math.exp(-t * 2.6);
      data[i] = lp2 * attack * decay;
    }
    this.normalizeAudioBuffer(buf, 0.7, false);

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buf;

    const jetFilter = ctx.createBiquadFilter();
    jetFilter.type = 'lowpass';
    jetFilter.Q.setValueAtTime(0.75, now);
    jetFilter.frequency.setValueAtTime(780, now);
    jetFilter.frequency.exponentialRampToValueAtTime(360, now + 0.18);
    jetFilter.frequency.exponentialRampToValueAtTime(520, now + dur);

    const jetGain = ctx.createGain();
    jetGain.gain.setValueAtTime(0.0008, now);
    jetGain.gain.linearRampToValueAtTime(masterGain * 0.68, now + 0.025);
    jetGain.gain.exponentialRampToValueAtTime(0.0008, now + dur);

    noiseSrc.connect(jetFilter);
    jetFilter.connect(jetGain);
    jetGain.connect(outNode);
    noiseSrc.start(now);

    // 2. Smooth Sub-Bass Afterburner Ignition Punch (130Hz -> 42Hz Triangle with soft attack)
    const punchOsc = ctx.createOscillator();
    const punchGain = ctx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(130, now);
    punchOsc.frequency.exponentialRampToValueAtTime(42, now + 0.42);

    const punchFilter = ctx.createBiquadFilter();
    punchFilter.type = 'lowpass';
    punchFilter.frequency.setValueAtTime(240, now);

    punchGain.gain.setValueAtTime(0.0008, now);
    punchGain.gain.linearRampToValueAtTime(masterGain * 0.62, now + 0.016);
    punchGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);

    punchOsc.connect(punchFilter);
    punchFilter.connect(punchGain);
    punchGain.connect(outNode);
    punchOsc.start(now);
    punchOsc.stop(now + 0.46);
  }

  /**
   * 100% Authentic Heavy Metal & Rock Crash Sound (Smooth, High-Fidelity, Zero Clipping/Scratching!)
   */
  public playImpactThud(intensity: number = 1.0): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Debounce rapid consecutive obstacle impacts to prevent polyphonic stacking/clipping
    if (now - this.lastImpactTime < 0.065) return;
    this.lastImpactTime = now;

    const outNode = this.getOutputNode(ctx);
    const clamped = Math.max(0.4, Math.min(1.2, intensity));
    const gainVal = this.getEffectiveGain(0.68 * clamped);
    if (gainVal <= 0) return;

    this.ensurePhysicalCrashBuffers(ctx);

    // 1. Deep Physical Sub-Bass Chassis & Suspension Thud
    if (this.crashSubPunchBuffer) {
      const punchSrc = ctx.createBufferSource();
      punchSrc.buffer = this.crashSubPunchBuffer;
      punchSrc.playbackRate.setValueAtTime(0.9 + Math.random() * 0.12, now);

      const punchFilter = ctx.createBiquadFilter();
      punchFilter.type = 'lowpass';
      punchFilter.frequency.setValueAtTime(165, now);

      const punchGain = ctx.createGain();
      punchGain.gain.setValueAtTime(0.0008, now);
      punchGain.gain.linearRampToValueAtTime(gainVal * 0.65, now + 0.006);
      punchGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.22);

      punchSrc.connect(punchFilter);
      punchFilter.connect(punchGain);
      punchGain.connect(outNode);
      punchSrc.start(now);
    }

    // 2. Smooth Sheet-Metal Chassis Impact
    if (this.crashMetalBuffer) {
      const metalSrc = ctx.createBufferSource();
      metalSrc.buffer = this.crashMetalBuffer;
      metalSrc.playbackRate.setValueAtTime(0.88 + Math.random() * 0.16, now);

      const metalFilter = ctx.createBiquadFilter();
      metalFilter.type = 'lowpass';
      metalFilter.Q.setValueAtTime(0.8, now);
      metalFilter.frequency.setValueAtTime(1350 + clamped * 350, now);
      metalFilter.frequency.exponentialRampToValueAtTime(360, now + 0.4);

      const metalGain = ctx.createGain();
      metalGain.gain.setValueAtTime(0.0008, now);
      metalGain.gain.linearRampToValueAtTime(gainVal * 0.52, now + 0.008);
      metalGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.42);

      metalSrc.connect(metalFilter);
      metalFilter.connect(metalGain);
      metalGain.connect(outNode);
      metalSrc.start(now);
    }

    // 3. Warm Rock Impact Impulse
    if (this.crashRockBuffer) {
      const rockSrc = ctx.createBufferSource();
      rockSrc.buffer = this.crashRockBuffer;
      rockSrc.playbackRate.setValueAtTime(0.92 + Math.random() * 0.15, now);

      const rockFilter = ctx.createBiquadFilter();
      rockFilter.type = 'lowpass';
      rockFilter.Q.setValueAtTime(0.7, now);
      rockFilter.frequency.setValueAtTime(1150 + clamped * 280, now);
      rockFilter.frequency.exponentialRampToValueAtTime(280, now + 0.36);

      const rockGain = ctx.createGain();
      rockGain.gain.setValueAtTime(0.0008, now);
      rockGain.gain.linearRampToValueAtTime(gainVal * 0.45, now + 0.008);
      rockGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.38);

      rockSrc.connect(rockFilter);
      rockFilter.connect(rockGain);
      rockGain.connect(outNode);
      rockSrc.start(now);
    }
  }

  /**
   * Dedicated Realistic Driver Door Damage SFX (Smooth, Zero Clipping/Scratching!)
   */
  public playDriverDoorDamageSFX(
    stage: 'scratch' | 'break' | 'detach' = 'scratch'
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const outNode = this.getOutputNode(ctx);
    const gainVal = this.getEffectiveGain(
      stage === 'scratch' ? 0.44 : stage === 'break' ? 0.56 : 0.68
    );
    if (gainVal <= 0) return;

    this.ensurePhysicalCrashBuffers(ctx);
    const now = ctx.currentTime;

    if (stage === 'scratch' && this.crashScrapeBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.crashScrapeBuffer;
      src.playbackRate.setValueAtTime(0.92 + Math.random() * 0.14, now);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.setValueAtTime(0.7, now);
      lp.frequency.setValueAtTime(1150, now);
      lp.frequency.exponentialRampToValueAtTime(340, now + 0.23);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0008, now);
      g.gain.linearRampToValueAtTime(gainVal * 0.6, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0008, now + 0.24);

      src.connect(lp);
      lp.connect(g);
      g.connect(outNode);
      src.start(now);
      return;
    }

    if (this.crashMetalBuffer) {
      const src = ctx.createBufferSource();
      src.buffer = this.crashMetalBuffer;
      src.playbackRate.setValueAtTime(stage === 'detach' ? 0.84 : 0.94, now);

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.Q.setValueAtTime(0.75, now);
      lp.frequency.setValueAtTime(1400, now);
      lp.frequency.exponentialRampToValueAtTime(360, now + 0.4);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0008, now);
      g.gain.linearRampToValueAtTime(gainVal * 0.58, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0008, now + 0.42);

      src.connect(lp);
      lp.connect(g);
      g.connect(outNode);
      src.start(now);
    }

    if (this.crashSubPunchBuffer) {
      const punchSrc = ctx.createBufferSource();
      punchSrc.buffer = this.crashSubPunchBuffer;
      punchSrc.playbackRate.setValueAtTime(0.92, now);
      const punchGain = ctx.createGain();
      punchGain.gain.setValueAtTime(0.0008, now);
      punchGain.gain.linearRampToValueAtTime(gainVal * 0.55, now + 0.006);
      punchGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.21);
      punchSrc.connect(punchGain);
      punchGain.connect(outNode);
      punchSrc.start(now);
    }
  }

  /**
   * Realistic Water Pit Splash SFX ("صوت عبور الحفرة المائية الواقعي")
   */
  public playWaterSplashSFX(intensity: number = 1.0): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const gainVal = this.getEffectiveGain(0.42 * Math.max(0.4, Math.min(1.2, intensity)));
    if (gainVal <= 0) return;

    const now = ctx.currentTime;
    const sr = this.getNormalizedSampleRate(ctx);
    const dur = 0.38;
    const len = Math.floor(sr * dur);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    let prev = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      const white = Math.random() * 2 - 1;
      prev = (prev + 0.1 * white) / 1.1;
      const env = Math.sin((t / dur) * Math.PI) * Math.exp(-t * 2.6);
      data[i] = prev * env * 1.4;
    }
    this.normalizeAudioBuffer(buf, 0.68, false);

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(420, now);
    bp.frequency.exponentialRampToValueAtTime(720, now + 0.15);
    bp.frequency.exponentialRampToValueAtTime(320, now + dur);
    bp.Q.value = 0.9;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0008, now);
    g.gain.linearRampToValueAtTime(gainVal, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0008, now + dur);

    src.connect(bp);
    bp.connect(g);
    g.connect(this.getOutputNode(ctx));
    src.start(now);
  }

  /**
   * Pre-bakes and caches Rain Ambience & Thunderclap buffers ONCE so changing weather is 100% instant and zero-lag!
   */
  private ensureWeatherAudioBuffers(ctx: AudioContext): void {
    const sr = this.getNormalizedSampleRate(ctx);

    if (!this.envNoiseBuffer) {
      const bufLen = Math.floor(sr * 2.0);
      const noiseBuf = ctx.createBuffer(1, bufLen, sr);
      const out = noiseBuf.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufLen; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const pink =
          (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.2;
        out[i] = Math.tanh(pink);
        b6 = white * 0.115926;
      }
      this.envNoiseBuffer = this.normalizeAudioBuffer(noiseBuf, 0.65, true);
    }

    if (!this.thunderCrackBuffer) {
      const crackLen = Math.floor(sr * 0.22);
      const crackBuf = ctx.createBuffer(1, crackLen, sr);
      const crackData = crackBuf.getChannelData(0);
      let lp = 0;
      for (let i = 0; i < crackLen; i++) {
        const t = i / sr;
        const white = Math.random() * 2 - 1;
        lp = 0.85 * lp + 0.15 * white;
        const snapEnv =
          Math.exp(-t * 22) +
          (t > 0.035 ? Math.exp(-(t - 0.035) * 28) * 0.65 : 0);
        crackData[i] = Math.tanh(lp * snapEnv * 1.1);
      }
      this.thunderCrackBuffer = this.normalizeAudioBuffer(crackBuf, 0.7, false);
    }

    if (!this.thunderRumbleBuffer) {
      const rumbleDuration = 2.5;
      const rumbleLen = Math.floor(sr * rumbleDuration);
      const rumbleBuf = ctx.createBuffer(1, rumbleLen, sr);
      const rumbleData = rumbleBuf.getChannelData(0);
      let lp = 0;
      for (let i = 0; i < rumbleLen; i++) {
        const t = i / sr;
        const white = Math.random() * 2 - 1;
        lp = 0.9 * lp + 0.1 * white;
        const primaryBoom = Math.exp(-t * 1.8) * 0.95;
        const valleyEcho1 =
          t > 0.28 ? Math.exp(-(t - 0.28) * 1.45) * 0.65 : 0;
        const valleyEcho2 =
          t > 0.78 ? Math.exp(-(t - 0.78) * 1.1) * 0.45 : 0;
        const mod = 0.72 + 0.28 * Math.sin(t * 9.5);
        rumbleData[i] = Math.tanh(
          lp * (primaryBoom + valleyEcho1 + valleyEcho2) * mod
        );
      }
      this.thunderRumbleBuffer = this.normalizeAudioBuffer(rumbleBuf, 0.74, false);
    }
  }

  /**
   * Realistic Atmospheric Thunderclap & Rolling Rumble (Normalized & Distortion-Free)
   * Exclusively controlled by the "Nature & Environmental SFX" slider!
   */
  public playThunderclap(intensity: number = 1.0): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const outNode = this.getOutputNode(ctx);
    const clamped = Math.max(0.5, Math.min(1.2, intensity));
    const masterGain = this.getNatureEffectiveGain(0.68 * clamped);
    if (masterGain <= 0) return;

    this.ensureWeatherAudioBuffers(ctx);
    const now = ctx.currentTime;

    if (this.thunderCrackBuffer) {
      const crackSrc = ctx.createBufferSource();
      crackSrc.buffer = this.thunderCrackBuffer;
      crackSrc.playbackRate.setValueAtTime(0.94 + Math.random() * 0.12, now);
      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = 'lowpass';
      crackFilter.frequency.setValueAtTime(680, now);
      crackFilter.Q.value = 0.8;
      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.0008, now);
      crackGain.gain.linearRampToValueAtTime(masterGain * 0.55, now + 0.008);
      crackGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.22);
      crackSrc.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(outNode);
      crackSrc.start(now);
    }

    if (this.thunderRumbleBuffer) {
      const rumbleDuration = 2.5;
      const rumbleSrc = ctx.createBufferSource();
      rumbleSrc.buffer = this.thunderRumbleBuffer;
      rumbleSrc.playbackRate.setValueAtTime(0.92 + Math.random() * 0.12, now);
      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.Q.value = 0.9;
      rumbleFilter.frequency.setValueAtTime(260, now);
      rumbleFilter.frequency.exponentialRampToValueAtTime(
        52,
        now + rumbleDuration
      );

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.001, now);
      rumbleGain.gain.linearRampToValueAtTime(masterGain * 0.72, now + 0.05);
      rumbleGain.gain.exponentialRampToValueAtTime(
        0.0008,
        now + rumbleDuration
      );

      rumbleSrc.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(outNode);
      rumbleSrc.start(now);
    }

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(105, now);
    subOsc.frequency.exponentialRampToValueAtTime(42, now + 0.32);
    subOsc.frequency.exponentialRampToValueAtTime(24, now + 2.4);
    subGain.gain.setValueAtTime(0.0008, now);
    subGain.gain.linearRampToValueAtTime(masterGain * 0.65, now + 0.02);
    subGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.45);
    subOsc.connect(subGain);
    subGain.connect(outNode);
    subOsc.start(now);
    subOsc.stop(now + 2.5);
  }

  /**
   * Luxury Cinematic Vehicle Explosion Sound (Clean, Smooth & Distortion-Free)
   */
  public playCarExplosion(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const outNode = this.getOutputNode(ctx);
    const masterGain = this.getEffectiveGain(0.76);
    if (masterGain <= 0) return;

    const now = ctx.currentTime;
    const sr = this.getNormalizedSampleRate(ctx);

    // 1. Primary Seismic Sub-Bass Detonation Core
    const boomOsc = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(135, now);
    boomOsc.frequency.exponentialRampToValueAtTime(32, now + 0.22);
    boomOsc.frequency.exponentialRampToValueAtTime(20, now + 2.15);

    boomGain.gain.setValueAtTime(0.001, now);
    boomGain.gain.linearRampToValueAtTime(masterGain * 0.78, now + 0.018);
    boomGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.2);

    boomOsc.connect(boomGain);
    boomGain.connect(outNode);
    boomOsc.start(now);
    boomOsc.stop(now + 2.25);

    // 2. Secondary Fuel-Tank Sub-Bass Afterblast (+0.18s)
    const fuelOsc = ctx.createOscillator();
    const fuelGain = ctx.createGain();
    fuelOsc.type = 'sine';
    fuelOsc.frequency.setValueAtTime(108, now + 0.18);
    fuelOsc.frequency.exponentialRampToValueAtTime(28, now + 0.52);
    fuelOsc.frequency.exponentialRampToValueAtTime(20, now + 1.95);

    fuelGain.gain.setValueAtTime(0.001, now + 0.18);
    fuelGain.gain.linearRampToValueAtTime(masterGain * 0.65, now + 0.21);
    fuelGain.gain.exponentialRampToValueAtTime(0.0008, now + 2.0);

    fuelOsc.connect(fuelGain);
    fuelGain.connect(outNode);
    fuelOsc.start(now + 0.18);
    fuelOsc.stop(now + 2.05);

    // 3. Smooth Fireball Blast Wave (Low-pass filtered & normalized)
    const blastDuration = 2.2;
    const blastLen = Math.floor(sr * blastDuration);
    const blastBuf = ctx.createBuffer(1, blastLen, sr);
    const blastData = blastBuf.getChannelData(0);
    let lp = 0;
    for (let i = 0; i < blastLen; i++) {
      const t = i / sr;
      const white = Math.random() * 2 - 1;
      lp = 0.88 * lp + 0.12 * white;
      const primaryEnv = Math.exp(-t * 2.2);
      const secondaryBurst =
        t > 0.17 ? Math.exp(-(t - 0.17) * 2.6) * 0.7 : 0;
      const rumbleTail = Math.exp(-t * 0.95) * 0.25;
      blastData[i] = Math.tanh(
        lp * 1.1 * Math.min(1.0, primaryEnv + secondaryBurst + rumbleTail)
      );
    }
    this.normalizeAudioBuffer(blastBuf, 0.72, false);

    const blastSrc = ctx.createBufferSource();
    blastSrc.buffer = blastBuf;

    const blastFilter = ctx.createBiquadFilter();
    blastFilter.type = 'lowpass';
    blastFilter.Q.setValueAtTime(0.85, now);
    blastFilter.frequency.setValueAtTime(860, now);
    blastFilter.frequency.exponentialRampToValueAtTime(260, now + 0.38);
    blastFilter.frequency.exponentialRampToValueAtTime(58, now + blastDuration);

    const blastGain = ctx.createGain();
    blastGain.gain.setValueAtTime(0.0008, now);
    blastGain.gain.linearRampToValueAtTime(masterGain * 0.68, now + 0.015);
    blastGain.gain.exponentialRampToValueAtTime(0.0008, now + blastDuration);

    blastSrc.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(outNode);
    blastSrc.start(now);

    this.ensurePhysicalCrashBuffers(ctx);
    if (this.crashMetalBuffer) {
      const delays = [0.02, 0.16, 0.34];
      delays.forEach((delay, idx) => {
        if (!this.ctx || !this.crashMetalBuffer) return;
        const mSrc = this.ctx.createBufferSource();
        mSrc.buffer = this.crashMetalBuffer;
        mSrc.playbackRate.setValueAtTime(0.78 + idx * 0.1, now + delay);

        const mFilter = this.createBiquadFilterOrNull(ctx, 480 - idx * 70, now + delay);
        const mGain = ctx.createGain();
        mGain.gain.setValueAtTime(0.0008, now + delay);
        mGain.gain.linearRampToValueAtTime(masterGain * 0.42, now + delay + 0.008);
        mGain.gain.exponentialRampToValueAtTime(0.0008, now + delay + 0.36);

        if (mFilter) {
          mSrc.connect(mFilter);
          mFilter.connect(mGain);
        } else {
          mSrc.connect(mGain);
        }
        mGain.connect(outNode);
        mSrc.start(now + delay);
      });
    }
  }

  private createBiquadFilterOrNull(
    ctx: AudioContext,
    freq: number,
    time: number
  ): BiquadFilterNode {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(freq, time);
    return f;
  }

  public playClick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gainVal = this.getEffectiveGain(0.58);
    if (gainVal <= 0) return;

    const outNode = this.getOutputNode(ctx);
    // 1. Crisp High-Clarity UI Click Tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

    gain.gain.setValueAtTime(gainVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(outNode);
    osc.start(now);
    osc.stop(now + 0.07);

    // 2. Warm Tactile Bass Thump Layer for Powerful UI Response
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(180, now);
    bassOsc.frequency.exponentialRampToValueAtTime(68, now + 0.055);
    bassGain.gain.setValueAtTime(gainVal * 0.72, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    bassOsc.connect(bassGain);
    bassGain.connect(outNode);
    bassOsc.start(now);
    bassOsc.stop(now + 0.065);
  }

  /**
   * Soft, Quiet, Gentle & Pleasant Coin Pickup SFX:
   * - Exclusively controlled by the "Nature & Environmental SFX" slider.
   * - Uses a mellow, warm low-register sine wave with a soft envelope and low-pass filter
   *   so it never sounds harsh or distracting when collected.
   */
  public playCoin(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const gainVal = this.getNatureEffectiveGain(0.11);
    if (gainVal <= 0) return;

    const now = ctx.currentTime;
    // Debounce rapid coin clusters so consecutive pickups stay soft and gentle
    if (now - this.lastCoinTime < 0.065) return;
    this.lastCoinTime = now;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Soft, gentle, pleasant warm sine wave (E4 -> A4)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(329.63, now);
    osc.frequency.exponentialRampToValueAtTime(440.0, now + 0.065);

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(0.5, now);
    filter.frequency.setValueAtTime(460, now);

    // Gentle attack & velvety release so it is quiet, soft, and soothing
    gain.gain.setValueAtTime(0.0003, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0003, now + 0.115);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Muted, Smooth & Low-Pitched Fuel Pickup SFX ("صوت وقود هادئ وناعم بنبرة منخفضة")
   */
  public playFuel(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gainVal = this.getEffectiveGain(0.38);
    if (gainVal <= 0) return;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Soft, warm low-register sine glide (A3 -> E4) with zero harsh harmonics
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220.0, now);
    osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.16);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(520, now);

    gain.gain.setValueAtTime(0.0005, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.19);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getOutputNode(ctx));
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playUnlock(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const gainVal = this.getEffectiveGain(0.68);
    if (gainVal <= 0) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.065);

      gain.gain.setValueAtTime(gainVal, now + i * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.065 + 0.25);

      osc.connect(gain);
      gain.connect(this.getOutputNode(ctx));
      osc.start(now + i * 0.065);
      osc.stop(now + i * 0.065 + 0.26);
    });
  }

  /**
   * 100% Clean, Non-Tonal Broadband Acoustic Engine & Exhaust Sound:
   * - Exclusively controlled by the "Engine & Vehicle SFX" slider (sfxVolume).
   * - Completely eliminates repetitive background oscillator tones ("nn nn nn") during intro cutscene and active gameplay.
   */
  public updateEngineSound(
    speedRatio: number,
    throttle: boolean,
    braking: boolean,
    boost: boolean,
    car: CarConfig,
    isFlying: boolean = false,
    exhaustSoundLevel: number = 0
  ): void {
    if (this.settings.muted || this.getEngineEffectiveGain(1) <= 0) {
      this.stopEngineSound();
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;

    const normalizedTimbre =
      car.engineTimbre === 'v6_offroad'
        ? 'v8_4x4'
        : car.engineTimbre === 'v8_baja'
        ? 'diesel_truck'
        : car.engineTimbre === 'turbo_rally'
        ? 'v6_sports'
        : car.engineTimbre;

    if (
      !this.sampleNode ||
      !this.primaryOsc ||
      !this.subOsc ||
      !this.primaryOscGain ||
      !this.subOscGain ||
      !this.filterNode ||
      !this.formantNode ||
      !this.driveShaper ||
      !this.engineGain ||
      !this.sampleGain ||
      this.currentTimbre !== normalizedTimbre
    ) {
      this.stopEngineSound();
      this.currentTimbre = normalizedTimbre;

      // 1. Looping Multi-Cylinder Combustion & Muffler Rumble Sample Buffer
      this.sampleNode = ctx.createBufferSource();
      this.sampleNode.buffer = this.getOrCreateEngineSampleBuffer(
        ctx,
        normalizedTimbre
      );
      this.sampleNode.loop = true;

      // 2. Real-Time Continuous Engine Synthesizer Oscillators (Deep Sub-Bass Torque + Cylinder Harmonic Body)
      this.primaryOsc = ctx.createOscillator();
      this.subOsc = ctx.createOscillator();
      this.primaryOscGain = ctx.createGain();
      this.subOscGain = ctx.createGain();

      this.primaryOsc.type =
        normalizedTimbre === 'v6_sports' ? 'sawtooth' : 'triangle';
      this.subOsc.type = 'sine';

      this.primaryOsc.frequency.value = 62;
      this.subOsc.frequency.value = 42;
      this.primaryOscGain.gain.value = 0.24;
      this.subOscGain.gain.value = 0.34;

      this.filterNode = ctx.createBiquadFilter();
      this.formantNode = ctx.createBiquadFilter();
      this.driveShaper = ctx.createWaveShaper();
      this.engineGain = ctx.createGain();
      this.sampleGain = ctx.createGain();

      this.formantNode.type = 'lowshelf';
      this.filterNode.type = 'lowpass';

      if (normalizedTimbre === 'v8_4x4') {
        this.formantNode.frequency.value = 115;
        this.formantNode.gain.value = 5.4;
        this.filterNode.Q.value = 0.78;
        this.driveShaper.curve = this.createDistortionCurve(0.22);
      } else if (normalizedTimbre === 'diesel_truck') {
        this.formantNode.frequency.value = 102;
        this.formantNode.gain.value = 5.8;
        this.filterNode.Q.value = 0.75;
        this.driveShaper.curve = this.createDistortionCurve(0.24);
      } else if (normalizedTimbre === 'v6_sports') {
        this.formantNode.frequency.value = 128;
        this.formantNode.gain.value = 4.8;
        this.filterNode.Q.value = 0.82;
        this.driveShaper.curve = this.createDistortionCurve(0.2);
      } else {
        this.formantNode.frequency.value = 118;
        this.formantNode.gain.value = 5.2;
        this.filterNode.Q.value = 0.78;
        this.driveShaper.curve = this.createDistortionCurve(0.22);
      }

      this.filterNode.frequency.value = 420;
      this.sampleGain.gain.value = 0.94;
      this.engineGain.gain.value = Math.max(
        0.0001,
        this.getEngineEffectiveGain(0.52)
      );

      const outNode = this.getOutputNode(ctx);

      // Connect Multi-Cylinder Sample + Synth Oscillators -> Low-Shelf Bass Boost -> Soft Drive Shaper -> Butterworth Lowpass -> Master Engine Gain
      this.sampleNode.connect(this.sampleGain);
      this.sampleGain.connect(this.formantNode);

      this.primaryOsc.connect(this.primaryOscGain);
      this.primaryOscGain.connect(this.formantNode);

      this.subOsc.connect(this.subOscGain);
      this.subOscGain.connect(this.formantNode);

      this.formantNode.connect(this.driveShaper);
      this.driveShaper.connect(this.filterNode);
      this.filterNode.connect(this.engineGain);
      this.engineGain.connect(outNode);

      // 3. Dedicated Jet Turbine Afterburner Airflow Layer during Flight Mode
      if (!this.jetNoiseBuffer) {
        const sr = this.getNormalizedSampleRate(ctx);
        const jLen = Math.floor(sr * 2.0);
        const jBuf = ctx.createBuffer(1, jLen, sr);
        const jData = jBuf.getChannelData(0);
        let b0 = 0;
        let b1 = 0;
        let b2 = 0;
        for (let i = 0; i < jLen; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.06;
          b1 = 0.96 * b1 + white * 0.11;
          b2 = 0.85 * b2 + white * 0.16;
          jData[i] = Math.tanh((b0 + b1 * 0.65 + b2 * 0.3) * 0.9);
        }
        this.jetNoiseBuffer = this.normalizeAudioBuffer(jBuf, 0.68, true);
      }

      this.jetNoiseNode = ctx.createBufferSource();
      this.jetNoiseNode.buffer = this.jetNoiseBuffer;
      this.jetNoiseNode.loop = true;

      this.jetFilterNode = ctx.createBiquadFilter();
      this.jetFilterNode.type = 'lowpass';
      this.jetFilterNode.Q.value = 0.65;
      this.jetFilterNode.frequency.value = 260;

      this.jetGain = ctx.createGain();
      this.jetGain.gain.value = 0.0001;

      this.jetNoiseNode.connect(this.jetFilterNode);
      this.jetFilterNode.connect(this.jetGain);
      this.jetGain.connect(outNode);

      this.sampleNode.start();
      this.primaryOsc.start();
      this.subOsc.start();
      this.jetNoiseNode.start();
    }

    const absSpeed = Math.min(2.4, Math.abs(speedRatio));
    const isReversing = braking && speedRatio < -0.015;
    const isActivePedal = throttle || boost || braking;
    const now = ctx.currentTime;

    // Organic idle breathing + smooth monotonic RPM response
    const idleBreath =
      !isActivePedal && absSpeed < 0.08
        ? Math.sin(now * 3.1) * 0.035 + Math.cos(now * 5.3) * 0.018
        : 0;
    const rawTargetRpmRatio = Math.min(
      2.3,
      0.32 +
        idleBreath +
        absSpeed * 0.76 +
        (throttle ? 0.45 : isReversing ? 0.3 : 0) +
        (boost ? 0.62 : 0)
    );
    this.smoothedRpmRatio += (rawTargetRpmRatio - this.smoothedRpmRatio) * 0.15;
    const rpm = this.smoothedRpmRatio;

    // 1. Full-Bodied Audible Sample Playback Rate + Synthesizer Frequencies
    const baseSampleRate =
      normalizedTimbre === 'diesel_truck'
        ? 0.84 + rpm * 0.68
        : normalizedTimbre === 'v8_4x4'
        ? 0.92 + rpm * 0.76
        : normalizedTimbre === 'v6_sports'
        ? 1.04 + rpm * 0.88
        : 0.98 + rpm * 0.82;

    const targetPrimaryFreq =
      normalizedTimbre === 'diesel_truck'
        ? 48 + rpm * 52
        : normalizedTimbre === 'v8_4x4'
        ? 56 + rpm * 64
        : normalizedTimbre === 'v6_sports'
        ? 68 + rpm * 82
        : 62 + rpm * 74;

    const targetSubFreq = targetPrimaryFreq * 0.66;

    const exhaustUpgradeRatio = Math.max(0, Math.min(1, exhaustSoundLevel / 100));

    // 2. Articulate Low-Pass Filter Cutoff (Preserves deep bass + rich cylinder growl across all speakers)
    const targetFilterFreq =
      (normalizedTimbre === 'diesel_truck'
        ? 340 + rpm * 380 + (throttle ? 160 : 0) + (boost ? 240 : 0)
        : normalizedTimbre === 'v6_sports'
        ? 440 + rpm * 520 + (throttle ? 220 : 0) + (boost ? 320 : 0)
        : 390 + rpm * 450 + (throttle ? 190 : 0) + (boost ? 280 : 0)) +
      exhaustUpgradeRatio * 220;

    // 3. Exclusively controlled by the "Engine & Vehicle SFX" slider!
    // Strong, unmistakable engine presence from Intro/Main Menu idle (0.52) to full throttle/boost (0.82 - 0.88)
    const rawEngineLevel = Math.min(
      0.95,
      (isFlying
        ? boost
          ? 0.78
          : throttle
          ? 0.68
          : 0.46
        : boost
        ? 0.88
        : throttle
        ? 0.8
        : isReversing
        ? 0.66
        : braking
        ? 0.58
        : Math.max(0.52, Math.min(0.68, 0.52 + absSpeed * 0.22))) *
        (1 + exhaustUpgradeRatio * 0.14)
    );

    const targetEngineGain =
      rawEngineLevel <= 0.001
        ? 0.0001
        : Math.max(0.0001, this.getEngineEffectiveGain(rawEngineLevel));

    this.sampleNode.playbackRate.setTargetAtTime(baseSampleRate, now, 0.055);
    this.primaryOsc.frequency.setTargetAtTime(targetPrimaryFreq, now, 0.06);
    this.subOsc.frequency.setTargetAtTime(targetSubFreq, now, 0.06);
    this.filterNode.frequency.setTargetAtTime(targetFilterFreq, now, 0.065);
    this.engineGain.gain.setTargetAtTime(targetEngineGain, now, 0.065);

    // 4. Jet Thruster Afterburner Sound during Flight (Also controlled by Engine & Vehicle SFX slider)
    if (this.jetGain && this.jetFilterNode) {
      if (isFlying && (throttle || boost)) {
        const targetJetGain = Math.max(
          0.0001,
          this.getEngineEffectiveGain(boost ? 0.72 : 0.6)
        );
        const targetJetCutoff = boost ? 460 : 360;
        this.jetGain.gain.setTargetAtTime(targetJetGain, now, 0.06);
        this.jetFilterNode.frequency.setTargetAtTime(targetJetCutoff, now, 0.07);
      } else {
        this.jetGain.gain.setTargetAtTime(0.0001, now, 0.06);
      }
    }
  }

  /**
   * Progressive Vehicle Damage Sound: Smooth Physical Metal & Glass Impact (Zero Clipping!)
   */
  public playPartBreakOrGlassShatter(isGlassShatter: boolean = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const outNode = this.getOutputNode(ctx);
    const gainVal = this.getEffectiveGain(isGlassShatter ? 0.56 : 0.64);
    if (gainVal <= 0) return;

    this.ensurePhysicalCrashBuffers(ctx);
    const now = ctx.currentTime;

    const primaryBuf = isGlassShatter
      ? this.crashRockBuffer
      : this.crashMetalBuffer;
    if (primaryBuf) {
      const src = ctx.createBufferSource();
      src.buffer = primaryBuf;
      src.playbackRate.setValueAtTime(isGlassShatter ? 1.15 : 0.88, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(0.75, now);
      filter.frequency.setValueAtTime(isGlassShatter ? 1650 : 1350, now);
      filter.frequency.exponentialRampToValueAtTime(360, now + 0.38);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0008, now);
      g.gain.linearRampToValueAtTime(gainVal * 0.58, now + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0008, now + 0.4);

      src.connect(filter);
      filter.connect(g);
      g.connect(outNode);
      src.start(now);
    }

    if (this.crashSubPunchBuffer) {
      const punchSrc = ctx.createBufferSource();
      punchSrc.buffer = this.crashSubPunchBuffer;
      punchSrc.playbackRate.setValueAtTime(0.9, now);
      const punchGain = ctx.createGain();
      punchGain.gain.setValueAtTime(0.0008, now);
      punchGain.gain.linearRampToValueAtTime(gainVal * 0.52, now + 0.006);
      punchGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.21);
      punchSrc.connect(punchGain);
      punchGain.connect(outNode);
      punchSrc.start(now);
    }
  }

  /**
   * Natural Valley Breeze & Rain Ambient Sound (Zero whistle / zero tone!):
   * Exclusively controlled by the "Nature & Environmental SFX" slider (natureVolume).
   * Remains active on the Main Menu and during gameplay (gentle valley air in clear weather, rich rain in storms).
   */
  public updateEnvironmentAmbience(
    _nightFactor: number,
    rainIntensity: number
  ): void {
    if (this.settings.muted || this.getNatureEffectiveGain(1) <= 0) {
      this.stopEnvironmentAmbience();
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;
    this.ensureWeatherAudioBuffers(ctx);
    if (!this.envNoiseBuffer) return;

    if (!this.envNoiseNode || !this.rainFilter || !this.rainGain) {
      this.stopEnvironmentAmbience();
      this.envNoiseNode = ctx.createBufferSource();
      this.envNoiseNode.buffer = this.envNoiseBuffer;
      this.envNoiseNode.loop = true;

      this.rainFilter = ctx.createBiquadFilter();
      this.rainFilter.type = 'lowpass';
      this.rainFilter.Q.value = 0.62;
      this.rainFilter.frequency.value = 340;

      this.rainGain = ctx.createGain();
      this.rainGain.gain.value = 0.0001;

      this.envNoiseNode.connect(this.rainFilter);
      this.rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.getOutputNode(ctx));
      this.envNoiseNode.start();
    }

    const baseAmbience =
      rainIntensity > 0.05
        ? Math.min(0.32, 0.08 + rainIntensity * 0.28)
        : 0.065;
    const targetCutoff = rainIntensity > 0.05 ? 480 : 320;
    const targetRainGain = this.getNatureEffectiveGain(baseAmbience);
    this.rainFilter.frequency.setTargetAtTime(
      targetCutoff,
      ctx.currentTime,
      0.15
    );
    this.rainGain.gain.setTargetAtTime(targetRainGain, ctx.currentTime, 0.12);
  }

  public stopEnvironmentAmbience(): void {
    if (this.envNoiseNode) {
      try {
        this.envNoiseNode.stop();
        this.envNoiseNode.disconnect();
      } catch {
        // ignore
      }
      this.envNoiseNode = null;
    }

    [this.rainFilter, this.rainGain].forEach((node) => {
      if (node) {
        try {
          node.disconnect();
        } catch {
          // ignore
        }
      }
    });
    this.rainFilter = null;
    this.rainGain = null;
  }

  public stopEngineSound(): void {
    if (this.sampleNode) {
      try {
        this.sampleNode.stop();
        this.sampleNode.disconnect();
      } catch {
        // ignore
      }
      this.sampleNode = null;
    }

    const nodes = [this.primaryOsc, this.subOsc, this.jetSubOsc];
    nodes.forEach((osc) => {
      if (osc) {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      }
    });
    this.primaryOsc = null;
    this.subOsc = null;
    this.jetSubOsc = null;

    if (this.jetNoiseNode) {
      try {
        this.jetNoiseNode.stop();
        this.jetNoiseNode.disconnect();
      } catch {
        // ignore
      }
      this.jetNoiseNode = null;
    }

    [
      this.primaryOscGain,
      this.subOscGain,
      this.filterNode,
      this.formantNode,
      this.driveShaper,
      this.sampleGain,
      this.engineGain,
      this.jetFilterNode,
      this.jetSubGain,
      this.jetGain,
    ].forEach((node) => {
      if (node) {
        try {
          node.disconnect();
        } catch {
          // ignore
        }
      }
    });
    this.primaryOscGain = null;
    this.subOscGain = null;
    this.filterNode = null;
    this.formantNode = null;
    this.driveShaper = null;
    this.sampleGain = null;
    this.engineGain = null;
    this.jetFilterNode = null;
    this.jetSubGain = null;
    this.jetGain = null;
  }
}

export const soundEngine = new SoundEngine();
