const STORAGE_KEY = "mythic-seas-canvas-3d-v2";

const config = {
  maxLevel: 100,
  statPointsPerLevel: 3,
  cores: {
    Tideheart: { name: "潮心核心", bonus: { Focus: 4, Vitality: 2 }, skill: { name: "湧潮斬", multiplier: 1.45, cooldown: 4 } },
    Ashflare: { name: "燼焰核心", bonus: { Power: 5 }, skill: { name: "燼旋爆", multiplier: 1.7, cooldown: 5 } },
    Skylumen: { name: "天輝核心", bonus: { Agility: 4, Focus: 3 }, skill: { name: "輝步連擊", multiplier: 1.6, cooldown: 5 } }
  },
  weapons: {
    Driftblade: { name: "漂浪刃", requiredLevel: 1, damage: 12 },
    Reefsplitter: { name: "裂礁重刃", requiredLevel: 25, damage: 34 },
    StormglassSaber: { name: "暴璃軍刀", requiredLevel: 60, damage: 78 }
  },
  enemies: [
    { id: "reef_wisp", name: "礁光幽靈", level: 1, hp: 55, damage: 6, exp: 18, x: 130, z: 42, color: "#35d9a4" },
    { id: "shellback_raider", name: "甲背掠奪者", level: 8, hp: 135, damage: 13, exp: 45, x: 30, z: 105, color: "#ee7b42" },
    { id: "brine_crowned_colossus", name: "鹽冠巨像", level: 18, hp: 1800, damage: 42, exp: 900, x: 185, z: 100, color: "#a55cff", boss: true, drops: [{ id: "Reefsplitter", chance: 0.22 }, { id: "Tideheart", chance: 0.12 }] },
    { id: "stormbound_keeper", name: "縛雷守衛", level: 28, hp: 420, damage: 38, exp: 160, x: -78, z: 32, color: "#67d8ff" }
  ],
  quests: {
    reef_first_light: { name: "初升礁光", npc: "萊拉船長", target: "reef_wisp", count: 5, exp: 160, coins: 120, level: 1 },
    sunspire_guardian: { name: "日耀守門戰", npc: "萊拉船長", target: "brine_crowned_colossus", count: 1, exp: 1100, coins: 550, level: 12 }
  },
  questOrder: ["reef_first_light", "sunspire_guardian"]
};

const els = {
  canvas: document.getElementById("gameCanvas"),
  islandLine: document.getElementById("islandLine"),
  hpBar: document.getElementById("hpBar"),
  hpText: document.getElementById("hpText"),
  expBar: document.getElementById("expBar"),
  expText: document.getElementById("expText"),
  targetName: document.getElementById("targetName"),
  targetLevel: document.getElementById("targetLevel"),
  enemyHp: document.getElementById("enemyHp"),
  enemyHpText: document.getElementById("enemyHpText"),
  attackBtn: document.getElementById("attackBtn"),
  coreBtn: document.getElementById("coreBtn"),
  questBtn: document.getElementById("questBtn"),
  coreSelect: document.getElementById("coreSelect"),
  weaponSelect: document.getElementById("weaponSelect"),
  coins: document.getElementById("coins"),
  points: document.getElementById("points"),
  questText: document.getElementById("questText"),
  centerNote: document.getElementById("centerNote"),
  log: document.getElementById("log")
};

const ctx = els.canvas.getContext("2d");
const keys = new Set();
const mouse = { down: false, startX: 0, startY: 0, lastX: 0, lastY: 0 };
const camera = { yaw: -0.72, pitch: 0.72, distance: 300, height: 98, fov: 560 };
const player = loadPlayer();
const enemies = config.enemies.map((enemy) => ({ ...enemy, y: 0, currentHp: enemy.hp, maxHp: enemy.hp, alive: true, bob: Math.random() * 10 }));

let width = 1;
let height = 1;
let dpr = 1;
let targetEnemy = null;
let coreReadyAt = 0;
let lastTime = performance.now();
let attackFlash = 0;

