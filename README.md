
Original Repo
https://github.com/near/mpc-recovery/blob/develop/README.md


## near project
https://github.com/near/mpc-recovery/

## Currentnly methods available : 

- /claim_oidc


- Create Accont 
  [POST] /new_account

- SIGN
  [POST]  /sign

- MPC Public Key
  [GET] /mpc_public_key
  


## OIDC Token Ownership Claim Flow

1. **Client-side Developer:**
   - Hardcodes MPC PK (Compare with `/mpc_public_key`).

2. **Client Generates Key Pair:**
   - Stores key pair in the device (used for transactions).

3. **Client Receives OIDC Id Token:**
   - Obtains OIDC Id Token from the authentication provider.

4. **Claim Ownership of the Token:**
   - Sends a request to `/claim_oidc_token` endpoint.

5. **Claim Response:**
   - Receives a signature signed by the MPC system.

6. **User Verifies the Signature:**
   - Ensures the signature is valid, confirming node visibility.

7. **Client Safely Sends Id Token:**
   - Can now safely send the Id Token with `/sign` or other requests.

8. **Token Expiration and Renewal:**
   - After token expiration, the client can claim a new one.
   - Continues using the MPC Recovery service.

---

### Flowchart:

```plaintext
+---------------------+      +---------------------+      +---------------------+
|  Client-side        |      |  Client Generates   |      |  Client Receives    |
|  Developer          |      |  Key Pair           |      |  OIDC Id Token      |
|                     |      |                     |      |                     |
+----------+----------+      +----------+----------+      +----------+----------+
           |                            |                            |
           v                            v                            v
+---------------------+      +---------------------+      +---------------------+
|  Hardcode MPC PK    |      |  Store Key Pair in  |      |  Receive OIDC Id    |
|  (Compare with      |      |  Device             |      |  Token from         |
|  /mpc_public_key)   |      |                     |      |  Authentication     |
+---------------------+      +---------------------+      |  Provider           |
                                       |                  +---------------------+
                                       v
+---------------------+      +---------------------+
|  Claim Ownership    |      |  Claim Response     |
|  of OIDC Token      |      |  (Receive Signature)|
|  (Send to           |      |                     |
|  /claim_oidc_token) |      +---------------------+
+---------------------+                |
                                       v
+---------------------+      +---------------------+
|  User Verifies      |      |  Client Safely      |
|  Signature          |      |  Sends Id Token     |
|  (Validates)        |      |  (/sign or other)   |
+---------------------+      +---------------------+
                                       |
                                       v
+---------------------+      +---------------------+
|  Token Expiration   |      |  Client Claims New  |
|  and Renewal        |      |  Token (Continues   |
|                     |      |  using MPC Recovery |
+---------------------+      |  service)           |
                             +---------------------+

```

---

In order to use the MPC Recovery service, the client must follow the steps outlined in the flowchart above. The client-side developer hardcodes the MPC Public Key and generates a key pair for the user. The client then receives an OIDC Id Token from the authentication provider. The client sends the Id Token to the MPC Recovery service to claim ownership of the token. The client receives a signature from the MPC system, which the user verifies. Once the signature is validated, the client can then create a new account by sending the desired account ID and the user's private key to the MPC Recovery service. 
The client can claim a new one and continue using the MPC Recovery service.

### Environment File

Create a `.env.development` file in the root directory with the following environment variables:

```plaintext
ENABLE_CORS=true

# only relevant if ENABLE_CORS is true
ALLOWED_HEADERS=Content-Type, Authorization
ALLOWED_ORIGINS=true

APP_NAME=mpc-wallid
DEBUG=mpc-wallid:*
NODE_ENV=development
PORT=3000

DB_TYPE=mongo-memory
DB_NAME=mpc-wallid
COMPLEMENT=?retryWrites=true&w=majority&authSource=admin

MPC_NODE_URL=http://127.0.0.1:3001

NEAR_ADMIN_ID=mpc-wallid.testnet
```	

### API Endpoints:
- **MPC Public Key:**
   - **Method:** `GET`
   - **Route:** `/mpc_public_key`
   - **Response:**
      ```json
      {
         "public_key": "ed25519:..."
      }
- **Create Account:**
  - **Method:** `POST`
  - **Route:** `/new_account`
  - **Request Body:**
    ```json
    {
     "nearAccountId": "nearAccountId",
    "createAccountOptions": {
        "userPrivateKey": "userPrivateKey"
    },
    "oidcToken": "oidcToken",
    "userCredentialsFrpSignature": "userCredentialsFrpSignature",
    "frpPublicKey": "frpPublicKey"
    }
    ```
  - **Response:**
    ```json
    {
      "account_id": "alice",
      "public_key": "ed25519:...",
      "account_id": "alice"
      }
      ```

- **Claim OIDC Token:**
   - **Method:** `POST`
   - **Route:** `/claim_oidc_token`
   - **Request Body:**
      ```json
      {
         "oidcTokenHash": "eyJhb",
         "FRPSignatureHash": "SHA256",
         "frpPublicKey": "ed25519:..."
      }
      ```
   - **Response:**
      ```json
      {
         "signature": "ed25519"
      }
      ```
- **Sign:**
   - **Method:** `POST`
   - **Route:** `/sign`
   - **Request Body:**
      ```json
      {
         "message": "Hello, World!"
      }
      ```
   - **Response:**
      ```json
      {
         "signature": "ed25519"  
      }
      ```

- **Recover Account:**
   - **Method:** `POST`
   - **Route:** `/recover_account`
   - **Request Body:**
      ```json
      {
         "nearAccountId": "nearAccountId",
         "userPrivateKey": "userPrivateKey",
         "oidcToken": "oidcToken",
         "userCredentialsFrpSignature": "userCredentialsFrpSignature",
         "frpPublicKey": "frpPublicKey"
      }
      ```
   - **Response:**
      ```json
      {
         "account_id": "alice",
         "public_key": "ed25519:...",
         "account_id": "alice"
      }

---
      
