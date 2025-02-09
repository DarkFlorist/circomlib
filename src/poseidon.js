const { blake2b } = require('@noble/hashes/blake2b');
const { bn254 } = require('@noble/curves/bn254');
const { bytesToNumberLE } = require('@noble/curves/abstract/utils');
const Fr = bn254.fields.Fr;

const SEED = "poseidon";
const NROUNDSF = 8;
const NROUNDSP = 57;
const T = 6;

function toFr(x) {
    if (typeof x === 'bigint') return x;
    if (typeof x === 'number') return Fr.create(BigInt(x));
    return Fr.create(x.value);
}

function getPseudoRandom(seed, n) {
    const res = [];
    let h = blake2b(seed, { dkLen: 32 });
    while (res.length<n) {
        res.push(Fr.create(bytesToNumberLE(h)));
        h = blake2b(h, { dkLen: 32 });
    }

    return res;
}

function allDifferent(v) {
    for (let i=0; i<v.length; i++) {
        if (Fr.is0(v[i])) return false;
        for (let j=i+1; j<v.length; j++) {
            if (Fr.eql(v[i], v[j])) return false;
        }
    }
    return true;
}

exports.getMatrix = (t = T, seed = SEED, nRounds = NROUNDSF + NROUNDSP) => {
    let nonce = "0000";
    let cmatrix = getPseudoRandom(seed+"_matrix_"+nonce, t*2);
    while (!allDifferent(cmatrix)) {
        nonce = (Number(nonce)+1)+"";
        while(nonce.length<4) nonce = "0"+nonce;
        cmatrix = getPseudoRandom(seed+"_matrix_"+nonce, t*2);
    }

    const M = new Array(t);
    for (let i=0; i<t; i++) {
        M[i] = new Array(t);
        for (let j=0; j<t; j++) {
            M[i][j] = Fr.inv(Fr.sub(cmatrix[i], cmatrix[t + j]));
        }
    }
    return M;
};

exports.getConstants = (t = T, seed = SEED, nRounds = NROUNDSF + NROUNDSP) => {
    return getPseudoRandom(seed + '_constants', nRounds);
};

function ark(state, c) {
    for (let j=0; j<state.length; j++ ) {
        state[j] = Fr.add(state[j], c);
    }
}

function sigma(a) {
    return Fr.mul(a, Fr.sqr(Fr.sqr(a, a)));
}

function mix(state, M) {
    const newState = new Array(state.length);
    for (let i=0; i<state.length; i++) {
        newState[i] = Fr.ZERO;
        for (let j=0; j<state.length; j++) {
            newState[i] = Fr.add(newState[i], Fr.mul(M[i][j], state[j]));
        }
    }
    for (let i=0; i<state.length; i++) state[i] = newState[i];
}

exports.createHash = (t = T, nRoundsF = NROUNDSF, nRoundsP = NROUNDSP, seed = SEED) => {
    if (!(nRoundsF % 2 == 0)) throw new Error('nRoundsF % 2 == 0');
    const C = exports.getConstants(t, seed, nRoundsF + nRoundsP);
    const M = exports.getMatrix(t, seed, nRoundsF + nRoundsP);
    return function(inputs) {
        let state = [];
        if (!(inputs.length <= t)) throw new Error('inputs.length <= t');
        if (!(inputs.length > 0)) throw new Error('inputs.length > 0');
        inputs = inputs.map(toFr);
        for (let i=0; i<inputs.length; i++) state[i] = BigInt(inputs[i]);
        for (let i=inputs.length; i<t; i++) state[i] = Fr.ZERO;

        for (let i=0; i< nRoundsF + nRoundsP; i++) {
            ark(state, C[i]);
            if ((i<nRoundsF/2) || (i >= nRoundsF/2 + nRoundsP)) {
                for (let j=0; j<t; j++) state[j] = sigma(state[j]);
            } else {
                state[0] = sigma(state[0]);
            }
            mix(state, M);
        }
        return Fr.create(state[0]);
    };
};


