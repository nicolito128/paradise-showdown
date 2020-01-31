
export const commands: ChatCommands = {
	economy(target, room, user) {
		this.sendReply(Database(user.id, 'users').put('money', 10));
	}
};