const sceneObjects = [
  { type: "platform", x: 0, z: 0, w: 230, h: 26, d: 170, color: "#a66d42", top: "#d99a68" },
  { type: "box", x: -24, y: 15, z: -4, w: 70, h: 10, d: 42, color: "#67bfff", top: "#bfe8ff" },
  { type: "box", x: 62, y: 15, z: 34, w: 68, h: 14, d: 22, color: "#5f65e8", top: "#817fff" },
  { type: "box", x: 96, y: 23, z: 18, w: 34, h: 22, d: 58, color: "#6636c9", top: "#7a54ee" },
  { type: "box", x: -76, y: 16, z: 58, w: 48, h: 12, d: 34, color: "#f6d98f", top: "#ffeab0" },
  { type: "box", x: 10, y: 25, z: 74, w: 24, h: 30, d: 24, color: "#d94141", top: "#ff6e6e" },
  { type: "box", x: 42, y: 24, z: 82, w: 25, h: 28, d: 25, color: "#2f7cff", top: "#78b0ff" },
  { type: "box", x: -36, y: 26, z: 84, w: 18, h: 34, d: 18, color: "#ffab35", top: "#ffd178" },
  { type: "tower", x: -92, z: -54 },
  { type: "lighthouse", x: 172, z: -96 },
  { type: "mast", x: -128, z: 36 }
];

const mats = [
  { x: -82, z: -20, w: 42, d: 36, color: "#2e8cff" },
  { x: -38, z: -24, w: 35, d: 35, color: "#ffe6a5" },
  { x: 14, z: -28, w: 42, d: 28, color: "#78c2ff" },
  { x: 74, z: -36, w: 48, d: 22, color: "#295ee8" }
];

function defaultPlayer() {
  return {
    level: 1,
    exp: 0,
    coins: 0,
    statPoints: 0,
    hp: 120,
    stats: { Power: 0, Vitality: 0, Focus: 0, Agility: 0 },
    core: "Tideheart",
    weapon: "Driftblade",
    inventory: { cores: { Tideheart: true }, weapons: { Driftblade: true } },
    activeQuest: null,
    questProgress: {},
    completedQuests: {},
    x: -20,
    z: 20,
    y: 0,
    vy: 0
  };
}

function loadPlayer() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? reconcile(saved) : defaultPlayer();
  } catch {
    return defaultPlayer();
  }
}

function reconcile(saved) {
  const base = defaultPlayer();
  const merged = {
    ...base,
    ...saved,
    stats: { ...base.stats, ...(saved.stats || {}) },
    inventory: {
      cores: { ...base.inventory.cores, ...((saved.inventory || {}).cores || {}) },
      weapons: { ...base.inventory.weapons, ...((saved.inventory || {}).weapons || {}) }
    },
    questProgress: { ...base.questProgress, ...(saved.questProgress || {}) },
    completedQuests: { ...base.completedQuests, ...(saved.completedQuests || {}) }
  };
  merged.hp = Math.min(merged.hp || maxHp(merged), maxHp(merged));
  return merged;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  els.canvas.width = Math.floor(width * dpr);
  els.canvas.height = Math.floor(height * dpr);
  els.canvas.style.width = `${width}px`;
  els.canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function expForLevel(level) {
  return level >= config.maxLevel ? Infinity : Math.floor(80 + Math.pow(level, 2.18) * 22);
}

function effectiveStat(name) {
  const core = config.cores[player.core] || config.cores.Tideheart;
  return (player.stats[name] || 0) + ((core.bonus && core.bonus[name]) || 0);
}

function maxHp(profile = player) {
  const core = config.cores[profile.core] || config.cores.Tideheart;
  const vitality = (profile.stats.Vitality || 0) + ((core.bonus && core.bonus.Vitality) || 0);
  return 120 + profile.level * 8 + vitality * 14;
}

function playerDamage(multiplier = 1) {
  const weapon = config.weapons[player.weapon] || config.weapons.Driftblade;
  return Math.floor((weapon.damage + player.level * 1.5 + effectiveStat("Power") * 2.4 + effectiveStat("Focus") * 0.8) * multiplier);
}

function shade(hex, amount) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (n & 255) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}

function cameraPosition() {
  return {
    x: player.x - Math.sin(camera.yaw) * camera.distance,
    y: player.y + camera.height + Math.sin(camera.pitch) * 80,
    z: player.z - Math.cos(camera.yaw) * camera.distance
  };
}

