import { Economy, IShop, IShopData, IReceipt } from './economy';

const commands: ChatCommands = {
	shop: {
		'': 'view',
		view(target, room, user, connection) {
			connection.send(Economy.shop.panel());
		},

		add(target, room, user) {
			if (!user.can('makeroom')) return false;

			let targets: string[] = target.split(',');
			if (targets.length < 3) {
				return this.errorReply('Uso: /shop add [Item name], [Item description], [Item price]');
			}

			targets = targets.map(item => item.trim());
			targets.forEach(item => {
				if (!item || item === '') return this.errorReply('Rellena los campos faltantes.');
			});

			if (!targets[3] || targets[3] === '' || targets[3] === undefined) {
				targets[3] = 'false';
			} else if (targets[3] !== 'true') {
				return this.errorReply('Si se requiere información adicional para este objeto especifica el parametro como "true"');
			}

			const id: string = toID(targets[0]);
			const name: string = targets[0];
			const desc: string = targets[1];
			const price: number = parseInt(targets[2]);

			let options: boolean;
			if (targets[3] === 'false') {
				options = false;
			} else {
				options = true;
			}

			if (isNaN(price)) return this.errorReply('[Item price] debe ser un valor numerico.');
			if (Math.sign(price) === -1 || Math.sign(price) === 0) return this.errorReply('El [Item price] especificado debe ser un número mayor a 0.');

			Economy.shop.set(id, {id, name, desc, price, options});
			this.sendReply(`|raw| Añadiste correctamente el articulo <b>${name}</b> a la tienda del servidor.`);
			Economy.log('shopadmin').write(`${user.name} añadió el articulo ${name} a la tienda`);
		},

		delete(target, room, user) {
			if (!user.can('makeroom')) return false;

			target = target.trim();
			if (!target || target === '') return this.errorReply('Debes especificar un objeto de la tienda.');
			target = toID(target);

			const shop: object = Economy.shop.get();
			if (typeof shop[target] === 'undefined') {
				return this.errorReply('Debes especificar un objeto incluído en la tienda.');
			}

			this.sendReply(`|raw| Eliminaste correctamente el articulo ${shop[target].name} de la tienda del servidor.`);
			Economy.log('shopadmin').write(`${user.name} eliminó el articulo ${shop[target].name} de la tienda`);
			Economy.shop.delete(target);
		},

		logs(target, room, user) {
			if (!user.can('makeroom')) return false;

			const data: string = Economy.log('shopadmin').get();
			user.popup(data);
		},

		admin(target, room, user, connection) {
			if (!user.can('makeroom')) return false;

			const data: string = Economy.shop.adminPanel();
			connection.send(data);
		},
	},
	shophelp: ['/shop - Visualiza la tienda del servidor',
	'/shop add [name], [desc], [price] - Añade un nuevo articulo a la tienda. Requiere: & ~',
	'/shop delete [name] - Elimina un articulo de la tienda. Requiere: & ~',
	'/shop logs - Mira los registros de acciones dejados en la tienda. Requiere: & ~'],

	buy(target, room, user) {
		const umoney: number = Economy.read(user.id);
		const shop: IShop = Economy.shop.get();

		let targets: string[] = target.split(',');
		targets = targets.map(item => item.trim());
		if (!targets[0] || targets[0] === '') return this.errorReply('Es necesario que especifiques un articulo.');
		if (!targets[1] || targets[1] === '' || targets[1] === undefined) targets[1] = '';

		const item: IShopData | undefined = shop[toID(targets[0])];
		const options: string = targets[1];

		if (item === undefined) return this.errorReply('Ingresa un articulo de la tienda.');
		if (umoney < item.price) return this.errorReply('No tienes saldo suficiente para comprar este articulo.');

		const buyStatus: boolean | null = Economy.shop.buy(user.name, item, options);
		if (buyStatus === null) {
			return this.errorReply(`'${item.name}' requiere parametros adicionales que no has especificado.`);
		}

		this.sendReply(`|raw| ¡Compraste exsitosamente el articulo <b>${item.name}</b>! Espera a que un staff revise tu compra. Puedes revisar tus compras con el comando /receipts`);
		Economy.write(user.id, -item.price);
	},
	buyhelp: ['/buy [item], [options]optional - Compra un articulo de la tienda.'],

	receipts(target, room, user) {
		const receipts: IReceipt[] | null = Economy.receipts(user.id);

		if (receipts === null) return this.errorReply('No tienes ningún recibo de compra.');
		if (!this.runBroadcast()) return false;

		let box: string = '<table style="text-align: center; margin: auto;" border="1">';
		box += '<thead><tr> <th style="padding: 2px;">Date</th> <th style="padding: 2px;">Item</th> <th style="padding: 2px;">Options</th> </tr></thead>';
		box += '<tbody>';
		receipts.forEach(receipt => {
			box += '<tr>';
			box += `<td style="padding: 5px; font-style: italic;">${receipt.date}</td>`;
			box += `<td style="padding: 5px; font-weight: bold;">${receipt.name}</td>`;
			box += `<td style="padding: 5px;">${receipt.options}</td>`;
			box += '</tr>';
		});
		box += '</tbody>';
		box += '</table>';

		this.sendReplyBox(box);
	},
	receiptshelp: ['/receipts - Mira tus recibos de compra de la tienda.'],
};

export default commands;