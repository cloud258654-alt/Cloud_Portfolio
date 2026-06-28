import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBytes = Buffer.alloc(4);
  crcBytes.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([length, typeBytes, data, crcBytes]);
}

function generateIcon(size, bgR, bgG, bgB, accentR, accentG, accentB) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42;
  const innerR = size * 0.28;
  const rawRows = [];

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0;
    for (let x = 0; x < size; x++) {
      const offset = 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= innerR) {
        row[offset] = accentR;
        row[offset + 1] = accentG;
        row[offset + 2] = accentB;
        row[offset + 3] = 255;
      } else if (dist <= outerR) {
        const t = (dist - innerR) / (outerR - innerR);
        row[offset] = Math.round(bgR + (accentR - bgR) * (1 - t));
        row[offset + 1] = Math.round(bgG + (accentG - bgG) * (1 - t));
        row[offset + 2] = Math.round(bgB + (accentB - bgB) * (1 - t));
        row[offset + 3] = 255;
      } else {
        row[offset] = bgR;
        row[offset + 1] = bgG;
        row[offset + 2] = bgB;
        row[offset + 3] = 255;
      }
    }
    rawRows.push(row);
  }

  const raw = Buffer.concat(rawRows);
  const compressed = deflateSync(raw);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = createChunk("IHDR", ihdrData);
  const idat = createChunk("IDAT", compressed);
  const iend = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const publicDir = resolve(process.argv[2] || "public");
mkdirSync(publicDir, { recursive: true });

writeFileSync(resolve(publicDir, "icon-192.png"), generateIcon(192, 16, 41, 71, 90, 148, 210));
writeFileSync(resolve(publicDir, "icon-512.png"), generateIcon(512, 16, 41, 71, 90, 148, 210));

console.log("PWA icons generated in", publicDir);
