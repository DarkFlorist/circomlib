import compiler from 'circom';
import { describe, it } from 'micro-should';
import * as path from 'node:path';
import snarkjs from 'snarkjs';
import { assert } from './test_utils.js';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const bigInt = snarkjs.bigInt;

function print(circuit, w, s) {
    console.log(s + ": " + w[circuit.getSignalIdx(s)]);
}

function checkSub(_a,_b, circuit) {
    let a=bigInt(_a);
    let b=bigInt(_b);
    if (a.lesser(bigInt.zero)) a = a.add(bigInt.one.shl(16));
    if (b.lesser(bigInt.zero)) b = b.add(bigInt.one.shl(16));
    const w = circuit.calculateWitness({a: a, b: b});

    let res = a.sub(b);
    if (res.lesser(bigInt.zero)) res = res.add(bigInt.one.shl(16));
    assert(w[circuit.getSignalIdx("main.out")].equals(bigInt(res)));
}

describe("BinSub test", () => {
    let circuit;
    const init = async() => {
        if (circuit) return;
        const cirDef = await compiler(path.join(__dirname, "circuits", "binsub_test.circom"));

        circuit = new snarkjs.Circuit(cirDef);

    };

    it("Should check variuos edge cases", async () => {
        await init();
        checkSub(0,0, circuit);
        checkSub(1,0, circuit);
        checkSub(-1,0, circuit);
        checkSub(2,1, circuit);
        checkSub(2,2, circuit);
        checkSub(2,3, circuit);
        checkSub(2,-1, circuit);
        checkSub(2,-2, circuit);
        checkSub(2,-3, circuit);
        checkSub(-2,-3, circuit);
        checkSub(-2,-2, circuit);
        checkSub(-2,-1, circuit);
        checkSub(-2,0, circuit);
        checkSub(-2,1, circuit);
        checkSub(-2,2, circuit);
        checkSub(-2,3, circuit);
    });


});
it.runWhen(import.meta.url);
