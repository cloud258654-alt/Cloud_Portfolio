const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const ffmpeg = require("ffmpeg-static");

const cwd = process.cwd();
const batchDir = path.join(cwd, "image_to_video_batch");
const inputDir = path.join(batchDir, "input");
const promptDir = path.join(batchDir, "prompts");
const outputDir = path.join(batchDir, "output");
const contactDir = path.join(batchDir, "contact_sheets");
const tmpDir = path.join(batchDir, ".tmp_contact");
const imageExts = new Set([".png", ".jpg", ".jpeg", ".webp"]);

for (const dir of [batchDir, inputDir, promptDir, outputDir, contactDir, tmpDir]) {
  fs.mkdirSync(dir, { recursive: true });
}

const sourceImages = fs
  .readdirSync(cwd)
  .filter((file) => imageExts.has(path.extname(file).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, "zh-Hant"));

if (sourceImages.length === 0) {
  console.log("No source images found.");
  process.exit(0);
}

const rows = ["id,source_image,input_image,prompt_file,output_video,status"];

sourceImages.forEach((file, index) => {
  const id = String(index + 1).padStart(3, "0");
  const ext = path.extname(file).toLowerCase();
  const inputName = `${id}${ext}`;
  const promptName = `${id}.txt`;
  const outputName = `${id}.mp4`;

  fs.copyFileSync(path.join(cwd, file), path.join(inputDir, inputName));
  rows.push(
    [
      id,
      csv(file),
      `input/${inputName}`,
      `prompts/${promptName}`,
      `output/${outputName}`,
      "prompt_pending",
    ].join(",")
  );
});

fs.writeFileSync(path.join(batchDir, "manifest.csv"), rows.join("\n") + "\n", "utf8");

const perSheet = 16;
for (let start = 0; start < sourceImages.length; start += perSheet) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  const chunk = sourceImages.slice(start, start + perSheet);
  chunk.forEach((file, idx) => {
    const id = String(start + idx + 1).padStart(3, "0");
    const ext = path.extname(file).toLowerCase();
    fs.copyFileSync(path.join(inputDir, `${id}${ext}`), path.join(tmpDir, `${String(idx + 1).padStart(3, "0")}.png`));
  });

  const sheetId = String(Math.floor(start / perSheet) + 1).padStart(2, "0");
  const first = String(start + 1).padStart(3, "0");
  const last = String(start + chunk.length).padStart(3, "0");
  const output = path.join(contactDir, `sheet_${sheetId}_${first}-${last}.jpg`);

  const args = [
    "-y",
    "-framerate",
    "1",
    "-i",
    path.join(tmpDir, "%03d.png"),
    "-vf",
    "scale=260:340:force_original_aspect_ratio=decrease,pad=260:340:(ow-iw)/2:(oh-ih)/2:color=0x111111,tile=4x4:padding=8:margin=12",
    "-frames:v",
    "1",
    output,
  ];

  const result = spawnSync(ffmpeg, args, { stdio: "inherit" });
  if (result.status !== 0) {
    console.error(`Failed to create contact sheet ${sheetId}.`);
    process.exit(result.status || 1);
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`Prepared ${sourceImages.length} images in ${batchDir}`);

function csv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}
