/**
 * Economy system
 *
 * @author n128
 */
'use strict';

interface ICallback { (user: string, money: number): void }

type Money = number | null;

import * as fs from 'fs';

let Economy = Object.create(null);

function read(user: string, callback?: ICallback): Money {
	if (!user || user === '' || user === undefined) return null;
	const userid = toID(user);
	const money: Money = Database(userid, 'users').get('money');

	if (callback) callback(userid, money);
	return money;
}

function write(user: string, amount: number, callback?: ICallback): Money {
	if (!user || user === '' || user === undefined) return null;
	if (typeof amount === 'undefined') return null;
	if (isNaN(amount)) return null;

	const userid = toID(user);
	const money: Money = Database(userid, 'users').put('money', amount);

	if (callback) callback(userid, money);
	return money;
}

function log(name: string): object {
	const id = toID(name);
	const ROOT_LOG = __dirname + '/../../../logs/economy'

	const existsRoot = fs.existsSync(ROOT_LOG);
	if (!existsRoot) fs.mkdirSync(ROOT_LOG);

	const existsFile = fs.existsSync(ROOT_LOG + `/${id}.txt`);
	if (!existsFile) fs.writeFileSync(ROOT_LOG + `/${id}.txt`, "");

	const ROOT = ROOT_LOG + `/${id}.txt`;

	// local methods
	const write = (message: string): void => {
		let data = fs.readFileSync(ROOT, {encoding: 'utf8'});
		fs.writeFileSync(ROOT, data + `[${new Date().toUTCString()}] ${message} \n`);
	}

	const get = (): string | null => {
		const files = fs.readdirSync(ROOT_LOG);
		if (!files.includes(`${id}.txt`)) return null;

		let data = fs.readFileSync(ROOT, {encoding: 'utf8'});
		return data as string;
	};

	return {write, get};
}

const shop: object = {
	get(): object {
		const data: object = JSON.parse(fs.readFileSync(__dirname + '/../../../server/plugins/economy/data/shop.json'));
		return data;
	},

	getJson(): string {
		const data: string = fs.readFileSync(__dirname + '/../../../server/plugins/economy/data/shop.json');
		return data;
	},
	
	set(key: string, value: object): void {
		key = toID(key);
		let data: object = this.get();
		let newData: object = {};
		newData[key] = value;
		Object.assign(data, newData);
		fs.writeFileSync(__dirname + '/../../../server/plugins/economy/data/shop.json', JSON.stringify(data));
	},

	delete(key: string): void | null {
		let data: object = this.get();
		if (typeof data[key] === 'undefined') return null;

		delete data[key];
		fs.writeFileSync(__dirname + '/../../../server/plugins/economy/data/shop.json', JSON.stringify(data));
	}
};

// Assignations
void Object.assign(Economy, { read, write, log, shop });

export default Economy;