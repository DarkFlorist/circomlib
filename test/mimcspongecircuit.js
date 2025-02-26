import compiler from 'circom';
import { describe, it } from 'micro-should';
import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import snarkjs from 'snarkjs';
import mimcjs from '../src/mimcsponge.js';
import { assert } from './test_utils.js';
const __dirname = dirname(fileURLToPath(import.meta.url));

describe("MiMC Sponge Circuit test", function () {
    let circuit;

    it("Should check permutation", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "mimc_sponge_test.circom"));

        circuit = new snarkjs.Circuit(cirDef);

        //console.log("MiMC Feistel constraints: " + circuit.nConstraints);

        const w = circuit.calculateWitness({xL_in: 1, xR_in: 2, k: 3});

        const xLout = w[circuit.getSignalIdx("main.xL_out")];
        const xRout = w[circuit.getSignalIdx("main.xR_out")];

        const out2 = mimcjs.hash(1,2,3);

        assert.equal(xLout.toString(), out2.xL.toString());
        assert.equal(xRout.toString(), out2.xR.toString());

        assert(circuit.checkWitness(w));

    });

    it("Should check hash", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "mimc_sponge_hash_test.circom"));

        circuit = new snarkjs.Circuit(cirDef);

        //console.log("MiMC Sponge constraints: " + circuit.nConstraints);

        const w = circuit.calculateWitness({ins: [1, 2], k: 0});

        const o1 = w[circuit.getSignalIdx("main.outs[0]")];
        const o2 = w[circuit.getSignalIdx("main.outs[1]")];
        const o3 = w[circuit.getSignalIdx("main.outs[2]")];

        const out2 = mimcjs.multiHash([1,2], 0, 3);

        assert.equal(o1.toString(), out2[0].toString());
        assert.equal(o2.toString(), out2[1].toString());
        assert.equal(o3.toString(), out2[2].toString());

        assert(circuit.checkWitness(w));

    });
});
it.runWhen(import.meta.url);
