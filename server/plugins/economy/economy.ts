/**
 * Economy system
 *
 * @author n128
 */
'use strict';

interface ICallback { (user: string, money: number): void }

type Money = number | null;

import * as fs from 'fs';

const Economy = Object.create(null);
const SHOP_ROOT = __dirname + '/../../../server/plugins/economy/data/shop.json';

function read(user: string, callback?: ICallback): Money {
	if (!user || user === '' || user === undefined) return null;
	const userid: string = toID(user);
	const money: Money = Database(userid, `users/${userid}`).get('money');

	if (callback) callback(userid, money);
	return money;
}

function write(user: string, amount: number, callback?: ICallback): Money {
	if (!user || user === '' || user === undefined) return null;
	if (typeof amount === 'undefined') return null;
	if (isNaN(amount)) return null;

	const userid: string = toID(user);
	const money: Money = Database(userid, `users/${userid}`).put('money', amount);

	if (callback) callback(userid, money);
	return money;
}

function log(name: string): object {
	const id: string = toID(name);
	const ROOT_LOG: string = __dirname + '/../../../logs/economy'

	const existsRoot: boolean = fs.existsSync(ROOT_LOG);
	if (!existsRoot) fs.mkdirSync(ROOT_LOG);

	const existsFile: boolean = fs.existsSync(ROOT_LOG + `/${id}.txt`);
	if (!existsFile) fs.writeFileSync(ROOT_LOG + `/${id}.txt`, "");

	const ROOT: string = ROOT_LOG + `/${id}.txt`;

	// local methods
	const write = (message: string): void => {
		const data: string = fs.readFileSync(ROOT, {encoding: 'utf8'});
		fs.writeFileSync(ROOT, data + `[${new Date().toUTCString()}] ${message} \n`);
	};

	const get = (): string | null => {
		const files: string[] = fs.readdirSync(ROOT_LOG);
		if (!files.includes(`${id}.txt`)) return null;

		const data: string = fs.readFileSync(ROOT, {encoding: 'utf8'});
		return data as string;
	};

	return {write, get};
}

const shop: object = {
	get(): object {
		const data: object = JSON.parse(fs.readFileSync(SHOP_ROOT));
		return data;
	},

	getJson(): Buffer {
		const data: Buffer = fs.readFileSync(SHOP_ROOT);
		return data;
	},

	set(key: string, value: object): void {
		key = toID(key);

		const data: object = this.get();
		const newData: object = {};
		newData[key] = value;

		Object.assign(data, newData);
		fs.writeFileSync(SHOP_ROOT, JSON.stringify(data));
	},

	delete(key: string): void | null {
		const data: object = this.get();
		if (typeof data[key] === 'undefined') return null;

		delete data[key];
		fs.writeFileSync(SHOP_ROOT, JSON.stringify(data));
	},

	panel(): string {
		const data: object = this.get();
		const page: string = `>view-shop\n|init|html\n|title|[Shop] Tienda\n`;

		let shop: string = '|pagehtml| <div class="pad"><p><div style="margin: auto; text-align: center;">';
		shop += `<h1 style="font-weight: bold;">Tienda de <span style="color: #56C043">${Config.serverName}</span></h1>`;
		shop += '<table border="1" style="margin: auto; text-align: center; border-radius: 5px; border-color: #39772E;"></thead><tr><th style="padding: 3.5px;">Item</th> <th style="padding: 3.5px;">Description</th> <th style="padding: 3.5px;">Price</th> <th style="padding: 3.5px;">Buy</th></tr></thead>';
		shop += '<tbody>';
		for (const i in data) {
			const item: any = data[i];
			shop += '<tr>';
			shop += `<td style="padding: 4px;">${item.name}</td>`;
			shop += `<td>${item.desc}</td>`;
			shop += `<td style="padding: 4px; color: #f4821a; font-weight: bold;">${item.price}</td>`;
			shop += `<td style="padding: 4px;"><button class="button"><em class="fa fa-shopping-cart fa-lg" aria-hidden="true"></em></button></td>`;
			shop += '</tr>';
		}
		shop += '</tbody></table></div></p></div>';

		return page + shop;
	},
};

// Assignations
void Object.assign(Economy, { read, write, log, shop });

export default Economy;