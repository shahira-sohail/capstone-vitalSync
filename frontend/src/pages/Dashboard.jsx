
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../services/authService";
import {
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
} from "../services/appointmentService";
import { initiatePayment } from "../services/paymentService";

const toLocalDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
    ).toISOString().slice(0,16);
};

function Dashboard() {
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [appointmentsError, setAppointmentsError] = useState("");
    const [formData, setFormData] = useState({
        patientName: "",
        doctorName: "",
        appointmentDate: "",
        reason: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [editingAppointmentId, setEditingAppointmentId] = useState(null);
    const [deletingAppointmentId, setDeletingAppointmentId] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);
const [paymentError, setPaymentError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Verify authentication first
                const data = await getDashboard();
                setDashboardData(data);

                // Fetch appointments separately
                try {
                    const appointmentData = await getAppointments();
                    setAppointments(appointmentData.appointments || []);
                } catch (error) {
                    setAppointmentsError(error.message);
                }

            } catch (error) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });

            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handlePayment = async () => {
        setPaymentLoading(true);
        setPaymentError("");
        try{
            const data = await initiatePayment();
            const form = document.createElement("form");
            form.method = "POST";
            form.action = data.paymentUrl;
            Object.entries(data.paymentDetails).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value;
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
        }catch(error){
            setPaymentError(error.message || "Unable to start payment.");
            setPaymentLoading(false);
        }
    };

    const handleEditAppointment = (appointment) => {
        setEditingAppointmentId(appointment._id);
        setFormData({
            patientName: appointment.patientName,
            doctorName: appointment.doctorName,
            appointmentDate: toLocalDateTime(
                appointment.appointmentDate
            ),
            reason: appointment.reason,
        });
        setFormError("");
        setSuccessMessage("");
        setDeleteError("");
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError("");
        setSuccessMessage("");

        try{
            const appointmentData = {
                ...formData,
                appointmentDate: new Date(
                    formData.appointmentDate
                ).toISOString(),
            };
            if(editingAppointmentId){
                const data = await updateAppointment(
                    editingAppointmentId,
                    appointmentData
                );
                setAppointments((prev) => 
                    prev.map((appointment) =>
                        appointment._id === editingAppointmentId
                            ? data.appointment
                            : appointment
                        )
                        .sort(
                            (a, b) =>
                                new Date(a.appointmentDate) -
                                new Date(b.appointmentDate)
                        )
                    );
                    setSuccessMessage("Appointment updated successfully!");
            } else {
                const data = await createAppointment(appointmentData);
                setAppointments((prev) =>
                    [...prev, data.appointment].sort(
                        (a, b) =>
                            new Date(a.appointmentDate) - 
                            new Date(b.appointmentDate)
                    )
                );
                setSuccessMessage("Appointment created successfully!");
            }

            setFormData({
                patientName: "",
                doctorName: "",
                appointmentDate: "",
                reason: "",
            });
            setEditingAppointmentId(null);
        } catch(error){
            setFormError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAppointment = async (id) => {
        const appointmentToDelete = appointments.find(
            (appointment) => appointment._id === id
        );
        if(!appointmentToDelete) return;
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this appointment?"
        );
        if(!confirmDelete) return;
        setSuccessMessage("");
        setDeleteError("");
        setAppointments((prev) =>
            prev.filter((appointment) => appointment._id !== id)
        );
        setDeletingAppointmentId(id);
    
        try{
            await deleteAppointment(id);
            setSuccessMessage("Appointment deleted successfully!");
        } catch(error){
            setAppointments((prev) => 
                [...prev, appointmentToDelete].sort(
                    (a,b) =>
                        new Date(a.appointmentDate) -
                        new Date(b.appointmentDate)
                )
            );
            setDeleteError(error.message || "Failed to delete appointment.");
        } finally{
            setDeletingAppointmentId(null);
        }
    };

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
        <div>
            <h1>VitalSync Dashboard</h1>

            <h2>Welcome, {user?.name}</h2>

            <p>{dashboardData?.message}</p>

            <button onClick={handleLogout}>
                Logout
            </button>

            <section>
                <h2>Upgrade to VitalSync Pro</h2>
                <p>Get access to VitalSync pro for ₹499.</p>
                {paymentError && (
                    <p role="alert">{paymentError}</p>
                )}
                <button
                    type="button"
                    onClick={handlePayment}
                    disabled={paymentLoading}
                >
                    {paymentLoading ? "Redirecting to PayU..." : "Upgrade to Pro - ₹499"}
                </button>
            </section>

            <hr />

            <section>
                <h2>Appointments</h2>

                <form onSubmit={handleCreateAppointment}>
                    <h3>{editingAppointmentId ? "Edit Appointment" : "Add New Appointment"}</h3>
                    <input
                        type="text"
                        placeholder="Patient Name"
                        value={formData.patientName}
                        onChange={(e) => 
                            setFormData({
                                ...formData,
                                patientName: e.target.value,
                            })
                        }
                        required
                    />

                    <input 
                        type="text"
                        placeholder="Doctor Name"
                        value={formData.doctorName}
                        onChange={(e) => 
                            setFormData({
                                ...formData,
                                doctorName: e.target.value,
                            })
                        }
                        required
                    />
                    <label>Appointment Date and Time</label>
                    <input
                        type="datetime-local"
                        value={formData.appointmentDate}
                        onChange={(e) => 
                            setFormData({
                                ...formData,
                                appointmentDate: e.target.value,
                            })
                        }
                        required
                    />
                    <textarea
                        placeholder="Reason for appointment"
                        value={formData.reason}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                reason: e.target.value,
                            })
                        }
                        required
                    />
                    {formError && <p role="alert">{formError}</p>}
                    {successMessage && <p role="status">{successMessage}</p>}
                    {deleteError && <p role="alert">{deleteError}</p>}
                    
                    <button type="submit" disabled={submitting}>
                        {submitting
                            ? "Saving..."
                            : editingAppointmentId
                                ? "Update Appointment"
                                : "Add Appointment"}
                    </button>

                    {editingAppointmentId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingAppointmentId(null);
                                setFormData({
                                    patientName: "",
                                    doctorName: "",
                                    appointmentDate: "",
                                    reason: "",
                                });
                                setFormError("");
                                setSuccessMessage("");
                            }}
                        >
                            Cancel Edit
                        </button>
                    )}
                </form>

                {appointmentsError && (
                    <p role="alert">{appointmentsError}</p>
                )}

                {!appointmentsError && appointments.length === 0 && (
                    <p>No appointments found.</p>
                )}

                {appointments.length > 0 && (
                    <div>
                        {appointments.map((appointment) => (
                            <article key={appointment._id}>
                                <h3>{appointment.patientName}</h3>

                                <p>Doctor: {appointment.doctorName}</p>

                                <p>
                                    Date:{" "}
                                    {new Date(
                                        appointment.appointmentDate
                                    ).toLocaleString()}
                                </p>

                                <p>Reason: {appointment.reason}</p>

                                <p>Status: {appointment.status}</p>
                                <button
                                    type="button"
                                    onClick={() => handleEditAppointment(appointment)}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteAppointment(appointment._id)}
                                    disabled={deletingAppointmentId === appointment._id}
                                >
                                    {deletingAppointmentId === appointment._id
                                        ? "Deleting..."
                                        : "Delete"}
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Dashboard;
