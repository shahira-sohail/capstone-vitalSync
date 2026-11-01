import { useState } from "react";
import { registerUser } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
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
            await registerUser(formData);
            navigate("/login");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <header className="register-header">
                <h2>VitalSync</h2>
                <p>Your healthcare, connected.</p>
            </header>

            <main className="register-container">
                <div className="register-card">

                    <h1>Create account</h1>

                    <p className="register-subtitle">
                        Register for your VitalSync account
                    </p>

                    {error && (
                        <p className="register-error">{error}</p>
                    )}

                    <form
                        className="register-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="register-field">
                            <label htmlFor="name">Full name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="email">Email address:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="password">Password:</label>
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
                            {loading ? "Creating account..." : "Create account"}
                        </button>

                    </form>

                    <p className="register-footer">
                        Already have an account?{" "}
                        <Link to="/login">Sign in</Link>
                    </p>

                </div>
            </main>

        </div>
    );
}

export default Register;