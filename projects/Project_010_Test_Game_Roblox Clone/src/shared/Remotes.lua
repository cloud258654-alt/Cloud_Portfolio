local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Remotes = {}

local folder = ReplicatedStorage:FindFirstChild("MythicSeasRemotes")
if not folder and RunService:IsServer() then
	folder = Instance.new("Folder")
	folder.Name = "MythicSeasRemotes"
	folder.Parent = ReplicatedStorage
elseif not folder then
	folder = ReplicatedStorage:WaitForChild("MythicSeasRemotes")
end

local function getRemoteEvent(name)
	local remote = folder:FindFirstChild(name)
	if not remote and RunService:IsServer() then
		remote = Instance.new("RemoteEvent")
		remote.Name = name
		remote.Parent = folder
	elseif not remote then
		remote = folder:WaitForChild(name)
	end

	return remote
end

local function getRemoteFunction(name)
	local remote = folder:FindFirstChild(name)
	if not remote and RunService:IsServer() then
		remote = Instance.new("RemoteFunction")
		remote.Name = name
		remote.Parent = folder
	elseif not remote then
		remote = folder:WaitForChild(name)
	end

	return remote
end

Remotes.PlayerDataUpdated = getRemoteEvent("PlayerDataUpdated")
Remotes.Notification = getRemoteEvent("Notification")
Remotes.RequestQuest = getRemoteFunction("RequestQuest")
Remotes.SpendStatPoint = getRemoteFunction("SpendStatPoint")
Remotes.EquipCore = getRemoteFunction("EquipCore")
Remotes.EquipWeapon = getRemoteFunction("EquipWeapon")
Remotes.GetProfile = getRemoteFunction("GetProfile")

return Remotes
