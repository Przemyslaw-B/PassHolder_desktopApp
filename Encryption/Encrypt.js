const crypto = require("crypto");
const SECRET_KEY = crypto.createHash("sha256") .update("Klucz_szyfrowania").digest();


function encrypt(input) {
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

function decrypt(input){
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

module.exports = { encrypt, decrypt };