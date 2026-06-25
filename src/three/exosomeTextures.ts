/**
 * Procedural canvas-based textures for the lipid bilayer membrane.
 * Golden heads, dark tail region, organic variation.
 */

import * as THREE from "three";

function buildCanvas(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  draw(ctx, w, h);
  return c;
}

/**
 * Edge texture showing the bilayer: top heads, tails, bottom heads.
 * Used for the ribbon edge faces.
 */
export function createMembraneBilayerTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 256;

  const canvas = buildCanvas(w, h, (ctx, W, H) => {
    ctx.fillStyle = "#1a2e30";
    ctx.fillRect(0, 0, W, H);

    const headR = 7;
    const spacing = 18;
    const topY = H * 0.2;
    const botY = H * 0.8;

    for (let x = spacing / 2; x < W; x += spacing) {
      const wobble = Math.sin(x * 0.08) * 2;

      const bright = 0.8 + Math.sin(x * 0.15) * 0.2;
      const gold = `rgb(${Math.floor(191 * bright)}, ${Math.floor(167 * bright)}, ${Math.floor(106 * bright)})`;
      const darkGold = `rgb(${Math.floor(150 * bright)}, ${Math.floor(130 * bright)}, ${Math.floor(70 * bright)})`;

      ctx.beginPath();
      ctx.arc(x, topY + wobble, headR + Math.sin(x * 0.12) * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = gold;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, botY + wobble, headR + Math.cos(x * 0.12) * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = darkGold;
      ctx.fill();

      ctx.strokeStyle = "rgba(58, 94, 107, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 2, topY + wobble + headR);
      ctx.lineTo(x - 2, botY + wobble - headR);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 2, topY + wobble + headR);
      ctx.lineTo(x + 2, botY + wobble - headR);
      ctx.stroke();
    }

    const midGrad = ctx.createLinearGradient(0, H * 0.35, 0, H * 0.65);
    midGrad.addColorStop(0, "rgba(58, 94, 107, 0)");
    midGrad.addColorStop(0.5, "rgba(74, 228, 180, 0.04)");
    midGrad.addColorStop(1, "rgba(58, 94, 107, 0)");
    ctx.fillStyle = midGrad;
    ctx.fillRect(0, H * 0.35, W, H * 0.3);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 1);
  return tex;
}

/**
 * Top surface texture showing densely packed golden lipid heads.
 * Used for the top face of the ribbon membrane.
 */
export function createMembraneTopTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 512;

  const canvas = buildCanvas(w, h, (ctx, W, H) => {
    ctx.fillStyle = "#1a2e30";
    ctx.fillRect(0, 0, W, H);

    const spacing = 16;
    const headR = 5;

    for (let x = spacing / 2; x < W; x += spacing) {
      for (let y = spacing / 2; y < H; y += spacing) {
        const wobbleX = Math.sin(y * 0.05 + x * 0.03) * 1.5;
        const wobbleY = Math.cos(x * 0.05 + y * 0.03) * 1.5;
        const dist = Math.sqrt(
          Math.pow((x - W / 2) / (W / 2), 2) +
          Math.pow((y - H / 2) / (H / 2), 2)
        );
        const bright = 0.75 + Math.sin(x * 0.1 + y * 0.08) * 0.25 - dist * 0.15;
        const r = Math.floor(191 * Math.max(0.4, bright));
        const g = Math.floor(167 * Math.max(0.4, bright));
        const b = Math.floor(106 * Math.max(0.4, bright));

        ctx.beginPath();
        ctx.arc(x + wobbleX, y + wobbleY, headR + Math.sin(x * 0.1 + y * 0.1) * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill();
      }
    }
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 3);
  return tex;
}
