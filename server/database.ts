/**
 * Json handler system to Pokemon Showdown
 *
 * @author n128
 * @license MIT
 */

'use strict';

export type KeyType = string;
export type ValueType = string | number | object | boolean | null;

interface Db {
	[k: string]: ValueType;
}

import * as fs from 'fs';
import { Monitor } from './monitor';

const ROOT: string = __dirname + '/../db/';

export function start(): void {
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

export function Database(name: string, group?: string): object | any {
	let path: string;
	if (group && group !== undefined) {
		const existsGroup = fs.existsSync(ROOT + group);
		if (!existsGroup) fs.mkdirSync(ROOT + group);

		path = ROOT + `${group}/${name}.json`
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

	function set(key: KeyType | object, value?: ValueType): void | null {
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

	function put(key: KeyType, value: ValueType): ValueType {
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

	function get(key: KeyType): ValueType | null {
		if (db[key] === undefined) {
			return null;
		}

		return db[key];
	}

	function remove(key: KeyType): void | null {
		if (db[key] === undefined) {
			return null;
		}

		delete db[key];
		overwrite(path, db);
	}

	function has(key: KeyType): boolean {
		if (db[key] === undefined || db[key] === '') {
			return false;
		}

		return true;
	}

	function call<T>(func: T): void {
		if (typeof func !== 'function') {
			throw new Error('The required parameter must be a function!');
		}

		func(db, keys);
		overwrite(path, db);
	}

	return {set, put, remove, get, has, call, 
		keys: (): KeyType[] => keys,
		values: (): ValueType[] => values,
		data: (): Db => db
	};
}