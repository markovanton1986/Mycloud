import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const logoutUser = async () => {
            try {
                await axios.post("http://localhost:8000/api/logout/", {}, {
                    withCredentials: true,  // Отправляем cookies
                });
                navigate("/login");  // Перенаправление на страницу входа
            } catch (error) {
                console.error("Ошибка выхода:", error);
            }
        };

        logoutUser();
    }, [navigate]);

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Выход...</h2>
        </div>
    );
};

export default Logout;