import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    useEffect(() => {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            dispatch(setAuthState({ isAuthenticated: true, user: parsedUser }));
        } else {
            dispatch(setAuthState({ isAuthenticated: false, user: null }));
        }
    }, [dispatch]);

    return (
        <Router>
            <div className="app">
                <Header />
                <Navbar />

                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/files/:userId" element={<FileStorage />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/admin"
                            element={isAuthenticated ? <Admin /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/UserPage"
                            element={isAuthenticated ? <UserPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/files"
                            element={isAuthenticated ? <FileStorage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/upload"
                            element={isAuthenticated ? <LoadingFile /> : <Navigate to="/login" />}
                        />
                        <Route path="/logout" element={<Logout />} />
                        <Route path="*" element={<Navigate to="/files" />} />
                    </Routes>
                </main>

                <Footer />
            </div>
        </Router>
    );
};

export default App;