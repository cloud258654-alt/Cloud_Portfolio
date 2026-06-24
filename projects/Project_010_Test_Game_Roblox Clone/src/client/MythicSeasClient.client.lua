local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local GameConfig = require(ReplicatedStorage.Shared.GameConfig)
local Remotes = require(ReplicatedStorage.Shared.Remotes)

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local currentProfile = nil

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "MythicSeasHud"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

local root = Instance.new("Frame")
root.Name = "Root"
root.AnchorPoint = Vector2.new(0, 1)
root.Position = UDim2.new(0, 18, 1, -18)
root.Size = UDim2.fromOffset(430, 230)
root.BackgroundColor3 = Color3.fromRGB(18, 22, 32)
root.BackgroundTransparency = 0.08
root.BorderSizePixel = 0
root.Parent = screenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 8)
corner.Parent = root

local padding = Instance.new("UIPadding")
padding.PaddingTop = UDim.new(0, 14)
padding.PaddingBottom = UDim.new(0, 14)
padding.PaddingLeft = UDim.new(0, 14)
padding.PaddingRight = UDim.new(0, 14)
padding.Parent = root

local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1
title.Size = UDim2.new(1, 0, 0, 30)
title.Font = Enum.Font.GothamBold
title.TextColor3 = Color3.fromRGB(255, 255, 255)
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextScaled = true
title.Text = "Mythic Seas"
title.Parent = root

local levelLabel = Instance.new("TextLabel")
levelLabel.BackgroundTransparency = 1
levelLabel.Position = UDim2.fromOffset(0, 38)
levelLabel.Size = UDim2.new(1, 0, 0, 24)
levelLabel.Font = Enum.Font.GothamSemibold
levelLabel.TextColor3 = Color3.fromRGB(215, 230, 255)
levelLabel.TextXAlignment = Enum.TextXAlignment.Left
levelLabel.TextScaled = true
levelLabel.Parent = root

local expBack = Instance.new("Frame")
expBack.Position = UDim2.fromOffset(0, 70)
expBack.Size = UDim2.new(1, 0, 0, 14)
expBack.BackgroundColor3 = Color3.fromRGB(42, 49, 68)
expBack.BorderSizePixel = 0
expBack.Parent = root

local expCorner = Instance.new("UICorner")
expCorner.CornerRadius = UDim.new(0, 7)
expCorner.Parent = expBack

local expFill = Instance.new("Frame")
expFill.Size = UDim2.fromScale(0, 1)
expFill.BackgroundColor3 = Color3.fromRGB(79, 190, 255)
expFill.BorderSizePixel = 0
expFill.Parent = expBack

local expFillCorner = Instance.new("UICorner")
expFillCorner.CornerRadius = UDim.new(0, 7)
expFillCorner.Parent = expFill

local coreLabel = Instance.new("TextLabel")
coreLabel.BackgroundTransparency = 1
coreLabel.Position = UDim2.fromOffset(0, 94)
coreLabel.Size = UDim2.new(1, 0, 0, 24)
coreLabel.Font = Enum.Font.Gotham
coreLabel.TextColor3 = Color3.fromRGB(235, 235, 245)
coreLabel.TextXAlignment = Enum.TextXAlignment.Left
coreLabel.TextScaled = true
coreLabel.Parent = root

local questLabel = Instance.new("TextLabel")
questLabel.BackgroundTransparency = 1
questLabel.Position = UDim2.fromOffset(0, 124)
questLabel.Size = UDim2.new(1, 0, 0, 44)
questLabel.Font = Enum.Font.Gotham
questLabel.TextColor3 = Color3.fromRGB(235, 235, 245)
questLabel.TextXAlignment = Enum.TextXAlignment.Left
questLabel.TextYAlignment = Enum.TextYAlignment.Top
questLabel.TextWrapped = true
questLabel.TextScaled = true
questLabel.Parent = root

local buttons = Instance.new("Frame")
buttons.BackgroundTransparency = 1
buttons.Position = UDim2.fromOffset(0, 178)
buttons.Size = UDim2.new(1, 0, 0, 34)
buttons.Parent = root

local buttonLayout = Instance.new("UIListLayout")
buttonLayout.FillDirection = Enum.FillDirection.Horizontal
buttonLayout.Padding = UDim.new(0, 8)
buttonLayout.Parent = buttons

