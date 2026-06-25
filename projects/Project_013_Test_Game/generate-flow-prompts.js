const fs = require("fs");
const path = require("path");

const cwd = process.cwd();
const batchDir = path.join(cwd, "image_to_video_batch");
const inputDir = path.join(batchDir, "input");
const promptDir = path.join(batchDir, "prompts");
const renamedDir = path.join(batchDir, "renamed_input");
const outputDir = path.join(batchDir, "output");
const manifestPath = path.join(batchDir, "flow_manifest.csv");
const sequencePath = path.join(batchDir, "film_sequence.csv");
const negativePath = path.join(batchDir, "negative_prompt.txt");

const imageExts = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const negative =
  "Do not change the character identity, face, outfit, weapon, hairstyle, or body proportions. No extra limbs, no extra fingers, no warped hands, no distorted eyes, no melting face, no broken weapon, no text, no subtitles, no logos, no watermark, no low quality, no sudden style change, no excessive camera shake.";

fs.rmSync(promptDir, { recursive: true, force: true });
fs.rmSync(renamedDir, { recursive: true, force: true });
fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(promptDir, { recursive: true });
fs.mkdirSync(renamedDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });

const items = [
  item("001", "fire_intro", "orange_firework_dancer", "Orange-haired festival dancer with fireworks", "Open on the spark burst, push toward her smile, let the ribbon and flame trails whip past the lens, then land on a bright hero pose."),
  item("002", "sakura_mystic", "purple_bunny_eagle", "Purple-haired rabbit-eared maiden with an eagle and a book under sakura blossoms", "Start with a close-up on the eagle and her fingertips, then a slow dolly to her face as petals drift and her hair moves softly in the spring wind."),
  item("003", "sakura_mystic", "purple_bird_reader", "Purple-haired sakura maiden holding a small bird", "Use a gentle orbit, let the bird flutter near her hand, and end on a calm close-up with pink petals crossing the frame."),
  item("004", "sakura_mystic", "purple_bird_closeup", "Purple-haired sakura maiden close-up with a bird", "Begin even tighter on her eyes and the bird, then pull back just enough for the petals and hair to breathe in the wind."),
  item("005", "study_scene", "kimono_reader", "Seated kimono girl reading in a quiet study", "Open with warm interior light on the book, slide to her profile, and keep the motion subtle, refined, and intimate."),
  item("006", "sword_hero", "orange_blade_heroine", "Orange-haired swordswoman standing in a dramatic pose", "Low-angle push-in on the blade, then a controlled camera rise to her face as sparks and cloth edges move around her."),
  item("007", "sword_hero", "golden_blade_heroine", "Golden-haired swordswoman in a temple-like courtyard", "Track along the sword line, let the kimono layers flutter, and end on a poised trailer-style stare."),
  item("008", "battle_dark", "violet_lightning_mage", "Purple battle maiden surrounded by lightning", "Hit with a fast cut to the lightning, then a shallow orbit and a bright energy pulse across the frame."),
  item("009", "sakura_mystic", "moonlit_sakura_maiden", "Purple sakura maiden in a moonlit garden", "Keep the camera slow and dreamy, with petals, lantern glow, and a soft glance into the distance."),
  item("010", "parasol_night", "night_parasol_duelist", "Dark parasol duelist under night lights", "Start on the umbrella silhouette, rotate around her shoulder, and cut on the shimmer of fabric and moonlight."),
  item("011", "forest_spirit", "green_energy_dancer", "Green magical dancer wrapped in luminous ribbons", "Use a graceful orbit, let the green ribbons spiral wider, and finish on a high-fantasy pose with glowing lines."),
  item("012", "forest_spirit", "green_cat_guardian", "Seated green cat guardian in a chamber", "Keep it grounded and calm: a small push toward her face, a blink from the cat, and a faint emerald pulse."),
  item("013", "forest_spirit", "green_rune_warrior", "Green rune warrior standing in a bright hall", "Let the runes flicker around her, then move in on the hands and armor details for a premium trailer close-up."),
  item("014", "forest_spirit", "green_sigil_warrior", "Green sigil warrior in a ceremonial stance", "Use a slow hero orbit and a soft glow pulse, with the camera settling on the face and the central sigil."),
  item("015", "study_scene", "green_desk_apprentice", "Green-clad apprentice seated at a desk with notes and books", "Hold the frame steady, drift through the papers and wall notes, and keep the motion quiet and thoughtful."),
  item("016", "water_magic", "blue_bubble_mage", "Blue water mage with bubbles and a floating orb", "Let the bubbles rise past the lens, then roll the camera gently as the orb swirls around her hands."),
  item("017", "night_city", "blue_city_balcony", "Blue-haired girl overlooking a glowing night city", "Open wide on the city lights, then cut to a soft close-up as her hair and ribbons move in the rooftop wind."),
  item("018", "ice_magic", "crystal_sword_dancer", "Blue crystal swordswoman in an icy field", "Track the sword arc with sparkling ice shards, then settle on a cold, cinematic face close-up."),
  item("019", "parasol_samurai", "blue_parasol_samurai", "Blue parasol samurai in a wet courtyard", "Rotate around the open parasol, let the reflections ripple below, and end on a clean duel-ready stance."),
  item("020", "dream_throne", "silver_cloud_dreamer", "Silver-haired dreamer resting on a white stone seat", "Start with a soft push through the haze, keep the motion floating and elegant, and end on a serene gaze."),
  item("021", "nature_maiden", "white_teal_maiden", "White-and-teal maiden with floral and gear-like ornaments", "Use a slow reveal from the ornaments to her face, with a bright, mythic glow and almost no camera shake."),
  item("022", "water_magic", "teal_water_circle", "Teal water mage kneeling inside a glowing circle", "Let the magic circle expand outward, then arc the camera around the ripple as droplets hover in the air."),
  item("023", "moon_queen", "blue_moon_queen", "Blue moon queen sitting beneath a full moon", "Push in from the moonlit sky, then hold on the regal posture and the cool blue aura surrounding her."),
  item("024", "winged_spirit", "blue_winged_beast", "Blue-haired maiden beside a white winged beast", "Cut from the beast's wing to her face, then keep a soft breathing motion and a gentle glow in the feathers."),
  item("025", "battle_dark", "violet_cat_eared_mage", "Purple cat-eared lightning mage", "Use a strong close-up on the outstretched hand, with lightning crawling across the frame and a final stare-down."),
  item("026", "parasol_night", "teal_parasol_guardian", "Teal parasol guardian standing near water and lanterns", "Orbit once under the parasol, let the light catch the silk, and finish on a mysterious stillness."),
  item("027", "male_hero", "moonlit_blond_swordsman", "Blond swordsman crouched under a moonlit sky", "Open with a low-angle blade reveal, then a quick rise to his eyes as the cloak snaps behind him."),
  item("028", "male_hero", "violet_sword_knight", "Blond knight with a violet sword on a rocky ridge", "Keep the camera tight on the weapon glow, then widen to a stormy hero silhouette."),
  item("029", "male_hero", "blue_armor_knight", "Blond knight in blue armor, close and intense", "Use a direct face-to-camera push, then a tiny turn of the shoulders for a strong poster-like finish."),
  item("030", "male_hero", "red_blade_knight", "Blond fighter with a red glowing sword", "Cut hard on the sword flare, then let the camera drift back through the red energy streaks."),
  item("031", "cute_pink_room", "pink_plush_girl", "Pink-haired girl on a pastel bed with a plush toy", "Keep it soft and playful: a small camera sway, a blink, and tiny floating sparkles."),
  item("032", "cute_pink_room", "pink_chamber_girl", "Pink-haired girl in a bright room with a tray and soft fabric", "Use a slow, affectionate push-in and let the ribbons and hair move just enough to feel alive."),
  item("033", "cute_pink_room", "sleepy_plush_girl", "Pink-haired girl reclining with plush toys", "Start with a gentle top-light and a slow inhale-like motion, then finish on a relaxed smile."),
  item("034", "playful_pink", "pink_drinking_girl", "Pink-haired girl holding a mug in a cozy interior", "Frame the mug first, then reveal her face with a slight tilt and a warm, intimate glow."),
  item("035", "festival_sword", "blonde_katana_girl", "Blonde festival swordswoman in orange and black", "Use a quick trailer swing and a controlled step forward, with cloth and hair snapping in the wind."),
  item("036", "festival_pose", "blonde_peace_sign", "Blonde girl posing in a red-orange festival outfit", "Hold the pose, add a subtle parallax move, and let the hanging cords and sleeves sway lightly."),
  item("037", "festival_pose", "orange_profile_dancer", "Orange-haired festival dancer in side profile", "Push from her profile to the background lights, then finish on a clean silhouette against the warm sky."),
  item("038", "indoor_pose", "pink_bottle_girl", "Pink-haired girl seated indoors with a small bottle", "Keep the motion restrained, with a soft push and a luxurious indoor light sweep across her face."),
  item("039", "sunset_pose", "orange_sunset_kimono", "Orange-haired kimono girl at sunset", "Orbit once around the warm sunset edge, then hold on her eyes as the background glows."),
  item("040", "duo_scene", "sunset_duo", "Two girls in a sunset scene with blossoms and festival colors", "Use a matching cut between their faces and the shared sunset glow, like a trailer split-beat."),
  item("041", "tea_room", "tea_table_noble", "Blonde noble lady at a tea table with macarons", "Open on the dessert plates, then glide to her calm smile and keep the shot refined and elegant."),
  item("042", "festival_dance", "gold_fan_dancer", "Brown-haired dancer with gold accents under lantern light", "Let the fabric sweep across the lens, then orbit her dance line and end on a theatrical freeze."),
  item("043", "sakura_duelist", "kimono_duelist", "Black-haired kimono duelist with a drawn blade", "Cut on the sword draw, let petals and sparks collide, and finish on a sharp diagonal hero pose."),
  item("044", "fire_action", "crimson_flame_queen", "Crimson flame battle queen advancing through sparks", "Push in through embers, then cut to her face and the red glow wrapping the armor."),
  item("045", "cozy_room", "tea_room_plush", "Cute pink-haired girl in a cozy room with tea and plush decor", "Use a warm, domestic push-in with tiny floating highlights and a calm ending."),
  item("046", "fireworks_rider", "golden_dragon_festival", "Blonde rider soaring through fireworks on a dragon-like mount", "Start with the fireworks burst, then sweep across the motion arc and end on a dazzling midair reveal."),
  item("047", "fox_tail", "golden_fox_swordswoman", "Blonde fox-tailed swordswoman in a festive street", "Use a side tracking shot, let the tail ribbons whip across frame, and hold the confident gaze."),
  item("048", "leap_white", "white_leap_heroine", "Blonde girl leaping forward against a white background", "Cut hard on the jump, with a clean silhouette and a bright, minimal trailer finish."),
  item("049", "sakura_miko", "pink_sakura_reader", "Pink-haired shrine maiden standing under cherry blossoms", "Open softly on the blossoms and her book, then let the camera breathe with the petal drift."),
  item("050", "sakura_miko", "pink_sakura_bento", "Pink-haired girl holding a box under blossoms", "Keep the motion delicate, with a small hand movement and a gentle sunset glow around her."),
  item("051", "void_action", "violet_void_spear", "Purple void spear assassin in a leaping attack pose", "Use a fast, high-impact push-in on the spear, then a low-angle jump cut and a purple burst."),
  item("052", "holy_light", "blonde_sunlit_oracle", "Blonde oracle in white and gold with radiant light", "Dolly slowly toward her face, keep the fabric glowing, and end on a divine, luminous close-up."),
  item("053", "forest_spirit", "black_haired_spirit_bird", "Black-haired forest spirit with a small bird on her finger", "Let the bird flutter near her hand, keep the camera delicate, and finish on a soft woodland smile."),
  item("054", "water_magic", "blue_bubble_recliner", "Blue water mage reclining in a sea of bubbles", "Float the camera through the bubbles, then drift into a dreamy portrait with circular motion."),
  item("055", "water_magic", "ocean_orb_mage", "Blue ocean mage surrounded by a ring of water", "Track the rotating water ring and keep the pose centered, elegant, and high-fantasy."),
  item("056", "royal_drama", "lavender_sunset_princess", "Lavender-haired princess seated in a sunset landscape", "Let the camera move like a slow music-video push, with hair, dress, and horizon light all breathing together."),
  item("057", "tea_room", "tea_table_noble_alt", "Blonde noble lady enjoying tea and pastries", "Start on the macarons and cup, then reveal her relaxed expression with a polished, luxurious glide."),
  item("058", "palace_knight", "blonde_palace_knight", "Blond palace knight in a grand marble hall", "Use a slow hero walk-in, then end on the armor details and a confident face close-up."),
  item("059", "blue_swordsman", "night_blue_swordsman", "Blue-haired swordsman in a cathedral-like hall", "Push from the glowing blade to the face, with blue light streaks and a restrained but powerful move."),
  item("060", "dark_swordsman", "black_red_swordsman", "Black-haired swordsman in a dark red coat", "Cut on the sword wind-up, then keep the motion tight, dangerous, and full of red-black energy."),
  item("061", "crimson_queen", "horned_crimson_queen", "Crimson horned queen on a throne", "Use a regal orbit and a candlelit glow, then land on a dark smile and a final flare of embers."),
  item("062", "sakura_reader", "pink_kimono_reader", "Pink-haired kimono girl reading under cherry blossoms", "Keep the shot graceful and quiet, with a slow page-turn and drifting petals bridging the frame."),
  item("063", "ice_magic", "white_ice_sorceress", "White-haired ice sorceress among crystal pillars", "Open on the crystal sparkle, then slowly rotate to her face as frost and blue light expand."),
  item("064", "fire_action", "red_autumn_gunner", "Red-haired autumn gunner with glasses and a confident stare", "Use a quick glasses-glint close-up, then a smooth pullback through the warm leaves and embers."),
  item("065", "forest_guardian", "green_cat_guardian", "Green armored forest guardian standing with a black cat", "Keep the cat and the guardian aligned in frame, with a light breeze and a soft emerald pulse."),
  item("066", "forest_cat", "emerald_cat_companion", "Green-haired seated girl holding a black cat indoors", "Use a warm window-light push-in, then let the cat blink and the jewelry catch the light."),
  item("067", "holy_light", "celestial_throne", "Blonde celestial queen seated in bright white architecture", "Dolly in through the sunlit columns and end on a serene divine portrait with flowing fabric."),
  item("068", "water_magic", "cat_eared_mermaid", "Pink-haired cat-eared sea idol floating above the ocean", "Use a light orbit and a splash-rise transition, with fish and bubbles circling her hand."),
  item("069", "parasol_samurai", "blue_parasol_samurai_alt", "Blue parasol samurai standing in a reflective courtyard", "Rotate under the umbrella and cut on the petals and wet reflections for a classic trailer feel."),
  item("070", "scholar_magic", "fox_eared_astronomer", "Fox-eared astronomer reading in a brass observatory", "Start on the telescope and pages, then drift to her face as stars and instruments glow softly."),
  item("071", "crystal_holy", "white_robed_maiden", "White-robed maiden in an airy crystal hall", "Keep the motion calm and ceremonial, with a slow reveal from the hanging ornaments to her face."),
  item("072", "water_action", "blue_neon_katana", "Blue twin-tail swordswoman in a neon rooftop scene", "Use a sharp slash cut and rain streaks, then let the blade trail and city lights streak behind her."),
  item("073", "void_empress", "violet_void_empress", "Violet empress standing beneath a giant sigil", "Push in from the glowing sigil to her face, with dark purple energy orbiting her body."),
  item("074", "lightning_kneel", "purple_lightning_kneel", "Purple lightning swordswoman kneeling in a storm of energy", "Open on the crackling floor, tilt up to her gaze, and finish on a thunderflash beat."),
  item("075", "blade_close", "violet_blade_closeup", "Purple-eyed swordswoman holding a glowing blade close to her face", "Use an extreme close-up on the lightning, rack focus to the eyes, and keep the shot intense and precise."),
  item("076", "parasol_night", "purple_parasol_guardian", "Purple parasol guardian under hanging wisteria at night", "Let the lanterns and petals move gently, then orbit once and end on a mysterious stillness."),
  item("077", "lantern_dance", "red_haired_lantern_dancer", "Red-haired dancer in a lantern-lit festival hall", "Track the dance turn, let the fabrics arc across the frame, and cut on the strongest pose."),
  item("078", "sunset_ocean", "orange_ocean_dancer", "Orange-haired dancer leaping above ocean spray at sunset", "Use a low-angle motion sweep and a burst of water spray, ending on a radiant sky silhouette."),
  item("079", "cloud_maiden", "white_cloud_maiden", "White-clad maiden moving through bright cloud-like light", "Keep the movement airy and ceremonial, with a slow orbit and a heavenly glow."),
  item("080", "sakura_reader_alt", "pink_sakura_reader_alt", "Pink-haired reader under cherry blossoms, holding a scroll or book", "Keep the camera soft, let the blossoms sweep by, and end on a tranquil, storybook close-up."),
  item("081", "void_action", "void_spear_assassin_alt", "Purple-black spear assassin leaping through a cathedral of light", "Hit the attack beat with a hard cut, then follow the weapon trail and the whipping ribbons."),
  item("082", "forest_spirit", "black_haired_spirit_bird_alt", "Black-haired spirit maiden with a bird in a riverside grove", "Use a small orbit around her hand and the bird, with water sparkle and leaf drift."),
  item("083", "night_magic", "purple_cat_ear_twilight", "Purple cat-eared girl in a twilight street", "Push through the purple haze, let the hair and sleeves move in the night wind, and finish on a quiet stare."),
  item("084", "steampunk_gold", "gold_gear_duchess", "Gold-and-black duchess under a mechanical parasol", "Rotate around the parasol, catch the gear reflections, and end on a confident aristocratic pose."),
  item("085", "steampunk_gold", "gold_carpet_lady", "Gold parasol lady walking a red carpet in a grand hall", "Use a runway-style backward tracking shot and let the brass details glow around her."),
  item("086", "steampunk_gold", "sunlit_parasol_queen", "Blonde fashion queen with a parasol in bright city light", "Hold the glamorous pose, then move the camera slightly around her hair, hat, and parasol."),
  item("087", "ice_magic", "crystal_snow_sorceress", "White-haired sorceress framed by glowing crystals", "Let frost bloom at the edges, then do a slow hero orbit and a final bright ice pulse."),
  item("088", "ice_closeup", "silver_crystal_closeup", "Silver-haired crystal mage in a close-up portrait", "Keep the shot intimate, with a gentle turn of the shoulder and subtle crystalline shimmer."),
  item("089", "dessert_palace", "dessert_alchemist", "Blonde dessert palace alchemist surrounded by cakes and vials", "Start on the sweets, drift to her relaxed pose, and keep the motion rich and luxurious."),
  item("090", "water_dancer", "red_aqua_dancer", "Red-haired aqua dancer in a glowing underwater chamber", "Use circular water motion and a slow ballet-like orbit, ending on a radiant full-body frame."),
  item("091", "tea_noble", "tea_noble_alt", "Blonde noble lady at a tea table with macarons", "Open on the dessert and cup, then ease into a polished close-up with calm elegance."),
  item("092", "festival_dancer_gold", "gold_fan_dancer", "Brown-haired dancer in a gold festival outfit", "Let the fan or fabric sweep become the transition, then freeze on a theatrical final pose."),
  item("093", "sakura_duelist", "katana_sakura_duelist", "Black-haired sakura duelist drawing her sword", "Cut on the draw, let the petals and sparks cross the lens, and end on a sharp blade line."),
  item("094", "fire_action", "crimson_flame_queen", "Crimson flame queen surrounded by sparks and firelight", "Push through the embers, keep the hair and cape flowing, and finish on a fierce end-card pose."),
];

