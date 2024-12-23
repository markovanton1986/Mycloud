import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthState } from "../store/authSlice";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Получение CSRF токена из cookies
  const getCSRFToken = () => {
    const cookies = document.cookie.split("; ");
    const csrfCookie = cookies.find((cookie) => cookie.startsWith("csrftoken="));
    return csrfCookie ? csrfCookie.split("=")[1] : null;
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const csrfToken = getCSRFToken();

    try {
      const response = await axios.post(
        "http://localhost:8000/api/login/",
        { username, password },
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }
      );

      console.log("Успешный вход:", response.data);

      // Установка состояния авторизации в Redux
      dispatch(
        setAuthState({
          isAuthenticated: true,
          user: {
            username: response.data.username,
            isStaff: response.data.is_staff,
          },
        })
      );

      // Перенаправление на соответствующую страницу
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