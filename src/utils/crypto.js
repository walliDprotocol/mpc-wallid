
let genKeys= async function(odic){
  const ed = await import('@noble/ed25519')
  const privKey = ed.utils.randomPrivateKey(); // Secure random private key
  const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
  const pubKey = await ed.getPublicKeyAsync(privKey);
  const signature = await ed.signAsync(message, privKey);
  const isValid = await ed.verifyAsync(signature, message, pubKey);
  return {privKey, pubKey, signature }
}

let getOidc = async function (){
  let salt = SALT = "SALT = 3177899144"
}

let sign= async function(prvKey, message){
return "NA"
}

let run = async function(){
  console.log('Gen Keys ', await genKeys('') );
}

console.log('Gen Keys ',  run('') );

