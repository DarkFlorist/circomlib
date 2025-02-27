import compiler from 'circom';
import { describe, it } from 'micro-should';
import * as path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import snarkjs from 'snarkjs';
import eddsa from '../src/eddsa.js';
import { assert } from './test_utils.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const bigInt = snarkjs.bigInt;

describe("EdDSA MiMC test", function () {
    let circuit;
    const init = async () => {
        if (circuit) return;
        const cirDef = await compiler(path.join(__dirname, "circuits", "eddsamimc_test.circom"));

        circuit = new snarkjs.Circuit(cirDef);

        //console.log("NConstrains EdDSA MiMC: " + circuit.nConstraints);
    };

    it("Sign a single number", async () => {
        await init();
        const msg = bigInt(1234);

        const prvKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090001", "hex");

        const pubKey = eddsa.prv2pub(prvKey);

        const signature = eddsa.signMiMC(prvKey, msg);

        assert(eddsa.verifyMiMC(msg, signature, pubKey));

        const w = circuit.calculateWitness({
            enabled: 1,
            Ax: pubKey[0],
            Ay: pubKey[1],
            R8x: signature.R8[0],
            R8y: signature.R8[1],
            S: signature.S,
            M: msg});

        assert(circuit.checkWitness(w));
    });

    it("Detect Invalid signature", async () => {
        await init();
        const msg = bigInt(1234);

        const prvKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090001", "hex");

        const pubKey = eddsa.prv2pub(prvKey);


        const signature = eddsa.signMiMC(prvKey, msg);

        assert(eddsa.verifyMiMC(msg, signature, pubKey));
        try {
            const w = circuit.calculateWitness({
                enabled: 1,
                Ax: pubKey[0],
                Ay: pubKey[1],
                R8x: signature.R8[0].add(bigInt(1)),
                R8y: signature.R8[1],
                S: signature.S,
                M: msg});
            assert(false);
        } catch(err) {
            assert(/Constraint\sdoesn't\smatch(.*)1\s!=\s0/.test(err.message) );
        }
    });


    it("Test a dissabled circuit with a bad signature", async () => {
        await init();
        const msg = bigInt(1234);

        const prvKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090001", "hex");

        const pubKey = eddsa.prv2pub(prvKey);


        const signature = eddsa.signMiMC(prvKey, msg);

        assert(eddsa.verifyMiMC(msg, signature, pubKey));

        const w = circuit.calculateWitness({
            enabled: 0,
            Ax: pubKey[0],
            Ay: pubKey[1],
            R8x: signature.R8[0].add(bigInt(1)),
            R8y: signature.R8[1],
            S: signature.S,
            M: msg});

        assert(circuit.checkWitness(w));
    });
});
it.runWhen(import.meta.url);
