import { useEffect, useRef } from "react";

export default function FractalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Floating geometric particles
    const particles = Array.from({ length: 40 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
      type: i % 3, // 0=circle, 1=triangle, 2=square
    }));

    // Grid lines
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(163, 230, 53, 0.03)";
      ctx.lineWidth = 1;
      const spacing = 80;
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawParticle = (p) => {
      ctx.save();
      ctx.globalAlpha = p.opacity * (0.7 + 0.3 * Math.sin(t * 0.02 + p.x));
      ctx.strokeStyle = "#a3e635";
      ctx.lineWidth = 0.8;
      ctx.translate(p.x, p.y);
      ctx.rotate(t * 0.005 + p.x * 0.01);

      if (p.type === 0) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 3, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 1) {
        const s = p.size * 4;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s, s);
        ctx.lineTo(-s, s);
        ctx.closePath();
        ctx.stroke();
      } else {
        const s = p.size * 3;
        ctx.strokeRect(-s, -s, s * 2, s * 2);
      }
      ctx.restore();
    };

    // Large background fractal triangles
    const drawFractalAccents = () => {
      ctx.save();
      ctx.strokeStyle = "rgba(163, 230, 53, 0.04)";
      ctx.lineWidth = 1;

      // Top right accent
      const tx = canvas.width * 0.85;
      const ty = canvas.height * 0.1;
      const ts = 200 + Math.sin(t * 0.01) * 20;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + ts, ty + ts * 1.7);
      ctx.lineTo(tx - ts, ty + ts * 1.7);
      ctx.closePath();
      ctx.stroke();

      // Inner triangle
      ctx.strokeStyle = "rgba(163, 230, 53, 0.06)";
      const is = ts * 0.5;
      ctx.beginPath();
      ctx.moveTo(tx, ty + ts * 0.35);
      ctx.lineTo(tx + is, ty + ts * 1.7 - is * 0.2);
      ctx.lineTo(tx - is, ty + ts * 1.7 - is * 0.2);
      ctx.closePath();
      ctx.stroke();

      // Bottom left accent
      ctx.strokeStyle = "rgba(192, 132, 252, 0.04)";
      const bx = canvas.width * 0.1;
      const by = canvas.height * 0.75;
      const bs = 150;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + bs, by + bs * 1.7);
      ctx.lineTo(bx - bs, by + bs * 1.7);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGrid();
      drawFractalAccents();

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;
        drawParticle(p);
      });

      t++;
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw", height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
