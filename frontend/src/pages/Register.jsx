import React, { useState } from "react";
import axios from "axios";
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

    const validateForm = () => {
        const newErrors = {};

        // Валидация логина
        if (!/^[a-zA-Z][a-zA-Z0-9]{3,19}$/.test(formData.username)) {
            newErrors.username = "Логин - только латинские буквы и цифры, первый символ - буква, длина от 4 до 20 символов.";
        }

        // Валидация email
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Введите корректный email.";
        }

        // Валидация пароля
        if (
            !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(formData.password)
        ) {
            newErrors.password =
                "Пароль - не менее 6 символов: как минимум одна заглавная буква, одна цифра и один специальный символ.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверка на валидность формы
        if (!validateForm()) return;

        try {
            // Отправка данных на сервер
            await axios.post("http://localhost:8000/api/register/", formData);
            setSuccess(true);
        } catch (error) {
            // Обработка ошибок с сервера
            if (error.response && error.response.data) {
                setErrors({ server: error.response.data.detail || "Ошибка сервера. Попробуйте позже." });
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
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                        />
                        <div className="error-message">{errors.username}</div>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Полное имя"
                            value={formData.fullName}
                            onChange={(e) =>
                                setFormData({ ...formData, fullName: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />
                        <div className="error-message">{errors.email}</div>
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
                        <div className="error-message">{errors.password}</div>
                    </div>
                    <button type="submit">Зарегистрироваться</button>
                    <div className="error-message">{errors.server}</div>
                </form>
            )}
        </div>
    );
};

export default Register;