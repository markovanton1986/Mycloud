import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthState } from "../store/authSlice";
import "./Register.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${API_URL}/register/`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        console.log("Регистрация прошла успешно!");
        navigate("/login");
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
