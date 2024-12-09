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

    const validateForm = () => {
        if (!formData.username || !formData.password) {
            setError("Пожалуйста, заполните все поля.");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError("");
        try {
            const response = await axios.post(
                "http://localhost:8000/api/login/",
                formData,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            console.log("Успешный вход:", response.data);

            // Токены хранятся в cookies, так что нет нужды в sessionStorage
            setMessage("Вы успешно вошли в систему!");

            // Переход на соответствующую страницу
            if (response.data.is_staff) {
                console.log("Redirecting to admin...");
                navigate("/Admin");
            } else {
                console.log("Redirecting to UserPage...");
                navigate("/UserPage");
            }
        } catch (error) {
            console.error("Ошибка входа:", error);
            if (error.response) {
                setError(error.response.data.detail || "Ошибка входа, проверьте логин и пароль.");
            } else {
                setError("Ошибка сети. Попробуйте позже.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Вход</h2>

            {/* Отображение сообщений об успехе или ошибке */}
            {message && <div className="message success">{message}</div>}
            {error && <div className="message error">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
                <div>
                    <input
                        type="text"
                        placeholder="Логин"
                        value={formData.username}
                        onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                        }
                        className="input-field"
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
                        className="input-field"
                    />
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? "Загрузка..." : "Войти"}
                </button>
            </form>
        </div>
    );
};

export default Login;