local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage.Shared.GameConfig)
local Remotes = require(ReplicatedStorage.Shared.Remotes)

local DataService = {}

local store = DataStoreService:GetDataStore(GameConfig.DataStoreName)
local profiles = {}
local dirtyProfiles = {}

local function experienceForLevel(level)
	if level >= GameConfig.MaxLevel then
		return math.huge
	end

	return math.floor(80 + (level ^ 2.18) * 22)
end

local function makeDefaultProfile()
	local stats = {}
	for _, statName in ipairs(GameConfig.Stats) do
		stats[statName] = 0
	end

	return {
		Level = 1,
		Experience = 0,
		Coins = 0,
		StatPoints = GameConfig.StartingStatPoints,
		Stats = stats,
		EquippedCore = "Tideheart",
		EquippedWeapon = "Driftblade",
		Inventory = {
			Cores = { Tideheart = true },
			Weapons = { Driftblade = true },
		},
		Quests = {
			ActiveQuestId = nil,
			Progress = {},
			Completed = {},
		},
		UnlockedIslands = {
			sunspire_atoll = true,
		},
		Pvp = {
			Reputation = 0,
			Kills = 0,
			Defeats = 0,
		},
		Awakening = {
			Unlocked = false,
			Stage = 0,
		},
	}
end

local function reconcileProfile(profile)
	local defaultProfile = makeDefaultProfile()

	for key, value in pairs(defaultProfile) do
		if profile[key] == nil then
			profile[key] = value
		end
	end

	for _, statName in ipairs(GameConfig.Stats) do
		if profile.Stats[statName] == nil then
			profile.Stats[statName] = 0
		end
	end

	profile.Level = math.clamp(profile.Level, 1, GameConfig.MaxLevel)
	return profile
end

local function cloneForClient(profile)
	local copy = table.clone(profile)
	copy.Stats = table.clone(profile.Stats)
	copy.Inventory = {
		Cores = table.clone(profile.Inventory.Cores),
		Weapons = table.clone(profile.Inventory.Weapons),
	}
	copy.Quests = {
		ActiveQuestId = profile.Quests.ActiveQuestId,
		Progress = table.clone(profile.Quests.Progress),
		Completed = table.clone(profile.Quests.Completed),
	}
	copy.UnlockedIslands = table.clone(profile.UnlockedIslands)
	copy.Pvp = table.clone(profile.Pvp)
	copy.Awakening = table.clone(profile.Awakening)
	copy.NextLevelExperience = experienceForLevel(profile.Level)

	return copy
end

function DataService.GetProfile(player)
	return profiles[player]
end

function DataService.GetPublicProfile(player)
	local profile = profiles[player]
	if not profile then
		return nil
	end

	return cloneForClient(profile)
end

function DataService.MarkDirty(player)
	if profiles[player] then
		dirtyProfiles[player] = true
		Remotes.PlayerDataUpdated:FireClient(player, cloneForClient(profiles[player]))
	end
end

function DataService.Load(player)
	local key = `player_{player.UserId}`
	local success, result = pcall(function()
		return store:GetAsync(key)
	end)

	local profile = makeDefaultProfile()
	if success and type(result) == "table" then
		profile = reconcileProfile(result)
	elseif not success then
		warn(`Failed to load Mythic Seas data for {player.Name}: {result}`)
	end

	profiles[player] = profile
	DataService.MarkDirty(player)
	return profile
end

function DataService.Save(player, force)
	local profile = profiles[player]
	if not profile then
		return false
	end

	if not force and not dirtyProfiles[player] then
		return true
	end

	local key = `player_{player.UserId}`
	local success, result = pcall(function()
		store:SetAsync(key, profile)
	end)

	if success then
		dirtyProfiles[player] = nil
	else
		warn(`Failed to save Mythic Seas data for {player.Name}: {result}`)
	end

	return success
end

function DataService.Release(player)
	DataService.Save(player, true)
	profiles[player] = nil
	dirtyProfiles[player] = nil
end

function DataService.AddExperience(player, amount)
	local profile = profiles[player]
	if not profile or amount <= 0 then
		return
	end

	if profile.Level >= GameConfig.MaxLevel then
		profile.Experience = 0
		DataService.MarkDirty(player)
		return
	end

	profile.Experience += amount
	local leveled = false

	while profile.Level < GameConfig.MaxLevel do
		local required = experienceForLevel(profile.Level)
		if profile.Experience < required then
			break
		end

		profile.Experience -= required
		profile.Level += 1
		profile.StatPoints += GameConfig.StatPointsPerLevel
		leveled = true
	end

	if profile.Level >= GameConfig.MaxLevel then
		profile.Experience = 0
	end

	if leveled then
		Remotes.Notification:FireClient(player, `等級提升！目前 Lv.{profile.Level}`)
	end

	DataService.MarkDirty(player)
end

function DataService.AddCoins(player, amount)
	local profile = profiles[player]
	if not profile or amount <= 0 then
		return
	end

	profile.Coins += amount
	DataService.MarkDirty(player)
end

function DataService.UnlockIsland(player, islandId)
	local profile = profiles[player]
	if not profile or profile.UnlockedIslands[islandId] then
		return
	end

	profile.UnlockedIslands[islandId] = true
	Remotes.Notification:FireClient(player, "新島嶼已解鎖！")
	DataService.MarkDirty(player)
end

function DataService.GrantItem(player, itemId)
	local profile = profiles[player]
	if not profile then
		return false
	end

	if GameConfig.MythicCores[itemId] then
		profile.Inventory.Cores[itemId] = true
	elseif GameConfig.Weapons[itemId] then
		profile.Inventory.Weapons[itemId] = true
	else
		return false
	end

	Remotes.Notification:FireClient(player, `獲得物品：{itemId}`)
	DataService.MarkDirty(player)
	return true
end

Remotes.SpendStatPoint.OnServerInvoke = function(player, statName)
	local profile = profiles[player]
	if not profile or profile.StatPoints <= 0 or profile.Stats[statName] == nil then
		return false, "無法分配屬性點"
	end

	profile.StatPoints -= 1
	profile.Stats[statName] += 1
	DataService.MarkDirty(player)
	return true, cloneForClient(profile)
end

Remotes.EquipCore.OnServerInvoke = function(player, coreId)
	local profile = profiles[player]
	if not profile or not profile.Inventory.Cores[coreId] or not GameConfig.MythicCores[coreId] then
		return false, "尚未擁有此 Mythic Core"
	end

	profile.EquippedCore = coreId
	DataService.MarkDirty(player)
	return true, cloneForClient(profile)
end

Remotes.EquipWeapon.OnServerInvoke = function(player, weaponId)
	local profile = profiles[player]
	local weapon = GameConfig.Weapons[weaponId]
	if not profile or not weapon or not profile.Inventory.Weapons[weaponId] then
		return false, "尚未擁有此武器"
	end

	if profile.Level < weapon.RequiredLevel then
		return false, "等級不足"
	end

	profile.EquippedWeapon = weaponId
	DataService.MarkDirty(player)
	return true, cloneForClient(profile)
end

Remotes.GetProfile.OnServerInvoke = function(player)
	local profile = profiles[player]
	if not profile then
		return nil
	end

	return cloneForClient(profile)
end

task.spawn(function()
	while true do
		task.wait(GameConfig.AutoSaveInterval)
		for _, player in ipairs(Players:GetPlayers()) do
			DataService.Save(player, false)
		end
	end
end)

return DataService
