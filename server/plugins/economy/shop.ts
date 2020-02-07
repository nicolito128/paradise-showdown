import Economy from './economy';

function createWindows(): string {
	let page: string = `>view-shop\n|init|html\n|title|[Shop] Tienda\n`;

	let html: string = `|pagehtml|<div class="pad"><p>${getShop()}</p></div>`;

	const pagehtml: string = page + html;
	return pagehtml;
}

function getShop(): string {
	const data: object = Economy.shop.get();

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
			if (!user.can('makeroom')) return false;

			let targets: string[] = target.split(',');
			for(let u in targets) targets[u] = targets[u].trim();
			if (targets.length < 3 || targets.length > 3) return this.errorReply('Uso: /shop add [Item name], [Item description], [Item price]'); 
			for(let u in targets) {
				if (!targets[u] || targets[u] === '') return this.errorReply('Rellena los campos faltantes.');
			}

			const id: string = toID(targets[0]);
			const name: string = targets[0];
			const desc: string = targets[1];
			const price: number = parseInt(targets[2]);

			if (isNaN(price)) return this.errorReply('[Item price] debe ser un valor numerico.');
			if (Math.sign(price) === -1 || Math.sign(price) === 0) return this.errorReply('El [Item price] especificado debe ser un número mayor a 0.');

			Economy.shop.set(id, {id, name, desc, price});
			this.sendReply(`|raw| Añadiste correctamente el articulo <b>${name}</b> a la tienda del servidor.`);
			Economy.log('shopadmin').write(`${user.name} añadió el articulo ${name} a la tienda`);
		},

		delete(target, room, user) {
			if (!user.can('makeroom')) return false;

			target = target.trim();
			if (!target || target === '') return this.errorReply('Debes especificar un objeto de la tienda.');
			target = toID(target);

			const shop: object = Economy.shop.get();
			if (typeof shop[target] === 'undefined') return this.errorReply('Debes especificar un objeto incluído en la tienda.');

			this.sendReply(`|raw| Eliminaste correctamente el articulo ${shop[target].name} de la tienda del servidor.`);
			Economy.log('shopadmin').write(`${user.name} eliminó el articulo ${shop[target].name} de la tienda`);
			Economy.shop.delete(target);
		},

		logs(target, room, user) {
			if (!user.can('makeroom')) return false;

			const data: string = Economy.log('shopadmin').get();
			user.popup(data);
		}
	},
	shophelp: ['/shop - Visualiza la tienda del servidor',
	'/shop add [name], [desc], [price] - Añade un nuevo articulo a la tienda. Requiere: & ~',
	'/shop delete [name] - Elimina un articulo de la tienda. Requiere: & ~',
	'/shop logs - Mira los registros de acciones dejados en la tienda. Requiere: & ~'],

	buy(target, room, user) {}
}

export default commands;