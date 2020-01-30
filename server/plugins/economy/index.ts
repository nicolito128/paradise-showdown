
export const commands: ChatCommands = {
	economy(target, room, user) {
		this.sendReply(Profiles[user.id].money)
	}
};