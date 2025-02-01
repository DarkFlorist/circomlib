import { it } from 'micro-should';

import './aliascheck.js';
//import './aliascheckbabyjub.js';
import './babyjub.js';
import './babyjub_js.js';
import './binsub.js';
import './binsum.js';
import './comparators.js';
import './eddsa.js';
import './eddsa_js.js';
import './eddsamimc.js';
import './eddsamimcsponge.js';
import './eddsaposeidon.js';
import './escalarmul.js';
import './escalarmulany.js'; // (Maximum call stack size exceeded)
import './escalarmulfix.js';
import './mimccircuit.js';

//import './mimccontract.js';
import './mimcspongecircuit.js';
//import './mimcspongecontract.js';
import './montgomery.js';
import './multiplexer.js';
import './pedersen.js';
import './pedersen2.js';
import './point2bits.js';
import './poseidoncircuit.js';
//import './poseidoncontract.js';
import './sha256.js';
import './sign.js';
import './smtjs.js';
import './smtprocessor.js';
import './smtverifier.js';
import './smtverifier_adria.js';
// New one
import './mimc.test.js';
import './mimcsponge.test.js';
import './poseidon.test.js';

it.runWhen(import.meta.url);
