import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const logoutUser = async () => {
            try {
                await axios.post("http://localhost:8000/api/logout/", {}, {
                    withCredentials: true,
                });

                setLoading(false);

                navigate("/login");
            } catch (error) {
                setLoading(false);
                setError("Ошибка при выходе. Попробуйте еще раз.");
                console.error("Ошибка выхода:", error);
            }
        };

        logoutUser();
    }, [navigate]);

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