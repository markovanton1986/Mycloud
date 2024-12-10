import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/login/",
        { username, password },
        { withCredentials: true }
      );

      console.log("Успешный вход:", response.data);

      setMessage("Вы успешно вошли в систему!");

      if (response.data.is_staff) {
        console.log("Перенаправление на Admin");
        navigate("/Admin");
      } else {
        console.log("Перенаправление на UserPage");
        navigate("/UserPage");
      }
    } catch (error) {
      console.error("Ошибка входа:", error);

      setError(
        error.response?.data?.error || "Ошибка входа, проверьте логин и пароль."
      );
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
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