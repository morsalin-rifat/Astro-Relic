import React, { useEffect, useRef } from 'react';

interface StarfieldProps {
  isWarping?: boolean;
  onWarpComplete?: () => void;
}

interface Star {
  x: number;
  y: number;
  z: number;
  radius: number;
  baseAlpha: number;
  currentAlpha: number;
  vx: number;
  vy: number;
  color: string;
}

export default function InteractiveStarfield({ isWarping = false, onWarpComplete }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 140,
      active: false,
    };

    const colors = ['#FFFFFF', '#00F5D4', '#FFB703', '#90E0EF', '#F72585'];

    const numStars = Math.min(320, Math.floor((width * height) / 4000));
    const stars: Star[] = [];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1000 + 1,
        radius: Math.random() * 1.6 + 0.6,
        baseAlpha: Math.random() * 0.5 + 0.2,
        currentAlpha: 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.active = true;
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.active = true;
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let warpSpeed = 1;
    let warpTimer = 0;

    const render = () => {
      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      if (isWarping) {
        warpSpeed = Math.min(warpSpeed * 1.08 + 1.2, 55);
        warpTimer++;
        if (warpTimer > 75 && onWarpComplete) {
          onWarpComplete();
        }
      } else {
        warpSpeed = 1;
        warpTimer = 0;
      }

      // Background with subtle trail in warp mode
      if (isWarping) {
        ctx.fillStyle = 'rgba(7, 11, 25, 0.28)';
      } else {
        ctx.fillStyle = '#070B19';
      }
      ctx.fillRect(0, 0, width, height);

      // Nearby stars storage for constellation connections
      const nearbyStars: { x: number; y: number; alpha: number }[] = [];

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (isWarping) {
          // Hyperdrive streaks radiating outward from center
          const dx = star.x - width / 2;
          const dy = star.y - height / 2;
          const distFromCenter = Math.hypot(dx, dy) || 1;
          const nx = dx / distFromCenter;
          const ny = dy / distFromCenter;

          const oldX = star.x;
          const oldY = star.y;

          star.x += nx * warpSpeed * (distFromCenter * 0.02 + 0.5);
          star.y += ny * warpSpeed * (distFromCenter * 0.02 + 0.5);

          ctx.beginPath();
          ctx.moveTo(oldX, oldY);
          ctx.lineTo(star.x, star.y);
          ctx.strokeStyle = `rgba(0, 245, 212, ${Math.min(0.9, star.baseAlpha * 1.8)})`;
          ctx.lineWidth = star.radius * (1 + warpSpeed * 0.08);
          ctx.stroke();

          // Reset if out of screen
          if (star.x < 0 || star.x > width || star.y < 0 || star.y > height) {
            star.x = width / 2 + (Math.random() - 0.5) * 80;
            star.y = height / 2 + (Math.random() - 0.5) * 80;
          }
        } else {
          // Regular gentle drifting
          star.x += star.vx;
          star.y += star.vy;

          if (star.x < 0) star.x = width;
          if (star.x > width) star.x = 0;
          if (star.y < 0) star.y = height;
          if (star.y > height) star.y = 0;

          // Proximity light calculation
          let factor = 0;
          if (mouse.active) {
            const dx = mouse.x - star.x;
            const dy = mouse.y - star.y;
            const dist = Math.hypot(dx, dy);

            if (dist < mouse.radius) {
              factor = 1 - dist / mouse.radius;
              star.currentAlpha = Math.min(1, star.baseAlpha + factor * 0.85);
              nearbyStars.push({ x: star.x, y: star.y, alpha: factor });
            } else {
              star.currentAlpha += (star.baseAlpha - star.currentAlpha) * 0.08;
            }
          } else {
            star.currentAlpha += (star.baseAlpha - star.currentAlpha) * 0.05;
          }

          // Draw individual star
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * (1 + factor * 0.9), 0, Math.PI * 2);

          if (factor > 0) {
            ctx.shadowBlur = 12 * factor;
            ctx.shadowColor = '#00F5D4';
            ctx.fillStyle = star.color;
          } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(255, 255, 255, ${star.currentAlpha})`;
          }
          ctx.fill();
        }
      }

      // Constellation lines between stars illuminated by cursor (Bare Creative feel!)
      if (!isWarping && nearbyStars.length > 1) {
        ctx.beginPath();
        for (let i = 0; i < nearbyStars.length; i++) {
          for (let j = i + 1; j < nearbyStars.length; j++) {
            const s1 = nearbyStars[i];
            const s2 = nearbyStars[j];
            const d = Math.hypot(s1.x - s2.x, s1.y - s2.y);
            if (d < 90) {
              const lineAlpha = (1 - d / 90) * Math.min(s1.alpha, s2.alpha) * 0.55;
              ctx.strokeStyle = `rgba(0, 245, 212, ${lineAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
            }
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [isWarping, onWarpComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-auto z-0"
      style={{ touchAction: 'none' }}
    />
  );
}
