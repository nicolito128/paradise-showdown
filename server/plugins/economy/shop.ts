import { Economy, IShop, IShopData } from './economy';

const commands: ChatCommands = {
	shop: {
		'': 'view',
		view(target, room, user, connection) {
			connection.send(Economy.shop.panel());
		},

		add(target, room, user) {
			if (!user.can('makeroom')) return false;

			let targets: string[] = target.split(',');
			if (targets.length < 3 || targets.length > 3) {
				return this.errorReply('Uso: /shop add [Item name], [Item description], [Item price]');
			}

			targets = targets.map(item => item.trim());
			targets.forEach(item => {
				if (!item || item === '') return this.errorReply('Rellena los campos faltantes.');
			});

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
	},
	shophelp: ['/shop - Visualiza la tienda del servidor',
	'/shop add [name], [desc], [price] - Añade un nuevo articulo a la tienda. Requiere: & ~',
	'/shop delete [name] - Elimina un articulo de la tienda. Requiere: & ~',
	'/shop logs - Mira los registros de acciones dejados en la tienda. Requiere: & ~'],

	buy(target, room, user) {
		const umoney: number = Economy.read(user.id);
		const shop: IShop = Economy.shop.get();
		const items: string[] = [];
		for (const item in shop) {
			items.push(shop[item].id);
		}

		let targets: string[] = target.split(',');
		targets = targets.map(item => item.trim());
		if (targets[0] === '') return this.errorReply('Es necesario que especifiques un articulo.');

		const item: IShopData | undefined = shop[toID(targets[0])];
		const options: string = targets[1];
		if (!items.includes(item?.id)) {
			return this.errorReply('Debes ingresar un articulo de la tienda.');
		}

		if (umoney < item.price) return this.errorReply('No tienes saldo suficiente para comprar este articulo.');
	},
};

export default commands;