function project(point) {
  const cam = cameraPosition();
  const dx = point.x - cam.x;
  const dy = point.y - cam.y;
  const dz = point.z - cam.z;
  const sin = Math.sin(camera.yaw);
  const cos = Math.cos(camera.yaw);
  const rx = cos * dx - sin * dz;
  const rz = sin * dx + cos * dz;
  const py = Math.cos(camera.pitch) * dy - Math.sin(camera.pitch) * rz;
  const pz = Math.sin(camera.pitch) * dy + Math.cos(camera.pitch) * rz;
  const depth = Math.max(18, pz + camera.distance * 0.72);
  const scale = camera.fov / depth;
  return { x: width / 2 + rx * scale, y: height * 0.53 - py * scale, scale, depth };
}

function poly(points, fill, stroke = "rgba(0,0,0,0.16)") {
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function rect3(x, y, z, w, h, d, color, topColor = shade(color, 34)) {
  const x1 = x - w / 2;
  const x2 = x + w / 2;
  const y0 = y;
  const y1 = y + h;
  const z1 = z - d / 2;
  const z2 = z + d / 2;
  const p = {
    a: project({ x: x1, y: y0, z: z1 }),
    b: project({ x: x2, y: y0, z: z1 }),
    c: project({ x: x2, y: y0, z: z2 }),
    d: project({ x: x1, y: y0, z: z2 }),
    e: project({ x: x1, y: y1, z: z1 }),
    f: project({ x: x2, y: y1, z: z1 }),
    g: project({ x: x2, y: y1, z: z2 }),
    h: project({ x: x1, y: y1, z: z2 })
  };
  poly([p.e, p.f, p.g, p.h], topColor);
  poly([p.a, p.e, p.h, p.d], shade(color, -18));
  poly([p.b, p.f, p.g, p.c], shade(color, -35));
  poly([p.d, p.h, p.g, p.c], color);
  poly([p.a, p.e, p.f, p.b], shade(color, -10));
}

function label(text, x, y, z, color = "#ffffff") {
  const p = project({ x, y, z });
  if (p.depth < 25 || p.depth > 850) return;
  ctx.save();
  ctx.font = `700 ${Math.max(10, Math.min(18, p.scale * 7))}px Segoe UI, sans-serif`;
  ctx.textAlign = "center";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.strokeText(text, p.x, p.y);
  ctx.fillStyle = color;
  ctx.fillText(text, p.x, p.y);
  ctx.restore();
}

function drawCharacter(entity, options = {}) {
  const scale = options.scale || 1;
  const x = entity.x;
  const z = entity.z;
  const y = (entity.y || 0) + 8;
  const shirt = options.shirt || entity.color || "#3a7cff";
  rect3(x, y + 9 * scale, z, 16 * scale, 19 * scale, 10 * scale, shirt, shade(shirt, 26));
  rect3(x - 11 * scale, y + 8 * scale, z, 6 * scale, 18 * scale, 7 * scale, options.arm || "#e9eef7", "#ffffff");
  rect3(x + 11 * scale, y + 8 * scale, z, 6 * scale, 18 * scale, 7 * scale, options.arm || "#e9eef7", "#ffffff");
  rect3(x - 5 * scale, y - 8 * scale, z, 7 * scale, 18 * scale, 8 * scale, "#2e3541", "#515c70");
  rect3(x + 5 * scale, y - 8 * scale, z, 7 * scale, 18 * scale, 8 * scale, "#2e3541", "#515c70");
  rect3(x, y + 25 * scale, z, 14 * scale, 14 * scale, 14 * scale, options.head || "#ffd5b0", "#ffe6cf");

  if (options.player) {
    rect3(x - 16 * scale, y + 30 * scale, z, 7 * scale, 15 * scale, 7 * scale, "#f4f7ff", "#ffffff");
    rect3(x + 16 * scale, y + 30 * scale, z, 7 * scale, 15 * scale, 7 * scale, "#f4f7ff", "#ffffff");
    rect3(x + 25 * scale, y + 7 * scale, z - 2, 13 * scale, 13 * scale, 13 * scale, "#2ce88b", "#73ffb7");
  }
}

function drawSea(time) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#86d8ff");
  sky.addColorStop(0.38, "#bdeeff");
  sky.addColorStop(0.39, "#087ec1");
  sky.addColorStop(1, "#075b93");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.34;
  for (let i = -8; i <= 12; i += 1) {
    const y = height * 0.46 + i * 34 + Math.sin(time * 0.001 + i) * 3;
    ctx.strokeStyle = i % 2 ? "#42bdf5" : "#a2f0ff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(width * 0.28, y + 20, width * 0.55, y - 16, width, y + 8);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.22;
  rect3(-40, -36, 220, 120, 18, 52, "#5db7c7", "#8be2e8");
  rect3(130, -34, 235, 85, 18, 42, "#4daaa2", "#79d8ce");
  rect3(-170, -32, 190, 76, 16, 36, "#4b98bf", "#76c5e4");
  ctx.restore();
}

function drawPlatformDetails(time) {
  mats.forEach((mat) => rect3(mat.x, 14, mat.z, mat.w, 2.4, mat.d, mat.color, shade(mat.color, 38)));
  for (let i = -4; i <= 4; i += 1) {
    rect3(i * 24, 14.3, -72, 16, 1.2, 44, i % 2 ? "#2a79e8" : "#d9ecff", i % 2 ? "#58a5ff" : "#ffffff");
  }
  rect3(120, 15, -34, 40, 4, 12, "#244761", "#497b9b");
  rect3(120, 22, -34, 12, 14, 12, "#6b7884", "#94a4ad");
  rect3(145, 18, -34, 12, 10, 12, "#6b7884", "#94a4ad");
  rect3(-120, 22, 20, 9, 22, 9, "#8b5d39", "#b78051");
  rect3(-122, 48, 20, 26, 16, 5, "#9f572f", "#c17747");

  const ring = Math.sin(time * 0.005) * 6;
  rect3(-32 + ring, 18, 32, 16, 16, 16, "#35d9a4", "#82ffd1");
}

function drawSpecialObject(item) {
  if (item.type === "tower") {
    for (let i = 0; i < 6; i += 1) {
      rect3(item.x, 16 + i * 18, item.z, 15, 15, 15, i % 2 ? "#1e415e" : "#17354f", "#3f7192");
    }
    rect3(item.x, 130, item.z, 28, 12, 28, "#49d27b", "#8dffae");
    label("高塔", item.x, 150, item.z);
    return;
  }

  if (item.type === "lighthouse") {
    for (let i = 0; i < 7; i += 1) {
      rect3(item.x, 18 + i * 26, item.z, 40, 24, 40, i % 2 ? "#f4f7ff" : "#e0443d", i % 2 ? "#ffffff" : "#ff756f");
    }
    rect3(item.x, 208, item.z, 48, 18, 48, "#2c9fe8", "#87d8ff");
    label("燈塔", item.x, 238, item.z);
    return;
  }

  if (item.type === "mast") {
    rect3(item.x, 44, item.z, 8, 58, 8, "#7b5537", "#a87952");
    rect3(item.x + 16, 82, item.z, 38, 26, 4, "#8b4b2d", "#bd754e");
  }
}

function sortDepth(entity) {
  const cam = cameraPosition();
  return Math.hypot(entity.x - cam.x, (entity.y || 0) - cam.y, entity.z - cam.z);
}

function drawScene(time) {
  drawSea(time);

  const objects = [
    ...sceneObjects,
    ...enemies.filter((enemy) => enemy.alive),
    { type: "npc", x: -74, z: -48, y: 0, name: "萊拉船長" },
    { type: "player", x: player.x, y: player.y, z: player.z }
  ].sort((a, b) => sortDepth(b) - sortDepth(a));

  objects.forEach((item) => {
    if (item.type === "platform") {
      rect3(item.x, 0, item.z, item.w, item.h, item.d, item.color, item.top);
      drawPlatformDetails(time);
    } else if (item.type === "box") {
      rect3(item.x, item.y, item.z, item.w, item.h, item.d, item.color, item.top);
    } else if (item.type === "tower" || item.type === "lighthouse" || item.type === "mast") {
      drawSpecialObject(item);
    } else if (item.type === "npc") {
      drawCharacter(item, { shirt: "#e5a642", arm: "#ffffff", head: "#ffd5b0", scale: 0.85 });
      label(item.name, item.x, 62, item.z, "#ffeeb8");
    } else if (item.type === "player") {
      drawCharacter(item, { player: true, shirt: attackFlash > 0 ? "#82eaff" : "#3a7cff", scale: 1.12 });
      label("你", item.x, 70, item.z);
    } else {
      const bob = Math.sin(time * 0.004 + item.bob) * 3;
      drawCharacter({ ...item, y: bob }, { shirt: item.color, arm: "#1c2630", head: item.boss ? "#ffe56c" : "#ecfbff", scale: item.boss ? 1.45 : 0.9 });
      label(`${item.name} Lv.${item.level}`, item.x, item.boss ? 94 : 64, item.z, item === targetEnemy ? "#ffeb70" : "#ffffff");
    }
  });

  drawCrosshair();
}

function drawCrosshair() {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.82)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 9, height / 2);
  ctx.lineTo(width / 2 + 9, height / 2);
  ctx.moveTo(width / 2, height / 2 - 9);
  ctx.lineTo(width / 2, height / 2 + 9);
  ctx.stroke();
  ctx.restore();
}

