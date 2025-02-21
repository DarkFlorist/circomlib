import compiler from 'circom';
import { describe, it } from 'micro-should';
import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import snarkjs from 'snarkjs';
import mimcjs from '../src/mimc7.js';
import { assert } from './test_utils.js';
const __dirname = dirname(fileURLToPath(import.meta.url));

describe("MiMC Circuit test", function () {
    it("Should check constrain", async () => {
        const cirDef = await compiler(path.join(__dirname, "circuits", "mimc_test.circom"));

        const circuit = new snarkjs.Circuit(cirDef);

        // console.log("MiMC constraints: " + circuit.nConstraints);
        const w = circuit.calculateWitness({x_in: 1, k: 2});

        const res = w[circuit.getSignalIdx("main.out")];

        const res2 = mimcjs.hash(1,2,91);

        assert.equal(res.toString(), res2.toString());

        assert(circuit.checkWitness(w));

    });
});
it.runWhen(import.meta.url);
