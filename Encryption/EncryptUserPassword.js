const crypto = require("crypto");
//const {setSecurityPassword,getSecurityPassword} = require('./../');
const {setSecurityPassword,getSecurityPassword} = require('./../SecurityPassword/SecurityPassword.js');
const {setUserEncryptionKey,getUserEncryptionKey} = require('./../Encryption/UserPasswordEncryptionKey.js');

async function encryptUserPassword(userPassword){
  let key = await getUserEncryptionKey();
  console.log("klucz szyfrowania:", key);
  if(key && key !== null){
    return encrypt(userPassword, key);
  }
  return null;
}

async function decryptUserPassword(userPassword){
  let key = await getUserEncryptionKey();
  if(key && key !== null){
    return decrypt(userPassword, key);
  }
  return null;
}

function decrypt(input, SECRET_KEY){
  if(input==null){
    return null;
  }const{iv,tag,data}=JSON.parse(input);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    SECRET_KEY,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  let decrypted = decipher.update(data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function encrypt(input, SECRET_KEY) {
  if(input == null){
    return null;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", SECRET_KEY, iv);

  let encrypted = cipher.update(input, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");
  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: authTag,
    data: encrypted
  });
}

module.exports = { encryptUserPassword, decryptUserPassword };