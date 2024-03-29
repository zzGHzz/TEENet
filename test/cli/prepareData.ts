import { Code, Node, Task } from '../../src/libs/types';
import { writeFileSync, readFileSync } from 'fs';
import { Wallet } from 'ethers';
import { files, dir } from '../../src/cli/common';
import { join } from 'path';
import { randBytes } from '../../src/libs/common';
const JSONbig = require('json-bigint');

const genCode = (): Code => {
	const hash = randBytes(32);
	return {
		hash: hash,
		url: `https://${hash}.network`
	}
}

const genNode = (owner: string): Node => {
	return {
		pk: randBytes(32),
		owner: owner,
		teeType: randBytes(16),
		teeVer: randBytes(16),
		attestation: randBytes(256)
	}
}

const genTask = (owner: string, numDays: number, maxNodeNum: number, codeHash: string): Task => {
	return {
		id: randBytes(32),
		owner: owner,
		rewardPerNode: BigInt(Math.ceil(Math.random() * 100)),
		start: BigInt(0),
		numDays: BigInt(numDays),
		maxNodeNum: BigInt(maxNodeNum),
		codeHash: codeHash
	}
}

const pks = JSON.parse(readFileSync(join(dir, files.pk), 'utf-8'));
const wallets: Wallet[] = pks.map((pk: string) => {
	return new Wallet(pk);
})

async function main() {
	// Generate valid code info
	const nCode = 3;
	const codes: Code[] = [];
	for (let i = 0; i < nCode; i++) {
		codes.push(genCode());
		writeFileSync(join(dir, 'data', `code${i}.json`), JSON.stringify(codes[i], null, 2));
	}

	// Generate code info for testing update
	const code = { ...codes[0] };
	code.url = 'https://update.network';
	writeFileSync(join(dir, 'data', `code0.update.json`), JSON.stringify(code, null, 2));

	// Generate invalid code info
	const zeroHash = genCode();
	zeroHash.hash = '0x' + '0'.repeat(64);
	writeFileSync(join(dir, 'data', `code.zeroHash.json`), JSON.stringify(zeroHash, null, 2));

	// Generate valid node info
	const nNode = 3;
	const len = wallets.length;
	let nodes: Node[] = [];
	for (let i = 0; i < nNode; i++) {
		nodes.push(genNode(wallets[len - i - 1].address));
		writeFileSync(join(dir, 'data', `node.w${len - i - 1}.json`), JSON.stringify(nodes[i], null, 2));
	}

	// Generate invalid node info
	const zeroOwner = genNode(wallets[0].address);
	writeFileSync(join(dir, 'data', `node.zeroOwner.json`), JSON.stringify(zeroOwner, null, 2));
	const zeroPK = genNode(randBytes(20));
	zeroPK.pk = '0x' + '0'.repeat(64);
	writeFileSync(join(dir, 'data', `node.zeroPK.json`), JSON.stringify(zeroPK, null, 2));

	// Generate valid tasks
	const nTask = 3;
	const numDays = [1, 2, 3];
	const maxNodeNum = [1, 2, 3];
	for (let i = 0; i < nTask; i++) {
		const task = genTask(wallets[i + 1].address, numDays[i], maxNodeNum[i], codes[0].hash);
		const file = join(dir, 'data', `task.w${i + 1}.d${numDays[i]}.n${maxNodeNum[i]}.json`);
		writeFileSync(file, JSONbig.stringify(task, null, 2));
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});