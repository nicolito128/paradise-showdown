import { Users } from './users';
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
		const exists = Database(this.id).exists();
		if (exists) return null;

		Database(this.id).set('data', {id: this.id, name: this.name, money: this.money, lvl: this.lvl, exp: this.exp, friends: [...this.friends], badges: this.badges});
	}
}
