import { Schema } from 'mongoose';

const oidcToken = new Schema(
  {
    oidcTokenHash: String,
    accountId: String,
    mpcSignature: String,
  },
  {
    collection: 'oidcToken',
    versionKey: false,
  },
);
oidcToken.set('timestamps', true);

oidcToken.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString(); // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject._id; // eslint-disable-line no-param-reassign, no-underscore-dangle
    delete returnedObject.__v; // eslint-disable-line no-param-reassign, no-underscore-dangle
  },
});

export = { schema: oidcToken };
