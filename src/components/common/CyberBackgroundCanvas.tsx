import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
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

    // Track mouse position for interactive particle connections
    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Generate constellation particles
    const particleCount = Math.min(Math.floor((width * height) / 20000), 75);
    const colors = ['#06b6d4', '#3b82f6', '#10b981', '#6366f1'];

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.25,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    let gridOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Cyber Matrix Grid Lines
      gridOffset = (gridOffset + 0.15) % 40;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = gridOffset; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Moving Cyber Laser Sweep Line
      const laserY = (Date.now() * 0.035) % (height + 200) - 100;
      const laserGrad = ctx.createLinearGradient(0, laserY - 30, 0, laserY + 5);
      laserGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      laserGrad.addColorStop(0.8, 'rgba(6, 182, 212, 0.03)');
      laserGrad.addColorStop(1, 'rgba(6, 182, 212, 0.12)');
      ctx.fillStyle = laserGrad;
      ctx.fillRect(0, laserY - 30, width, 35);

      // 3. Connect close particle nodes with fine constellation lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.globalAlpha = p1.alpha;
        ctx.fill();

        // Connect to mouse cursor when nearby
        const dxMouse = mouseX - p1.x;
        const dyMouse = mouseY - p1.y;
        const distMouse = Math.hypot(dxMouse, dyMouse);
        if (distMouse < 140) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = '#22d3ee';
          ctx.globalAlpha = (1 - distMouse / 140) * 0.25;
          ctx.stroke();
        }

        // Connect to neighboring particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = (1 - dist / 110) * 0.15;
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
      className="fixed inset-0 z-0 pointer-events-none opacity-85 print:hidden"
    />
  );
};
