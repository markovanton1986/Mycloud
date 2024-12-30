import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './NavBar.css';

function NavBar() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = Cookies.get('access_token');
        const role = Cookies.get('userRole');
        setIsAuthenticated(!!token);
        setUserRole(role);
    }, []);

    const handleLogout = () => {
        Cookies.remove('access_token');
        Cookies.remove('userRole');
        setIsAuthenticated(false);
        setUserRole(null);
        navigate('/login');
    };

    return (
        <nav>
            <ul>
                <li><Link to="/">Главная</Link></li>
                {isAuthenticated ? (
                    <>
                        <li><Link to="/dashboard">Панель</Link></li>
                        <li><Link to="/files">Файлы</Link></li>
                        {/* Проверка на роль пользователя */}
                        {userRole === 'Admin' ? (
                            <li><Link to="/Admin">Управление пользователями</Link></li>
                        ) : (
                            <li><Link to="/UserPage">Мои файлы</Link></li>
                        )}
                        <li>
                            <button onClick={handleLogout}>
                                Выйти
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        {/* Если не авторизован, то показываем кнопки входа и регистрации */}
                        {/* <li><Link to="/login">Войти</Link></li>
                        <li><Link to="/register">Регистрация</Link></li> */}
                    </>
                )}
            </ul>
        </nav>
    );
}

export default NavBar;