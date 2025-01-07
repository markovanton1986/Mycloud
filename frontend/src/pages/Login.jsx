import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthState } from "../store/authSlice";
import "./Login.css";


axios.defaults.withCredentials = true;


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getCSRFToken = () => {
    const name = "csrftoken";
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

    if (!csrfToken) {
      console.error("CSRF токен не найден в куках!");
    }

    return csrfToken;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const csrfToken = getCSRFToken();

      const response = await axios.post(
        "http://localhost:8000/api/login/",
        { username, password },
        {
          headers: {
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        }
      );

      console.log("Успешный вход:", response.data);

      dispatch(
        setAuthState({
          isAuthenticated: true,
          user: {
            username: response.data.username,
            role: response.data.role,
          },
        })
      );

      if (response.data.role === "admin") {
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
        <div className="input-container">
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`input-field ${error ? "input-error" : ""}`}
            required
          />
        </div>
        <div className="input-container">
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`input-field ${error ? "input-error" : ""}`}
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