const sequenceOrder = [
  "001","002","003","004","005","006","007","008","009","010","011","012","013","014","015","016",
  "017","018","019","020","021","022","023","024","025","026","027","028","029","030","031","032",
  "033","034","035","036","037","038","039","040","041","042","043","044","045","046","047","048",
  "049","050","051","052","053","054","055","056","057","058","059","060","061","062","063","064",
  "065","066","067","068","069","070","071","072","073","074","075","076","077","078","079","080",
  "081","082","083","084","085","086","087","088","089","090","091","092","093","094",
];

const sharedPrompt =
  "Google Flow image-to-video. Keep the uploaded image as the visual anchor and preserve the character identity, costume, pose, palette, and composition. Cinematic fantasy trailer quality, premium anime-realistic rendering, high dynamic range, shallow depth of field, smooth natural motion.";

const manifestRows = ["id,category,slug,renamed_image,prompt_file,suggested_output"];
for (const entry of items) {
  const source = findInput(entry.id);
  const ext = path.extname(source).toLowerCase();
  const renamedName = `${entry.id}_${entry.slug}${ext}`;
  const categoryDir = path.join(renamedDir, entry.category);
  fs.mkdirSync(categoryDir, { recursive: true });
  fs.copyFileSync(path.join(inputDir, source), path.join(categoryDir, renamedName));

  const promptText = [
    `IMAGE: renamed_input/${entry.category}/${renamedName}`,
    `SUGGESTED_OUTPUT: output/${entry.id}_${entry.slug}.mp4`,
    "DURATION: 8 seconds or the closest Flow setting under 8 seconds",
    "",
    "PROMPT:",
    `${sharedPrompt} ${entry.subject}. ${entry.motion} Use a trailer rhythm: opening detail, character close-up, then a clean final hero frame.`,
    "",
    "NEGATIVE PROMPT:",
    negative,
    "",
    "FLOW NOTES:",
    "Use image-to-video with a single reference frame. Prefer medium motion, stable anatomy, no identity drift, and no sudden style changes.",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(promptDir, `${entry.id}_${entry.slug}.txt`), promptText, "utf8");

  manifestRows.push(
    [
      entry.id,
      entry.category,
      entry.slug,
      `renamed_input/${entry.category}/${renamedName}`,
      `prompts/${entry.id}_${entry.slug}.txt`,
      `output/${entry.id}_${entry.slug}.mp4`,
    ]
      .map(csv)
      .join(",")
  );
}

