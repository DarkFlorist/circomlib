import compiler from 'circom';
import { describe, it } from 'micro-should';
import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import snarkjs from 'snarkjs';
import { assert } from './test_utils.js';
const __dirname = dirname(fileURLToPath(import.meta.url));

describe("Sum test", () => {
    it("Should create a constant circuit", async () => {

        const cirDef = await compiler(path.join(__dirname, "circuits", "constants_test.circom"));
        assert.equal(cirDef.nVars, 2);

        const circuit = new snarkjs.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "in": "0xd807aa98" });

        assert(witness[0].equals(snarkjs.bigInt(1)));
        assert(witness[1].equals(snarkjs.bigInt("0xd807aa98")));
    });
    it("Should create a sum circuit", async () => {

        const cirDef = await compiler(path.join(__dirname, "circuits", "sum_test.circom"));
        assert.equal(cirDef.nVars, 97);  // 32 (in1) + 32(in2) + 32(out) + 1 (carry)

        const circuit = new snarkjs.Circuit(cirDef);

        const witness = circuit.calculateWitness({ "a": "111", "b": "222" });

        assert(witness[0].equals(snarkjs.bigInt(1)));
        assert(witness[1].equals(snarkjs.bigInt("333")));
    });
});
it.runWhen(import.meta.url);