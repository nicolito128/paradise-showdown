/**
 * Economy system
 *
 * @author n128
 */
'use strict';

interface ICallback { (user: string, money: number): void }

interface IEconomy {
	read: (user: string, callback?: ICallback) => Money;
	write: (user: string, amount: number, callback?: ICallback) => Money;
	receipts: (user: string) => IReceipt[];
	log: (name: string) => {
		write: (message: string) => void;
		get: () => string | null;
	};
	shop: {
		get: () => IShop;
		getJson: () => Buffer;
		set: (set: string, value: object) => void;
		delete: (key: string) => void | null;
		panel: () => string;
		buy: (user: string, item: IShopData, options: string) => boolean | null;
		pending: () => IReceipt[];
		adminPanel: () => string;
	};
}

export interface IShopData {
	id: string;
	name: string;
	price: number;
	desc: string;
	options: boolean;
}

export interface IShop {
	[k: string]: IShopData;
}

export interface IReceipt {
	date: string;
	id: string;
	name: string;
	user?: object;
	options?: string;
}

export type Money = number | null;

import * as fs from 'fs';

export const Economy: IEconomy = Object.create(null);
const SHOP_ROOT = __dirname + '/../../../server/plugins/economy/data/shop.json';

function read(user: string, callback?: ICallback): Money {
	if (!user || user === '' || user === undefined) return null;
	const userid: string = toID(user);
	const money: Money = Profiles(userid).get('money');

	if (callback) callback(userid, money);
	return money;
}

function write(user: string, amount: number, callback?: ICallback): Money {
	if (!user || user === '' || user === undefined) return null;
	if (typeof amount === 'undefined') return null;
	if (isNaN(amount)) return null;

	const userid: string = toID(user);
	const money: Money = Profiles(userid).put('money', amount);

	if (callback) callback(userid, money);
	return money;
}

function receipts(user: string): IReceipt[] | null {
	const userid: string = toID(user);
	const receipts: IReceipt[] | null = Profiles(userid).get('receipts');
	return receipts;
}

function log(name: string): object {
	const id: string = toID(name);
	const ROOT_LOG: string = __dirname + '/../../../logs/economy';

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
	get(): IShop {
		const data: IShop = JSON.parse(fs.readFileSync(SHOP_ROOT));
		return data;
	},

	getJson(): Buffer {
		const data: Buffer = fs.readFileSync(SHOP_ROOT);
		return data;
	},

	set(key: string, value: object): void {
		key = toID(key);

		const data: object = this.get() as object;
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
			shop += `<td style="padding: 4px;">${item.desc}</td>`;
			shop += `<td style="padding: 4px; color: #f4821a; font-weight: bold;">${item.price}</td>`;
			shop += `<td style="padding: 4px;"><button class="button"><em class="fa fa-shopping-cart fa-lg" aria-hidden="true"></em></button></td>`;
			shop += '</tr>';
		}
		shop += '</tbody></table></div></p></div>';

		return page + shop;
	},

	buy(user: string, item: IShopData, options: string): boolean | null {
		const userid = toID(user);
		const exists: boolean = Database('shop').has('pending');
		if (!exists) {
			void Database('shop').set('pending', []);
		}

		if (item.options && options === '' || options === undefined) {
			return null;
		}

		const data: object = {date: new Date().toUTCString(), id: item.id, name: item.name};
		Database('shop').put('pending', {user: {id: userid, name: user}, ...data, options});
		Profiles(userid).put('receipts', {...data, options});

		return true;
	},

	pending(): IReceipt[] | null {
		const pending: IReceipt[] | null = Database('shop').get('pending');
		return pending;
	},

	adminPanel(): string {
		const receipts: IReceipt[] | null = this.pending();
		if (receipts === null) return '';

		const page: string = `>shop-admin-panel\n|init|html\n|title|[Shop] Admin\n`;
		let shop: string = '|pagehtml| <div class="pad"><p><div style="margin: auto; text-align: center;">';
		shop += `<h1 style="font-weight: bold;">Registros de compra</span></h1>`;
		shop += '<table border="1" style="margin: auto; text-align: center; border-radius: 5px; border-color: #39772E;"></thead><tr><th style="padding: 3.5px;">Date</th> <th style="padding: 3.5px;">Name</th> <th style="padding: 3.5px;">User</th> <th style="padding: 3.5px;">Options</th></tr></thead>';
		shop += '<tbody>';
		for (const receipt of receipts) {
			shop += '<tr>';
			shop += `<td style="padding: 4px; font-weight: italic;"><small>${receipt.date}</small></td>`;
			shop += `<td style="padding: 4px; font-weight: bold;">${receipt.name}</td>`;
			shop += `<td style="padding: 4px; font-weight: bold;">${receipt.user.name}</td>`;
			shop += `<td style="padding: 4px;">${receipt.options}</td>`;
			shop += '</tr>';
		}
		shop += '</tbody></table></div></p></div>';

		return page + shop;
	},
};

// Assignations
void Object.assign(Economy, { read, write, receipts, log, shop });