const { z } = require("zod");

const paymentCallbackSchema = z.object({
    key: z.string().min(1),
    txnid: z.string().min(1),
    amount: z.string().min(1),
    productinfo: z.string().min(1),
    firstname: z.string().min(1),
    email: z.string().email(),

    status: z.string().min(1),
    hash: z.string().min(1),
}).passthrough();

module.exports = {
    paymentCallbackSchema,
};