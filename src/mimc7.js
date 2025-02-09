const { keccak_256 } = require('@noble/hashes/sha3');
const { bn254 } = require('@noble/curves/bn254');
const Fr = bn254.fields.Fr;

const SEED = "mimc";
const NROUNDS = 91;

function toFr(x) {
    if (typeof x === 'bigint') return x;
    if (typeof x === 'number') return Fr.create(BigInt(x));
    return Fr.create(x.value);
}

exports.getIV = (seed = SEED) => {
    return Fr.create(Fr.fromBytes(keccak_256(`${seed}_iv`)));
};

exports.getConstants = (seed = SEED, nRounds = NROUNDS) => {
    const cts = new Array(nRounds);
    let c = keccak_256(SEED);
    for (let i=1; i<nRounds; i++) {
        c = keccak_256(c);

        cts[i] = Fr.create(Fr.fromBytes(c));
    }
    cts[0] = 0n;
    return cts;
};

const cts = exports.getConstants(SEED, 91);

exports.hash =  (_x_in, _k) =>{
    const x_in = BigInt(_x_in);
    const k = BigInt(_k);
    let r;
    for (let i=0; i<NROUNDS; i++) {
        const t = (i==0) ? Fr.addN(x_in, k) : Fr.addN(Fr.addN(r, k), cts[i]);
        r = Fr.pow(t, BigInt(7));
    }
    return Fr.add(r, k);
};

exports.multiHash = (arr, key = Fr.ZERO) => {
    let r = toFr(key);
    arr = arr.map(toFr);
    for (let i=0; i<arr.length; i++) {
        r = Fr.addN(Fr.addN(r, arr[i]), exports.hash(BigInt(arr[i]), r));
    }
    return Fr.create(r);
};
