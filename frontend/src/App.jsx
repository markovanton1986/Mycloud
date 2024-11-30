import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import FileList from './components/Home';

const App = () => {
  return (
    <Router>
      <div>
        {/* Навигация */}
        <nav style={styles.nav}>
          <Link to="/register" style={styles.link}>Register</Link>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/files" style={styles.link}>File List</Link>
        </nav>

        {/* Основной контент */}
        <main style={styles.main}>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/files" element={<FileList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};


const styles = {
  nav: {
    backgroundColor: '#333',
    padding: '1rem',
    display: 'flex',
    gap: '1rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.2rem',
  },
  main: {
    padding: '2rem',
  },
};

export default App;
