const { keccak_256 } = require('@noble/hashes/sha3');
const { bn254 } = require('@noble/curves/bn254');
const Fr = bn254.fields.Fr;

const SEED = "mimcsponge";
const NROUNDS = 220;

exports.getIV = (seed = SEED) => {
    return Fr.create(Fr.fromBytes(keccak_256(`${seed}_iv`)));;
};

exports.getConstants = (seed = SEED, nRounds = NROUNDS) => {
    const cts = new Array(nRounds);
    let c = keccak_256(SEED);
    for (let i=1; i<nRounds; i++) {
        c = keccak_256(c);
        cts[i] = Fr.create(Fr.fromBytes(c));
    }
    cts[0] = BigInt(0);
    cts[cts.length - 1] = BigInt(0);
    return cts;
};

const cts = exports.getConstants(SEED, NROUNDS);

exports.hash = (_xL_in, _xR_in, _k) =>{
    let xL = BigInt(_xL_in);
    let xR = BigInt(_xR_in);
    const k = BigInt(_k);
    for (let i=0; i<NROUNDS; i++) {
        const c = cts[i];
        const t = (i==0) ? Fr.addN(xL, k) : Fr.addN(Fr.addN(xL, k), cts[i]);
        const xR_tmp = BigInt(xR);
        if (i < (NROUNDS - 1)) {
          xR = xL;
          xL = Fr.addN(xR_tmp, Fr.pow(t, BigInt(5)));
        } else {
          xR = Fr.addN(xR_tmp, Fr.pow(t, BigInt(5)));
        }
    }
    return {
      xL: Fr.create(xL),
      xR: Fr.create(xR),
    };
};

exports.multiHash = (arr, key = Fr.ZERO, numOutputs = 1) => {
    let R = Fr.ZERO;
    let C = Fr.ZERO;

    for (let i=0; i<arr.length; i++) {
      R = Fr.addN(R, BigInt(arr[i]));
      const S = exports.hash(R, C, key);
      R = S.xL;
      C = S.xR;
    }
    let outputs = [R];
    for (let i=1; i < numOutputs; i++) {
      const S = exports.hash(R, C, key);
      R = S.xL;
      C = S.xR;
      outputs.push(R);
    }
    if (numOutputs == 1) {
      return Fr.create(outputs[0]);
    } else {
      return outputs.map((x) => Fr.create(x));
    }
};