function addLog(text) {
  const line = document.createElement("p");
  line.textContent = text;
  els.log.prepend(line);
  while (els.log.children.length > 5) els.log.lastElementChild.remove();
  els.centerNote.textContent = text;
  els.centerNote.style.opacity = "1";
  clearTimeout(addLog.hideTimer);
  addLog.hideTimer = setTimeout(() => {
    els.centerNote.style.opacity = "0";
  }, 1600);
}

function addExp(amount) {
  player.exp += amount;
  while (player.level < config.maxLevel && player.exp >= expForLevel(player.level)) {
    player.exp -= expForLevel(player.level);
    player.level += 1;
    player.statPoints += config.statPointsPerLevel;
    player.hp = maxHp();
    addLog(`等級提升！目前 Lv.${player.level}`);
  }
}

function grantDrop(drop) {
  if (config.cores[drop.id]) player.inventory.cores[drop.id] = true;
  if (config.weapons[drop.id]) player.inventory.weapons[drop.id] = true;
}

function registerQuestKill(enemyId) {
  const quest = config.quests[player.activeQuest];
  if (!quest || quest.target !== enemyId) return;
  player.questProgress[player.activeQuest] = Math.min((player.questProgress[player.activeQuest] || 0) + 1, quest.count);
  if (player.questProgress[player.activeQuest] >= quest.count) addLog(`任務可回報：${quest.name}`);
}

