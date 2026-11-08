
const API_URL = import.meta.env.VITE_API_URL;

export const initiatePayment = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/api/payments/initiate`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Payment initiation failed");
    }

    return data;
};
export const getPaymentStatus = async (txnid) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/api/payments/${txnid}/status`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Unable to fetch payment status");
    }

    return data;
};


