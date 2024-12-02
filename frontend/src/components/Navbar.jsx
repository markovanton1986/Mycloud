import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar() {
    const isAuthenticated = localStorage.getItem('token');
    return (
        <nav>
            <ul>
                <li><Link to="/">Главная</Link></li>
                {isAuthenticated ? (
                    <>
                        <li><Link to="/dashboard">Панель</Link></li>
                        <li><Link to="/files">Файлы</Link></li>
                        <li>
                            <button onClick={() => {
                                localStorage.removeItem('token');
                                window.location.href = '/';
                            }}>
                                Выйти
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Вход</Link></li>
                        <li><Link to="/register">Регистрация</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default NavBar;