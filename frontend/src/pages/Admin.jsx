import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

function Admin() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullname: '',
  });
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Получение токена из cookies
  const getTokenFromCookies = () => {
    const cookies = document.cookie.split('; ');
    const accessToken = cookies.find(cookie => cookie.startsWith('access_token='));
    return accessToken ? accessToken.split('=')[1] : null;
  };

  // Обновление токена
  const refreshAccessToken = async () => {
    const refreshToken = getTokenFromCookies();
    if (!refreshToken) {
      console.error("Refresh token отсутствует");
      return null;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: refreshToken
      }, { withCredentials: true });

      const newAccessToken = response.data.access;
      document.cookie = `access_token=${newAccessToken};path=/;`;
      return newAccessToken;
    } catch (error) {
      console.error("Ошибка обновления токена:", error);
      return null;
    }
  };

  // Обёртка для защищённых запросов
  const authorizedRequest = async (config) => {
    const token = getTokenFromCookies();
    if (!token) {
      console.error("Токен отсутствует. Перенаправление на страницу входа...");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return axios({
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
            withCredentials: true,
          });
        }
      }
      throw error;
    }
  };

  // Регистрация пользователя с валидацией
  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, password, email, fullname } = formData;

    if (!username || !password || !email || !fullname) {
      setError('Все поля обязательны для заполнения!');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/register/', {
        username,
        password,
        email,
        fullname: fullname,
      });
      alert('Пользователь успешно зарегистрирован!');
      setFormData({ username: '', password: '', email: '', fullname: '' });
    } catch (err) {
      setError('Ошибка при регистрации пользователя');
      console.error('Ошибка регистрации:', err);
    } finally {
      setLoading(false);
    }
  };

  // Получение списка пользователей
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authorizedRequest({
        method: "GET",
        url: "http://localhost:8000/api/admin/users/",
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error("Ошибка получения пользователей:", error);
      setError("Ошибка при загрузке пользователей");
    } finally {
      setLoading(false);
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      try {
        const token = getTokenFromCookies();
        if (!token) {
          alert("Ошибка: не найден токен аутентификации");
          return;
        }
  
        const response = await axios.delete(`http://localhost:8000/api/admin/users/${userId}/delete/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
  
        if (response.status === 204) {
          setUsers(users.filter(user => user.id !== userId));
          alert("Пользователь успешно удалён.");
        }
      } catch (error) {
        console.error("Ошибка удаления пользователя:", error);
        alert("Ошибка: не удалось удалить пользователя.");
      }
    }
  };

  // Аутентификация (вход)
  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        username,
        password,
      });
      document.cookie = `access_token=${response.data.access};path=/;`;
      document.cookie = `refresh_token=${response.data.refresh};path=/;`;
      setIsAuthenticated(true);
      alert('Вы успешно вошли в систему!');
    } catch (err) {
      setError('Ошибка аутентификации');
      console.error('Ошибка входа:', err);
    } finally {
      setLoading(false);
    }
  };

  // Выход пользователя
  const handleLogout = () => {
    document.cookie = 'access_token=; Max-Age=0; path=/;';
    document.cookie = 'refresh_token=; Max-Age=0; path=/;';
    setIsAuthenticated(false);
    alert('Вы успешно вышли из системы.');
  };

  // Загружаем пользователей при монтировании компонента, если пользователь аутентифицирован
  useEffect(() => {
    if (getTokenFromCookies()) {
      fetchUsers();
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div>
        <h2>Вход в систему</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label>Имя пользователя:</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <label>Пароль:</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2>Управление пользователями</h2>
      <button onClick={handleLogout}>Выход</button>
      
      <h3>Регистрация нового пользователя</h3>
      <form onSubmit={handleRegister}>
        <div>
          <label>Имя пользователя:</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label>Полное имя:</label>
          <input
            type="text"
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Регистрация..." : "Зарегистрировать"}
        </button>
      </form>

      <h3>Список пользователей</h3>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Имя пользователя</th>
              <th>Полное имя</th>
              <th>Email</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.fullname}</td>
                <td>{user.email}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Admin;