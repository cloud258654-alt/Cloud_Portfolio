local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GameConfig = require(ReplicatedStorage.Shared.GameConfig)
local Remotes = require(ReplicatedStorage.Shared.Remotes)

local QuestService = {}
QuestService.DataService = nil

local function getQuest(questId)
	return questId and GameConfig.Quests[questId] or nil
end

local function completeQuest(player, profile, quest)
	profile.Quests.Completed[quest.Id] = true
	profile.Quests.ActiveQuestId = nil
	profile.Quests.Progress[quest.Id] = nil

	QuestService.DataService.AddExperience(player, quest.RewardExperience)
	QuestService.DataService.AddCoins(player, quest.RewardCoins)

	if quest.NextQuestId then
		local nextQuest = GameConfig.Quests[quest.NextQuestId]
		if nextQuest then
			for _, island in ipairs(GameConfig.Islands) do
				if island.UnlocksAtQuest == quest.Id then
					QuestService.DataService.UnlockIsland(player, island.Id)
				end
			end
		end
	end

	Remotes.Notification:FireClient(player, `任務完成：{quest.DisplayName}`)
end

function QuestService.StartQuest(player, questId)
	local profile = QuestService.DataService.GetProfile(player)
	local quest = getQuest(questId)
	if not profile or not quest then
		return false, "任務不存在"
	end

	if profile.Level < quest.RequiredLevel then
		return false, "等級不足"
	end

	if not profile.UnlockedIslands[quest.IslandId] then
		return false, "尚未解鎖此島嶼"
	end

	if profile.Quests.Completed[questId] then
		return false, "任務已完成"
	end

	profile.Quests.ActiveQuestId = questId
	profile.Quests.Progress[questId] = profile.Quests.Progress[questId] or 0
	QuestService.DataService.MarkDirty(player)

	return true, QuestService.DataService.GetPublicProfile(player)
end

function QuestService.RegisterKill(player, targetId)
	local profile = QuestService.DataService.GetProfile(player)
	if not profile then
		return
	end

	local quest = getQuest(profile.Quests.ActiveQuestId)
	if not quest or quest.TargetId ~= targetId then
		return
	end

	local progress = (profile.Quests.Progress[quest.Id] or 0) + 1
	profile.Quests.Progress[quest.Id] = math.min(progress, quest.TargetCount)

	if profile.Quests.Progress[quest.Id] >= quest.TargetCount then
		completeQuest(player, profile, quest)
	else
		QuestService.DataService.MarkDirty(player)
	end
end

Remotes.RequestQuest.OnServerInvoke = function(player, questId)
	return QuestService.StartQuest(player, questId)
end

return QuestService
