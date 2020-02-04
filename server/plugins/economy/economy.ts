/**
 * Json handler system to Pokemon Showdown
 *
 * @author n128
 */
'use strict';

interface ICallback { (user: string, money: number): void }

type Money = number | null;

import * as fs from 'fs';

let Economy = Object.create(null);

function read(user: string, callback?: ICallback): Money {
	const userid = toID(user);
	const money: Money = Database(userid, 'users').get('money');

	if (callback) callback(userid, money);
	return money;
}

function write(user: string, amount: number, callback?: ICallback): Money {
	if (typeof amount === 'undefined') return null;
	if (isNaN(amount)) return null;

	const userid = toID(user);
	const money: Money = Database(userid, 'users').put('money', amount);

	if (callback) callback(userid, money);
	return money;
}

function log(user: string): object {
	const userid = toID(user);
	const ROOT_LOG = __dirname + '/../../../logs/economy'

	const existsRoot = fs.existsSync(ROOT_LOG);
	if (!existsRoot) fs.mkdirSync(ROOT_LOG);

	const existsUser = fs.existsSync(ROOT_LOG + `/${userid}.txt`);
	if (!existsUser) fs.writeFileSync(ROOT_LOG + `/${userid}.txt`, "");

	const ROOT = ROOT_LOG + `/${userid}.txt`;

	// local methods
	const write = (message: string): void => {
		let data = fs.readFileSync(ROOT, {encoding: 'utf8'});
		fs.writeFileSync(ROOT, data + `[${new Date().toUTCString()}] ${message} \n`);
	}

	const get = (): string | null => {
		const files = fs.readdirSync(ROOT_LOG);
		if (!files.includes(`${userid}.txt`)) return null;

		let data = fs.readFileSync(ROOT, {encoding: 'utf8'});
		return data as string;
	};

	return {write, get};
}

// Assignations
void Object.assign(Economy, { read, write, log });

export default Economy;