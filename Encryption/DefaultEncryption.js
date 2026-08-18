const crypto = require("crypto");

let encryptionKey = null;

async function setDefaultEncryptionKey(userPassword) {
    if (!userPassword) {
        throw new Error("Brak hasła użytkownika");
    }
    encryptionKey = crypto.scryptSync(
        userPassword,
        "app-static-salt",
        32
    );
    return true;
}

function defaultDecrypt(input){
  if(input===null || encryptionKey===null){
    return null;
  }
  try{
    const{iv,tag,data}=JSON.parse(input);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey,
    Buffer.from(iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  let decrypted = decipher.update(data, "base64", "utf8");
  decrypted += decipher.final("utf8");
  if(decrypted){
    return {success: true, data: decrypted};
  }
  return {success: false, error: "nie można odszyfrować"};
  }catch(error){
    return {success: false, error: "nie można odszyfrować"};
  }
}

function defaultEncrypt(input) {
  if(input === null || encryptionKey===null){
    return null;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);

  let encrypted = cipher.update(input, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");
  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: authTag,
    data: encrypted
  });
}

module.exports = {setDefaultEncryptionKey, defaultDecrypt, defaultEncrypt};