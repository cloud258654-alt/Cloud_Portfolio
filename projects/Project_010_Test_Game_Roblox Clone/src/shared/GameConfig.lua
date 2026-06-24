local GameConfig = {}

GameConfig.MaxLevel = 100
GameConfig.StartingStatPoints = 0
GameConfig.StatPointsPerLevel = 3
GameConfig.AutoSaveInterval = 60
GameConfig.DataStoreName = "MythicSeas_MVP_v1"

GameConfig.Stats = {
	"Power",
	"Vitality",
	"Focus",
	"Agility",
}

GameConfig.Islands = {
	{
		Id = "sunspire_atoll",
		Name = "Sunspire Atoll",
		DisplayName = "日耀環礁",
		RequiredLevel = 1,
		Spawn = Vector3.new(0, 8, 0),
		UnlocksAtQuest = nil,
	},
	{
		Id = "moonfall_keys",
		Name = "Moonfall Keys",
		DisplayName = "月落群島",
		RequiredLevel = 25,
		Spawn = Vector3.new(620, 12, 80),
		UnlocksAtQuest = "sunspire_guardian",
	},
	{
		Id = "stormglass_reach",
		Name = "Stormglass Reach",
		DisplayName = "暴璃海岬",
		RequiredLevel = 60,
		Spawn = Vector3.new(1280, 16, -140),
		UnlocksAtQuest = "moonfall_echo",
	},
}

GameConfig.MythicCores = {
	Tideheart = {
		Id = "Tideheart",
		DisplayName = "潮心核心",
		Rarity = "Rare",
		Bonus = { Focus = 4, Vitality = 2 },
		Skill = {
			Name = "Surging Crest",
			DisplayName = "湧潮斬",
			DamageMultiplier = 1.45,
			Cooldown = 6,
		},
	},
	Ashflare = {
		Id = "Ashflare",
		DisplayName = "燼焰核心",
		Rarity = "Epic",
		Bonus = { Power = 5 },
		Skill = {
			Name = "Cinder Spiral",
			DisplayName = "燼旋爆",
			DamageMultiplier = 1.7,
			Cooldown = 8,
		},
	},
	Skylumen = {
		Id = "Skylumen",
		DisplayName = "天輝核心",
		Rarity = "Legendary",
		Bonus = { Agility = 4, Focus = 3 },
		Skill = {
			Name = "Lumen Step",
			DisplayName = "輝步連擊",
			DamageMultiplier = 1.6,
			Cooldown = 7,
		},
	},
}

GameConfig.Weapons = {
	Driftblade = {
		Id = "Driftblade",
		DisplayName = "漂浪刃",
		Type = "Blade",
		RequiredLevel = 1,
		BaseDamage = 12,
		AttackSpeed = 0.8,
	},
	Reefsplitter = {
		Id = "Reefsplitter",
		DisplayName = "裂礁重刃",
		Type = "Greatblade",
		RequiredLevel = 25,
		BaseDamage = 34,
		AttackSpeed = 1.15,
	},
	StormglassSaber = {
		Id = "StormglassSaber",
		DisplayName = "暴璃軍刀",
		Type = "Saber",
		RequiredLevel = 60,
		BaseDamage = 78,
		AttackSpeed = 0.95,
	},
}

GameConfig.Monsters = {
	{
		Id = "reef_wisp",
		DisplayName = "礁光幽靈",
		IslandId = "sunspire_atoll",
		Level = 1,
		MaxHealth = 55,
		Damage = 6,
		Experience = 18,
		Spawn = Vector3.new(70, 10, 15),
	},
	{
		Id = "shellback_raider",
		DisplayName = "甲背掠奪者",
		IslandId = "sunspire_atoll",
		Level = 8,
		MaxHealth = 135,
		Damage = 13,
		Experience = 45,
		Spawn = Vector3.new(120, 10, -70),
	},
	{
		Id = "moon_reef_duelist",
		DisplayName = "月礁決鬥者",
		IslandId = "moonfall_keys",
		Level = 28,
		MaxHealth = 420,
		Damage = 38,
		Experience = 160,
		Spawn = Vector3.new(700, 14, 125),
	},
	{
		Id = "glassfin_marauder",
		DisplayName = "璃鰭劫掠者",
		IslandId = "moonfall_keys",
		Level = 42,
		MaxHealth = 720,
		Damage = 58,
		Experience = 260,
		Spawn = Vector3.new(540, 14, 160),
	},
	{
		Id = "stormbound_keeper",
		DisplayName = "縛雷守衛",
		IslandId = "stormglass_reach",
		Level = 68,
		MaxHealth = 1450,
		Damage = 110,
		Experience = 640,
		Spawn = Vector3.new(1360, 18, -90),
	},
}

