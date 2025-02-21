import compiler from 'circom';
import { describe, it } from 'micro-should';
import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import snarkjs from 'snarkjs';
import { assert } from './test_utils.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const bigInt = snarkjs.bigInt;

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

const q = bigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

describe("Sign test", () => {
    let circuit;
    const init = async() => {
        if (circuit) return;
        const cirDef = await compiler(path.join(__dirname, "circuits", "sign_test.circom"));

        circuit = new snarkjs.Circuit(cirDef);

        //console.log("NConstrains: " + circuit.nConstraints);
    };

    it("Sign of 0", async () => {
        await init();
        const inp = getBits(bigInt.zero, 254);
        const w = circuit.calculateWitness({in: inp});

        assert( w[circuit.getSignalIdx("main.sign")].equals(bigInt(0)) );
    });

    it("Sign of 3", async () => {
        await init();
        const inp = getBits(bigInt(3), 254);
        const w = circuit.calculateWitness({in: inp});

        assert( w[circuit.getSignalIdx("main.sign")].equals(bigInt(0)) );
    });

    it("Sign of q/2", async () => {
        await init();
        const inp = getBits(q.shr(bigInt.one), 254);
        const w = circuit.calculateWitness({in: inp});

        assert( w[circuit.getSignalIdx("main.sign")].equals(bigInt(0)) );
    });

    it("Sign of q/2+1", async () => {
        await init();
        const inp = getBits(q.shr(bigInt.one).add(bigInt.one), 254);
        const w = circuit.calculateWitness({in: inp});

        assert( w[circuit.getSignalIdx("main.sign")].equals(bigInt(1)) );
    });

    it("Sign of q-1", async () => {
        await init();
        const inp = getBits(q.sub(bigInt.one), 254);
        const w = circuit.calculateWitness({in: inp});

        assert( w[circuit.getSignalIdx("main.sign")].equals(bigInt(1)) );
    });

    it("Sign of q", async () => {
        await init();
        const inp = getBits(q, 254);
        const w = circuit.calculateWitness({in: inp});

        assert( w[circuit.getSignalIdx("main.sign")].equals(bigInt(1)) );
    });

    it("Sign of all ones", async () => {
        await init();
        const inp = getBits(bigInt(1).shl(254).sub(bigInt(1)), 254);
        const w = circuit.calculateWitness({in: inp});

        assert( w[circuit.getSignalIdx("main.sign")].equals(bigInt(1)) );
    });


});
it.runWhen(import.meta.url);
