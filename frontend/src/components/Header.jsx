import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
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
        {/* <nav className="nav">
          <ul className="nav-links">
            <li><Link to="/dashboard" className="nav-link">Приборная панель</Link></li>
            <li><Link to="/files" className="nav-link">Мои файлы</Link></li>
            <li><Link to="/profile" className="nav-link">Профиль</Link></li>
          </ul>
        </nav> */}
        <div className="auth-buttons">
          <Link to="/login" className="auth-button">Login</Link>
          <Link to="/register" className="auth-button">Register</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;