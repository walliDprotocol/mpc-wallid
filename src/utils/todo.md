
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
|  Client-side       |      |  Client Generates   |      |  Client Receives    |
|  Developer         |      |  Key Pair           |      |  OIDC Id Token      |
|                     |      |                     |      |                     |
+----------+----------+      +----------+----------+      +----------+----------+
           |                            |                            |
           v                            v                            v
+---------------------+      +---------------------+      +---------------------+
|  Hardcode MPC PK    |      |  Store Key Pair in  |      |  Receive OIDC Id    |
|  (Compare with      |      |  Device             |      |  Token from          |
|  /mpc_public_key)    |      |                     |      |  Authentication     |
+---------------------+      +---------------------+      |  Provider           |
                                       |                    +---------------------+
                                       v
+---------------------+      +---------------------+
|  Claim Ownership    |      |  Claim Response     |
|  of OIDC Token      |      |  (Receive Signature)|
|  (Send to           |      |                     |
|  /claim_oidc_token) |      +---------------------+
+---------------------+                 |
                                       v
+---------------------+      +---------------------+
|  User Verifies      |      |  Client Safely      |
|  Signature           |      |  Sends Id Token     |
|  (Validates)         |      |  (/sign or other)   |
+---------------------+      +---------------------+
                                       |
                                       v
+---------------------+      +---------------------+
|  Token Expiration   |      |  Client Claims New  |
|  and Renewal        |      |  Token (Continues   |
|                     |      |  using MPC Recovery |
+---------------------+      |  service)           |
                              +---------------------+
