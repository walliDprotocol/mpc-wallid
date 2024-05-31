import { log } from 'console';
import { sha256 } from 'js-sha256';
import { serialize } from 'borsh';
import { SALT, Uint8ArraySchema, mergeUInt8Arrays } from 'src/constants';
import { getUserCredentials } from 'src/services/mpc';

// const { createAccount } = require('../../src/services/mpc');
// const { getMpcPublicKey } = require('../../src/services/mpc');

let oidcTokenHash: number[];
let FRPPublicKey: Uint8Array;
let FRPHash:string;
let FRPSignatureHash: Uint8Array;
const zero = new Uint8Array([0]);

beforeAll(() => {
  oidcTokenHash = sha256.array('oidc_token');
  log('oidcTokenHash', oidcTokenHash);

  FRPPublicKey = new TextEncoder().encode('frp_public_key');
  log('FRPPublicKey', FRPPublicKey);

  // simulate salt and oidc
  FRPHash = sha256(mergeUInt8Arrays(mergeUInt8Arrays(
    serialize('u32', SALT + 0),
    serialize(Uint8ArraySchema, oidcTokenHash),
  ), mergeUInt8Arrays(zero, serialize(Uint8ArraySchema, FRPPublicKey))));
  log('FRPHash', FRPHash);
  FRPSignatureHash = new TextEncoder().encode(FRPHash);
});

describe('User Credentials', () => {
  // eslint-disable-next-line import/extensions
  it('test /user_credentials endpoint', async () => {
    const claim = await getUserCredentials(oidcTokenHash, FRPPublicKey, FRPSignatureHash);

    log('claim', claim);
  });
});
