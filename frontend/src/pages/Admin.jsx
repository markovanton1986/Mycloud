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
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isVisible: false, userId: null });

  // Уведомления
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Обёртка для защищённых запросов с использованием withCredentials
  const authorizedRequest = async (config) => {
    try {
      const response = await axios({
        ...config,
        withCredentials: true, // Это гарантирует, что куки будут автоматически отправляться с запросами
      });
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Необходима аутентификация. Перенаправляем на страницу входа...");
        window.location.href = "/login"; // Перенаправление на страницу входа
      }
      throw error;
    }
  };

  // Регистрация пользователя
  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, password, email, fullname } = formData;

    if (!username || !password || !email || !fullname) {
      setError('Все поля обязательны для заполнения!');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/register/', {
        username,
        password,
        email,
        fullname: fullname,
      });
      showNotification('Пользователь успешно зарегистрирован!', 'success');
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
  const handleDeleteUser = async () => {
    if (!confirmDelete.userId) return;

    try {
      await authorizedRequest({
        method: "DELETE",
        url: `http://localhost:8000/api/admin/users/${confirmDelete.userId}/delete/`,
      });
      setUsers(users.filter(user => user.id !== confirmDelete.userId));
      showNotification('Пользователь успешно удалён.', 'success');
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      showNotification('Ошибка при удалении пользователя.', 'error');
    } finally {
      setConfirmDelete({ isVisible: false, userId: null });
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
      // Куки с токенами автоматически устанавливаются через сервер (HttpOnly)
      setIsAuthenticated(true);
      showNotification('Вы успешно вошли в систему!', 'success');
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
    showNotification('Вы успешно вышли из системы.', 'success');
  };

  // Загружаем пользователей при монтировании компонента, если пользователь аутентифицирован
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div>
        <h2>Вход в систему</h2>
        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
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

      {/* Уведомления */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

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
          <label>Полное имя:</label>
          <input
            type="text"
            value={formData.fullname}
            onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
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
          <label>Пароль:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  <button onClick={() => setConfirmDelete({ isVisible: true, userId: user.id })}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Модальное окно подтверждения удаления */}
      {confirmDelete.isVisible && (
        <div className="modal">
          <div className="modal-content">
            <p>Вы уверены, что хотите удалить этого пользователя?</p>
            <button onClick={handleDeleteUser}>Да</button>
            <button onClick={() => setConfirmDelete({ isVisible: false, userId: null })}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;