import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthState } from './store/authSlice';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Header from './components/Header';
import LoadingFile from './components/LoadingFile';
import FileStorage from './components/FileStorage';

import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Admin from './pages/Admin';
import UserPage from './pages/UserPage';
import Logout from './pages/Logout';

import './App.css';

const App = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const isAuthenticated = document.cookie.includes('sessionid');
        if (isAuthenticated) {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                dispatch(setAuthState({ isAuthenticated: true, user }));
            }
        }
    }, [dispatch]);

    return (
        <Router>
            <div className="app">
                {/* Шапка */}
                <Header />

                {/* Навигация */}
                <Navbar />

                {/* Основной контент */}
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/UserPage" element={<UserPage />} />
                        <Route path="/files" element={<FileStorage />} />
                        <Route path="/upload" element={<LoadingFile />} />
                        <Route path="/logout" element={<Logout />} />

                        {/* Редирект на страницу файлов, если путь не найден */}
                        <Route path="*" element={<Navigate to="/files" />} />
                    </Routes>
                </main>

                {/* Подвал */}
                <Footer />
            </div>
        </Router>
    );
};

export default App;