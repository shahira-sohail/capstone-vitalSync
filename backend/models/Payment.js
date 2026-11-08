
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        txnid: {
            type: String,
            required: true,
            unique: true,
        },

        amount: {
            type: String,
            required: true,
        },

        productinfo: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Success", "Failed"],
            default: "Pending",
        },

        mihpayid: {
            type: String,
            default: null,
        },

        paymentMode: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