local function makeButton(text)
	local button = Instance.new("TextButton")
	button.Size = UDim2.new(0, 126, 1, 0)
	button.BackgroundColor3 = Color3.fromRGB(58, 88, 132)
	button.BorderSizePixel = 0
	button.Font = Enum.Font.GothamBold
	button.TextColor3 = Color3.new(1, 1, 1)
	button.TextScaled = true
	button.Text = text
	button.Parent = buttons

	local buttonCorner = Instance.new("UICorner")
	buttonCorner.CornerRadius = UDim.new(0, 6)
	buttonCorner.Parent = button

	return button
end

local questButton = makeButton("接任務")
local powerButton = makeButton("+ Power")
local vitalityButton = makeButton("+ Vitality")

local notification = Instance.new("TextLabel")
notification.AnchorPoint = Vector2.new(0.5, 0)
notification.Position = UDim2.new(0.5, 0, 0, 24)
notification.Size = UDim2.fromOffset(460, 42)
notification.BackgroundColor3 = Color3.fromRGB(18, 22, 32)
notification.BackgroundTransparency = 0.15
notification.BorderSizePixel = 0
notification.Font = Enum.Font.GothamBold
notification.TextColor3 = Color3.new(1, 1, 1)
notification.TextScaled = true
notification.Visible = false
notification.Parent = screenGui

local notificationCorner = Instance.new("UICorner")
notificationCorner.CornerRadius = UDim.new(0, 8)
notificationCorner.Parent = notification

local function getAvailableQuest(profile)
	if profile.Quests.ActiveQuestId then
		return GameConfig.Quests[profile.Quests.ActiveQuestId]
	end

	for _, questId in ipairs(GameConfig.QuestOrder) do
		local quest = GameConfig.Quests[questId]
		if not profile.Quests.Completed[quest.Id]
			and profile.Level >= quest.RequiredLevel
			and profile.UnlockedIslands[quest.IslandId] then
			return quest
		end
	end

	return nil
end

local function redraw(profile)
	currentProfile = profile
	if not profile then
		return
	end

	local required = profile.NextLevelExperience
	local expText = required == math.huge and "MAX" or `{profile.Experience}/{required}`
	local expRatio = required == math.huge and 1 or math.clamp(profile.Experience / required, 0, 1)
	local core = GameConfig.MythicCores[profile.EquippedCore]
	local weapon = GameConfig.Weapons[profile.EquippedWeapon]
	local quest = getAvailableQuest(profile)

	levelLabel.Text = `Lv.{profile.Level}  EXP {expText}  Coins {profile.Coins}  Points {profile.StatPoints}`
	coreLabel.Text = `Core: {core and core.DisplayName or "None"}    Weapon: {weapon and weapon.DisplayName or "None"}`

	if quest and profile.Quests.ActiveQuestId == quest.Id then
		local progress = profile.Quests.Progress[quest.Id] or 0
		questLabel.Text = `任務：{quest.DisplayName}\n進度：{progress}/{quest.TargetCount}`
	elseif quest then
		questLabel.Text = `可接任務：{quest.DisplayName} - {quest.NpcName}`
	else
		questLabel.Text = "目前沒有可接任務"
	end

	TweenService:Create(expFill, TweenInfo.new(0.2), {
		Size = UDim2.fromScale(expRatio, 1),
	}):Play()
end

local function showNotification(text)
	notification.Text = text
	notification.Visible = true
	notification.TextTransparency = 0
	notification.BackgroundTransparency = 0.15

	task.delay(2.2, function()
		local tween = TweenService:Create(notification, TweenInfo.new(0.35), {
			TextTransparency = 1,
			BackgroundTransparency = 1,
		})
		tween:Play()
		tween.Completed:Wait()
		notification.Visible = false
	end)
end

questButton.Activated:Connect(function()
	if not currentProfile then
		return
	end

	local quest = getAvailableQuest(currentProfile)
	if not quest then
		showNotification("目前沒有可接任務")
		return
	end

	local success, result = Remotes.RequestQuest:InvokeServer(quest.Id)
	if success then
		redraw(result)
	else
		showNotification(result)
	end
end)

powerButton.Activated:Connect(function()
	local success, result = Remotes.SpendStatPoint:InvokeServer("Power")
	if success then
		redraw(result)
	else
		showNotification(result)
	end
end)

vitalityButton.Activated:Connect(function()
	local success, result = Remotes.SpendStatPoint:InvokeServer("Vitality")
	if success then
		redraw(result)
	else
		showNotification(result)
	end
end)

Remotes.PlayerDataUpdated.OnClientEvent:Connect(redraw)
Remotes.Notification.OnClientEvent:Connect(showNotification)

task.spawn(function()
	local profile = Remotes.GetProfile:InvokeServer()
	if profile then
		redraw(profile)
	end
end)
