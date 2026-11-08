
const API_URL = import.meta.env.VITE_API_URL;

// Get JWT token for authenticated requests
const getAuthHeaders = (includeContentType = false) => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Authentication token not found. Please login.");
    }

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};

// Handle API responses
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

// CREATE appointment
export const createAppointment = async (appointmentData) => {
    const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(appointmentData),
    });

    return handleResponse(response);
};

// READ all appointments
export const getAppointments = async () => {
    const response = await fetch(`${API_URL}/api/appointments`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    return handleResponse(response);
};

// READ single appointment
export const getAppointmentById = async (id) => {
    const response = await fetch(
        `${API_URL}/api/appointments/${encodeURIComponent(id)}`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
};

// UPDATE appointment
export const updateAppointment = async (id, updates) => {
    const response = await fetch(
        `${API_URL}/api/appointments/${encodeURIComponent(id)}`,
        {
            method: "PUT",
            headers: getAuthHeaders(true),
            body: JSON.stringify(updates),
        }
    );

    return handleResponse(response);
};

// DELETE appointment
export const deleteAppointment = async (id) => {
    const response = await fetch(
        `${API_URL}/api/appointments/${encodeURIComponent(id)}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    return handleResponse(response);
};
