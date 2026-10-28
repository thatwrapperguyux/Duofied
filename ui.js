// Default screen layouts. The Apple reference images are optional: when they are
// not present the layouts are drawn from scratch so the app works with no build step.
const REFERENCE = [
  'wallpaper-inner.avif',
  'clock-inner.avif', 'clock-outer.avif',
  'launcher-inner.png', 'launcher-outer.png',
];

async function loadReference() {
  try {
    const entries = await Promise.all(REFERENCE.map(async name => {
      const image = new Image();
      image.src = `./assets/ui/${name}`;
      await image.decode();
      return [name, image];
    }));
    return Object.fromEntries(entries);
  } catch {
    return null;
  }
}

function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

function drawWallpaper(context, width, height) {
  const sky = context.createLinearGradient(0, 0, width * .65, height);
  sky.addColorStop(0, '#15213a');
  sky.addColorStop(.45, '#3c2a63');
  sky.addColorStop(1, '#b4537a');
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
  const glow = context.createRadialGradient(width * .74, height * .76, 0, width * .74, height * .76, height * .7);
  glow.addColorStop(0, 'rgba(255,186,132,.55)');
  glow.addColorStop(1, 'rgba(255,186,132,0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
  context.fillStyle = 'rgba(255,255,255,.85)';
  for (let i = 0; i < 70; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * width;
    const y = (Math.sin(i * 78.233) * 12345.6789 % 1 + 1) % 1 * height * .55;
    context.globalAlpha = .15 + ((i * 37) % 10) / 14;
    context.fillRect(x, y, 2, 2);
  }
  context.globalAlpha = 1;
}

function drawClock(context, width, height) {
  const scale = height / 1125;
  context.textAlign = 'center';
  context.fillStyle = '#fff';
  context.font = `300 ${Math.round(190 * scale)}px ${FONT}`;
  context.fillText('9:41', width / 2, height * .27);
  context.font = `500 ${Math.round(40 * scale)}px ${FONT}`;
  context.globalAlpha = .85;
  context.fillText('Monday, 9 September', width / 2, height * .33);
  context.globalAlpha = 1;
}

function drawLauncher(context, width, height, columns) {
  context.fillStyle = '#0d1117';
  context.fillRect(0, 0, width, height);
  const glow = context.createLinearGradient(0, 0, width, height);
  glow.addColorStop(0, 'rgba(79,70,229,.35)');
  glow.addColorStop(1, 'rgba(16,185,129,.22)');
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);
  const palette = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#14b8a6', '#f97316'];
  const margin = width * .09;
  const gap = width * .045;
  const size = (width - margin * 2 - gap * (columns - 1)) / columns;
  const rows = 4;
  const top = height * .16;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const index = row * columns + column;
      context.fillStyle = palette[index % palette.length];
      roundedRect(context, margin + column * (size + gap), top + row * (size + gap * 1.5), size, size, size * .26);
      context.fill();
    }
  }
  const dockHeight = size * 1.5;
  context.fillStyle = 'rgba(255,255,255,.14)';
  roundedRect(context, margin, height - dockHeight - height * .05, width - margin * 2, dockHeight, dockHeight * .3);
  context.fill();
  for (let i = 0; i < Math.min(4, columns); i++) {
    const dockSize = size * .82;
    const spacing = (width - margin * 2) / Math.min(4, columns);
    context.fillStyle = palette[(i + 3) % palette.length];
    roundedRect(context, margin + spacing * i + (spacing - dockSize) / 2,
      height - dockHeight - height * .05 + (dockHeight - dockSize) / 2, dockSize, dockSize, dockSize * .26);
    context.fill();
  }
}

export async function loadDefaultUIs() {
  const images = await loadReference();
  const themes = { wallpaper: {}, launcher: {} };
  const innerWidth = 1600;
  for (const [theme, screens] of Object.entries(themes)) {
    for (const kind of ['inner', 'outer']) {
      const canvas = document.createElement('canvas');
      canvas.width = kind === 'inner' ? innerWidth : 774;
      canvas.height = 1125;
      const context = canvas.getContext('2d');
      if (images && theme === 'wallpaper') {
        context.drawImage(images['wallpaper-inner.avif'], canvas.width - innerWidth, 0, innerWidth, canvas.height);
        context.drawImage(images[`clock-${kind}.avif`], 0, 0, canvas.width, canvas.height);
      } else if (images) {
        // The HIG screenshots include a device frame; use only their display area.
        const crop = kind === 'inner' ? [22, 22, 1072, 754] : [28, 16, 510, 742];
        context.drawImage(images[`launcher-${kind}.png`], ...crop, 0, 0, canvas.width, canvas.height);
      } else if (theme === 'wallpaper') {
        drawWallpaper(context, canvas.width, canvas.height);
        drawClock(context, canvas.width, canvas.height);
      } else {
        drawLauncher(context, canvas.width, canvas.height, kind === 'inner' ? 6 : 4);
      }
      screens[kind] = canvas;
    }
  }
  return themes;
}
