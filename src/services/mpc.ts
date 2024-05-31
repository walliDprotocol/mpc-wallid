import * as nearAPI from 'near-api-js';

import { serialize } from 'borsh';
import { sha256 } from 'js-sha256';

import config from 'src/config';
import { SALT, Uint8ArraySchema, mergeUInt8Arrays } from 'src/constants';

import { Database } from 'src/database';
import { DataBaseSchemas } from 'src/types/enums';

import NearHelper from 'src/lib/near';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('service:mpc');

const { MPC_NODE_URL } = config;

const MPC_PUBLIC_KEY_ENDPOINT = '/api/v1/auth/mpc_public_key';

export async function createAccount(nearAccountId: string, createAccountOptions: any):Promise<nearAPI.Account> {
  // create a new account on the NEAR blockchain
  // return the account id
  try {
    const nearHelper = new NearHelper();
    logDebug('nearHelper', nearHelper);

    await nearHelper.connect();
    logDebug('connected to NEAR');

    const nearAccount = await nearHelper.createAccount(nearAccountId, '1000000000000000000000', createAccountOptions);
    logDebug('nearAccount', nearAccount);

    return nearAccount;
  } catch (error) {
    logError(error);
    // if there is an error
    throw error;
  }
}

export function getMpcPublicKey() {
  const url = `${MPC_NODE_URL}${MPC_PUBLIC_KEY_ENDPOINT}`;
  logDebug('getMpcPublicKey', url);
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      logDebug('getMpcPublicKey', data);
      return data;
    })
    .catch((error) => {
      logError(error);
      return error;
    });
}

export function mpcSign(mpcHash: string) {
  // call the MPC node to sign the hash
  // return the signature
  const url = `${MPC_NODE_URL}/api/v1/sign/`;
  logDebug('mpcSign', url);
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ msg: mpcHash }),
  })
    .then((res) => res.json())
    .then((data) => {
      logDebug('mpcSign', data);
      return data;
    })
    .catch((error) => {
      logError(error);
      return error;
    });
}

export async function claimOidc(oidcTokenHash: number[], FRPPublicKey: Uint8Array, FRPSignatureHash: Uint8Array) {
  // check if token is already claimed by doing a lookup on the database
  // if it is, return the token
  try {
    const dbOidcTokenHash = await Database.findOne(DataBaseSchemas.OIDC_TOKEN, { oidcTokenHash });

    logDebug('dbOidcTokenHash', dbOidcTokenHash);

    if (!dbOidcTokenHash) {
      const mpcHash = sha256(mergeUInt8Arrays(serialize('u32', SALT + 1), serialize(Uint8ArraySchema, FRPSignatureHash)));

      const mpcSignature = await mpcSign(mpcHash);

      const claim = {
        oidcTokenHash,
        mpcSignature,
        // accountId
      };

      // store the claim in the database
      logDebug('claim', claim);
      const newClaimResult = await Database.create(DataBaseSchemas.OIDC_TOKEN, claim, {});
      logDebug('newClaimResult', newClaimResult);
      return newClaimResult;
    }
    return dbOidcTokenHash;
  } catch (error) {
    logError(error);
    return error;
  }
}

/**
 * Returns the userCredentials associated with the provided OIDC token.
 * @param oidcTokenHash
 * @param FRPPublicKey
 * @param FRPSignatureHash
 */

export async function getUserCredentials(oidcTokenHash: number[], FRPPublicKey: Uint8Array, FRPSignatureHash: Uint8Array) {
  // check if token is already claimed by doing a lookup on the database
  // if it is, return the claim
  try {
    const dbOidcTokenHash = await Database.findOne(DataBaseSchemas.ACCOUNT, { oidcTokenHash, FRPPublicKey, FRPSignatureHash });
    logDebug('dbOidcTokenHash', dbOidcTokenHash);

    return dbOidcTokenHash;
  } catch (error) {
    logError(error);
    throw error;
  }
  return null;
}

export async function storeAccount({
  account, oidcToken, userCredentialsFrpSignature, FRPPublicKey,
}:{ account: nearAPI.Account, oidcToken: string, userCredentialsFrpSignature:any, FRPPublicKey: Uint8Array }):
  Promise<{ accountId: string; recoveryPublicKey: string[] }> {
  try {
    const accountDB = {
      accountId: account.accountId,
      recoveryPublicKey: (await account.getAccessKeys()).map((key) => key.public_key.toString()),
      oidcToken,
      userCredentials: userCredentialsFrpSignature,
      FRPPublicKey,
    };

    logDebug('account', accountDB);

    const newAccountResult = await Database.create(DataBaseSchemas.ACCOUNT, accountDB);

    logDebug('newAccountResult', newAccountResult);
    return { accountId: account.accountId, recoveryPublicKey: accountDB.recoveryPublicKey };
  } catch (error: any) {
    logError(error);
    throw error;
  }
}

export async function recoverAccount(oidcToken: string, userPrivateKey: string, userCredentials: string) {
  logDebug('recoverAccount', oidcToken, userPrivateKey, userCredentials);
  try {
    const account = await Database.findOne(DataBaseSchemas.ACCOUNT, { oidcToken, userCredentials });
    logDebug('account', account);

    if (!account) {
      throw new Error('Account not found');
    }

    const nearHelper = new NearHelper();

    await nearHelper.connect();

    const nearAccount = await nearHelper.recoverAccount(account.accountId, userPrivateKey);

    logDebug('nearAccount', nearAccount);

    return account;
  } catch (error) {
    logError(error);
    throw error;
  }
}

export async function findAccountByOIDC(oidcToken: string) {
  try {
    const account = await Database.findOne(DataBaseSchemas.ACCOUNT, { oidcToken });

    if (!account) {
      throw new Error('Account not found');
    }

    logDebug('account', account);
    return account;
  } catch (error) {
    logError(error);
    throw error;
  }
}
