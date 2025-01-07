import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import Cookies from "js-cookie";
import "./Header.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const userRole = user?.role;

  const handleLogout = () => {
    dispatch(logout());

    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("userRole");

    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          {/* Логотип с текстом */}
          <Link to="/" className="logo-link">
            <img src="/img/logo.png" alt="Mycloud Logo" className="logo-img" />
            <span className="logo-text">Mycloud</span>
          </Link>
        </div>

        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <span className="welcome-text">Добро пожаловать, {user.username}!</span>

              {/* Условие для отображения кнопки в зависимости от роли */}
              {userRole === "admin" ? (
                <Link to="/Admin" className="auth-button">
                  Управление пользователями
                </Link>
              ) : (
                <Link to="/UserPage" className="auth-button">
                  Мои файлы
                </Link>
              )}

              {/* Кнопка для выхода */}
              <button onClick={handleLogout} className="auth-button">
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-button">
                Войти
              </Link>
              <Link to="/register" className="auth-button">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;