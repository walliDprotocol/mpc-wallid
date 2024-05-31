import * as nearAPI from 'near-api-js';
import config from 'src/config';

const { logDebug, logError } = require('src/core-services/logFunctionFactory').getLogger('lib:near');

const {
  connect, keyStores, KeyPair, utils,
} = nearAPI;

const PRIVATE_KEY = 'ed25519:3NQ9537yeLoML6nv5Jmy2i8rAwndssgqsP2tz9kt7Sm7KzQdPczb8MPA8q2LyyLz2tRdqTcfSWyGzsvFP19HWzzp';
const { NEAR_ADMIN_ID } = config;

// cry nose banana video renew favorite then protect pause loyal crowd exist

class NearHelper {
  private config: nearAPI.ConnectConfig;

  // private keyStore: nearAPI.keyStores.UnencryptedFileSystemKeyStore;
  private keyStore: nearAPI.keyStores.InMemoryKeyStore;

  private keyPair: nearAPI.utils.KeyPair;

  private nearConnection?: nearAPI.Near;

  constructor() {
    // this.keyStore = new keyStores.UnencryptedFileSystemKeyStore('/tmp/near-api-js-testnet');
    this.keyStore = new keyStores.InMemoryKeyStore();
    this.config = {
      networkId: 'testnet',
      deps: { keyStore: this.keyStore },
      masterAccount: NEAR_ADMIN_ID,
      nodeUrl: 'https://rpc.testnet.near.org',
    };
    this.keyPair = utils.KeyPair.fromString(PRIVATE_KEY);
  }

  async connect() {
    this.nearConnection = await connect(this.config);
  }

  setCreatorAccountId(masterAccount: string) {
    this.config.masterAccount = masterAccount;
  }

  getMasterAccountId() {
    return this.config.masterAccount;
  }

  getPublicKey() {
    return this.keyPair.getPublicKey();
  }

  async checkIfAccountExists(accountId: string) {
    if (!this.nearConnection) {
      return { error: 'Not initialized' };
    }

    try {
      const account = await this.nearConnection.account(accountId);
      const state = await account.state();
      logDebug('state', state);
      return state;
    } catch (error: any) {
      if (error?.type === 'AccountDoesNotExist') {
        return false;
      }
      logError('error', error);
      return false;
    }
  }

  async addKey(accountId: string, userPrivateKey: string) {
    if (!this.nearConnection) {
      throw new Error('Not initialized');
    }
    const masterAccount = this.getMasterAccountId();
    if (!masterAccount) {
      throw new Error('Not initialized');
    }

    // await this.connect();

    const newKeyPair = KeyPair.fromString(userPrivateKey);

    await this.keyStore.setKey(this.config.networkId, accountId, this.keyPair);
    // await this.keyStore.setKey(this.config.networkId, accountId, newKeyPair);

    const account = await this.nearConnection.account(accountId);
    logDebug('newKeyPair.getPublicKey', newKeyPair.getPublicKey().toString(), accountId);

    const tx = await account.addKey(newKeyPair.getPublicKey().toString());
    logDebug('tx', tx);

    return account;
  }

  async createAccount(newAccountId: string, amount: string, { userPrivateKey }: { userPrivateKey : string }) {
    if (!this.nearConnection) {
      throw new Error('Not initialized');
    }

    const masterAccount = this.getMasterAccountId();

    if (!masterAccount) {
      throw new Error('Not initialized');
    }

    logDebug('createAccount', this.config, newAccountId, amount, userPrivateKey);

    await this.keyStore.setKey(this.config.networkId, masterAccount, this.keyPair);

    const alreadyExists = await this.checkIfAccountExists(`${newAccountId}.${NEAR_ADMIN_ID}`);
    if (alreadyExists) {
      logError('account exists');
      throw new Error('Account already exists');
      // return { newAccountId, error: '' };
    }

    const creatorAccount = await this.nearConnection.account(masterAccount);
    logDebug('creatorAccount', creatorAccount);
    const publicKey = this.keyPair.getPublicKey();
    logDebug('creatorAccount.getPublicKey', publicKey.toString());

    const newAccountTx = await creatorAccount.createAccount(`${newAccountId}.${NEAR_ADMIN_ID}`, publicKey, BigInt(amount));
    logDebug('newAccount', newAccountTx);
    const newAccount = await this.addKey(`${newAccountId}.${NEAR_ADMIN_ID}`, userPrivateKey);

    return newAccount;
  }

  async recoverAccount(accountId:string, userPrivateKey: string) {
    const masterAccount = this.getMasterAccountId();

    if (!masterAccount) {
      return { error: 'Not initialized' };
    }

    await this.keyStore.setKey(this.config.networkId, masterAccount, this.keyPair);

    const newAccount = await this.addKey(`${accountId}`, userPrivateKey);

    return newAccount;
  }

  async deleteAccount(newAccountId: string) {
    const masterAccount = this.getMasterAccountId();

    if (!masterAccount) {
      return { error: 'Not initialized' };
    }

    const creatorAccount = await this.nearConnection?.account(masterAccount);
    await creatorAccount?.deleteAccount(newAccountId);

    return {
      newAccountId,
      status: 'deleted',
    };
  }
}

export default NearHelper;