GameConfig.Bosses = {
	{
		Id = "brine_crowned_colossus",
		DisplayName = "鹽冠巨像",
		IslandId = "sunspire_atoll",
		Level = 18,
		MaxHealth = 1800,
		Damage = 42,
		Experience = 900,
		RespawnSeconds = 180,
		Spawn = Vector3.new(210, 16, 40),
		Drops = {
			{ ItemId = "Reefsplitter", Chance = 0.18 },
			{ ItemId = "Tideheart", Chance = 0.08 },
		},
	},
	{
		Id = "moonlit_seraph",
		DisplayName = "月曜戰魂",
		IslandId = "moonfall_keys",
		Level = 50,
		MaxHealth = 7400,
		Damage = 125,
		Experience = 4200,
		RespawnSeconds = 300,
		Spawn = Vector3.new(810, 20, 240),
		Drops = {
			{ ItemId = "Ashflare", Chance = 0.1 },
			{ ItemId = "StormglassSaber", Chance = 0.14 },
		},
	},
	{
		Id = "tempest_archon",
		DisplayName = "暴風執政者",
		IslandId = "stormglass_reach",
		Level = 88,
		MaxHealth = 18000,
		Damage = 240,
		Experience = 9800,
		RespawnSeconds = 420,
		Spawn = Vector3.new(1480, 26, -220),
		Drops = {
			{ ItemId = "Skylumen", Chance = 0.08 },
			{ ItemId = "StormglassSaber", Chance = 0.2 },
		},
	},
}

GameConfig.Quests = {
	reef_first_light = {
		Id = "reef_first_light",
		DisplayName = "初升礁光",
		NpcName = "Captain Lyra",
		IslandId = "sunspire_atoll",
		RequiredLevel = 1,
		TargetId = "reef_wisp",
		TargetCount = 5,
		RewardExperience = 160,
		RewardCoins = 120,
		NextQuestId = "sunspire_guardian",
	},
	sunspire_guardian = {
		Id = "sunspire_guardian",
		DisplayName = "日耀守門戰",
		NpcName = "Captain Lyra",
		IslandId = "sunspire_atoll",
		RequiredLevel = 12,
		TargetId = "brine_crowned_colossus",
		TargetCount = 1,
		RewardExperience = 1100,
		RewardCoins = 550,
		NextQuestId = "moonfall_echo",
	},
	moonfall_echo = {
		Id = "moonfall_echo",
		DisplayName = "月落迴聲",
		NpcName = "Archivist Nao",
		IslandId = "moonfall_keys",
		RequiredLevel = 28,
		TargetId = "moon_reef_duelist",
		TargetCount = 8,
		RewardExperience = 2100,
		RewardCoins = 900,
		NextQuestId = "stormglass_oath",
	},
	stormglass_oath = {
		Id = "stormglass_oath",
		DisplayName = "暴璃誓約",
		NpcName = "Warden Sera",
		IslandId = "stormglass_reach",
		RequiredLevel = 60,
		TargetId = "stormbound_keeper",
		TargetCount = 10,
		RewardExperience = 7400,
		RewardCoins = 2200,
		NextQuestId = nil,
	},
}

GameConfig.QuestOrder = {
	"reef_first_light",
	"sunspire_guardian",
	"moonfall_echo",
	"stormglass_oath",
}

return GameConfig
