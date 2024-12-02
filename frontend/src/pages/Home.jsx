import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
    return (
        <div className="home-container">
            <div style={{ textAlign: "center", padding: "20px" }}>
                <h1>Добро пожаловать в облачное хранилище</h1>
                <p>
                    Это приложение позволяет безопасно хранить и управлять вашими файлами. 
                    Для доступа к функционалу, пожалуйста, зарегистрируйтесь или войдите.
                </p>
                <div style={{ marginTop: "20px" }}>
                    <Link to="/register" style={{ marginRight: "10px" }}>
                        <button>Регистрация</button>
                    </Link>
                    <Link to="/login">
                        <button>Войти</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;