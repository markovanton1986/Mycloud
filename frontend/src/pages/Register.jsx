import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { validateRegistrationForm } from "./Validations";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getCSRFToken = () => {
    const cookies = document.cookie.split('; ');
    const csrfCookie = cookies.find(cookie => cookie.startsWith('csrftoken='));
    return csrfCookie ? csrfCookie.split('=')[1] : null;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const csrfToken = getCSRFToken();  // Получаем CSRF токен
  
    try {
      const response = await axios.post(
        "http://localhost:8000/api/register/",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,  // Отправляем CSRF токен в заголовке
          },
          withCredentials: true,  // Убедитесь, что с запросом отправляются cookies
        }
      );
      console.log("Response from server:", response);
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        console.log("Регистрация прошла успешно, перенаправление на вход...");
        setTimeout(() => {
          navigate("/login");
        }, 10000);  // Перенаправление через 3 секунды
      } else {
        setErrors({ server: "Неожиданный ответ от сервера." });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setErrors({ server: "Неверный формат данных." });
        } else {
          setErrors({ server: error.response.data.detail || "Ошибка сервера. Попробуйте позже." });
        }
      } else {
        setErrors({ server: "Ошибка сети. Попробуйте позже." });
      }
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Регистрация</h2>
      {success ? (
        <p className="register-success">
          Вы успешно зарегистрировались! Перейдите на{" "}
          <a href="/login" className="register-link">страницу входа</a>.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="register-form">
          <div>
            <input
              type="text"
              placeholder="Логин"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Полное имя"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Пароль"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          <button type="submit">Зарегистрироваться</button>
          {errors.server && <div className="error-message">{errors.server}</div>}
        </form>
      )}
    </div>
  );
};

export default Register;