const sequenceRows = ["sequence,id,category,transition_after,cut_note"];
sequenceOrder.forEach((id, index) => {
  const entry = items.find((item) => item.id === id);
  if (!entry) return;
  sequenceRows.push(
    [
      String(index + 1).padStart(2, "0"),
      entry.id,
      entry.category,
      transitionFor(index),
      cutNoteFor(entry.category),
    ]
      .map(csv)
      .join(",")
  );
});

fs.writeFileSync(manifestPath, manifestRows.join("\n") + "\n", "utf8");
fs.writeFileSync(sequencePath, sequenceRows.join("\n") + "\n", "utf8");
fs.writeFileSync(negativePath, negative + "\n", "utf8");

console.log(`Generated ${items.length} prompts, renamed images, and sequence files.`);

function item(id, category, slug, subject, motion) {
  return { id, category, slug, subject, motion };
}

function transitionFor(index) {
  if (index === 0) return "fade_in";
  if (index < 18) return "soft_dissolve";
  if (index < 40) return "match_cut";
  if (index < 64) return "rhythmic_cut";
  if (index < 82) return "tighten_cut";
  return "hard_cut";
}

function cutNoteFor(category) {
  const notes = {
    fire_intro: "Cut on spark flare.",
    sakura_mystic: "Cut on petals or gaze.",
    study_scene: "Cut on book turn or hand movement.",
    sword_hero: "Cut on blade motion.",
    battle_dark: "Cut on lightning or weapon flash.",
    forest_spirit: "Cut on leaf drift or animal gaze.",
    water_magic: "Cut on water circle or bubble burst.",
    night_city: "Cut on skyline glow.",
    ice_magic: "Cut on crystal shimmer.",
    parasol_samurai: "Cut on parasol rotation.",
    dream_throne: "Cut on a soft breath or gaze.",
    nature_maiden: "Cut on ornament motion.",
    moon_queen: "Cut on moonlight or posture shift.",
    winged_spirit: "Cut on wing movement.",
    parasol_night: "Cut on umbrella silhouette.",
    male_hero: "Cut on shoulder turn or weapon edge.",
    cute_pink_room: "Cut on a blink or plush detail.",
    playful_pink: "Cut on a cup or smile.",
    festival_sword: "Cut on the sword line.",
    festival_pose: "Cut on fabric sweep.",
    indoor_pose: "Cut on the light sweep.",
    sunset_pose: "Cut on sunset color change.",
    duo_scene: "Cut on the shared color beat.",
    tea_room: "Cut on the teacup or pastry.",
    festival_dance: "Cut on fan or fabric sweep.",
    sakura_duelist: "Cut on the draw slash.",
    fire_action: "Cut on ember impact.",
    cozy_room: "Cut on a calm glance.",
    fireworks_rider: "Cut on the fireworks burst.",
    fox_tail: "Cut on tail ribbon motion.",
    leap_white: "Cut on the jump apex.",
    sakura_miko: "Cut on petals or page turn.",
    void_action: "Cut on spear flash.",
    holy_light: "Cut on radiant glow.",
    water_action: "Cut on blade trail or splash.",
    royal_drama: "Cut on a regal pose.",
    palace_knight: "Cut on armor glint.",
    blue_swordsman: "Cut on the blue blade edge.",
    dark_swordsman: "Cut on red-black energy.",
    crimson_queen: "Cut on embers or throne glow.",
    sakura_reader: "Cut on the page turn.",
    crystal_holy: "Cut on crystal shimmer.",
    forest_guardian: "Cut on cat movement.",
    forest_cat: "Cut on the cat blink.",
    cat_eared_mermaid: "Cut on water splash.",
    scholar_magic: "Cut on telescope or page detail.",
    white_robed_maiden: "Cut on hanging ornaments.",
    void_empress: "Cut on sigil pulse.",
    lightning_kneel: "Cut on thunder flash.",
    blade_close: "Cut on the blade glint.",
    lantern_dance: "Cut on lantern swing.",
    sunset_ocean: "Cut on water spray.",
    cloud_maiden: "Cut on the cloud glow.",
    sakura_reader_alt: "Cut on petals or gaze.",
    steampunk_gold: "Cut on gear rotation.",
    ice_closeup: "Cut on frost sparkle.",
    dessert_palace: "Cut on sweets or glass shine.",
    water_dancer: "Cut on the water ring.",
    tea_noble: "Cut on the cup or macarons.",
    festival_dancer_gold: "Cut on the fan sweep.",
    orange_blade_heroine: "Cut on spark flare.",
    golden_blade_heroine: "Cut on sword glint.",
    violet_lightning_mage: "Cut on lightning surge.",
    moonlit_swordsman: "Cut on blade edge.",
  };
  return notes[category] || "Cut on motion or light change.";
}

function csv(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function findInput(id) {
  const match = fs.readdirSync(inputDir).find((file) => file.startsWith(id + "."));
  if (!match) throw new Error(`Missing input image for ${id}`);
  return match;
}
