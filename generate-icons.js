// Generate PWA icons using Canvas
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const dir = path.join(__dirname, 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size * 0.15; // corner radius

  // Rounded rectangle background
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#064E3B');
  grad.addColorStop(1, '#059669');
  ctx.fillStyle = grad;
  ctx.fill();

  // Cow emoji / icon text
  const emojiSize = size * 0.45;
  ctx.font = `bold ${emojiSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('🐄', size / 2, size * 0.42);

  // "CM" text below
  const textSize = size * 0.18;
  ctx.font = `bold ${textSize}px sans-serif`;
  ctx.fillStyle = '#A7F3D0';
  ctx.fillText('CM', size / 2, size * 0.78);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(dir, `icon-${size}.png`), buffer);
  console.log(`Created icon-${size}.png`);
});

console.log('All icons generated!');
