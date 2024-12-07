import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();




    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Submitting form with data:", formData);
    
        try {
            const response = await axios.post("http://localhost:8000/api/token/", formData, {
                headers: { "Content-Type": "application/json" },
            });
    
            console.log("Tokens received:", response.data.access, response.data.refresh);
    
            if (response.data.access && response.data.refresh) {
                localStorage.setItem("token", response.data.access);
    
                setError("");
                setMessage("Вы успешно вошли в систему!");
    
                if (response.data.is_admin) {
                    console.log("Redirecting to admin...");
                    navigate("/admin");
                } else {
                    console.log("Redirecting to UserPage...");
                    navigate("/UserPage");
                }
            } else {
                console.error("Tokens are missing in the response.");
                setError("Токены не получены. Проверьте данные.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Неправильный логин или пароль.");
        } finally {
            setLoading(false);
        }
    };




    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Вход</h2>

            {/* Display success or error message */}
            {message && <div style={{ color: "green" }}>{message}</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Логин"
                        value={formData.username}
                        onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                        }
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? "Загрузка..." : "Войти"}
                </button>
            </form>
        </div>
    );
};

export default Login;