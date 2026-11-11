
const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const { 
    generatePaymentHash,
    verifyPaymentHash,
    verifyPaymentWithPayU,
} = require("../utils/payu");
const Payment = require("../models/Payment");
const validateRequest = require("../middleware/validateRequest");

const {
    paymentCallbackSchema,
} = require("../validators/paymentValidator");

router.post("/initiate", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const key = process.env.PAYU_KEY;
        const salt = process.env.PAYU_SALT;

        if (!key || !salt) {
            return res.status(500).json({
                success: false,
                message: "PayU credentials are not configured",
            });
        }

        const txnid = `VS${Date.now()}${crypto.randomBytes(3).toString("hex")}`;

        const amount = "499.00";
        const productinfo = "VitalSync Pro Test Plan";
        const firstname = user.name.trim().split(" ")[0];
        const email = user.email;

        const paymentDetails = {
            key,
            txnid,
            amount,
            productinfo,
            firstname,
            email,
        };

        const hash = generatePaymentHash(paymentDetails, salt);
        const callbackUrl = `${process.env.BACKEND_URL}/api/payments/callback`;
        await Payment.create({
            userId: user._id,
            txnid,
            amount,
            productinfo,
            status: "Pending",
        });

        return res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            paymentUrl: process.env.PAYU_BASE_URL + "/_payment",
            paymentDetails: {
                ...paymentDetails,
                hash,
                surl: callbackUrl,
                furl: callbackUrl,
            },
        });

    } catch (error) {
        console.error("PayU initiation error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to initiate payment",
        });
    }
});

router.post("/callback", validateRequest(paymentCallbackSchema), async (req, res) => {
    try {
        const response = req.body;

        const salt = process.env.PAYU_SALT;
        const key = process.env.PAYU_KEY;

        // 1. Validate callback hash and merchant key
        if (
            !salt ||
            !key ||
            response.key !== key ||
            !verifyPaymentHash(response, salt)
        ) {
           return res.status(400).json({
                success: false,
                message: "Invalid payment response",
            });
        }

        // 2. Find the original payment
        const payment = await Payment.findOne({
            txnid: response.txnid,
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        if(payment.status === "Success"){
            const frontendUrl =
                process.env.FRONTEND_URL || "http://localhost:5173";
            return res.redirect(
                `${frontendUrl}/payment-result?status=success&txnid=${payment.txnid}`
            );
        }

        // 3. Confirm amount matches our database record
        const callbackAmount = Math.round(Number(response.amount) * 100);
        const savedAmount = Math.round(Number(payment.amount) * 100);

        if (
            !Number.isFinite(callbackAmount) ||
            callbackAmount !== savedAmount
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment amount mismatch",
            })
        }

        // 4. Verify transaction directly with PayU
        const verification = await verifyPaymentWithPayU(response.txnid);

        const transaction =
            verification.transaction_details?.[response.txnid];

        if (
            verification.status !== 1 ||
            !transaction
        ) {
            return res.status(502).json({
                success: false,
                message: "Unable to verify payment with PayU",
            });
        }

        // 5. Reconcile the verified transaction
        const verifiedAmount = Math.round(Number(transaction.amt) * 100);

        if (
            verifiedAmount !== savedAmount ||
            transaction.txnid !== payment.txnid ||
            transaction.productinfo !== payment.productinfo
        ) {
            return res.status(400).json({
                success: false,
                message: "Verified transaction mismatch",
            })
        }

        const verifiedStatus = transaction.status?.toLowerCase();
        let updatedPayment = payment;
        if(verifiedStatus === "success"){
            updatedPayment = await Payment.findOneAndUpdate(
                {
                    _id: payment._id,
                    status:{$ne:"Success"},
                },
                {
                    $set: {
                        status: "Success",
                        mihpayid: transaction.mihpayid,
                        paymentMode: transaction.mode || null,
                    },
                },
                { new: true}
            );
        } else if (verifiedStatus === "failure"){
            updatedPayment = await Payment.findOneAndUpdate(
                {
                    _id: payment._id,
                    status: { $ne: "Success" },
                },
                {
                    $set: {
                        status: "Failed",
                    },
                },
                { new: true }
            );
        }
        if(!updatedPayment){
            updatedPayment = await Payment.findById(payment._id);
        }

        const frontendUrl =
            process.env.FRONTEND_URL || "http://localhost:5173";

        return res.redirect(
            `${frontendUrl}/payment-result?status=${updatedPayment.status.toLowerCase()}&txnid=${payment.txnid}`
        );

    } catch (error) {
        console.error("PayU callback error:", error);
        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
        });
    }
});

router.get("/:txnid/status", authMiddleware, async (req, res) => {
    try {
        const payment = await Payment.findOne({
            txnid: req.params.txnid,
            userId: req.user.userId,
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        return res.status(200).json({
            success: true,
            txnid: payment.txnid,
            amount: payment.amount,
            productinfo: payment.productinfo,
            status: payment.status,
            paymentMode: payment.paymentMode,
            createdAt: payment.createdAt,
        });

    } catch (error) {
        console.error("Payment status error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch payment status",
        });
    }
});

module.exports = router;
