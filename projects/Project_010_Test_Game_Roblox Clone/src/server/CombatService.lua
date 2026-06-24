local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage.Shared.GameConfig)

local CombatService = {}
CombatService.DataService = nil
CombatService.QuestService = nil

local lastHitByHumanoid = {}

local function getDamageForPlayer(player)
	local profile = CombatService.DataService.GetProfile(player)
	if not profile then
		return 10
	end

	local weapon = GameConfig.Weapons[profile.EquippedWeapon] or GameConfig.Weapons.Driftblade
	local core = GameConfig.MythicCores[profile.EquippedCore]
	local power = profile.Stats.Power or 0
	local focus = profile.Stats.Focus or 0
	local corePower = core and (core.Bonus.Power or 0) or 0

	return weapon.BaseDamage + (profile.Level * 1.5) + (power * 2.4) + (focus * 0.8) + corePower
end

function CombatService.TagHumanoid(humanoid, player)
	lastHitByHumanoid[humanoid] = {
		Player = player,
		Time = os.clock(),
	}
end

function CombatService.ResolveKiller(humanoid)
	local tag = lastHitByHumanoid[humanoid]
	if not tag or os.clock() - tag.Time > 15 then
		return nil
	end

	return tag.Player
end

function CombatService.BindEnemy(model, enemyConfig, isBoss)
	local humanoid = model:FindFirstChildOfClass("Humanoid")
	if not humanoid then
		return
	end

	humanoid.MaxHealth = enemyConfig.MaxHealth
	humanoid.Health = enemyConfig.MaxHealth

	humanoid.Died:Connect(function()
		local killer = CombatService.ResolveKiller(humanoid)
		if not killer or not Players:FindFirstChild(killer.Name) then
			return
		end

		CombatService.DataService.AddExperience(killer, enemyConfig.Experience)
		CombatService.QuestService.RegisterKill(killer, enemyConfig.Id)

		if isBoss then
			for _, drop in ipairs(enemyConfig.Drops or {}) do
				if math.random() <= drop.Chance then
					CombatService.DataService.GrantItem(killer, drop.ItemId)
				end
			end
		end
	end)
end

function CombatService.BindPlayer(player)
	player.CharacterAdded:Connect(function(character)
		local humanoid = character:WaitForChild("Humanoid", 10)
		if not humanoid then
			return
		end

		local profile = CombatService.DataService.GetProfile(player)
		if profile then
			humanoid.MaxHealth = 100 + profile.Level * 8 + (profile.Stats.Vitality or 0) * 14
			humanoid.Health = humanoid.MaxHealth
		end
	end)
end

function CombatService.PlayerBasicAttack(player, targetHumanoid)
	if typeof(targetHumanoid) ~= "Instance" or not targetHumanoid:IsA("Humanoid") then
		return false
	end

	if targetHumanoid.Health <= 0 then
		return false
	end

	CombatService.TagHumanoid(targetHumanoid, player)
	targetHumanoid:TakeDamage(getDamageForPlayer(player))
	return true
end

return CombatService
