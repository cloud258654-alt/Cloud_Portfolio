local Players = game:GetService("Players")

local DataService = require(script.Parent.DataService)
local QuestService = require(script.Parent.QuestService)
local CombatService = require(script.Parent.CombatService)
local WorldService = require(script.Parent.WorldService)

QuestService.DataService = DataService
CombatService.DataService = DataService
CombatService.QuestService = QuestService
WorldService.CombatService = CombatService
WorldService.QuestService = QuestService

Players.PlayerAdded:Connect(function(player)
	DataService.Load(player)
	CombatService.BindPlayer(player)
end)

Players.PlayerRemoving:Connect(function(player)
	DataService.Release(player)
end)

game:BindToClose(function()
	for _, player in ipairs(Players:GetPlayers()) do
		DataService.Save(player, true)
	end
end)

WorldService.Start()