function currentQuestCandidate() {
  if (player.activeQuest) return player.activeQuest;
  return config.questOrder.find((questId) => {
    const quest = config.quests[questId];
    return !player.completedQuests[questId] && player.level >= quest.level;
  });
}

function handleQuest() {
  const questId = currentQuestCandidate();
  if (!questId) {
    addLog("目前沒有可接任務");
    return;
  }
  const quest = config.quests[questId];
  const progress = player.questProgress[questId] || 0;
  if (!player.activeQuest) {
    player.activeQuest = questId;
    player.questProgress[questId] = 0;
    addLog(`已接取任務：${quest.name}`);
  } else if (progress >= quest.count) {
    player.completedQuests[questId] = true;
    player.activeQuest = null;
    player.coins += quest.coins;
    addExp(quest.exp);
    addLog(`任務完成：${quest.name}`);
  } else {
    addLog(`任務進度：${progress}/${quest.count}`);
  }
  save();
  renderHud();
}

function defeatEnemy(enemy) {
  addExp(enemy.exp);
  registerQuestKill(enemy.id);
  if (enemy.drops) enemy.drops.forEach((drop) => {
    if (Math.random() <= drop.chance) grantDrop(drop);
  });
  addLog(`擊敗 ${enemy.name}，獲得 ${enemy.exp} 經驗`);
  enemy.alive = false;
  enemy.currentHp = enemy.maxHp;
  targetEnemy = null;
  setTimeout(() => {
    enemy.alive = true;
  }, enemy.boss ? 8500 : 3200);
}

