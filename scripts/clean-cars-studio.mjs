import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const outDir = path.resolve('public', 'cars');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const cars = [
  { name: 's-class', url: 'https://viennadaytrip.com/wp-content/uploads/2026/03/S-class-.png' },
  { name: 'e-class', url: 'https://viennadaytrip.com/wp-content/uploads/2026/03/E-Class.png' },
  { name: 'v-class', url: 'https://viennadaytrip.com/wp-content/uploads/2026/03/V-Class.png' }
];

async function cleanCar(car) {
  console.log(`Downloading and processing ${car.name}...`);
  const res = await fetch(car.url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  const png = PNG.sync.read(Buffer.from(arrayBuffer));
  const { width, height, data } = png;

  // BFS Flood Fill from all border pixels
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBackground(x, y) {
    const idx = (width * y + x) << 2;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    const diff = maxVal - minVal;
    // Neutral white, off-white, or ground shadow (up to darkness 90 near bottom)
    if (diff < 32 && minVal > 95) return true;
    if (minVal > 220) return true;
    return false;
  }

  // Seed with all border pixels
  for (let x = 0; x < width; x++) {
    if (isBackground(x, 0)) {
      queue.push(x, 0);
      visited[x] = 1;
    }
    if (isBackground(x, height - 1)) {
      queue.push(x, height - 1);
      visited[(height - 1) * width + x] = 1;
    }
  }
  for (let y = 0; y < height; y++) {
    if (isBackground(0, y) && !visited[y * width]) {
      queue.push(0, y);
      visited[y * width] = 1;
    }
    if (isBackground(width - 1, y) && !visited[y * width + (width - 1)]) {
      queue.push(width - 1, y);
      visited[y * width + (width - 1)] = 1;
    }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIndex = ny * width + nx;
        if (!visited[nIndex] && isBackground(nx, ny)) {
          visited[nIndex] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  console.log(`${car.name}: flood-filled ${queue.length / 2} pixels out of ${width * height}`);

  // Now transform visited pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIndex = y * width + x;
      const idx = pIndex << 2;

      if (visited[pIndex]) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const minVal = Math.min(r, g, b);

        if (minVal >= 238) {
          // Pure transparent
          data[idx + 3] = 0;
        } else {
          // It's part of the ground shadow! Turn into black with proper shadow opacity
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          const shadowFactor = (238 - minVal) / 148; // 0 to 1
          data[idx + 3] = Math.round(Math.min(255, shadowFactor * 220));
        }
      }
    }
  }

  const outBuffer = PNG.sync.write(png);
  const outFile = path.join(outDir, `${car.name}.png`);
  fs.writeFileSync(outFile, outBuffer);
  console.log(`Successfully generated studio-quality ${outFile}`);
}

async function run() {
  for (const car of cars) {
    await cleanCar(car);
  }
}

run();
