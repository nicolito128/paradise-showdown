import * as fs from 'fs';
import { Database } from './database';
import {Dex} from '../sim/dex';
const toID = Dex.getId;

interface IUser {
	id: string;
	name: string;
	money: number;
	lvl: number;
	exp: number;
	friends: object[];
	badges: object[];
}

function setProfiles(obj: object): object {
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

export function getProfile(user: string): object | null {
	user = toID(user);
	const profiles = setProfiles(Object.create(null));

	if (profiles[user] === undefined) return null;

	return profiles[user];
}

export class CustomUser implements IUser {
	id: string;
	name: string;
	money: number;
	lvl: number;
	exp: number;
	friends: object[];
	badges: object[];
	
	constructor(name: string, options: object = {}) {
		this.id = toID(name);
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

		Database(this.id, 'users').set('data', {id: this.id, name: this.name, money: this.money, lvl: this.lvl, exp: this.exp, friends: this.friends, badges: this.badges});
	}

	get(key: string): object | null {
		const k = Database(this.id, 'users').get('data')[key];
		if (k === undefined) return null;
		return k;
	}

	update(): void {
		let data: object = Object.assign(Object.create(null), Database(this.id, 'users').get('data'));
		data.name = this.name;
		Database(this.id, 'users').remove('data');
		Database(this.id, 'users').set('data', data);
	}
}
