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

function getBits(v, n) {
    const res = [];
    for (let i=0; i<n; i++) {
        if (v.shr(i).isOdd()) {
            res.push(bigInt.one);
        } else {
            res.push(bigInt.zero);
        }
    }
    return res;
}

const r = bigInt("2736030358979909402780800718157159386076813972158567259200215660948447373041");

describe("Aliascheck test", () => {
    let circuit;
    const init = async() => {
        if (circuit) return;
        const cirDef = await compiler(path.join(__dirname, "circuits", "aliascheckbabyjub_test.circom"));

        circuit = new snarkjs.Circuit(cirDef);

    };

    it("Satisfy the aliastest 0", async () => {
        await init();
        const inp = getBits(bigInt.zero, 251);
        circuit.calculateWitness({in: inp});
    });

    it("Satisfy the aliastest 3", async () => {
        await init();
        const inp = getBits(bigInt(3), 251);
        circuit.calculateWitness({in: inp});
    });

    it("Satisfy the aliastest r-1", async () => {
        await init();
        const inp = getBits(r.sub(bigInt.one), 251);
        circuit.calculateWitness({in: inp});
    });

    it("Nhot not satisfy an input of r", async () => {
        await init();
        const inp = getBits(r, 251);
        try {
            circuit.calculateWitness({in: inp});
            assert(false);
        } catch(err) {
            assert(err.message.indexOf("Constraint doesn't match") >= 0);
            assert(err.message.indexOf("1 != 0") >= 0);
        }
    });

    it("Nhot not satisfy all ones", async () => {
        await init();
        const inp = getBits(bigInt(1).shl(251).sub(bigInt(1)), 251);
        try {
            circuit.calculateWitness({in: inp});
            assert(false);
        } catch(err) {
            assert(err.message.indexOf("Constraint doesn't match") >= 0);
            assert(err.message.indexOf("1 != 0") >= 0);
        }
    });

});
it.runWhen(import.meta.url);
