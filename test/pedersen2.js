import compiler from 'circom';
import { describe, it } from 'micro-should';
import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import snarkjs from 'snarkjs';
import babyJub from '../src/babyjub.js';
import pedersen from '../src/pedersenHash.js';
import { assert } from './test_utils.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const bigInt = snarkjs.bigInt;


describe("Pedersen test", function() {
    let circuit;
    const init = async() => {
        if (circuit) return;
        const cirDef = await compiler(path.join(__dirname, "circuits", "pedersen2_test.circom"));

        circuit = new snarkjs.Circuit(cirDef);

        //console.log("NConstrains Pedersen2: " + circuit.nConstraints);
    };
    it("Should pedersen at zero", async () => {
        await init();
        let w, xout, yout;

        w = circuit.calculateWitness({ in: 0});

        xout = w[circuit.getSignalIdx("main.out[0]")];
        yout = w[circuit.getSignalIdx("main.out[1]")];

        const b = Buffer.alloc(32);

        const h = pedersen.hash(b);
        const hP = babyJub.unpackPoint(h);

        /*
        console.log(`[${xout.toString()}, ${yout.toString()}]`);
        console.log(`[${hP[0].toString()}, ${hP[1].toString()}]`);
        */

        assert(xout.equals(hP[0]));
        assert(yout.equals(hP[1]));
    });
    it("Should pedersen with 253 ones", async () => {
        await init();
        let w, xout, yout;

        const n = bigInt.one.shl(253).sub(bigInt.one);
        //console.log(n.toString(16));

        w = circuit.calculateWitness({ in: n});

        xout = w[circuit.getSignalIdx("main.out[0]")];
        yout = w[circuit.getSignalIdx("main.out[1]")];

        const b = Buffer.alloc(32);
        for (let i=0; i<31; i++) b[i] = 0xFF;
        b[31] = 0x1F;


        const h = pedersen.hash(b);
        const hP = babyJub.unpackPoint(h);

        /*
        console.log(`[${xout.toString()}, ${yout.toString()}]`);
        console.log(`[${hP[0].toString()}, ${hP[1].toString()}]`);
        */

        assert(xout.equals(hP[0]));
        assert(yout.equals(hP[1]));
    });
});
it.runWhen(import.meta.url);