function enemyCounterAttack(enemy) {
  const damage = Math.max(1, Math.floor(enemy.damage - effectiveStat("Agility") * 0.35));
  player.hp -= damage;
  if (player.hp <= 0) {
    player.hp = maxHp();
    player.x = -20;
    player.z = 20;
    addLog("你被擊倒了，已返回出生點");
  } else {
    addLog(`${enemy.name} 對你造成 ${damage} 傷害`);
  }
}

function attack(useCore = false) {
  if (!targetEnemy || !targetEnemy.alive) {
    addLog("請先鎖定敵人");
    return;
  }
  const distance = Math.hypot(player.x - targetEnemy.x, player.z - targetEnemy.z);
  if (distance > 42) {
    addLog("距離太遠，靠近一點再攻擊");
    return;
  }
  const now = Date.now();
  const core = config.cores[player.core] || config.cores.Tideheart;
  if (useCore && now < coreReadyAt) {
    addLog("神話核心冷卻中");
    return;
  }
  if (useCore) coreReadyAt = now + core.skill.cooldown * 1000;
  const damage = playerDamage(useCore ? core.skill.multiplier : 1);
  targetEnemy.currentHp -= damage;
  attackFlash = 0.24;
  addLog(`${useCore ? core.skill.name : "普通攻擊"} 造成 ${damage} 傷害`);
  if (targetEnemy.currentHp <= 0) defeatEnemy(targetEnemy);
  else enemyCounterAttack(targetEnemy);
  save();
  renderHud();
}

function renderInventory() {
  els.coreSelect.innerHTML = "";
  Object.entries(config.cores).forEach(([id, core]) => {
    if (player.inventory.cores[id]) els.coreSelect.add(new Option(core.name, id, id === player.core, id === player.core));
  });
  els.weaponSelect.innerHTML = "";
  Object.entries(config.weapons).forEach(([id, weapon]) => {
    if (player.inventory.weapons[id]) els.weaponSelect.add(new Option(`${weapon.name} Lv.${weapon.requiredLevel}`, id, id === player.weapon, id === player.weapon));
  });
}

function renderHud() {
  const expNeed = expForLevel(player.level);
  els.islandLine.textContent = "日耀環礁";
  els.hpBar.style.width = `${Math.max(0, player.hp / maxHp()) * 100}%`;
  els.hpText.textContent = `生命 ${Math.floor(player.hp)} / ${maxHp()}`;
  els.expBar.style.width = expNeed === Infinity ? "100%" : `${Math.min(100, (player.exp / expNeed) * 100)}%`;
  els.expText.textContent = expNeed === Infinity ? `等級 ${player.level} 經驗 MAX` : `等級 ${player.level} 經驗 ${player.exp} / ${expNeed}`;
  els.coins.textContent = `${player.coins} 金幣`;
  els.points.textContent = `${player.statPoints} 點數`;

  if (targetEnemy && targetEnemy.alive) {
    els.targetName.textContent = targetEnemy.name;
    els.targetLevel.textContent = `${targetEnemy.boss ? "Boss " : ""}Lv.${targetEnemy.level}`;
    els.enemyHp.style.width = `${Math.max(0, targetEnemy.currentHp / targetEnemy.maxHp) * 100}%`;
    els.enemyHpText.textContent = `${Math.max(0, Math.floor(targetEnemy.currentHp))} / ${targetEnemy.maxHp}`;
  } else {
    els.targetName.textContent = "尚未鎖定";
    els.targetLevel.textContent = "靠近敵人或點擊敵人";
    els.enemyHp.style.width = "0%";
    els.enemyHpText.textContent = "-";
  }

  const questId = currentQuestCandidate();
  if (!questId) {
    els.questText.textContent = "目前沒有可接任務";
  } else {
    const quest = config.quests[questId];
    const target = config.enemies.find((enemy) => enemy.id === quest.target);
    const progress = player.questProgress[questId] || 0;
    els.questText.textContent = player.activeQuest
      ? `${quest.name}：擊敗 ${target.name} ${progress}/${quest.count}`
      : `${quest.name}：與 ${quest.npc} 對話`;
  }
  renderInventory();
}

function updateTarget() {
  if (targetEnemy && targetEnemy.alive && Math.hypot(player.x - targetEnemy.x, player.z - targetEnemy.z) < 60) return;
  targetEnemy = null;
  let best = 54;
  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    const distance = Math.hypot(player.x - enemy.x, player.z - enemy.z);
    if (distance < best) {
      targetEnemy = enemy;
      best = distance;
    }
  });
}

