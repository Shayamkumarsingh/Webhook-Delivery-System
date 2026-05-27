import crypto from "crypto";

export const generateSignature = (payload, secret) => {
    return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
};