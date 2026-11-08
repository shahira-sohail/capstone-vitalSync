
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPaymentStatus } from "../services/paymentService";

function PaymentResult() {
    const [searchParams] = useSearchParams();

    const txnid = searchParams.get("txnid");

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            if (!txnid) {
                setError("Transaction ID is missing.");
                setLoading(false);
                return;
            }

            try {
                const data = await getPaymentStatus(txnid);
                setPayment(data);
            } catch (err) {
                setError(err.message || "Unable to verify payment.");
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentStatus();
    }, [txnid]);

    if (loading) {
        return <p>Verifying payment...</p>;
    }

    if (error) {
        return (
            <div>
                <h2>Unable to verify payment</h2>
                <p role="alert">{error}</p>
                <Link to="/dashboard">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div>
            <h1>Payment Result</h1>

            <h2>
                {payment.status === "Success"
                    ? "Payment Successful!"
                    : payment.status === "Failed"
                        ? "Payment Failed"
                        : "Payment Pending"}
            </h2>

            <p>Transaction ID: {payment.txnid}</p>
            <p>Amount: ₹{payment.amount}</p>
            <p>Status: {payment.status}</p>

            <Link to="/dashboard">Back to Dashboard</Link>
        </div>
    );
}

export default PaymentResult;
