//import ganache from 'ganache';
//import Web3 from 'web3';
import { describe, it } from 'micro-should';
import Poseidon from '../src/poseidon.js';
import poseidonGenContract from '../src/poseidon_gencontract.js';
import { assert } from './test_utils.js';

describe("Poseidon Smart contract test", () => {
    let testrpc;
    let web3;
    let mimc;
    let accounts;

    const init = async () => {
        if (web3) return;
        web3 = new Web3(ganache.provider(), null, { transactionConfirmationBlocks: 1 });
        accounts = await web3.eth.getAccounts();
    };

    it("Should deploy the contract", async () => {
        await init();
        const C = new web3.eth.Contract(poseidonGenContract.abi);

        mimc = await C.deploy({
            data: poseidonGenContract.createCode()
        }).send({
            gas: 2500000,
            from: accounts[0]
        });
    });

    it("Shold calculate the mimic correctly", async () => {
        await init();
        const res = await mimc.methods.poseidon([1,2]).call();

        // console.log("Cir: " + bigInt(res.toString(16)).toString(16));

        const hash = Poseidon.createHash(6, 8, 57);

        const res2 = hash([1,2]);
        // console.log("Ref: " + bigInt(res2).toString(16));

        assert.equal(res.toString(), res2.toString());
    });
});
it.runWhen(import.meta.url);

