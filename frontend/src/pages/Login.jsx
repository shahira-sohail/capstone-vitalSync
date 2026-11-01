import { useState } from "react";
import { loginUser } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginUser(formData);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <header className="login-header">
                <h2>VitalSync</h2>
                <p>Your healthcare, connected.</p>
            </header>

            <main className="login-container">
                <div className="login-card">

                    <h1>Welcome back</h1>

                    <p className="login-subtitle">
                        Sign in to your VitalSync account
                    </p>

                    {error && (
                        <p className="login-error">{error}</p>
                    )}

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="login-field">
                            <label htmlFor="email">
                                Email address:
                            </label>

                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="login-field">
                            <label htmlFor="password">
                                Password:
                            </label>

                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                    </form>

                    <div className="login-footer">
                        <span>Don't have an account</span>
                        <Link to="/register">Create account</Link>
                    </div>

                    <p className="forgot-password">
                        Forgot Password?
                    </p>

                </div>
            </main>

        </div>
    );
}

export default Login;