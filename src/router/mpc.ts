/**
 * @file This file contains the MPC router for handling MPC-related routes.
 * @module router/mpc
 */

import { Router, Request, Response } from 'express';
import { sha256 } from 'js-sha256';

import {
  claimOidc,
  createAccount,
  getMpcPublicKey,
  getUserCredentials,
  recoverAccount,
  storeAccount,
  findAccountByOIDC,
} from 'src/services/mpc';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('router:mpc');

const router = Router();

/**
 * Route for signing.
 * @name GET /sign
 * @function
 * @async
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
router.get('/sign', async (req: Request, res: Response) => {
  logDebug('Route /balance', req.user);

  try {
    res.send({ pub: 'public key' });
  } catch (error) {
    logError(error);
  }
});

/**
 * Route for getting the MPC public key.
 * @name GET /mpc_public_key
 * @function
 * @async
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
router.get('/mpc_public_key', async (req: Request, res: Response) => {
  logDebug('Route /mpc_public_key', req.user);

  try {
    const publicKey = await getMpcPublicKey();
    res.send(publicKey);
  } catch (error) {
    logError(error);
  }
});

/**
 * Route for claiming OIDC.
 * @name POST /claim_oidc
 * @function
 * @async
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {string} req.body.oidcTokenHash - The OIDC token hash.
 * @param {string} req.body.FRPPublicKey - The FRP public key.
 * @param {string} req.body.FRPSignatureHash - The FRP signature hash.
 */
router.post('/claim_oidc', async (req: Request, res: Response) => {
  logDebug('Route /claim_oidc', req.user);

  try {
    const { oidcTokenHash, FRPPublicKey, FRPSignatureHash } = req.body;

    const claimOidcResponse = await claimOidc(sha256.array(oidcTokenHash), new Uint8Array(FRPPublicKey), new Uint8Array(FRPSignatureHash));

    res.send(claimOidcResponse);
  } catch (error) {
    logError(error);
  }
});

/**
 * Route for getting user credentials.
 * @name POST /user_credentials
 * @function
 * @async
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {string} req.body.oidcTokenHash - The OIDC token hash.
 * @param {string} req.body.FRPPublicKey - The FRP public key.
 * @param {string} req.body.FRPSignatureHash - The FRP signature hash.
 */
router.post('/user_credentials', async (req: Request, res: Response) => {
  logDebug('Route /user_credentials', req.user);

  try {
    const { oidcTokenHash, FRPPublicKey, FRPSignatureHash } = req.body;
    const userCredentialsResponse = await getUserCredentials(sha256.array(oidcTokenHash), new Uint8Array(FRPPublicKey), new Uint8Array(FRPSignatureHash));

    res.send(userCredentialsResponse);
  } catch (error) {
    logError(error);
  }
});

/**
 * Route for creating a new account.
 * @name POST /new_account
 * @function
 * @async
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {string} req.body.nearAccountId - The NEAR account ID.
 * @param {object} req.body.createAccountOptions - The options for creating the account.
 * @param {string} req.body.oidcToken - The OIDC token.
 * @param {string} req.body.userCredentialsFrpSignature - The user credentials FRP signature.
 * @param {string} req.body.FRPPublicKey - The FRP public key.
 * @returns {{
 *  accountId: string,
 *  recoveryPublicKey: string,
 * }} The response object.
 */
router.post('/new_account', async (req: Request, res: Response) => {
  logDebug('Route /new_account', req.user);

  try {
    const {
      nearAccountId, createAccountOptions, oidcToken, userCredentialsFrpSignature, FRPPublicKey,
    } = req.body;

    const newAccountResponse = await createAccount(nearAccountId, createAccountOptions);

    const storeAccountResponse = await storeAccount({
      account: newAccountResponse, oidcToken, userCredentialsFrpSignature, FRPPublicKey,
    });

    res.send(storeAccountResponse);
  } catch (error:any) {
    logError(error);
    res.status(500).send({ error: error.message, nearAccountId: req.body.nearAccountId });
  }
});

/**
 * Route for recovering an account.
 * @name POST /recover_account
 * @function
 * @async
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {string} req.body.nearAccountId - The NEAR account ID.
 * @param {string} req.body.oidcToken - The OIDC token.
 * @param {object} req.body.createAccountOptions - The options for creating the account.
 * @returns {object} The response object.
 */
router.post('/recover_account', async (req: Request, res: Response) => {
  logDebug('Route /recover_account', req.user);

  try {
    const {
      oidcToken, createAccountOptions, userCredentialsFrpSignature,
    } = req.body;

    const account = await recoverAccount(oidcToken, createAccountOptions.userPrivateKey, userCredentialsFrpSignature);

    const oldAccount = await findAccountByOIDC(oidcToken);

    logDebug('oldAccount', oldAccount);

    res.send(account);
  } catch (error:any) {
    logError(error);
    res.status(500).send({ error });
  }
});

export default router;
