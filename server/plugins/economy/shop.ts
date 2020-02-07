import * as fs from 'fs';

function createWindows(): string {
	let page: string = `>view-shop\n|init|html\n|title|[Shop] Tienda\n`;

	let html: string = `|pagehtml|<div class="pad"><p>${getShop()}</p></div>`;

	const pagehtml = page + html;
	return pagehtml;
}

function getShop(): string {
	const data = JSON.parse(fs.readFileSync(__dirname + '/../../../server/plugins/economy/data/shop.json'));

	let shop: string = '<div style="margin: auto; text-align: center;">';
	shop += `<h1 style="font-weight: bold;">Tienda de <span style="color: #56C043">${Config.serverName}</span></h1>`;
	shop += '<table border="1" style="margin: auto; text-align: center; border-radius: 5px; border-color: #39772E;"></thead><tr><th style="padding: 3.5px;">Item</th> <th style="padding: 3.5px;">Description</th> <th style="padding: 3.5px;">Price</th> <th style="padding: 3.5px;">Buy</th></tr></thead>'
	shop += '<tbody>'
	for (let i in data) {
		let item: any = data[i];
		shop += '<tr>';
		shop += `<td style="padding: 4px;">${item.name}</td>`;
		shop += `<td>${item.desc}</td>`
		shop += `<td style="padding: 4px; color: #f4821a; font-weight: bold;">${item.price}</td>`;
		shop += `<td style="padding: 4px;"><button class="button"><em class="fa fa-shopping-cart fa-lg" aria-hidden="true"></em></button></td>`;
		shop += '</tr>';
	}
	shop += '</tbody></table></div>'

	return shop;
}

const commands: ChatCommands = {
	shop: {
		'': 'view',
		view(target, room, user, connection) {
			connection.send(createWindows());
		},

		add(target, room, user) {
			if (!this.can('makeroom')) return false;

			let targets = target.split(',');
			for(let u in targets) targets[u] = targets[u].trim();
			if (targets.length < 3 || targets.length > 3) return this.errorReply('Uso: /shop add [Item name], [Item description], [Item price]'); 
			for(let u in targets) {
				if (!targets[u] || targets[u] === '') return this.errorReply('Rellena los campos faltantes.');
			}

			const id = toID(targets[0]);
			const name = targets[0];
			const desc = targets[1];
			const price = parseInt(targets[2]);

			if (isNaN(price)) return this.errorReply('[Item price] debe ser un valor numerico.');
			if (Math.sign(price) === -1 || Math.sign(price) === 0) return this.errorReply('El [Item price] especificado debe ser un número mayor a 0.');
		}
	},

	buy(target, room, user) {}
}

export default commands;