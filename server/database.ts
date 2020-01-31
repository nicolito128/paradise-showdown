'use strict';
/**
 * Json handler system to Pokemon Showdown
 *
 * By: n128
 *
 * @license MIT license
 */

export type KeyType = string | number;
export type ValueType = string | string[] | number | number[] | object | object[] | boolean | null;

interface Db {
	[k: string]: ValueType;
}

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

export function Database(name: string, folder?: string): object | any {
	let path: string;
	if (folder && folder !== undefined) {
		const existsFolder = fs.existsSync(ROOT + folder);
		if (!existsFolder) fs.mkdirSync(ROOT + folder);

		path = ROOT + `${folder}/${name}.json`
	} else {
		path = ROOT + `${name}.json`;
	}

	const existsDb: boolean = fs.existsSync(path);
	let db: Db;

	if (!existsDb) {
		overwrite(path, {});
		db = {};
	} else {
		db = JSON.parse(fs.readFileSync(path));
	}

	const keys: KeyType[] = Object.keys(db);
	const values: ValueType[] = Object.values(db);

	function setDb(key: KeyType, value: ValueType): void {
		if (db[key] === undefined) {
			if (value === undefined || value === '') {
				db[key] = null;
			} else {
				db[key] = value;
			}
		} else {
			db[key] = value;
		}

		overwrite(path, db);
	}

	function getDb(key: KeyType) {
		if (db[key] === undefined) {
			return undefined as any;
		}

		return db[key];
	}

	function removeDb(key: KeyType): void {
		if (db[key] === undefined) {
			return undefined as any;
		}

		delete db[key];
		overwrite(path, db);
	}

	function hasDb(key: KeyType): boolean {
		if (db[key] === undefined || db[key] === '') {
			return false;
		}

		return true;
	}

	function callDb(func: any): void {
		if (typeof func !== 'function') {
			throw new Error('The required parameter must be a function!');
		}

		func(db, keys);
		overwrite(path, db);
	}

	return {
		set: (key: KeyType, value: ValueType): any => setDb(key, value),
		get: (key: KeyType): ValueType => getDb(key),
		remove: (key: KeyType): void => removeDb(key),
		has: (key: KeyType): boolean => hasDb(key),
		call: (func: any): void => callDb(func),
		keys: (): KeyType[] => keys,
		values: (): ValueType[] => values,
		exists: (): boolean => existsDb,
		data: (): Db => db
	};
}