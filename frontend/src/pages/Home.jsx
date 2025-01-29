import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const userRole = user?.role;

    return (
        <div className="home-container">
            <div>
                <h1>Добро пожаловать в облачное хранилище</h1>
                {isAuthenticated ? (
                    <>
                        <p>
                            Вы вошли в систему как {user.username}. Для дальнейшей работы в приложении, перейдите в свой раздел.
                        </p>
                        <div>
                            {/* Условие отображения ссылок по роли */}
                            {userRole === "admin" ? (
                                <Link to="/admin">
                                    <button>Управление пользователями</button>
                                </Link>
                            ) : (
                                <Link to="/UserPage">
                                    <button>Мои файлы</button>
                                </Link>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <p>
                            Это приложение позволяет безопасно хранить и управлять вашими
                            файлами. Для доступа к функционалу, пожалуйста, зарегистрируйтесь
                            или войдите.
                        </p>
                        <div>
                            <Link to="/register">
                                <button>Регистрация</button>
                            </Link>
                            <Link to="/login">
                                <button>Войти</button>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;
