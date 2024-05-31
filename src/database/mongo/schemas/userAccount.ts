import { Schema } from 'mongoose';

const userAccount = new Schema(
  {
    accountId: String,
    oidcToken: String,
    recoveryPublicKey: [String],
    userCredentials: String,
    FRPPublicKey: String,

  },
  {
    collection: 'userAccount',
    versionKey: false,
  },
);
userAccount.set('timestamps', true);

userAccount.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject._id; // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject.__v; // eslint-disable-line no-param-reassign, no-underscore-dangle
  },
});

export = { schema: userAccount };
