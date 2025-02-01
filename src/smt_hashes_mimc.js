const mimc7 = require("./mimc7");
const bigInt = require("snarkjs").bigInt;

exports.hash0 = function (left, right) {
    return bigInt(mimc7.multiHash(left, right));
};

exports.hash1 = function(key, value) {
    return bigInt(mimc7.multiHash([key, value], BigInt(1)));
};
