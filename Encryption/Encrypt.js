const crypto = require("crypto");

function encrypt(password, publicKey) {
  if(password == null){
    return null;
  }
  const newKey =  base64ToPem(publicKey)
  const buffer = Buffer.from(password, "utf8");
  const encrypted = crypto.publicEncrypt(newKey, buffer);
  return encrypted.toString("base64");
}

function base64ToPem(base64Key){
  const keyLine = base64Key.match(/.{1,64}/g).join('\n');
  const key = `-----BEGIN PUBLIC KEY-----\n${keyLine}\n-----END PUBLIC KEY-----`;
  return key;
}

module.exports = { encrypt };