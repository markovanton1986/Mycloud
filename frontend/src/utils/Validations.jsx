import React, { useState } from 'react';
import { validateRegistrationForm } from './Validations';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const error = validateRegistrationForm(formData);
        if (error) {
            setErrors({ [error.field]: error.error });
        } else {
            console.log('Форма успешно отправлена:', formData);
            setErrors({});
            // Отправка данных на сервер
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Логин</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                />
                {errors.username && <p className="error">{errors.username}</p>}
            </div>

            <div>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                />
                {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div>
                <label htmlFor="password">Пароль</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                />
                {errors.password && <p className="error">{errors.password}</p>}
            </div>

            <button type="submit">Регистрация</button>
        </form>
    );
};

export default RegistrationForm;