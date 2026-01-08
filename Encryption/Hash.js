const crypto = require("crypto");

function hash(input){
    if (input == null){
        return null;
    }
    const hash = crypto.createHash("sha256")
    .update(input, "utf8")
    .digest("base64");
    return hash;
}

module.exports = {hash}