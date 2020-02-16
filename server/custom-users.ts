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

export function getProfile(user: string): CustomUser {
	const u = new CustomUser(user);
	u.init();
	return u;
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
			Object.assign(this, data);
		}

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

	get<T>(key: string): T {
		return this[key];
	}

	set<T>(key: string, value?: T): T {
		if (key && !value || value === undefined) return Database(this.id, `users/${this.id}`).set(key);
		return Database(this.id, `users/${this.id}`).set(key);
	}

	put<T>(key: string, value: T): T {
		return Database(this.id, `users/${this.id}`).put(key, value);
	}
}
