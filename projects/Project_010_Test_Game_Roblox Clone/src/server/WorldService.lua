local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local Workspace = game:GetService("Workspace")

local GameConfig = require(ReplicatedStorage.Shared.GameConfig)

local WorldService = {}
WorldService.CombatService = nil
WorldService.QuestService = nil

local worldFolder = Instance.new("Folder")
worldFolder.Name = "MythicSeasWorld"
worldFolder.Parent = Workspace

local enemiesFolder = Instance.new("Folder")
enemiesFolder.Name = "Enemies"
enemiesFolder.Parent = worldFolder

local npcsFolder = Instance.new("Folder")
npcsFolder.Name = "QuestNpcs"
npcsFolder.Parent = worldFolder

local function makePart(name, size, position, color)
	local part = Instance.new("Part")
	part.Name = name
	part.Anchored = true
	part.Size = size
	part.Position = position
	part.Color = color
	part.Material = Enum.Material.SmoothPlastic
	part.Parent = worldFolder
	return part
end

local function createBillboard(model, text)
	local head = model:FindFirstChild("Head")
	if not head then
		return
	end

	local billboard = Instance.new("BillboardGui")
	billboard.Name = "Nameplate"
	billboard.Size = UDim2.fromOffset(220, 54)
	billboard.StudsOffset = Vector3.new(0, 3, 0)
	billboard.AlwaysOnTop = true
	billboard.Parent = head

	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 1
	label.Size = UDim2.fromScale(1, 1)
	label.Font = Enum.Font.GothamBold
	label.TextColor3 = Color3.new(1, 1, 1)
	label.TextStrokeTransparency = 0.45
	label.TextScaled = true
	label.Text = text
	label.Parent = billboard
end

local function createEnemyModel(config, isBoss)
	local model = Instance.new("Model")
	model.Name = config.Id

	local root = Instance.new("Part")
	root.Name = "HumanoidRootPart"
	root.Size = isBoss and Vector3.new(5, 5, 5) or Vector3.new(3, 3, 3)
	root.Position = config.Spawn
	root.Color = isBoss and Color3.fromRGB(180, 65, 255) or Color3.fromRGB(55, 165, 220)
	root.Material = isBoss and Enum.Material.Neon or Enum.Material.SmoothPlastic
	root.Parent = model

	local clickDetector = Instance.new("ClickDetector")
	clickDetector.MaxActivationDistance = 32
	clickDetector.Parent = root

	local head = Instance.new("Part")
	head.Name = "Head"
	head.Size = isBoss and Vector3.new(4, 2, 4) or Vector3.new(2.5, 1.5, 2.5)
	head.Position = config.Spawn + Vector3.new(0, root.Size.Y / 2 + 1.2, 0)
	head.Color = Color3.fromRGB(245, 245, 255)
	head.Parent = model

	local weld = Instance.new("WeldConstraint")
	weld.Part0 = root
	weld.Part1 = head
	weld.Parent = root

	local humanoid = Instance.new("Humanoid")
	humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None
	humanoid.Parent = model

	model.PrimaryPart = root
	model.Parent = enemiesFolder

	createBillboard(model, `{config.DisplayName} Lv.{config.Level}`)
	WorldService.CombatService.BindEnemy(model, config, isBoss)
	clickDetector.MouseClick:Connect(function(player)
		WorldService.CombatService.PlayerBasicAttack(player, humanoid)
	end)

	humanoid.Died:Connect(function()
		task.delay(isBoss and config.RespawnSeconds or 18, function()
			if model.Parent then
				model:Destroy()
			end
			createEnemyModel(config, isBoss)
		end)
	end)

	return model
end

local function createQuestNpc(npcName, island, index)
	local model = Instance.new("Model")
	model.Name = npcName

	local position = island.Spawn + Vector3.new(-55 + index * 18, 4, -105)

	local root = Instance.new("Part")
	root.Name = "HumanoidRootPart"
	root.Size = Vector3.new(3, 4, 3)
	root.Position = position
	root.Anchored = true
	root.Color = Color3.fromRGB(235, 195, 96)
	root.Material = Enum.Material.SmoothPlastic
	root.Parent = model

	local head = Instance.new("Part")
	head.Name = "Head"
	head.Size = Vector3.new(2.4, 1.6, 2.4)
	head.Position = position + Vector3.new(0, 3, 0)
	head.Anchored = true
	head.Color = Color3.fromRGB(255, 234, 204)
	head.Parent = model

	local humanoid = Instance.new("Humanoid")
	humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None
	humanoid.Parent = model

	local clickDetector = Instance.new("ClickDetector")
	clickDetector.MaxActivationDistance = 28
	clickDetector.Parent = root

	model.PrimaryPart = root
	model.Parent = npcsFolder

	createBillboard(model, `{npcName}\n任務 NPC`)

	clickDetector.MouseClick:Connect(function(player)
		if not WorldService.QuestService then
			return
		end

		for _, questId in ipairs(GameConfig.QuestOrder) do
			local quest = GameConfig.Quests[questId]
			if quest.NpcName == npcName then
				local success = WorldService.QuestService.StartQuest(player, quest.Id)
				if success then
					break
				end
			end
		end
	end)
end

function WorldService.BuildIslands()
	for _, island in ipairs(GameConfig.Islands) do
		local base = makePart(
			island.Id,
			Vector3.new(300, 8, 300),
			island.Spawn - Vector3.new(0, 6, 0),
			Color3.fromRGB(69, 148, 96)
		)
		base:SetAttribute("DisplayName", island.DisplayName)
		base:SetAttribute("RequiredLevel", island.RequiredLevel)

		makePart(
			`{island.Id}_dock`,
			Vector3.new(80, 5, 26),
			island.Spawn + Vector3.new(-120, -2, 0),
			Color3.fromRGB(120, 82, 48)
		)
	end
end

function WorldService.SpawnEnemies()
	for _, monster in ipairs(GameConfig.Monsters) do
		createEnemyModel(monster, false)
	end

	for _, boss in ipairs(GameConfig.Bosses) do
		createEnemyModel(boss, true)
	end
end

function WorldService.SpawnQuestNpcs()
	local created = {}

	for _, island in ipairs(GameConfig.Islands) do
		local index = 0
		for _, questId in ipairs(GameConfig.QuestOrder) do
			local quest = GameConfig.Quests[questId]
			local key = `{quest.NpcName}_{island.Id}`
			if quest.IslandId == island.Id and not created[key] then
				index += 1
				created[key] = true
				createQuestNpc(quest.NpcName, island, index)
			end
		end
	end
end

function WorldService.CreateTestSpawnBindable()
	local bindable = Instance.new("BindableEvent")
	bindable.Name = "TestSpawn"
	bindable.Event:Connect(function()
		enemiesFolder:ClearAllChildren()
		WorldService.SpawnEnemies()
	end)
	bindable.Parent = ServerScriptService.Server
end

function WorldService.Start()
	WorldService.BuildIslands()
	WorldService.SpawnQuestNpcs()
	WorldService.SpawnEnemies()
	WorldService.CreateTestSpawnBindable()
end

return WorldService
