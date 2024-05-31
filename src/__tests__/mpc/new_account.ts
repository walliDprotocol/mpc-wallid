import { log } from 'console';
import { sha256 } from 'js-sha256';
import { serialize } from 'borsh';
import { SALT, Uint8ArraySchema, mergeUInt8Arrays } from 'src/constants';
import { createAccount } from 'src/services/mpc';
import NearHelper from 'src/lib/near';
import config from 'src/config';

const { NEAR_ADMIN_ID } = config;
const nearTestId = 'mcp-test.testnet';

let oidcTokenHash: number[];
let FRPPublicKey: Uint8Array;
let FRPHash:string;
let FRPSignatureHash: Uint8Array;
const zero = new Uint8Array([0]);
const nearHelper = new NearHelper();

beforeAll(async () => {
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

  await nearHelper.connect();
});

afterAll(() => {
  // delete the account
  nearHelper.deleteAccount(nearTestId);
});

describe('Create a new Near account', () => {
  // eslint-disable-next-line import/extensions
  it('test /new_account endpoint', async () => {
    const newAccountId = await createAccount('mcp-test.testnet', {}, 'oidcToken', 'userCredentials', FRPSignatureHash);

    log('newAccountId', newAccountId);

    expect(newAccountId).toBeDefined();
  });
});
