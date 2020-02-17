/**
 * Custom Users system to Pokemon Showdown
 * 
 * @author n128
 * @license MIT
 */

import { Database } from './database';
import { Dex } from '../sim/dex';
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

export function getProfile(user: string): CustomUser {
	const u = new CustomUser(user);
	u.init();
	return u;
}

export class CustomUser implements IUser {
	id: string;
	name: string;
	ips: string[] | undefined;
	money: number;
	lvl: number;
	exp: number;
	inbox: object;
	receipts: object[];
	friends: object[];
	badges: object[];

	constructor(name: string, options?: {ips: string[]}) {
		this.id = toID(name);
		this.name = name;

		this.ips = options?.ips;

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
		const exists: boolean = Database(this.id, `users`).exists();
		if (exists) {
			const data = Database(this.id, `users`).data();
			Object.assign(this, data);
		}

		Database(this.id, `users`).set({
			id: this.id,
			name: this.name,
			ips: this.ips,
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
		if (key && !value || value === undefined) return Database(this.id, `users`).set(key);
		return Database(this.id, `users`).set(key);
	}

	put<T>(key: string, value: T): T {
		return Database(this.id, `users`).put(key, value);
	}
}
