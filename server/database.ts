'use strict';
/**
 * Json handler system to Pokemon Showdown
 *
 * By: n128
 *
 * @license MIT license
 */

import * as fs from 'fs';
import { Monitor } from './monitor';

const ROOT: string = __dirname + '/../db/';

export function startDb(): void {
	const existsDb = fs.existsSync(ROOT);
	if (!existsDb) {
		fs.mkdirSync(ROOT);
		Monitor.notice('Database initializated!');
	} else {
		Monitor.notice('Database already initializated.');
	}
}

function overwrite(path: string, data: object): void {
	const json: string = JSON.stringify(data);
	fs.writeFileSync(path, json);
}

export function Database<T>(name: string): object | T {
	const path: string = ROOT + `${name}.json`;
	const existsDb: boolean = fs.existsSync(path);
	let Db: any;

	if (!existsDb) {
		fs.writeFileSync(path, {});
		Db = {};
	} else {
		Db = JSON.parse(fs.readFileSync(path));
	}

	const keys: string[] = Object.keys(Db);
	const values: any[] = Object.values(Db);

	function setDb<Y>(key: string | Y, value: string | Y): void {
		if (Db[key] === undefined) {
			if (value === undefined || value === '') {
				Db[key] = null;
			} else {
				Db[key] = value;
			}
		} else {
			Db[key] = value;
		}

		overwrite(path, Db);
	}

	function getDb<X>(key: string | X): X {
		if (Db[key] === undefined) {
			return undefined as any;
		}

		return Db[key];
	}

	function removeDb<O>(key: string | O): void | O {
		if (Db[key] === undefined) {
			return undefined as any;
		}

		delete Db[key];
		overwrite(path, Db);
	}

	function hasDb(key: string): boolean {
		if (Db[key] === undefined || Db[key] === '') {
			return false;
		}

		return true;
	}

	function callDb(func: any): void {
		if (typeof func !== 'function') {
			throw new Error('The required parameter must be a function!');
		}

		func(Db, keys);
		overwrite(path, Db);
	}

	return {
		set: (key: any, value: any): any => setDb(key, value),
		get: (key: string): any => getDb(key),
		remove: (key: string): any => removeDb(key),
		has: (key: string): boolean => hasDb(key),
		call: (func: any): any => callDb(func),
		keys: (): string[] => keys,
		values: (): any[] => values,
		data: Db
	};
}