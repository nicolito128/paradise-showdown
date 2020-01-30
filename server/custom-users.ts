import * as fs from 'fs';
import { Database } from './database';

interface IUser {
	id: string;
	name: string;
	money: number;
	lvl: number;
	exp: number;
	friends: any[];
	badges: any[];
}

export function setProfiles(obj: object): object {
	let users = fs.readdirSync(__dirname + `/../db/users`)
	if (users.length < 1) return null;

	users.forEach(user => {
		const userid = user.slice(0, -5);
		obj[userid] = {};
		let data: object = Database(userid, 'users').get('data');
		let keys = Object.keys(data);

		keys.forEach(key => obj[userid][key] = data[key]);
	});

	return obj as object;
}

export class CustomUser implements IUser {
	id: string;
	name: string;
	money: number;
	lvl: number;
	exp: number;
	friends: any;
	badges: any[];
	
	constructor(id: string, name: string, options: object = {}) {
		this.id = id;
		this.name = name;

		// Plugins
		this.money = 0;
		this.lvl = 1;
		this.exp = 0;
		this.friends = [];
		this.badges = [];
	}

	init(): void | null {
		const exists = Database(this.id, 'users').exists();
		if (exists) return null;

		Database(this.id, 'users').set('data', {id: this.id, name: this.name, money: this.money, lvl: this.lvl, exp: this.exp, friends: [...this.friends], badges: this.badges});
	}

	get(key: string): any | null {
		const k = Database(this.id, 'users').get('data')[key];
		if (k === undefined) return null;
		return k;
	}
}
