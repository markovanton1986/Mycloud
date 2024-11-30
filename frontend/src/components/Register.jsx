import React, { useState } from "react";
import axios from "axios";

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

        if (!/^[a-zA-Z][a-zA-Z0-9]{3,19}$/.test(formData.username)) {
            newErrors.username =
                "Логин - только латинские буквы и цифры, первый символ - буква, длина от 4 до 20 символов.";
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Введите корректный email.";
        }
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
        if (!validateForm()) return;

        try {
            await axios.post("http://localhost:8000/api/register/", formData);
            setSuccess(true);
        } catch (error) {
            setErrors({ server: "Ошибка сервера. Попробуйте позже." });
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Регистрация</h2>
            {success ? (
                <p>Вы успешно зарегистрировались! Перейдите на <a href="/login">страницу входа</a>.</p>
            ) : (
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
                        <div style={{ color: "red" }}>{errors.username}</div>
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
                        <div style={{ color: "red" }}>{errors.email}</div>
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
                        <div style={{ color: "red" }}>{errors.password}</div>
                    </div>
                    <button type="submit">Зарегистрироваться</button>
                    <div style={{ color: "red" }}>{errors.server}</div>
                </form>
            )}
        </div>
    );
};

export default Register;