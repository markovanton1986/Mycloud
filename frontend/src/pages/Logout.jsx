import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "../store/authSlice";

const Logout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const logoutUser = async () => {
            try {
                // Отправляем запрос на выход с сервера
                await axios.post("http://localhost:8000/api/logout/", {}, { withCredentials: true });

                // Диспатчим logout в Redux
                dispatch(logout());

                // Удаляем данные пользователя (если они есть) из sessionStorage или localStorage
                sessionStorage.removeItem("user");
                localStorage.removeItem("user"); // Если это необходимо

                setLoading(false);

                // Перенаправление на страницу входа
                navigate("/login");
            } catch (error) {
                setLoading(false);
                setError("Ошибка при выходе. Попробуйте еще раз.");
                console.error("Ошибка выхода:", error);
            }
        };

        logoutUser();
    }, [navigate, dispatch]);

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            {loading ? (
                <h2>Выход...</h2>
            ) : error ? (
                <div>
                    <h2>{error}</h2>
                </div>
            ) : (
                <h2>Вы вышли из системы.</h2>
            )}
        </div>
    );
};

export default Logout;