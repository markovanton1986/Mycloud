import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthState } from "../store/authSlice";
import "./Register.css";

axios.defaults.withCredentials = true;

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Получение CSRF-токена из куков
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

  // Обработка изменений в форме
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const csrfToken = getCSRFToken();

      const response = await axios.post(
        "http://localhost:8000/api/register/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken, // Добавление CSRF-токена
          },
          withCredentials: true, // Включаем передачу куков с запросом
        }
      );

      if (response.status === 201) {
        console.log("Регистрация прошла успешно!");
        // Установка состояния авторизации в Redux
        dispatch(
          setAuthState({
            isAuthenticated: true,
            user: {
              username: formData.username,
              isStaff: false,
            },
          })
        );

        navigate("/UserPage");
      }
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      setErrors({
        server: error.response?.data?.detail || "Ошибка регистрации. Попробуйте позже.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Регистрация</h2>

      {/* Сообщения об ошибках */}
      {errors.server && <div className="message error">{errors.server}</div>}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="input-container">
          <input
            type="text"
            placeholder="Логин"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="input-container">
          <input
            type="text"
            placeholder="Полное имя"
            name="fullname"
            value={formData.fullname}
            onChange={handleInputChange}
          />
        </div>
        <div className="input-container">
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="input-container">
          <input
            type="password"
            placeholder="Пароль"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </form>
    </div>
  );
};

export default Register;