import compiler from 'circom';
import { describe, it } from 'micro-should';
import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import snarkjs from 'snarkjs';
import babyJub from '../src/babyjub.js';
import { assert } from './test_utils.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const bigInt = snarkjs.bigInt;


describe("Point 2 bits test", function() {
    let circuit;
    const init = async() => {
        if (circuit) return;
        const cirDef = await compiler(path.join(__dirname, "circuits", "pointbits_loopback.circom"));

        circuit = new snarkjs.Circuit(cirDef);

        //console.log("NConstrains Point2Bits loopback: " + circuit.nConstraints);
    };
    it("Should do the both convertions for 8Base", async () => {
        await init();
        const w = circuit.calculateWitness({ in: babyJub.Base8});

        assert(circuit.checkWitness(w));
    });
    it("Should do the both convertions for Zero point", async () => {
        await init();
        const w = circuit.calculateWitness({ in: [0, 1]});

        assert(circuit.checkWitness(w));
    });
});
it.runWhen(import.meta.url);
