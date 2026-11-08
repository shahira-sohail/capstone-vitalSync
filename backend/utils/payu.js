
const crypto = require("crypto");

const generatePaymentHash = ({
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
}, salt) => {
    const hashString = [
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        udf1,
        udf2,
        udf3,
        udf4,
        udf5,
        "",
        "",
        "",
        "",
        "",
        salt,
    ].join("|");

    return crypto
        .createHash("sha512")
        .update(hashString)
        .digest("hex");
};

const generateVerifyPaymentHash = (key, txnid, salt) => {
    const hashString = `${key}|verify_payment|${txnid}|${salt}`;
    return crypto
        .createHash("sha512")
        .update(hashString)
        .digest("hex");
};


const verifyPaymentHash = (response, salt) => {
    const {
        status,
        udf1 = "",
        udf2 = "",
        udf3 = "",
        udf4 = "",
        udf5 = "",
        email,
        firstname,
        productinfo,
        amount,
        txnid,
        key,
        hash,
    } = response;

    if (!status || !email || !firstname || !productinfo ||
        !amount || !txnid || !key || !hash || !salt) {
        return false;
    }
    const additionalCharges =
        response.additional_charges ?? response.additionalCharges;

    const hashParts = [
        status,
        "",
        "",
        "",
        "",
        "",
        udf5,
        udf4,
        udf3,
        udf2,
        udf1,
        email,
        firstname,
        productinfo,
        amount,
        txnid,
        key,
    ];

    const reverseHashString = additionalCharges !== undefined
        ?[additionalCharges, salt, ...hashParts].join("|")
        :[salt, ...hashParts].join("|");

    const expectedHash = crypto
        .createHash("sha512")
        .update(reverseHashString)
        .digest("hex");

    const receivedHash = String(hash).toLowerCase();

    if (!/^[a-f0-9]{128}$/.test(receivedHash)) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(expectedHash, "hex"),
        Buffer.from(receivedHash, "hex")
    );
};

const verifyPaymentWithPayU = async (txnid) => {
    const key = process.env.PAYU_KEY;
    const salt = process.env.PAYU_SALT;
    const baseUrl = process.env.PAYU_BASE_URL;

    if (!key || !salt || !baseUrl) {
        throw new Error("PayU configuration is missing");
    }

    const hash = generateVerifyPaymentHash(key, txnid, salt);

    const formData = new URLSearchParams({
        key,
        command: "verify_payment",
        var1: txnid,
        hash,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 15000);
    let response;
    try{
        response = await fetch(
            `${baseUrl}/merchant/postservice?form=2`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
                signal: controller.signal,
            }
        );
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        throw new Error("PayU verification request failed");
    }

    return await response.json();
};

module.exports = {
    generatePaymentHash,
    verifyPaymentHash,
    generateVerifyPaymentHash,
    verifyPaymentWithPayU
};