function clickTarget(clientX, clientY) {
  let best = null;
  let bestDistance = 42;
  enemies.forEach((enemy) => {
    if (!enemy.alive) return;
    const p = project({ x: enemy.x, y: enemy.boss ? 80 : 55, z: enemy.z });
    const distance = Math.hypot(clientX - p.x, clientY - p.y);
    if (distance < bestDistance) {
      best = enemy;
      bestDistance = distance;
    }
  });
  if (best) {
    targetEnemy = best;
    addLog(`已鎖定 ${best.name}`);
    renderHud();
  }
}

function updateMovement(delta) {
  let dx = 0;
  let dz = 0;
  const forwardX = Math.sin(camera.yaw);
  const forwardZ = Math.cos(camera.yaw);
  const rightX = Math.cos(camera.yaw);
  const rightZ = -Math.sin(camera.yaw);
  if (keys.has("KeyW")) {
    dx += forwardX;
    dz += forwardZ;
  }
  if (keys.has("KeyS")) {
    dx -= forwardX;
    dz -= forwardZ;
  }
  if (keys.has("KeyD")) {
    dx += rightX;
    dz += rightZ;
  }
  if (keys.has("KeyA")) {
    dx -= rightX;
    dz -= rightZ;
  }
  const length = Math.hypot(dx, dz);
  if (length > 0) {
    const speed = 88 + effectiveStat("Agility") * 0.6;
    player.x += (dx / length) * speed * delta;
    player.z += (dz / length) * speed * delta;
  }

  player.vy -= 170 * delta;
  player.y += player.vy * delta;
  if (player.y < 0) {
    player.y = 0;
    player.vy = 0;
  }

  player.x = Math.max(-118, Math.min(190, player.x));
  player.z = Math.max(-84, Math.min(120, player.z));
}

function loop(time) {
  const delta = Math.min((time - lastTime) / 1000, 0.033);
  lastTime = time;
  updateMovement(delta);
  updateTarget();
  if (attackFlash > 0) attackFlash -= delta;
  drawScene(time);
  renderHud();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "Space" && player.y <= 0.1) player.vy = 92;
  if (event.code === "KeyE") attack(false);
  if (event.code === "KeyQ") attack(true);
});
window.addEventListener("keyup", (event) => keys.delete(event.code));

window.addEventListener("pointerdown", (event) => {
  mouse.down = true;
  mouse.startX = event.clientX;
  mouse.startY = event.clientY;
  mouse.lastX = event.clientX;
  mouse.lastY = event.clientY;
});

window.addEventListener("pointermove", (event) => {
  if (!mouse.down) return;
  camera.yaw -= (event.clientX - mouse.lastX) * 0.006;
  camera.pitch = Math.max(0.25, Math.min(1.05, camera.pitch + (event.clientY - mouse.lastY) * 0.003));
  mouse.lastX = event.clientX;
  mouse.lastY = event.clientY;
});

window.addEventListener("pointerup", (event) => {
  if (Math.hypot(event.clientX - mouse.startX, event.clientY - mouse.startY) < 6) {
    clickTarget(event.clientX, event.clientY);
  }
  mouse.down = false;
});

els.attackBtn.addEventListener("click", () => attack(false));
els.coreBtn.addEventListener("click", () => attack(true));
els.questBtn.addEventListener("click", handleQuest);
els.coreSelect.addEventListener("change", (event) => {
  player.core = event.target.value;
  player.hp = Math.min(player.hp, maxHp());
  addLog(`已裝備 ${config.cores[player.core].name}`);
  save();
});
els.weaponSelect.addEventListener("change", (event) => {
  const weapon = config.weapons[event.target.value];
  if (player.level < weapon.requiredLevel) {
    addLog(`需要 Lv.${weapon.requiredLevel}`);
    renderInventory();
    return;
  }
  player.weapon = event.target.value;
  addLog(`已裝備 ${weapon.name}`);
  save();
});

resize();
renderHud();
addLog("中文介面已載入，歡迎來到神話海域。");
setInterval(save, 20000);
window.addEventListener("beforeunload", save);
requestAnimationFrame(loop);
