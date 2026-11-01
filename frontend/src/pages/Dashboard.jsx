import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard } from "../services/authService";

function Dashboard() {
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const data = await getDashboard();
                setDashboardData(data);
            } catch (error) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (loading) {
        return <p>Verifying authentication...</p>;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div>
            <h1>VitalSync Dashboard</h1>

            <h2>Welcome, {user?.name}</h2>

            <p>{dashboardData?.message}</p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}

export default Dashboard;