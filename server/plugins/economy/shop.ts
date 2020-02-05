function getShop() {
	return `>view-shop\n|init|html\n|title|[Shop] Tienda\n` + `|pagehtml| this is a shop!`;
}

const commands: ChatCommands = {
	shop: {
		'': 'view',
		view(target, room, user, connection) {
			connection.send(getShop());
		}
	}
}

export default commands;