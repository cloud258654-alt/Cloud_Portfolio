export type ImportAsset = {
  id: string;
  name: string;
  type: "ppt" | "image" | "prompt";
  text: string;
};

export type ImportSceneDraft = {
  title: string;
  source: string;
  storyText: string;
  heroImageReferenceName?: string;
  heroImageReferenceDataUrl?: string;
  heroImagePrompt: string;
  flowAnimationPrompt: string;
  voiceOver: string;
  subtitle: string;
};

export type ImportPlan = {
  projectName: string;
  description: string;
  assets: ImportAsset[];
  scenes: ImportSceneDraft[];
};

const textDecoder = new TextDecoder("utf-8");

export async function buildImportPlan({
  files,
  promptText,
  projectName,
}: {
  files: File[];
  promptText: string;
  projectName: string;
}): Promise<ImportPlan> {
  const assets: ImportAsset[] = [];
  const scenes: ImportSceneDraft[] = [];

  for (const file of files) {
    if (isPptx(file)) {
      const slideTexts = await extractPptxSlideTexts(file);
      assets.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: "ppt",
        text: slideTexts.join("\n\n"),
      });
      scenes.push(...slideTexts.map((text, index) => sceneFromText(text, index + 1, file.name)));
      continue;
    }

    if (isPpt(file)) {
      assets.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: "ppt",
        text: "Legacy .ppt file detected. Convert to .pptx for full local text extraction.",
      });
      scenes.push(sceneFromText(file.name, scenes.length + 1, file.name));
      continue;
    }

    if (file.type.startsWith("image/")) {
      const title = cleanFileName(file.name);
      const imageText = `Reference image: ${file.name}`;
      const imageDataUrl = await readFileAsDataUrl(file);
      assets.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: "image",
        text: imageText,
      });
      scenes.push({
        title,
        source: file.name,
        storyText: imageText,
        heroImageReferenceName: file.name,
        heroImageReferenceDataUrl: imageDataUrl,
        heroImagePrompt: `Use ${file.name} as the visual reference. Preserve the main subject, composition, color mood, lighting direction, and production design.`,
        flowAnimationPrompt: `Animate from the reference image with subtle cinematic movement, coherent subject motion, stable identity, consistent lighting, and a clear beginning-to-ending camera move.`,
        voiceOver: "",
        subtitle: "",
      });
    }
  }

  const promptScenes = splitPromptIntoScenes(promptText);
  if (promptScenes.length > 0) {
    assets.push({
      id: crypto.randomUUID(),
      name: "Prompt Text",
      type: "prompt",
      text: promptText.trim(),
    });
    scenes.push(
      ...promptScenes.map((text, index) => sceneFromText(text, scenes.length + index + 1, "Prompt Text")),
    );
  }

  const fallbackScenes = scenes.length > 0 ? scenes : [sceneFromText("Untitled Flow Scene", 1, "Manual import")];

  return {
    projectName: projectName.trim() || inferProjectName(files, promptText),
    description: summarizeAssets(files, promptText),
    assets,
    scenes: fallbackScenes,
  };
}

function isPptx(file: File) {
  return file.name.toLowerCase().endsWith(".pptx");
}

function isPpt(file: File) {
  return file.name.toLowerCase().endsWith(".ppt");
}

function cleanFileName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || name;
}

function inferProjectName(files: File[], promptText: string) {
  const pptFile = files.find((file) => isPptx(file) || isPpt(file));
  if (pptFile) return cleanFileName(pptFile.name);
  const firstLine = promptText.trim().split(/\r?\n/).find(Boolean);
  if (firstLine) return firstLine.slice(0, 72);
  return "Imported Google Flow Project";
}

function summarizeAssets(files: File[], promptText: string) {
  const parts = [];
  const pptCount = files.filter((file) => isPptx(file) || isPpt(file)).length;
  const imageCount = files.filter((file) => file.type.startsWith("image/")).length;
  if (pptCount) parts.push(`${pptCount} presentation file${pptCount > 1 ? "s" : ""}`);
  if (imageCount) parts.push(`${imageCount} reference image${imageCount > 1 ? "s" : ""}`);
  if (promptText.trim()) parts.push("prompt text");
  return parts.length ? `Imported from ${parts.join(", ")}.` : "Imported multimodal Flow project.";
}

function splitPromptIntoScenes(promptText: string) {
  return promptText
    .split(/\n\s*\n|\r\n\s*\r\n/g)
    .map((part) => part.replace(/^[-*#\d.\s]+/, "").trim())
    .filter(Boolean);
}

function sceneFromText(text: string, sceneNumber: number, source: string): ImportSceneDraft {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const title = (lines[0] || `Scene ${sceneNumber}`).slice(0, 80);
  const storyText = lines.join(" ");

  return {
    title,
    source,
    storyText,
    heroImagePrompt: `Create a cinematic hero image for Scene ${sceneNumber}: ${storyText}. Keep visual continuity, clear subject identity, production-ready lighting, and a readable composition.`,
    flowAnimationPrompt: `Generate a Google Flow video scene based on: ${storyText}. Use cinematic camera movement, coherent motion, stable subject continuity, natural timing, and a clear ending frame for the next scene.`,
    voiceOver: storyText,
    subtitle: title,
  };
}

async function extractPptxSlideTexts(file: File) {
  const entries = await readZipEntries(await file.arrayBuffer());
  const slideEntries = entries
    .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/i.test(entry.name))
    .sort((a, b) => getSlideNumber(a.name) - getSlideNumber(b.name));

  const slides = slideEntries
    .map((entry, index) => extractSlideText(entry.text, index + 1))
    .filter(Boolean);

  return slides.length > 0 ? slides : [`${cleanFileName(file.name)}\nNo readable slide text was found.`];
}

function getSlideNumber(name: string) {
  return Number(name.match(/slide(\d+)\.xml/i)?.[1] ?? 0);
}

function extractSlideText(xml: string, slideNumber: number) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const nodes = Array.from(doc.getElementsByTagName("a:t"));
  const text = nodes.map((node) => node.textContent?.trim()).filter(Boolean).join(" ");
  return text ? `Slide ${slideNumber}\n${text}` : "";
}

type ZipEntry = {
  name: string;
  text: string;
};

async function readZipEntries(buffer: ArrayBuffer): Promise<ZipEntry[]> {
  const bytes = new Uint8Array(buffer);
  const entries: ZipEntry[] = [];
  let offset = 0;

  while (offset < bytes.length - 30) {
    if (readUInt32(bytes, offset) !== 0x04034b50) {
      offset += 1;
      continue;
    }

    const compression = readUInt16(bytes, offset + 8);
    const compressedSize = readUInt32(bytes, offset + 18);
    const fileNameLength = readUInt16(bytes, offset + 26);
    const extraLength = readUInt16(bytes, offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + fileNameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    const name = textDecoder.decode(bytes.slice(nameStart, nameStart + fileNameLength));

    if (compressedSize > 0 && dataEnd <= bytes.length) {
      const data = bytes.slice(dataStart, dataEnd);
      const inflated = await inflateZipData(data, compression);
      if (inflated) {
        entries.push({ name, text: textDecoder.decode(inflated) });
      }
    }

    offset = Math.max(dataEnd, offset + 30);
  }

  return entries;
}

async function inflateZipData(data: Uint8Array, compression: number) {
  if (compression === 0) return data;
  if (compression !== 8) return null;

  try {
    const buffer = new ArrayBuffer(data.byteLength);
    new Uint8Array(buffer).set(data);
    const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("deflate-raw" as CompressionFormat));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

function readUInt16(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUInt32(bytes: Uint8Array, offset: number) {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
