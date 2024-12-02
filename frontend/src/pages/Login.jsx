import React, { useState } from "react";
import axios from "axios";
import "./Login.css";

const Login = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8000/api/token/", formData);
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            setError("");
        
            if (response.data.is_admin) {
                window.location.href = "/admin";
            } else {
                window.location.href = "/dashboard";
            }
        } catch (error) {
            setError("Неправильный логин или пароль.");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Вход</h2>
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
                <button type="submit">Войти</button>
                {error && <div style={{ color: "red" }}>{error}</div>}
            </form>
        </div>
    );
};

export default Login;