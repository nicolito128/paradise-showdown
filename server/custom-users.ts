import * as fs from 'fs';
import { Database, KeyType, ValueType } from './database';
import {Dex} from '../sim/dex';
const toID = Dex.getId;

interface IUser {
	id: string;
	name: string;
	money: number;
	lvl: number;
	exp: number;
	inbox: object;
	friends: object[];
	badges: object[];
}

interface Profile {
	[k: string]: any;
	Set?: (key: KeyType, value: ValueType) => void;
}

function setProfiles(obj: Profile): object | null{
	let users: string[] = fs.readdirSync(__dirname + `/../db/users`)
	if (users.length < 1) return null;

	users.forEach(user => {
		const userid: string = user.slice(0, -5);
		obj[userid] = {};
		let data: object = Database(userid, 'users').get('data');
		let keys: string[] = Object.keys(data);

		keys.forEach(key => obj[userid][key] = data[key]);
		profiles[userid].Set = function (key: KeyType, value: ValueType): void {
			let setObject: object;
			setObject[key] = value;
			Database(userid, 'users').set('data', setObject);
		}

		Object.assign(obj, data);
	});

	return obj as object;
}

let profiles: Profile = setProfiles(Object.create(null));
export function getProfile(user: string): Profile | null {
	user = toID(user);
	if (profiles[user] === undefined) return null;

	return profiles[user];
}

export class CustomUser implements IUser {
	id: string;
	name: string;
	money: number;
	lvl: number;
	exp: number;
	inbox: object;
	friends: object[];
	badges: object[];
	
	constructor(name: string, options: object = {}) {
		this.id = toID(name);
		this.name = name;

		// Plugins
		this.money = 0;
		this.lvl = 1;
		this.exp = 0;
		this.inbox = {};
		this.friends = [];
		this.badges = [];
	}

	init(): void | null {
		const exists = Database(this.id, 'users').exists();
		if (exists) return null;

		Database(this.id, 'users').set('data', {id: this.id, name: this.name, money: this.money, lvl: this.lvl, exp: this.exp, inbox: this.inbox, friends: this.friends, badges: this.badges});
	}

	get(key: string): object | null {
		const k = Database(this.id, 'users').get('data')[key];
		if (k === undefined) return null;
		return k;
	}
}
