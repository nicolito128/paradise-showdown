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

function overwrite(path: string, data: Db): void {
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

	function setDb(key: KeyType | ValueType, value?: ValueType): void | null {
		if (key === undefined) return null;
		if (value === undefined || value === '' && typeof key === 'object') {
			Object.assign(db, key);
		} else if (key && value) {
			db[(key as KeyType)] = value;
		} else {
			return null;
		}

		overwrite(path, db);
	}

	function putDb(key: KeyType, value: ValueType): ValueType {
		if (key && db[key] !== undefined && value) {
			if (typeof db[key] === 'number' && typeof value === 'number') {
				(db[key] as number) += value;
			} else if (typeof db[key] === 'string' && typeof value === 'string') {
				(db[key] as string) += value;
			} else if (Array.isArray(db[key])) {
				(db[key] as ValueType[]).push(value);
			} else if (typeof db[key] === 'object' && typeof value === 'object') {
				Object.assign(db[key], value);
			} else {
				return null;
			}

			overwrite(path, db);
			return db[key];
		}

		return null;
	}

	function getDb(key: KeyType): ValueType | null {
		if (db[key] === undefined) {
			return null;
		}

		return db[key];
	}

	function removeDb(key: KeyType): void | null {
		if (db[key] === undefined) {
			return null;
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
		set: (key: KeyType | ValueType, value: ValueType): any => setDb(key, value),
		put: (key: KeyType, value: ValueType): ValueType => putDb(key, value),
		get: (key: KeyType): ValueType => getDb(key),
		remove: (key: KeyType): void | null => removeDb(key),
		has: (key: KeyType): boolean => hasDb(key),
		call: (func: any): void => callDb(func),
		keys: (): KeyType[] => keys,
		values: (): ValueType[] => values,
		exists: (): boolean => existsDb,
		data: (): Db => db
	};
}