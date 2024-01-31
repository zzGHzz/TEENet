import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { assert } from 'chai';
import { Wallet } from 'ethers';
import { Code } from '../../src/libs/types';
import { dir } from '../../src/cli/common';

export const cfgFile = join(dir, 'config.teenet.json');
export const pkFile = join(dir, 'pk.teenet.json');
export const dataDir = join(dir, 'data');

const loadWallets = () => {
	let pks: string[] = [];
	try {
		pks = JSON.parse(readFileSync(pkFile, 'utf-8'));
	} catch (err: any) {
		assert.fail(err.message);
	}
	const wallets: Record<string, Wallet> = {};
	for (const pk of pks) {
		const wallet = new Wallet(pk);
		wallets[wallet.address] = wallet;
	}
	return wallets;
}
export const wallets = loadWallets();

const loadCodes = () => {
	let codes: Code[] = [];
	try {
		for (let i = 0; i < 3; i++) {
			codes.push(JSON.parse(readFileSync(join(dataDir, `code${i}.json`), 'utf-8')));
		}
	} catch (err: any) {
		assert.fail(err.message);
	}
	return codes;
}
export const codes = loadCodes();

export const loadFile = (file: string) => {
	try {
		const _file = join(dataDir, file);
		return JSON.parse(readFileSync(_file, 'utf-8'));
	} catch (err: any) {
		assert.fail(err.message);
	}
}

export const writeFile = (file: string, data: any) => {
	try {
		const _file = join(dataDir, file);
		return writeFileSync(_file, JSON.stringify(data, null, 2));
	} catch (err: any) {
		assert.fail(err.message);
	}
}