import {
  deepStrictEqual
} from 'node:assert';
const assert = function(clause) { assert.equal( true, clause) };
assert.equal = deepStrictEqual;
export { assert };
