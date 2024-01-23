import { ethers } from "ethers";
import { Node } from "./types";

export class NodeManager {
	private readonly _provider: ethers.Provider;
	private readonly _addr: string;
	private readonly _abi: any[];

	constructor(opt: {
		provider: ethers.Provider
		addr: string,
		abi: any[]
	}) {
		this._provider = opt.provider;
		this._addr = opt.addr;
		this._abi = opt.abi;
	}

	public async nodeExists(pk: string): Promise<boolean | Error> {
		try {
			const contract = new ethers.Contract(this._addr, this._abi, this._provider);
			return contract.nodeExists(pk);
		} catch (err: any) {
			return new Error(err);
		}
	}

	public async getNodeInfo(pk: string): Promise<Node | null | Error> {
		try {
			const contract = new ethers.Contract(this._addr, this._abi, this._provider);
			if(!(await contract.nodeExists(pk))) {
				return null;
			}
			return this._marshalNode(await contract.getNodeInfo(pk));
		} catch (err: any) {
			return new Error(err);
		}
	}

	public async addOrUpdate(backend: ethers.Signer, node: Node): Promise<Error | null> {
		try {
			const contract = new ethers.Contract(this._addr, this._abi, backend);
			await contract.addOrUpdate(node);
			return null;
		} catch (err: any) {
			return new Error(err);
		}
	}

	public async remove(backend: ethers.Signer, pk: string): Promise<Error | null> {
		try {
			const contract = new ethers.Contract(this._addr, this._abi, backend);
			if (!(await contract.nodeExists(pk))) {
				return new Error("Node does not exist");
			}
			await contract.remove(pk);
			return null;
		} catch (err: any) {
			return new Error(err);
		}
	}

	private _marshalNode(values: any[]): Node {
		return {
			pk: values[0],
			owner: values[1],
			teeType: values[2],
			teeVer: values[3],
			attestation: values[4]
		};
	}
}