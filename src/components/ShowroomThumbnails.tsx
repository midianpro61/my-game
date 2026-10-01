import React, { useEffect, useRef } from 'react';
import {
  CarConfig,
  MAPS_CATALOG,
  MapConfig,
  getDualNeonInfo,
  getStarryGalaxyInfo,
} from '../types/game';
import {
  createInitialPhysicsState,
  renderVehicle3D,
} from '../utils/physicsAndRender';

export const CarThumbnailCanvas: React.FC<{ car: CarConfig }> = ({ car }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render at Ultra-HD 2.5x Retina DPI so thumbnails are razor-sharp with zero blurriness
    const dpr = Math.min(3, Math.max(2.25, window.devicePixelRatio || 2.25));
    const w = 340;
    const h = 152;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const dummyState = createInitialPhysicsState(car, MAPS_CATALOG[0], {
      engine: 0,
      armor: 0,
      exhaustSound: 0,
      suspension: 0,
      tires: 0,
      fuel: 0,
    });
    dummyState.x = w * 0.52;
    dummyState.y = h * 0.57;
    dummyState.angle = -0.04;
    dummyState.wheelRotation = 0.45;
    dummyState.backfireFlash = 0.75;
    dummyState.headlightsOn = true;

    let animFrameId = 0;
    const dualNeon = getDualNeonInfo(car.bodyColor);
    const starryGalaxy = getStarryGalaxyInfo(car.bodyColor);
    const isAnimatedPaint = Boolean(dualNeon || starryGalaxy);

    const renderFrame = () => {
      const nowSec = performance.now() * 0.001;
      const pulse = 0.5 + 0.5 * Math.sin(nowSec * 5.2);
      const blink = Math.sin(nowSec * 12.0) > -0.18 ? 1.0 : 0.45;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // 1. Luxury Studio Showroom Radial Backdrop + Subtle Accent Aura
      const bgGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.36,
        10,
        w * 0.5,
        h * 0.5,
        w * 0.72
      );
      bgGrad.addColorStop(0, '#1E293B');
      bgGrad.addColorStop(0.55, '#0F172A');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Overhead Studio Softbox Light Bars
      ctx.save();
      ctx.fillStyle = 'rgba(248, 250, 252, 0.09)';
      ctx.beginPath();
      ctx.roundRect(w * 0.22, 8, w * 0.56, 5, 2.5);
      ctx.fill();
      ctx.fillStyle = dualNeon
        ? blink > 0.7
          ? dualNeon.colorB
          : dualNeon.colorA
        : starryGalaxy
        ? starryGalaxy.nebulaColor
        : car.accentColor;
      ctx.globalAlpha = isAnimatedPaint ? 0.32 + pulse * 0.35 : 0.22;
      ctx.beginPath();
      ctx.roundRect(w * 0.3, 15, w * 0.4, 2.5, 1);
      ctx.fill();
      ctx.restore();

      // 2. Showroom Wet Asphalt Podium Disc with Soft Blur Cast Shadow & Wet Reflections
      ctx.save();
      const roadDiscGrad = ctx.createLinearGradient(0, h * 0.68, 0, h * 0.95);
      roadDiscGrad.addColorStop(0, '#334155');
      roadDiscGrad.addColorStop(0.45, '#0F172A');
      roadDiscGrad.addColorStop(1, '#1E293B');
      ctx.fillStyle = roadDiscGrad;
      if (dualNeon) {
        const podiumGrad = ctx.createLinearGradient(w * 0.08, 0, w * 0.92, 0);
        podiumGrad.addColorStop(0, dualNeon.colorA);
        podiumGrad.addColorStop(0.5, dualNeon.midColor);
        podiumGrad.addColorStop(1, dualNeon.colorB);
        ctx.strokeStyle = podiumGrad;
        ctx.lineWidth = 2.4 + pulse * 1.2;
      } else if (starryGalaxy) {
        const podiumGrad = ctx.createLinearGradient(w * 0.08, 0, w * 0.92, 0);
        podiumGrad.addColorStop(0, starryGalaxy.baseColor);
        podiumGrad.addColorStop(0.5, starryGalaxy.nebulaColor);
        podiumGrad.addColorStop(1, starryGalaxy.starColor);
        ctx.strokeStyle = podiumGrad;
        ctx.lineWidth = 2.2 + pulse * 0.9;
      } else {
        ctx.strokeStyle = car.accentColor;
        ctx.lineWidth = 2;
      }
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.82, w * 0.43, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Wet water sheen & wheel reflection on showroom podium
      ctx.fillStyle = 'rgba(186, 230, 253, 0.26)';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.82, w * 0.34, 4.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      if (dualNeon) {
        ctx.fillStyle = dualNeon.colorA;
        ctx.globalAlpha = (0.38 + pulse * 0.38) * blink;
        ctx.beginPath();
        ctx.ellipse(w * 0.38, h * 0.84, 21, 5.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = dualNeon.colorB;
        ctx.beginPath();
        ctx.ellipse(w * 0.65, h * 0.84, 21, 5.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (starryGalaxy) {
        ctx.fillStyle = starryGalaxy.nebulaColor;
        ctx.globalAlpha = 0.36 + pulse * 0.28;
        ctx.beginPath();
        ctx.ellipse(w * 0.38, h * 0.84, 19, 5.2, 0, 0, Math.PI * 2);
        ctx.ellipse(w * 0.65, h * 0.84, 19, 5.2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = car.accentColor;
        ctx.globalAlpha = 0.34;
        ctx.beginPath();
        ctx.ellipse(w * 0.38, h * 0.84, 17, 4.8, 0, 0, Math.PI * 2);
        ctx.ellipse(w * 0.65, h * 0.84, 17, 4.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Soft Blur Cast Shadow directly beneath the Vehicle Chassis & Tires (matching Official Logo Shadow!)
      ctx.save();
      ctx.shadowColor = 'rgba(2, 6, 23, 0.95)';
      ctx.shadowBlur = 16;
      const castGrad = ctx.createRadialGradient(
        w * 0.52,
        h * 0.79,
        4,
        w * 0.52,
        h * 0.79,
        w * 0.28
      );
      castGrad.addColorStop(0, 'rgba(2, 6, 23, 0.96)');
      castGrad.addColorStop(0.62, 'rgba(2, 6, 23, 0.74)');
      castGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = castGrad;
      ctx.beginPath();
      ctx.ellipse(w * 0.52, h * 0.79, w * 0.27, 9.5, -0.02, 0, Math.PI * 2);
      ctx.fill();
      // Tire contact cast shadows
      ctx.fillStyle = 'rgba(2, 6, 23, 0.92)';
      ctx.beginPath();
      ctx.ellipse(w * 0.39, h * 0.79, 20, 5.5, 0, 0, Math.PI * 2);
      ctx.ellipse(w * 0.65, h * 0.78, 20, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();

      if (isAnimatedPaint) {
        dummyState.wheelRotation = 0.45 + nowSec * 1.4;
      }

      ctx.save();
      ctx.translate(w * 0.52, h * 0.57);
      ctx.scale(0.95, 0.95);
      ctx.translate(-w * 0.52, -h * 0.57);
      renderVehicle3D(ctx, dummyState, car, 'Ultra', true, 12, false);
      ctx.restore();

      if (isAnimatedPaint) {
        animFrameId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
    return () => {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
      }
    };
  }, [car, car.bodyColor, car.secondaryColor, car.accentColor]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700/80 shadow-[0_0_18px_rgba(15,23,42,0.9)] group">
      <canvas
        ref={canvasRef}
        className="w-full h-32 object-cover block"
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
    </div>
  );
};

export const MapThumbnailCanvas: React.FC<{ map: MapConfig }> = ({ map }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render at Ultra-HD 2.5x Retina DPI for crystal-clear 2K map card previews
    const dpr = Math.min(3, Math.max(2.25, window.devicePixelRatio || 2.25));
    const w = 340;
    const h = 144;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. Daytime or Volcanic-Neon Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, map.skyTop);
    skyGrad.addColorStop(0.55, map.skyMid);
    skyGrad.addColorStop(1, map.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Bright Morning Sun or Volcanic-Synthwave Disc
    ctx.save();
    if (map.isNeon) {
      const neonGlow = ctx.createRadialGradient(
        w * 0.78,
        h * 0.3,
        6,
        w * 0.78,
        h * 0.3,
        40
      );
      neonGlow.addColorStop(0, '#FEF08A');
      neonGlow.addColorStop(0.45, '#F97316');
      neonGlow.addColorStop(1, 'rgba(255, 0, 127, 0)');
      ctx.fillStyle = neonGlow;
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.3, 40, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const sunGlow = ctx.createRadialGradient(
        w * 0.8,
        h * 0.25,
        4,
        w * 0.8,
        h * 0.25,
        44
      );
      sunGlow.addColorStop(0, '#FFFFFF');
      sunGlow.addColorStop(0.35, 'rgba(254, 240, 138, 0.95)');
      sunGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(w * 0.8, h * 0.25, 44, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Fluffy Daytime Clouds
    ctx.fillStyle = map.isNeon
      ? 'rgba(249, 115, 22, 0.22)'
      : 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.arc(65, 26, 13, 0, Math.PI * 2);
    ctx.arc(82, 22, 17, 0, Math.PI * 2);
    ctx.arc(100, 27, 12, 0, Math.PI * 2);
    ctx.arc(175, 34, 11, 0, Math.PI * 2);
    ctx.arc(190, 30, 14, 0, Math.PI * 2);
    ctx.fill();

    // 4. Distant Mountain Silhouettes & Snow/Volcanic Peaks
    ctx.fillStyle =
      map.environmentType === 'snow'
        ? 'rgba(186, 230, 253, 0.78)'
        : map.environmentType === 'desert'
        ? 'rgba(217, 119, 6, 0.42)'
        : map.isNeon
        ? 'rgba(24, 6, 28, 0.92)'
        : 'rgba(22, 163, 74, 0.58)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.62);
    ctx.lineTo(w * 0.28, h * 0.34);
    ctx.lineTo(w * 0.55, h * 0.58);
    ctx.lineTo(w * 0.82, h * 0.32);
    ctx.lineTo(w, h * 0.55);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Volcanic lava vein on mountain peak for Neon/Volcanic map
    if (map.isNeon) {
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.28, h * 0.34);
      ctx.lineTo(w * 0.31, h * 0.48);
      ctx.moveTo(w * 0.82, h * 0.32);
      ctx.lineTo(w * 0.79, h * 0.49);
      ctx.stroke();
    }

    // 5. Polished Metal Guardrail Posts, W-Beam & Reflector Cat-Eyes along the Road Edge (No Trees — Scenic Mountains Unobstructed)
    ctx.fillStyle = '#475569';
    for (let gx = 18; gx < w; gx += 36) {
      const gy = h * 0.72 - Math.sin(gx * 0.025) * 12 - Math.cos(gx * 0.05) * 4;
      ctx.fillRect(gx - 2.2, gy - 15, 4.4, 16);
    }
    ctx.strokeStyle = map.isNeon ? '#334155' : '#CBD5E1';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.72 - Math.sin(x * 0.025) * 12 - Math.cos(x * 0.05) * 4 - 8.5;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.strokeStyle = map.isNeon ? '#00F0FF' : '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Guardrail reflector studs
    for (let gx = 18; gx < w; gx += 36) {
      const gy = h * 0.72 - Math.sin(gx * 0.025) * 12 - Math.cos(gx * 0.05) * 4 - 8.5;
      ctx.fillStyle = (gx / 36) % 2 === 0 ? '#EF4444' : '#F59E0B';
      ctx.fillRect(gx - 1.5, gy - 1.5, 3, 3);
    }

    // 7. Foreground 2K Asphalt Road with Natural Cracks, Dashed Lane Line & Wet Reflections
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.72 - Math.sin(x * 0.025) * 12 - Math.cos(x * 0.05) * 4;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    const asphaltGrad = ctx.createLinearGradient(0, h * 0.62, 0, h);
    asphaltGrad.addColorStop(0, '#334155');
    asphaltGrad.addColorStop(0.35, '#1E293B');
    asphaltGrad.addColorStop(0.75, '#0F172A');
    asphaltGrad.addColorStop(1, map.groundFill);
    ctx.fillStyle = asphaltGrad;
    ctx.fill();

    // Dashed highway lane line
    ctx.save();
    ctx.setLineDash([14, 12]);
    ctx.strokeStyle = map.isNeon
      ? 'rgba(0, 240, 255, 0.65)'
      : 'rgba(251, 191, 36, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.72 - Math.sin(x * 0.025) * 12 - Math.cos(x * 0.05) * 4 + 13;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // Natural asphalt stress cracks on the road preview
    ctx.strokeStyle = map.isNeon
      ? 'rgba(249, 115, 22, 0.85)'
      : 'rgba(2, 6, 23, 0.75)';
    ctx.lineWidth = 1.2;
    for (let cx = 36; cx < w - 20; cx += 58) {
      const cy = h * 0.72 - Math.sin(cx * 0.025) * 12 - Math.cos(cx * 0.05) * 4 + 11;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 1);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx + 8, cy - 1);
      ctx.stroke();
    }

    // Wet water reflection sheen on asphalt
    ctx.strokeStyle = map.isNeon
      ? 'rgba(249, 115, 22, 0.42)'
      : 'rgba(186, 230, 253, 0.38)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.72 - Math.sin(x * 0.025) * 12 - Math.cos(x * 0.05) * 4 + 7;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = map.groundTop;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.72 - Math.sin(x * 0.025) * 12 - Math.cos(x * 0.05) * 4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [map]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700/80 shadow-[0_0_18px_rgba(15,23,42,0.9)] group">
      <canvas
        ref={canvasRef}
        className="w-full h-32 object-cover block"
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
    </div>
  );
};
