/**
 * Custom Users system to Pokemon Showdown
 * 
 * @author n128
 * @license MIT
 */

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
	inbox: object;
	receipts: object[];
	friends: object[];
	badges: object[];
}

interface Profile {
	[k: string]: any;
}

function setProfiles(obj: Profile): Profile | null{
	const users: string[] = fs.readdirSync(__dirname + `/../db/users`)
	if (users.length < 1) return null;

	users.forEach(user => {
		const userid: string = user.slice(0, -5);
		obj[userid] = {};
		const data: Profile = Database(userid, `users/${userid}`).data();
		const keys: string[] = Object.keys(data);

		keys.forEach(key => obj[userid][key] = data[key]);
		Object.assign(obj, data);
	});

	return obj;
}

export function getProfile(user: string): Profile | null {
	user = toID(user);
	const profiles: Profile | null = setProfiles(Object.create(null));
	if (profiles === null) return null;
	if (typeof profiles[user] === 'undefined') return null;

	return profiles[user];
}

export class CustomUser implements IUser {
	id: string;
	name: string;
	money: number;
	lvl: number;
	exp: number;
	inbox: object;
	receipts: object[];
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
		this.receipts = [];
		this.friends = [];
		this.badges = [];
	}

	init(): void {
		const exists: boolean = Database(this.id, `users/${this.id}`).exists();
		if (exists) {
			const data = Database(this.id, `users/${this.id}`).data();
			Database(this.id, `users/${this.id}`).set({
				id: data.id,
				name: data.name,
				money: data.money,
				lvl: data.lvl,
				exp: data.exp,
				inbox: data.inbox,
				receipts: data.receipts,
				friends: data.friends,
				badges: data.badges,
			});

			Object.assign(this, data);
		} else {
			Database(this.id, `users/${this.id}`).set({
				id: this.id,
				name: this.name,
				money: this.money,
				lvl: this.lvl,
				exp: this.exp,
				inbox: this.inbox,
				receipts: this.receipts,
				friends: this.friends,
				badges: this.badges,
			});
		}

	}

	get(key: string): any {
		return this[key];
	}
}
