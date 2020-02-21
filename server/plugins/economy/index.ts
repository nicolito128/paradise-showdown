import { Economy } from './economy';
import shop from './shop';

export const commands: ChatCommands = {
	'!pd': true,
	wallet: 'pd',
	money: 'pd',
	pd(target, room, user) {
		if (!this.runBroadcast()) return false;
		target = target.trim();
		if (!target || target === '') {
			target = user.id;
		} else {
			target = toID(target);
		}

		this.sendReplyBox(`Ahorros de ${Users.getExact(target).name}: <b>${Economy.read(target)} ${Config.moneyName}</b>`);
	},
	pdhelp: ['/pd [user] - Mira los ahorros de un usuario'],

	givepd: 'givemoney',
	givebucks: 'givemoney',
	givemoney(target, room, user) {
		if (!this.can('makeroom')) return false;

		let targets: string[] = target.split(',');
		if (targets.length < 2 || targets.length > 2) return this.parse("/help givemoney");

		targets = targets.map(item => item.trim());
		if (!targets[0] || targets[0] === '') return this.errorReply('Especifica un usuario.');
		if (!targets[1] || targets[1] === '') return this.errorReply('Especifica una cantidad de dinero.');

		const u: any = Users.getExact(targets[0]);
		if (u === null) return false;

		const userid: string = u.id;
		const amount: number = parseInt(targets[1]);
		if (isNaN(amount)) return this.errorReply("'amount' debe ser un valor numerico.");

		Economy.write(userid, amount);
		Economy.log('moneylog').write(`${user.name} ingresó ${amount} ${Config.moneyName} en los ahorros de ${u.name}`);
		this.sendReply(`|raw| Ingresaste <b>${amount} ${Config.moneyName}</b> en los ahorros de ${u.name}.`)
	},
	givemoneyhelp: ['/givemoney [user], [amount] - Ingresa una cantidad de dinero (amount) en los ahorros de un usuario.'],

	takepd: 'takemoney',
	takebucks: 'takemoney',
	takemoney(target, room, user) {
		if (!this.can('makeroom')) return false;

		let targets: string[] = target.split(',');
		if (targets.length < 2 || targets.length > 2) return this.parse("/help takemoney");

		targets = targets.map(item => item.trim());
		if (!targets[0] || targets[0] === '') return this.errorReply('Especifica un usuario.');
		if (!targets[1] || targets[1] === '') return this.errorReply('Especifica una cantidad de dinero.');

		const u: any = Users.getExact(targets[0]);
		if (u === null) return false;

		const userid: string = u.id;
		const amount: number = parseInt(targets[1]);
		if (isNaN(amount)) return this.errorReply("'amount' debe ser un valor numerico.");

		Economy.write(userid, -amount);
		Economy.log('moneylog').write(`${user.name} extrajo ${amount} ${Config.moneyName} de los ahorros de ${u.name}`);
		this.sendReply(`|raw| Extrajiste <b>${amount} ${Config.moneyName}</b> de los ahorros de ${u.name}.`);
	},
	takemoneyhelp: ['/takemoney [user], [amount] - Extrae una cantidad de dinero (amount) de los ahorros de un usuario.'],

	moneylog(target, room, user) {
		if (!this.can('gdeclare')) return false;

		const data: string = Economy.log('moneylog').get();
		if (data === null) return this.errorReply('No hay registros para mostrar.');

		user.popup(data);
	},
	moneyloghelp: ['/moneylog - Mira los registros dejados por autoridades al usar comandos de economía.'],
};

Object.assign(commands, shop);