const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const ffmpeg = require("ffmpeg-static");

const cwd = process.cwd();
const outputDir = path.join(cwd, "videos");
const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

fs.mkdirSync(outputDir, { recursive: true });

const images = fs
  .readdirSync(cwd)
  .filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, "zh-Hant"));

if (images.length === 0) {
  console.log("No images found.");
  process.exit(0);
}

for (const [index, image] of images.entries()) {
  const input = path.join(cwd, image);
  const base = path.basename(image, path.extname(image));
  const output = path.join(outputDir, `${base}.mp4`);

  const filter = [
    "scale=1200:-2",
    "zoompan=z='1+0.045*on/239':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=240:s=1200x1800:fps=30",
    "eq=brightness='0.012*sin(2*PI*t)':contrast=1.04:saturation=1.08",
    "format=yuv420p",
  ].join(",");

  const args = [
    "-y",
    "-loop",
    "1",
    "-i",
    input,
    "-t",
    "8",
    "-vf",
    filter,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "18",
    "-movflags",
    "+faststart",
    "-an",
    output,
  ];

  console.log(`[${index + 1}/${images.length}] ${image} -> videos/${path.basename(output)}`);
  const result = spawnSync(ffmpeg, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Failed to render: ${image}`);
    process.exit(result.status || 1);
  }
}

console.log(`Done. Rendered ${images.length} videos to ${outputDir}`);
