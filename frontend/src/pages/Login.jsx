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
        setError(""); // Сброс ошибки

        try {
            const response = await axios.post(
                "http://localhost:8000/api/login/",
                formData,
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,  // Отправка с cookies
                }
            );

            console.log("Успешный вход:", response.data);

            // Токены хранятся в cookies, так что нет нужды в sessionStorage
            setMessage("Вы успешно вошли в систему!");

            // Переход на соответствующую страницу
            if (response.data.is_staff) {
                console.log("Redirecting to admin...");
                navigate("/admin");
            } else {
                console.log("Redirecting to UserPage...");
                navigate("/UserPage");
            }
        } catch (error) {
            console.error("Ошибка входа:", error);
            setError("Ошибка входа, проверьте логин и пароль.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Вход</h2>

            {/* Отображение сообщений об успехе или ошибке */}
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