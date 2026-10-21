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

async function processCar(car) {
  console.log(`Downloading ${car.name} from ${car.url}...`);
  try {
    const res = await fetch(car.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const png = PNG.sync.read(buffer);
    console.log(`Processing ${car.name} (${png.width}x${png.height})...`);
    
    // Flood fill or corner background detection
    // Sample corner pixels to determine exact background color
    const cornerR = png.data[0];
    const cornerG = png.data[1];
    const cornerB = png.data[2];
    console.log(`Corner color: R=${cornerR}, G=${cornerG}, B=${cornerB}`);

    // If white/near-white corner:
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const idx = (png.width * y + x) << 2;
        const r = png.data[idx];
        const g = png.data[idx + 1];
        const b = png.data[idx + 2];
        const a = png.data[idx + 3];

        if (a === 0) continue;

        // Check if near white
        const minVal = Math.min(r, g, b);
        const maxVal = Math.max(r, g, b);
        const diff = maxVal - minVal;

        // If neutral light gray/white (diff is small, minVal is high)
        if (minVal > 235 && diff < 20) {
          if (minVal >= 250) {
            png.data[idx + 3] = 0;
          } else {
            // Feather alpha
            const alphaFactor = (250 - minVal) / 15;
            png.data[idx + 3] = Math.round(a * alphaFactor);
          }
        }
      }
    }

    const outBuffer = PNG.sync.write(png);
    const outFile = path.join(outDir, `${car.name}.png`);
    fs.writeFileSync(outFile, outBuffer);
    console.log(`Saved transparent image to ${outFile} (${outBuffer.length} bytes)`);
  } catch (err) {
    console.error(`Error processing ${car.name}:`, err);
  }
}

async function run() {
  for (const car of cars) {
    await processCar(car);
  }
}

run();
