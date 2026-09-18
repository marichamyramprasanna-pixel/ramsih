import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  pulseSpeed: number;
}

export const CyberBackgroundCanvas: React.FC<{ reducedMotion?: boolean }> = ({ reducedMotion = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Track mouse position for interactive particle connections & ripples
    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Generate constellation particles
    const particleCount = Math.min(Math.floor((width * height) / 16000), 90);
    const colors = ['#06b6d4', '#3b82f6', '#10b981', '#6366f1', '#38bdf8'];

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2.2 + 1,
      alpha: Math.random() * 0.55 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulseSpeed: Math.random() * 0.03 + 0.01
    }));

    let gridOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const time = Date.now();

      // 1. Cyber Matrix Grid Lines with subtle pulsation
      gridOffset = (gridOffset + 0.2) % 45;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = gridOffset; y < height; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Dual Laser Sweep Beams (Primary Cyan Downwards, Secondary Blue Upwards)
      const laser1Y = (time * 0.04) % (height + 300) - 150;
      const laser1Grad = ctx.createLinearGradient(0, laser1Y - 40, 0, laser1Y + 10);
      laser1Grad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      laser1Grad.addColorStop(0.85, 'rgba(6, 182, 212, 0.05)');
      laser1Grad.addColorStop(1, 'rgba(6, 182, 212, 0.16)');
      ctx.fillStyle = laser1Grad;
      ctx.fillRect(0, laser1Y - 40, width, 50);

      const laser2Y = height - ((time * 0.025) % (height + 300) - 150);
      const laser2Grad = ctx.createLinearGradient(0, laser2Y - 30, 0, laser2Y + 10);
      laser2Grad.addColorStop(0, 'rgba(59, 130, 246, 0)');
      laser2Grad.addColorStop(0.85, 'rgba(59, 130, 246, 0.04)');
      laser2Grad.addColorStop(1, 'rgba(59, 130, 246, 0.14)');
      ctx.fillStyle = laser2Grad;
      ctx.fillRect(0, laser2Y - 30, width, 40);

      // 3. Connect close particle nodes with fine constellation lines & interactive mouse glow
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        // Particle Pulsing
        p1.alpha = 0.3 + Math.sin(time * p1.pulseSpeed) * 0.25;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.globalAlpha = p1.alpha;
        ctx.fill();

        // Interactive Mouse Glow Ring
        const dxMouse = mouseX - p1.x;
        const dyMouse = mouseY - p1.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);

        if (distMouse < 160) {
          const intensity = 1 - distMouse / 160;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = '#22d3ee';
          ctx.globalAlpha = intensity * 0.35;
          ctx.lineWidth = 1 + intensity;
          ctx.stroke();

          // Outer halo for mouse-proximate nodes
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, p1.radius * 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.globalAlpha = intensity * 0.5;
          ctx.stroke();
        }

        // Neighboring Constellation Connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - dist / 120) * 0.18;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-90 print:hidden"
    />
  );
};
