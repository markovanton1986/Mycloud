import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import "./Header.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    // Сброс состояния в Redux
    dispatch(logout());

    // Удаление токенов из cookies
    document.cookie = "access_token=; Max-Age=0; path=/;";
    document.cookie = "refresh_token=; Max-Age=0; path=/;";

    // Перенаправление на страницу входа
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