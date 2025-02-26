import { blake512 } from '@noble/hashes/blake1';
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

describe("Baby Jub test", function () {
    let circuitAdd;
    let circuitTest;
    let circuitPbk;

    const init = async() => {
        const cirDefAdd = await compiler(path.join(__dirname, "circuits", "babyadd_tester.circom"));
        circuitAdd = new snarkjs.Circuit(cirDefAdd);

        const cirDefTest = await compiler(path.join(__dirname, "circuits", "babycheck_test.circom"));
        circuitTest = new snarkjs.Circuit(cirDefTest);

        const cirDefPbk = await compiler(path.join(__dirname, "circuits", "babypbk_test.circom"));
        circuitPbk = new snarkjs.Circuit(cirDefPbk);

    };

    it("Should add point (0,1) and (0,1)", async () => {
        await init();
        const input={
            x1: snarkjs.bigInt(0),
            y1: snarkjs.bigInt(1),
            x2: snarkjs.bigInt(0),
            y2: snarkjs.bigInt(1)
        };

        const w = circuitAdd.calculateWitness(input);

        const xout = w[circuitAdd.getSignalIdx("main.xout")];
        const yout = w[circuitAdd.getSignalIdx("main.yout")];

        assert(xout.equals(0));
        assert(yout.equals(1));
    });

    it("Should add 2 same numbers", async () => {
        await init();
        const input={
            x1: snarkjs.bigInt("17777552123799933955779906779655732241715742912184938656739573121738514868268"),
            y1: snarkjs.bigInt("2626589144620713026669568689430873010625803728049924121243784502389097019475"),
            x2: snarkjs.bigInt("17777552123799933955779906779655732241715742912184938656739573121738514868268"),
            y2: snarkjs.bigInt("2626589144620713026669568689430873010625803728049924121243784502389097019475")
        };

        const w = circuitAdd.calculateWitness(input);

        const xout = w[circuitAdd.getSignalIdx("main.xout")];
        const yout = w[circuitAdd.getSignalIdx("main.yout")];

        assert(xout.equals(snarkjs.bigInt("6890855772600357754907169075114257697580319025794532037257385534741338397365")));
        assert(yout.equals(snarkjs.bigInt("4338620300185947561074059802482547481416142213883829469920100239455078257889")));
    });

    it("Should add 2 different numbers", async () => {
        await init();
        const input={
            x1: snarkjs.bigInt("17777552123799933955779906779655732241715742912184938656739573121738514868268"),
            y1: snarkjs.bigInt("2626589144620713026669568689430873010625803728049924121243784502389097019475"),
            x2: snarkjs.bigInt("16540640123574156134436876038791482806971768689494387082833631921987005038935"),
            y2: snarkjs.bigInt("20819045374670962167435360035096875258406992893633759881276124905556507972311")
        };

        const w = circuitAdd.calculateWitness(input);

        const xout = w[circuitAdd.getSignalIdx("main.xout")];
        const yout = w[circuitAdd.getSignalIdx("main.yout")];

        /*
        console.log(xout.toString());
        console.log(yout.toString());
        */

        assert(xout.equals(snarkjs.bigInt("7916061937171219682591368294088513039687205273691143098332585753343424131937")));
        assert(yout.equals(snarkjs.bigInt("14035240266687799601661095864649209771790948434046947201833777492504781204499")));
    });

    it("Should check 0 is a valid poiny", async() => {
        await init();
        const w = circuitTest.calculateWitness({x: 0, y:1});
        assert(circuitTest.checkWitness(w));
    });

    it("Should check 0 is an invalid poiny", async() => {
        await init();
        try {
            circuitTest.calculateWitness({x: 1, y: 0});
            assert(false, "Should be a valid point");
        } catch(err) {
            assert(/Constraint\sdoesn't\smatch(.*)168700\s!=\s1/.test(err.message) );
            assert(err.message.indexOf("168700 != 1") >= 0);
        }
    });

    it("Should extract the public key from the private one", async () => {
        await init();
        const rawpvk = Buffer.from("0001020304050607080900010203040506070809000102030405060708090021", "hex");
        const pvk    = eddsa.pruneBuffer(blake512(rawpvk).subarray(0, 32));
        const S      = bigInt.leBuff2int(pvk).shr(3);

        const A      = eddsa.prv2pub(rawpvk);

        const input = {
            in : S,
            Ax : A[0],
            Ay : A[1]
        }

        const w = circuitPbk.calculateWitness(input);
        assert(circuitPbk.checkWitness(w));
    });

});
it.runWhen(import.meta.url);
